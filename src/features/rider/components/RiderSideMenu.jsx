import React from "react";
import { NavLink } from "react-router-dom";
import logo from "../../../assets/logo.png";
import "./RiderSideMenu.css";

const RiderSideMenu = () => {
  
  const handleLogout = () => {
    console.log("Rider logged out!");
  };

  return (
    <div className="side-menu-rider">
      <div className="menu-header-rider">
        <img src={logo} alt="ChaloRide Logo" className="menu-logo-rider" />
        <p>Rider</p>
      </div>

      <nav className="menu-items-rider">
        <NavLink 
          to="/home" 
          className={({ isActive }) => `menu-item-rider ${isActive ? 'active-rider' : ''}`}
        >
          <i className="menu-icon-rider">🏠</i>
          Home
        </NavLink>

        <NavLink 
          to="/trips/history" 
          className={({ isActive }) => `menu-item-rider ${isActive ? 'active-rider' : ''}`}
        >
          <i className="menu-icon-rider">📜</i>
          Trip History
        </NavLink>

        <NavLink 
          to="/profile" 
          className={({ isActive }) => `menu-item-rider ${isActive ? 'active-rider' : ''}`}
        >
          <i className="menu-icon-rider">👤</i>
          Profile
        </NavLink>

        <button onClick={handleLogout} className="menu-item-rider logout-btn-rider">
          <i className="menu-icon-rider">👋</i>
          Log Out
        </button>
      </nav>
    </div>
  );
};

export default RiderSideMenu;