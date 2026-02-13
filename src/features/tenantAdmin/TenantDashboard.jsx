import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchPendingFleets,
  fetchPendingDrivers,
  fetchPendingVehicles,
  fetchTenantAdminProfile,
  clearTenantState,
  resetActiveDocs,
} from '../../store/tenantAdminSlice';
import TenantSidebar from './components/TenantSidebar';
import VerificationPortal from './components/VerificationPortal';
import CitySetup from './components/CitySetup';
import TenantFinancials from './components/TenantFinancials';
import './TenantDashboard.css';

const VIEW_LABELS = {
  FLEETS:     'Fleet Verification',
  DRIVERS:    'Driver Verification',
  VEHICLES:   'Vehicle Verification',
  CITIES:     'Regional Setup',
  FINANCIALS: 'Financial Management',
};

const TenantDashboard = () => {
  const dispatch    = useDispatch();
  const [activeView, setActiveView] = useState('FLEETS');

  const {
    pendingFleets,
    pendingDrivers,
    pendingVehicles,
    profile,
    profileLoading,
    profileError,   
    successMsg,
    error,          
  } = useSelector((state) => state.tenantAdmin);

  
  useEffect(() => {
    dispatch(fetchTenantAdminProfile());
    dispatch(fetchPendingFleets());
    dispatch(fetchPendingDrivers());
    dispatch(fetchPendingVehicles());
  }, [dispatch]);

  
  useEffect(() => {
    if (successMsg || error) {
      const timer = setTimeout(() => dispatch(clearTenantState()), 4000);
      return () => clearTimeout(timer);
    }
  }, [successMsg, error, dispatch]);

  const handleViewChange = (view) => {
    dispatch(resetActiveDocs());
    setActiveView(view);
  };

  return (
    <div className="td-layout-root">
      <TenantSidebar
        activeView={activeView}
        onViewChange={handleViewChange}
        profile={profile}
        profileLoading={profileLoading}
        profileError={profileError}
        counts={{
          fleets:   pendingFleets.length,
          drivers:  pendingDrivers.length,
          vehicles: pendingVehicles.length,
        }}
      />

      <main className="td-main-container">

        
        <header className="td-top-utility">
          <div className="td-breadcrumb">
            <span className="td-breadcrumb-tenant">
              {profile ? profile.tenant_name : '…'}
            </span>
            <span className="td-breadcrumb-sep">›</span>
            <strong>{VIEW_LABELS[activeView]}</strong>
          </div>

          <div className="td-admin-identity">
            {profileLoading && <div className="td-profile-shimmer" />}
            {!profileLoading && profile && (
              <>
                <div className="td-admin-avatar">
                  {profile.full_name?.charAt(0)?.toUpperCase() ?? '?'}
                </div>
                <div className="td-admin-info">
                  <span className="td-admin-name">{profile.full_name}</span>
                  <span className="td-admin-role">Tenant Admin</span>
                </div>
              </>
            )}
            {!profileLoading && !profile && profileError && (
              <span className="td-admin-error" title={profileError}>
                ⚠ Profile unavailable
              </span>
            )}
          </div>

          <div className="td-status-indicator">
            <span className="dot" />
            Operations Live
          </div>
        </header>

        
        {successMsg && <div className="td-alert success">{successMsg}</div>}
        {error      && <div className="td-alert error">{error}</div>}

        
        <section className="td-view-area">
          {activeView === 'FLEETS' && (
            <VerificationPortal
              type="fleets"
              data={pendingFleets}
              title="Fleet Queue"
            />
          )}
          {activeView === 'DRIVERS' && (
            <VerificationPortal
              type="drivers"
              data={pendingDrivers}
              title="Driver Queue"
            />
          )}
          {activeView === 'VEHICLES' && (
            <VerificationPortal
              type="vehicles"
              data={pendingVehicles}
              title="Vehicle Queue"
            />
          )}
          {activeView === 'CITIES' && <CitySetup />}
          {activeView === 'FINANCIALS' && <TenantFinancials />}
        </section>
      </main>
    </div>
  );
};

export default TenantDashboard;