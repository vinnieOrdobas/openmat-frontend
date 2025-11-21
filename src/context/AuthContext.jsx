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

  useEffect(() => {
    const fetchUser = async () => {
      try {
        if (token) {
          apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          const response = await apiClient.get('/profile');
          setUser(response.data); // Save user data
        }
      } catch (err) {
        console.error("Invalid token, logging out.", err);
        logout();
      } finally { 
        setLoading(false);
      }
    };

    fetchUser();
  }, [token]);


  // --- Login Function ---
  const login = async (email, password) => {
    const response = await apiClient.post('/login', {
      session: { email, password }
    });
    
    const { token } = response.data;
    
    localStorage.setItem('token', token);
    apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  
    setToken(token); 
  };
  
  const updateUser = (userData) => {
    setUser(userData);
  };

  const value = {
    token,
    user,
    isLoggedIn: !!user,
    loading,
    login,
    logout,
    updateUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export { AuthContext, AuthProvider };