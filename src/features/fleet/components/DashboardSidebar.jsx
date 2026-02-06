import React from "react";
import "./DashboardSidebar.css";

const DashboardSidebar = ({ fleetName, activeTab, setActiveTab }) => {
  const menu = [
    { id: "OVERVIEW", label: "Overview", icon: "📊" },
    { id: "VEHICLES", label: "Fleet Assets", icon: "🚗" },
    { id: "DRIVERS", label: "Driver Roster", icon: "👥" },
    { id: "ASSIGNMENTS", label: "Assignments", icon: "🔑" },
    { id: "EARNINGS", label: "Financials", icon: "💰", disabled: true },
  ];

  return (
    <aside className="ds-sidebar">
      <div className="ds-brand-section">
        Rydo<span className="ds-badge">FLEET</span>
      </div>

      <div className="ds-user-card">
        <div className="ds-avatar"></div>
        <div className="ds-user-info">
          <span className="ds-name">{fleetName || "Fleet Owner"}</span>
          <span className="ds-role">Fleet Owner</span>
        </div>
      </div>

      <nav className="ds-nav">
        {menu.map((item) => (
          <button
            key={item.id}
            className={`ds-link ${activeTab === item.id ? "active" : ""} ${item.disabled ? "disabled" : ""}`}
            onClick={() => !item.disabled && setActiveTab(item.id)}
            disabled={item.disabled}
          >
            <span className="ds-icon">{item.icon}</span>
            {item.label}
          </button>
        ))}
      </nav>

      <div className="ds-footer">
        <button
          className="ds-logout-btn"
          onClick={() => {
            localStorage.clear();
            window.location.href = "/login";
          }}
        >
          Log Out
        </button>
      </div>
    </aside>
  );
};

export default DashboardSidebar;
