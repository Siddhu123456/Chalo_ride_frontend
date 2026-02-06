import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchFleetVehicles,
  fetchAvailableDrivers,
  assignDriverToVehicle,
  clearFleetError,
} from "../../../store/fleetSlice";
import "./AssignmentManager.css";

/* ===================== HELPERS ===================== */
// Convert "HH:mm" → ISO TIMESTAMPTZ for today
const timeToTodayISO = (timeHHmm) => {
  const [hours, minutes] = timeHHmm.split(":").map(Number);
  const now = new Date();
  now.setHours(hours, minutes, 0, 0);
  return now.toISOString();
};

const getNowTime = () => new Date().toTimeString().slice(0, 5); // HH:mm

const AssignmentManager = ({ fleetId }) => {
  const dispatch = useDispatch();
  const {
    vehicles = [],
    availableDrivers = [],
    loading = false,
    error,
    successMsg,
  } = useSelector((state) => state.fleet);

  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [selectedDriverId, setSelectedDriverId] = useState("");

  // ✅ TIME ONLY (daily recurring)
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("18:00");



  useEffect(() => {
    if (fleetId) dispatch(fetchFleetVehicles(fleetId));
  }, [fleetId, dispatch]);

  useEffect(() => {
    dispatch(clearFleetError());
  }, [dispatch]);

  const approvedVehicles = useMemo(() => {
    return vehicles.filter(
      (v) => v.approval_status === "APPROVED" && v.status === "ACTIVE"
    );
  }, [vehicles]);

  const handleVehicleSelect = (v) => {
    setSelectedVehicle(v);
    setSelectedDriverId("");
    dispatch(fetchAvailableDrivers({ fleetId, vehicleId: v.vehicle_id }));
  };

  const handleAssign = async (e) => {
    e.preventDefault();
    if (!selectedVehicle || !selectedDriverId) return;

    await dispatch(
      assignDriverToVehicle({
        fleetId,
        payload: {
          vehicle_id: selectedVehicle.vehicle_id,
          driver_id: Number(selectedDriverId),

          // ✅ convert TIME → TIMESTAMPTZ
          start_time: startTime,
          end_time: endTime, // daily recurring until updated by fleet owner
        },
      })
    );

    setSelectedVehicle(null);
    setSelectedDriverId("");
  };

  return (
    <div className="am-container">
      <header className="am-header">
        <h2>Deployment Manager</h2>
        <p>Assign qualified drivers to verified fleet assets.</p>
      </header>

      {(error || successMsg) && (
        <div className={`am-banner ${error ? "error" : "success"}`}>
          <span>{error || successMsg}</span>
          <button type="button" onClick={() => dispatch(clearFleetError())}>
            ✕
          </button>
        </div>
      )}

      <div className="am-main-grid">
        {/* LEFT */}
        <div className="am-card selection-card">
          <h3>1. Select Verified Vehicle</h3>

          <div className="am-list">
            {approvedVehicles.map((v) => (
              <div
                key={v.vehicle_id}
                className={`am-item ${selectedVehicle?.vehicle_id === v.vehicle_id ? "active" : ""
                  }`}
                onClick={() => handleVehicleSelect(v)}
                role="button"
                tabIndex={0}
              >
                <div className="am-item-info">
                  <span className="am-reg">{v.registration_no}</span>
                  <span className="am-cat">{v.category}</span>
                </div>
                <span className="am-arrow">→</span>
              </div>
            ))}

            {approvedVehicles.length === 0 && !loading && (
              <div className="am-empty-left">
                <p>No approved active vehicles found.</p>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT */}
        <div className="am-card action-card">
          <h3>2. Dispatch Assignment</h3>

          {selectedVehicle ? (
            <form onSubmit={handleAssign} className="am-assignment-form">
              <div className="am-context-box">
                <span>
                  Vehicle:{" "}
                  <strong>{selectedVehicle.registration_no}</strong>
                </span>
                <span>
                  Requirement:{" "}
                  <strong>{selectedVehicle.category} Driver</strong>
                </span>
              </div>

              <div className="am-field">
                <label>Available {selectedVehicle.category} Drivers</label>

                <select
                  required
                  value={selectedDriverId}
                  onChange={(e) => setSelectedDriverId(e.target.value)}
                  className="am-select"
                  disabled={loading}
                >
                  <option value="">Choose a driver...</option>
                  {availableDrivers.map((d) => (
                    <option key={d.driver_id} value={d.driver_id}>
                      {d.full_name} (ID: #{d.driver_id})
                    </option>
                  ))}
                </select>

                {availableDrivers.length === 0 && !loading && (
                  <p className="am-error-text">
                    No available drivers matched for this category.
                  </p>
                )}
              </div>

              {/* ✅ TIME ONLY */}
              <div className="am-field">
                <label>Deployment Start Time</label>
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  required
                />
              </div>

              <div className="am-field">
                <label>Deployment End Time</label>
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  required
                />
              </div>



              <button
                type="submit"
                className="am-submit-btn"
                disabled={!selectedDriverId || loading}
              >
                {loading ? "Processing..." : "Confirm Dispatch"}
              </button>
            </form>
          ) : (
            <div className="am-placeholder-state">
              <div className="am-icon-circle">🔑</div>
              <p>
                Select a vehicle from the roster to see available drivers for
                deployment.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AssignmentManager;
