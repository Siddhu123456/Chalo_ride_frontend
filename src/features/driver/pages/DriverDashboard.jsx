import React, { useState } from "react";
import "./DriverDashboard.css";

/**
 * DriverDashboard
 * - Default landing page after driver login
 * - ONLY place for Start Shift / End Shift actions
 * - Shows shift status, vehicle summary, active trip summary
 */
const DriverDashboard = () => {
  // Local state for demo; in production use Redux slice
  const [shiftStatus, setShiftStatus] = useState("OFFLINE"); // ONLINE | OFFLINE
  const [loading, setLoading] = useState(false);

  // Placeholder data; connect to Redux/API in production
  const assignedVehicle = {
    plate: "MH-12-AB-1234",
    model: "Toyota Innova",
  };

  const activeTrip = null; // or { id, pickup, dropoff, status }

  const handleStartShift = async () => {
    setLoading(true);
    try {
      // TODO: dispatch(startShift()) or call POST /drivers/shifts/start
      // Simulating API call
      await new Promise((r) => setTimeout(r, 600));
      setShiftStatus("ONLINE");
    } catch (err) {
      console.error("Failed to start shift", err);
    } finally {
      setLoading(false);
    }
  };

  const handleEndShift = async () => {
    setLoading(true);
    try {
      // TODO: dispatch(endShift()) or call POST /drivers/shifts/end
      await new Promise((r) => setTimeout(r, 600));
      setShiftStatus("OFFLINE");
    } catch (err) {
      console.error("Failed to end shift", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="driver-dashboard">
      <h1 className="dashboard-title">Driver Dashboard</h1>

      {/* Shift Status Card */}
      <div className="dashboard-card shift-card">
        <h2>Shift Status</h2>
        <p className={`shift-status ${shiftStatus.toLowerCase()}`}>
          {shiftStatus}
        </p>

        {shiftStatus === "OFFLINE" ? (
          <button
            className="shift-btn start-btn"
            onClick={handleStartShift}
            disabled={loading}
          >
            {loading ? "Starting..." : "Start Shift"}
          </button>
        ) : (
          <button
            className="shift-btn end-btn"
            onClick={handleEndShift}
            disabled={loading}
          >
            {loading ? "Ending..." : "End Shift"}
          </button>
        )}
      </div>

      {/* Assigned Vehicle Summary */}
      <div className="dashboard-card vehicle-card">
        <h2>Assigned Vehicle</h2>
        {assignedVehicle ? (
          <>
            <p><strong>Plate:</strong> {assignedVehicle.plate}</p>
            <p><strong>Model:</strong> {assignedVehicle.model}</p>
          </>
        ) : (
          <p className="no-data">No vehicle assigned</p>
        )}
      </div>

      {/* Active Trip Summary */}
      <div className="dashboard-card trip-card">
        <h2>Active Trip</h2>
        {activeTrip ? (
          <>
            <p><strong>Pickup:</strong> {activeTrip.pickup}</p>
            <p><strong>Dropoff:</strong> {activeTrip.dropoff}</p>
            <p><strong>Status:</strong> {activeTrip.status}</p>
          </>
        ) : (
          <p className="no-data">No active trip</p>
        )}
      </div>
    </div>
  );
};

export default DriverDashboard;
