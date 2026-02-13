import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchTenantCities,
  fetchAvailableCities,
  addCityWithFare,
  fetchCityFareConfigs,
  updateFareConfig,
  clearAvailableCities,
  clearCityFareConfigs,
} from '../../../store/tenantAdminSlice';
import './CitySetup.css';


const CATEGORIES = ['BIKE', 'AUTO', 'CAB'];

const CAT_META = {
  BIKE: { icon: '🛵', label: 'Bike' },
  AUTO: { icon: '🛺', label: 'Auto' },
  CAB:  { icon: '🚗', label: 'Cab'  },
};

const FARE_FIELDS = [
  { key: 'base_fare',                   label: 'Base Fare',    prefix: '₹' },
  { key: 'per_km_rate',                 label: 'Per KM',       prefix: '₹' },
  { key: 'per_min_rate',                label: 'Per Min',      prefix: '₹' },
  { key: 'minimum_fare',                label: 'Min Fare',     prefix: '₹' },
  { key: 'platform_commission_percent', label: 'Commission',   prefix: '%' },
];

const emptyFares = () =>
  CATEGORIES.reduce((acc, cat) => ({
    ...acc,
    [cat]: {
      base_fare: '',
      per_km_rate: '',
      per_min_rate: '',
      minimum_fare: '',
      platform_commission_percent: '',
    },
  }), {});


const PANEL = {
  IDLE:      'IDLE',
  VIEW:      'VIEW',
  ADD_STEP1: 'ADD_STEP1',   
  ADD_STEP2: 'ADD_STEP2',   
};


