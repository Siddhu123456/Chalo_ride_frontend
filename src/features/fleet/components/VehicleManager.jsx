import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchFleetVehicles, setSelectedVehicleForDocs } from "../../../store/fleetSlice";
import VehicleDocsModal from "./VehicleDocsModal";
import "./VehicleManager.css";

const FILTERS = {
  APPROVED: "Approved Assets",
  PENDING: "Pending Documents",
  REJECTED: "Rejected",
  ALL: "All Vehicles",
};

const VehicleManager = ({ fleetId, onAdd }) => {
  const dispatch = useDispatch();
  const { vehicles = [], loading = false, selectedVehicleForDocs } = useSelector(
    (state) => state.fleet
  );

  const [filter, setFilter] = useState("APPROVED");

  useEffect(() => {
    if (fleetId) dispatch(fetchFleetVehicles(fleetId));
  }, [fleetId, dispatch]);

  const filteredVehicles = useMemo(() => {
    const list = Array.isArray(vehicles) ? vehicles : [];

    if (filter === "APPROVED") {
      return list.filter((v) => v.approval_status === "APPROVED" && v.status === "ACTIVE");
    }
    if (filter === "PENDING") {
      return list.filter((v) => v.approval_status !== "APPROVED");
    }
    if (filter === "REJECTED") {
      return list.filter((v) => v.approval_status === "REJECTED");
    }
    return list;
  }, [vehicles, filter]);

  const getDocBadge = (v) => {
    const isVerified = v.approval_status === "APPROVED" && v.status === "ACTIVE";
    if (isVerified) return { text: "Verified", cls: "verified" };
    return { text: "Documents Pending", cls: "pending" };
  };

  if (loading && vehicles.length === 0) {
    return <div className="vm-loader">Syncing fleet assets...</div>;
  }

  return (
    <div className="vm-container">
      <div className="vm-action-bar">
        <div className="vm-title-box">
          <h2>Fleet Assets</h2>
          <p>Manage and monitor vehicle verification status.</p>
        </div>

        <div className="vm-actions-right">
          <select value={filter} onChange={(e) => setFilter(e.target.value)} className="vm-filter">
            {Object.entries(FILTERS).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>

          <button className="vm-btn-primary" onClick={onAdd}>
            + Add Vehicle
          </button>
        </div>
      </div>

      <div className="vm-grid">
        {filteredVehicles.map((v) => {
          const badge = getDocBadge(v);
          const isVerified = v.approval_status === "APPROVED" && v.status === "ACTIVE";

          return (
            <div key={v.vehicle_id} className="vm-card">
              <div className="vm-card-head">
                <span className="vm-reg">{v.registration_no}</span>

                <div className="vm-pill-group">
                  <span className={`vm-doc-pill ${badge.cls}`}>{badge.text}</span>
                  <span className={`vm-status-pill ${String(v.status || "").toLowerCase()}`}>
                    {v.status}
                  </span>
                </div>
              </div>

              <div className="vm-card-body">
                <div className="vm-info-row">
                  <span>Category</span>
                  <span className="vm-cat-tag">{v.category}</span>
                </div>

                <div className="vm-info-row">
                  <span>Approval</span>
                  <span className={`vm-appr ${String(v.approval_status || "").toLowerCase()}`}>
                    {v.approval_status}
                  </span>
                </div>
              </div>

              <div className="vm-card-actions">
                
                {isVerified ? (
                  <button className="vm-btn-manage" type="button">
                    Manage Asset
                  </button>
                ) : (
                  
                  <button
                    className="vm-btn-outline"
                    type="button"
                    onClick={() => dispatch(setSelectedVehicleForDocs(v))}
                  >
                    Upload Docs
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {filteredVehicles.length === 0 && !loading && (
        <div className="vm-empty-state">
          <h3>No vehicles found</h3>
          <p>Try switching the filter or add a new vehicle.</p>
          <button onClick={onAdd} className="vm-btn-outline">
            Register Vehicle
          </button>
        </div>
      )}

      
      {selectedVehicleForDocs && <VehicleDocsModal />}
    </div>
  );
};

export default VehicleManager;
