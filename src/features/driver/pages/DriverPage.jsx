import React, { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import { useDispatch } from "react-redux";
import SideMenu from "../components/SideMenu";
import DriverNavBar from "../components/DriverNavBar";
import {
  fetchDriverProfile,
  fetchDriverDashboardSummary
} from "../../../store/driverSlice";
import "./DriverPage.css";

const DriverPage = () => {
  const dispatch = useDispatch();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    dispatch(fetchDriverProfile());
    dispatch(fetchDriverDashboardSummary());
  }, [dispatch]);

  return (
    <div className="driver-layout">
      {/* Dark overlay — mobile only, closes sidebar on tap */}
      {sidebarOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      <SideMenu
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <main className="driver-main">
        <DriverNavBar onMenuToggle={() => setSidebarOpen(true)} />
        <div className="driver-content-area">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default DriverPage;