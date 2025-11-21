import React from 'react';
import useAuth from '../context/useAuth.js';
import { Navigate, Link } from 'react-router-dom';

// Helper to format the day/time nicely
const formatSchedule = (schedule) => {
  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  return `${days[schedule.day_of_week]}s at ${schedule.start_time.substring(0, 5)}`;
};

function ProfilePage() {
  const { user, isLoggedIn, loading } = useAuth();

  if (loading) return <div style={{ padding: '2rem' }}>Loading...</div>;
  if (!isLoggedIn) return <Navigate to="/login" replace />;

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '1rem' }}>
      <h2 style={{ marginBottom: '1.5rem' }}>My Profile</h2>
      
      <div style={{ display: 'grid', gap: '2rem', gridTemplateColumns: '1fr' }}>
        
        {/* --- User Info Card --- */}
        <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', border: '1px solid #eee', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '1rem' }}>
            {/* Avatar Placeholder (or real image if we had one) */}
            <div style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: '#003580', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', fontWeight: 'bold' }}>
              {user.firstname[0]}{user.lastname[0]}
            </div>
            <div>
              <h3 style={{ margin: 0 }}>{user.firstname} {user.lastname}</h3>
              <p style={{ color: '#666', margin: '0.25rem 0' }}>@{user.username}</p>
              <div style={{ display: 'inline-block', background: '#eee', padding: '0.25rem 0.75rem', borderRadius: '20px', fontSize: '0.85rem', marginTop: '0.5rem' }}>
                {user.belt_rank ? `${user.belt_rank.charAt(0).toUpperCase() + user.belt_rank.slice(1)} Belt` : 'No Rank'}
              </div>
            </div>
          </div>
          <div style={{ borderTop: '1px solid #eee', paddingTop: '1rem' }}>
             <p><strong>Email:</strong> {user.email}</p>
             <p><strong>Role:</strong> {user.role}</p>
          </div>
        </div>

        {/* --- NEW: My Bookings Section --- */}
        <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', border: '1px solid #eee', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
          <h3 style={{ marginTop: 0, marginBottom: '1rem' }}>My Scheduled Classes</h3>
          
          {user.bookings && user.bookings.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {user.bookings.map(booking => (
                <div key={booking.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f0f0f0', paddingBottom: '1rem' }}>
                  <div>
                    <strong style={{ display: 'block', fontSize: '1.1rem', color: '#003580' }}>
                      {booking.class_schedule.title}
                    </strong>
                    <span style={{ color: '#555' }}>
                      {formatSchedule(booking.class_schedule)}
                    </span>
                    <div style={{ fontSize: '0.85rem', color: '#888', marginTop: '0.25rem' }}>
                      Booked on: {new Date(booking.created_at).toLocaleDateString()}
                    </div>
                  </div>
                  <div>
                    <Link 
                      to={`/academies/${booking.class_schedule.academy_id}`}
                      style={{ padding: '0.5rem 1rem', background: '#f0f0f0', color: '#333', textDecoration: 'none', borderRadius: '6px', fontSize: '0.9rem' }}
                    >
                      View Gym
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>
              <p>You haven't booked any classes yet.</p>
              <Link to="/" style={{ color: '#003580', fontWeight: 'bold' }}>Browse Academies</Link>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

export default ProfilePage;