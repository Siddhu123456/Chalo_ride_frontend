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
import { requestTrip, resetTripState } from "../../../store/tripSlice";
import {
  setPickupLocation,
  setDropLocation,
  resetLocations,
} from "../../../store/locationSlice";
import {
  fetchNearbyDrivers,
  fetchActiveTrip,
  clearNearbyDrivers,
  clearAssignedDriver,
} from "../../../store/riderSlice";

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
  iconSize: [25, 41], iconAnchor: [12, 41],
});
const dropIcon = L.icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
  iconSize: [25, 41], iconAnchor: [12, 41],
});
const currentLocationIcon = L.icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
  iconSize: [25, 41], iconAnchor: [12, 41],
});

/* ───────── Driver Icons ───────── */
const makeDriverIcon = (key, accepted = false) => {
  const emojis = { cab: "🚕", auto: "🛺", bike: "🏍️" };
  return L.divIcon({
    className: "",
    html: `<div class="rh-driver-pin rh-driver-pin--${key}${accepted ? " rh-driver-pin--accepted" : ""}">${emojis[key] ?? "🚕"}</div>`,
    iconSize: accepted ? [46, 46] : [36, 36],
    iconAnchor: accepted ? [23, 23] : [18, 18],
  });
};

const DRIVER_ICONS = {
  CAB:  { normal: makeDriverIcon("cab"),  accepted: makeDriverIcon("cab",  true) },
  AUTO: { normal: makeDriverIcon("auto"), accepted: makeDriverIcon("auto", true) },
  BIKE: { normal: makeDriverIcon("bike"), accepted: makeDriverIcon("bike", true) },
};

const getIcon = (category, accepted = false) => {
  const set = DRIVER_ICONS[category] ?? DRIVER_ICONS.CAB;
  return accepted ? set.accepted : set.normal;
};

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
    const address = [data.locality, data.city || data.principalSubdivision, data.countryName]
      .filter(Boolean).join(", ") || "Current Location";
    geocodeCache.set(key, address);
    return address;
  } catch { return "Current Location"; }
};

