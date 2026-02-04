import React from "react";
import { NavLink } from "react-router-dom";
import logo from "../../../assets/logo.png";
import "./RiderSideMenu.css";

const RiderSideMenu = () => {
  
  const handleLogout = () => {
    console.log("Rider logged out!");
    // logic to clear tokens/redirect
  };

  return (
    <div className="side-menu">
      <div className="menu-header">
        <img src={logo} alt="ChaloRide Logo" className="menu-logo" />
        <p>Rider</p>
      </div>

      <nav className="menu-items">
        {/* 1. Home - The main booking screen */}
        <NavLink 
          to="/home" 
          className={({ isActive }) => `menu-item ${isActive ? 'active' : ''}`}
        >
          <i className="menu-icon">🏠</i>
          Home
        </NavLink>

        {/* 2. Trip History - Past rides */}
        <NavLink 
          to="/trips/history" 
          className={({ isActive }) => `menu-item ${isActive ? 'active' : ''}`}
        >
          <i className="menu-icon">📜</i>
          Trip History
        </NavLink>

        {/* 3. Profile - User settings */}
        <NavLink 
          to="/profile" 
          className={({ isActive }) => `menu-item ${isActive ? 'active' : ''}`}
        >
          <i className="menu-icon">👤</i>
          Profile
        </NavLink>

        {/* 4. Log Out Button - Positioned at the bottom */}
        <button onClick={handleLogout} className="menu-item logout-btn">
          <i className="menu-icon">👋</i>
          Log Out
        </button>
      </nav>
    </div>
  );
};

export default RiderSideMenu;