import { useState } from 'react';
import { Search, Filter, Star, Gamepad2 } from 'lucide-react';
import SignCard from '../components/SignCard';
import VideoModal from '../components/VideoModal';
import XPBar from '../components/XPBar';
import QuizSession from '../components/QuizSession';
import { mockDictionaryData, getCategories, type SignData } from '../lib/mockData';
import { useGameState } from '../lib/gameState';


const Dictionary = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedSign, setSelectedSign] = useState<SignData | null>(null);
  const [showQuiz, setShowQuiz] = useState(false);
  const gameState = useGameState();
  const categories = getCategories();

  const filteredSigns = mockDictionaryData.filter(sign => {
    const matchesSearch = sign.word.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || sign.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const learnedCount = mockDictionaryData.filter(s => gameState.isLearned(s.id)).length;

  return (
    <div className="animate-fade-in" style={{ paddingBottom: '2rem' }}>

      {/* Header */}
      <header style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>
          Sign <span className="text-gradient">Dictionary</span>
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>
          Explore signs, mark what you've learned, and quiz yourself to earn XP!
        </p>
      </header>

      {/* XP / Progress Bar */}
      <XPBar
        xp={gameState.xp}
        level={gameState.level}
        streak={gameState.streak}
        learnedCount={learnedCount}
        totalCount={mockDictionaryData.length}
      />

      {/* Quiz Banner Feature */}
      {learnedCount >= 4 && (
        <div style={{
          marginBottom: '2rem', padding: '1rem 1.5rem', borderRadius: '16px',
          background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.3)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          flexWrap: 'wrap', gap: '1rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{
              width: '40px', height: '40px', borderRadius: '10px',
              background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 0 12px rgba(59,130,246,0.4)'
            }}>
              <Gamepad2 size={20} color="white" />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Ready for a Challenge?</h3>
              <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                You've learned {learnedCount} signs! Test your knowledge and earn XP.
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowQuiz(true)}
            className="btn-primary"
            style={{ padding: '0.6rem 1.5rem', fontSize: '0.95rem' }}
          >
            Take Quiz
          </button>
        </div>
      )}


      {/* Search and Filter */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
        <div className="glass-panel" style={{
          display: 'flex', alignItems: 'center',
          padding: '0.5rem 1rem', flex: '1', minWidth: '250px'
        }}>
          <Search size={20} color="var(--text-secondary)" />
          <input
            type="text"
            placeholder="Search for a word or phrase..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              background: 'transparent', border: 'none', color: 'var(--text-primary)',
              padding: '0.5rem 1rem', width: '100%', outline: 'none',
              fontFamily: 'var(--font-main)', fontSize: '1rem'
            }}
          />
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '4px' }}>
          {categories.map(category => (
            <button key={category} onClick={() => setSelectedCategory(category)} style={{
              background: selectedCategory === category ? 'var(--accent-gradient)' : 'var(--bg-glass)',
              color: selectedCategory === category ? '#fff' : 'var(--text-secondary)',
              border: `1px solid ${selectedCategory === category ? 'transparent' : 'var(--border-color)'}`,
              padding: '0.5rem 1.25rem', borderRadius: '8px', cursor: 'pointer',
              fontFamily: 'var(--font-main)', fontWeight: 500,
              whiteSpace: 'nowrap', transition: 'all 0.2s ease'
            }}>
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Signs */}
      {filteredSigns.length > 0 ? (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '1.5rem'
        }}>
          {filteredSigns.map(sign => (
            <SignCard key={sign.id} sign={sign} onClick={setSelectedSign} gameState={gameState} />
          ))}
        </div>
      ) : (
        <div className="glass-panel" style={{ padding: '4rem', textAlign: 'center' }}>
          <Filter size={48} color="var(--text-secondary)" style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
          <h3>No signs found</h3>
          <p style={{ color: 'var(--text-secondary)' }}>Try adjusting your search or category filter.</p>
        </div>
      )}

      {/* Fullscreen Video Modal */}
      {selectedSign && (
        <VideoModal
          sign={selectedSign}
          allSigns={filteredSigns.length > 0 ? filteredSigns : mockDictionaryData}
          onClose={() => setSelectedSign(null)}
        />
      )}

      {/* Batch Quiz Session */}
      {showQuiz && (
        <QuizSession
          signs={mockDictionaryData.filter(s => gameState.isLearned(s.id))}
          gameState={gameState}
          onClose={() => setShowQuiz(false)}
        />
      )}
    </div>
  );
};

export default Dictionary;
