import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchFleetDrivers, addDriverToFleet, clearFleetError } from "../../../store/fleetSlice";
import "./DriverManager.css";

const DriverManager = ({ fleetId }) => {
  const dispatch = useDispatch();
  const { drivers = [], loading, error, successMsg } = useSelector((state) => state.fleet);

  const [showAddModal, setShowAddModal] = useState(false);
  const [newDriver, setNewDriver] = useState({ email: "", type: "CAB" });

  useEffect(() => {
    if (fleetId) dispatch(fetchFleetDrivers(fleetId));
  }, [fleetId, dispatch]);

  const closeModal = () => {
    setShowAddModal(false);
    setNewDriver({ email: "", type: "CAB" });
    dispatch(clearFleetError());
  };

  const handleAddDriver = (e) => {
    e.preventDefault();
    dispatch(clearFleetError());

    dispatch(
      addDriverToFleet({
        fleetId,
        payload: {
          email: newDriver.email.trim(),
          driver_type: newDriver.type,
        },
      })
    ).then((res) => {
      if (!res.error) closeModal();
    });
  };

  return (
    <div className="dm-container">
      <div className="dm-header">
        <div className="dm-title-box">
          <h2>Driver Manager</h2>
          <p>Manage and onboard drivers to your fleet operations.</p>
        </div>

        <button className="dm-add-btn" onClick={() => setShowAddModal(true)}>
          + Onboard Driver
        </button>
      </div>

      {(error || successMsg) && (
        <div className={`dm-alert ${error ? "error" : "success"}`}>
          {String(error || successMsg)}
        </div>
      )}

      <div className="dm-table-card">
        <table className="dm-table">
          <thead>
            <tr>
              <th>Driver Info</th>
              <th>Contact Details</th>
              <th>Category</th>
              <th>Approval Status</th>
              {/* <th>Action</th> */}
            </tr>
          </thead>
          <tbody>
            {drivers.map((driver) => (
              <tr key={driver.driver_id}>
                <td>
                  <div className="dm-user-info">
                    <span className="dm-user-name">{driver.full_name}</span>
                    <span className="dm-user-id">ID: #{driver.driver_id}</span>
                  </div>
                </td>
                <td>
                  <div className="dm-contact-info">
                    <span>{driver.phone || "No Phone"}</span>
                    <span>{driver.email}</span>
                  </div>
                </td>
                <td>
                  <span className="dm-type-pill">{driver.driver_type}</span>
                </td>
                <td>
                  <span className={`dm-status-pill ${String(driver.approval_status).toLowerCase()}`}>
                    {driver.approval_status}
                  </span>
                </td>
                {/* <td>
                  <button className="dm-manage-link" type="button">
                    Manage Profile
                  </button>
                </td> */}
              </tr>
            ))}
          </tbody>
        </table>

        {drivers.length === 0 && !loading && (
          <div className="dm-empty">No drivers onboarded yet.</div>
        )}
      </div>

      {showAddModal && (
        <div className="dm-overlay">
          <div className="dm-modal">
            <header className="dm-modal-header">
              <h3>Onboard New Driver</h3>
              <button onClick={closeModal}>×</button>
            </header>

            <form onSubmit={handleAddDriver} className="dm-modal-form">
              <div className="dm-field">
                <label>Driver Email</label>
                <input
                  type="email"
                  placeholder="Enter driver's email"
                  required
                  value={newDriver.email}
                  onChange={(e) =>
                    setNewDriver({ ...newDriver, email: e.target.value })
                  }
                />
                <small>The driver must already be registered with this email.</small>
              </div>

              <div className="dm-field">
                <label>Operation Category</label>
                <select
                  value={newDriver.type}
                  onChange={(e) => setNewDriver({ ...newDriver, type: e.target.value })}
                >
                  <option value="CAB">Cab / Taxi</option>
                  <option value="BIKE">Motorcycle</option>
                  <option value="AUTO">Auto Rickshaw</option>
                </select>
              </div>

              <div className="dm-modal-footer">
                <button type="button" className="dm-btn-cancel" onClick={closeModal}>
                  Cancel
                </button>
                <button type="submit" className="dm-btn-submit" disabled={loading}>
                  {loading ? "Adding..." : "Confirm Onboarding"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DriverManager;
