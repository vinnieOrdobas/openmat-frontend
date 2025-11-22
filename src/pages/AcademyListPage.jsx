import React, { useState, useEffect } from 'react';
import apiClient from '../services/apiClient.js'; 
import { Link } from 'react-router-dom'; 

const BASE_URL = 'https://openmat-api.onrender.com';

// Helper constants for dropdowns
const DAYS = [
  { value: '0', label: 'Sunday' },
  { value: '1', label: 'Monday' },
  { value: '2', label: 'Tuesday' },
  { value: '3', label: 'Wednesday' },
  { value: '4', label: 'Thursday' },
  { value: '5', label: 'Friday' },
  { value: '6', label: 'Saturday' },
];

const PASS_TYPES = [
  { value: 'single', label: 'Single Drop-in' },
  { value: 'day_pass', label: 'Day Pass' },
  { value: 'week_pass', label: 'Week Pass' },
  { value: 'month_pass', label: 'Month Pass' },
  { value: 'punch_card', label: 'Punch Card' },
];

function AcademyListPage() {
  // --- Data State ---
  const [academies, setAcademies] = useState([]);
  const [amenities, setAmenities] = useState([]); 
  const [countries, setCountries] = useState([]); // <--- NEW: Store countries
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // --- Search & Filter States ---
  const [searchTerm, setSearchTerm] = useState(''); // Smart Search
  const [selectedAmenity, setSelectedAmenity] = useState('');
  const [selectedPassType, setSelectedPassType] = useState(''); 
  const [selectedClassDay, setSelectedClassDay] = useState('');
  const [selectedCountry, setSelectedCountry] = useState(''); // <--- NEW: Country Filter

  // --- Initial Data Load ---
  useEffect(() => {
    const initData = async () => {
      try {
        setLoading(true);
        // Fetch Academies, Amenities, AND Countries in parallel
        const [academiesRes, amenitiesRes, countriesRes] = await Promise.all([
          apiClient.get('/academies'),
          apiClient.get('/amenities'),
          apiClient.get('/countries')
        ]);
        
        setAcademies(academiesRes.data);
        setAmenities(amenitiesRes.data);
        setCountries(countriesRes.data);
      } catch (err) {
        setError('Failed to load data.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    initData();
  }, []);

  // --- Filter Logic ---
  const fetchAcademies = async (params = {}) => {
    try {
      setLoading(true);
      // Filter out empty values to keep URL clean
      const cleanParams = Object.fromEntries(
        Object.entries(params).filter(([_, v]) => v !== '' && v !== null)
      );
      
      const response = await apiClient.get('/academies', { params: cleanParams });
      setAcademies(response.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchAcademies({ 
      term: searchTerm, // Smart Search
      amenity_id: selectedAmenity,
      pass_type: selectedPassType,
      class_day: selectedClassDay,
      country: selectedCountry
    });
  };

  const handleClear = () => {
    setSearchTerm('');
    setSelectedAmenity('');
    setSelectedPassType('');
    setSelectedClassDay('');
    setSelectedCountry('');
    fetchAcademies();
  };

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading academies...</div>;
  if (error) return <div style={{ color: 'red', padding: '2rem' }}>{error}</div>;

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '1rem' }}>
      
      {/* --- Search & Filter Section --- */}
      <div style={{ marginBottom: '2rem', background: '#fff', padding: '1.5rem', borderRadius: '8px', border: '1px solid #eee' }}>
        <h2 style={{ marginBottom: '1rem', marginTop: 0, color: '#111' }}>Find an Academy</h2>
        
        <form onSubmit={handleSearch} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          
          {/* Row 1: Smart Search Bar */}
          <div style={{ position: 'relative' }}>
             <span style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', fontSize: '1.2rem' }}>🔍</span>
             <input
              type="text"
              placeholder="Search by Name, City, or Keyword..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ width: '100%', padding: '0.75rem 0.75rem 0.75rem 2.5rem', borderRadius: '4px', border: '1px solid #ccc', fontSize: '1rem' }}
            />
          </div>

          {/* Row 2: Filters Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem' }}>
            
            {/* Country Filter */}
            <select
              value={selectedCountry}
              onChange={(e) => setSelectedCountry(e.target.value)}
              style={{ padding: '0.75rem', borderRadius: '4px', border: '1px solid #ccc', backgroundColor: 'white' }}
            >
              <option value="">All Countries</option>
              {countries.map(c => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>

            {/* Amenity Filter */}
            <select
              value={selectedAmenity}
              onChange={(e) => setSelectedAmenity(e.target.value)}
              style={{ padding: '0.75rem', borderRadius: '4px', border: '1px solid #ccc', backgroundColor: 'white' }}
            >
              <option value="">All Amenities</option>
              {amenities.map(amenity => (
                <option key={amenity.id} value={amenity.id}>{amenity.name}</option>
              ))}
            </select>

            {/* Pass Type Filter */}
            <select
              value={selectedPassType}
              onChange={(e) => setSelectedPassType(e.target.value)}
              style={{ padding: '0.75rem', borderRadius: '4px', border: '1px solid #ccc', backgroundColor: 'white' }}
            >
              <option value="">All Pass Types</option>
              {PASS_TYPES.map(type => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>

            {/* Class Day Filter */}
            <select
              value={selectedClassDay}
              onChange={(e) => setSelectedClassDay(e.target.value)}
              style={{ padding: '0.75rem', borderRadius: '4px', border: '1px solid #ccc', backgroundColor: 'white' }}
            >
              <option value="">Any Day</option>
              {DAYS.map(day => (
                <option key={day.value} value={day.value}>{day.label}</option>
              ))}
            </select>
          </div>

          {/* Row 3: Actions */}
          <div style={{ display: 'flex', gap: '0.5rem', paddingTop: '0.5rem' }}>
            <button type="submit" style={{ padding: '0.75rem 1.5rem', background: '#003580', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '1rem', fontWeight: 'bold' }}>
              Search
            </button>
            
            {(searchTerm || selectedAmenity || selectedPassType || selectedClassDay || selectedCountry) && (
              <button type="button" onClick={handleClear} style={{ padding: '0.75rem 1rem', background: '#f0f0f0', color: '#333', border: '1px solid #ccc', borderRadius: '4px', cursor: 'pointer' }}>
                Clear Filters
              </button>
            )}
          </div>
        </form>
      </div>

      {/* --- List Section (Unchanged) --- */}
      {academies.length > 0 ? (
        <div style={{ display: 'grid', gap: '1.5rem', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
          {academies.map((academy) => {
            const logoUrl = academy.logo?.url 
              ? `${BASE_URL}${academy.logo.url}` 
              : `https://placehold.co/100x100/f0f0f0/cccccc?text=No+Logo`;

            return (
              <div key={academy.id} style={{ border: '1px solid #eee', background: 'white', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column' }}>
                <div style={{ padding: '1.5rem', flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                    <img src={logoUrl} alt="Logo" style={{ width: '60px', height: '60px', objectFit: 'contain', borderRadius: '50%', border: '1px solid #eee', backgroundColor: '#fff' }} />
                    <div>
                      <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#003580' }}>{academy.name}</h3>
                      <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.85rem', color: '#666' }}>{academy.city}, {academy.country}</p>
                    </div>
                  </div>
                  <p style={{ fontSize: '0.9rem', color: '#555', lineHeight: '1.5', marginBottom: '1.5rem', display: '-webkit-box', WebkitLineClamp: '3', WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {academy.description || 'No description available.'}
                  </p>
                  
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    {academy.amenities.slice(0, 3).map(am => (
                      <span key={am.id} style={{ fontSize: '0.75rem', background: '#f4f4f4', padding: '2px 6px', borderRadius: '4px', color: '#666' }}>{am.name}</span>
                    ))}
                  </div>
                </div>
                <div style={{ background: '#f9f9f9', padding: '1rem', borderTop: '1px solid #eee', textAlign: 'right' }}>
                   <Link to={`/academies/${academy.id}`} style={{ textDecoration: 'none', color: '#003580', fontWeight: '600', fontSize: '0.9rem' }}>View Details &rarr;</Link>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>
          <h3>No academies found.</h3>
          <p>Try adjusting your search terms.</p>
        </div>
      )}
    </div>
  );
}

export default AcademyListPage;