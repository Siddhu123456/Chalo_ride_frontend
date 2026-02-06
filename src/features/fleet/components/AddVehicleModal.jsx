import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  addVehicle,
  resetVehicleStep,
  clearFleetError,
  setSelectedVehicleForDocs,
  clearSelectedVehicleForDocs,
} from "../../../store/fleetSlice";

import VehicleDocsModal from "./VehicleDocsModal";
import "../Fleet.css";

const AddVehicleModal = ({ fleetId, onClose }) => {
  const dispatch = useDispatch();
  const {
    currentVehicle,
    vehicleStep,
    loading,
    error,
    selectedVehicleForDocs,
  } = useSelector((state) => state.fleet);

  const [form, setForm] = useState({
    category: "CAB",
    registration_no: "",
    make: "",
    model: "",
    year_of_manufacture: new Date().getFullYear(),
  });

  /**
   * ✅ When vehicle is created -> open VehicleDocsModal automatically
   */
  useEffect(() => {
    if (vehicleStep === 2 && currentVehicle?.vehicle_id) {
      dispatch(setSelectedVehicleForDocs(currentVehicle));
    }
  }, [vehicleStep, currentVehicle, dispatch]);

  const safeClose = () => {
    if (loading) return;
    dispatch(resetVehicleStep());
    dispatch(clearFleetError());
    dispatch(clearSelectedVehicleForDocs());
    onClose();
  };

  const handleCreate = (e) => {
    e.preventDefault();
    dispatch(clearFleetError());

    dispatch(
      addVehicle({
        fleetId,
        vehicleData: form,
      })
    );
  };

  return (
    <div className="modal-overlay" onClick={safeClose}>
      <div className="modal-box large" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>
            {vehicleStep === 1 ? "Register Vehicle" : "Upload Vehicle Documents"}
          </h3>
          <button onClick={safeClose} className="close-btn" disabled={loading}>
            ×
          </button>
        </div>

        <div className="modal-body">
          {error && <div className="auth-alert error">{String(error)}</div>}

          {/* ✅ STEP 1: Create Vehicle */}
          {vehicleStep === 1 && (
            <form onSubmit={handleCreate} className="registration-form">
              <div className="form-row">
                <label>Registration Number</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. TS09AB1234"
                  value={form.registration_no}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      registration_no: e.target.value.toUpperCase(),
                    })
                  }
                />
              </div>

              <div className="form-row">
                <label>Make</label>
                <input
                  type="text"
                  placeholder="e.g. Hyundai"
                  value={form.make}
                  onChange={(e) => setForm({ ...form, make: e.target.value })}
                />
              </div>

              <div className="form-row">
                <label>Model</label>
                <input
                  type="text"
                  placeholder="e.g. i20"
                  value={form.model}
                  onChange={(e) => setForm({ ...form, model: e.target.value })}
                />
              </div>

              <div className="form-row split-flex-row">
                <div className="form-row">
                  <label>Category</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                  >
                    <option value="CAB">CAB</option>
                    <option value="AC-CAB">AC-CAB</option>
                    <option value="BIKE">BIKE</option>
                    <option value="AUTO">AUTO</option>
                  </select>
                </div>

                <div className="form-row">
                  <label>Manufacture Year</label>
                  <input
                    type="number"
                    value={form.year_of_manufacture}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        year_of_manufacture: Number(e.target.value),
                      })
                    }
                  />
                </div>
              </div>

              <div className="modal-actions">
                <button type="submit" className="rydo-btn-pri" disabled={loading}>
                  {loading ? "Creating..." : "Create Vehicle"}
                </button>
              </div>
            </form>
          )}

          {/* ✅ STEP 2: Show docs guidance text (upload UI handled by VehicleDocsModal) */}
          {vehicleStep === 2 && (
            <div className="docs-list">
              <p>
                Upload required documents for{" "}
                <strong>{currentVehicle?.registration_no}</strong>
              </p>
              <p style={{ opacity: 0.8, marginTop: "8px" }}>
                You must upload <strong>REGISTRATION</strong> and{" "}
                <strong>INSURANCE</strong> documents to activate this vehicle.
              </p>

              <button
                className="rydo-submit-btn"
                onClick={safeClose}
                disabled={loading}
                style={{ marginTop: "16px" }}
              >
                {loading ? "Saving..." : "Finish"}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ✅ Reuse same docs upload modal for Add Vehicle + Pending Vehicles */}
      {selectedVehicleForDocs && <VehicleDocsModal />}
    </div>
  );
};

export default AddVehicleModal;
