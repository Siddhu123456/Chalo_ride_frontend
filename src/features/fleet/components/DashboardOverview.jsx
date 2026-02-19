import React, { useMemo } from "react";
import { useSelector } from "react-redux";
import "./DashboardOverview.css";
import { FaCar, FaCheck, FaFileAlt, FaUsers } from 'react-icons/fa';

const DashboardOverview = ({ onAddVehicle }) => {
  const { vehicles = [], drivers = [] } = useSelector((state) => state.fleet);

  const pendingVehicles = useMemo(() => {
    return vehicles.filter((v) => v.approval_status !== "APPROVED");
  }, [vehicles]);

  const approvedVehicles = useMemo(() => {
    return vehicles.filter((v) => v.approval_status === "APPROVED" && v.status === "ACTIVE");
  }, [vehicles]);

  const stats = [
    { label: "Total Vehicles", value: vehicles.length, icon: <FaCar className="icon-inline" /> },
    { label: "Approved Assets", value: approvedVehicles.length, icon: <FaCheck className="icon-inline" /> },
    { label: "Pending Vehicles", value: pendingVehicles.length, icon: <FaFileAlt className="icon-inline" /> },
    { label: "Active Drivers", value: drivers.length, icon: <FaUsers className="icon-inline" /> },
  ];

  return (
    <div className="do-container">
      
      <div className="do-stats-grid">
        {stats.map((stat, i) => (
          <div key={i} className="do-stat-card">
            <div className="do-stat-icon">{stat.icon}</div>
            <div className="do-stat-info">
              <span className="do-stat-label">{stat.label}</span>
              <span className="do-stat-value">{stat.value}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="do-content-grid">
        
        <div className="do-main-card">
          <div className="do-card-head">
            <h3>Pending Verification</h3>
            <button className="do-action-btn" onClick={onAddVehicle}>
              + Add Vehicle
            </button>
          </div>

          {pendingVehicles.length === 0 ? (
            <p className="do-empty-msg"><FaCheck className="icon-inline" /> All vehicles are verified</p>
          ) : (
            <div className="do-pending-list">
              {pendingVehicles.slice(0, 5).map((v) => (
                <div key={v.vehicle_id} className="do-pending-item">
                  <div>
                    <strong>{v.registration_no}</strong>
                    <span className="do-subtext">
                      {v.category} • {v.approval_status}
                    </span>
                  </div>

                  <span className="do-pill pending">Pending Docs</span>
                </div>
              ))}
              {pendingVehicles.length > 5 && (
                <p className="do-subtext">+{pendingVehicles.length - 5} more pending vehicles</p>
              )}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default DashboardOverview;