const CitySetup = () => {
  const dispatch = useDispatch();

  
  const profile  = useSelector((s) => s.tenantAdmin.profile);
  const {
    cities,
    availableCities,
    cityFareConfigs,
    loading,
    fareLoading,
  } = useSelector((s) => s.tenantAdmin);

  const tenantId       = profile?.tenant_id;
  const tenantCountries = profile?.countries ?? [];  

  
  const [panel,        setPanel]        = useState(PANEL.IDLE);
  const [selectedCity, setSelectedCity] = useState(null);
  const [search,       setSearch]       = useState('');

  
  const [countryCode,  setCountryCode]  = useState('');
  const [pickedCity,   setPickedCity]   = useState(null);
  const [newFares,     setNewFares]     = useState(emptyFares());
  const [addError,     setAddError]     = useState('');

  
  const [editFares,    setEditFares]    = useState({});
  const [savingCat,    setSavingCat]    = useState(null);

  
  useEffect(() => {
    if (tenantId) {
      dispatch(fetchTenantCities(tenantId));
    }
  }, [tenantId, dispatch]);

  
  useEffect(() => {
    console.log("cityFareConfigs:", cityFareConfigs);
    if (!cityFareConfigs.length) return;
    const map = {};
    cityFareConfigs.forEach((fc) => {
      map[fc.vehicle_category] = {
        fare_config_id:              fc.fare_config_id,
        base_fare:                   String(fc.base_fare),
        per_km_rate:                 String(fc.per_km_rate),
        per_min_rate:                String(fc.per_min_rate),
        minimum_fare:                String(fc.minimum_fare),
        platform_commission_percent: String(fc.platform_commission_percent),
      };
    });
    setEditFares(map);
  }, [cityFareConfigs]);

  
  const handleCityClick = (city) => {
    setSelectedCity(city);
    setPanel(PANEL.VIEW);
    dispatch(clearCityFareConfigs());
    setEditFares({});
    dispatch(fetchCityFareConfigs({ tenantId, cityId: city.city_id }));
  };

  
  const openAddFlow = () => {
    setPanel(PANEL.ADD_STEP1);
    setCountryCode('');
    setPickedCity(null);
    setNewFares(emptyFares());
    setAddError('');
    setSelectedCity(null);
    dispatch(clearAvailableCities());
  };

  
  const handleSelectCountry = (code) => {
    setCountryCode(code);
    setPickedCity(null);
    setAddError('');
    dispatch(clearAvailableCities());

    dispatch(fetchAvailableCities({ tenantId, countryCode: code }))
      .unwrap()
      .then(() => setPanel(PANEL.ADD_STEP2))
      .catch((msg) => setAddError(msg || 'Failed to fetch available cities.'));
  };

  
  const handleNewFareChange = (cat, key, val) => {
    setNewFares((prev) => ({ ...prev, [cat]: { ...prev[cat], [key]: val } }));
  };

  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!pickedCity) { setAddError('Please select a city.'); return; }

    const fare_configs = CATEGORIES.map((cat) => {
      const f = newFares[cat];
      return {
        vehicle_category:            cat,
        base_fare:                   parseFloat(f.base_fare),
        per_km_rate:                 parseFloat(f.per_km_rate),
        per_min_rate:                parseFloat(f.per_min_rate),
        minimum_fare:                parseFloat(f.minimum_fare),
        platform_commission_percent: parseFloat(f.platform_commission_percent),
      };
    });

    const hasNaN = fare_configs.some((fc) =>
      Object.values(fc).some((v) => typeof v === 'number' && isNaN(v))
    );
    if (hasNaN) { setAddError('Fill all fare fields with valid numbers.'); return; }

    setAddError('');

    dispatch(addCityWithFare({
      tenantId,
      countryCode: countryCode.toUpperCase(),
      body: {
        name:     pickedCity.name,
        timezone: pickedCity.timezone,
        currency: pickedCity.currency,
        fare_configs,
      },
    }))
      .unwrap()
      .then(() => {
        setPanel(PANEL.IDLE);
        setCountryCode('');
        setPickedCity(null);
        setNewFares(emptyFares());
        dispatch(clearAvailableCities());
      })
      .catch((msg) => setAddError(msg || 'Failed to onboard city.'));
  };

  
  const handleEditFareChange = (cat, key, val) => {
    setEditFares((prev) => ({ ...prev, [cat]: { ...prev[cat], [key]: val } }));
  };

  const handleSaveFare = (cat) => {
    const fc = editFares[cat];
    if (!fc?.fare_config_id) return;
    setSavingCat(cat);

    dispatch(updateFareConfig({
      tenantId,
      fareConfigId: fc.fare_config_id,
      body: {
        base_fare:                   parseFloat(fc.base_fare),
        per_km_rate:                 parseFloat(fc.per_km_rate),
        per_min_rate:                parseFloat(fc.per_min_rate),
        minimum_fare:                parseFloat(fc.minimum_fare),
        platform_commission_percent: parseFloat(fc.platform_commission_percent),
      },
    })).finally(() => setSavingCat(null));
  };

  
  const filteredCities = cities.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    (c.country_code || '').toLowerCase().includes(search.toLowerCase())
  );

  
  const grouped = filteredCities.reduce((acc, c) => {
    const key = c.country_code || 'Unknown';
    if (!acc[key]) acc[key] = [];
    acc[key].push(c);
    return acc;
  }, {});

  const isAddFlow = panel === PANEL.ADD_STEP1 || panel === PANEL.ADD_STEP2;

  
  const renderRightPanel = () => {

    
    if (panel === PANEL.IDLE) {
      return (
        <div className="cs-idle">
          <div className="cs-idle-icon">🗺️</div>
          <h3>Regional Coverage</h3>
          <p>
            Select a city to view and edit its fare configurations, or onboard
            a new city within your assigned territories.
          </p>
          {tenantCountries.length > 0 && (
            <div className="cs-idle-countries">
              <span className="cs-idle-countries-label">Your territories</span>
              <div className="cs-idle-country-tags">
                {tenantCountries.map((c) => (
                  <span key={c} className="cs-idle-country-tag">{c}</span>
                ))}
              </div>
            </div>
          )}
          <button className="cs-btn-primary" onClick={openAddFlow}>
            + Onboard New City
          </button>
        </div>
      );
    }

    
    if (panel === PANEL.ADD_STEP1) {
      return (
        <div className="cs-panel-form">
          <div className="cs-panel-header">
            <div className="cs-panel-title">
              <h3>Onboard New City</h3>
              <p>Select one of your operating territories to continue.</p>
            </div>
            <div className="cs-steps">
              <span className="cs-step cs-step-active">1 Territory</span>
              <span className="cs-step-arrow">›</span>
              <span className="cs-step">2 City &amp; Fares</span>
            </div>
          </div>

          {tenantCountries.length === 0 ? (
            <div className="cs-notice cs-notice-warn">
              No countries are assigned to your account. Please contact your system
              administrator to enable country coverage.
            </div>
          ) : (
            <>
              <p className="cs-step-instruction">
                Choose the country in which you want to onboard a new city:
              </p>
              <div className="cs-country-picker">
                {tenantCountries.map((code) => (
                  <button
                    key={code}
                    type="button"
                    className={`cs-country-tile ${loading && countryCode === code ? 'cs-country-tile-loading' : ''}`}
                    onClick={() => handleSelectCountry(code)}
                    disabled={loading}
                  >
                    <span className="cs-country-tile-flag">🌍</span>
                    <span className="cs-country-tile-code">{code}</span>
                    <span className="cs-country-tile-sub">
                      {cities.filter((c) => c.country_code === code).length} active{' '}
                      {cities.filter((c) => c.country_code === code).length === 1 ? 'city' : 'cities'}
                    </span>
                    {loading && countryCode === code && (
                      <span className="cs-spinner-sm cs-spinner-abs" />
                    )}
                  </button>
                ))}
              </div>
            </>
          )}

          {addError && <div className="cs-error-msg">⚠ {addError}</div>}

          <div className="cs-form-actions" style={{ marginTop: '8px' }}>
            <button
              type="button"
              className="cs-btn-secondary"
              onClick={() => setPanel(PANEL.IDLE)}
            >
              Cancel
            </button>
          </div>
        </div>
      );
    }

    
    if (panel === PANEL.ADD_STEP2) {
      return (
        <div className="cs-panel-form">
          <div className="cs-panel-header">
            <div className="cs-panel-title">
              <h3>Onboard New City</h3>
              <p>Select a city and configure fares for all vehicle categories.</p>
            </div>
            <div className="cs-steps">
              <span className="cs-step cs-step-done">✓ Territory</span>
              <span className="cs-step-arrow">›</span>
              <span className="cs-step cs-step-active">2 City &amp; Fares</span>
            </div>
          </div>

          
          <div className="cs-country-badge">
            <span className="cs-country-badge-flag">🌍</span>
            <span className="cs-country-badge-code">{countryCode.toUpperCase()}</span>
            <button
              className="cs-country-change-btn"
              onClick={() => { setPanel(PANEL.ADD_STEP1); dispatch(clearAvailableCities()); }}
            >
              Change territory
            </button>
          </div>

          <form onSubmit={handleAddSubmit} className="cs-form">
            
            <div className="cs-field-group">
              <label className="cs-label">
                Select City <span className="cs-required">*</span>
              </label>
              {availableCities.length === 0 ? (
                <div className="cs-notice cs-notice-warn">
                  No available cities found for <strong>{countryCode}</strong>.
                  All cities may already be mapped to your account for this territory.
                </div>
              ) : (
                <div className="cs-city-chips">
                  {availableCities.map((c) => (
                    <button
                      key={c.city_id}
                      type="button"
                      className={`cs-city-chip ${pickedCity?.city_id === c.city_id ? 'cs-city-chip-selected' : ''}`}
                      onClick={() => setPickedCity(c)}
                    >
                      <span className="cs-chip-name">{c.name}</span>
                      <span className="cs-chip-sub">{c.timezone}</span>
                      <span className="cs-chip-currency">{c.currency}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            
            {pickedCity && (
              <div className="cs-field-group">
                <label className="cs-label">
                  Fare Configuration for{' '}
                  <strong>{pickedCity.name}</strong>
                  <span className="cs-required"> *</span>
                </label>
                <p className="cs-hint cs-hint-mb">
                  All three vehicle categories are required.
                </p>
                <div className="cs-fare-grid-3">
                  {CATEGORIES.map((cat) => (
                    <div key={cat} className="cs-fare-card">
                      <div className="cs-fare-card-head">
                        <span className="cs-cat-icon">{CAT_META[cat].icon}</span>
                        <span className="cs-cat-label">{CAT_META[cat].label}</span>
                      </div>
                      <div className="cs-fare-rows">
                        {FARE_FIELDS.map(({ key, label, prefix }) => (
                          <div key={key} className="cs-fare-row">
                            <span className="cs-fare-lbl">{label}</span>
                            <div className="cs-fare-input-wrap">
                              <span className="cs-fare-prefix">{prefix}</span>
                              <input
                                className="cs-fare-input"
                                type="number"
                                step="0.01"
                                min="0"
                                placeholder="0.00"
                                value={newFares[cat][key]}
                                onChange={(e) => handleNewFareChange(cat, key, e.target.value)}
                                required
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {addError && <div className="cs-error-msg">⚠ {addError}</div>}

            <div className="cs-form-actions">
              <button
                type="button"
                className="cs-btn-secondary"
                onClick={() => { setPanel(PANEL.ADD_STEP1); dispatch(clearAvailableCities()); }}
              >
                ← Back
              </button>
              <button
                type="submit"
                className="cs-btn-primary"
                disabled={loading || !pickedCity || availableCities.length === 0}
              >
                {loading ? <span className="cs-spinner-sm" /> : '✓ Onboard City'}
              </button>
            </div>
          </form>
        </div>
      );
    }

    
    if (panel === PANEL.VIEW && selectedCity) {
      return (
        <div className="cs-panel-view">
          
          <div className="cs-view-header">
            <div className="cs-view-title-block">
              <h2 className="cs-view-city-name">{selectedCity.name}</h2>
              <div className="cs-view-meta">
                <span className="cs-meta-tag">{selectedCity.country_code}</span>
                <span className="cs-meta-tag">{selectedCity.timezone}</span>
                <span className="cs-meta-tag">{selectedCity.currency}</span>
              </div>
            </div>
            <span className="cs-badge-active">Active</span>
          </div>

          
          <div className="cs-info-grid">
            <div className="cs-info-card">
              <span className="cs-info-label">City ID</span>
              <span className="cs-info-value">#{selectedCity.city_id}</span>
            </div>
            <div className="cs-info-card">
              <span className="cs-info-label">Country</span>
              <span className="cs-info-value">{selectedCity.country_code || '—'}</span>
            </div>
            <div className="cs-info-card">
              <span className="cs-info-label">Timezone</span>
              <span className="cs-info-value">{selectedCity.timezone}</span>
            </div>
            <div className="cs-info-card">
              <span className="cs-info-label">Currency</span>
              <span className="cs-info-value">{selectedCity.currency}</span>
            </div>
          </div>

          
          <div className="cs-section">
            <div className="cs-section-head">
              <h4>Fare Configurations</h4>
              <span className="cs-section-sub">Changes save per category independently.</span>
            </div>

            {fareLoading ? (
              <div className="cs-loading-row">
                <span className="cs-spinner" />
                <span>Loading fare configs…</span>
              </div>
            ) : (
              <div className="cs-fare-grid-3">
                {CATEGORIES.map((cat) => {
                  const fc        = editFares[cat];
                  const isSaving  = savingCat === cat;
                  const hasConfig = !!fc?.fare_config_id;

                  return (
                    <div
                      key={cat}
                      className={`cs-fare-card cs-fare-card-edit ${!hasConfig ? 'cs-fare-card-missing' : ''}`}
                    >
                      <div className="cs-fare-card-head">
                        <span className="cs-cat-icon">{CAT_META[cat].icon}</span>
                        <span className="cs-cat-label">{CAT_META[cat].label}</span>
                        {hasConfig && (
                          <span className="cs-fc-id">FC-{fc.fare_config_id}</span>
                        )}
                      </div>

                      {hasConfig ? (
                        <>
                          <div className="cs-fare-rows">
                            {FARE_FIELDS.map(({ key, label, prefix }) => (
                              <div key={key} className="cs-fare-row">
                                <span className="cs-fare-lbl">{label}</span>
                                <div className="cs-fare-input-wrap">
                                  <span className="cs-fare-prefix">{prefix}</span>
                                  <input
                                    className="cs-fare-input"
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={editFares[cat]?.[key] ?? ''}
                                    onChange={(e) =>
                                      handleEditFareChange(cat, key, e.target.value)
                                    }
                                  />
                                </div>
                              </div>
                            ))}
                          </div>
                          <button
                            className="cs-save-btn"
                            onClick={() => handleSaveFare(cat)}
                            disabled={isSaving}
                          >
                            {isSaving ? <span className="cs-spinner-sm" /> : '💾 Save'}
                          </button>
                        </>
                      ) : (
                        <div className="cs-no-config">No fare config found.</div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      );
    }

    return null;
  };

  
  return (
    <div className="cs-root">

      
      <div className="cs-left">
        <div className="cs-left-header">
          <div className="cs-left-top">
            <h3>Regional Coverage</h3>
            <button
              className={`cs-add-btn ${isAddFlow ? 'cs-add-btn-cancel' : ''}`}
              onClick={isAddFlow ? () => setPanel(PANEL.IDLE) : openAddFlow}
              title={isAddFlow ? 'Cancel' : 'Add New City'}
            >
              {isAddFlow ? '✕' : '+'}
            </button>
          </div>

          <div className="cs-search-wrap">
            <span className="cs-search-icon">🔍</span>
            <input
              className="cs-search-input"
              type="text"
              placeholder="Search cities or countries…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="cs-stats-row">
            <div className="cs-stat">
              <span className="cs-stat-num">{cities.length}</span>
              <span className="cs-stat-lbl">Active Cities</span>
            </div>
            <div className="cs-stat">
              <span className="cs-stat-num">{tenantCountries.length}</span>
              <span className="cs-stat-lbl">Territories</span>
            </div>
          </div>
        </div>

        <div className="cs-city-list">
          {Object.keys(grouped).length === 0 ? (
            <div className="cs-empty">
              <div className="cs-empty-icon">🌍</div>
              <p>
                {cities.length === 0
                  ? 'No cities onboarded yet.'
                  : 'No cities match your search.'}
              </p>
              {cities.length === 0 && (
                <button className="cs-btn-primary cs-btn-sm" onClick={openAddFlow}>
                  + Add First City
                </button>
              )}
            </div>
          ) : (
            Object.entries(grouped).map(([country, countryCities]) => (
              <div key={country} className="cs-country-block">
                <div className="cs-country-row">
                  <span className="cs-country-code">{country}</span>
                  <span className="cs-country-count">{countryCities.length}</span>
                </div>
                {countryCities.map((city) => (
                  <button
                    key={city.city_id}
                    className={`cs-city-row ${
                      selectedCity?.city_id === city.city_id && panel === PANEL.VIEW
                        ? 'cs-city-row-active'
                        : ''
                    }`}
                    onClick={() => handleCityClick(city)}
                  >
                    <div className="cs-city-row-left">
                      <span className="cs-city-name">{city.name}</span>
                      <span className="cs-city-tz">{city.timezone}</span>
                    </div>
                    <div className="cs-city-row-right">
                      <span className="cs-city-cur">{city.currency}</span>
                      <span className="cs-city-arrow">›</span>
                    </div>
                  </button>
                ))}
              </div>
            ))
          )}
        </div>
      </div>

      
      <div className="cs-right">{renderRightPanel()}</div>
    </div>
  );
};

export default CitySetup;