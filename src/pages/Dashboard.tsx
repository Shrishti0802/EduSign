import { Play, TrendingUp, BookOpen, Clock, Activity, Video } from 'lucide-react';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const stats = [
    { label: 'Signs Learned', value: '124', icon: <BookOpen className="text-gradient" size={24} />, trend: '+12 this week' },
    { label: 'Current Streak', value: '5 Days', icon: <TrendingUp className="text-gradient" size={24} />, trend: 'Keep it up!' },
    { label: 'Practice Time', value: '4.2 hrs', icon: <Clock className="text-gradient" size={24} />, trend: '+1.5 hrs this week' },
    { label: 'Accuracy', value: '89%', icon: <Activity className="text-gradient" size={24} />, trend: 'Top 15% of learners' },
  ];

  return (
    <div className="animate-fade-in" style={{ paddingBottom: '2rem' }}>
      <header style={{ marginBottom: '3rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>Welcome back, <span className="text-gradient">Alex!</span> 👋</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>Ready to continue your sign language journey today?</p>
        </div>
        <div className="badge">Intermediate Level</div>
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
            <h2 style={{ fontSize: '1.5rem' }}>Continue Learning</h2>
            <Link to="/lessons" style={{ color: 'var(--accent-primary)', textDecoration: 'none', fontWeight: 500 }}>View All</Link>
          </div>
          
          <div className="glass-card" style={{ 
            padding: '2rem', 
            display: 'flex', 
            gap: '2rem', 
            alignItems: 'center',
            background: 'linear-gradient(145deg, var(--bg-glass), rgba(59, 130, 246, 0.05))'
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
               <img src="https://images.unsplash.com/photo-1527525443983-6e60c75fff50?auto=format&fit=crop&q=80&w=300" alt="lesson thumbnail" style={{width: '100%', height: '100%', objectFit: 'cover', opacity: 0.6}} />
               <div style={{position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(15,23,42,0.8), transparent)'}}></div>
               <Play size={32} color="white" style={{position: 'absolute'}} />
            </div>
            
            <div style={{ flex: 1 }}>
              <div className="badge" style={{ display: 'inline-block', marginBottom: '0.5rem' }}>Module 4</div>
              <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Common Greetings & Phrases</h3>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', lineHeight: 1.5 }}>
                Master the essential phrases for everyday conversation. Perfect your hand shape and motion.
              </p>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ flex: 1, height: '6px', background: 'var(--bg-secondary)', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{ width: '65%', height: '100%', background: 'var(--accent-gradient)' }}></div>
                </div>
                <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>65%</span>
              </div>
            </div>
            
            <Link to="/lessons">
              <button className="btn-primary">Resume Lesson</button>
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
