import React from 'react';
import './DriverNavBar.css'; // Don't forget to create this CSS file

// Assuming you have a default profile image or an icon library
// import { FaUserCircle } from 'react-icons/fa'; // Example if using react-icons

const DriverNavBar = ({ driverName, fleetName, profileImage }) => {
  // Default values for demonstration
  const defaultDriverName = driverName || "John Doe";
  const defaultFleetName = fleetName || "Chalo Fleet X";
  const defaultProfileImage = profileImage || "https://via.placeholder.com/40"; // Placeholder image

  return (
    <nav className="driver-navbar">
      <div className="driver-navbar-left">
        {/* You can add more elements here if needed, like a search bar or quick links */}
        <span className="welcome-message">Hello, {defaultDriverName}!</span>
      </div>

      <div className="driver-navbar-right">
        <div className="fleet-info">
          <span className="fleet-name">{defaultFleetName}</span>
        </div>
        <div className="driver-profile">
          <img
            src={defaultProfileImage}
            alt="Driver Profile"
            className="profile-avatar"
          />
          <span className="driver-name">{defaultDriverName}</span>
        </div>
      </div>
    </nav>
  );
};

export default DriverNavBar;