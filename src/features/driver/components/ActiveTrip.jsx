import React, { useEffect, useRef, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  MapContainer,
  TileLayer,
  Marker,
  Polyline,
  useMap
} from "react-leaflet";
import L from "leaflet";

import {
  generateOtp,
  verifyOtp,
  completeTrip,
  updateDriverLocation
} from "../../../store/driverSlice";

import useGeolocation from "../../../hooks/useGeolocation";
import usePolling from "../../../hooks/usePolling";

import "leaflet/dist/leaflet.css";
import "./ActiveTrip.css";


delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
  iconUrl:
    "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  shadowUrl:
    "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png"
});


const driverIcon = new L.Icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

const pickupIcon = new L.Icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

const dropoffIcon = new L.Icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});


const MapUpdater = ({
  pickupCoords,
  dropCoords,
  driverCoords,
  otpVerified,
  tripCompleted
}) => {
  const map = useMap();

  useEffect(() => {
    if (!map || !pickupCoords || !dropCoords) return;

    if (!tripCompleted) {
      if (!otpVerified && driverCoords) {
        map.fitBounds([driverCoords, pickupCoords], {
          padding: [100, 100, 200, 100]
        });
      } else if (otpVerified && driverCoords) {
        map.fitBounds([driverCoords, dropCoords], {
          padding: [100, 100, 200, 100]
        });
      }
    } else {
      map.fitBounds([pickupCoords, dropCoords], {
        padding: [50, 50]
      });
    }
  }, [map, pickupCoords, dropCoords, driverCoords, otpVerified, tripCompleted]);

  return null;
};


