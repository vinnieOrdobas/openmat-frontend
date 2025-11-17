import React from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import useAuth from './context/useAuth.js';

import LoginPage from './pages/LoginPage.jsx';
import ProfilePage from './pages/ProfilePage.jsx';
import AcademyListPage from './pages/AcademyListPage.jsx';
import AcademyDetailPage from './pages/AcademyDetailPage.jsx';

function App() {
  const { isLoggedIn, user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div>
      {/* --- Navigation (no changes) --- */}
      <nav style={{ padding: '1rem', background: '#eee', display: 'flex', justifyContent: 'space-between' }}>
        <div>
          <Link to="/" style={{ marginRight: '1rem' }}>Home (Academies)</Link>
          <Link to="/profile" style={{ marginRight: '1rem' }}>Profile</Link>
        </div>
        <div>
          {isLoggedIn ? (
            <>
              <span style={{ marginRight: '1rem' }}>Welcome, {user.username}!</span>
              <button onClick={handleLogout}>Logout</button>
            </>
          ) : (
            <Link to="/login">Login</Link>
          )}
        </div>
      </nav>

      {/* --- Page Content Area --- */}
      <main style={{ padding: '1rem' }}>
        <Routes>
          <Route path="/" element={<AcademyListPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          
          {/* --- 3. ADD THIS NEW ROUTE --- */}
          {/* This is a "dynamic route". The ':id' is a placeholder. */}
          {/* It will match /academies/1, /academies/2, etc. */}
          <Route path="/academies/:id" element={<AcademyDetailPage />} />
          
        </Routes>
      </main>
    </div>
  );
}

export default App;