import React, { useState, useEffect, useRef } from 'react';
import apiClient from '../services/apiClient.js'; 
import { Link } from 'react-router-dom'; 

const BASE_URL = 'https://openmat-api.onrender.com';

// Helper constants
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

// --- Internal Component: Multi-Select Dropdown ---
// This allows selecting multiple items nicely
const MultiSelectDropdown = ({ label, options, selectedValues, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close if clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleOption = (value) => {
    const newValues = selectedValues.includes(value)
      ? selectedValues.filter(v => v !== value)
      : [...selectedValues, value];
    onChange(newValues);
  };

  return (
    <div ref={dropdownRef} style={{ position: 'relative', flex: '1 1 200px' }}>
      <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.85rem', fontWeight: 'bold', color: '#555' }}>
        {label}
      </label>
      <div 
        onClick={() => setIsOpen(!isOpen)}
        style={{
          padding: '0.75rem',
          borderRadius: '4px',
          border: '1px solid #ccc',
          backgroundColor: 'white',
          cursor: 'pointer',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
      >
        <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {selectedValues.length === 0 
            ? 'Select...' 
            : `${selectedValues.length} selected`}
        </span>
        <span style={{ fontSize: '0.8rem' }}>▼</span>
      </div>

      {isOpen && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          right: 0,
          zIndex: 10,
          backgroundColor: 'white',
          border: '1px solid #ccc',
          borderRadius: '4px',
          marginTop: '4px',
          maxHeight: '200px',
          overflowY: 'auto',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
        }}>
          {options.map(opt => (
            <div 
              key={opt.value} 
              onClick={() => toggleOption(opt.value)}
              style={{
                padding: '0.5rem',
                cursor: 'pointer',
                borderBottom: '1px solid #f0f0f0',
                backgroundColor: selectedValues.includes(opt.value) ? '#f0f9ff' : 'white',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              <input 
                type="checkbox" 
                checked={selectedValues.includes(opt.value)} 
                readOnly
                style={{ pointerEvents: 'none' }} 
              />
              <span style={{ fontSize: '0.9rem' }}>{opt.label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};


function AcademyListPage() {
  const [academies, setAcademies] = useState([]);
  
  // Options State
  const [amenityOptions, setAmenityOptions] = useState([]); 
  const [countryOptions, setCountryOptions] = useState([]); 
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // --- Search & Filter States (Arrays for Multi-select) ---
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAmenities, setSelectedAmenities] = useState([]);
  const [selectedPassTypes, setSelectedPassTypes] = useState([]); 
  const [selectedClassDays, setSelectedClassDays] = useState([]);
  const [selectedCountries, setSelectedCountries] = useState([]);

  useEffect(() => {
    const initData = async () => {
      try {
        setLoading(true);
        const [academiesRes, amenitiesRes, countriesRes] = await Promise.all([
          apiClient.get('/academies'),
          apiClient.get('/amenities'),
          apiClient.get('/countries')
        ]);
        
        setAcademies(academiesRes.data);
        
        // Transform amenities for dropdown
        setAmenityOptions(amenitiesRes.data.map(a => ({ value: a.id.toString(), label: a.name })));
        
        // Transform countries (API returns { value, label } objects already)
        setCountryOptions(countriesRes.data);
        
      } catch (err) {
        setError('Failed to load data.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    initData();
  }, []);

  const fetchAcademies = async (params = {}) => {
    try {
      setLoading(true);
      // Axios handles arrays correctly as 'key[]=value'
      const response = await apiClient.get('/academies', { params });
      setAcademies(response.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    
    // Map state to backend param names (plural)
    const params = { 
      term: searchTerm,
      amenity_ids: selectedAmenities,
      pass_types: selectedPassTypes,
      class_days: selectedClassDays,
      countries: selectedCountries // Map to backend 'country_ids'
    };

    // Clean empty arrays
    Object.keys(params).forEach(key => {
      if (Array.isArray(params[key]) && params[key].length === 0) {
        delete params[key];
      }
    });

    fetchAcademies(params);
  };

  const handleClear = () => {
    setSearchTerm('');
    setSelectedAmenities([]);
    setSelectedPassTypes([]);
    setSelectedClassDays([]);
    setSelectedCountries([]);
    fetchAcademies(); // Fetch all
  };

  const hasFilters = searchTerm || selectedAmenities.length > 0 || selectedPassTypes.length > 0 || selectedClassDays.length > 0 || selectedCountries.length > 0;

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading academies...</div>;
  if (error) return <div style={{ color: 'red', padding: '2rem' }}>{error}</div>;

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '1rem' }}>
      
      {/* --- Search & Filter Section --- */}
      <div style={{ marginBottom: '2rem', background: '#fff', padding: '1.5rem', borderRadius: '8px', border: '1px solid #eee' }}>
        <h2 style={{ marginBottom: '1rem', marginTop: 0, color: '#111' }}>Find an Academy</h2>
        
        <form onSubmit={handleSearch} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
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

          {/* Row 2: Multi-Select Filters */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
            
            <MultiSelectDropdown 
              label="Countries" 
              options={countryOptions} 
              selectedValues={selectedCountries} 
              onChange={setSelectedCountries} 
            />

            <MultiSelectDropdown 
              label="Amenities" 
              options={amenityOptions} 
              selectedValues={selectedAmenities} 
              onChange={setSelectedAmenities} 
            />

            <MultiSelectDropdown 
              label="Pass Types" 
              options={PASS_TYPES} 
              selectedValues={selectedPassTypes} 
              onChange={setSelectedPassTypes} 
            />

            <MultiSelectDropdown 
              label="Class Days" 
              options={DAYS} 
              selectedValues={selectedClassDays} 
              onChange={setSelectedClassDays} 
            />

          </div>

          {/* Row 3: Actions */}
          <div style={{ display: 'flex', gap: '0.5rem', paddingTop: '0.5rem' }}>
            <button type="submit" style={{ padding: '0.75rem 1.5rem', background: '#003580', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '1rem', fontWeight: 'bold' }}>
              Search
            </button>
            
            {hasFilters && (
              <button type="button" onClick={handleClear} style={{ padding: '0.75rem 1rem', background: '#f0f0f0', color: '#333', border: '1px solid #ccc', borderRadius: '4px', cursor: 'pointer' }}>
                Clear Filters
              </button>
            )}
          </div>
        </form>
      </div>

      {/* --- List Section --- */}
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