import React from 'react';
import { Flame, Star, Trophy } from 'lucide-react';
import { XP_PER_LEVEL_CONST } from '../lib/gameState';

const LEVEL_TITLES = [
  '', 'Newcomer', 'Learner', 'Signer', 'Communicator', 'Expert',
  'Champion', 'Master', 'Legend', 'Icon', 'Grand Master'
];

function getLevelTitle(level: number): string {
  return LEVEL_TITLES[Math.min(level, LEVEL_TITLES.length - 1)] || 'Grand Master';
}

interface XPBarProps {
  xp: number;
  level: number;
  streak: number;
  learnedCount: number;
  totalCount: number;
}

const XPBar: React.FC<XPBarProps> = ({ xp, level, streak, learnedCount, totalCount }) => {
  const xpInLevel = xp % XP_PER_LEVEL_CONST;
  const progressPct = (xpInLevel / XP_PER_LEVEL_CONST) * 100;

  return (
    <div style={{
      background: 'rgba(15,23,42,0.7)',
      border: '1px solid rgba(255,255,255,0.1)',
      borderRadius: '16px',
      padding: '1.25rem 1.75rem',
      marginBottom: '2rem',
      display: 'flex',
      alignItems: 'center',
      gap: '2rem',
      flexWrap: 'wrap',
      backdropFilter: 'blur(12px)',
      boxShadow: '0 4px 24px rgba(59,130,246,0.08)'
    }}>

      {/* Level badge */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexShrink: 0 }}>
        <div style={{
          width: '48px', height: '48px',
          borderRadius: '12px',
          background: 'var(--accent-gradient)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 0 16px rgba(59,130,246,0.4)',
          fontSize: '1.3rem'
        }}>
          <Trophy size={22} color="white" />
        </div>
        <div>
          <div style={{ fontWeight: 700, fontSize: '1rem', color: 'white' }}>
            Level {level}
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            {getLevelTitle(level)}
          </div>
        </div>
      </div>

      {/* XP Progress bar */}
      <div style={{ flex: 1, minWidth: '180px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            <Star size={12} style={{ marginRight: '4px', verticalAlign: 'middle' }} color="#facc15" />
            {xpInLevel} / {XP_PER_LEVEL_CONST} XP
          </span>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            Next Level →
          </span>
        </div>
        <div style={{
          height: '10px',
          background: 'rgba(255,255,255,0.08)',
          borderRadius: '20px',
          overflow: 'hidden',
          border: '1px solid rgba(255,255,255,0.05)'
        }}>
          <div style={{
            height: '100%',
            width: `${progressPct}%`,
            background: 'linear-gradient(90deg, #3b82f6, #8b5cf6)',
            borderRadius: '20px',
            transition: 'width 0.5s cubic-bezier(0.34,1.56,0.64,1)',
            boxShadow: '0 0 8px rgba(139,92,246,0.6)'
          }} />
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'flex', gap: '1.5rem', flexShrink: 0 }}>
        <Stat
          icon={<Flame size={18} color="#f97316" />}
          value={`${streak}🔥`}
          label="Day Streak"
          glow="rgba(249,115,22,0.3)"
        />
        <Stat
          icon={<span style={{ fontSize: '1rem' }}>✅</span>}
          value={`${learnedCount}/${totalCount}`}
          label="Learned"
          glow="rgba(34,197,94,0.3)"
        />
      </div>
    </div>
  );
};

const Stat: React.FC<{ icon: React.ReactNode; value: string; label: string; glow: string }> = ({ icon, value, label, glow }) => (
  <div style={{ textAlign: 'center' }}>
    <div style={{
      display: 'flex', alignItems: 'center', gap: '4px',
      fontSize: '1.1rem', fontWeight: 700, color: 'white',
      textShadow: `0 0 12px ${glow}`
    }}>
      {icon}{value}
    </div>
    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px' }}>{label}</div>
  </div>
);

export default XPBar;
