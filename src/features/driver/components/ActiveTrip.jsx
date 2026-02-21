import React, { useEffect, useRef, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  MapContainer,
  TileLayer,
  Marker,
  Tooltip,
  Polyline,
  useMap,
} from "react-leaflet";
import L from "leaflet";

import {
  verifyOtp,
  completeTrip,
  updateDriverLocation,
} from "../../../store/driverSlice";

import useGeolocation from "../../../hooks/useGeolocation";
import usePolling from "../../../hooks/usePolling";

import "leaflet/dist/leaflet.css";
import "./ActiveTrip.css";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl:       "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl:     "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

/* ─── OSRM fetch ─────────────────────────────────────────────────────────── */
function decodePolyline(encoded) {
  const coords = [];
  let index = 0, lat = 0, lng = 0;
  while (index < encoded.length) {
    let b, shift = 0, result = 0;
    do { b = encoded.charCodeAt(index++) - 63; result |= (b & 0x1f) << shift; shift += 5; } while (b >= 0x20);
    lat += result & 1 ? ~(result >> 1) : result >> 1;
    shift = 0; result = 0;
    do { b = encoded.charCodeAt(index++) - 63; result |= (b & 0x1f) << shift; shift += 5; } while (b >= 0x20);
    lng += result & 1 ? ~(result >> 1) : result >> 1;
    coords.push([lat / 1e5, lng / 1e5]);
  }
  return coords;
}

async function fetchRoute(from, to, signal) {
  try {
    const url =
      `https://router.project-osrm.org/route/v1/driving/` +
      `${from[1]},${from[0]};${to[1]},${to[0]}` +
      `?overview=full&geometries=polyline`;
    const res  = await fetch(url, { signal });
    const data = await res.json();
    if (data.code === "Ok" && data.routes?.[0]?.geometry)
      return decodePolyline(data.routes[0].geometry);
  } catch (_) {}
  return [];
}

/* ─── Marker icons ────────────────────────────────────────────────────────── */
const pickupMarkerIcon = L.divIcon({
  className: "",
  html: `<div class="at-pin at-pin--green"><div class="at-pin__head"></div><div class="at-pin__tail"></div></div>`,
  iconSize: [32, 42], iconAnchor: [16, 42], tooltipAnchor: [16, -44],
});
const dropMarkerIcon = L.divIcon({
  className: "",
  html: `<div class="at-pin at-pin--indigo"><div class="at-pin__head"></div><div class="at-pin__tail"></div></div>`,
  iconSize: [32, 42], iconAnchor: [16, 42], tooltipAnchor: [16, -44],
});
const driverMarkerIcon = L.divIcon({
  className: "",
  html: `<div class="at-driver-pin"><div class="at-driver-pin__pulse"></div><div class="at-driver-pin__core"><svg width="15" height="15" viewBox="0 0 24 24" fill="white"><path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"/></svg></div></div>`,
  iconSize: [44, 44], iconAnchor: [22, 22], tooltipAnchor: [22, -22],
});

/* ─── FitBounds ──────────────────────────────────────────────────────────── */
const FitBounds = ({ points, trigger }) => {
  const map    = useMap();
  const didFit = useRef(false);
  useEffect(() => {
    if (!trigger) { didFit.current = false; return; }
    if (didFit.current) return;
    const valid = (points || []).filter(Boolean);
    if (valid.length < 2) return;
    try {
      map.fitBounds(
        L.latLngBounds(valid.map(([a, b]) => L.latLng(a, b))),
        { padding: [60, 60, 200, 60] }
      );
      didFit.current = true;
    } catch (_) {}
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trigger]);
  return null;
};

