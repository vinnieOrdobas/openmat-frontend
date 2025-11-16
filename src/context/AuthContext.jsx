import React, { createContext, useState, useEffect } from 'react';
import apiClient from '../services/apiClient.js';

// 1. Create the context
const AuthContext = createContext();

// 2. Create the "Provider" component
function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // --- Logout Function (MOVED) ---
  const logout = () => {
    localStorage.removeItem('token');
    if (apiClient.defaults.headers.common['Authorization']) {
      delete apiClient.defaults.headers.common['Authorization'];
    }
    setToken(null);
    setUser(null);
  };

  // --- THIS IS THE CORRECTED BLOCK ---
  useEffect(() => {
    const fetchUser = async () => {
      try {
        // Only run this if we have a token
        if (token) {
          apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          const response = await apiClient.get('/profile');
          setUser(response.data); // Save user data
        }
      } catch (err) {
        // If token is invalid or expired
        console.error("Invalid token, logging out.", err);
        logout();
      } finally {
        // --- THIS IS THE FIX ---
        // This 'finally' block will run *no matter what*:
        // - if 'token' was null
        // - if 'try' succeeded
        // - if 'catch' ran
        // This guarantees we always stop loading.
        setLoading(false);
      }
    };

    fetchUser();
  }, [token]);
  // --- END CORRECTED BLOCK ---


  // --- Login Function ---
  const login = async (email, password) => {
    const response = await apiClient.post('/login', {
      session: { email, password }
    });
    
    const { token } = response.data;
    
    localStorage.setItem('token', token);
    apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    
    // We set the token, which triggers the 'useEffect' above
    // to run again, which will fetch the profile and set the user.
    setToken(token); 
  };

  // 3. The value our app will consume
  const value = {
    token,
    user,
    isLoggedIn: !!user,
    loading,
    login,
    logout,
  };

  // 4. The Render
  return (
    <AuthContext.Provider value={value}>
      {/* Now, this works:
        1. Initial render: loading=true, shows nothing.
        2. useEffect runs, hits 'finally', calls setLoading(false).
        3. Re-renders: loading=false, shows children (the app).
      */}
      {!loading && children}
    </AuthContext.Provider>
  );
}

export { AuthContext, AuthProvider };