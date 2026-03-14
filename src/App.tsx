import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from './components/layout/Sidebar';
import Dashboard from './pages/Dashboard';
import Dictionary from './pages/Dictionary';
import AIPractice from './pages/AIPractice';
import Landing from './pages/Landing';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import './App.css';

// Layout with sidebar (authenticated pages)
function AppLayout() {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', width: '100%' }}>
      <Sidebar />
      <main style={{
        flex: 1,
        padding: '2rem 3rem',
        maxWidth: '1200px',
        margin: '0 auto',
        height: '100vh',
        overflowY: 'auto'
      }}>
        <Routes>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/dictionary" element={<Dictionary />} />
          <Route path="/practice" element={<AIPractice />} />
        </Routes>
      </main>
    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/*" element={<AppLayout />} />
      </Routes>
    </Router>
  );
}

export default App;
