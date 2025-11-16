import React from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import useAuth from './context/useAuth.js';

// --- 1. Import our REAL components ---
import LoginPage from './pages/LoginPage.jsx';
import ProfilePage from './pages/ProfilePage.jsx';

// --- 2. Keep this as a placeholder for now ---
const AcademyListPage = () => <h2>Academy List Page</h2>;


function App() {
  const { isLoggedIn, user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login'); // Redirect to login after logout
  };

  return (
    <div>
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

      <main style={{ padding: '1rem' }}>
        <Routes>
          <Route path="/" element={<AcademyListPage />} />
          <Route path="/login" element={<LoginPage />} />
          {/* --- 3. This now uses our real ProfilePage component --- */}
          <Route path="/profile" element={<ProfilePage />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;