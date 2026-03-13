import React from 'react';
import { Play } from 'lucide-react';
import type { SignData } from '../lib/mockData';

interface SignCardProps {
  sign: SignData;
}

const SignCard: React.FC<SignCardProps> = ({ sign }) => {
  return (
    <div className="glass-card" style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      <div style={{ position: 'relative', width: '100%', height: '200px', background: '#000' }}>
        <video 
          src={sign.videoUrl} 
          loop 
          muted 
          playsInline
          onMouseOver={(e) => e.currentTarget.play()}
          onMouseOut={(e) => {
            e.currentTarget.pause();
            e.currentTarget.currentTime = 0;
          }}
          style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.8 }}
        />
        <div style={{ 
          position: 'absolute', 
          inset: 0, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          pointerEvents: 'none'
        }}>
           <div style={{ background: 'rgba(0,0,0,0.5)', borderRadius: '50%', padding: '12px', backdropFilter: 'blur(4px)' }}>
             <Play size={24} color="white" fill="white" />
           </div>
        </div>
        <div style={{ position: 'absolute', top: '12px', right: '12px' }}>
          <span className="badge">{sign.difficulty}</span>
        </div>
      </div>
      <div style={{ padding: '1.25rem' }}>
        <h3 style={{ fontSize: '1.25rem', marginBottom: '0.25rem' }}>{sign.word}</h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{sign.category}</p>
      </div>
    </div>
  );
};

export default SignCard;
