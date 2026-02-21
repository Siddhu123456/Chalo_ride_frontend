import React, { useEffect, useRef } from "react";
import { Outlet } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import RiderSideMenu from "../components/RiderSideMenu";
import RiderNavBar from "../components/RiderNavBar";
import { setPickupLocation, setCurrentLocation } from "../../../store/locationSlice";
import { fetchRiderCity, fetchRiderProfile } from "../../../store/riderSlice";
import "./RiderPage.css";

const reverseGeocode = async (lat, lng) => {
  const res = await fetch(
    `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`,
    { headers: { "Accept-Language": "en" } }
  );
  const data = await res.json();
  return data.display_name || "Unknown location";
};

// Only re-geocode if moved more than ~50 meters
const hasMoved = (a, b) => {
  if (!a) return true;
  const dx = a.lat - b.lat;
  const dy = a.lng - b.lng;
  return Math.sqrt(dx * dx + dy * dy) > 0.0005;
};

const RiderPage = () => {
  const dispatch = useDispatch();
  const token = useSelector((state) => state.auth.token);
  const watchIdRef = useRef(null);
  const cityFetchedRef = useRef(false);
  const lastPositionRef = useRef(null);

  useEffect(() => {
    if (!token) return;

    cityFetchedRef.current = false;
    lastPositionRef.current = null;

    dispatch(fetchRiderProfile());

    if (!("geolocation" in navigator)) return;

    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }

    watchIdRef.current = navigator.geolocation.watchPosition(
      async (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords;
        const current = { lat, lng };

        dispatch(setCurrentLocation(current));

        // Only call Nominatim if position changed significantly
        if (hasMoved(lastPositionRef.current, current)) {
          lastPositionRef.current = current;
          try {
            const address = await reverseGeocode(lat, lng);
            dispatch(setPickupLocation({ lat, lng, address }));
          } catch (e) {
            console.warn("Reverse geocode failed:", e);
            dispatch(setPickupLocation({ lat, lng, address: "Unknown location" }));
          }
        }

        if (!cityFetchedRef.current) {
          cityFetchedRef.current = true;
          dispatch(fetchRiderCity({ lat, lng }));
        }
      },
      (err) => console.error("Location error:", err.code, err.message),
      { enableHighAccuracy: true, timeout: 10000 }
    );

    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
    };
  }, [dispatch, token]);

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