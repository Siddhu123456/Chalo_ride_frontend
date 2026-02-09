import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  MapContainer,
  TileLayer,
  Marker,
  Polyline,
  Tooltip,
  useMapEvents,
} from "react-leaflet";
import L from "leaflet";

import { fetchFareEstimates } from "../../../store/fareSlice";
import { requestTrip } from "../../../store/tripSlice";

import LocationPicker from "../components/LocationPicker";
import FareDiscovery from "../components/FareDiscovery";
import TripSummary from "../components/TripSummary";
import TripTracking from "../components/TripTracking";

import "./RiderHome.css";

/* -----------------------------------------
   Marker Icons
------------------------------------------ */
const pickupIcon = L.icon({
  iconUrl: "https://maps.gstatic.com/mapfiles/ms2/micons/green-dot.png",
  iconSize: [32, 32],
  iconAnchor: [16, 32],
});

const dropIcon = L.icon({
  iconUrl: "https://maps.gstatic.com/mapfiles/ms2/micons/red-dot.png",
  iconSize: [32, 32],
  iconAnchor: [16, 32],
});

const activePickupIcon = L.icon({
  iconUrl: "https://maps.gstatic.com/mapfiles/ms2/micons/green.png",
  iconSize: [36, 36],
  iconAnchor: [18, 36],
});

const activeDropIcon = L.icon({
  iconUrl: "https://maps.gstatic.com/mapfiles/ms2/micons/red.png",
  iconSize: [36, 36],
  iconAnchor: [18, 36],
});

/* -----------------------------------------
   Reverse Geocode Helper
------------------------------------------ */
const reverseGeocode = async (lat, lng) => {
  const res = await fetch(
    `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
  );
  const data = await res.json();
  return data.display_name || "Unknown location";
};

/* -----------------------------------------
   Map Click Handler (LOCKABLE)
------------------------------------------ */
const MapClickHandler = ({ onPick, enabled }) => {
  useMapEvents(
    enabled
      ? {
          click(e) {
            onPick(e.latlng);
          },
        }
      : {}
  );
  return null;
};

const RiderHome = () => {
  const dispatch = useDispatch();

  /* -----------------------------------------
     Local UI State
  ------------------------------------------ */
  const [step, setStep] = useState("location");
  const [pickup, setPickup] = useState(null);
  const [drop, setDrop] = useState(null);
  const [activePick, setActivePick] = useState("pickup");

  /* -----------------------------------------
     Redux State
  ------------------------------------------ */
  const selectedRide = useSelector((state) => state.fare.selectedRide);
  const cityId = useSelector((state) => state.fare.cityId);
  const trip = useSelector((state) => state.trip);

  /* -----------------------------------------
     Map Lock Logic
  ------------------------------------------ */
  const isMapLocked = step !== "location";

  /* -----------------------------------------
     Map Click Logic
  ------------------------------------------ */
  const handleMapPick = async ({ lat, lng }) => {
    if (isMapLocked) return;

    const address = await reverseGeocode(lat, lng);

    if (activePick === "pickup") {
      setPickup({ lat, lng, address });
    } else {
      setDrop({ lat, lng, address });
    }
  };

  /* -----------------------------------------
     Confirm Locations → Fare Discovery
  ------------------------------------------ */
  const handleLocationConfirm = async () => {
    if (!pickup || !drop) return;

    await dispatch(
      fetchFareEstimates({
        pickup_lat: pickup.lat,
        pickup_lng: pickup.lng,
        pickup_address: pickup.address,
        drop_lat: drop.lat,
        drop_lng: drop.lng,
        drop_address: drop.address,
      })
    );

    setStep("fare");
  };

  /* -----------------------------------------
     Confirm Booking → Request Trip
  ------------------------------------------ */
  const handleBookingConfirm = async () => {
    if (!pickup || !drop || !selectedRide || !cityId) return;

    const payload = {
      tenant_id: selectedRide.tenant_id,
      city_id: cityId,

      pickup_lat: pickup.lat,
      pickup_lng: pickup.lng,
      pickup_address: pickup.address,

      drop_lat: drop.lat,
      drop_lng: drop.lng,
      drop_address: drop.address,

      vehicle_category: selectedRide.vehicle_category,
      fare_amount: Math.round(
        selectedRide.breakup?.total_fare ?? selectedRide.price
      ),
    };

    const result = await dispatch(requestTrip(payload));

    if (requestTrip.fulfilled.match(result)) {
      setStep("tracking");
    }
  };

  /* -----------------------------------------
     Navigation Helpers
  ------------------------------------------ */
  const handleRideSelect = () => setStep("summary");
  const handleChangeRide = () => setStep("fare");

  const handleNewRide = () => {
    setPickup(null);
    setDrop(null);
    setActivePick("pickup");
    setStep("location");
  };

  /* -----------------------------------------
     Right Panel Renderer
  ------------------------------------------ */
  const renderControlPanel = () => {
    if (trip.tripId && trip.status && step === "tracking") {
      return <TripTracking onNewRide={handleNewRide} />;
    }

    switch (step) {
      case "fare":
        return <FareDiscovery onRideSelect={handleRideSelect} />;

      case "summary":
        if (!selectedRide) {
          setStep("fare");
          return null;
        }

        return (
          <TripSummary
            ride={selectedRide}
            pickup={pickup.address}
            drop={drop.address}
            onConfirm={handleBookingConfirm}
            onChange={handleChangeRide}
          />
        );

      case "location":
      default:
        return (
          <LocationPicker
            pickup={pickup?.address || ""}
            drop={drop?.address || ""}
            onConfirm={handleLocationConfirm}
            onPickupFocus={() => setActivePick("pickup")}
            onDropFocus={() => setActivePick("drop")}
          />
        );
    }
  };

  /* -----------------------------------------
     Render
  ------------------------------------------ */
  return (
    <div className="rider-home-layout">
      <div className="map-section">
        <MapContainer
          center={[17.385, 78.4867]}
          zoom={13}
          style={{ height: "100%", width: "100%" }}
          dragging={!isMapLocked}
          scrollWheelZoom={!isMapLocked}
          doubleClickZoom={!isMapLocked}
          touchZoom={!isMapLocked}
          boxZoom={!isMapLocked}
          keyboard={!isMapLocked}
        >
          <TileLayer
            attribution="&copy; OpenStreetMap"
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <MapClickHandler
            onPick={handleMapPick}
            enabled={!isMapLocked}
          />

          {pickup && (
            <Marker
              position={[pickup.lat, pickup.lng]}
              icon={activePick === "pickup" ? activePickupIcon : pickupIcon}
            >
              <Tooltip permanent>Pickup</Tooltip>
            </Marker>
          )}

          {drop && (
            <Marker
              position={[drop.lat, drop.lng]}
              icon={activePick === "drop" ? activeDropIcon : dropIcon}
            >
              <Tooltip permanent>Drop</Tooltip>
            </Marker>
          )}

          {pickup && drop && (
            <Polyline
              positions={[
                [pickup.lat, pickup.lng],
                [drop.lat, drop.lng],
              ]}
              color="#fecc18"
              weight={4}
            />
          )}
        </MapContainer>
      </div>

      <div className="control-section">
        {renderControlPanel()}
      </div>
    </div>
  );
};

export default RiderHome;
