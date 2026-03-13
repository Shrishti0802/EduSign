import React, { useState } from 'react';
import { Play, CheckCircle, Sparkles } from 'lucide-react';
import type { SignData } from '../lib/mockData';
import type { GameState } from '../lib/gameState';

interface SignCardProps {
  sign: SignData;
  onClick: (sign: SignData) => void;
  gameState: GameState;
}

const DIFFICULTY_COLORS: Record<string, { bg: string; color: string; glow: string }> = {
  Beginner:     { bg: 'rgba(34,197,94,0.18)',  color: '#22c55e', glow: 'rgba(34,197,94,0.4)' },
  Intermediate: { bg: 'rgba(251,191,36,0.18)', color: '#fbbf24', glow: 'rgba(251,191,36,0.4)' },
  Advanced:     { bg: 'rgba(239,68,68,0.18)',  color: '#ef4444', glow: 'rgba(239,68,68,0.4)' },
};

const SignCard: React.FC<SignCardProps> = ({ sign, onClick, gameState }) => {
  const learned = gameState.isLearned(sign.id);
  const [burst, setBurst] = useState(false);
  const diff = DIFFICULTY_COLORS[sign.difficulty] ?? DIFFICULTY_COLORS.Beginner;

  const handleLearn = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (learned) return;
    gameState.markLearned(sign.id);
    gameState.addXP(20);
    setBurst(true);
    setTimeout(() => setBurst(false), 700);
  };

  return (
    <div
      className="glass-card"
      onClick={() => onClick(sign)}
      style={{
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        cursor: 'pointer',
        border: learned ? '1.5px solid rgba(34,197,94,0.6)' : '1px solid rgba(255,255,255,0.1)',
        boxShadow: learned ? '0 0 18px rgba(34,197,94,0.2)' : undefined,
        transition: 'all 0.3s ease',
        position: 'relative',
      }}
    >
      {/* Burst overlay */}
      {burst && (
        <div style={{
          position: 'absolute', inset: 0, zIndex: 10,
          pointerEvents: 'none',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          animation: 'burstFade 0.6s ease forwards',
          background: 'radial-gradient(circle, rgba(34,197,94,0.35) 0%, transparent 70%)',
        }}>
          <span style={{ fontSize: '2.5rem', animation: 'popUp 0.4s cubic-bezier(0.34,1.56,0.64,1)' }}>🎉</span>
        </div>
      )}

      {/* Video thumbnail */}
      <div style={{ position: 'relative', width: '100%', height: '200px', background: '#000' }}>
        <video
          src={sign.videoUrl}
          loop muted playsInline
          onMouseOver={(e) => e.currentTarget.play()}
          onMouseOut={(e) => { e.currentTarget.pause(); e.currentTarget.currentTime = 0; }}
          style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.82 }}
        />
        {/* Play icon */}
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          pointerEvents: 'none'
        }}>
          <div style={{ background: 'rgba(0,0,0,0.5)', borderRadius: '50%', padding: '12px', backdropFilter: 'blur(4px)' }}>
            <Play size={24} color="white" fill="white" />
          </div>
        </div>
        {/* Difficulty badge */}
        <div style={{ position: 'absolute', top: '10px', right: '10px' }}>
          <span style={{
            padding: '3px 10px', borderRadius: '20px', fontSize: '0.75rem',
            fontWeight: 700, background: diff.bg, color: diff.color,
            border: `1px solid ${diff.color}44`,
            boxShadow: `0 0 8px ${diff.glow}`,
            letterSpacing: '0.03em'
          }}>
            {sign.difficulty}
          </span>
        </div>
        {/* Click hint */}
        <div style={{
          position: 'absolute', bottom: '8px', left: '8px',
          background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)',
          borderRadius: '6px', padding: '2px 8px',
          color: '#ffffffbb', fontSize: '0.72rem', fontWeight: 500
        }}>
          Click to learn
        </div>
        {/* Learned checkmark */}
        {learned && (
          <div style={{
            position: 'absolute', top: '10px', left: '10px',
            background: 'rgba(34,197,94,0.25)', borderRadius: '50%',
            padding: '4px', border: '1px solid rgba(34,197,94,0.5)'
          }}>
            <CheckCircle size={16} color="#22c55e" fill="rgba(34,197,94,0.3)" />
          </div>
        )}
      </div>

      {/* Card footer */}
      <div style={{ padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h3 style={{ fontSize: '1.15rem', marginBottom: '0.15rem' }}>{sign.word}</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{sign.category}</p>
        </div>
        <button
          onClick={handleLearn}
          title={learned ? 'Already learned!' : 'Mark as Learned (+20 XP)'}
          style={{
            display: 'flex', alignItems: 'center', gap: '5px',
            padding: '6px 12px', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 700,
            border: learned ? '1px solid rgba(34,197,94,0.5)' : '1px solid rgba(255,255,255,0.12)',
            background: learned ? 'rgba(34,197,94,0.18)' : 'rgba(255,255,255,0.06)',
            color: learned ? '#22c55e' : 'var(--text-secondary)',
            cursor: learned ? 'default' : 'pointer',
            fontFamily: 'var(--font-main)',
            transition: 'all 0.2s ease',
            flexShrink: 0,
          }}
        >
          {learned
            ? <><CheckCircle size={14} /> Done</>
            : <><Sparkles size={14} /> +20 XP</>
          }
        </button>
      </div>
    </div>
  );
};

export default SignCard;
