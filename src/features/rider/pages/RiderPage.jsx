import React, { useEffect } from "react";
import { Outlet } from "react-router-dom";
import { useDispatch } from "react-redux";

import RiderSideMenu from "../components/RiderSideMenu";
import RiderNavBar from "../components/RiderNavBar";

import { fetchRiderCity, fetchRiderProfile } from "../../../store/riderSlice";

import "./RiderPage.css";

const RiderPage = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    // 1️⃣ Fetch rider profile
    dispatch(fetchRiderProfile());

    // 2️⃣ Detect city using browser location
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;

          dispatch(
            fetchRiderCity({
              lat: latitude,
              lng: longitude,
            })
          );
        },
        () => {
          console.warn("Location access denied by user");
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
        }
      );
    }
  }, [dispatch]);

  return (
    <div className="rider-layout">
      {/* 1. Left Side Menu (Fixed) */}
      <RiderSideMenu />

      <main className="rider-main">
        {/* 2. Top Navigation Bar (Sticky) */}
        <RiderNavBar />

        {/* 3. Dynamic Content Area */}
        <div className="rider-content-area">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default RiderPage;
