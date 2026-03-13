import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from './components/layout/Sidebar';
import Dashboard from './pages/Dashboard';
import Dictionary from './pages/Dictionary';
import Lessons from './pages/Lessons';
import AIPractice from './pages/AIPractice';
import './App.css';

function App() {
  return (
    <Router>
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
            <Route path="/" element={<Dashboard />} />
            <Route path="/dictionary" element={<Dictionary />} />
            <Route path="/lessons" element={<Lessons />} />
            <Route path="/practice" element={<AIPractice />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
