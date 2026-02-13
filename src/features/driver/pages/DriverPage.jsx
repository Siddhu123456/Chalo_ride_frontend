import React, { useEffect } from "react";
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

  useEffect(() => {
    
    dispatch(fetchDriverProfile());
    dispatch(fetchDriverDashboardSummary());
  }, [dispatch]);

  return (
    <div className="driver-layout">
      <SideMenu />

      <main className="driver-main">
        <DriverNavBar />

        <div className="driver-content-area">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default DriverPage;
