import React from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import useAuth from './context/useAuth.js';

import LoginPage from './pages/LoginPage.jsx';
import ProfilePage from './pages/ProfilePage.jsx';
import AcademyListPage from './pages/AcademyListPage.jsx';
import AcademyDetailPage from './pages/AcademyDetailPage.jsx';
import OrderHistoryPage from './pages/OrderHistoryPage.jsx';
// --- 1. Import New Page ---
import OwnerDashboardPage from './pages/OwnerDashboardPage.jsx';

function App() {
  const { isLoggedIn, user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login'); 
  };

  return (
    <div>
      <nav style={{ padding: '1rem', background: '#eee', display: 'flex', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <Link to="/" style={{ fontWeight: 'bold', color: '#333', textDecoration: 'none' }}>OpenMat</Link>
          <Link to="/">Academies</Link>
          {isLoggedIn && <Link to="/orders">My Orders</Link>}
          
          {/* --- 2. Show Dashboard Link ONLY for Owners --- */}
          {isLoggedIn && user?.role === 'owner' && (
             <Link to="/dashboard" style={{ color: '#003580', fontWeight: 'bold' }}>Manage Academy</Link>
          )}
        </div>
        
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          {isLoggedIn ? (
            <>
              <Link to="/profile">Profile</Link>
              <span style={{ color: '#666' }}>|</span>
              <button onClick={handleLogout} style={{ background: 'none', border: 'none', color: '#333', cursor: 'pointer', textDecoration: 'underline' }}>Logout</button>
            </>
          ) : (
            <Link to="/login">Login</Link>
          )}
        </div>
      </nav>

      <main style={{ padding: '1rem' }}>
        <Routes>
          <Route path="/" element={<AcademyListPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/academies/:id" element={<AcademyDetailPage />} />
          <Route path="/orders" element={<OrderHistoryPage />} />
          
          {/* --- 3. Add Route --- */}
          <Route path="/dashboard" element={<OwnerDashboardPage />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;