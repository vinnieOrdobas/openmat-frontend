import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom'; // 1. Import useParams
import apiClient from '../services/apiClient.js';

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

  if (loading) {
    return <div>Loading academy details...</div>;
  }

  if (error) {
    return <div style={{ color: 'red' }}>{error}</div>;
  }

  if (!academy) {
    return <div>Academy not found.</div>;
  }

  return (
    <div>
      <Link to="/">&larr; Back to all academies</Link>
      
      <h2 style={{ marginTop: '1rem' }}>{academy.name}</h2>
      <p><strong>Rating:</strong> {academy.average_rating || 'N/A'} ({academy.reviews.length} reviews)</p>
      
      <div style={{ background: 'white', padding: '1rem', borderRadius: '8px', marginTop: '1rem' }}>
        <h3>Description</h3>
        <p>{academy.description}</p>
      </div>

      <div style={{ background: 'white', padding: '1rem', borderRadius: '8px', marginTop: '1rem' }}>
        <h3>Schedule</h3>
        {/* We'll fetch and render this later (Task 7, Story 2) */}
        <p><i>(Class schedule will be displayed here)</i></p>
      </div>

      <div style={{ background: 'white', padding: '1rem', borderRadius: '8px', marginTop: '1rem' }}>
        <h3>Passes</h3>
        {academy.passes.length > 0 ? (
          <ul>
            {academy.passes.map(pass => (
              <li key={pass.id}>
                <strong>{pass.name}</strong> (${(pass.price_cents / 100).toFixed(2)})
                <p style={{ color: '#555' }}><i>{pass.description}</i></p>
                {/* We'll add the "Buy" button here later */}
              </li>
            ))}
          </ul>
        ) : (
          <p>No passes listed for this academy.</p>
        )}
      </div>

      <div style={{ background: 'white', padding: '1rem', borderRadius: '8px', marginTop: '1rem' }}>
        <h3>Amenities</h3>
        {academy.amenities.length > 0 ? (
          <ul style={{ listStyle: 'none', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            {academy.amenities.map(amenity => (
              <li key={amenity.id} style={{ background: '#eee', padding: '0.25rem 0.5rem', borderRadius: '4px' }}>
                {amenity.name}
              </li>
            ))}
          </ul>
        ) : (
          <p>No amenities listed for this academy.</p>
        )}
      </div>

      <div style={{ background: 'white', padding: '1rem', borderRadius: '8px', marginTop: '1rem' }}>
        <h3>Reviews</h3>
        {academy.reviews.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {academy.reviews.map(review => (
              <div key={review.id} style={{ borderBottom: '1px solid #eee', paddingBottom: '1rem' }}>
                <strong>Rating: {review.rating}/5</strong>
                <p style={{ margin: '0.25rem 0' }}>{review.comment}</p>
                <small><i>&mdash; @{review.username}</i></small>
              </div>
            ))}
          </div>
        ) : (
          <p>No reviews yet.</p>
        )}
        {/* We'll add the "Leave a Review" form here later */}
      </div>

    </div>
  );
}

export default AcademyDetailPage;