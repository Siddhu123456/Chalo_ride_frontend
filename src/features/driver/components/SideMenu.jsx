import React from "react";
import { NavLink } from "react-router-dom";
import "./SideMenu.css";

const SideMenu = () => {
  return (
    <div className="side-menu">
      {/* Header */}
      <div className="menu-header">
        <img src="/logo.png" alt="ChaloRide Logo" className="menu-logo" />
        <p>Driver</p>
      </div>

      {/* Menu */}
      <nav className="menu-items">
        {/* Dashboard */}
        <NavLink to="/driver/dashboard" className={({ isActive }) => `menu-item${isActive ? ' active' : ''}`}>
          Dashboard
        </NavLink>

        {/* Profile */}
        <NavLink to="/driver/profile" className={({ isActive }) => `menu-item${isActive ? ' active' : ''}`}>
          Profile
        </NavLink>

        {/* Shift (view only) */}
        <NavLink to="/driver/shift/current" className={({ isActive }) => `menu-item${isActive ? ' active' : ''}`}>
          Current Shift
        </NavLink>

        {/* Offers */}
        <NavLink to="/driver/offers" className={({ isActive }) => `menu-item${isActive ? ' active' : ''}`}>
          Trip Offers
        </NavLink>

        {/* Active Trip */}
        <NavLink to="/driver/trips/active" className={({ isActive }) => `menu-item${isActive ? ' active' : ''}`}>
          Active Trip
        </NavLink>

        {/* Vehicle */}
        <NavLink to="/driver/vehicle" className={({ isActive }) => `menu-item${isActive ? ' active' : ''}`}>
          Assigned Vehicle
        </NavLink>
      </nav>
    </div>
  );
};

export default SideMenu;
