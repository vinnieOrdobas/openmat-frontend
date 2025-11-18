import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import apiClient from '../services/apiClient.js';

const BASE_URL = 'https://openmat-api.onrender.com';

const ImageDisplay = ({ logo, photos, academyName }) => {
  const [selectedImageUrl, setSelectedImageUrl] = useState(null);

  // Filter out the logo, only use photos for the gallery
  const galleryImages = photos || [];
  const hasPhotos = galleryImages.length > 0;

  useEffect(() => {
    if (hasPhotos) {
      // Default to the first photo
      setSelectedImageUrl(`${BASE_URL}${galleryImages[0].url}`);
    } else if (logo?.url) {
      // Fallback to logo ONLY if no photos exist
      setSelectedImageUrl(`${BASE_URL}${logo.url}`);
    }
  }, [logo, photos]);

  // If we have no images at all, show a placeholder
  const displayUrl = selectedImageUrl || `https://placehold.co/1200x600/e0e0e0/999999?text=No+Photos`;

  return (
    <div style={{ marginBottom: '2rem' }}>
      {/* Main Hero Image */}
      <div style={{ 
        width: '100%', 
        height: '400px', // Taller, more cinematic height
        borderRadius: '12px',
        overflow: 'hidden',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        marginBottom: '1rem'
      }}>
        <img 
          src={displayUrl} 
          alt={`${academyName} view`} 
          style={{ 
            width: '100%', 
            height: '100%', 
            objectFit: 'cover', // This fills the container (no grey bars)
            objectPosition: 'center' 
          }} 
        />
      </div>

      {/* Thumbnail Strip */}
      {hasPhotos && galleryImages.length > 1 && (
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', 
          gap: '0.5rem' 
        }}>
          {galleryImages.map(photo => {
            const fullUrl = `${BASE_URL}${photo.url}`;
            const isSelected = selectedImageUrl === fullUrl;
            
            return (
              <div 
                key={photo.id}
                onClick={() => setSelectedImageUrl(fullUrl)}
                style={{
                  height: '80px',
                  borderRadius: '8px',
                  overflow: 'hidden',
                  cursor: 'pointer',
                  opacity: isSelected ? 1 : 0.6,
                  border: isSelected ? '2px solid #222' : '2px solid transparent',
                  transition: 'all 0.2s ease'
                }}
              >
                <img 
                  src={fullUrl}
                  alt="Gallery thumbnail"
                  style={{ 
                    width: '100%', 
                    height: '100%', 
                    objectFit: 'cover' 
                  }}
                />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

const ScheduleDisplay = ({ schedules }) => {
  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  
  const groupedSchedules = schedules.reduce((acc, schedule) => {
    const day = days[schedule.day_of_week];
    if (!acc[day]) acc[day] = [];
    acc[day].push(schedule);
    return acc;
  }, {});

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1rem' }}>
      {days.map(day => (
        groupedSchedules[day] ? (
          <div key={day} style={{ background: '#f9f9f9', padding: '0.75rem', borderRadius: '8px' }}>
            <strong style={{ display: 'block', marginBottom: '0.5rem', color: '#333' }}>{day}</strong>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {groupedSchedules[day].map(s => (
                <li key={s.id} style={{ fontSize: '0.85rem', marginBottom: '0.25rem', color: '#555' }}>
                  {s.start_time} - {s.end_time}<br/>
                  <span style={{ fontWeight: 500 }}>{s.title}</span>
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

  useEffect(() => {
    const fetchAcademy = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await apiClient.get(`/academies/${id}`);
        setAcademy(response.data);
      } catch (err) {
        setError('Failed to fetch academy details.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchAcademy();
  }, [id]);

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading...</div>;
  if (error) return <div style={{ color: 'red', padding: '2rem' }}>{error}</div>;
  if (!academy) return <div>Academy not found.</div>;

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '1rem' }}>
      <Link to="/" style={{ display: 'inline-block', marginBottom: '1rem', color: '#666', textDecoration: 'none' }}>
        &larr; Back to all academies
      </Link>
      
      {/* Photos Section */}
      <ImageDisplay logo={academy.logo} photos={academy.photos} academyName={academy.name} />

      {/* Header Section */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '2rem', color: '#111' }}>{academy.name}</h1>
          <p style={{ color: '#666', margin: '0.5rem 0' }}>{academy.city}, {academy.country}</p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ background: '#003580', color: 'white', padding: '0.5rem 1rem', borderRadius: '8px 8px 8px 0', display: 'inline-block' }}>
            <span style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{academy.average_rating || 'N/A'}</span>
          </div>
          <div style={{ fontSize: '0.8rem', color: '#666', marginTop: '0.25rem' }}>
            {academy.reviews.length} reviews
          </div>
        </div>
      </div>
      
      {/* Main Content Layout - Responsive Flexbox */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2rem', alignItems: 'flex-start' }}>
        
        {/* Left Column (Info, Amenities, Reviews) */}
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
                  <span key={amenity.id} style={{ 
                    background: '#f0f0f0', 
                    padding: '0.5rem 1rem', 
                    borderRadius: '20px',
                    fontSize: '0.9rem',
                    color: '#333'
                  }}>
                    {amenity.name}
                  </span>
                ))
              ) : (
                <p style={{ color: '#999' }}>No amenities listed.</p>
              )}
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
            ) : (
              <p style={{ color: '#999' }}>No reviews yet.</p>
            )}
          </section>
        </div>

        {/* Right Column (Schedule, Passes) - Sticky-ish behavior on desktop */}
        <div style={{ flex: '1 1 300px', minWidth: '300px' }}>
           {/* Schedule */}
           <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', border: '1px solid #eee', marginBottom: '1.5rem' }}>
            <h3 style={{ marginTop: 0 }}>Weekly Schedule</h3>
            {academy.class_schedules.length > 0 ? (
              <ScheduleDisplay schedules={academy.class_schedules} />
            ) : (
              <p style={{ color: '#999' }}>No classes posted.</p>
            )}
          </div>

          {/* Passes */}
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
                      disabled 
                      style={{ 
                        width: '100%', 
                        padding: '0.75rem', 
                        background: '#003580', 
                        color: 'white', 
                        border: 'none', 
                        borderRadius: '6px', 
                        fontWeight: 'bold', 
                        opacity: 0.7, 
                        cursor: 'not-allowed' 
                      }}
                    >
                      Add to Order
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ color: '#999' }}>No passes available.</p>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

export default AcademyDetailPage;