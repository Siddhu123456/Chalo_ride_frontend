import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchFleetVehicles,
  fetchUnassignedVehicles,
  setSelectedVehicleForDocs,
  setSelectedVehicleForManage,
} from "../../../store/fleetSlice";
import VehicleDocsModal from "./VehicleDocsModal";
import ManageAssetModal from "./ManageAssetModal";
import "./VehicleManager.css";

const FILTERS = {
  APPROVED: "Approved Assets",
  PENDING: "Pending Documents",
  REJECTED: "Rejected",
  ALL: "All Vehicles",
};

const VehicleManager = ({ fleetId, onAdd }) => {
  const dispatch = useDispatch();
  const {
    vehicles = [],
    unassignedVehicles = [],
    loading = false,
    selectedVehicleForDocs,
    selectedVehicleForManage,
  } = useSelector((state) => state.fleet);

  const [filter, setFilter] = useState("APPROVED");

  useEffect(() => {
    if (fleetId) {
      dispatch(fetchFleetVehicles(fleetId));
      dispatch(fetchUnassignedVehicles(fleetId));
    }
  }, [fleetId, dispatch]);

  // Refresh both lists when modal closes
  const prevManage = React.useRef(selectedVehicleForManage);
  useEffect(() => {
    if (prevManage.current && !selectedVehicleForManage && fleetId) {
      dispatch(fetchFleetVehicles(fleetId));
      dispatch(fetchUnassignedVehicles(fleetId));
    }
    prevManage.current = selectedVehicleForManage;
  }, [selectedVehicleForManage, fleetId, dispatch]);

  const unassignedIds = useMemo(
    () => new Set(unassignedVehicles.map((v) => v.vehicle_id)),
    [unassignedVehicles]
  );

  // Main filtered list — excludes unassigned vehicles entirely
  const filteredVehicles = useMemo(() => {
    const list = Array.isArray(vehicles) ? vehicles : [];

    let filtered;
    if (filter === "APPROVED") {
      filtered = list.filter((v) => v.approval_status === "APPROVED" && v.status === "ACTIVE");
    } else if (filter === "PENDING") {
      filtered = list.filter((v) => v.approval_status !== "APPROVED");
    } else if (filter === "REJECTED") {
      filtered = list.filter((v) => v.approval_status === "REJECTED");
    } else {
      filtered = list;
    }

    // Remove unassigned vehicles — they live in their own section
    return filtered.filter((v) => !unassignedIds.has(v.vehicle_id));
  }, [vehicles, unassignedIds, filter]);

  const getDocBadge = (v) => {
    if (v.approval_status === "APPROVED" && v.status === "ACTIVE")
      return { text: "Verified", cls: "verified" };
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
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="vm-filter"
          >
            {Object.entries(FILTERS).map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
          <button className="vm-btn-primary" onClick={onAdd}>
            + Add Vehicle
          </button>
        </div>
      </div>

      {/* ── Unassigned Vehicles Section ── */}
      {unassignedVehicles.length > 0 && (
        <div className="vm-unassigned-section">
          <div className="vm-unassigned-header">
            <div className="vm-unassigned-title">
              <span className="vm-unassigned-dot" />
              <h3>Unassigned Vehicles</h3>
              <span className="vm-unassigned-count">{unassignedVehicles.length}</span>
            </div>
            <p className="vm-unassigned-subtitle">
              These vehicles are verified but have no driver assigned.
            </p>
          </div>

          <div className="vm-grid">
            {unassignedVehicles.map((v) => (
              <div key={v.vehicle_id} className="vm-card vm-card--unassigned">
                <div className="vm-card-head">
                  <span className="vm-reg">{v.registration_no}</span>
                  <div className="vm-pill-group">
                    <span className="vm-pill-unassigned">No Driver</span>
                    <span className="vm-doc-pill verified">Verified</span>
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
                  <button
                    className="vm-btn-manage vm-btn-manage--urgent"
                    type="button"
                    onClick={() => dispatch(setSelectedVehicleForManage(v))}
                  >
                    ⚠ Assign Driver
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Main Vehicles Section ── */}
      <div className="vm-main-section">
        {unassignedVehicles.length > 0 && (
          <div className="vm-main-header">
            <h3>All Vehicles</h3>
          </div>
        )}

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
                    <button
                      className="vm-btn-manage"
                      type="button"
                      onClick={() => dispatch(setSelectedVehicleForManage(v))}
                    >
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
      </div>

      {selectedVehicleForDocs && <VehicleDocsModal />}
      {selectedVehicleForManage && <ManageAssetModal />}
    </div>
  );
};

export default VehicleManager;