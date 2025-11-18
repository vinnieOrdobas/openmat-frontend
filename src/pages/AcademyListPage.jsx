import React, { useState, useEffect } from 'react';
import apiClient from '../services/apiClient.js'; 
import { Link } from 'react-router-dom'; 

const BASE_URL = 'https://openmat-api.onrender.com';

function AcademyListPage() {
  const [academies, setAcademies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [location, setLocation] = useState('');

  const fetchAcademies = async (params = {}) => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.get('/academies', { params });
      setAcademies(response.data);
    } catch (err) {
      setError('Failed to fetch academies. Please try again later.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAcademies();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchAcademies({ location });
  };

  const handleClear = () => {
    setLocation('');
    fetchAcademies();
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '1rem' }}>
      
      {/* --- Header & Search Section --- */}
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ marginBottom: '1rem', color: '#111' }}>Find an Academy</h2>
        
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          {/* --- UPDATED: Single Input Field --- */}
          <div style={{ flex: 1, position: 'relative' }}>
             <span style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', fontSize: '1.2rem' }}>
               🔍
             </span>
             <input
              type="text"
              placeholder="Where are you going? (e.g. Dublin, Ireland)"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              style={{ 
                width: '100%',
                padding: '0.75rem 0.75rem 0.75rem 2.5rem', 
                borderRadius: '4px', 
                border: '1px solid #ccc', 
                fontSize: '1rem'
              }}
            />
          </div>

          <button type="submit" style={{ padding: '0.5rem 1.5rem', background: '#003580', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '1rem', fontWeight: 'bold' }}>
            Search
          </button>
          
          {location && (
            <button type="button" onClick={handleClear} style={{ padding: '0.5rem 1rem', background: '#f0f0f0', color: '#333', border: '1px solid #ccc', borderRadius: '4px', cursor: 'pointer' }}>
              Clear
            </button>
          )}
        </form>
      </div>

      {/* --- List Section (Unchanged) --- */}
      {loading ? (
        <div style={{ padding: '2rem', textAlign: 'center' }}>Loading academies...</div>
      ) : error ? (
        <div style={{ color: 'red', padding: '2rem' }}>{error}</div>
      ) : academies.length > 0 ? (
        <div style={{ display: 'grid', gap: '1.5rem', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
          {academies.map((academy) => {
            const logoUrl = academy.logo?.url 
              ? `${BASE_URL}${academy.logo.url}` 
              : `https://placehold.co/100x100/f0f0f0/cccccc?text=No+Logo`;

            return (
              <div key={academy.id} style={{ 
                border: '1px solid #eee', 
                background: 'white', 
                borderRadius: '12px', 
                overflow: 'hidden',
                boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                display: 'flex',
                flexDirection: 'column'
              }}>
                <div style={{ padding: '1.5rem', flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                    <img 
                      src={logoUrl} 
                      alt={`${academy.name} logo`} 
                      style={{ 
                        width: '60px', 
                        height: '60px', 
                        objectFit: 'contain', 
                        borderRadius: '50%',
                        border: '1px solid #eee',
                        backgroundColor: '#fff'
                      }} 
                    />
                    <div>
                      <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#003580' }}>{academy.name}</h3>
                      <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.85rem', color: '#666' }}>
                        {academy.city}, {academy.country}
                      </p>
                    </div>
                  </div>
                  
                  <p style={{ 
                    fontSize: '0.9rem', 
                    color: '#555', 
                    lineHeight: '1.5',
                    marginBottom: '1.5rem',
                    display: '-webkit-box',
                    WebkitLineClamp: '3',
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden'
                  }}>
                    {academy.description || 'No description available.'}
                  </p>
                </div>

                <div style={{ 
                  background: '#f9f9f9', 
                  padding: '1rem', 
                  borderTop: '1px solid #eee',
                  textAlign: 'right'
                }}>
                   <Link 
                    to={`/academies/${academy.id}`}
                    style={{ 
                      textDecoration: 'none', 
                      color: '#003580', 
                      fontWeight: '600',
                      fontSize: '0.9rem'
                    }}
                  >
                    View Details &rarr;
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>
          <h3>No academies found.</h3>
          <p>Try adjusting your search to a different city or country.</p>
        </div>
      )}
    </div>
  );
}

export default AcademyListPage;