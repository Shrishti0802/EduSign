import { useEffect, useRef, useState } from 'react';
import { FilesetResolver, HandLandmarker } from '@mediapipe/tasks-vision';
import { Camera, AlertCircle } from 'lucide-react';

const AIPractice = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const handLandmarkerRef = useRef<HandLandmarker | null>(null);
  const animationRef = useRef<number>(0);

  useEffect(() => {
    // 1. Initialize MediaPipe
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
        setCameraError("Failed to load AI model. Please check network connection.");
      }
    };

    initializeMediaPipe();

    return () => {
      if (handLandmarkerRef.current) {
        handLandmarkerRef.current.close();
      }
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  const startCamera = async () => {
    if (!videoRef.current) return;
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 1280, height: 720 } });
      videoRef.current.srcObject = stream;
      videoRef.current.onloadedmetadata = () => {
        videoRef.current?.play();
        predictWebcam();
      };
    } catch (err) {
      console.error("Error accessing webcam: ", err);
      setCameraError("Could not access the webcam. Please grant permissions.");
    }
  };

  const predictWebcam = () => {
    if (!videoRef.current || !canvasRef.current || !handLandmarkerRef.current) return;
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    if (ctx && video.readyState >= 2) {
      // Ensure canvas matches video size exactly
      if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
      }
      
      const startTimeMs = performance.now();
      const results = handLandmarkerRef.current.detectForVideo(video, startTimeMs);
      
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      if (results.landmarks) {
        for (const landmarks of results.landmarks) {
          drawLandmarks(ctx, landmarks, canvas.width, canvas.height);
        }
      }
    }
    
    animationRef.current = requestAnimationFrame(predictWebcam);
  };

  // Helper function to draw connections and points
  const drawLandmarks = (ctx: CanvasRenderingContext2D, landmarks: any[], width: number, height: number) => {
    ctx.fillStyle = '#3b82f6'; // Tailwind blue-500 equivalent for our theme
    ctx.strokeStyle = '#8b5cf6'; // Purple-500 for lines
    ctx.lineWidth = 4;

    // Define connections for the hand (MediaPipe standard)
    const connections = [
      [0,1],[1,2],[2,3],[3,4], // Thumb
      [0,5],[5,6],[6,7],[7,8], // Index
      [5,9],[9,10],[10,11],[11,12], // Middle
      [9,13],[13,14],[14,15],[15,16], // Ring
      [13,17],[17,18],[18,19],[19,20],// Pinky
      [0,17] // Palm base connection
    ];

    // Draw lines
    connections.forEach(([startIdx, endIdx]) => {
      const start = landmarks[startIdx];
      const end = landmarks[endIdx];
      ctx.beginPath();
      ctx.moveTo(start.x * width, start.y * height);
      ctx.lineTo(end.x * width, end.y * height);
      ctx.stroke();
    });

    // Draw points
    landmarks.forEach(point => {
      ctx.beginPath();
      ctx.arc(point.x * width, point.y * height, 6, 0, 2 * Math.PI);
      ctx.fill();
      ctx.stroke();
    });
  };

  return (
    <div className="animate-fade-in" style={{ paddingBottom: '2rem' }}>
      <header style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>AI <span className="text-gradient">Practice</span> Studio</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>
          Test your signs in real-time. Our AI will track your hand movements and provide feedback.
        </p>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '2rem' }}>
        
        {/* Camera Output Area */}
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
              {/* Instruction Overlay (hides when video streams) */}
              {!videoRef.current?.srcObject && (
                <div style={{ textAlign: 'center', zIndex: 10, padding: '2rem' }}>
                  <Camera size={64} color="var(--text-secondary)" style={{ margin: '0 auto 1.5rem', opacity: 0.5 }} />
                  <h3 style={{ marginBottom: '1rem', fontSize: '1.5rem' }}>Camera Access Required</h3>
                  <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
                    Please allow webcam access to use the interactive AI tools. Your video is processed entirely in your browser.
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
              
              {/* Hidden Video element used for processing */}
              <video 
                ref={videoRef} 
                style={{ 
                  position: 'absolute', 
                  width: '100%', 
                  height: '100%',
                  objectFit: 'cover',
                  transform: 'scaleX(-1)', // Mirror image
                  display: videoRef.current?.srcObject ? 'block' : 'none'
                }} 
              />
              
              {/* Canvas overlaid on top for drawing joints */}
              <canvas 
                ref={canvasRef}
                style={{ 
                  position: 'absolute', 
                  width: '100%', 
                  height: '100%',
                  objectFit: 'cover',
                  transform: 'scaleX(-1)', // Mirror image to match video
                  zIndex: 5,
                  display: videoRef.current?.srcObject ? 'block' : 'none',
                  pointerEvents: 'none'
                }} 
              />
            </>
          )}
        </div>

        {/* Sidebar Instructions / Feedback */}
        <div className="glass-card" style={{ padding: '2rem' }}>
          <h3 style={{ marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
            Current Target
          </h3>
          
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
             <div style={{ fontSize: '3rem', fontWeight: 'bold', color: 'var(--accent-primary)', marginBottom: '0.5rem' }}>
               "Hello"
             </div>
             <p style={{ color: 'var(--text-secondary)' }}>Show an open palm with fingers together, moving outward from your forehead.</p>
          </div>

          <div style={{ background: 'rgba(59, 130, 246, 0.1)', padding: '1rem', borderRadius: '8px' }}>
            <h4 style={{ color: 'var(--accent-primary)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '8px', height: '8px', background: isModelLoaded ? '#10b981' : '#f59e0b', borderRadius: '50%' }}></div>
              System Status
            </h4>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
              {isModelLoaded ? 'AI Handpose Model Active. Ready to track.' : 'Initializing machine learning models...'}
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AIPractice;
