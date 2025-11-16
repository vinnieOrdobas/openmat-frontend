import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // We'll use this to redirect
import useAuth from '../context/useAuth.js'; // Import our new hook

function LoginPage() {
  // --- 1. State ---
  // We use 'useState' to store what the user types in the form.
  // We pre-fill them with our seed data to make testing faster.
  const [email, setEmail] = useState('student@example.com');
  const [password, setPassword] = useState('password');
  const [error, setError] = useState(''); // To store any login errors
  
  // --- 2. Context & Navigation ---
  // Get the 'login' function and 'user' state from our "brain"
  const { login, user } = useAuth();
  const navigate = useNavigate(); // This is React's tool for redirecting

  // --- 3. Submit Handler ---
  const handleSubmit = async (event) => {
    // This stops the browser from doing a full page reload
    event.preventDefault(); 
    setError(''); // Clear old errors

    try {
      // --- 4. Call the login function ---
      // This function is defined in AuthContext.js.
      // It calls the API, saves the token, and fetches the user.
      await login(email, password);
      
      // --- 5. Redirect on Success ---
      // If login() works, we redirect the user to their profile.
      navigate('/profile'); 

    } catch (err) {
      // --- 6. Handle Errors ---
      // If login() fails (e.g., wrong password), we get an error.
      // We'll get the error message from the API response.
      setError(err.response?.data?.error || 'An unknown error occurred.');
    }
  };

  // --- 7. Redirect if already logged in ---
  // If the 'user' object exists (from AuthContext),
  // don't even show the login form, just go to the profile.
  if (user) {
    navigate('/profile');
    return null; // Render nothing while redirecting
  }

  // --- 8. The JSX (HTML) for the form ---
  return (
    <div>
      <h2>Login</h2>
      {/* Show an error message if one exists */}
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
        <div style={{ marginBottom: '1rem' }}>
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