import React, { useState, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  applyForFleet,
  checkFleetStatus,
  fetchFleetTenants
} from '../../store/fleetSlice';
import logo from '../../assets/logo.png';
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

  const [formData, setFormData] = useState({
    tenant_id: '',
    fleet_name: ''
  });

  // Role Guard
  const isTenantAdmin = useMemo(
    () => roles?.includes("TENANT_ADMIN"),
    [roles]
  );

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
    if (
      !isTenantAdmin &&
      hasExistingFleet === true &&
      window.location.pathname === '/fleet-registration'
    ) {
      navigate('/dashboard');
    }
  }, [hasExistingFleet, navigate, isTenantAdmin]);

  useEffect(() => {
    if (!isTenantAdmin && hasExistingFleet === false && user?.user_id) {
      dispatch(fetchFleetTenants(user.user_id));
    }
  }, [hasExistingFleet, dispatch, isTenantAdmin, user]);

  const handleApply = (e) => {
    e.preventDefault();

    if (!formData.tenant_id) {
      alert("Please select an operating tenant.");
      return;
    }

    const tenantIdNum = parseInt(formData.tenant_id, 10);
    if (isNaN(tenantIdNum)) {
      alert("Invalid city selection.");
      return;
    }

    dispatch(
      applyForFleet({
        tenant_id: tenantIdNum,
        fleet_name: formData.fleet_name.trim()
      })
    );
  };

  if (isTenantAdmin) return null;

  if (loading && hasExistingFleet === null) {
    return (
      <div className="fleet-reg-layout">
        <div className="fleet-reg-form-pane">
          <div className="fleet-reg-loading">
            <div className="fleet-reg-spinner"></div>
            <p>Verifying Account Status...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fleet-reg-layout">
      {/* Left Hero Section */}
      <div
        className="fleet-reg-hero"
        style={{
          backgroundImage:
            'url(https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?q=80&w=2560&auto=format&fit=crop)'
        }}
      >
        <div className="fleet-reg-hero-content">
          <div className="fleet-reg-hero-text">
            <h1 className="fleet-reg-hero-title">Fleet Registration</h1>
            <p className="fleet-reg-hero-subtitle">
              Register your fleet. Choose your city. Get approved to operate.
            </p>
          </div>
        </div>
      </div>

      {/* Right Form Section */}
      <div className="fleet-reg-form-pane">
        <div className="fleet-reg-form-container">
          <div className="fleet-reg-top-brand">
            <img
              src={logo}
              alt="ChaloRide Logo"
              className="fleet-reg-top-logo"
            />
            <span className="fleet-reg-top-badge">FLEET</span>
          </div>

          <header className="fleet-reg-form-header">
            <h2>Partner Application</h2>
            <p>Start your journey as a Fleet Owner.</p>
          </header>

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
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    tenant_id: e.target.value
                  })
                }
                required
              >
                <option value="">Select Tenant...</option>
                {availableTenants?.length > 0 ? (
                  availableTenants.map((t) => (
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
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    fleet_name: e.target.value
                  })
                }
                required
              />
            </div>

            <button
              type="submit"
              className="rydo-submit-btn"
              disabled={loading}
            >
              {loading ? 'Processing...' : 'Submit Application'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default FleetRegistration;
