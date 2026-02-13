import React, { useState, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  applyForFleet,
  checkFleetStatus,
  fetchFleetTenants
} from "../../store/fleetSlice";
import { logout } from "../../store/authSlice";
import logo from "../../assets/logo.png";
import "./Fleet.css";

const FleetRegistration = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const {
    availableTenants,
    hasExistingFleet,
    loading,
    error,
    fleetApplied
  } = useSelector((state) => state.fleet);

  const { roles, user } = useSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    tenant_id: "",
    fleet_name: ""
  });

  const [showSuccessDialog, setShowSuccessDialog] = useState(false);

  
  const isTenantAdmin = useMemo(
    () => roles?.includes("TENANT_ADMIN"),
    [roles]
  );

  
  useEffect(() => {
    if (!isTenantAdmin) {
      dispatch(checkFleetStatus());
    }
  }, [dispatch, isTenantAdmin]);

  
  useEffect(() => {
    if (
      !isTenantAdmin &&
      hasExistingFleet === false &&
      user?.user_id
    ) {
      dispatch(fetchFleetTenants(user.user_id));
    }
  }, [dispatch, hasExistingFleet, isTenantAdmin, user]);

  
  useEffect(() => {
    if (fleetApplied) {
      setShowSuccessDialog(true);
    }
  }, [fleetApplied]);

  const handleApply = (e) => {
    e.preventDefault();

    if (!formData.tenant_id) {
      alert("Please select an operating tenant.");
      return;
    }

    dispatch(
      applyForFleet({
        tenant_id: Number(formData.tenant_id),
        fleet_name: formData.fleet_name.trim()
      })
    );
  };

  const handleDialogConfirm = () => {
    dispatch(logout());
    localStorage.clear();
    navigate("/auth", { replace: true });
  };

  if (isTenantAdmin) {
    return (
      <div className="fleet-reg-layout">
        <p>You are not allowed to register a fleet.</p>
      </div>
    );
  }

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
    <>
      <div className="fleet-reg-layout">
        
        <div
          className="fleet-reg-hero"
          style={{
            backgroundImage:
              "url(https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?q=80&w=2560&auto=format&fit=crop)"
          }}
        >
          <div className="fleet-reg-hero-content">
            <h1 className="fleet-reg-hero-title">Fleet Registration</h1>
            <p className="fleet-reg-hero-subtitle">
              Register your fleet. Choose your city. Get approved to operate.
            </p>
          </div>
        </div>

        
        <div className="fleet-reg-form-pane">
          <div className="fleet-reg-form-container">
            <div className="fleet-reg-top-brand">
              <img src={logo} alt="ChaloRide Logo" className="fleet-reg-top-logo"/>
              <span className="fleet-reg-top-badge">FLEET</span>
            </div>

            <header className="fleet-reg-form-header">
              <h2>Partner Application</h2>
              <p>Start your journey as a Fleet Owner.</p>
            </header>

            {error && (
              <div className="auth-alert error">
                {typeof error === "string" ? error : JSON.stringify(error)}
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
                  {availableTenants?.map((t) => (
                    <option key={t.tenant_id} value={t.tenant_id}>
                      {t.name}
                    </option>
                  ))}
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
                {loading ? "Processing..." : "Submit Application"}
              </button>
            </form>
          </div>
        </div>
      </div>

      
      {showSuccessDialog && (
        <div className="fleet-dialog-backdrop">
          <div className="fleet-dialog">
            <h2>Registration Submitted</h2>
            <p>
              Your fleet registration has been submitted successfully.
              <br />
              Please login again to upload documents for verification.
            </p>

            <button
              className="fleet-dialog-btn"
              onClick={handleDialogConfirm}
            >
              Login Again
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default FleetRegistration;
