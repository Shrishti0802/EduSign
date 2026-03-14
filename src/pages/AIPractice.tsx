import { useEffect, useRef, useState, useCallback } from 'react';
import { FilesetResolver, HandLandmarker } from '@mediapipe/tasks-vision';
import { Camera, AlertCircle, CheckCircle2, Circle, Trash2 } from 'lucide-react';
import { knnClassifier, stablePredict, resetStableBuffer, type Landmark } from '../lib/knnClassifier';
import { useGameState } from '../lib/gameState';
import XPBar from '../components/XPBar';
import { mockDictionaryData } from '../lib/mockData';

// ── All 10 signs ──────────────────────────────────────────────────────────────
const TARGETS = [
  // ── Original 5 ──
  {
    word: 'Hello',
    desc: 'Open palm facing outward. All 5 fingers fully extended and spread wide apart.',
    tip: 'Spread your fingers as far apart as possible — like a starfish.',
  },
  {
    word: 'Thank You',
    desc: 'Curved hand, fingers bent at middle joints. Start near chin and move outward.',
    tip: 'Fingers are curved/bent — not fully straight, not fully closed.',
  },
  {
    word: 'Please',
    desc: 'Flat open hand pressed against your chest. Fingers extended and held together.',
    tip: 'Fingers together (unlike Hello where they are spread). Hand flat on chest.',
  },
  {
    word: 'Yes',
    desc: 'Tight closed fist with all fingers and thumb curled in. Bob wrist slightly.',
    tip: 'Thumb must be tucked IN — if thumb is out, it looks like Please.',
  },
  {
    word: 'No',
    desc: 'Index and middle fingers extended (peace sign). Ring and pinky curled down.',
    tip: 'Only TWO fingers up. Make sure ring and pinky are fully curled.',
  },

  // ── New 5 ──
  {
    word: 'Water',
    desc: 'Form a "W" shape — extend index, middle, and ring fingers, curl pinky and thumb. Tap fingers to your chin twice.',
    tip: 'Three middle fingers up, pinky and thumb down. Touch chin lightly.',
  },
  {
    word: 'Food',
    desc: 'Bring all fingertips together to meet your thumb (like a pinch), then tap to your lips twice.',
    tip: 'Pinch all 5 fingertips together — like picking up tiny food and bringing it to your mouth.',
  },
  {
    word: 'Help',
    desc: 'Make a thumbs-up with one hand, place it on the flat palm of your other hand, and lift both hands upward.',
    tip: 'Thumbs-up sitting on a flat palm — then lift. For static training, just hold the thumbs-up on flat palm.',
  },
  {
    word: 'Friend',
    desc: 'Hook your index fingers together, one on top then swap — like two people linking arms.',
    tip: 'Curl both index fingers and hook them together. For training, hold the hooked position still.',
  },
  {
    word: 'Family',
    desc: 'Both hands form an "F" shape (index finger and thumb touching, other fingers up), then move in a circle.',
    tip: 'Make an "F" with both hands — pinch index to thumb, other 3 fingers extended. Hold the F shape for training.',
  },
];

const MIN_SAMPLES_PER_SIGN = 30;

