import React, { useState, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { 
  applyForFleet, 
  checkFleetStatus, 
  fetchFleetTenants 
} from '../../store/fleetSlice';
import './Fleet.css';

const FleetRegistration = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const { 
    availableTenants, 
    hasExistingFleet, 
    loading, 
    error 
  } = useSelector((state) => state.fleet);
  const { roles, user } = useSelector((state) => state.auth);

  const [formData, setFormData] = useState({ tenant_id: '', fleet_name: '' });

  //1. Role Guard: If Tenant Admin, stop fleet logic immediately
  const isTenantAdmin = useMemo(() => roles?.includes("TENANT_ADMIN"), [roles]);

  useEffect(() => {
    if (isTenantAdmin) return;

    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
    } else {
      dispatch(checkFleetStatus());
    }
  }, [dispatch, navigate, isTenantAdmin]);

  useEffect(() => {
    if (!isTenantAdmin && hasExistingFleet === true && window.location.pathname === '/fleet-registration') {
      navigate('/dashboard'); 
    }
  }, [hasExistingFleet, navigate, isTenantAdmin]);

  useEffect(() => {
    // If hasExistingFleet is false, it means we definitely don't have one, so load tenants
    if (!isTenantAdmin && hasExistingFleet === false && user?.user_id) {
      dispatch(fetchFleetTenants(user.user_id));
    }
  }, [hasExistingFleet, dispatch, isTenantAdmin, user]);

  const handleApply = async (e) => {
    e.preventDefault();

    // VALIDATION: Prevent sending empty/invalid data (Stops 422 errors)
    if (!formData.tenant_id || formData.tenant_id === "") {
      alert("Please select an operating tenant.");
      return;
    }

    const tenantIdNum = parseInt(formData.tenant_id, 10);
    if (isNaN(tenantIdNum)) {
      alert("Invalid City selection.");
      return;
    }

    //PREPARE PAYLOAD: Exactly matching Python Pydantic Schema
    const payload = {
      tenant_id: tenantIdNum,
      fleet_name: formData.fleet_name.trim()
    };

    console.log("Sending Application Payload:", payload);
    dispatch(applyForFleet(payload));
  };

  if (isTenantAdmin) return null;

  if (loading && hasExistingFleet === null) {
    return (
      <div className="rydo-layout">
        <div className="form-pane">
          <div className="rydo-spinner"></div>
          <p>Verifying Account Status...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rydo-layout">
      <div className="nyc-visual-pane" style={{backgroundImage: 'url(https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?q=80&w=2560&auto=format&fit=crop)'}}>
        <div className="hero-content">
          <h1 className="brand-logo">Rydo<span className="brand-badge">FLEET</span></h1>
          <p className="hero-text">Scale your business. Manage your fleet.</p>
        </div>
      </div>

      <div className="form-pane">
        <div className="form-content-box">
          <header className="form-intro">
            <h2>Partner Application</h2>
            <p>Start your journey as a Fleet Owner.</p>
          </header>

          {/*ERROR DISPLAY: Handle both strings and FastAPI error objects */}
          {error && (
            <div className="auth-alert error">
              {typeof error === 'string' ? error : JSON.stringify(error)}
            </div>
          )}

          <form onSubmit={handleApply} className="registration-form">
            <div className="form-row">
              <label>Operating Tenant</label>
              <select 
                value={formData.tenant_id} 
                onChange={(e) => setFormData({...formData, tenant_id: e.target.value})}
                required
              >
                <option value="">Select Tenant...</option>
                {availableTenants && availableTenants.length > 0 ? (
                  availableTenants.map(t => (
                    <option key={t.tenant_id} value={t.tenant_id}>
                      {t.name} ({t.default_currency})
                    </option>
                  ))
                ) : (
                  <option disabled>Loading cities...</option>
                )}
              </select>
            </div>

            <div className="form-row">
              <label>Fleet / Business Name</label>
              <input 
                type="text" 
                placeholder="e.g. Metro Cabs LLC" 
                value={formData.fleet_name}
                onChange={(e) => setFormData({...formData, fleet_name: e.target.value})}
                required 
              />
            </div>

            <button type="submit" className="rydo-submit-btn" disabled={loading}>
              {loading ? 'Processing...' : 'Submit Application'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default FleetRegistration;