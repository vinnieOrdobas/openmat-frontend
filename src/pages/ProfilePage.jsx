import React, { useState } from 'react';
import useAuth from '../context/useAuth.js';
import apiClient from '../services/apiClient.js';
import { Navigate, Link } from 'react-router-dom';
import Modal from '../components/Modal.jsx'; // 1. Import Modal

// Helper to format the day/time nicely
const formatSchedule = (schedule) => {
  if (!schedule) return "Time N/A";
  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  return `${days[schedule.day_of_week]}s at ${schedule.start_time.substring(0, 5)}`;
};

function ProfilePage() {
  const { user, isLoggedIn, loading, updateUser } = useAuth();
  
  // Editing State
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstname: '',
    lastname: '',
    belt_rank: ''
  });
  const [editError, setEditError] = useState(null);

  // 2. Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [modalConfig, setModalConfig] = useState({ title: '', message: '', actions: null });

  // 3. Helper to show modal
  const showAlert = (title, message) => {
    setModalConfig({
      title,
      message,
      actions: (
        <button 
          onClick={() => setModalOpen(false)}
          style={{ padding: '0.5rem 1rem', background: '#003580', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
        >
          OK
        </button>
      )
    });
    setModalOpen(true);
  };

  // Load user data into form when editing starts
  const startEditing = () => {
    setFormData({
      firstname: user.firstname || '',
      lastname: user.lastname || '',
      belt_rank: user.belt_rank || ''
    });
    setIsEditing(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setEditError(null);

    try {
      const response = await apiClient.patch('/profile', {
        user: formData
      });
      
      // Update global auth state with new user data
      updateUser(response.data);
      setIsEditing(false);
      
      // 4. Use Modal instead of alert
      showAlert("Success", "Profile updated successfully!");

    } catch (err) {
      console.error("Update failed", err);
      setEditError(err.response?.data?.errors?.join(", ") || "Failed to update profile.");
    }
  };

  if (loading) return <div style={{ padding: '2rem' }}>Loading...</div>;
  if (!isLoggedIn) return <Navigate to="/login" replace />;

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '1rem' }}>
      {/* 5. Render Modal */}
      <Modal 
        isOpen={modalOpen} 
        onClose={() => setModalOpen(false)}
        title={modalConfig.title}
        actions={modalConfig.actions}
      >
        {modalConfig.message}
      </Modal>

      <h2 style={{ marginBottom: '1.5rem' }}>My Profile</h2>
      
      <div style={{ display: 'grid', gap: '2rem', gridTemplateColumns: '1fr' }}>
        
        {/* User Info Card */}
        <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', border: '1px solid #eee', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
          
          {!isEditing ? (
            // --- VIEW MODE ---
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '1rem' }}>
                <div style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: '#003580', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', fontWeight: 'bold' }}>
                  {user.firstname?.[0]}{user.lastname?.[0]}
                </div>
                <div>
                  <h3 style={{ margin: 0 }}>{user.firstname} {user.lastname}</h3>
                  <p style={{ color: '#666', margin: '0.25rem 0' }}>@{user.username}</p>
                  <div style={{ display: 'inline-block', background: '#eee', padding: '0.25rem 0.75rem', borderRadius: '20px', fontSize: '0.85rem', marginTop: '0.5rem' }}>
                    {user.belt_rank ? `${user.belt_rank.charAt(0).toUpperCase() + user.belt_rank.slice(1)} Belt` : 'No Rank'}
                  </div>
                </div>
                <button 
                  onClick={startEditing}
                  style={{ marginLeft: 'auto', padding: '0.5rem 1rem', border: '1px solid #ccc', background: 'white', borderRadius: '6px', cursor: 'pointer' }}
                >
                  Edit Profile
                </button>
              </div>
              <div style={{ borderTop: '1px solid #eee', paddingTop: '1rem' }}>
                 <p><strong>Email:</strong> {user.email}</p>
                 <p><strong>Role:</strong> {user.role}</p>
              </div>
            </>
          ) : (
            // --- EDIT MODE ---
            <form onSubmit={handleSave}>
              <h3 style={{ marginTop: 0 }}>Edit Profile</h3>
              {editError && <p style={{ color: 'red' }}>{editError}</p>}
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.9rem' }}>First Name</label>
                  <input 
                    type="text" 
                    value={formData.firstname} 
                    onChange={(e) => setFormData({...formData, firstname: e.target.value})}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.9rem' }}>Last Name</label>
                  <input 
                    type="text" 
                    value={formData.lastname} 
                    onChange={(e) => setFormData({...formData, lastname: e.target.value})}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.9rem' }}>Belt Rank</label>
                <select 
                  value={formData.belt_rank} 
                  onChange={(e) => setFormData({...formData, belt_rank: e.target.value})}
                  style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }}
                >
                  <option value="">Select Rank</option>
                  <option value="white">White</option>
                  <option value="blue">Blue</option>
                  <option value="purple">Purple</option>
                  <option value="brown">Brown</option>
                  <option value="black">Black</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                <button 
                  type="button" 
                  onClick={() => setIsEditing(false)}
                  style={{ padding: '0.5rem 1rem', border: '1px solid #ccc', background: 'white', borderRadius: '6px', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  style={{ padding: '0.5rem 1rem', background: '#003580', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
                >
                  Save Changes
                </button>
              </div>
            </form>
          )}
        </div>

        {/* My Bookings Section (Unchanged) */}
        <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', border: '1px solid #eee', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
          <h3 style={{ marginTop: 0, marginBottom: '1rem' }}>My Scheduled Classes</h3>
          
          {user.bookings && user.bookings.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {user.bookings.map(booking => (
                <div key={booking.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f0f0f0', paddingBottom: '1rem' }}>
                  <div>
                    <strong style={{ display: 'block', fontSize: '1.1rem', color: '#003580' }}>
                      {booking.class_schedule?.title || "Unknown Class"}
                    </strong>
                    <span style={{ color: '#555' }}>
                      {formatSchedule(booking.class_schedule)}
                    </span>
                    <div style={{ fontSize: '0.85rem', color: '#888', marginTop: '0.25rem' }}>
                      Booked on: {new Date(booking.created_at).toLocaleDateString()}
                    </div>
                  </div>
                  <div>
                    {booking.class_schedule?.academy_id ? (
                      <Link 
                        to={`/academies/${booking.class_schedule.academy_id}`}
                        style={{ padding: '0.5rem 1rem', background: '#f0f0f0', color: '#333', textDecoration: 'none', borderRadius: '6px', fontSize: '0.9rem' }}
                      >
                        View Gym
                      </Link>
                    ) : (
                      <span style={{ color: '#999', fontSize: '0.9rem' }}>Unavailable</span>
                    )}
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