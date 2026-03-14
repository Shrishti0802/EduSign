import React, { useState, useRef, useEffect } from 'react';
import { CheckCircle2, XCircle, Trophy, RotateCcw, ArrowRight } from 'lucide-react';
import type { SignData } from '../lib/mockData';
import type { GameState } from '../lib/gameState';

interface QuizSessionProps {
  signs: SignData[];       // signs to quiz on (the learned ones)
  gameState: GameState;
  onClose: () => void;
}

type QuizState = 'question' | 'correct' | 'wrong' | 'finished';

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

const QuizSession: React.FC<QuizSessionProps> = ({ signs, gameState, onClose }) => {
  const [questions] = useState(() => shuffle(signs).slice(0, Math.min(signs.length, 6)));
  const [index, setIndex] = useState(0);
  const [guess, setGuess] = useState('');
  const [state, setState] = useState<QuizState>('question');
  const [score, setScore] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const current = questions[index];

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.load();
      videoRef.current.play();
    }
    setState('question');
    setGuess('');
    setTimeout(() => inputRef.current?.focus(), 100);
  }, [index]);

  const handleSubmit = () => {
    if (!guess.trim()) return;
    const correct = guess.trim().toLowerCase() === current.word.toLowerCase();
    if (correct) {
      setScore(s => s + 1);
      gameState.addXP(15);
      setState('correct');
    } else {
      setState('wrong');
    }
  };

  const handleNext = () => {
    if (index + 1 >= questions.length) {
      setState('finished');
    } else {
      setIndex(i => i + 1);
    }
  };

  const scorePercent = Math.round((score / questions.length) * 100);
  const medal = scorePercent === 100 ? '🥇' : scorePercent >= 70 ? '🥈' : '🥉';

  // FINISHED screen
  if (state === 'finished') {
    return (
      <Overlay onBackdropClick={onClose}>
        <div style={{ textAlign: 'center', padding: '3rem 2rem' }}>
          <div style={{ fontSize: '5rem', marginBottom: '1rem' }}>{medal}</div>
          <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>
            Quiz Complete!
          </h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', fontSize: '1.05rem' }}>
            You answered <strong style={{ color: 'white' }}>{score} out of {questions.length}</strong> correctly
          </p>

          {/* Score bar */}
          <div style={{ maxWidth: '320px', margin: '0 auto 2rem' }}>
            <div style={{
              height: '14px', background: 'rgba(255,255,255,0.08)',
              borderRadius: '20px', overflow: 'hidden'
            }}>
              <div style={{
                height: '100%',
                width: `${scorePercent}%`,
                background: scorePercent === 100
                  ? 'linear-gradient(90deg,#22c55e,#4ade80)'
                  : scorePercent >= 70
                    ? 'linear-gradient(90deg,#3b82f6,#8b5cf6)'
                    : 'linear-gradient(90deg,#f97316,#ef4444)',
                borderRadius: '20px',
                transition: 'width 1s ease',
                boxShadow: '0 0 10px rgba(59,130,246,0.5)'
              }} />
            </div>
            <div style={{
              marginTop: '0.5rem', fontSize: '1.5rem',
              fontWeight: 800, color: 'white'
            }}>{scorePercent}%</div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginBottom: '2rem' }}>
            <div style={{
              background: 'rgba(250,204,21,0.15)', border: '1px solid rgba(250,204,21,0.3)',
              borderRadius: '12px', padding: '0.75rem 1.5rem',
              color: '#facc15', fontWeight: 700, fontSize: '1rem'
            }}>
              ⭐ +{score * 15} XP earned
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={() => { setIndex(0); setScore(0); setState('question'); }}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.5rem',
                padding: '0.75rem 1.75rem', borderRadius: '12px',
                border: '1px solid rgba(255,255,255,0.15)',
                background: 'rgba(255,255,255,0.07)',
                color: 'white', fontWeight: 700, fontFamily: 'var(--font-main)',
                cursor: 'pointer', fontSize: '1rem'
              }}
            >
              <RotateCcw size={18} /> Retry Quiz
            </button>
            <button
              onClick={onClose}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.5rem',
                padding: '0.75rem 1.75rem', borderRadius: '12px',
                border: 'none', background: 'var(--accent-gradient)',
                color: 'white', fontWeight: 700, fontFamily: 'var(--font-main)',
                cursor: 'pointer', fontSize: '1rem'
              }}
            >
              Back to Dictionary
            </button>
          </div>
        </div>
      </Overlay>
    );
  }

  return (
    <Overlay onBackdropClick={undefined}>
      <div style={{ display: 'flex', flexDirection: 'column', maxHeight: '90vh', overflow: 'hidden' }}>

        {/* Quiz header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '1.25rem 1.75rem',
          borderBottom: '1px solid rgba(255,255,255,0.07)',
          background: 'rgba(255,255,255,0.03)'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Trophy size={18} color="#facc15" />
              <span style={{ fontWeight: 700, fontSize: '1rem' }}>Sign Quiz</span>
            </div>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', marginTop: '2px' }}>
              Question {index + 1} of {questions.length} · Score: {score}/{index + (state !== 'question' ? 1 : 0)}
            </div>
          </div>
          {/* Progress dots */}
          <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
            {questions.map((_, i) => (
              <div key={i} style={{
                width: i === index ? '20px' : '8px',
                height: '8px', borderRadius: '20px',
                background: i < index
                  ? '#22c55e'
                  : i === index
                    ? 'var(--accent-primary)'
                    : 'rgba(255,255,255,0.15)',
                transition: 'all 0.3s ease'
              }} />
            ))}
          </div>
        </div>

        {/* Video area */}
        <div style={{ background: '#000', position: 'relative' }}>
          <video
            ref={videoRef}
            src={current.videoUrl}
            autoPlay loop playsInline
            style={{ width: '100%', maxHeight: '380px', objectFit: 'contain', display: 'block' }}
          />
          {/* Hide the word — show category as a clue */}
          <div style={{
            position: 'absolute', bottom: '12px', left: '12px',
            background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(6px)',
            borderRadius: '8px', padding: '4px 12px',
            color: 'rgba(255,255,255,0.7)', fontSize: '0.8rem', fontWeight: 500
          }}>
            Category: {current.category}
          </div>
        </div>

        {/* Answer input */}
        <div style={{ padding: '1.5rem 1.75rem' }}>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem', fontSize: '0.95rem' }}>
            👀 Watch the sign and type what word it represents:
          </p>

          {state === 'question' && (
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <input
                ref={inputRef}
                value={guess}
                onChange={e => setGuess(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                placeholder="Type your answer..."
                style={{
                  flex: 1, padding: '0.75rem 1rem',
                  borderRadius: '10px', border: '1px solid rgba(255,255,255,0.15)',
                  background: 'rgba(255,255,255,0.06)', color: 'white',
                  fontFamily: 'var(--font-main)', fontSize: '1rem', outline: 'none'
                }}
              />
              <button
                onClick={handleSubmit}
                disabled={!guess.trim()}
                style={{
                  padding: '0.75rem 2rem', borderRadius: '10px',
                  border: 'none', background: 'var(--accent-gradient)',
                  color: 'white', fontWeight: 700, fontFamily: 'var(--font-main)',
                  cursor: guess.trim() ? 'pointer' : 'not-allowed',
                  opacity: guess.trim() ? 1 : 0.45, fontSize: '1rem'
                }}
              >
                Submit
              </button>
            </div>
          )}

          {state === 'correct' && (
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              gap: '1rem', flexWrap: 'wrap',
              background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.35)',
              borderRadius: '12px', padding: '1rem 1.25rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <CheckCircle2 size={24} color="#22c55e" />
                <div>
                  <div style={{ color: '#22c55e', fontWeight: 700, fontSize: '1.05rem' }}>
                    🎉 Correct! +15 XP
                  </div>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                    The sign was: <strong style={{ color: 'white' }}>{current.word}</strong>
                  </div>
                </div>
              </div>
              <button onClick={handleNext} style={{
                display: 'flex', alignItems: 'center', gap: '0.5rem',
                padding: '0.6rem 1.5rem', borderRadius: '10px',
                border: 'none', background: 'var(--accent-gradient)',
                color: 'white', fontWeight: 700, fontFamily: 'var(--font-main)',
                cursor: 'pointer', fontSize: '0.95rem'
              }}>
                {index + 1 < questions.length ? <><ArrowRight size={16} /> Next</> : <><Trophy size={16} /> See Results</>}
              </button>
            </div>
          )}

          {state === 'wrong' && (
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              gap: '1rem', flexWrap: 'wrap',
              background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)',
              borderRadius: '12px', padding: '1rem 1.25rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <XCircle size={24} color="#ef4444" />
                <div>
                  <div style={{ color: '#ef4444', fontWeight: 700, fontSize: '1.05rem' }}>
                    Not quite!
                  </div>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                    The answer was: <strong style={{ color: 'white' }}>{current.word}</strong>
                  </div>
                </div>
              </div>
              <button onClick={handleNext} style={{
                display: 'flex', alignItems: 'center', gap: '0.5rem',
                padding: '0.6rem 1.5rem', borderRadius: '10px',
                border: '1px solid rgba(255,255,255,0.15)',
                background: 'rgba(255,255,255,0.07)',
                color: 'white', fontWeight: 700, fontFamily: 'var(--font-main)',
                cursor: 'pointer', fontSize: '0.95rem'
              }}>
                {index + 1 < questions.length ? <><ArrowRight size={16} /> Next</> : <><Trophy size={16} /> See Results</>}
              </button>
            </div>
          )}
        </div>
      </div>
    </Overlay>
  );
};

// Reusable modal overlay
const Overlay: React.FC<{ children: React.ReactNode; onBackdropClick?: () => void }> = ({ children, onBackdropClick }) => (
  <div
    onClick={e => { if (e.target === e.currentTarget && onBackdropClick) onBackdropClick(); }}
    style={{
      position: 'fixed', inset: 0,
      background: 'rgba(2, 6, 23, 0.92)',
      backdropFilter: 'blur(16px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 1000, animation: 'fadeIn 0.2s ease'
    }}
  >
    <div style={{
      width: '92%', maxWidth: '820px', borderRadius: '24px',
      overflow: 'hidden',
      background: 'rgba(15, 23, 42, 0.97)',
      border: '1px solid rgba(255,255,255,0.12)',
      boxShadow: '0 40px 100px rgba(0,0,0,0.7)',
      animation: 'slideUp 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)'
    }}>
      {children}
    </div>
  </div>
);

export default QuizSession;
