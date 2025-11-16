import React, { useState, useEffect } from 'react';
import apiClient from '../services/apiClient.js'; // Our API helper
import { Link } from 'react-router-dom'; // For linking to details

function AcademyListPage() {
  const [academies, setAcademies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // --- 2. Data Fetching ---
  useEffect(() => {
    const fetchAcademies = async () => {
      try {
        setLoading(true); 
        setError(null);
        const response = await apiClient.get('/academies');
        setAcademies(response.data);
      } catch (err) {
        setError('Failed to fetch academies. Please try again later.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchAcademies();
  }, []);

  if (loading) {
    return <div>Loading academies...</div>;
  }

  if (error) {
    return <div style={{ color: 'red' }}>{error}</div>;
  }
  
  return (
    <div>
      <h2>Academies</h2>
      {academies.length > 0 ? (
        <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
          {academies.map((academy) => (
            <div key={academy.id} style={{ border: '1px solid #ccc', background: 'white', padding: '1rem', borderRadius: '8px' }}>
              <h3>{academy.name}</h3>
              <p>{academy.city}, {academy.country}</p>
              <p style={{ fontStyle: 'italic', color: '#555' }}>
                {academy.description?.substring(0, 100)}...
              </p>
              {/* We'll make this route work next */}
              <Link to={`/academies/${academy.id}`}>View Details</Link>
            </div>
          ))}
        </div>
      ) : (
        <p>No academies found.</p>
      )}
    </div>
  );
}

export default AcademyListPage;