/* ───────── Map Click Handler ───────── */
const MapClickHandler = ({ enabled, onPick }) => {
  useMapEvents(enabled ? { click(e) { onPick(e.latlng); } } : {});
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

/* ───────── Route Layer ───────── */
const RouteLayer = ({ from, to, color = "#4361ee", dashed = false }) => {
  const map = useMap();
  const layersRef = useRef([]);

  useEffect(() => {
    if (!from || !to) return;
    let cancelled = false;

    (async () => {
      try {
        const url = `https://router.project-osrm.org/route/v1/driving/${from[1]},${from[0]};${to[1]},${to[0]}?overview=full&geometries=polyline`;
        const data = await fetch(url).then((r) => r.json());
        if (cancelled || data.code !== "Ok" || !data.routes?.[0]) return;

        const coords = decodePolyline(data.routes[0].geometry);
        layersRef.current.forEach((l) => { try { map.removeLayer(l); } catch {} });

        const outline = L.polyline(coords, { color: "#fff", weight: 9, opacity: 0.5, lineCap: "round", lineJoin: "round" });
        const route   = L.polyline(coords, { color, weight: 5, opacity: 1, dashArray: dashed ? "10 7" : null, lineCap: "round", lineJoin: "round" });

        outline.addTo(map); route.addTo(map);
        outline.bringToFront(); route.bringToFront();
        layersRef.current = [outline, route];
      } catch (e) { console.warn("Route fetch failed", e); }
    })();

    return () => {
      cancelled = true;
      layersRef.current.forEach((l) => { try { map.removeLayer(l); } catch {} });
      layersRef.current = [];
    };
  }, [from?.[0], from?.[1], to?.[0], to?.[1], map, color, dashed]);

  return null;
};

/* ───────── Debug Panel ───────── */
// const DebugPanel = ({ step, tripStatus, assignedDriverId, nearbySnapshot, acceptedDriver, driverToPickupRoute, visibleDrivers }) => {
//   useEffect(() => {
//     console.group("🚖 RiderHome Debug");
//     console.log("step              :", step);
//     console.log("trip.status       :", tripStatus);
//     console.log("assignedDriverId  :", assignedDriverId);
//     console.log("nearbySnapshot ids:", nearbySnapshot?.map((d) => d.driver_id));
//     console.log("acceptedDriver    :", acceptedDriver);
//     console.log("driverRoute       :", driverToPickupRoute);
//     console.log("visibleDrivers #  :", visibleDrivers?.length);
//     console.groupEnd();
//   });

//   const rows = [
//     ["step",              step],
//     ["trip.status",       tripStatus ?? "null"],
//     ["assignedDriverId",  String(assignedDriverId ?? "null")],
//     ["snapshot ids",      `[${nearbySnapshot?.map((d) => d.driver_id).join(", ") ?? ""}]`],
//     ["acceptedDriver",    acceptedDriver
//       ? `✅ id=${acceptedDriver.driver_id} [${acceptedDriver.latitude?.toFixed(4)}, ${acceptedDriver.longitude?.toFixed(4)}]`
//       : "❌ not found in snapshot"],
//     ["driverRoute",       driverToPickupRoute
//       ? `✅ from [${driverToPickupRoute.from?.map((v) => v.toFixed(3)).join(", ")}]`
//       : "❌ null"],
//     ["visibleDrivers #",  visibleDrivers?.length ?? 0],
//   ];

//   return (
//     <div style={{
//       position: "fixed", bottom: 12, left: 12, zIndex: 99999,
//       background: "rgba(0,0,0,0.88)", color: "#00ff88",
//       fontFamily: "'Courier New', monospace", fontSize: 11,
//       padding: "10px 14px", borderRadius: 10, maxWidth: 420,
//       pointerEvents: "none", lineHeight: 1.75,
//       border: "1px solid rgba(0,255,136,0.2)",
//     }}>
//       <div style={{ color: "#fecc18", fontWeight: "bold", marginBottom: 6, fontSize: 12 }}>
//         🚖 RiderHome Debug
//       </div>
//       {rows.map(([label, value]) => (
//         <div key={label}>
//           <span style={{ color: "#999" }}>{label.padEnd(18)}: </span>
//           <span style={{
//             color: String(value).startsWith("✅") ? "#00ff88"
//               : String(value).startsWith("❌") ? "#ff4444"
//               : "#fff",
//           }}>{value}</span>
//         </div>
//       ))}
//     </div>
//   );
// };

/* ═══════════════════════════════════════════════
   COMPONENT
   ═══════════════════════════════════════════════ */
const RiderHome = () => {
  const dispatch = useDispatch();

  const pickup          = useSelector((s) => s.location.pickup);
  const drop            = useSelector((s) => s.location.drop);
  const currentLocation = useSelector((s) => s.location.currentLocation);
  const selectedRide    = useSelector((s) => s.fare.selectedRide);
  const cityId          = useSelector((s) => s.fare.cityId);
  const trip            = useSelector((s) => s.trip);

  const nearbyDrivers    = useSelector((s) => s.rider.nearbyDrivers);
  const riderCity        = useSelector((s) => s.rider.city);
  const assignedDriverId = useSelector((s) => s.rider.assignedDriverId);

  const [step, setStep]                           = useState("location");
  const [activePick, setActivePick]               = useState("pickup");
  const [checkingCity, setCheckingCity]           = useState(false);
  const [sameCityError, setSameCityError]         = useState(null);
  const [mapKey, setMapKey]                       = useState(0);
  const [autoPickupEnabled, setAutoPickupEnabled] = useState(true);

  /*
   * SNAPSHOT of nearbyDrivers taken at the moment the rider confirms booking.
   * At that point all candidate drivers are still online/available.
   * When the driver accepts (assignedDriverId arrives), we search THIS snapshot
   * — not the live nearbyDrivers which by then may have dropped the driver.
   */
  const [nearbySnapshot, setNearbySnapshot] = useState([]);

  const isMapLocked           = step !== "location";
  const showPickupToDropRoute =
    pickup?.lat &&
    drop?.lat &&
    (
      step === "fare" ||
      step === "summary" ||
      (step === "tracking" &&
        (trip?.status === "REQUESTED" || trip?.status === "PICKED_UP"))
    );
  const cityIdToUse = riderCity?.city_id || cityId;

  /* ─── Poll fetchActiveTrip every 5s while REQUESTED/ASSIGNED ─── */
  useEffect(() => {
    if (step !== "tracking") return;
    if (!["REQUESTED", "ASSIGNED"].includes(trip.status)) return;

    dispatch(fetchActiveTrip());
    const id = setInterval(() => dispatch(fetchActiveTrip()), 5000);
    return () => clearInterval(id);
  }, [step, trip.status, dispatch]);

  /*
   * acceptedDriver: find assignedDriverId in the snapshot taken at booking time.
   * The snapshot was captured when all filtered drivers were still available,
   * so the driver who accepted will be in there even after dropping from live list.
   */
  const acceptedDriver = useMemo(() => {
    if (!assignedDriverId || !nearbySnapshot.length) return null;
    return nearbySnapshot.find((d) => d.driver_id === assignedDriverId) ?? null;
  }, [assignedDriverId, nearbySnapshot]);

  /* ─── Visible driver markers ─── */
  const visibleDrivers = useMemo(() => {
    if (step === "tracking") {
      // Driver accepted and found in snapshot → show only them
      if (acceptedDriver) return [{ ...acceptedDriver, isAccepted: true }];

      // Still REQUESTED — show filtered live nearby so map isn't empty
      if (nearbyDrivers?.length && selectedRide) {
        return nearbyDrivers.filter(
          (d) => d.vehicle_category === selectedRide.vehicle_category &&
                 d.tenant_id === selectedRide.tenant_id
        );
      }
      return nearbyDrivers ?? [];
    }

    if (!nearbyDrivers?.length) return [];

    if ((step === "fare" || step === "summary") && selectedRide) {
      return nearbyDrivers.filter(
        (d) => d.vehicle_category === selectedRide.vehicle_category &&
               d.tenant_id === selectedRide.tenant_id
      );
    }

    return nearbyDrivers;
  }, [nearbyDrivers, step, selectedRide, acceptedDriver]);

  /* ─── Driver → Pickup route (ASSIGNED only) ─── */
  const driverToPickupRoute = useMemo(() => {
    if (step !== "tracking")         return null;
    if (trip?.status !== "ASSIGNED") return null;
    if (!acceptedDriver)             return null;
    if (!pickup?.lat)                return null;
    return {
      from: [acceptedDriver.latitude, acceptedDriver.longitude],
      to:   [pickup.lat, pickup.lng],
    };
  }, [step, trip?.status, acceptedDriver, pickup]);

  /* ─── Fetch nearby drivers (non-tracking steps) ─── */
  useEffect(() => {
    if (!cityIdToUse || !pickup?.lat || !pickup?.lng) return;
    if (step === "tracking") return;
    dispatch(fetchNearbyDrivers({
      city_id: cityIdToUse,
      pickup_lat: pickup.lat,
      pickup_lng: pickup.lng,
    }));
  }, [cityIdToUse, pickup?.lat, pickup?.lng, dispatch, step]);

  /* ─── Auto-set pickup from current location ─── */
  useEffect(() => {
    if (!autoPickupEnabled || step !== "location" || !currentLocation?.lat || pickup?.lat) return;
    reverseGeocode(currentLocation.lat, currentLocation.lng).then((address) => {
      dispatch(setPickupLocation({ lat: currentLocation.lat, lng: currentLocation.lng, address }));
    });
  }, [autoPickupEnabled, currentLocation, pickup?.lat, step, dispatch]);

  useEffect(() => {
    if (!autoPickupEnabled) {
      const t = setTimeout(() => setAutoPickupEnabled(true), 800);
      return () => clearTimeout(t);
    }
  }, [autoPickupEnabled]);

  /* ─── Map click ─── */
  const handleMapPick = ({ lat, lng }) => {
    if (isMapLocked) return;
    setSameCityError(null);
    const action = activePick === "pickup" ? setPickupLocation : setDropLocation;
    dispatch(action({ lat, lng, address: "Locating..." }));
    reverseGeocode(lat, lng).then((address) => dispatch(action({ lat, lng, address })));
  };

  /* ─── Confirm locations ─── */
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
      if (!sameCityRes.data) { setSameCityError("Pickup and drop must be in the same city."); return; }
      setStep("fare");
    } catch {
      setSameCityError("Location verification failed.");
    } finally {
      setCheckingCity(false);
    }
  };

  /* ─── Book ride ─── */
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
      /*
       * Snapshot the current nearbyDrivers RIGHT NOW — at this exact moment
       * all the filtered drivers (matching vehicle + tenant) are still online.
       * One of them will accept and become the assignedDriverId.
       * We'll search this snapshot to find them later.
       */
      const filtered = (nearbyDrivers ?? []).filter(
        (d) => d.vehicle_category === selectedRide.vehicle_category &&
               d.tenant_id === selectedRide.tenant_id
      );
      setNearbySnapshot(filtered);
      setStep("tracking");
    }
  };

  /* ─── New ride reset ─── */
  const handleNewRide = () => {
    dispatch(resetTripState());
    dispatch(resetFareState());
    dispatch(resetLocations());
    dispatch(clearNearbyDrivers());
    dispatch(clearAssignedDriver());
    setNearbySnapshot([]);
    setAutoPickupEnabled(false);
    setSameCityError(null);
    setStep("location");
    setMapKey((k) => k + 1);
  };

  /* ─── Control panel ─── */
  const renderControlPanel = () => {
    if (trip.tripId && trip.status && step === "tracking")
      return <TripTracking onNewRide={handleNewRide} />;
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

      {/* ══ DEBUG PANEL — remove once confirmed working ══ */}
      {/* <DebugPanel
        step={step}
        tripStatus={trip?.status}
        assignedDriverId={assignedDriverId}
        nearbySnapshot={nearbySnapshot}
        acceptedDriver={acceptedDriver}
        driverToPickupRoute={driverToPickupRoute}
        visibleDrivers={visibleDrivers}
      /> */}
      {/* ════════════════════════════════════════════════ */}

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
            <Marker position={[currentLocation.lat, currentLocation.lng]} icon={currentLocationIcon}>
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

          {showPickupToDropRoute && pickup?.lat && drop?.lat && (
            <RouteLayer
              from={[pickup.lat, pickup.lng]}
              to={[drop.lat, drop.lng]}
              color="#4361ee"
            />
          )}

          {driverToPickupRoute && (
            <RouteLayer
              from={driverToPickupRoute.from}
              to={driverToPickupRoute.to}
              color="#ef4444"
              dashed
            />
          )}

          {visibleDrivers.map((driver) => (
            <Marker
              key={`${driver.driver_id}-${driver.isAccepted ? "acc" : "near"}`}
              position={[driver.latitude, driver.longitude]}
              icon={getIcon(driver.vehicle_category, !!driver.isAccepted)}
            >
              <Tooltip direction="top" offset={[0, driver.isAccepted ? -23 : -18]}>
                {driver.isAccepted ? "Your Driver" : driver.vehicle_category}
              </Tooltip>
            </Marker>
          ))}
        </MapContainer>
      </div>

      <div className="control-section">{renderControlPanel()}</div>
    </div>
  );
};

export default RiderHome;