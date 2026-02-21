import React, { useState, useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  MapContainer,
  TileLayer,
  Marker,
  Tooltip,
  useMap,
  useMapEvents,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-routing-machine";
import "leaflet-routing-machine/dist/leaflet-routing-machine.css";
import axios from "axios";

import { fetchFareEstimates, resetFareState } from "../../../store/fareSlice";
import { requestTrip, resetTripState } from "../../../store/tripSlice";
import {
  setPickupLocation,
  setDropLocation,
  resetLocations,
} from "../../../store/locationSlice";

import LocationPicker from "../components/LocationPicker";
import FareDiscovery from "../components/FareDiscovery";
import TripSummary from "../components/TripSummary";
import TripTracking from "../components/TripTracking";

import "./RiderHome.css";

/* ───────── Leaflet Marker Fix ───────── */

import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

/* ───────── Icons ───────── */

const pickupIcon = L.icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

const dropIcon = L.icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

const currentLocationIcon = L.icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

/* ───────── Reverse Geocoding ───────── */

const geocodeCache = new Map();

const reverseGeocode = async (lat, lng) => {
  const key = `${lat.toFixed(4)},${lng.toFixed(4)}`;
  if (geocodeCache.has(key)) return geocodeCache.get(key);

  try {
    const res = await fetch(
      `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`
    );
    const data = await res.json();

    const address =
      [data.locality, data.city || data.principalSubdivision, data.countryName]
        .filter(Boolean)
        .join(", ") || "Current Location";

    geocodeCache.set(key, address);
    return address;
  } catch {
    return "Current Location";
  }
};

/* ───────── Map Click Handler ───────── */

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

/* ───────── Route Machine ───────── */

const RouteMachine = ({ pickup, drop }) => {
  const map = useMap();
  const controlRef = useRef(null);

  useEffect(() => {
    if (!pickup?.lat || !drop?.lat) return;

    if (controlRef.current) {
      map.removeControl(controlRef.current);
      controlRef.current = null;
    }

    const routingControl = L.Routing.control({
      waypoints: [
        L.latLng(pickup.lat, pickup.lng),
        L.latLng(drop.lat, drop.lng),
      ],
      lineOptions: {
        styles: [{ color: "#4361ee", weight: 5, opacity: 0.9 }],
      },
      addWaypoints: false,
      draggableWaypoints: false,
      routeWhileDragging: false,
      fitSelectedRoutes: true,
      show: false,
      createMarker: () => null,
      router: L.Routing.osrmv1({
        serviceUrl: "https://router.project-osrm.org/route/v1",
      }),
    });

    routingControl.on("routesfound", () => {
      const container = routingControl.getContainer();
      if (container) container.style.display = "none";
    });

    routingControl.addTo(map);
    controlRef.current = routingControl;

    return () => {
      if (controlRef.current) map.removeControl(controlRef.current);
    };
  }, [pickup, drop, map]);

  return null;
};

/* ───────────────── COMPONENT ───────────────── */

const RiderHome = () => {
  const dispatch = useDispatch();

  const pickup = useSelector((s) => s.location.pickup);
  const drop = useSelector((s) => s.location.drop);
  const currentLocation = useSelector((s) => s.location.currentLocation);

  const selectedRide = useSelector((s) => s.fare.selectedRide);
  const cityId = useSelector((s) => s.fare.cityId);
  const trip = useSelector((s) => s.trip);

  const [step, setStep] = useState("location");
  const [activePick, setActivePick] = useState("pickup");
  const [checkingCity, setCheckingCity] = useState(false);
  const [sameCityError, setSameCityError] = useState(null);

  const [mapKey, setMapKey] = useState(0);

  /* ⭐ Prevent instant auto-pickup after reset */
  const [autoPickupEnabled, setAutoPickupEnabled] = useState(true);

  const isMapLocked = step !== "location";
  const showRoute = step !== "location" && pickup?.lat && drop?.lat;

  /* ───────── DEFAULT PICKUP = CURRENT LOCATION ───────── */

  useEffect(() => {
    if (
      autoPickupEnabled &&
      step === "location" &&
      currentLocation?.lat &&
      currentLocation?.lng &&
      !pickup?.lat
    ) {
      reverseGeocode(currentLocation.lat, currentLocation.lng).then(
        (address) => {
          dispatch(
            setPickupLocation({
              lat: currentLocation.lat,
              lng: currentLocation.lng,
              address,
            })
          );
        }
      );
    }
  }, [autoPickupEnabled, currentLocation, pickup?.lat, step, dispatch]);

  /* ───────── Re-enable auto pickup after reset ───────── */

  useEffect(() => {
    if (!autoPickupEnabled) {
      const t = setTimeout(() => setAutoPickupEnabled(true), 800);
      return () => clearTimeout(t);
    }
  }, [autoPickupEnabled]);

  /* ───────── Map Click ───────── */

  const handleMapPick = ({ lat, lng }) => {
    if (isMapLocked) return;

    const action =
      activePick === "pickup" ? setPickupLocation : setDropLocation;

    dispatch(action({ lat, lng, address: "Locating..." }));

    reverseGeocode(lat, lng).then((address) =>
      dispatch(action({ lat, lng, address }))
    );
  };

  /* ───────── Confirm Locations ───────── */

  const handleLocationConfirm = async () => {
    if (!pickup?.lat || !drop?.lat) return;

    setCheckingCity(true);
    setSameCityError(null);

    try {
      const token = localStorage.getItem("token");

      const [sameCityRes] = await Promise.all([
        axios.post(
          "http://localhost:8000/trips/same-city",
          {
            pickup_lat: pickup.lat,
            pickup_lng: pickup.lng,
            drop_lat: drop.lat,
            drop_lng: drop.lng,
          },
          { headers: { Authorization: `Bearer ${token}` } }
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
        setSameCityError("Pickup and drop must be in the same city.");
        return;
      }

      setStep("fare");
    } catch {
      setSameCityError("Location verification failed.");
    } finally {
      setCheckingCity(false);
    }
  };

  /* ───────── Booking ───────── */

  const handleBookingConfirm = async () => {
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

  /* ───────── NEW RIDE RESET ───────── */

  const handleNewRide = () => {
    dispatch(resetTripState());
    dispatch(resetFareState());
    dispatch(resetLocations());

    setAutoPickupEnabled(false); // ⭐ key fix
    setStep("location");
    setMapKey((k) => k + 1);
  };

  /* ───────── Control Panel ───────── */

  const renderControlPanel = () => {
    if (trip.tripId && trip.status && step === "tracking") {
      return <TripTracking onNewRide={handleNewRide} />;
    }

    if (step === "fare")
      return <FareDiscovery onRideSelect={() => setStep("summary")} />;

    if (step === "summary")
      return (
        <TripSummary
          ride={selectedRide}
          pickup={pickup?.address}
          drop={drop?.address}
          onConfirm={handleBookingConfirm}
          onChange={() => setStep("fare")}
        />
      );

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
  };

  const mapCenter = [
    pickup?.lat || currentLocation?.lat || 17.385,
    pickup?.lng || currentLocation?.lng || 78.4867,
  ];

  return (
    <div className="rider-home-layout">
      <div className="map-section">
        <MapContainer
          key={mapKey}
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
              <Tooltip>Your Location</Tooltip>
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

          {showRoute && <RouteMachine pickup={pickup} drop={drop} />}
        </MapContainer>
      </div>

      <div className="control-section">{renderControlPanel()}</div>
    </div>
  );
};

export default RiderHome;