import React, { useEffect, useRef, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Tooltip,
  Polyline,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import { useDispatch } from "react-redux";
import {
  Navigation,
  CircleDot,
  X,
  CheckCircle,
  XCircle,
  ChevronRight,
} from "lucide-react";

import { respondOffer, generateOtp } from "../../../store/driverSlice";

// ── CRITICAL: must import leaflet CSS before any map renders ──
import "leaflet/dist/leaflet.css";
import "./LeafletMapModal.css";

// ── Fix broken default marker icons in Vite / webpack builds ──
// Without this, Leaflet tries to load marker images from a path that
// bundlers rewrite incorrectly, causing blank tiles AND broken markers.
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl:       "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl:     "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

/* ─── OSRM direct fetch (no leaflet-routing-machine) ────────────────────────
   Decodes a Google-encoded polyline into [[lat,lng], ...] pairs.
────────────────────────────────────────────────────────────────────────────── */
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
    if (data.code === "Ok" && data.routes?.[0]?.geometry) {
      return decodePolyline(data.routes[0].geometry);
    }
  } catch (_) { /* AbortError or network error — silently ignore */ }
  return [];
}

/* ─── Custom marker icons (divIcon — no broken image paths) ─────────────── */
const pickupMarkerIcon = L.divIcon({
  className: "",
  html: `<div class="lmm-pin lmm-pin--green">
           <div class="lmm-pin__head"></div>
           <div class="lmm-pin__tail"></div>
         </div>`,
  iconSize: [32, 42], iconAnchor: [16, 42], tooltipAnchor: [16, -44],
});

const dropMarkerIcon = L.divIcon({
  className: "",
  html: `<div class="lmm-pin lmm-pin--blue">
           <div class="lmm-pin__head"></div>
           <div class="lmm-pin__tail"></div>
         </div>`,
  iconSize: [32, 42], iconAnchor: [16, 42], tooltipAnchor: [16, -44],
});

const driverMarkerIcon = L.divIcon({
  className: "",
  html: `<div class="lmm-driver-pin">
           <div class="lmm-driver-pin__pulse"></div>
           <div class="lmm-driver-pin__core">
             <svg width="14" height="14" viewBox="0 0 24 24" fill="white">
               <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42
                 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1
                 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5
                 S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67
                 -1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11
                 l1.5-4.5h11L19 11H5z"/>
             </svg>
           </div>
         </div>`,
  iconSize: [44, 44], iconAnchor: [22, 22], tooltipAnchor: [22, -22],
});

/* ─── FitBounds — runs once after routes load ────────────────────────────── */
const FitBounds = ({ points }) => {
  const map    = useMap();
  const didFit = useRef(false);

  useEffect(() => {
    if (didFit.current) return;
    const valid = (points || []).filter(Boolean);
    if (valid.length < 2) return;
    try {
      map.fitBounds(
        L.latLngBounds(valid.map(([a, b]) => L.latLng(a, b))),
        { padding: [48, 48] }
      );
      didFit.current = true;
    } catch (_) {}
  });

  return null;
};

