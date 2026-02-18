import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { logout } from "../../../store/authSlice";
import logo from "../../../assets/logo.png";
import "./SideMenu.css";

const SideMenu = ({ isOpen, onClose }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const demoCurrentShift = { isActive: true, activeTrip: null };

  const handleLogout = () => {
    dispatch(logout());
    localStorage.clear();
    navigate("/auth", { replace: true });
  };

  return (
    <div className={`side-menu${isOpen ? " open" : ""}`}>
      <div className="menu-header">
        <img src={logo} alt="ChaloRide Logo" className="menu-logo" />
        <p>Driver</p>
        {/* Close button — only visible on mobile via CSS */}
        <button
          className="menu-close-btn"
          onClick={onClose}
          aria-label="Close menu"
        >
          ✕
        </button>
      </div>

      <nav className="menu-items">
        <NavLink
          to="/driver/dashboard"
          onClick={onClose}
          className={({ isActive }) => `menu-item ${isActive ? "active" : ""}`}
        >
          Dashboard
        </NavLink>

        <NavLink
          to="/driver/offers"
          onClick={onClose}
          className={({ isActive }) => `menu-item ${isActive ? "active" : ""}`}
        >
          Trip Offers
        </NavLink>

        <NavLink
          to="/driver/trips/active"
          onClick={onClose}
          className={({ isActive }) =>
            `menu-item ${isActive ? "active" : ""} ${!demoCurrentShift.activeTrip ? "disabled" : ""}`
          }
        >
          Active Trip
        </NavLink>

        <NavLink
          to="/driver/tripHistory"
          onClick={onClose}
          className={({ isActive }) => `menu-item ${isActive ? "active" : ""}`}
        >
          Trip History
        </NavLink>

        <NavLink
          to="/driver/vehicle"
          onClick={onClose}
          className={({ isActive }) => `menu-item ${isActive ? "active" : ""}`}
        >
          Assigned Vehicle
        </NavLink>

        <NavLink
          to="/driver/profile"
          onClick={onClose}
          className={({ isActive }) => `menu-item ${isActive ? "active" : ""}`}
        >
          Profile
        </NavLink>

        <button onClick={handleLogout} className="menu-item logout-btn">
          Log Out
        </button>
      </nav>
    </div>
  );
};

export default SideMenu;