/* ─── ActiveTrip ─────────────────────────────────────────────────────────── */
const ActiveTrip = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { getCurrentLocation } = useGeolocation();

  const { activeTrip, tripStatus, profile } = useSelector((s) => s.driver);

  const [otpInputs,   setOtpInputs]   = useState(["", "", "", ""]);
  const [otpError,    setOtpError]    = useState("");
  const [routePoints, setRoutePoints] = useState([]);
  const [routeReady,  setRouteReady]  = useState(false);
  const [liveDriver,  setLiveDriver]  = useState(null);

  const otpInputRefs = useRef([]);
  const watchIdRef   = useRef(null);
  const abortRef     = useRef(null);  // for phase-level route fetches
  const gpsFetchRef  = useRef(null);  // for the upgrade fetch (driver→pickup)
  const prevPhase    = useRef(tripStatus);

  const pickupCoords = useMemo(
    () => activeTrip ? [activeTrip.pickup_lat, activeTrip.pickup_lng] : null,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [activeTrip?.pickup_lat, activeTrip?.pickup_lng]
  );
  const dropCoords = useMemo(
    () => activeTrip ? [activeTrip.drop_lat, activeTrip.drop_lng] : null,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [activeTrip?.drop_lat, activeTrip?.drop_lng]
  );

  const isOtpWaiting     = tripStatus === "ASSIGNED";
  const isRideInProgress = tripStatus === "PICKED_UP";
  const isTripCompleted  = tripStatus === "COMPLETED";

  // ── GPS watch — only for moving the driver marker ──
  useEffect(() => {
    if (!("geolocation" in navigator)) return;
    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => setLiveDriver([pos.coords.latitude, pos.coords.longitude]),
      () => {},
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 3000 }
    );
    return () => {
      if (watchIdRef.current != null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
    };
  }, []);

  // ─── PHASE-LEVEL route fetch ─────────────────────────────────────────────
  //
  // Strategy that guarantees the loader never gets stuck:
  //
  // ASSIGNED phase:
  //   Step 1 — immediately fetch pickup→drop. No GPS needed. Loader clears fast.
  //   Step 2 — in parallel, try to get GPS. If it arrives within a reasonable
  //            time, fetch driver→pickup and replace the route silently.
  //            If GPS fails, the pickup→drop route stays — still useful.
  //
  // PICKED_UP phase:
  //   Fetch pickup→drop immediately. Same as step 1 above.
  //
  // This means the map ALWAYS shows a route and ALWAYS clears the loader,
  // regardless of GPS availability.
  // ─────────────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!pickupCoords || !dropCoords) return;

    // Reset on phase change
    if (prevPhase.current !== tripStatus) {
      prevPhase.current = tripStatus;
      setRouteReady(false);
      setRoutePoints([]);
    }

    if (isTripCompleted) return;

    // Cancel any in-flight requests from previous phase
    if (abortRef.current) abortRef.current.abort();
    if (gpsFetchRef.current) gpsFetchRef.current.abort();

    const mainCtrl = new AbortController();
    abortRef.current = mainCtrl;
    setRouteReady(false);

    // Step 1: fetch pickup→drop immediately (works for both phases)
    fetchRoute(pickupCoords, dropCoords, mainCtrl.signal).then((pts) => {
      if (mainCtrl.signal.aborted) return;
      setRoutePoints(pts);
      setRouteReady(true); // loader clears immediately
    });

    // Step 2: for ASSIGNED phase only — try to upgrade to driver→pickup
    if (isOtpWaiting) {
      const gpsCtrl = new AbortController();
      gpsFetchRef.current = gpsCtrl;

      const tryGpsUpgrade = async () => {
        let driverSnap = null;

        // Try browser GPS with a 6s timeout
        try {
          driverSnap = await new Promise((resolve, reject) => {
            const tid = setTimeout(() => reject(new Error("timeout")), 6000);
            navigator.geolocation.getCurrentPosition(
              (p) => { clearTimeout(tid); resolve([p.coords.latitude, p.coords.longitude]); },
              (e) => { clearTimeout(tid); reject(e); },
              { enableHighAccuracy: false, timeout: 6000, maximumAge: 10000 }
            );
          });
        } catch (_) {}

        if (gpsCtrl.signal.aborted || !driverSnap) return;

        // Seed the marker immediately
        setLiveDriver(driverSnap);

        // Fetch driver→pickup and replace the route
        const upgradedPts = await fetchRoute(driverSnap, pickupCoords, gpsCtrl.signal);
        if (gpsCtrl.signal.aborted) return;
        if (upgradedPts.length > 0) {
          setRoutePoints(upgradedPts); // silently upgrades route, no loader flash
        }
      };

      tryGpsUpgrade();
    }

    return () => {
      mainCtrl.abort();
      if (gpsFetchRef.current) gpsFetchRef.current.abort();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    tripStatus,
    pickupCoords?.[0], pickupCoords?.[1],
    dropCoords?.[0],   dropCoords?.[1],
  ]);

  useEffect(() => () => {
    if (abortRef.current) abortRef.current.abort();
    if (gpsFetchRef.current) gpsFetchRef.current.abort();
  }, []);

  // Push location to backend every 5s
  usePolling(async () => {
    if (!profile?.driver_id || !activeTrip || isTripCompleted) return;
    try {
      const loc = await getCurrentLocation();
      if (!loc?.lat || !loc?.lng) return;
      await dispatch(updateDriverLocation({
        driver_id: profile.driver_id,
        latitude:  loc.lat,
        longitude: loc.lng,
      })).unwrap();
    } catch (_) {}
  }, 5000, true);

  // Guard after all hooks
  if (
    !activeTrip ||
    activeTrip.pickup_lat == null || activeTrip.pickup_lng == null ||
    activeTrip.drop_lat   == null || activeTrip.drop_lng   == null
  ) return null;

  /* OTP handlers */
  const handleOtpChange = (e, index) => {
    if (/[^0-9]/.test(e.target.value)) return;
    const updated = [...otpInputs];
    updated[index] = e.target.value;
    setOtpInputs(updated);
    setOtpError("");
    if (e.target.value && index < 3) otpInputRefs.current[index + 1]?.focus();
  };
  const handleOtpKeyDown = (e, index) => {
    if (e.key === "Backspace" && !otpInputs[index] && index > 0)
      otpInputRefs.current[index - 1]?.focus();
  };
  const handleOtpSubmit = (e) => {
    if (e?.preventDefault) e.preventDefault();
    const otp = otpInputs.join("");
    if (otp.length !== 4) { setOtpError("Enter 4-digit OTP"); return; }
    dispatch(verifyOtp({ tripId: activeTrip.trip_id, otp_code: otp }));
  };
  const handleCompleteTrip = () => {
    dispatch(completeTrip(activeTrip.trip_id));
    navigate("/driver/dashboard");
  };

  const boundsPoints =
    isOtpWaiting && liveDriver     ? [liveDriver, pickupCoords] :
    isRideInProgress && liveDriver  ? [liveDriver, dropCoords]   :
                                      [pickupCoords, dropCoords];

  const phaseLabel = isOtpWaiting ? "Heading to Pickup" : isRideInProgress ? "Ride in Progress" : "Trip Completed";
  const phaseClass = isOtpWaiting ? "at-phase--pickup"  : isRideInProgress ? "at-phase--progress" : "at-phase--done";
  const lineColor  = isOtpWaiting ? "#ff3b30" : "#4361ee";
  const lineDash   = isOtpWaiting ? "8 6" : undefined;
  const lineWeight = isOtpWaiting ? 3 : 4;

  return (
    <div className="at-page">
      <div className="at-map-wrap">
        <MapContainer
          center={pickupCoords}
          zoom={13}
          scrollWheelZoom
          zoomControl
          className="at-map"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <FitBounds points={boundsPoints} trigger={routeReady} />

          {routePoints.length > 1 && (
            <>
              <Polyline positions={routePoints} pathOptions={{ color: lineColor, weight: 7, opacity: 0.12 }} />
              <Polyline positions={routePoints} pathOptions={{ color: lineColor, weight: lineWeight, opacity: 0.9, dashArray: lineDash }} />
            </>
          )}

          {liveDriver && (
            <Marker position={liveDriver} icon={driverMarkerIcon}>
              <Tooltip direction="top" className="at-tooltip at-tooltip--driver">
                <div className="at-tooltip__inner">
                  <strong>🚖 Your Location</strong>
                  <span>You are here</span>
                </div>
              </Tooltip>
            </Marker>
          )}

          <Marker position={pickupCoords} icon={pickupMarkerIcon}>
            <Tooltip direction="top" className="at-tooltip at-tooltip--pickup">
              <div className="at-tooltip__inner">
                <strong>🟢 Pickup Point</strong>
                <span>{activeTrip.pickup_address}</span>
              </div>
            </Tooltip>
          </Marker>

          <Marker position={dropCoords} icon={dropMarkerIcon}>
            <Tooltip direction="top" className="at-tooltip at-tooltip--drop">
              <div className="at-tooltip__inner">
                <strong>🔵 Drop Point</strong>
                <span>{activeTrip.drop_address}</span>
              </div>
            </Tooltip>
          </Marker>
        </MapContainer>

        {!routeReady && !isTripCompleted && (
          <div className="at-map-loader">
            <div className="at-map-loader__spinner" />
            <span>Loading route…</span>
          </div>
        )}

        <div className={`at-phase-chip ${phaseClass}`}>
          <span className="at-phase-chip__dot" />
          {phaseLabel}
        </div>

        {!isTripCompleted && (
          <div className="at-legend">
            {isOtpWaiting && (
              <div className="at-legend__item">
                <span className="at-legend__line at-legend__line--red" />
                <span>Driver → Pickup</span>
              </div>
            )}
            {isRideInProgress && (
              <div className="at-legend__item">
                <span className="at-legend__line at-legend__line--blue" />
                <span>Pickup → Drop</span>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="at-card">
        <div className="at-card__left">
          <div className="at-location">
            <div className="at-location__dot at-location__dot--pickup" />
            <div>
              <p className="at-location__label">Pickup</p>
              <p className="at-location__address">{activeTrip.pickup_address}</p>
            </div>
          </div>
          <div className="at-location-connector" />
          <div className="at-location">
            <div className="at-location__dot at-location__dot--drop" />
            <div>
              <p className="at-location__label">Drop</p>
              <p className="at-location__address">{activeTrip.drop_address}</p>
            </div>
          </div>
        </div>

        <div className="at-card__divider" />

        <div className="at-card__right">
          {isOtpWaiting && (
            <div className="at-otp-section">
              <p className="at-section-title">Verify Pickup OTP</p>
              <p className="at-section-sub">Ask the rider for their 4-digit code</p>
              <form onSubmit={handleOtpSubmit} className="at-otp-form">
                <div className="at-otp-inputs-row">
                  {otpInputs.map((d, i) => (
                    <input
                      key={i}
                      value={d}
                      maxLength="1"
                      inputMode="numeric"
                      className="at-otp-input"
                      onChange={(e) => handleOtpChange(e, i)}
                      onKeyDown={(e) => handleOtpKeyDown(e, i)}
                      ref={(el) => (otpInputRefs.current[i] = el)}
                    />
                  ))}
                </div>
                <button type="submit" className="at-btn at-btn--verify">
                  Verify &amp; Start Ride
                </button>
              </form>
              {otpError && <p className="at-otp-error">{otpError}</p>}
            </div>
          )}

          {isRideInProgress && (
            <div className="at-progress-section">
              <div className="at-progress-icon">
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
                </svg>
              </div>
              <p className="at-section-title">Ride in Progress</p>
              <p className="at-section-sub">Fare: <strong>₹{activeTrip.fare_amount}</strong></p>
              <button className="at-btn at-btn--complete" onClick={handleCompleteTrip}>
                Mark as Completed
              </button>
            </div>
          )}

          {isTripCompleted && (
            <div className="at-completed-section">
              <div className="at-completed-icon">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <p className="at-section-title">Trip Completed!</p>
              <p className="at-section-sub">Fare earned: <strong>₹{activeTrip.fare_amount}</strong></p>
              <button className="at-btn at-btn--dashboard" onClick={() => navigate("/driver/dashboard")}>
                Back to Dashboard
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ActiveTrip;