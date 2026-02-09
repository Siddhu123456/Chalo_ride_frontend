import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";
import logo from "../../../assets/logo.png";
import { logout } from "../../../store/authSlice";
import "./RiderSideMenu.css";

const RiderSideMenu = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const roles = useSelector((state) => state.auth.roles);

  const handleLogout = () => {
    dispatch(logout());        // optional but recommended
    localStorage.clear();

    navigate("/auth", { replace: true });
  };

  return (
    <div className="side-menu-rider">
      <div className="menu-header-rider">
        <img src={logo} alt="ChaloRide Logo" className="menu-logo-rider" />
        <p>Rider</p>
      </div>

      <nav className="menu-items-rider">
        <NavLink
          to="/rider/home"
          className={({ isActive }) =>
            `menu-item-rider ${isActive ? "active-rider" : ""}`
          }
        >
          Home
        </NavLink>

        <NavLink
          to="/rider/trips/history"
          className={({ isActive }) =>
            `menu-item-rider ${isActive ? "active-rider" : ""}`
          }
        >
          Trip History
        </NavLink>

        <NavLink
          to="/rider/profile"
          className={({ isActive }) =>
            `menu-item-rider ${isActive ? "active-rider" : ""}`
          }
        >
          Profile
        </NavLink>


        {roles?.includes("TENANT_ADMIN") && (
          <NavLink
            to="/fleet-registration"
            className={({ isActive }) =>
              `menu-item-rider ${isActive ? "active-rider" : ""}`
            }
          >
            Fleet Registration
          </NavLink>
        )}

        <button
          onClick={handleLogout}
          className="menu-item-rider logout-btn-rider"
        >
          Log Out
        </button>
      </nav>
    </div>
  );
};

export default RiderSideMenu;
