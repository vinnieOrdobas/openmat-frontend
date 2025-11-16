import React from 'react';
import useAuth from '../context/useAuth.js'; // Import our hook
import { Navigate } from 'react-router-dom'; // Import for redirection

function ProfilePage() {
  // 1. Get the current user, login status, and loading status
  const { user, isLoggedIn, loading } = useAuth();

  // 2. Handle loading state (while AuthContext checks token)
  if (loading) {
    return <div>Loading...</div>;
  }

  // 3. Handle not logged in (This is our "Protected Route" logic)
  if (!isLoggedIn) {
    // This component will automatically redirect to /login
    // if no user is found.
    return <Navigate to="/login" replace />;
  }

  // 4. If loading is done and user is logged in, show profile
  return (
    <div>
      <h2>My Profile</h2>
      <div style={{ background: 'white', padding: '1rem', borderRadius: '8px' }}>
        <p><strong>Username:</strong> {user.username}</p>
        <p><strong>Email:</strong> {user.email}</p>
        <p><strong>Name:</strong> {user.firstname} {user.lastname}</p>
        <p><strong>Role:</strong> {user.role}</p>
        <p><strong>Belt:</strong> {user.belt_rank || 'Not set'}</p>
      </div>
      {/* We will add the 'Edit Profile' form here later (Epic 6) */}
    </div>
  );
}

export default ProfilePage;