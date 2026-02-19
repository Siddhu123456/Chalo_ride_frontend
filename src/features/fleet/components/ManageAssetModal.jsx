import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchVehicleAssignment,
  clearSelectedVehicleForManage,
  clearFleetError,
  fetchAvailableDrivers,
  assignDriverToVehicle,
  changeDriver,
} from "../../../store/fleetSlice";
import "./ManageAssetModal.css";

const ManageAssetModal = () => {
  const dispatch = useDispatch();
  const {
    selectedVehicleForManage: vehicle,
    vehicleAssignment,
    fleet,
    loading,
    error,
    successMsg,
    availableDrivers,
  } = useSelector((state) => state.fleet);

  // mode: null | "assign" | "change"
  const [mode, setMode] = useState(null);
  const [selectedDriverId, setSelectedDriverId] = useState("");
  const [startTime, setStartTime] = useState("00:00");
  const [endTime, setEndTime] = useState("23:59");

  const hasDriver = vehicleAssignment && vehicleAssignment.driver_id;

  useEffect(() => {
    if (vehicle?.vehicle_id) {
      dispatch(fetchVehicleAssignment(vehicle.vehicle_id));
    }
  }, [vehicle?.vehicle_id, dispatch]);

  useEffect(() => {
    if (
      successMsg === "Assignment confirmed" ||
      successMsg === "Driver changed successfully"
    ) {
      const timer = setTimeout(() => {
        dispatch(clearFleetError());
        resetForm();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [successMsg, dispatch]);

  const resetForm = () => {
    setMode(null);
    setSelectedDriverId("");
    setStartTime("00:00");
    setEndTime("23:59");
  };

  const handleClose = () => {
    dispatch(clearSelectedVehicleForManage());
    dispatch(clearFleetError());
    resetForm();
  };

  const openAssignMode = () => {
    dispatch(fetchAvailableDrivers({ fleetId: fleet.fleet_id, vehicleId: vehicle.vehicle_id }));
    setMode("assign");
  };

  const openChangeMode = () => {
    dispatch(fetchAvailableDrivers({ fleetId: fleet.fleet_id, vehicleId: vehicle.vehicle_id }));
    setMode("change");
  };

  const handleConfirm = () => {
    if (!selectedDriverId) return alert("Please select a driver");
    if (!startTime || !endTime) return alert("Please provide start and end times");

    if (mode === "assign") {
      dispatch(
        assignDriverToVehicle({
          fleetId: fleet.fleet_id,
          payload: {
            vehicle_id: vehicle.vehicle_id,
            driver_id: parseInt(selectedDriverId),
            start_time: startTime,
            end_time: endTime,
          },
        })
      );
    } else if (mode === "change") {
      dispatch(
        changeDriver({
          vehicleId: vehicle.vehicle_id,
          fleetId: fleet.fleet_id,
          payload: {
            driver_id: parseInt(selectedDriverId),
            start_time: startTime,
            end_time: endTime,
          },
        })
      );
    }
  };

  if (!vehicle) return null;

  return (
    <div className="mam-overlay" onClick={handleClose}>
      <div className="mam-modal" onClick={(e) => e.stopPropagation()}>

        {/* Header */}
        <div className="mam-header">
          <div>
            <h2>{hasDriver ? "Manage Asset" : "Manage Vehicle"}</h2>
            <p className="mam-vehicle-reg">{vehicle.registration_no}</p>
          </div>
          <button className="mam-close-btn" onClick={handleClose}>×</button>
        </div>

        {error && <div className="mam-error">{error}</div>}
        {successMsg && <div className="mam-success">{successMsg}</div>}

        <div className="mam-content">

          {/* Vehicle Info */}
          <div className="mam-section">
            <h3>Vehicle Information</h3>
            <div className="mam-info-grid">
              <div className="mam-info-item">
                <span className="mam-label">Category</span>
                <span className="mam-value">{vehicle.category}</span>
              </div>
              <div className="mam-info-item">
                <span className="mam-label">Status</span>
                <span className={`mam-status-badge ${String(vehicle.status || "").toLowerCase()}`}>
                  {vehicle.status}
                </span>
              </div>
              <div className="mam-info-item">
                <span className="mam-label">Approval</span>
                <span className={`mam-approval-badge ${String(vehicle.approval_status || "").toLowerCase()}`}>
                  {vehicle.approval_status}
                </span>
              </div>
            </div>
          </div>

          {/* Driver Assignment Section */}
          <div className="mam-section">
            <h3>Driver Assignment</h3>

            {loading && vehicleAssignment === null && !mode ? (
              <div className="mam-loading">Loading assignment details...</div>

            ) : mode ? (
              /* Assign / Change Form */
              <div className="mam-assign-form">
                <div className="mam-form-group">
                  <label>Select Driver</label>
                  <select
                    value={selectedDriverId}
                    onChange={(e) => setSelectedDriverId(e.target.value)}
                    className="mam-select"
                  >
                    <option value="">Choose a driver...</option>
                    {availableDrivers.map((driver) => (
                      <option key={driver.driver_id} value={driver.driver_id}>
                        {driver.full_name} ({driver.email})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="mam-time-row">
                  <div className="mam-form-group">
                    <label>Start Time</label>
                    <input
                      type="time"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      className="mam-input"
                    />
                  </div>
                  <div className="mam-form-group">
                    <label>End Time</label>
                    <input
                      type="time"
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      className="mam-input"
                    />
                  </div>
                </div>

                <div className="mam-form-actions">
                  <button className="mam-btn-secondary" onClick={resetForm}>
                    Cancel
                  </button>
                  <button
                    className="mam-btn-primary"
                    onClick={handleConfirm}
                    disabled={loading}
                  >
                    {loading
                      ? mode === "change" ? "Changing..." : "Assigning..."
                      : mode === "change" ? "Confirm Change" : "Confirm Assignment"}
                  </button>
                </div>
              </div>

            ) : !hasDriver ? (
              /* No Driver: Unassigned card */
              <div className="mam-unassigned-card">
                <div className="mam-unassigned-icon">🚗</div>
                <div className="mam-unassigned-body">
                  <h4>Vehicle Unassigned</h4>
                  <p>
                    This vehicle is verified and active but has no driver assigned.
                    Assign a driver to put it into service.
                  </p>
                  <div className="mam-unassigned-chips">
                    <span className="mam-chip">{vehicle.category}</span>
                    <span className="mam-chip mam-chip--active">{vehicle.status}</span>
                    <span className="mam-chip mam-chip--approved">{vehicle.approval_status}</span>
                  </div>
                </div>
                <button className="mam-btn-primary" onClick={openAssignMode}>
                  Assign Driver
                </button>
              </div>

            ) : (
              /* Has Driver: driver card + Change Driver */
              <div className="mam-assignment-card">
                <div className="mam-driver-info">
                  <div className="mam-driver-avatar">
                    {vehicleAssignment.driver_name?.charAt(0).toUpperCase() || "D"}
                  </div>
                  <div>
                    <h4>{vehicleAssignment.driver_name || "Unknown Driver"}</h4>
                    {vehicleAssignment.start_time && vehicleAssignment.end_time && (
                      <p className="mam-time-info">
                        {vehicleAssignment.start_time} – {vehicleAssignment.end_time}
                      </p>
                    )}
                    {vehicleAssignment.is_active && (
                      <span className="mam-active-badge">Active</span>
                    )}
                  </div>
                </div>
                <button className="mam-btn-secondary" onClick={openChangeMode}>
                  Change Driver
                </button>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default ManageAssetModal;