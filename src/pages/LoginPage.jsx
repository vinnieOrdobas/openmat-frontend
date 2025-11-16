import React, { useState, useEffect } from 'react'; // 1. We must import useEffect
import { useNavigate } from 'react-router-dom';
import useAuth from '../context/useAuth.js';

function LoginPage() {
  const [email, setEmail] = useState('student@example.com');
  const [password, setPassword] = useState('password');
  const [error, setError] = useState('');
  
  const { login, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/profile');
    }
  }, [user, navigate]);

  const handleSubmit = async (event) => {
    event.preventDefault(); 
    setError('');

    try {
      await login(email, password);
      
      navigate('/profile'); 

    } catch (err) {
      setError(err.response?.data?.error || 'An unknown error occurred.');
    }
  };

  if (user) {
    return null;
  }

  return (
    <div>
      <h2>Login</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '1rem' }}>
          <label htmlFor="email">Email: </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{ padding: '0.25rem' }}
          />
        </div>
        <div style={{ marginBottom: '1.rem' }}>
          <label htmlFor="password">Password: </label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{ padding: '0.25rem' }}
          />
        </div>
        <button type="submit" style={{ padding: '0.5rem 1rem' }}>
          Login
        </button>
      </form>
    </div>
  );
}

export default LoginPage;