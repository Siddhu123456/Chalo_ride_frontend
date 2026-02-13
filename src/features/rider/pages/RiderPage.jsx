import React, { useEffect } from "react";
import { Outlet } from "react-router-dom";
import { useDispatch } from "react-redux";

import RiderSideMenu from "../components/RiderSideMenu";
import RiderNavBar from "../components/RiderNavBar";

import { setPickupLocation, setCurrentLocation } from "../../../store/locationSlice";
import { fetchRiderCity, fetchRiderProfile } from "../../../store/riderSlice";

import "./RiderPage.css";

const reverseGeocode = async (lat, lng) => {
  const res = await fetch(
    `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
  );
  const data = await res.json();
  return data.display_name || "Unknown location";
};


const RiderPage = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    // 1Fetch rider profile
    dispatch(fetchRiderProfile());

    //  Detect city using browser location
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const { latitude, longitude } = pos.coords;

          const address = await reverseGeocode(latitude, longitude);

          dispatch(setPickupLocation({ lat: latitude, lng: longitude, address }));
          dispatch(setCurrentLocation({ lat: latitude, lng: longitude }));
          
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

      <RiderSideMenu />

      <main className="rider-main">
    
        <RiderNavBar />

        <div className="rider-content-area">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default RiderPage;
