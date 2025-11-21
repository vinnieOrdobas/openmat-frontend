import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import apiClient from '../services/apiClient.js';
import useAuth from '../context/useAuth.js';
import Modal from '../components/Modal.jsx';

const BASE_URL = 'https://openmat-api.onrender.com';

// ... (ImageDisplay and ScheduleDisplay remain the same - keeping them short here) ...
const ImageDisplay = ({ logo, photos, academyName }) => {
  /* ... same code as before ... */
  const [selectedImageUrl, setSelectedImageUrl] = useState(null);
  const galleryImages = photos || [];
  const hasPhotos = galleryImages.length > 0;
  useEffect(() => {
    if (hasPhotos) { setSelectedImageUrl(`${BASE_URL}${galleryImages[0].url}`); } 
    else if (logo?.url) { setSelectedImageUrl(`${BASE_URL}${logo.url}`); }
  }, [logo, photos]);
  const displayUrl = selectedImageUrl || `https://placehold.co/1200x600/e0e0e0/999999?text=No+Photos`;

  return (
    <div style={{ marginBottom: '2rem' }}>
      <div style={{ width: '100%', height: '400px', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', marginBottom: '1rem', backgroundColor: '#f0f0f0' }}>
        <img src={displayUrl} alt={`${academyName} view`} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center' }} />
      </div>
      {hasPhotos && galleryImages.length > 1 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '0.5rem' }}>
          {galleryImages.map(photo => (
            <div key={photo.id} onClick={() => setSelectedImageUrl(`${BASE_URL}${photo.url}`)} style={{ height: '80px', borderRadius: '8px', overflow: 'hidden', cursor: 'pointer', border: selectedImageUrl === `${BASE_URL}${photo.url}` ? '2px solid #007bff' : '2px solid transparent' }}>
              <img src={`${BASE_URL}${photo.url}`} alt="Gallery" style={{ width: '100%', height: '100%', objectFit: 'cover' }}/>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const ScheduleDisplay = ({ schedules, onBook }) => {
  /* ... same code as before ... */
  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const groupedSchedules = schedules.reduce((acc, schedule) => {
    const day = days[schedule.day_of_week];
    if (!acc[day]) acc[day] = [];
    acc[day].push(schedule);
    return acc;
  }, {});

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
      {days.map(day => (
        groupedSchedules[day] ? (
          <div key={day} style={{ background: '#f9f9f9', padding: '1rem', borderRadius: '8px' }}>
            <strong style={{ display: 'block', marginBottom: '0.75rem', color: '#333', borderBottom: '1px solid #eee', paddingBottom: '0.25rem' }}>{day}</strong>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {groupedSchedules[day].map(s => (
                <li key={s.id} style={{ marginBottom: '0.75rem', paddingBottom: '0.75rem', borderBottom: '1px dashed #eee' }}>
                  <div style={{ fontWeight: 'bold', color: '#003580' }}>{s.start_time.substring(0, 5)} - {s.end_time.substring(0, 5)}</div>
                  <div style={{ fontSize: '0.9rem', marginBottom: '0.5rem' }}>{s.title}</div>
                  <button onClick={() => onBook(s.id)} style={{ width: '100%', padding: '0.4rem', fontSize: '0.85rem', background: 'white', color: '#003580', border: '1px solid #003580', borderRadius: '4px', cursor: 'pointer', fontWeight: '600' }} onMouseOver={(e) => { e.target.style.background = '#003580'; e.target.style.color = 'white'; }} onMouseOut={(e) => { e.target.style.background = 'white'; e.target.style.color = '#003580'; }}>Book Class</button>
                </li>
              ))}
            </ul>
          </div>
        ) : null
      ))}
    </div>
  );
};


function AcademyDetailPage() {
  const { id } = useParams(); 
  const [academy, setAcademy] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const { user } = useAuth();
  const navigate = useNavigate();

  const [modalOpen, setModalOpen] = useState(false);
  const [modalConfig, setModalConfig] = useState({ title: '', message: '', actions: null });

  useEffect(() => {
    const fetchAcademy = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await apiClient.get(`/academies/${id}`);
        setAcademy(response.data);
      } catch (err) {
        setError('Failed to fetch academy details.');
      } finally {
        setLoading(false);
      }
    };
    fetchAcademy();
  }, [id]);

  // --- Helper Functions ---

  const showAlert = (title, message) => {
    setModalConfig({
      title,
      message,
      actions: (
        <button onClick={() => setModalOpen(false)} style={{ padding: '0.5rem 1rem', background: '#003580', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>OK</button>
      )
    });
    setModalOpen(true);
  };

  // --- Execution Functions (Defined FIRST) ---

  const executeBuyPass = async (passId) => {
    try {
      setModalOpen(false);
      await apiClient.post('/orders', {
        order: { cart_items: [{ pass_id: passId, quantity: 1 }] }
      });
      navigate('/orders'); 
    } catch (err) {
      showAlert("Order Failed", err.response?.data?.errors || "Unknown error");
    }
  };

  const executeBooking = async (scheduleId) => {
    try {
      setModalOpen(false);
      await apiClient.post(`/academies/${id}/class_schedules/${scheduleId}/bookings`);
      showAlert("Success!", "Class booked successfully! Check your schedule.");
    } catch (err) {
      showAlert("Booking Failed", err.response?.data?.errors || "Unknown error. Do you have an active pass?");
    }
  };

  // --- Modal Triggers (Defined SECOND, using Execution functions) ---

  const confirmBuyPass = (passId) => {
    setModalConfig({
      title: "Confirm Purchase",
      message: "Do you want to add this pass to a new order?",
      actions: (
        <>
          <button onClick={() => setModalOpen(false)} style={{ padding: '0.5rem 1rem', background: 'white', border: '1px solid #ccc', borderRadius: '6px', cursor: 'pointer' }}>Cancel</button>
          <button onClick={() => executeBuyPass(passId)} style={{ padding: '0.5rem 1rem', background: '#003580', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', marginLeft: '0.5rem' }}>Add to Order</button>
        </>
      )
    });
    setModalOpen(true);
  };

  const confirmBooking = (scheduleId) => {
    setModalConfig({
      title: "Confirm Booking",
      message: "Do you want to use one of your active passes to book this class?",
      actions: (
        <>
          <button onClick={() => setModalOpen(false)} style={{ padding: '0.5rem 1rem', background: 'white', border: '1px solid #ccc', borderRadius: '6px', cursor: 'pointer' }}>Cancel</button>
          <button onClick={() => executeBooking(scheduleId)} style={{ padding: '0.5rem 1rem', background: '#003580', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', marginLeft: '0.5rem' }}>Confirm Booking</button>
        </>
      )
    });
    setModalOpen(true);
  };

  // --- Handlers ---

  const handleBuyPass = (passId) => {
    console.log("Add to Order clicked for pass:", passId); // Debug log
    if (!user) return navigate('/login');
    confirmBuyPass(passId);
  };

  const handleBookClass = (scheduleId) => {
    console.log("Book Class clicked for schedule:", scheduleId); // Debug log
    if (!user) return navigate('/login');
    confirmBooking(scheduleId);
  };

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading...</div>;
  if (error) return <div style={{ color: 'red', padding: '2rem' }}>{error}</div>;
  if (!academy) return <div>Academy not found.</div>;

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '1rem' }}>
      {/* Modal is rendered at the top level */}
      <Modal 
        isOpen={modalOpen} 
        onClose={() => setModalOpen(false)}
        title={modalConfig.title}
        actions={modalConfig.actions}
      >
        {modalConfig.message}
      </Modal>

      <Link to="/" style={{ display: 'inline-block', marginBottom: '1rem', color: '#666', textDecoration: 'none' }}>&larr; Back to all academies</Link>
      
      <ImageDisplay logo={academy.logo} photos={academy.photos} academyName={academy.name} />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '2rem', color: '#111' }}>{academy.name}</h1>
          <p style={{ color: '#666', margin: '0.5rem 0' }}>{academy.city}, {academy.country}</p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ background: '#003580', color: 'white', padding: '0.5rem 1rem', borderRadius: '8px 8px 8px 0', display: 'inline-block' }}>
            <span style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{academy.average_rating || 'N/A'}</span>
          </div>
          <div style={{ fontSize: '0.8rem', color: '#666', marginTop: '0.25rem' }}>{academy.reviews.length} reviews</div>
        </div>
      </div>
      
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2rem', alignItems: 'flex-start' }}>
        <div style={{ flex: '2 1 500px', minWidth: '300px' }}>
          <section style={{ marginBottom: '2rem' }}>
            <h3 style={{ borderBottom: '1px solid #eee', paddingBottom: '0.5rem' }}>About</h3>
            <p style={{ lineHeight: '1.6', color: '#444' }}>{academy.description}</p>
          </section>
          <section style={{ marginBottom: '2rem' }}>
            <h3 style={{ borderBottom: '1px solid #eee', paddingBottom: '0.5rem' }}>Amenities</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', marginTop: '1rem' }}>
              {academy.amenities.length > 0 ? (
                academy.amenities.map(amenity => (
                  <span key={amenity.id} style={{ background: '#f0f0f0', padding: '0.5rem 1rem', borderRadius: '20px', fontSize: '0.9rem', color: '#333' }}>{amenity.name}</span>
                ))
              ) : (<p style={{ color: '#999' }}>No amenities listed.</p>)}
            </div>
          </section>
          <section>
            <h3 style={{ borderBottom: '1px solid #eee', paddingBottom: '0.5rem', marginBottom: '1rem' }}>Reviews</h3>
            {academy.reviews.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {academy.reviews.map(review => (
                  <div key={review.id} style={{ background: '#f9f9f9', padding: '1rem', borderRadius: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                      <strong>@{review.username}</strong>
                      <span style={{ color: '#f59e0b' }}>{'★'.repeat(review.rating)}</span>
                    </div>
                    <p style={{ margin: 0, color: '#555' }}>{review.comment}</p>
                  </div>
                ))}
              </div>
            ) : (<p style={{ color: '#999' }}>No reviews yet.</p>)}
          </section>
        </div>

        <div style={{ flex: '1 1 300px', minWidth: '300px' }}>
           <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', border: '1px solid #eee', marginBottom: '1.5rem' }}>
            <h3 style={{ marginTop: 0 }}>Weekly Schedule</h3>
            {academy.class_schedules.length > 0 ? (
              <ScheduleDisplay schedules={academy.class_schedules} onBook={handleBookClass} />
            ) : (<p style={{ color: '#999' }}>No classes posted.</p>)}
          </div>

          <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', border: '1px solid #eee', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
            <h3 style={{ marginTop: 0 }}>Buy a Pass</h3>
            {academy.passes.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {academy.passes.map(pass => (
                  <div key={pass.id} style={{ border: '1px solid #eee', borderRadius: '8px', padding: '1rem', transition: 'border-color 0.2s' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.5rem' }}>
                      <strong style={{ fontSize: '1.1rem' }}>{pass.name}</strong>
                      <span style={{ color: '#003580', fontWeight: 'bold' }}>${(pass.price_cents / 100).toFixed(2)}</span>
                    </div>
                    <p style={{ fontSize: '0.9rem', color: '#666', margin: '0 0 1rem 0' }}>{pass.description}</p>
                    <button 
                      onClick={() => handleBuyPass(pass.id)}
                      style={{ width: '100%', padding: '0.75rem', background: '#003580', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}
                    >
                      Add to Order
                    </button>
                  </div>
                ))}
              </div>
            ) : (<p style={{ color: '#999' }}>No passes available.</p>)}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AcademyDetailPage;