/* ─── LeafletMapModal ────────────────────────────────────────────────────── */
const LeafletMapModal = ({ offer, onClose }) => {
  const dispatch = useDispatch();

  // All hooks before any conditional returns
  const [driverCoords, setDriverCoords] = useState(null);
  const [route1,       setRoute1]       = useState([]); // driver → pickup
  const [route2,       setRoute2]       = useState([]); // pickup → drop
  const [routesReady,  setRoutesReady]  = useState(false);
  const [actionState,  setActionState]  = useState("idle");
  const watchIdRef  = useRef(null);
  const abortRef    = useRef(null);
  const resolvedRef = useRef(0);

  // Watch driver geolocation
  useEffect(() => {
    if (!offer) return;
    if (!("geolocation" in navigator)) return;
    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => setDriverCoords([pos.coords.latitude, pos.coords.longitude]),
      (err)  => console.warn("Geo:", err.message),
      { enableHighAccuracy: true, timeout: 10000 }
    );
    return () => {
      if (watchIdRef.current != null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
    };
  }, [offer]);

  // Fetch both OSRM routes once driver location is known
  useEffect(() => {
    if (!offer || !driverCoords) return;

    if (abortRef.current) abortRef.current.abort();
    const ctrl = new AbortController();
    abortRef.current  = ctrl;
    resolvedRef.current = 0;
    setRoutesReady(false);

    const pickupCoords = [offer.pickup_lat, offer.pickup_lng];
    const dropCoords   = [offer.drop_lat,   offer.drop_lng];

    const tick = () => {
      resolvedRef.current += 1;
      if (resolvedRef.current === 2) setRoutesReady(true);
    };

    fetchRoute(driverCoords, pickupCoords, ctrl.signal).then((pts) => {
      if (!ctrl.signal.aborted) { setRoute1(pts); tick(); }
    });
    fetchRoute(pickupCoords, dropCoords, ctrl.signal).then((pts) => {
      if (!ctrl.signal.aborted) { setRoute2(pts); tick(); }
    });

    return () => ctrl.abort();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [driverCoords?.[0], driverCoords?.[1], offer?.attempt_id]);

  // Cancel fetch on unmount
  useEffect(() => () => { if (abortRef.current) abortRef.current.abort(); }, []);

  // Guard after hooks
  if (!offer) return null;

  const pickupCoords = [offer.pickup_lat, offer.pickup_lng];
  const dropCoords   = [offer.drop_lat,   offer.drop_lng];
  const allPoints    = [pickupCoords, dropCoords, ...(driverCoords ? [driverCoords] : [])];
  const centerLat    = allPoints.reduce((s, p) => s + p[0], 0) / allPoints.length;
  const centerLng    = allPoints.reduce((s, p) => s + p[1], 0) / allPoints.length;

  const isLoading = actionState === "loading";
  const isSuccess = actionState === "success";

  const handleAccept = async () => {
    setActionState("loading");
    try {
      const res    = await dispatch(respondOffer({ attemptId: offer.attempt_id, accept: true })).unwrap();
      const tripId = res?.data?.trip?.trip_id;
      if (tripId) await dispatch(generateOtp(tripId)).unwrap();
      setActionState("success");
      setTimeout(() => onClose(), 800);
    } catch (err) {
      console.error("Accept failed:", err);
      setActionState("error");
      setTimeout(() => setActionState("idle"), 2000);
    }
  };

  const handleReject = async () => {
    setActionState("loading");
    try {
      await dispatch(respondOffer({ attemptId: offer.attempt_id, accept: false })).unwrap();
      onClose();
    } catch (err) {
      console.error("Reject failed:", err);
      setActionState("error");
      setTimeout(() => setActionState("idle"), 2000);
    }
  };

  return (
    <div className="lmm-overlay" onClick={onClose}>
      <div className="lmm-modal" onClick={(e) => e.stopPropagation()}>

        {/* ── Header ── */}
        <div className="lmm-header">
          <div className="lmm-header__left">
            <span className="lmm-header__badge">Trip Offer</span>
            <h2 className="lmm-header__title">#{offer.attempt_id}</h2>
          </div>
          <div className="lmm-header__right">
            <div className="lmm-fare">
              <span className="lmm-fare__symbol">₹</span>
              <span className="lmm-fare__amount">{Number(offer.fare_amount).toFixed(0)}</span>
            </div>
            <button className="lmm-close-btn" onClick={onClose} aria-label="Close">
              <X size={18} />
            </button>
          </div>
        </div>

        {/* ── Meta strip ── */}
        <div className="lmm-meta-strip">
          <div className="lmm-meta-item">
            <Navigation size={14} className="lmm-meta-item__icon" />
            <span>{offer.distance_km} km</span>
          </div>
          <div className="lmm-meta-divider" />
          <div className="lmm-meta-item">
            <CircleDot size={14} className="lmm-meta-item__icon" />
            <span>
              Sent {new Date(offer.sent_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </span>
          </div>
        </div>

        {/* ── Route summary ── */}
        <div className="lmm-route-summary">
          <div className="lmm-route-point">
            <div className="lmm-route-point__dot lmm-route-point__dot--pickup" />
            <div className="lmm-route-point__text">
              <span className="lmm-route-point__label">Pickup</span>
              <span className="lmm-route-point__address">{offer.pickup_address}</span>
            </div>
          </div>
          <div className="lmm-route-connector"><div className="lmm-route-connector__line" /></div>
          <div className="lmm-route-point">
            <div className="lmm-route-point__dot lmm-route-point__dot--drop" />
            <div className="lmm-route-point__text">
              <span className="lmm-route-point__label">Drop</span>
              <span className="lmm-route-point__address">{offer.drop_address}</span>
            </div>
          </div>
        </div>

        {/* ── Map ── */}
        {/*
          stop wheel + touch events from bubbling past this div to the page.
          Without this, scrolling/pinching inside the map zooms the entire browser window.
        */}
        <div
          className="lmm-map-wrap"
          onWheel={(e) => e.stopPropagation()}
          onTouchStart={(e) => e.stopPropagation()}
          onTouchMove={(e) => e.stopPropagation()}
        >

          {/* Loading overlay */}
          {(!driverCoords || !routesReady) && (
            <div className="lmm-map-loader">
              <div className="lmm-map-loader__spinner" />
              <span>{!driverCoords ? "Getting your location…" : "Loading route…"}</span>
            </div>
          )}

          {/*
            IMPORTANT: MapContainer must have an explicit pixel height.
            scrollWheelZoom="center" zooms toward cursor without moving map center.
            zoomControl={true} shows +/- buttons for click-to-zoom.
          */}
          <MapContainer
            center={[centerLat, centerLng]}
            zoom={13}
            scrollWheelZoom="center"
            zoomControl={true}
            style={{ height: "320px", width: "100%" }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {/* Fit map to all points once routes are ready */}
            {routesReady && <FitBounds points={allPoints} />}

            {/* Route 1: driver → pickup (red dashed) */}
            {route1.length > 1 && (
              <>
                <Polyline positions={route1} pathOptions={{ color: "#ff3b30", weight: 7,  opacity: 0.12 }} />
                <Polyline positions={route1} pathOptions={{ color: "#ff3b30", weight: 3,  opacity: 0.9, dashArray: "8 6" }} />
              </>
            )}

            {/* Route 2: pickup → drop (indigo solid) */}
            {route2.length > 1 && (
              <>
                <Polyline positions={route2} pathOptions={{ color: "#4361ee", weight: 7,  opacity: 0.12 }} />
                <Polyline positions={route2} pathOptions={{ color: "#4361ee", weight: 4,  opacity: 0.9 }} />
              </>
            )}

            {/* Driver marker */}
            {driverCoords && (
              <Marker position={driverCoords} icon={driverMarkerIcon}>
                <Tooltip direction="top" className="lmm-tooltip lmm-tooltip--driver">
                  <div className="lmm-tooltip__inner">
                    <strong>🚖 Your Location</strong>
                    <span>You are here</span>
                  </div>
                </Tooltip>
              </Marker>
            )}

            {/* Pickup marker */}
            <Marker position={pickupCoords} icon={pickupMarkerIcon}>
              <Tooltip direction="top" className="lmm-tooltip lmm-tooltip--pickup">
                <div className="lmm-tooltip__inner">
                  <strong>🟢 Pickup Point</strong>
                  <span>{offer.pickup_address}</span>
                </div>
              </Tooltip>
            </Marker>

            {/* Drop marker */}
            <Marker position={dropCoords} icon={dropMarkerIcon}>
              <Tooltip direction="top" className="lmm-tooltip lmm-tooltip--drop">
                <div className="lmm-tooltip__inner">
                  <strong>🔵 Drop Point</strong>
                  <span>{offer.drop_address}</span>
                </div>
              </Tooltip>
            </Marker>
          </MapContainer>

          {/* Legend */}
          <div className="lmm-legend">
            <div className="lmm-legend__item">
              <span className="lmm-legend__line lmm-legend__line--red" />
              <span>Driver → Pickup</span>
            </div>
            <div className="lmm-legend__item">
              <span className="lmm-legend__line lmm-legend__line--blue" />
              <span>Pickup → Drop</span>
            </div>
          </div>
        </div>

        {/* ── Actions ── */}
        <div className="lmm-actions">
          <button
            className="lmm-btn lmm-btn--reject"
            onClick={handleReject}
            disabled={isLoading || isSuccess}
          >
            <XCircle size={17} />
            <span>Reject</span>
          </button>
          <button
            className={`lmm-btn lmm-btn--accept${isSuccess ? " lmm-btn--success" : ""}`}
            onClick={handleAccept}
            disabled={isLoading || isSuccess}
          >
            {isSuccess ? (
              <><CheckCircle size={17} /><span>Accepted!</span></>
            ) : isLoading ? (
              <><div className="lmm-btn__spinner" /><span>Processing…</span></>
            ) : (
              <><CheckCircle size={17} /><span>Accept Ride</span><ChevronRight size={15} /></>
            )}
          </button>
        </div>

      </div>
    </div>
  );
};

export default LeafletMapModal;