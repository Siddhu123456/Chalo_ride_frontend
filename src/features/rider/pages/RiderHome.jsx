import React, { useEffect, useMemo, useRef, useState } from "react";
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
import axios from "axios";

import { fetchFareEstimates, resetFareState } from "../../../store/fareSlice";
import { requestTrip, resetTripState, fetchTripStatus } from "../../../store/tripSlice";
import {
  setPickupLocation,
  setDropLocation,
  resetLocations,
} from "../../../store/locationSlice";
import { fetchNearbyDrivers, clearNearbyDrivers } from "../../../store/riderSlice";

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

/* ───────── Static Icons ───────── */
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

/* ───────── Driver Icons ───────── */
const driverIconMap = {
  CAB: L.divIcon({
    className: "",
    html: `<div class="rh-driver-pin rh-driver-pin--cab">🚕</div>`,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
  }),
  AUTO: L.divIcon({
    className: "",
    html: `<div class="rh-driver-pin rh-driver-pin--auto">🛺</div>`,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
  }),
  BIKE: L.divIcon({
    className: "",
    html: `<div class="rh-driver-pin rh-driver-pin--bike">🏍️</div>`,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
  }),
};

// Accepted driver gets a larger, highlighted version
const acceptedDriverIconMap = {
  CAB: L.divIcon({
    className: "",
    html: `<div class="rh-driver-pin rh-driver-pin--cab rh-driver-pin--accepted">🚕</div>`,
    iconSize: [46, 46],
    iconAnchor: [23, 23],
  }),
  AUTO: L.divIcon({
    className: "",
    html: `<div class="rh-driver-pin rh-driver-pin--auto rh-driver-pin--accepted">🛺</div>`,
    iconSize: [46, 46],
    iconAnchor: [23, 23],
  }),
  BIKE: L.divIcon({
    className: "",
    html: `<div class="rh-driver-pin rh-driver-pin--bike rh-driver-pin--accepted">🏍️</div>`,
    iconSize: [46, 46],
    iconAnchor: [23, 23],
  }),
};

const getDriverIcon = (vehicleCategory) =>
  driverIconMap[vehicleCategory] || driverIconMap.CAB;

const getAcceptedDriverIcon = (vehicleCategory) =>
  acceptedDriverIconMap[vehicleCategory] || acceptedDriverIconMap.CAB;

/* ───────── Geocode Cache ───────── */
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
    enabled ? { click(e) { onPick(e.latlng); } } : {}
  );
  return null;
};

/* ───────── Polyline Decoder ───────── */
const decodePolyline = (encoded) => {
  const points = [];
  let index = 0, lat = 0, lng = 0;
  while (index < encoded.length) {
    let shift = 0, result = 0, byte;
    do { byte = encoded.charCodeAt(index++) - 63; result |= (byte & 0x1f) << shift; shift += 5; } while (byte >= 0x20);
    lat += result & 1 ? ~(result >> 1) : result >> 1;
    shift = 0; result = 0;
    do { byte = encoded.charCodeAt(index++) - 63; result |= (byte & 0x1f) << shift; shift += 5; } while (byte >= 0x20);
    lng += result & 1 ? ~(result >> 1) : result >> 1;
    points.push([lat / 1e5, lng / 1e5]);
  }
  return points;
};

/* ───────── Route Layer Component ───────── */
// from/to: [lat, lng]  color: hex  dashed: bool
const RouteLayer = ({ from, to, color = "#4361ee", dashed = false }) => {
  const map = useMap();
  const layersRef = useRef([]);

  useEffect(() => {
    if (!from || !to) return;
    let cancelled = false;

    const fetchRoute = async () => {
      try {
        const url =
          `https://router.project-osrm.org/route/v1/driving/` +
          `${from[1]},${from[0]};${to[1]},${to[0]}` +
          `?overview=full&geometries=polyline`;
        const res = await fetch(url);
        const data = await res.json();
        if (cancelled || data.code !== "Ok" || !data.routes?.[0]) return;

        const coords = decodePolyline(data.routes[0].geometry);

        layersRef.current.forEach((l) => { try { map.removeLayer(l); } catch {} });
        layersRef.current = [];

        const outline = L.polyline(coords, { color: "#fff", weight: 9, opacity: 0.5, lineCap: "round", lineJoin: "round" });
        const route   = L.polyline(coords, { color, weight: 5, opacity: 1, dashArray: dashed ? "10 7" : null, lineCap: "round", lineJoin: "round" });

        outline.addTo(map);
        route.addTo(map);
        outline.bringToFront();
        route.bringToFront();

        layersRef.current = [outline, route];
      } catch (err) {
        console.warn("Route fetch failed:", err);
      }
    };

    fetchRoute();

    return () => {
      cancelled = true;
      layersRef.current.forEach((l) => { try { map.removeLayer(l); } catch {} });
      layersRef.current = [];
    };
  }, [from?.[0], from?.[1], to?.[0], to?.[1], map, color, dashed]);

  return null;
};

