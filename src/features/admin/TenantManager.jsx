import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCountries } from  '../../store/authSlice';
import { 
  fetchTenants, createTenant, 
  fetchTenantCountries, addTenantCountry, 
  fetchTenantAdmins, assignTenantAdmin, removeTenantAdmin, 
  clearAdminState 
} from '../../store/adminSlice';
import './TenantManager.css';

const TenantManager = () => {
  const dispatch = useDispatch();
  const { tenants, currentTenantCountries, currentTenantAdmins, loading, error, successMsg } = useSelector((state) => state.admin);
  const { countries: globalCountries } = useSelector((state) => state.auth);

  const [view, setView] = useState('LIST');
  const [selectedTenant, setSelectedTenant] = useState(null);
  
  // Forms
  const [newTenant, setNewTenant] = useState({ name: '', default_currency: '', default_timezone: '' });
  const [newCountry, setNewCountry] = useState({ country_code: '', launched_on: new Date().toISOString().split('T')[0] });
  const [newAdmin, setNewAdmin] = useState({ user_id: '', is_primary: false });

  useEffect(() => {
    dispatch(fetchTenants());
    dispatch(fetchCountries());
  }, [dispatch]);

  const handleCreateTenant = async (e) => {
    e.preventDefault();
    await dispatch(createTenant(newTenant));
    setNewTenant({ name: '', default_currency: '', default_timezone: '' });
  };

  const handleSelectTenant = (tenant) => {
    setSelectedTenant(tenant);
    dispatch(fetchTenantCountries(tenant.tenant_id));
    dispatch(fetchTenantAdmins(tenant.tenant_id));
    setView('DETAIL');
  };

  const handleAddCountry = async (e) => {
    e.preventDefault();
    if (!selectedTenant) return;
    await dispatch(addTenantCountry({ tenantId: selectedTenant.tenant_id, countryData: newCountry }));
    setNewCountry({ country_code: '', launched_on: new Date().toISOString().split('T')[0] });
  };

  const handleAssignAdmin = async (e) => {
    e.preventDefault();
    if (!selectedTenant) return;
    await dispatch(assignTenantAdmin({
      tenantId: selectedTenant.tenant_id,
      payload: { user_id: parseInt(newAdmin.user_id), is_primary: newAdmin.is_primary }
    }));
    setNewAdmin({ user_id: '', is_primary: false });
  };

  const handleRemoveAdmin = async (userId) => {
    if(!window.confirm("Remove this admin?")) return;
    await dispatch(removeTenantAdmin({ tenantId: selectedTenant.tenant_id, userId: userId }));
  };

  const handleBack = () => {
    setView('LIST');
    setSelectedTenant(null);
    dispatch(clearAdminState());
  };

  return (
    <div className="tm-container">
      
      {/* --- ALERTS --- */}
      {(error || successMsg) && (
        <div className={`tm-notification ${error ? 'error' : 'success'}`}>
          {error || successMsg}
        </div>
      )}

      {/* --- VIEW 1: LIST (Main Dashboard) --- */}
      {view === 'LIST' && (
        <>
          <div className="tm-header">
            <div className="tm-title">
              <h1>Tenant Overview</h1>
              <p>Manage platform instances and regional configurations.</p>
            </div>
          </div>

          <div className="tm-dashboard-layout">
            {/* Create Tenant Card */}
            <div className="tm-card create-card">
              <div className="tm-card-header"><h3>Register New Tenant</h3></div>
              <form onSubmit={handleCreateTenant} className="tm-stacked-form">
                <div className="tm-input-group">
                  <label>Tenant Name</label>
                  <input type="text" value={newTenant.name} onChange={(e) => setNewTenant({...newTenant, name: e.target.value})} required placeholder="Rydo NYC"/>
                </div>
                <div className="tm-row-group">
                  <div className="tm-input-group">
                    <label>Currency</label>
                    <input type="text" value={newTenant.default_currency} onChange={(e) => setNewTenant({...newTenant, default_currency: e.target.value})} required placeholder="USD"/>
                  </div>
                  <div className="tm-input-group">
                    <label>Timezone</label>
                    <input type="text" value={newTenant.default_timezone} onChange={(e) => setNewTenant({...newTenant, default_timezone: e.target.value})} required placeholder="America/New_York"/>
                  </div>
                </div>
                <button className="tm-btn-primary" disabled={loading}>Create Tenant</button>
              </form>
            </div>

            {/* List Table */}
            <div className="tm-card list-card">
              <div className="tm-card-header"><h3>Existing Tenants</h3></div>
              <div className="tm-table-wrapper">
                <table className="tm-table">
                  <thead>
                    <tr>
                      <th style={{width: '60px'}}>ID</th>
                      <th>Name</th>
                      <th>Config</th>
                      <th style={{textAlign:'right'}}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tenants.map(t => (
                      <tr key={t.tenant_id}>
                        <td className="tm-mono">#{t.tenant_id}</td>
                        <td className="tm-bold">{t.name}</td>
                        <td className="tm-meta">{t.default_currency} / {t.default_timezone}</td>
                        <td style={{textAlign:'right'}}>
                          <button className="tm-link-btn" onClick={() => handleSelectTenant(t)}>Manage →</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </>
      )}

      {/* --- VIEW 2: DETAIL (Segregated Managers) --- */}
      {view === 'DETAIL' && selectedTenant && (
        <div className="tm-detail-view">
          
          {/* 1. Top Bar: Info & Back */}
          <div className="tm-detail-header">
            <div className="tm-dh-info">
              <button onClick={handleBack} className="tm-back-link">← All Tenants</button>
              <h1>{selectedTenant.name}</h1>
              <div className="tm-dh-meta">
                <span>ID: #{selectedTenant.tenant_id}</span>
                <span className="bullet">•</span>
                <span>{selectedTenant.default_currency}</span>
                <span className="bullet">•</span>
                <span>{selectedTenant.default_timezone}</span>
              </div>
            </div>
          </div>

          {/* 2. Main Grid: Two Large Columns */}
          <div className="tm-detail-grid">
            
            {/* --- MODULE A: REGIONS MANAGER --- */}
            <div className="tm-module-card">
              <div className="tm-module-header">
                <h3>Operating Regions</h3>
                <span className="tm-count-badge">{currentTenantCountries.length} Active</span>
              </div>
              
              {/* Inline Add Form */}
              <div className="tm-inline-form-box">
                <form onSubmit={handleAddCountry} className="tm-inline-form">
                  <select value={newCountry.country_code} onChange={(e) => setNewCountry({...newCountry, country_code: e.target.value})} required>
                    <option value="">Select Country...</option>
                    {globalCountries.map(c => <option key={c.country_code} value={c.country_code}>{c.name}</option>)}
                  </select>
                  <input type="date" value={newCountry.launched_on} onChange={(e) => setNewCountry({...newCountry, launched_on: e.target.value})} />
                  <button type="submit" className="tm-btn-small" disabled={loading}>Add</button>
                </form>
              </div>

              {/* Table */}
              <div className="tm-module-content">
                <table className="tm-table compact">
                  <thead>
                    <tr><th>Region</th><th>Launched</th></tr>
                  </thead>
                  <tbody>
                    {currentTenantCountries.map((c, i) => (
                      <tr key={i}>
                        <td className="tm-bold">{c.country_code}</td>
                        <td className="tm-meta">{c.launched_on}</td>
                      </tr>
                    ))}
                    {currentTenantCountries.length === 0 && <tr><td colSpan="2" className="tm-empty">No regions configured.</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>

            {/* --- MODULE B: ADMINS MANAGER --- */}
            <div className="tm-module-card">
              <div className="tm-module-header">
                <h3>Administrators</h3>
                <span className="tm-count-badge">{currentTenantAdmins.length} Assigned</span>
              </div>

              {/* Inline Add Form */}
              <div className="tm-inline-form-box">
                <form onSubmit={handleAssignAdmin} className="tm-inline-form">
                  <input 
                    type="number" 
                    placeholder="User ID" 
                    value={newAdmin.user_id} 
                    onChange={(e) => setNewAdmin({...newAdmin, user_id: e.target.value})} 
                    required 
                    style={{maxWidth: '100px'}}
                  />
                  <label className="tm-check-label">
                    <input type="checkbox" checked={newAdmin.is_primary} onChange={(e) => setNewAdmin({...newAdmin, is_primary: e.target.checked})} />
                    Primary
                  </label>
                  <button type="submit" className="tm-btn-small" disabled={loading}>Assign</button>
                </form>
              </div>

              {/* Table */}
              <div className="tm-module-content">
                <table className="tm-table compact">
                  <thead>
                    <tr><th>User ID</th><th>Role</th><th style={{textAlign:'right'}}>Action</th></tr>
                  </thead>
                  <tbody>
                    {currentTenantAdmins.map((a, i) => (
                      <tr key={i}>
                        <td className="tm-mono">#{a.user_id}</td>
                        <td>
                          {a.is_primary 
                            ? <span className="tm-tag primary">Primary</span> 
                            : <span className="tm-tag">Admin</span>
                          }
                        </td>
                        <td style={{textAlign:'right'}}>
                          <button className="tm-icon-btn danger" onClick={() => handleRemoveAdmin(a.user_id)}>×</button>
                        </td>
                      </tr>
                    ))}
                    {currentTenantAdmins.length === 0 && <tr><td colSpan="3" className="tm-empty">No admins assigned.</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default TenantManager;