const AIPractice = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const handLandmarkerRef = useRef<HandLandmarker | null>(null);
  const animationRef = useRef<number>(0);
  const successLockRef = useRef(false);
  const targetIndexRef = useRef(0);
  const isRecordingRef = useRef(false);
  const recordingLabelRef = useRef('');

  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [streamActive, setStreamActive] = useState(false);
  const [targetIndex, setTargetIndex] = useState(0);
  const [completedAll, setCompletedAll] = useState(false);
  const [success, setSuccess] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [sampleCounts, setSampleCounts] = useState<Record<string, number>>(knnClassifier.getCountsByLabel());
  const [isRecording, setIsRecording] = useState(false);
  const [activeLabel, setActiveLabel] = useState('');
  // Which group is shown in training panel: 'original' | 'new'
  const [trainingGroup, setTrainingGroup] = useState<'original' | 'new'>('original');

  const gameState = useGameState();
  const currentTarget = TARGETS[targetIndex];

  useEffect(() => { targetIndexRef.current = targetIndex; }, [targetIndex]);

  const refreshCounts = useCallback(() => {
    setSampleCounts({ ...knnClassifier.getCountsByLabel() });
  }, []);

  // ── MediaPipe init ──────────────────────────────────────────────────────────
  useEffect(() => {
    (async () => {
      try {
        const vision = await FilesetResolver.forVisionTasks(
          'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
        );
        const landmarker = await HandLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task',
            delegate: 'GPU',
          },
          runningMode: 'VIDEO',
          numHands: 1,
          minHandDetectionConfidence: 0.6,
          minHandPresenceConfidence: 0.6,
          minTrackingConfidence: 0.6,
        });
        handLandmarkerRef.current = landmarker;
        setIsModelLoaded(true);
      } catch (err) {
        console.error('MediaPipe init failed', err);
        setCameraError('Failed to load AI model. Please check your network connection.');
      }
    })();
    return () => {
      handLandmarkerRef.current?.close();
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, []);

  // ── Camera ──────────────────────────────────────────────────────────────────
  const startCamera = async () => {
    if (!videoRef.current) return;
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 1280, height: 720 } });
      videoRef.current.srcObject = stream;
      setStreamActive(true);
      videoRef.current.onloadedmetadata = () => {
        videoRef.current?.play();
        predictWebcam();
      };
    } catch (err) {
      console.error('Webcam error', err);
      setCameraError('Could not access webcam. Please grant camera permissions.');
    }
  };

  // ── Detection loop ──────────────────────────────────────────────────────────
  const predictWebcam = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const lm = handLandmarkerRef.current;
    if (!video || !canvas || !lm) return;

    const ctx = canvas.getContext('2d');
    if (ctx && video.readyState >= 2) {
      if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
      }

      const results = lm.detectForVideo(video, performance.now());
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (results.landmarks?.length > 0) {
        const landmarks = results.landmarks[0];
        drawLandmarks(ctx, landmarks, canvas.width, canvas.height);

        if (isRecordingRef.current && recordingLabelRef.current) {
          knnClassifier.addSample(landmarks as Landmark[], recordingLabelRef.current);
          if (Math.random() < 0.1) setSampleCounts({ ...knnClassifier.getCountsByLabel() });
        } else if (!successLockRef.current && knnClassifier.isReady()) {
          const sign = stablePredict(knnClassifier, landmarks as Landmark[]);
          if (sign) {
            const target = TARGETS[targetIndexRef.current].word;
            if (sign.toLowerCase() === target.toLowerCase()) handleSuccess(sign);
          }
        }
      }
    }
    animationRef.current = requestAnimationFrame(predictWebcam);
  };

  // ── Success ─────────────────────────────────────────────────────────────────
  const handleSuccess = (sign: string) => {
    successLockRef.current = true;
    resetStableBuffer();
    setSuccess(true);
    setSuccessMsg(`Perfect! "${sign}" ✓`);
    gameState.addXP(30);
    setTimeout(() => {
      setSuccess(false);
      successLockRef.current = false;
      const next = targetIndexRef.current + 1;
      if (next < TARGETS.length) setTargetIndex(next);
      else setCompletedAll(true);
    }, 2500);
  };

  // ── Recording controls ───────────────────────────────────────────────────────
  const startRecording = (label: string) => {
    recordingLabelRef.current = label;
    isRecordingRef.current = true;
    setIsRecording(true);
    setActiveLabel(label);
  };

  const stopRecording = () => {
    isRecordingRef.current = false;
    recordingLabelRef.current = '';
    setIsRecording(false);
    setActiveLabel('');
    refreshCounts();
  };

  // ── Draw skeleton ────────────────────────────────────────────────────────────
  const drawLandmarks = (ctx: CanvasRenderingContext2D, landmarks: { x: number; y: number }[], w: number, h: number) => {
    const connections = [
      [0, 1], [1, 2], [2, 3], [3, 4], [0, 5], [5, 6], [6, 7], [7, 8],
      [5, 9], [9, 10], [10, 11], [11, 12], [9, 13], [13, 14], [14, 15], [15, 16],
      [13, 17], [17, 18], [18, 19], [19, 20], [0, 17],
    ];
    ctx.strokeStyle = isRecording ? '#ef4444' : '#8b5cf6';
    ctx.lineWidth = 2.5;
    connections.forEach(([s, e]) => {
      ctx.beginPath();
      ctx.moveTo(landmarks[s].x * w, landmarks[s].y * h);
      ctx.lineTo(landmarks[e].x * w, landmarks[e].y * h);
      ctx.stroke();
    });
    ctx.fillStyle = isRecording ? '#f97316' : '#3b82f6';
    landmarks.forEach(pt => {
      ctx.beginPath();
      ctx.arc(pt.x * w, pt.y * h, 4, 0, 2 * Math.PI);
      ctx.fill();
    });
  };

  // ── Helpers ──────────────────────────────────────────────────────────────────
  const getSampleCount = (label: string) => sampleCounts[label] || 0;
  const isSignReady = (label: string) => getSampleCount(label) >= MIN_SAMPLES_PER_SIGN;
  const allSignsReady = TARGETS.every(t => isSignReady(t.word));

  const originalSigns = TARGETS.slice(0, 5);
  const newSigns = TARGETS.slice(5, 10);
  const shownSigns = trainingGroup === 'original' ? originalSigns : newSigns;

  const originalDone = originalSigns.every(t => isSignReady(t.word));
  const newDone = newSigns.every(t => isSignReady(t.word));

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <div className="animate-fade-in" style={{ paddingBottom: '2rem' }}>
      <header style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>
          AI <span className="text-gradient">Practice</span> Studio
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>
          {allSignsReady
            ? 'All 10 signs trained! Hold each sign steady for ~0.7s to register it.'
            : 'Train each sign below, then practice!'}
        </p>
      </header>

      <XPBar
        xp={gameState.xp}
        level={gameState.level}
        streak={gameState.streak}
        learnedCount={mockDictionaryData.filter(s => gameState.isLearned(s.id)).length}
        totalCount={mockDictionaryData.length}
      />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '2rem', marginTop: '2rem' }}>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

          {/* ── Camera panel ── */}
          <div className="glass-panel" style={{
            position: 'relative', aspectRatio: '16/9', overflow: 'hidden',
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', backgroundColor: '#000',
          }}>
            {cameraError ? (
              <div style={{ textAlign: 'center', color: '#ef4444', padding: '2rem' }}>
                <AlertCircle size={48} style={{ margin: '0 auto 1rem' }} />
                <p>{cameraError}</p>
              </div>
            ) : (
              <>
                {!streamActive && (
                  <div style={{ textAlign: 'center', zIndex: 10, padding: '2rem' }}>
                    <Camera size={64} color="var(--text-secondary)" style={{ margin: '0 auto 1.5rem', opacity: 0.5 }} />
                    <h3 style={{ marginBottom: '1rem', fontSize: '1.5rem' }}>Camera Access Required</h3>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
                      All processing happens in your browser — nothing is sent to a server.
                    </p>
                    <button className="btn-primary" onClick={startCamera} disabled={!isModelLoaded} style={{ opacity: isModelLoaded ? 1 : 0.5 }}>
                      {isModelLoaded ? 'Enable Camera' : 'Loading AI Model...'}
                    </button>
                  </div>
                )}

                <video ref={videoRef} style={{ position: 'absolute', width: '100%', height: '100%', objectFit: 'cover', transform: 'scaleX(-1)', display: streamActive ? 'block' : 'none' }} />
                <canvas ref={canvasRef} style={{ position: 'absolute', width: '100%', height: '100%', objectFit: 'cover', transform: 'scaleX(-1)', zIndex: 5, pointerEvents: 'none', display: streamActive ? 'block' : 'none' }} />

                {isRecording && (
                  <div style={{ position: 'absolute', top: '1rem', left: '1rem', zIndex: 8, background: 'rgba(239,68,68,0.9)', borderRadius: '8px', padding: '0.4rem 0.9rem', color: 'white', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Circle size={10} fill="white" /> Recording "{activeLabel}"...
                  </div>
                )}

                {streamActive && allSignsReady && !completedAll && (
                  <div style={{ position: 'absolute', top: '1rem', right: '1rem', zIndex: 8, background: 'rgba(0,0,0,0.65)', borderRadius: '8px', padding: '0.4rem 0.9rem', color: 'white', fontSize: '0.85rem' }}>
                    Sign {targetIndex + 1} / {TARGETS.length}
                  </div>
                )}

                {success && (
                  <div style={{ position: 'absolute', inset: 0, zIndex: 10, background: 'rgba(34,197,94,0.15)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ background: 'rgba(20,83,45,0.92)', border: '1px solid #4ade80', padding: '2rem 3rem', borderRadius: '24px', textAlign: 'center', boxShadow: '0 20px 40px rgba(0,0,0,0.5)' }}>
                      <CheckCircle2 size={64} color="#4ade80" style={{ margin: '0 auto 1rem' }} />
                      <h2 style={{ fontSize: '2rem', color: 'white', margin: '0 0 0.5rem' }}>{successMsg}</h2>
                      <div style={{ color: '#facc15', fontWeight: 'bold', fontSize: '1.25rem' }}>⭐ +30 XP</div>
                    </div>
                  </div>
                )}

                {completedAll && (
                  <div style={{ position: 'absolute', inset: 0, zIndex: 10, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ background: 'rgba(30,30,60,0.95)', border: '1px solid var(--accent-primary)', padding: '2.5rem 3rem', borderRadius: '24px', textAlign: 'center', maxWidth: '400px' }}>
                      <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🏆</div>
                      <h2 style={{ fontSize: '2rem', color: 'white', marginBottom: '0.5rem' }}>Session Complete!</h2>
                      <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>You nailed all 10 signs!</p>
                      <button className="btn-primary" onClick={() => { setTargetIndex(0); setCompletedAll(false); }}>Practice Again</button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* ── Training Panel ── */}
          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ margin: 0 }}>🧠 Train the AI</h3>
              <button
                onClick={() => { knnClassifier.clearAll(); refreshCounts(); }}
                style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                <Trash2 size={14} /> Clear All
              </button>
            </div>

            <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginBottom: '1rem', lineHeight: 1.5 }}>
              Hold <strong>Record</strong> while doing each sign. Aim for <strong>{MIN_SAMPLES_PER_SIGN}+ samples</strong> per sign.
            </p>

            {/* Group tabs */}
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
              {(['original', 'new'] as const).map(group => {
                const done = group === 'original' ? originalDone : newDone;
                const label = group === 'original' ? 'Signs 1–5' : 'Signs 6–10';
                return (
                  <button
                    key={group}
                    onClick={() => setTrainingGroup(group)}
                    style={{
                      flex: 1,
                      padding: '0.5rem',
                      borderRadius: '8px',
                      border: `1px solid ${trainingGroup === group ? 'var(--accent-primary)' : 'var(--border-color)'}`,
                      background: trainingGroup === group ? 'rgba(99,102,241,0.15)' : 'transparent',
                      color: trainingGroup === group ? 'var(--accent-primary)' : 'var(--text-secondary)',
                      cursor: 'pointer',
                      fontSize: '0.85rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                    }}
                  >
                    {done && <span style={{ color: '#10b981' }}>✓</span>}
                    {label}
                  </button>
                );
              })}
            </div>

            {/* Sign rows */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {shownSigns.map(target => {
                const count = getSampleCount(target.word);
                const ready = isSignReady(target.word);
                const pct = Math.min(100, (count / MIN_SAMPLES_PER_SIGN) * 100);
                const active = activeLabel === target.word && isRecording;

                return (
                  <div key={target.word} style={{
                    background: 'rgba(255,255,255,0.03)',
                    border: `1px solid ${ready ? 'rgba(16,185,129,0.4)' : 'var(--border-color)'}`,
                    borderRadius: '10px',
                    padding: '0.9rem 1rem',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.4rem' }}>
                      <span style={{ fontWeight: 600, fontSize: '0.95rem', minWidth: '70px' }}>{target.word}</span>
                      <div style={{ flex: 1, height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${pct}%`, background: ready ? '#10b981' : '#3b82f6', borderRadius: '3px', transition: 'width 0.3s' }} />
                      </div>
                      <span style={{ fontSize: '0.78rem', color: ready ? '#10b981' : 'var(--text-secondary)', minWidth: '55px', textAlign: 'right' }}>
                        {ready ? `✓ ${count}` : `${count}/${MIN_SAMPLES_PER_SIGN}`}
                      </span>
                      <button
                        className={active ? 'btn-danger' : 'btn-primary'}
                        disabled={!streamActive}
                        onMouseDown={() => startRecording(target.word)}
                        onMouseUp={stopRecording}
                        onMouseLeave={stopRecording}
                        onTouchStart={(e) => { e.preventDefault(); startRecording(target.word); }}
                        onTouchEnd={stopRecording}
                        style={{ minWidth: '80px', fontSize: '0.8rem', padding: '0.4rem 0.75rem', background: active ? '#ef4444' : undefined, opacity: streamActive ? 1 : 0.5 }}
                      >
                        {active ? '⏹ Stop' : '⏺ Record'}
                      </button>
                      {count > 0 && (
                        <button onClick={() => { knnClassifier.clearLabel(target.word); refreshCounts(); }} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '0.25rem' }} title={`Clear ${target.word}`}>
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                    <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.4 }}>{target.tip}</p>
                  </div>
                );
              })}
            </div>

            {/* Status */}
            <div style={{ marginTop: '1.25rem', padding: '0.75rem 1rem', borderRadius: '8px', background: allSignsReady ? 'rgba(16,185,129,0.1)' : 'rgba(59,130,246,0.1)', border: `1px solid ${allSignsReady ? 'rgba(16,185,129,0.3)' : 'rgba(59,130,246,0.2)'}`, fontSize: '0.85rem', color: allSignsReady ? '#10b981' : 'var(--text-secondary)' }}>
              {allSignsReady
                ? '✅ All 10 signs trained! Start practicing.'
                : `⏳ ${TARGETS.filter(t => isSignReady(t.word)).length} / ${TARGETS.length} signs ready.`}
            </div>
          </div>
        </div>

        {/* ── Sidebar ── */}
        <div className="glass-card" style={{ padding: '2rem' }}>
          <h3 style={{ marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
            Current Target
          </h3>

          {!completedAll ? (
            <>
              <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--accent-primary)', marginBottom: '0.75rem' }}>
                  "{currentTarget.word}"
                </div>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.6 }}>
                  {currentTarget.desc}
                </p>
              </div>

              <div style={{ background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.3)', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem' }}>
                <h4 style={{ color: '#a78bfa', marginBottom: '0.4rem', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>💡 Tip</h4>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{currentTarget.tip}</p>
              </div>

              {/* Progress dots — 2 rows of 5 */}
              <div style={{ marginBottom: '1.5rem' }}>
                {[originalSigns, newSigns].map((group, gi) => (
                  <div key={gi} style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginBottom: '6px' }}>
                    {group.map((t, i) => {
                      const idx = gi * 5 + i;
                      return (
                        <div key={t.word} title={t.word} style={{
                          width: '10px', height: '10px', borderRadius: '50%',
                          background: idx < targetIndex ? '#10b981' : idx === targetIndex ? 'var(--accent-primary)' : 'var(--border-color)',
                          transition: 'background 0.3s',
                        }} />
                      );
                    })}
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div style={{ textAlign: 'center', color: '#10b981', padding: '1rem' }}>
              <CheckCircle2 size={48} style={{ margin: '0 auto 1rem' }} />
              <p>All 10 signs completed!</p>
            </div>
          )}

          <div style={{ background: 'rgba(59,130,246,0.1)', padding: '1rem', borderRadius: '8px' }}>
            <h4 style={{ color: 'var(--accent-primary)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: isModelLoaded ? '#10b981' : '#f59e0b' }} />
              System Status
            </h4>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              {!isModelLoaded && 'Loading AI model...'}
              {isModelLoaded && !allSignsReady && `${TARGETS.filter(t => isSignReady(t.word)).length}/10 signs trained.`}
              {isModelLoaded && allSignsReady && 'KNN model ready. Hold your sign for ~0.7s.'}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AIPractice;