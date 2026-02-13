import React from "react";
import { useSelector } from "react-redux";
import "./RiderNavBar.css";

const RiderNavBar = () => {
  const city = useSelector((state) => state.rider.city);
  const profile = useSelector((state) => state.rider.profile);

  const location = city?.city_name || "Detecting location...";
  const riderName = profile?.full_name || "Loading...";

  return (
    <nav className="rider-navbar">
      
      <div className="rider-navbar-left">
        <span className="page-title">
          {location}
        </span>
      </div>

      
      <div className="rider-navbar-right">
        <div className="rider-profile">
          <img
            src="https://via.placeholder.com/40"
            alt={riderName[0]}
            className="profile-avatar"
          />
          <span className="rider-name">{riderName}</span>
        </div>
      </div>
    </nav>
  );
};

export default RiderNavBar;
