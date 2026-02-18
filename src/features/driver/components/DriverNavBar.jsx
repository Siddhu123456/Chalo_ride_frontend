import React from "react";
import { useSelector } from "react-redux";
import "./DriverNavBar.css";

const DriverNavBar = ({ onMenuToggle }) => {
  const { profile, dashboardSummary } = useSelector(
    (state) => state.driver
  );

  const driverName = profile?.full_name || "Driver";
  const tenantName = dashboardSummary?.tenant?.tenant_name;
  const fleetName = dashboardSummary?.fleet?.fleet_name;

  return (
    <nav className="driver-navbar">
      {/* Hamburger — only visible on mobile via CSS */}
      <button
        className="navbar-hamburger"
        onClick={onMenuToggle}
        aria-label="Open menu"
      >
        <span />
        <span />
        <span />
      </button>

      <div className="driver-navbar-left">
        <span className="welcome-message">
          {tenantName && (
            <span className="tenant-name"> · {tenantName}</span>
          )}
        </span>
      </div>

      <div className="driver-navbar-right">
        {fleetName && (
          <div className="fleet-info">
            <span className="fleet-name">{fleetName}</span>
          </div>
        )}
        <div className="driver-profile">
          <img
            src="https://via.placeholder.com/40"
            alt={driverName[0]}
            className="profile-avatar"
          />
          <span className="driver-name">{driverName}</span>
        </div>
      </div>
    </nav>
  );
};

export default DriverNavBar;