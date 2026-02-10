import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchPendingFleets, fetchPendingDrivers, fetchPendingVehicles, clearTenantState, resetActiveDocs } from '../../store/tenantAdminSlice';
import TenantSidebar from './components/TenantSidebar';
import VerificationPortal from './components/VerificationPortal';
import CitySetup from './components/CitySetup';
import './TenantDashboard.css';

const TenantDashboard = () => {
  const dispatch = useDispatch();
  const [activeView, setActiveView] = useState('FLEETS');
  const { pendingFleets, pendingDrivers, pendingVehicles, successMsg, error } = useSelector(state => state.tenantAdmin);

  useEffect(() => {
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
        counts={{
          fleets: pendingFleets.length,
          drivers: pendingDrivers.length,
          vehicles: pendingVehicles.length
        }}
      />
      <main className="td-main-container">
        <header className="td-top-utility">
          <div className="td-breadcrumb">System Admin / <strong>{activeView}</strong></div>
          <div className="td-status-indicator"><span className="dot"></span> Operations Live</div>
        </header>
        {successMsg && <div className="td-alert success">{successMsg}</div>}
        {error && <div className="td-alert error">{error}</div>}
        <section className="td-view-area">
          {activeView === 'FLEETS' && (
            <VerificationPortal type="fleets" data={pendingFleets} title="Fleet Queue" />
          )}
          {activeView === 'DRIVERS' && (
            <VerificationPortal type="drivers" data={pendingDrivers} title="Driver Queue" />
          )}
          {activeView === 'VEHICLES' && (
            <VerificationPortal type="vehicles" data={pendingVehicles} title="Vehicle Queue" />
          )}
          {/*  FIXED: Changed from 'REGIONS' to 'CITIES' to match sidebar */}
          {activeView === 'CITIES' && <CitySetup />}
        </section>
      </main>
    </div>
  );
};

export default TenantDashboard;