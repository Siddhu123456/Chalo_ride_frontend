import React, { useEffect } from "react";
import { Outlet } from "react-router-dom";

import RiderSideMenu from "../components/RiderSideMenu";
import RiderNavBar from "../components/RiderNavBar";

import "./RiderPage.css";

const RiderPage = () => {
  
  useEffect(() => {
    // This is where you would fetch initial rider data (Profile, Location) in the future
    console.log("Rider App Layout Loaded");
  }, []);

  return (
    <div className="rider-layout">
      {/* 1. Left Side Menu (Fixed) */}
      <RiderSideMenu />

      <main className="rider-main">
        {/* 2. Top Navigation Bar (Sticky) */}
        <RiderNavBar />

        {/* 3. Dynamic Content Area (Home, History, Profile) */}
        <div className="rider-content-area">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default RiderPage;