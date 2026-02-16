import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchVehicleAssignment,
  clearSelectedVehicleForManage,
  clearFleetError,
  fetchAvailableDrivers,
  assignDriverToVehicle,
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

  const [showAssignDriver, setShowAssignDriver] = useState(false);
  const [selectedDriverId, setSelectedDriverId] = useState("");
  const [startTime, setStartTime] = useState("00:00");
  const [endTime, setEndTime] = useState("23:59");
  const [showStatusChange, setShowStatusChange] = useState(false);
  const [newStatus, setNewStatus] = useState("");

  useEffect(() => {
    if (vehicle?.vehicle_id) {
      dispatch(fetchVehicleAssignment(vehicle.vehicle_id));
    }
  }, [vehicle?.vehicle_id, dispatch]);

  useEffect(() => {
    if (successMsg) {
      const timer = setTimeout(() => {
        dispatch(clearFleetError());
        if (successMsg.includes("Assignment confirmed") || successMsg.includes("status updated")) {
          setShowAssignDriver(false);
          setShowStatusChange(false);
          setSelectedDriverId("");
          setStartTime("00:00");
          setEndTime("23:59");
          setNewStatus("");
          if (vehicle?.vehicle_id) {
            dispatch(fetchVehicleAssignment(vehicle.vehicle_id));
          }
        }
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [successMsg, dispatch, vehicle?.vehicle_id]);

  const handleClose = () => {
    dispatch(clearSelectedVehicleForManage());
    dispatch(clearFleetError());
    setShowAssignDriver(false);
    setShowStatusChange(false);
    setSelectedDriverId("");
    setStartTime("00:00");
    setEndTime("23:59");
    setNewStatus("");
  };

  const handleShowAssignDriver = () => {
    dispatch(
      fetchAvailableDrivers({
        fleetId: fleet.fleet_id,
        vehicleId: vehicle.vehicle_id,
      })
    );
    setShowAssignDriver(true);
  };

  const handleAssignDriver = () => {
    if (!selectedDriverId) {
      alert("Please select a driver");
      return;
    }

    if (!startTime || !endTime) {
      alert("Please provide start and end times");
      return;
    }

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
  };

  const handleShowStatusChange = () => {
    setNewStatus(vehicle.status);
    setShowStatusChange(true);
  };

  const handleUpdateStatus = () => {
    if (!newStatus) {
      alert("Please select a status");
      return;
    }

    dispatch(
      updateVehicleStatus({
        fleetId: fleet.fleet_id,
        vehicleId: vehicle.vehicle_id,
        status: newStatus,
      })
    );
  };

  if (!vehicle) return null;

  return (
    <div className="mam-overlay" onClick={handleClose}>
      <div className="mam-modal" onClick={(e) => e.stopPropagation()}>
        <div className="mam-header">
          <div>
            <h2>Manage Asset</h2>
            <p className="mam-vehicle-reg">{vehicle.registration_no}</p>
          </div>
          <button className="mam-close-btn" onClick={handleClose}>
            ×
          </button>
        </div>

        {error && <div className="mam-error">{error}</div>}
        {successMsg && <div className="mam-success">{successMsg}</div>}

        <div className="mam-content">
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

          <div className="mam-section">
            <div className="mam-section-header">
              <h3>Driver Assignment</h3>
              {!vehicleAssignment?.driver_id && !showAssignDriver && (
                <button className="mam-btn-secondary" onClick={handleShowAssignDriver}>
                  Assign Driver
                </button>
              )}
            </div>

            {loading && !vehicleAssignment && !showAssignDriver ? (
              <div className="mam-loading">Loading assignment details...</div>
            ) : vehicleAssignment && vehicleAssignment.driver_id ? (
              <div className="mam-assignment-card">
                <div className="mam-driver-info">
                  <div className="mam-driver-avatar">
                    {vehicleAssignment.driver_name?.charAt(0).toUpperCase() || "D"}
                  </div>
                  <div className="mam-driver-details">
                    <h4>{vehicleAssignment.driver_name || "Unknown Driver"}</h4>
                    {vehicleAssignment.start_time && vehicleAssignment.end_time && (
                      <p className="mam-time-info">
                        {vehicleAssignment.start_time} - {vehicleAssignment.end_time}
                      </p>
                    )}
                    {vehicleAssignment.is_active && (
                      <span className="mam-active-badge">Active</span>
                    )}
                  </div>
                </div>
                <button className="mam-btn-secondary" onClick={handleShowAssignDriver}>
                  Change Driver
                </button>
              </div>
            ) : showAssignDriver ? (
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
                  <button
                    className="mam-btn-secondary"
                    onClick={() => {
                      setShowAssignDriver(false);
                      setSelectedDriverId("");
                      setStartTime("00:00");
                      setEndTime("23:59");
                    }}
                  >
                    Cancel
                  </button>
                  <button className="mam-btn-primary" onClick={handleAssignDriver} disabled={loading}>
                    {loading ? "Assigning..." : "Confirm Assignment"}
                  </button>
                </div>
              </div>
            ) : (
              <div className="mam-no-assignment">
                <p>No driver currently assigned to this vehicle</p>
              </div>
            )}
          </div>

          {/* <div className="mam-section">
            <div className="mam-section-header">
              <h3>Vehicle Status</h3>
              {!showStatusChange && (
                <button className="mam-btn-secondary" onClick={handleShowStatusChange}>
                  Change Status
                </button>
              )}
            </div>

            {showStatusChange ? (
              <div className="mam-status-form">
                <div className="mam-form-group">
                  <label>Select New Status</label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    className="mam-select"
                  >
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="INACTIVE">INACTIVE</option>
                    <option value="MAINTENANCE">MAINTENANCE</option>
                  </select>
                </div>
                <div className="mam-form-actions">
                  <button
                    className="mam-btn-secondary"
                    onClick={() => {
                      setShowStatusChange(false);
                      setNewStatus("");
                    }}
                  >
                    Cancel
                  </button>
                  <button className="mam-btn-primary" onClick={handleUpdateStatus} disabled={loading}>
                    {loading ? "Updating..." : "Update Status"}
                  </button>
                </div>
              </div>
            ) : (
              <div className="mam-status-info">
                <p>Current status: <strong>{vehicle.status}</strong></p>
              </div>
            )}
          </div> */}
        </div>
      </div>
    </div>
  );
};

export default ManageAssetModal;