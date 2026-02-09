import React from "react";
import { Link, useNavigate } from "react-router-dom";
import logo from "../../../assets/logo.png";
import "./NavBar.css";

const NavBar = () => {
  const navigate = useNavigate();

  const handlePlatformAdminLogin = () => {
    navigate("/admin/login");
  };

  return (
    <nav className="navbar">
      <img src={logo} alt="App Logo" className="navbar-logo" />

      {/* Platform Admin Login */}
      <div className="navbar-actions">
        <button
          className="platform-admin-btn"
          onClick={handlePlatformAdminLogin}
        >
          Platform Admin Login
        </button>
      </div>
    </nav>
  );
};

export default NavBar;
