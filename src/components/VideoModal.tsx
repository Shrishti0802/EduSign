import React, { useRef, useState, useEffect } from 'react';
import { X, Square, Gauge, SkipForward, ChevronLeft, ChevronRight } from 'lucide-react';
import type { SignData } from '../lib/mockData';

interface VideoModalProps {
  sign: SignData;
  allSigns: SignData[];
  onClose: () => void;
}

const VideoModal: React.FC<VideoModalProps> = ({ sign, allSigns, onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [speed, setSpeed] = useState(1);
  const [currentSign, setCurrentSign] = useState(sign);
  const [isPaused, setIsPaused] = useState(false);

  const currentIndex = allSigns.findIndex(s => s.id === currentSign.id);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.load();
      videoRef.current.playbackRate = speed;
      videoRef.current.play();
      setIsPaused(false);
    }
  }, [currentSign]);

  useEffect(() => {
    if (videoRef.current) videoRef.current.playbackRate = speed;
  }, [speed]);

  const handleStop = () => {
    if (!videoRef.current) return;
    if (isPaused) { videoRef.current.play(); setIsPaused(false); }
    else { videoRef.current.pause(); videoRef.current.currentTime = 0; setIsPaused(true); }
  };

  const speeds = [0.25, 0.5, 0.75, 1];
  const handleSlowDown = () => {
    const idx = speeds.indexOf(speed);
    setSpeed(idx > 0 ? speeds[idx - 1] : 1);
  };

  const goTo = (index: number) => {
    setCurrentSign(allSigns[(index + allSigns.length) % allSigns.length]);
    setSpeed(1);
  };

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose();
  };


  const speedLabel = speed < 1 ? `${speed}× Slow` : 'Normal';

  return (
    <div
      onClick={handleBackdropClick}
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(2, 6, 23, 0.92)',
        backdropFilter: 'blur(16px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 1000,
        animation: 'fadeIn 0.2s ease'
      }}
    >
      <div style={{
        width: '92%', maxWidth: '900px', borderRadius: '24px',
        overflow: 'hidden', display: 'flex', flexDirection: 'column',
        background: 'rgba(15, 23, 42, 0.97)',
        border: '1px solid rgba(255,255,255,0.12)',
        boxShadow: '0 40px 100px rgba(0,0,0,0.7), 0 0 0 1px rgba(59,130,246,0.15)',
        animation: 'slideUp 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)'
      }}>

        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '1.25rem 1.75rem',
          borderBottom: '1px solid rgba(255,255,255,0.07)',
          background: 'rgba(255,255,255,0.03)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <button onClick={() => goTo(currentIndex - 1)} style={arrowBtnStyle}
              onMouseOver={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.12)')}
              onMouseOut={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.07)')}
            ><ChevronLeft size={18} color="white" /></button>
            <div>
              <h2 style={{ fontSize: '1.6rem', margin: 0, letterSpacing: '-0.02em' }}>
                {currentSign.word}
              </h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.2rem' }}>
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{currentSign.category}</span>
                <span style={{ color: 'rgba(255,255,255,0.2)' }}>·</span>
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                  {currentIndex + 1} / {allSigns.length}
                </span>
              </div>
            </div>
            <button onClick={() => goTo(currentIndex + 1)} style={arrowBtnStyle}
              onMouseOver={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.12)')}
              onMouseOut={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.07)')}
            ><ChevronRight size={18} color="white" /></button>
          </div>
          <button onClick={onClose} style={{ ...arrowBtnStyle, borderRadius: '50%', width: '40px', height: '40px' }}
            onMouseOver={e => (e.currentTarget.style.background = 'rgba(239,68,68,0.25)')}
            onMouseOut={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.07)')}
          ><X size={18} color="white" /></button>
        </div>

        {/* Video */}
        <div style={{ background: '#000', position: 'relative' }}>
          <video ref={videoRef} src={currentSign.videoUrl} autoPlay loop playsInline
            style={{ width: '100%', maxHeight: '420px', objectFit: 'contain', display: 'block' }}
          />
          {speed < 1 && (
            <div style={{
              position: 'absolute', top: '14px', right: '14px',
              background: 'rgba(234,179,8,0.2)', border: '1px solid rgba(234,179,8,0.4)',
              backdropFilter: 'blur(6px)', borderRadius: '20px', padding: '4px 14px',
              color: '#facc15', fontWeight: 700, fontSize: '0.8rem'
            }}>{speedLabel}</div>
          )}
          {isPaused && (
            <div style={{
              position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'rgba(0,0,0,0.45)', pointerEvents: 'none'
            }}>
              <div style={{
                background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(8px)',
                border: '1px solid rgba(255,255,255,0.2)', borderRadius: '16px',
                padding: '12px 24px', color: 'white', fontWeight: 600
              }}>Paused</div>
            </div>
          )}
        </div>


        {/* Controls */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          gap: '0.75rem', padding: '1.1rem 1.75rem',
          background: 'rgba(255,255,255,0.02)',
          borderTop: '1px solid rgba(255,255,255,0.07)',
          flexWrap: 'wrap'
        }}>
          <ControlButton onClick={handleStop}
            icon={<Square size={15} fill={isPaused ? '#22c55e' : '#ef4444'} color={isPaused ? '#22c55e' : '#ef4444'} />}
            label={isPaused ? 'Resume' : 'Stop'}
            color={isPaused ? '#22c55e' : '#ef4444'}
            bg={isPaused ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.12)'}
            hoverBg={isPaused ? 'rgba(34,197,94,0.25)' : 'rgba(239,68,68,0.25)'}
          />
          <ControlButton onClick={handleSlowDown}
            icon={<Gauge size={15} color="#facc15" />}
            label={`Slow Down${speed < 1 ? ` (${speed}×)` : ''}`}
            color="#facc15" bg="rgba(234,179,8,0.12)" hoverBg="rgba(234,179,8,0.25)"
          />
          <div style={{ width: '1px', height: '28px', background: 'rgba(255,255,255,0.1)' }} />
          <ControlButton onClick={() => goTo(currentIndex - 1)}
            icon={<ChevronLeft size={15} color="white" />}
            label="Prev" color="white" bg="rgba(255,255,255,0.07)" hoverBg="rgba(255,255,255,0.14)"
          />
          <ControlButton onClick={() => goTo(currentIndex + 1)}
            icon={<SkipForward size={15} color="white" />}
            label="Next" color="white" bg="var(--accent-gradient)" hoverBg="var(--accent-gradient)" opacity
          />
        </div>
      </div>
    </div>
  );
};

const arrowBtnStyle: React.CSSProperties = {
  background: 'rgba(255,255,255,0.07)',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: '10px', width: '36px', height: '36px',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  cursor: 'pointer', transition: 'background 0.2s', flexShrink: 0,
};

interface CBProps {
  onClick: () => void; icon: React.ReactNode; label: string;
  color: string; bg: string; hoverBg: string; opacity?: boolean;
}
const ControlButton: React.FC<CBProps> = ({ onClick, icon, label, color, bg, hoverBg, opacity }) => {
  const [hovered, setHovered] = useState(false);
  return (
    <button onClick={onClick}
      onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex', alignItems: 'center', gap: '0.4rem',
        padding: '0.55rem 1.2rem', borderRadius: '10px',
        border: '1px solid rgba(255,255,255,0.1)',
        background: hovered ? hoverBg : bg, color,
        fontFamily: 'var(--font-main)', fontWeight: 600, fontSize: '0.85rem',
        cursor: 'pointer', transition: 'all 0.18s ease',
        opacity: hovered && opacity ? 0.85 : 1,
        whiteSpace: 'nowrap'
      }}>
      {icon}{label}
    </button>
  );
};

export default VideoModal;
