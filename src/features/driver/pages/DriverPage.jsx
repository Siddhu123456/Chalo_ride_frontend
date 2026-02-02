import React from "react";
import { Outlet } from "react-router-dom";
import SideMenu from "../components/SideMenu";
import "./DriverPage.css";

/**
 * DriverPage Layout
 * - Contains SideMenu (navigation only)
 * - Renders nested route content via <Outlet />
 */
const DriverPage = () => {
  return (
    <div className="driver-layout">
      <SideMenu />
      <main className="driver-main">
        <Outlet />
      </main>
    </div>
  );
};

export default DriverPage;