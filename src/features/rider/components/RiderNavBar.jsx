import React from "react";
import "./RiderNavBar.css";

const RiderNavBar = () => {

  const location = "hyderbad";
  const riderName = "Rahul Sharma"; // Dummy Name

  return (
    <nav className="rider-navbar">
      {/* Left Side: Current View Name */}
      <div className="rider-navbar-left">
        <span className="page-title">
          {location}
        </span>
      </div>

      {/* Right Side: Rider Profile */}
      <div className="rider-navbar-right">
        <div className="rider-profile">
          <img
            src="https://via.placeholder.com/40"
            alt="Rider Profile"
            className="profile-avatar"
          />
          <span className="rider-name">{riderName}</span>
        </div>
      </div>
    </nav>
  );
};

export default RiderNavBar;