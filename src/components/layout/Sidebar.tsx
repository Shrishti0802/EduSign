import { NavLink } from 'react-router-dom';
import { Home, Library, GraduationCap, Video, Settings } from 'lucide-react';

const Sidebar = () => {
  const navItems = [
    { name: 'Dashboard', path: '/', icon: <Home size={20} /> },
    { name: 'Dictionary', path: '/dictionary', icon: <Library size={20} /> },
    { name: 'Lessons', path: '/lessons', icon: <GraduationCap size={20} /> },
    { name: 'AI Practice', path: '/practice', icon: <Video size={20} /> },
  ];

  return (
    <aside className="glass-panel" style={{
      width: '280px',
      height: 'calc(100vh - 2rem)',
      margin: '1rem',
      display: 'flex',
      flexDirection: 'column',
      padding: '2rem 1.5rem',
      position: 'relative',
      zIndex: 10
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '3rem' }}>
        <div style={{ 
          background: 'var(--accent-gradient)', 
          width: '40px', 
          height: '40px', 
          borderRadius: '12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <span style={{ color: 'white', fontWeight: 'bold', fontSize: '1.2rem' }}>E</span>
        </div>
        <h1 style={{ fontSize: '1.5rem', margin: 0 }}>Edu<span className="text-gradient">Sign</span></h1>
      </div>

      <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px 16px',
              borderRadius: '12px',
              textDecoration: 'none',
              color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
              background: isActive ? 'rgba(59, 130, 246, 0.15)' : 'transparent',
              border: isActive ? '1px solid rgba(59, 130, 246, 0.3)' : '1px solid transparent',
              transition: 'all 0.2s ease',
              fontWeight: isActive ? 500 : 400
            })}
          >
            {item.icon}
            {item.name}
          </NavLink>
        ))}
      </nav>

      <div style={{ marginTop: 'auto', borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem' }}>
        <button style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          width: '100%',
          padding: '12px 16px',
          background: 'transparent',
          color: 'var(--text-secondary)',
          border: 'none',
          cursor: 'pointer',
          borderRadius: '12px',
          textAlign: 'left'
        }}>
          <Settings size={20} />
          Settings
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
