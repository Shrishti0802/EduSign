import { useState } from 'react';
import { Search, Filter } from 'lucide-react';
import SignCard from '../components/SignCard';
import { mockDictionaryData, getCategories } from '../lib/mockData';

const Dictionary = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  
  const categories = getCategories();

  const filteredSigns = mockDictionaryData.filter(sign => {
    const matchesSearch = sign.word.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || sign.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="animate-fade-in" style={{ paddingBottom: '2rem' }}>
      <header style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>Sign <span className="text-gradient">Dictionary</span></h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>
          Explore our comprehensive library of signs. Hover over a card to play the video.
        </p>
      </header>

      {/* Search and Filter Bar */}
      <div style={{ 
        display: 'flex', 
        gap: '1rem', 
        marginBottom: '2rem',
        flexWrap: 'wrap'
      }}>
        <div className="glass-panel" style={{ 
          display: 'flex', 
          alignItems: 'center', 
          padding: '0.5rem 1rem',
          flex: '1',
          minWidth: '250px'
        }}>
          <Search size={20} color="var(--text-secondary)" />
          <input 
            type="text" 
            placeholder="Search for a word or phrase..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-primary)',
              padding: '0.5rem 1rem',
              width: '100%',
              outline: 'none',
              fontFamily: 'var(--font-main)',
              fontSize: '1rem'
            }}
          />
        </div>
        
        <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '4px' }}>
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              style={{
                background: selectedCategory === category ? 'var(--accent-gradient)' : 'var(--bg-glass)',
                color: selectedCategory === category ? '#fff' : 'var(--text-secondary)',
                border: `1px solid ${selectedCategory === category ? 'transparent' : 'var(--border-color)'}`,
                padding: '0.5rem 1.25rem',
                borderRadius: '8px',
                cursor: 'pointer',
                fontFamily: 'var(--font-main)',
                fontWeight: 500,
                whiteSpace: 'nowrap',
                transition: 'all 0.2s ease'
              }}
            >
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
            <SignCard key={sign.id} sign={sign} />
          ))}
        </div>
      ) : (
        <div className="glass-panel" style={{ padding: '4rem', textAlign: 'center' }}>
          <Filter size={48} color="var(--text-secondary)" style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
          <h3>No signs found</h3>
          <p style={{ color: 'var(--text-secondary)' }}>Try adjusting your search or category filter.</p>
        </div>
      )}
    </div>
  );
};

export default Dictionary;
