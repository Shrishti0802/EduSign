import { TrendingUp, BookOpen, Clock, Activity, Video } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useGameState } from '../lib/gameState';

const Dashboard = () => {
  const gameState = useGameState();
  const storedUser = localStorage.getItem('edusign_user');
  const userName = storedUser ? JSON.parse(storedUser).name : 'Learner';

  const stats = [
    { label: 'Signs Learned', value: gameState.learnedSigns.size.toString(), icon: <BookOpen className="text-gradient" size={24} />, trend: 'Keep growing!' },
    { label: 'Current Streak', value: `${gameState.streak} Days`, icon: <TrendingUp className="text-gradient" size={24} />, trend: 'Keep it up!' },
    { label: 'Total XP', value: gameState.xp.toString(), icon: <Clock className="text-gradient" size={24} />, trend: `Level ${gameState.level}` },
    { label: 'Current Level', value: gameState.level.toString(), icon: <Activity className="text-gradient" size={24} />, trend: 'Keep practicing!' },
  ];

  return (
    <div className="animate-fade-in" style={{ paddingBottom: '2rem' }}>
      <header style={{ marginBottom: '3rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>Welcome back, <span className="text-gradient">{userName}!</span> 👋</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>Ready to continue your sign language journey today?</p>
        </div>
        <div className="badge">Level {gameState.level}</div>
      </header>

      {/* Stats Grid */}
      <section style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', 
        gap: '1.5rem',
        marginBottom: '3rem'
      }}>
        {stats.map((stat, index) => (
          <div key={index} className="glass-card" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
              <div style={{ 
                background: 'rgba(59, 130, 246, 0.1)', 
                padding: '12px', 
                borderRadius: '12px' 
              }}>
                {stat.icon}
              </div>
            </div>
            <h3 style={{ fontSize: '2rem', marginBottom: '0.25rem' }}>{stat.value}</h3>
            <p style={{ color: 'var(--text-secondary)', fontWeight: 500, marginBottom: '0.5rem' }}>{stat.label}</p>
            <p style={{ fontSize: '0.85rem', color: 'var(--accent-primary)' }}>{stat.trend}</p>
          </div>
        ))}
      </section>

      {/* Quick Actions & Recent */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
        <section>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.5rem' }}>Recent Dictionary Additions</h2>
            <Link to="/dictionary" style={{ color: 'var(--accent-primary)', textDecoration: 'none', fontWeight: 500 }}>View Dictionary</Link>
          </div>
          
          <div className="glass-card" style={{ 
            padding: '2rem', 
            display: 'flex', 
            gap: '2rem', 
            alignItems: 'center',
            background: 'linear-gradient(145deg, var(--bg-glass), rgba(16, 185, 129, 0.05))'
          }}>
            <div style={{ 
              width: '120px', 
              height: '120px', 
              borderRadius: '16px', 
              background: 'var(--bg-secondary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              overflow: 'hidden'
            }}>
               <div style={{ fontSize: '4rem' }}>👋</div>
            </div>
            
            <div style={{ flex: 1 }}>
              <div className="badge" style={{ display: 'inline-block', marginBottom: '0.5rem', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.2)' }}>New Signs</div>
              <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Greetings & People</h3>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '0', lineHeight: 1.5 }}>
                New signs like "Friend", "Family", and "Water" have been added to the dictionary. Check them out!
              </p>
            </div>
            
            <Link to="/dictionary">
              <button className="btn-primary" style={{ background: 'var(--accent-secondary)' }}>Learn Now</button>
            </Link>
          </div>
        </section>

        <section>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.5rem' }}>Daily Challenge</h2>
          </div>
          <div className="glass-card" style={{ padding: '2rem', textAlign: 'center' }}>
             <div style={{ 
               width: '80px', 
               height: '80px', 
               borderRadius: '50%', 
               background: 'rgba(139, 92, 246, 0.1)', 
               margin: '0 auto 1.5rem',
               display: 'flex',
               alignItems: 'center',
               justifyContent: 'center'
             }}>
               <Video size={36} color="var(--accent-secondary)" />
             </div>
             <h3 style={{ marginBottom: '1rem' }}>AI Practice Session</h3>
             <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', fontSize: '0.95rem' }}>
               Spend 5 minutes practicing your signs with our real-time AI feedback tool.
             </p>
             <Link to="/practice" style={{ width: '100%', display: 'block' }}>
               <button className="btn-primary" style={{ width: '100%' }}>Start Camera</button>
             </Link>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Dashboard;
