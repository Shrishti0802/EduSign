import { useEffect, useRef, useState } from 'react';
import { FilesetResolver, HandLandmarker } from '@mediapipe/tasks-vision';
import { Camera, AlertCircle, CheckCircle2 } from 'lucide-react';
import { detectSign, debugScores, type Landmark } from '../lib/signRecognizer';
import { mlRecognizer } from '../lib/mlRecognizer';
import { useGameState } from '../lib/gameState';
import XPBar from '../components/XPBar';
import { mockDictionaryData } from '../lib/mockData';

// ── Target signs ──────────────────────────────────────────────────────────────
const TARGETS = [
  {
    word: 'Hello',
    desc: 'Open palm facing outward, all 5 fingers fully extended and spread apart. Hold steady near your forehead.',
    tip: 'Think of waving — but freeze the open hand.',
  },
  {
    word: 'Thank You',
    desc: 'Flat hand, fingers extended and held together. Touch your chin/lips with your fingertips, then move outward.',
    tip: 'Key difference from Hello: keep your fingers TOGETHER, not spread.',
  },
];

const DEBUG_MODE = false; // Set true to see live scores in browser console

const AIPractice = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const handLandmarkerRef = useRef<HandLandmarker | null>(null);
  const animationRef = useRef<number>(0);
  const lastMlRunTimeRef = useRef<number>(0);
  const gameState = useGameState();
  const [streamActive, setStreamActive] = useState(false);

  // Sign progress
  const [targetIndex, setTargetIndex] = useState(0);
  const [completedAll, setCompletedAll] = useState(false);
  const currentTarget = TARGETS[targetIndex];

  // ML Training State
  const [trainingWord, setTrainingWord] = useState('');
  const [trainingCounts, setTrainingCounts] = useState<Record<string, number>>({});
  const isRecordingRef = useRef(false);
  const trainingWordRef = useRef('');
  useEffect(() => { trainingWordRef.current = trainingWord; }, [trainingWord]);

  // Feedback state
  const [success, setSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const successLockRef = useRef(false); // prevents double-trigger during 3s pause

  useEffect(() => {
    const initializeMediaPipe = async () => {
      try {
        const vision = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
        );
        const landmarker = await HandLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: `https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task`,
            delegate: "GPU"
          },
          runningMode: "VIDEO",
          numHands: 2,
          minHandDetectionConfidence: 0.5,
          minHandPresenceConfidence: 0.5,
          minTrackingConfidence: 0.5
        });
        handLandmarkerRef.current = landmarker;
        setIsModelLoaded(true);
      } catch (err) {
        console.error("Failed to initialize MediaPipe", err);
        setCameraError("Failed to load AI model. Please check your network connection.");
      }
    };

    initializeMediaPipe();

    return () => {
      handLandmarkerRef.current?.close();
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, []);

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
      console.error("Error accessing webcam:", err);
      setCameraError("Could not access the webcam. Please grant camera permissions.");
    }
  };

  // Use a ref for targetIndex inside the animation loop to avoid stale closures
  const targetIndexRef = useRef(targetIndex);
  useEffect(() => { targetIndexRef.current = targetIndex; }, [targetIndex]);

  const predictWebcam = () => {
    if (!videoRef.current || !canvasRef.current || !handLandmarkerRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    if (ctx && video.readyState >= 2) {
      if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
      }

      const startTimeMs = performance.now();
      const results = handLandmarkerRef.current.detectForVideo(video, startTimeMs);

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (results.landmarks && results.landmarks.length > 0) {
        for (const landmarks of results.landmarks) {
          drawLandmarks(ctx, landmarks, canvas.width, canvas.height);

          if (DEBUG_MODE) debugScores(landmarks);

          if (!successLockRef.current) {
            
            const nowTime = performance.now();
            // Throttle heavy ML tasks and React state updates to ~10 times a second
            const shouldRunMl = nowTime - lastMlRunTimeRef.current > 100;
            
            if (shouldRunMl) {
                lastMlRunTimeRef.current = nowTime;
                
                // ML Training Data Collection
                if (isRecordingRef.current && trainingWordRef.current) {
                    mlRecognizer.addExample(landmarks as Landmark[], trainingWordRef.current);
                    // Update UI counts safely
                    setTrainingCounts({...mlRecognizer.getCountsByLabel()});
                } else if (mlRecognizer.getExampleCount() > 0) {
                    // Use ML Prediction
                    const { label, confidence } = mlRecognizer.predict(landmarks as Landmark[]);
                    if (label && confidence > 0.5) {
                        const currentWord = TARGETS[targetIndexRef.current].word;
                        if (label.toLowerCase() === currentWord.toLowerCase()) {
                          handleSuccess(label);
                        }
                    }
                } else {
                    // Fallback to Geometric Heuristics if user hasn't trained anything yet
                    const sign = detectSign(landmarks);
                    const currentWord = TARGETS[targetIndexRef.current].word;
                    if (sign && sign.toLowerCase() === currentWord.toLowerCase()) {
                      handleSuccess(sign);
                    }
                }
            }
          }
        }
      }
    }

    animationRef.current = requestAnimationFrame(predictWebcam);
  };

  const handleSuccess = (sign: string) => {
    successLockRef.current = true;
    setSuccess(true);
    setSuccessMessage(`Great job! "${sign}" ✓`);
    gameState.addXP(30);

    setTimeout(() => {
      setSuccess(false);
      successLockRef.current = false;

      const nextIndex = targetIndexRef.current + 1;
      if (nextIndex < TARGETS.length) {
        setTargetIndex(nextIndex);
      } else {
        setCompletedAll(true);
      }
    }, 2500);
  };

  const drawLandmarks = (ctx: CanvasRenderingContext2D, landmarks: any[], width: number, height: number) => {
    ctx.strokeStyle = '#8b5cf6';
    ctx.fillStyle = '#3b82f6';
    ctx.lineWidth = 3;

    const connections = [
      [0, 1], [1, 2], [2, 3], [3, 4],
      [0, 5], [5, 6], [6, 7], [7, 8],
      [5, 9], [9, 10], [10, 11], [11, 12],
      [9, 13], [13, 14], [14, 15], [15, 16],
      [13, 17], [17, 18], [18, 19], [19, 20],
      [0, 17]
    ];

    connections.forEach(([s, e]) => {
      ctx.beginPath();
      ctx.moveTo(landmarks[s].x * width, landmarks[s].y * height);
      ctx.lineTo(landmarks[e].x * width, landmarks[e].y * height);
      ctx.stroke();
    });

    landmarks.forEach(pt => {
      ctx.beginPath();
      ctx.arc(pt.x * width, pt.y * height, 5, 0, 2 * Math.PI);
      ctx.fill();
    });
  };

  return (
    <div className="animate-fade-in" style={{ paddingBottom: '2rem' }}>
      <header style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>
          AI <span className="text-gradient">Practice</span> Studio
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>
          Test your signs in real-time. Hold the sign steady — our AI needs ~0.5s to confirm it.
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

        {/* Camera Output */}
        <div className="glass-panel" style={{
          position: 'relative',
          aspectRatio: '16/9',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#000'
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
                    Your video is processed entirely in your browser — nothing is sent to a server.
                  </p>
                  <button
                    className="btn-primary"
                    onClick={startCamera}
                    disabled={!isModelLoaded}
                    style={{ opacity: isModelLoaded ? 1 : 0.5 }}
                  >
                    {isModelLoaded ? 'Enable Camera' : 'Loading AI Model...'}
                  </button>
                </div>
              )}

              <video
                ref={videoRef}
                style={{ 
                    position: 'absolute', 
                    width: '100%', 
                    height: '100%', 
                    objectFit: 'cover',
                    transform: 'scaleX(-1)',
                    display: streamActive ? 'block' : 'none' 
                }}
              />

              <canvas
                ref={canvasRef}
                style={{
                  position: 'absolute',
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  transform: 'scaleX(-1)',
                  zIndex: 5,
                  display: streamActive ? 'block' : 'none',
                  pointerEvents: 'none'
                }}
              />

              {/* Progress indicator */}
              {streamActive && !completedAll && (
                <div style={{
                  position: 'absolute', top: '1rem', left: '1rem', zIndex: 8,
                  background: 'rgba(0,0,0,0.6)', borderRadius: '8px', padding: '0.4rem 0.8rem',
                  color: 'white', fontSize: '0.85rem'
                }}>
                  Sign {targetIndex + 1} / {TARGETS.length}
                </div>
              )}

              {/* Success Overlay */}
              {success && (
                <div style={{
                  position: 'absolute', inset: 0, zIndex: 10,
                  background: 'rgba(34,197,94,0.2)', backdropFilter: 'blur(4px)',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                }}>
                  <div style={{
                    background: 'rgba(20,83,45,0.9)', border: '1px solid #4ade80',
                    padding: '2rem 3rem', borderRadius: '24px', textAlign: 'center',
                    boxShadow: '0 20px 40px rgba(0,0,0,0.5), 0 0 40px rgba(34,197,94,0.3)',
                  }}>
                    <CheckCircle2 size={64} color="#4ade80" style={{ margin: '0 auto 1rem' }} />
                    <h2 style={{ fontSize: '2rem', color: 'white', margin: '0 0 0.5rem 0' }}>{successMessage}</h2>
                    <div style={{ color: '#facc15', fontWeight: 'bold', fontSize: '1.25rem' }}>⭐ +30 XP</div>
                  </div>
                </div>
              )}

              {/* All Done Overlay */}
              {completedAll && (
                <div style={{
                  position: 'absolute', inset: 0, zIndex: 10,
                  background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                }}>
                  <div style={{
                    background: 'rgba(30,30,60,0.95)', border: '1px solid var(--accent-primary)',
                    padding: '2.5rem 3rem', borderRadius: '24px', textAlign: 'center',
                    maxWidth: '400px'
                  }}>
                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🏆</div>
                    <h2 style={{ fontSize: '2rem', color: 'white', marginBottom: '0.5rem' }}>Session Complete!</h2>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
                      You successfully signed both "Hello" and "Thank You". Amazing work!
                    </p>
                    <button className="btn-primary" onClick={() => { setTargetIndex(0); setCompletedAll(false); }}>
                      Practice Again
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Training Mode Panel (Below Camera) */}
        <div className="glass-panel" style={{ padding: '1.5rem', marginTop: '1rem', gridColumn: '1' }}>
          <h3 style={{ marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
            🧠 AI Training Mode
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1rem' }}>
            The AI learns how YOU sign. Type a word and hold "Record" while performing the sign to train the machine learning model.
          </p>
          
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1rem' }}>
            <input 
              type="text" 
              placeholder="e.g. Hello" 
              value={trainingWord}
              onChange={e => setTrainingWord(e.target.value)}
              style={{
                flex: 1, padding: '0.8rem 1rem', borderRadius: '8px', 
                background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-color)',
                color: 'white', outline: 'none'
              }}
            />
            <button 
              className="btn-primary" 
              style={{ background: isRecordingRef.current ? '#ef4444' : '#3b82f6', border: 'none', minWidth: '150px' }}
              onMouseDown={() => { isRecordingRef.current = true; }}
              onMouseUp={() => { isRecordingRef.current = false; setTrainingCounts({...mlRecognizer.getCountsByLabel()}); }}
              onMouseLeave={() => { isRecordingRef.current = false; }}
              disabled={!trainingWord || !streamActive}
            >
              ⏺ Hold to Record
            </button>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '1rem' }}>
            {Object.entries(trainingCounts).map(([label, count]) => (
                <div key={label} style={{ background: 'rgba(59,130,246,0.2)', padding: '0.4rem 0.8rem', borderRadius: '4px', fontSize: '0.85rem' }}>
                    {label}: <span style={{ fontWeight: 'bold' }}>{count} frames</span>
                </div>
            ))}
            {Object.keys(trainingCounts).length > 0 && (
                <button 
                    onClick={() => { mlRecognizer.clear(); setTrainingCounts({}); }}
                    style={{ background: 'transparent', border: 'none', color: '#ef4444', textDecoration: 'underline', cursor: 'pointer', fontSize: '0.85rem', marginLeft: 'auto' }}
                >
                    Clear Data
                </button>
            )}
          </div>
        </div>
        
        {/* Sidebar */}
        <div className="glass-card" style={{ padding: '2rem' }}>
          <h3 style={{ marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
            Current Target
          </h3>

          {!completedAll ? (
            <>
              <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--accent-primary)', marginBottom: '0.5rem' }}>
                  "{currentTarget.word}"
                </div>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: '1.5' }}>
                  {currentTarget.desc}
                </p>
              </div>

              {/* Tip box */}
              <div style={{ background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.3)', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem' }}>
                <h4 style={{ color: '#a78bfa', marginBottom: '0.4rem', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  💡 Tip
                </h4>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{currentTarget.tip}</p>
              </div>

              {/* Progress dots */}
              <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginBottom: '1.5rem' }}>
                {TARGETS.map((t, i) => (
                  <div key={t.word} style={{
                    width: '10px', height: '10px', borderRadius: '50%',
                    background: i < targetIndex ? '#10b981' : i === targetIndex ? 'var(--accent-primary)' : 'var(--border-color)',
                    transition: 'background 0.3s'
                  }} />
                ))}
              </div>
            </>
          ) : (
            <div style={{ textAlign: 'center', color: '#10b981' }}>
              <CheckCircle2 size={48} style={{ margin: '0 auto 1rem' }} />
              <p>All signs completed!</p>
            </div>
          )}

          {/* Status */}
          <div style={{ background: 'rgba(59,130,246,0.1)', padding: '1rem', borderRadius: '8px' }}>
            <h4 style={{ color: 'var(--accent-primary)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem' }}>
              <div style={{ width: '8px', height: '8px', background: isModelLoaded ? '#10b981' : '#f59e0b', borderRadius: '50%' }} />
              System Status
            </h4>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              {isModelLoaded
                ? 'AI model ready.'
                : 'Initializing machine learning models...'}
                {mlRecognizer.getExampleCount() > 0 && (
                    <div style={{ color: '#10b981', marginTop: '0.5rem', fontWeight: 'bold' }}>
                        ✓ Using Custom ML Model
                    </div>
                )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIPractice;