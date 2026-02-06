import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchTenantCities, bulkAddCities } from '../../../store/tenantAdminSlice'; 
import './CitySetup.css';

const CitySetup = () => {
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth); 
  const { cities, loading } = useSelector(state => state.tenantAdmin);
  
  const [countryCode, setCountryCode] = useState('');
  const [bulkJson, setBulkJson] = useState('');
  const [selectedCity, setSelectedCity] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    if (user?.tenant_id) {
      dispatch(fetchTenantCities(user.tenant_id));
    }
  }, [user, dispatch]);

  const handleBulkSubmit = (e) => {
    e.preventDefault();
    try {
      const parsedCities = JSON.parse(bulkJson);
      dispatch(bulkAddCities({
        tenantId: user.tenant_id,
        countryCode: countryCode.toUpperCase(),
        cities: parsedCities
      }));
      setBulkJson('');
      setCountryCode('');
      setShowForm(false);
    } catch (err) {
      alert("Invalid JSON format. Check your city array.");
    }
  };

  const filteredCities = cities.filter(city => 
    city.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    city.country_code?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const groupedCities = filteredCities.reduce((acc, city) => {
    const country = city.country_code || 'Unknown';
    if (!acc[country]) acc[country] = [];
    acc[country].push(city);
    return acc;
  }, {});

  return (
    <div className="cs-root">
      {/* Left Panel - City Browser */}
      <div className="cs-browser-pane">
        <div className="cs-browser-header">
          <div className="cs-header-top">
            <h3>Regional Coverage</h3>
            <button 
              className="cs-add-btn" 
              onClick={() => setShowForm(!showForm)}
              title="Add New Cities"
            >
              {showForm ? '✕' : '+'}
            </button>
          </div>
          <div className="cs-search-box">
            <span className="cs-search-icon">🔍</span>
            <input 
              type="text" 
              placeholder="Search cities or countries..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="cs-stats">
            <div className="cs-stat-item">
              <span className="cs-stat-value">{cities.length}</span>
              <span className="cs-stat-label">Active Cities</span>
            </div>
            <div className="cs-stat-item">
              <span className="cs-stat-value">{Object.keys(groupedCities).length}</span>
              <span className="cs-stat-label">Countries</span>
            </div>
          </div>
        </div>

        <div className="cs-city-list">
          {Object.keys(groupedCities).length === 0 ? (
            <div className="cs-empty-state">
              <div className="cs-empty-icon">🌍</div>
              <p>No cities found</p>
              <small>Try adjusting your search or add new cities</small>
            </div>
          ) : (
            Object.entries(groupedCities).map(([country, citiesInCountry]) => (
              <div key={country} className="cs-country-group">
                <div className="cs-country-header">
                  <span className="cs-country-flag">{country}</span>
                  <span className="cs-country-count">{citiesInCountry.length} cities</span>
                </div>
                <div className="cs-cities-in-country">
                  {citiesInCountry.map(city => (
                    <div 
                      key={city.city_id} 
                      className={`cs-city-item ${selectedCity?.city_id === city.city_id ? 'selected' : ''}`}
                      onClick={() => setSelectedCity(city)}
                    >
                      <div className="cs-city-item-main">
                        <strong>{city.name}</strong>
                        <span className="cs-city-tz">{city.timezone}</span>
                      </div>
                      <span className="cs-city-currency">{city.currency}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Right Panel - Details or Form */}
      <div className="cs-detail-pane">
        {showForm ? (
          <div className="cs-form-container">
            <div className="cs-form-header">
              <h3>Add New Cities</h3>
              <p>Bulk onboard cities to expand your operational coverage</p>
            </div>
            <form onSubmit={handleBulkSubmit} className="cs-bulk-form">
              <div className="cs-field">
                <label>Country Code (ISO-2)</label>
                <input 
                  type="text" 
                  placeholder="e.g. IN, US, GB" 
                  maxLength={2} 
                  value={countryCode} 
                  onChange={e => setCountryCode(e.target.value.toUpperCase())} 
                  required 
                />
                <span className="cs-hint">Two-letter ISO country code</span>
              </div>
              <div className="cs-field">
                <label>City JSON Array</label>
                <textarea 
                  value={bulkJson} 
                  onChange={e => setBulkJson(e.target.value)} 
                  placeholder='[
  {
    "name": "Mumbai",
    "timezone": "Asia/Kolkata",
    "currency": "INR"
  },
  {
    "name": "Delhi",
    "timezone": "Asia/Kolkata",
    "currency": "INR"
  }
]' 
                  required 
                />
                <span className="cs-hint">JSON array of city objects with name, timezone, and currency</span>
              </div>
              <div className="cs-form-actions">
                <button 
                  type="button" 
                  className="cs-cancel-btn" 
                  onClick={() => setShowForm(false)}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="cs-submit-btn" 
                  disabled={loading}
                >
                  {loading ? 'Processing...' : 'Onboard Cities'}
                </button>
              </div>
            </form>
          </div>
        ) : selectedCity ? (
          <div className="cs-city-details">
            <div className="cs-detail-header">
              <div className="cs-detail-title">
                <h2>{selectedCity.name}</h2>
                <span className="cs-detail-country">{selectedCity.country_code}</span>
              </div>
              <span className="cs-status-badge active">Active</span>
            </div>

            <div className="cs-detail-content">
              <div className="cs-detail-section">
                <h4>Location Information</h4>
                <div className="cs-detail-grid">
                  <div className="cs-detail-item">
                    <span className="cs-detail-label">City ID</span>
                    <span className="cs-detail-value">#{selectedCity.city_id}</span>
                  </div>
                  <div className="cs-detail-item">
                    <span className="cs-detail-label">Country Code</span>
                    <span className="cs-detail-value">{selectedCity.country_code || 'N/A'}</span>
                  </div>
                  <div className="cs-detail-item">
                    <span className="cs-detail-label">Timezone</span>
                    <span className="cs-detail-value">{selectedCity.timezone}</span>
                  </div>
                  <div className="cs-detail-item">
                    <span className="cs-detail-label">Currency</span>
                    <span className="cs-detail-value">{selectedCity.currency}</span>
                  </div>
                </div>
              </div>

              <div className="cs-detail-section">
                <h4>Operational Status</h4>
                <div className="cs-status-grid">
                  <div className="cs-status-card">
                    <div className="cs-status-icon">🚗</div>
                    <div className="cs-status-info">
                      <span className="cs-status-title">Active Vehicles</span>
                      <span className="cs-status-number">---</span>
                    </div>
                  </div>
                  <div className="cs-status-card">
                    <div className="cs-status-icon">👥</div>
                    <div className="cs-status-info">
                      <span className="cs-status-title">Active Drivers</span>
                      <span className="cs-status-number">---</span>
                    </div>
                  </div>
                  <div className="cs-status-card">
                    <div className="cs-status-icon">🏢</div>
                    <div className="cs-status-info">
                      <span className="cs-status-title">Fleet Partners</span>
                      <span className="cs-status-number">---</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="cs-detail-section">
                <h4>Regional Settings</h4>
                <div className="cs-settings-list">
                  <div className="cs-setting-item">
                    <span>🌍 Locale</span>
                    <span>{selectedCity.country_code?.toLowerCase() || 'en'}-{selectedCity.name.substring(0, 2).toLowerCase()}</span>
                  </div>
                  <div className="cs-setting-item">
                    <span>💱 Base Currency</span>
                    <span>{selectedCity.currency}</span>
                  </div>
                  <div className="cs-setting-item">
                    <span>🕐 Time Format</span>
                    <span>24-hour</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="cs-placeholder">
            <div className="cs-placeholder-icon">🗺️</div>
            <h3>Select a City</h3>
            <p>Choose a city from the list to view detailed information and manage regional settings.</p>
            <button className="cs-placeholder-btn" onClick={() => setShowForm(true)}>
              + Add New Cities
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CitySetup;