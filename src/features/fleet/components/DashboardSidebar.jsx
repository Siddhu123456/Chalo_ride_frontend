import React from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import logo from '../../../assets/logo.png';
import { logout } from "../../../store/authSlice";
import "./DashboardSidebar.css";
import { FaChartBar, FaCar, FaUsers, FaKey, FaMoneyBillWave } from 'react-icons/fa';

const DashboardSidebar = ({ fleetName, activeTab, setActiveTab }) => {
  const menu = [
    { id: "OVERVIEW", label: "Overview", icon: <FaChartBar className="icon-inline ds-menu-icon" /> },
    { id: "VEHICLES", label: "Fleet Assets", icon: <FaCar className="icon-inline ds-menu-icon" /> },
    { id: "DRIVERS", label: "Driver Management", icon: <FaUsers className="icon-inline ds-menu-icon" /> },
    // { id: "ASSIGNMENTS", label: "Assignments", icon: <FaKey className="icon-inline ds-menu-icon" /> },
    { id: "EARNINGS", label: "Financials", icon: <FaMoneyBillWave className="icon-inline ds-menu-icon" /> },
  ];
  
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());        
    localStorage.clear();

    navigate("/auth", { replace: true });
  };


  return (
    <aside className="ds-sidebar">
      <div className="ds-brand-section">
        <img src={logo} alt="ChaloRide Logo" className="ds-logo-img" />
        <span className="ds-badge">FLEET</span>
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
          onClick={handleLogout}
        >
          Log Out
        </button>
      </div>
    </aside>
  );
};

export default DashboardSidebar;
