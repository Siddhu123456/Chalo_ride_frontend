import React, { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  checkFleetStatus,
  fetchDocStatus,
  uploadFleetDoc,
  fetchFleetVehicles,
  fetchFleetDrivers,
  clearFleetError,
} from "../../store/fleetSlice";

import DashboardSidebar from "./components/DashboardSidebar";
import DashboardOverview from "./components/DashboardOverview";
import VehicleManager from "./components/VehicleManager";
import DriverManager from "./components/DriverManager";
import AssignmentManager from "./components/AssignmentManager";
import DocUploadModule from "./components/DocUploadModule";
import AddVehicleModal from "./components/AddVehicleModal";
import logo from '../../assets/logo.png'; 

import "./FleetDashboard.css";

const FleetDashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { fleet, loading, hasExistingFleet, docStatus, error, successMsg } = useSelector(
    (state) => state.fleet
  );
  const { roles } = useSelector((state) => state.auth); // ✅ Added roles selector

  const [activeTab, setActiveTab] = useState("OVERVIEW");
  const [showAddVehicleModal, setShowAddVehicleModal] = useState(false);

  // ✅ 1. Role Guard: If Tenant Admin, stop fleet logic immediately
  const isTenantAdmin = useMemo(() => roles?.includes("TENANT_ADMIN"), [roles]);

  useEffect(() => {
    if (isTenantAdmin) return; // ✅ Block logic for admins
    dispatch(checkFleetStatus());
  }, [dispatch, isTenantAdmin]);

  useEffect(() => {
    if (isTenantAdmin || !fleet?.fleet_id) return;

    if (fleet.approval_status !== "APPROVED") {
      dispatch(fetchDocStatus(fleet.fleet_id));
      return;
    }

    dispatch(fetchFleetVehicles(fleet.fleet_id));
    dispatch(fetchFleetDrivers(fleet.fleet_id));
  }, [fleet, dispatch, isTenantAdmin]);

  useEffect(() => {
    // ✅ Only redirect if NOT an admin and fleet is missing
    if (!isTenantAdmin && hasExistingFleet === false) {
      navigate("/fleet-registration");
    }
  }, [hasExistingFleet, navigate, isTenantAdmin]);

  const statusLabel = useMemo(() => fleet?.approval_status || "PENDING", [fleet]);

  if (isTenantAdmin) return null; // ✅ Render nothing if this is an admin session

  if (loading && !fleet) {
    return (
      <div className="fd-navbar-brand">
        <img src={logo} alt="ChaloRide Logo" className="fd-logo-img" />
        <span className="fd-brand-badge">FLEET</span>
      </div>
    );
  }

  // --- ONBOARDING VIEW (UNVERIFIED) ---
  if (fleet && fleet.approval_status !== "APPROVED") {
    return (
      <div className="fd-onboarding-layout">
        <nav className="fd-navbar">
          <div className="fd-navbar-brand">
            Rydo<span className="fd-brand-badge">FLEET</span>
          </div>
          <div className="fd-navbar-actions">
            <button
              className="fd-btn-logout"
              onClick={() => {
                localStorage.clear();
                window.location.href = "/login";
              }}
            >
              Sign Out
            </button>
          </div>
        </nav>

        <div className="fd-onboarding-content">
          <header className="fd-welcome-section">
            <div className="fd-onboard-tag">Verification Required</div>
            {/* ✅ Greeting placed here, in the Hero section */}
            <h1>Welcome, {fleet.fleet_name}</h1>
            <p>Your fleet profile is currently <strong>{statusLabel}</strong>. Complete the verification below to activate your command center.</p>
          </header>

          {(error || successMsg) && (
            <div className={`fd-banner ${error ? "error" : "success"}`}>
              <span>{error || successMsg}</span>
              <button onClick={() => dispatch(clearFleetError())}>✕</button>
            </div>
          )}

          <DocUploadModule
            fleetId={fleet.fleet_id}
            docStatus={docStatus}
            dispatch={dispatch}
            uploadAction={uploadFleetDoc}
            approvalStatus={statusLabel}
            statusClass={statusLabel.toLowerCase().includes('review') ? 'review' : 'pending'}
          />
        </div>
      </div>
    );
  }

  // --- FULL DASHBOARD VIEW (VERIFIED) ---
  return (
    <div className="fd-layout">
      <DashboardSidebar
        fleetName={fleet?.fleet_name}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      <main className="fd-main">
        <header className="fd-topbar">
          <div className="fd-breadcrumbs">
            Console / <strong>{activeTab}</strong>
          </div>
          <div className="fd-user-menu">
            <span className="fd-dot-live"></span>
            System Active
          </div>
        </header>

        {(error || successMsg) && (
          <div className={`fd-banner ${error ? "error" : "success"}`}>
            <span>{error || successMsg}</span>
            <button onClick={() => dispatch(clearFleetError())}>✕</button>
          </div>
        )}

        <div className="fd-view-container">
          {activeTab === "OVERVIEW" && (
            <DashboardOverview onAddVehicle={() => setShowAddVehicleModal(true)} />
          )}
          {activeTab === "VEHICLES" && (
            <VehicleManager fleetId={fleet?.fleet_id} onAdd={() => setShowAddVehicleModal(true)} />
          )}
          {activeTab === "DRIVERS" && <DriverManager fleetId={fleet?.fleet_id} />}
          {activeTab === "ASSIGNMENTS" && <AssignmentManager fleetId={fleet?.fleet_id} />}
        </div>
      </main>

      {showAddVehicleModal && (
        <AddVehicleModal fleetId={fleet?.fleet_id} onClose={() => setShowAddVehicleModal(false)} />
      )}
    </div>
  );
};

export default FleetDashboard;