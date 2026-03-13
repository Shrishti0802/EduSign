import { PlayCircle, CheckCircle, Lock, Trophy } from 'lucide-react';

const Lessons = () => {
  const modules = [
    {
      id: 1,
      title: 'Basics & Alphabet',
      description: 'Learn the foundational finger spelling alphabet and simple numbers.',
      progress: 100,
      status: 'completed',
      lessons: 5
    },
    {
      id: 2,
      title: 'Common Greetings',
      description: 'Master everyday greetings to start conversations with confidence.',
      progress: 65,
      status: 'in-progress',
      lessons: 4
    },
    {
      id: 3,
      title: 'Family & People',
      description: 'Signs for family members, relationships, and pronouns.',
      progress: 0,
      status: 'locked',
      lessons: 6
    },
    {
      id: 4,
      title: 'Food & Drink',
      description: 'Essential signs for ordering food and expressing hunger/thirst.',
      progress: 0,
      status: 'locked',
      lessons: 5
    }
  ];

  return (
    <div className="animate-fade-in" style={{ paddingBottom: '2rem', maxWidth: '900px', margin: '0 auto' }}>
      <header style={{ marginBottom: '3rem', textAlign: 'center' }}>
        <div style={{ 
          display: 'inline-flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          background: 'rgba(139, 92, 246, 0.15)',
          padding: '16px',
          borderRadius: '50%',
          marginBottom: '1rem'
        }}>
          <Trophy size={48} color="var(--accent-secondary)" />
        </div>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>Learning <span className="text-gradient">Path</span></h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto' }}>
          Follow our structured curriculum to master sign language step-by-step.
        </p>
      </header>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', position: 'relative' }}>
        {/* Connecting Line */}
        <div style={{
          position: 'absolute',
          top: '20px',
          bottom: '20px',
          left: '32px',
          width: '2px',
          background: 'var(--border-color)',
          zIndex: 0
        }}></div>

        {modules.map((mod) => (
          <div key={mod.id} style={{ display: 'flex', gap: '2rem', position: 'relative', zIndex: 1 }}>
            {/* Status Icon Indicator */}
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: mod.status === 'completed' ? 'var(--accent-primary)' :
                         mod.status === 'in-progress' ? 'var(--bg-primary)' : 
                         'var(--bg-secondary)',
              border: mod.status === 'in-progress' ? '2px solid var(--accent-gradient)' : 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              boxShadow: mod.status === 'in-progress' ? 'var(--shadow-glow)' : 'none',
              position: 'relative',
              zIndex: 2
            }}>
               {mod.status === 'completed' && <CheckCircle size={32} color="white" />}
               {mod.status === 'in-progress' && <PlayCircle size={32} color="var(--accent-primary)" fill="rgba(59, 130, 246, 0.2)" />}
               {mod.status === 'locked' && <Lock size={28} color="var(--text-secondary)" />}
            </div>

            {/* Module Card */}
            <div className={mod.status === 'locked' ? 'glass-panel' : 'glass-card'} style={{ 
              flex: 1, 
              padding: '2rem',
              opacity: mod.status === 'locked' ? 0.6 : 1,
              filter: mod.status === 'locked' ? 'grayscale(50%)' : 'none'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <div>
                  <div className="badge" style={{ marginBottom: '0.75rem', display: 'inline-block' }}>Module {mod.id}</div>
                  <h2 style={{ fontSize: '1.5rem' }}>{mod.title}</h2>
                </div>
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: 500 }}>{mod.lessons} Lessons</span>
              </div>
              
              <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', lineHeight: 1.6 }}>{mod.description}</p>
              
              {mod.status !== 'locked' && (
                <div>
                   <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.85rem' }}>
                     <span style={{ color: 'var(--text-secondary)' }}>Progress</span>
                     <span style={{ color: mod.status === 'completed' ? 'var(--accent-primary)' : 'var(--text-primary)', fontWeight: 'bold' }}>
                       {mod.progress}%
                     </span>
                   </div>
                   <div style={{ width: '100%', height: '8px', background: 'var(--bg-secondary)', borderRadius: '4px', overflow: 'hidden' }}>
                     <div style={{ 
                       width: `${mod.progress}%`, 
                       height: '100%', 
                       background: mod.status === 'completed' ? 'var(--accent-primary)' : 'var(--accent-gradient)',
                       transition: 'width 1s ease-in-out'
                     }}></div>
                   </div>
                   
                   {mod.status === 'in-progress' && (
                     <button className="btn-primary" style={{ marginTop: '1.5rem' }}>Continue Module</button>
                   )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Lessons;
