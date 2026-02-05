import React, { useEffect } from "react";
import { User, Phone, CheckCircle } from "lucide-react";
import { Route } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchTripStatus,
  fetchTripOtp,
  resetTripState,
} from "../../../store/tripSlice";
import "./TripTracking.css";

const TripTracking = ({ onNewRide }) => {
  const dispatch = useDispatch();

  const {
    tripId,
    status,
    otp,
    loading,
  } = useSelector((state) => state.trip);

  // 🔁 Poll trip status
  useEffect(() => {
    if (!tripId) return;

    const interval = setInterval(() => {
      dispatch(fetchTripStatus(tripId));
    }, 5000);

    return () => clearInterval(interval);
  }, [tripId, dispatch]);

  // 🔐 Fetch OTP when driver assigned
  useEffect(() => {
    if (status === "ASSIGNED") {
      dispatch(fetchTripOtp(tripId));
    }
  }, [status, tripId, dispatch]);

  if (loading || status === "REQUESTED") {
    return (
      <div className="panel-card fade-in">
        <div className="status-view searching">
          <div className="spinner"></div>
          <h4>Searching for a driver...</h4>
          <p>We're finding the best driver for you</p>
        </div>
      </div>
    );
  }

  if (status === "ASSIGNED") {
    return (
      <div className="panel-card fade-in">
        <div className="status-view assigned">
          <h3 className="panel-title">Driver is on the way!</h3>

          <div className="driver-card">
            <div className="driver-avatar">
              <User />
            </div>

            <div className="driver-info">
              <h5>{otp?.driver?.name}</h5>
              <p>{otp?.driver?.phone}</p>
              <p className="vehicle-plate">
                {otp?.vehicle?.registration_no}
              </p>
            </div>

            <div className="otp-display">
              <span>OTP</span>
              <strong>{otp?.otp}</strong>
            </div>
          </div>

          <button className="call-btn">
            <Phone size={16} /> Call Driver
          </button>
        </div>
      </div>
    );
  }

  if (status === "COMPLETED") {
    return (
      <div className="panel-card fade-in">
        <div className="status-view completed">
          <CheckCircle size={48} className="success-icon" />
          <h4>Trip Completed!</h4>
          <p>You have arrived at your destination.</p>

          <button
            className="primary-btn"
            onClick={() => {
              dispatch(resetTripState());
              onNewRide();
            }}
          >
            Book Another Ride
          </button>

          <div className="route-indicator">
            <Route size={150} />
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default TripTracking;