/* ═══════════════════════════════════════════════
   COMPONENT
   ═══════════════════════════════════════════════ */
const RiderHome = () => {
  const dispatch = useDispatch();

  const pickup          = useSelector((s) => s.location.pickup);
  const drop            = useSelector((s) => s.location.drop);
  const currentLocation = useSelector((s) => s.location.currentLocation);

  const selectedRide  = useSelector((s) => s.fare.selectedRide);
  const cityId        = useSelector((s) => s.fare.cityId);
  const trip          = useSelector((s) => s.trip);

  const nearbyDrivers = useSelector((s) => s.rider.nearbyDrivers);
  const riderCity     = useSelector((s) => s.rider.city);

  const [step, setStep]                     = useState("location");
  const [activePick, setActivePick]         = useState("pickup");
  const [checkingCity, setCheckingCity]     = useState(false);
  const [sameCityError, setSameCityError]   = useState(null);
  const [mapKey, setMapKey]                 = useState(0);
  const [autoPickupEnabled, setAutoPickupEnabled] = useState(true);

  const isMapLocked = step !== "location";
  const showPickupToDropRoute = step !== "location" && step !== "tracking" && pickup?.lat && drop?.lat;

  /* ───────── Accepted driver from nearbyDrivers ───────── */
  // Once trip is ASSIGNED, we have trip.driverId — find that driver in nearbyDrivers
  const acceptedDriver = useMemo(() => {
    if (!trip?.driverId || !nearbyDrivers?.length) return null;
    return nearbyDrivers.find((d) => d.driver_id === trip.driverId) || null;
  }, [trip?.driverId, nearbyDrivers]);

  /* ───────── Visible drivers on map ───────── */
  const visibleDrivers = useMemo(() => {
    if (!nearbyDrivers?.length) return [];

    // Tracking step: show only the accepted driver (if we have their location)
    if (step === "tracking") {
      if (!acceptedDriver) return [];
      return [acceptedDriver];
    }

    // Fare / summary: filter by selected vehicle_category + tenant_id
    if ((step === "fare" || step === "summary") && selectedRide) {
      return nearbyDrivers.filter(
        (d) =>
          d.vehicle_category === selectedRide.vehicle_category &&
          d.tenant_id === selectedRide.tenant_id
      );
    }

    // Location step: show all nearby drivers
    return nearbyDrivers;
  }, [nearbyDrivers, step, selectedRide, acceptedDriver]);

  /* ───────── Route from accepted driver → pickup (tracking step) ───────── */
  // Only show while driver is heading to pickup (ASSIGNED status)
  const driverToPickupRoute = useMemo(() => {
    if (step !== "tracking") return null;
    if (trip?.status !== "ASSIGNED") return null;
    if (!acceptedDriver || !pickup?.lat) return null;
    return {
      from: [acceptedDriver.latitude, acceptedDriver.longitude],
      to:   [pickup.lat, pickup.lng],
    };
  }, [step, trip?.status, acceptedDriver, pickup]);

  /* ───────── Fetch nearby drivers when city + pickup ready ───────── */
  useEffect(() => {
    const cityIdToUse = riderCity?.city_id || cityId;
    if (!cityIdToUse || !pickup?.lat || !pickup?.lng) return;

    dispatch(fetchNearbyDrivers({
      city_id:    cityIdToUse,
      pickup_lat: pickup.lat,
      pickup_lng: pickup.lng,
    }));
  }, [riderCity?.city_id, cityId, pickup?.lat, pickup?.lng, dispatch]);

  /* ───────── Auto-set pickup from current location ───────── */
  useEffect(() => {
    if (
      autoPickupEnabled &&
      step === "location" &&
      currentLocation?.lat &&
      !pickup?.lat
    ) {
      reverseGeocode(currentLocation.lat, currentLocation.lng).then((address) => {
        dispatch(setPickupLocation({ lat: currentLocation.lat, lng: currentLocation.lng, address }));
      });
    }
  }, [autoPickupEnabled, currentLocation, pickup?.lat, step, dispatch]);

  /* ───────── Re-enable auto pickup after reset ───────── */
  useEffect(() => {
    if (!autoPickupEnabled) {
      const t = setTimeout(() => setAutoPickupEnabled(true), 800);
      return () => clearTimeout(t);
    }
  }, [autoPickupEnabled]);

  /* ───────── Map click ───────── */
  const handleMapPick = ({ lat, lng }) => {
    if (isMapLocked) return;
    setSameCityError(null);
    const action = activePick === "pickup" ? setPickupLocation : setDropLocation;
    dispatch(action({ lat, lng, address: "Locating..." }));
    reverseGeocode(lat, lng).then((address) => dispatch(action({ lat, lng, address })));
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
          { pickup_lat: pickup.lat, pickup_lng: pickup.lng, drop_lat: drop.lat, drop_lng: drop.lng },
          { headers: { Authorization: `Bearer ${token}` } }
        ),
        dispatch(fetchFareEstimates({
          pickup_lat: pickup.lat, pickup_lng: pickup.lng, pickup_address: pickup.address,
          drop_lat: drop.lat, drop_lng: drop.lng, drop_address: drop.address,
        })),
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
      tenant_id:        selectedRide.tenant_id,
      city_id:          cityId,
      pickup_lat:       pickup.lat,
      pickup_lng:       pickup.lng,
      pickup_address:   pickup.address,
      drop_lat:         drop.lat,
      drop_lng:         drop.lng,
      drop_address:     drop.address,
      vehicle_category: selectedRide.vehicle_category,
      fare_amount:      Math.round(selectedRide.breakup?.total_fare ?? selectedRide.price),
    };

    const result = await dispatch(requestTrip(payload));
    if (requestTrip.fulfilled.match(result)) {
      setStep("tracking");
    }
  };

  /* ───────── New Ride Reset ───────── */
  const handleNewRide = () => {
    dispatch(resetTripState());
    dispatch(resetFareState());
    dispatch(resetLocations());
    dispatch(clearNearbyDrivers());
    setAutoPickupEnabled(false);
    setSameCityError(null);
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
        onPickupFocus={() => { setActivePick("pickup"); setSameCityError(null); }}
        onDropFocus={() => { setActivePick("drop"); setSameCityError(null); }}
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

          {/* Current location */}
          {currentLocation?.lat && (
            <Marker position={[currentLocation.lat, currentLocation.lng]} icon={currentLocationIcon}>
              <Tooltip>Your Location</Tooltip>
            </Marker>
          )}

          {/* Pickup */}
          {pickup?.lat && (
            <Marker position={[pickup.lat, pickup.lng]} icon={pickupIcon}>
              <Tooltip permanent>Pickup</Tooltip>
            </Marker>
          )}

          {/* Drop */}
          {drop?.lat && (
            <Marker position={[drop.lat, drop.lng]} icon={dropIcon}>
              <Tooltip permanent>Drop</Tooltip>
            </Marker>
          )}

          {/* Pickup → Drop route (fare/summary steps) */}
          {showPickupToDropRoute && (
            <RouteLayer
              from={[pickup.lat, pickup.lng]}
              to={[drop.lat, drop.lng]}
              color="#4361ee"
            />
          )}

          {/* Driver → Pickup route (tracking + ASSIGNED) */}
          {driverToPickupRoute && (
            <RouteLayer
              from={driverToPickupRoute.from}
              to={driverToPickupRoute.to}
              color="#ef4444"
              dashed
            />
          )}

          {/* Nearby / filtered driver markers */}
          {visibleDrivers.map((driver) => {
            const isAccepted = acceptedDriver?.driver_id === driver.driver_id;
            return (
              <Marker
                key={driver.driver_id}
                position={[driver.latitude, driver.longitude]}
                icon={isAccepted ? getAcceptedDriverIcon(driver.vehicle_category) : getDriverIcon(driver.vehicle_category)}
              >
                <Tooltip direction="top" offset={[0, isAccepted ? -23 : -18]}>
                  {isAccepted ? "Your Driver" : driver.vehicle_category}
                </Tooltip>
              </Marker>
            );
          })}
        </MapContainer>
      </div>

      <div className="control-section">{renderControlPanel()}</div>
    </div>
  );
};

export default RiderHome;