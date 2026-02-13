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
import { setPickupLocation, setDropLocation } from "../../../store/locationSlice";

import LocationPicker from "../components/LocationPicker";
import FareDiscovery from "../components/FareDiscovery";
import TripSummary from "../components/TripSummary";
import TripTracking from "../components/TripTracking";

import "./RiderHome.css";



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

const currentLocationIcon = L.icon({
  iconUrl: "https://maps.gstatic.com/mapfiles/ms2/micons/blue-dot.png",
  iconSize: [30, 30],
  iconAnchor: [15, 30],
});


const reverseGeocode = async (lat, lng) => {
  const res = await fetch(
    `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
  );
  const data = await res.json();
  return data.display_name || "Unknown location";
};



const MapClickHandler = ({ enabled, onPick }) => {
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


  const pickup = useSelector((s) => s.location.pickup);
  const drop = useSelector((s) => s.location.drop);
  const currentLocation = useSelector((s) => s.location.currentLocation);


  const [step, setStep] = useState("location");
  const [activePick, setActivePick] = useState("pickup");

  const selectedRide = useSelector((s) => s.fare.selectedRide);
  const cityId = useSelector((s) => s.fare.cityId);
  const trip = useSelector((s) => s.trip);

  const isMapLocked = step !== "location";

  const handleMapPick = async ({ lat, lng }) => {
    if (isMapLocked) return;

    const address = await reverseGeocode(lat, lng);

    if (activePick === "pickup") {
      dispatch(setPickupLocation({ lat, lng, address }));
    } else {
      dispatch(setDropLocation({ lat, lng, address }));
    }
  };


  const handleLocationConfirm = async () => {
    if (!pickup?.lat || !drop?.lat) return;

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

  const handleRideSelect = () => setStep("summary");
  const handleChangeRide = () => setStep("fare");

  const handleNewRide = () => {
    setStep("location");
  };


  const renderControlPanel = () => {
    if (trip.tripId && trip.status && step === "tracking") {
      return <TripTracking onNewRide={handleNewRide} />;
    }

    switch (step) {
      case "fare":
        return <FareDiscovery onRideSelect={handleRideSelect} />;

      case "summary":
        return (
          <TripSummary
            ride={selectedRide}
            pickup={pickup?.address}
            drop={drop?.address}
            onConfirm={handleBookingConfirm}
            onChange={handleChangeRide}
          />
        );

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


  const mapCenter = [
    pickup?.lat || currentLocation?.lat || 17.385,
    pickup?.lng || currentLocation?.lng || 78.4867,
  ];


  return (
    <div className="rider-home-layout">
      <div className="map-section">
        <MapContainer
          center={mapCenter}
          zoom={13}
          style={{ height: "100%", width: "100%" }}
          dragging={!isMapLocked}
          scrollWheelZoom={!isMapLocked}
        >
          <TileLayer
            attribution="&copy; OpenStreetMap"
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <MapClickHandler enabled={!isMapLocked} onPick={handleMapPick} />

         
          {currentLocation?.lat && (
            <Marker
              position={[currentLocation.lat, currentLocation.lng]}
              icon={currentLocationIcon}
            >
              <Tooltip>Your Current Location</Tooltip>
            </Marker>
          )}

          {pickup?.lat && (
            <Marker position={[pickup.lat, pickup.lng]} icon={pickupIcon}>
              <Tooltip permanent>Pickup</Tooltip>
            </Marker>
          )}

          {drop?.lat && (
            <Marker position={[drop.lat, drop.lng]} icon={dropIcon}>
              <Tooltip permanent>Drop</Tooltip>
            </Marker>
          )}

          {/* Route */}
          {pickup?.lat && drop?.lat && (
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

      <div className="control-section">{renderControlPanel()}</div>
    </div>
  );
};

export default RiderHome;