const ActiveTrip = () => {
  const dispatch = useDispatch();
  const { getCurrentLocation } = useGeolocation();

  const { activeTrip, tripStatus, profile } = useSelector(
    (state) => state.driver
  );

  const [otpInputs, setOtpInputs] = useState(["", "", "", ""]);
  const otpInputRefs = useRef([]);
  const [otpError, setOtpError] = useState("");
  const navigate = useNavigate();

  
  if (
    !activeTrip ||
    activeTrip.pickup_lat == null ||
    activeTrip.pickup_lng == null ||
    activeTrip.drop_lat == null ||
    activeTrip.drop_lng == null
  ) {
    return null;
  }

  const pickupCoords = useMemo(
    () => [activeTrip.pickup_lat, activeTrip.pickup_lng],
    [activeTrip.pickup_lat, activeTrip.pickup_lng]
  );

  const dropCoords = useMemo(
    () => [activeTrip.drop_lat, activeTrip.drop_lng],
    [activeTrip.drop_lat, activeTrip.drop_lng]
  );

  const driverCoords =
    activeTrip.last_latitude != null &&
    activeTrip.last_longitude != null
      ? [activeTrip.last_latitude, activeTrip.last_longitude]
      : null;

  const isOtpWaiting = tripStatus === "ASSIGNED";
  const isRideInProgress = tripStatus === "PICKED_UP";
  const isTripCompleted = tripStatus === "COMPLETED";

  
  usePolling(
    async () => {
      if (
        !profile?.driver_id ||
        !activeTrip ||
        isTripCompleted
      )
        return;

      try {
        const loc = await getCurrentLocation();
        if (!loc?.lat || !loc?.lng) return;

        await dispatch(
          updateDriverLocation({
            driver_id: profile.driver_id,
            latitude: loc.lat,
            longitude: loc.lng
          })
        ).unwrap();
      } catch (err) {
        console.warn("Location update skipped:", err);
      }
    },
    5000,
    true
  );

  
  const handleOtpChange = (e, index) => {
    if (/[^0-9]/.test(e.target.value)) return;

    const updated = [...otpInputs];
    updated[index] = e.target.value;
    setOtpInputs(updated);
    setOtpError("");

    if (e.target.value && index < 3) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (e, index) => {
    if (e.key === "Backspace" && !otpInputs[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  const handleGenerateOtp = () => {
    if (isOtpWaiting && activeTrip?.trip_id) {
      dispatch(generateOtp(activeTrip.trip_id));
    }
  };

  const handleOtpSubmit = (e) => {
    e.preventDefault();
    const otp = otpInputs.join("");

    if (otp.length !== 4) {
      setOtpError("Enter 4 digit OTP");
      return;
    }

    dispatch(
      verifyOtp({
        tripId: activeTrip.trip_id,
        otp_code: otp
      })
    );
  };

  const handleCompleteTrip = () => {
    dispatch(completeTrip(activeTrip.trip_id));
    navigate("/driver/dashboard");
  };

  
  return (
    <div className="active-trip-page">
      <div className="active-trip-map-container">
        <MapContainer
          center={pickupCoords}
          zoom={13}
          scrollWheelZoom
          className="active-trip-leaflet-map"
        >
          <TileLayer
            attribution="&copy; OpenStreetMap contributors"
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {driverCoords && (
            <Marker position={driverCoords} icon={driverIcon} />
          )}
          <Marker position={pickupCoords} icon={pickupIcon} />
          <Marker position={dropCoords} icon={dropoffIcon} />

          {isOtpWaiting && driverCoords && (
            <Polyline
              positions={[driverCoords, pickupCoords]}
              color="#007bff"
              weight={5}
            />
          )}

          {isRideInProgress && (
            <Polyline
              positions={[pickupCoords, dropCoords]}
              color="#28a745"
              weight={5}
            />
          )}

          <MapUpdater
            pickupCoords={pickupCoords}
            dropCoords={dropCoords}
            driverCoords={driverCoords}
            otpVerified={isRideInProgress || isTripCompleted}
            tripCompleted={isTripCompleted}
          />
        </MapContainer>
      </div>

      <div className="active-trip-bottom-card">
        <div className="card-left-section">
          <div className="trip-location-info">
            <h3 className="location-label">Pickup Location:</h3>
            <p className="location-address">
              {activeTrip.pickup_address}
            </p>
          </div>
          <div className="trip-location-info">
            <h3 className="location-label">Dropoff Location:</h3>
            <p className="location-address">
              {activeTrip.drop_address}
            </p>
          </div>
        </div>

        <div className="card-right-section">
          {isOtpWaiting && (
            <div className="otp-verification-section">
              <h2 className="section-title">
                Verify Pickup OTP
              </h2>

              <div className="otp-helper-row">
                {/* <button
                    className="btn-text-only"
                    onClick={handleGenerateOtp}
                    style={{ 
                        background:'none', 
                        border:'none', 
                        color:'#007bff', 
                        cursor:'pointer', 
                        fontSize:'0.9rem',
                        marginBottom:'10px',
                        textDecoration:'underline'
                    }}
                >
                    Resend/Generate OTP
                </button> */}
              </div>

              <form
                onSubmit={handleOtpSubmit}
                className="otp-form"
              >
                {otpInputs.map((d, i) => (
                  <input
                    key={i}
                    value={d}
                    maxLength="1"
                    className="otp-input-field"
                    onChange={(e) =>
                      handleOtpChange(e, i)
                    }
                    onKeyDown={(e) =>
                      handleOtpKeyDown(e, i)
                    }
                    ref={(el) =>
                      (otpInputRefs.current[i] = el)
                    }
                  />
                ))}
                <button
                  type="submit"
                  className="btn verify-otp-btn"
                >
                  Verify
                </button>
              </form>

              {otpError && (
                <p className="otp-error-message">
                  {otpError}
                </p>
              )}
            </div>
          )}

          {isRideInProgress && (
            <div className="ride-in-progress-section">
              <h2 className="section-title">
                Ride in Progress
              </h2>
              <button
                className="btn complete-trip-btn"
                onClick={handleCompleteTrip}
              >
                Mark as Completed
              </button>
            </div>
          )}

          {isTripCompleted && (
            <div className="trip-completed-section">
              <h2 className="section-title">
                Trip Completed
              </h2>
              <p className="trip-completed-message">
                Fare: ₹{activeTrip.fare_amount}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ActiveTrip;
