import React from "react";
import { Outlet } from "react-router-dom";
import SideMenu from "../components/SideMenu";
import DriverNavBar from "../components/DriverNavBar.jsx";
import Dashboard from "./DriverDashboard"; // Import the Dashboard component
import TripOffers from "../components/TripOffers.jsx";
import DriverProfile from "../components/DriverProfile.jsx";
import AssignedVehicle from "../components/AssignedVehicle.jsx";
import ActiveTrip from "../components/ActiveTrip.jsx";
import "./DriverPage.css";

const DriverPage = () => {
  const mockDriverName = "Alex Sharma";
  const mockFleetName = "Chalo Express Fleet";
  const mockProfileImage = "https://images.unsplash.com/photo-1535713875002-d1d0cfce72b.jpeg?auto=format&fit=crop&q=80&w=2940&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D";

  return (
    <div className="driver-layout">
      <SideMenu />
      <main className="driver-main">
        <DriverNavBar
          driverName={mockDriverName}
          fleetName={mockFleetName}
          profileImage={mockProfileImage}
        />
        <div className="driver-content-area">
          {/* Directly render the Dashboard component here */}
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default DriverPage;