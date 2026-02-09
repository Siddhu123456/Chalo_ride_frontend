import React from "react";
import { NavLink } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";

import { logout } from "../../../store/authSlice";
import logo from "../../../assets/logo.png";
import "./SideMenu.css";

const SideMenu = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Dummy Data for demo purposes - completely replaces Redux state access
  const demoCurrentShift = { isActive: true, activeTrip: null }; // Example: Driver is on shift, but no active trip
  // const demoDocStatus = { license: 'Verified', vehicleRegistration: 'Pending' }; // No longer needed as Documents link removed

  // Function to determine if documents need attention (no longer used, but kept for context if you re-add)
  // const docsNeedAttention = demoDocStatus && Object.values(demoDocStatus).some(doc => doc === 'Pending' || doc === 'Rejected');

  const handleLogout = () => {
    dispatch(logout());        // optional but recommended
    localStorage.clear();

    navigate("/auth", { replace: true });
  };


  return (
    <div className="side-menu">
      <div className="menu-header">
        <img src={logo} alt="ChaloRide Logo" className="menu-logo" />
        <p>Driver</p>
      </div>

      <nav className="menu-items">
        {/* Dashboard */}
        <NavLink to="/driver/dashboard" className={({ isActive }) => `menu-item ${isActive ? 'active' : ''}`}>
          Dashboard
        </NavLink>

        {/* Trip Offers - Potentially highlight if there are new offers */}
        <NavLink to="/driver/offers" className={({ isActive }) => `menu-item ${isActive ? 'active' : ''}`}>
          Trip Offers
          {/* Example: {offers.length > 0 && <span className="new-offers-badge">{offers.length}</span>} */}
        </NavLink>

        {/* Active Trip - Conditionally disable based on dummy data */}
        <NavLink
          to="/driver/trips/active"
          className={({ isActive }) => `menu-item ${isActive ? 'active' : ''} ${!demoCurrentShift.activeTrip ? 'disabled' : ''}`}
        >
          Active Trip
        </NavLink>

        {/* Trip History - General history of all trips */}
        <NavLink to="/driver/tripHistory" className={({ isActive }) => `menu-item ${isActive ? 'active' : ''}`}>
          Trip History
        </NavLink>

        {/* Assigned Vehicle */}
        <NavLink to="/driver/vehicle" className={({ isActive }) => `menu-item ${isActive ? 'active' : ''}`}>
          Assigned Vehicle
        </NavLink>

        {/* Profile */}
        <NavLink to="/driver/profile" className={({ isActive }) => `menu-item ${isActive ? 'active' : ''}`}>
          Profile
        </NavLink>

        {/* Log Out Button - positioned at the bottom */}
        <button onClick={handleLogout} className="menu-item logout-btn">
          Log Out
        </button>
      </nav>
    </div>
  );
};

export default SideMenu;