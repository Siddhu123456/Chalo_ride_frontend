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
import "leaflet/dist/leaflet.css";
import axios from "axios";

import { fetchFareEstimates } from "../../../store/fareSlice";
import { requestTrip } from "../../../store/tripSlice";
import { setPickupLocation, setDropLocation } from "../../../store/locationSlice";

import LocationPicker from "../components/LocationPicker";
import FareDiscovery from "../components/FareDiscovery";
import TripSummary from "../components/TripSummary";
import TripTracking from "../components/TripTracking";

import "./RiderHome.css";

import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

const pickupIcon = L.icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

const dropIcon = L.icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

const currentLocationIcon = L.icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

// const API_URL = "http://192.168.3.86:8000/trips";
const API_URL = "http://localhost:8000/trips";

const geocodeCache = new Map();

const reverseGeocode = async (lat, lng) => {
  const key = `${lat.toFixed(4)},${lng.toFixed(4)}`;
  if (geocodeCache.has(key)) return geocodeCache.get(key);

  try {
    const res = await fetch(
      `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`
    );
    const data = await res.json();
    const address = [data.locality, data.city || data.principalSubdivision, data.countryName]
      .filter(Boolean)
      .join(", ") || "Unknown location";
    geocodeCache.set(key, address);
    return address;
  } catch {
    return "Unknown location";
  }
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
  const [checkingCity, setCheckingCity] = useState(false);
  const [sameCityError, setSameCityError] = useState(null);

  const selectedRide = useSelector((s) => s.fare.selectedRide);
  const cityId = useSelector((s) => s.fare.cityId);
  const trip = useSelector((s) => s.trip);

  const isMapLocked = step !== "location";

  const handleMapPick = ({ lat, lng }) => {
    if (isMapLocked) return;
    setSameCityError(null);

    const type = activePick;
    const pinAction = type === "pickup" ? setPickupLocation : setDropLocation;

    // Pin drops instantly
    dispatch(pinAction({ lat, lng, address: "Locating..." }));

    // Address resolves in background
    reverseGeocode(lat, lng).then((address) => {
      dispatch(pinAction({ lat, lng, address }));
    });
  };

  const handleLocationConfirm = async () => {
    if (!pickup?.lat || !drop?.lat) return;

    setSameCityError(null);
    setCheckingCity(true);

    try {
      const token = localStorage.getItem("token");

      // Fire both in parallel
      const [sameCityRes] = await Promise.all([
        axios.post(
          `${API_URL}/same-city`,
          {
            pickup_lat: pickup.lat,
            pickup_lng: pickup.lng,
            drop_lat: drop.lat,
            drop_lng: drop.lng,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        ),
        dispatch(
          fetchFareEstimates({
            pickup_lat: pickup.lat,
            pickup_lng: pickup.lng,
            pickup_address: pickup.address,
            drop_lat: drop.lat,
            drop_lng: drop.lng,
            drop_address: drop.address,
          })
        ),
      ]);

      if (!sameCityRes.data) {
        setSameCityError("Pickup and drop locations must be within the same city.");
        return;
      }
    } catch (err) {
      setSameCityError("Could not verify locations. Please try again.");
      return;
    } finally {
      setCheckingCity(false);
    }

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
    setSameCityError(null);
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
            sameCityError={sameCityError}
            checkingCity={checkingCity}
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