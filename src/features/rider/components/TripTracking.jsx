import React, { useEffect } from "react";
import { User, Phone, CheckCircle, Route } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";

import {
  fetchTripStatus,
  fetchTripOtp,
  resetTripState,
} from "../../../store/tripSlice";

import { resetFareState } from "../../../store/fareSlice";

import "./TripTracking.css";

const ACTIVE_STATES = ["REQUESTED", "ASSIGNED", "PICKED_UP"];

const TripTracking = ({ onNewRide }) => {
  const dispatch = useDispatch();

  const { tripId, status, otp, loading } = useSelector(
    (state) => state.trip
  );

  useEffect(() => {
    if (!tripId || !ACTIVE_STATES.includes(status)) return;

    const interval = setInterval(() => {
      dispatch(fetchTripStatus(tripId));
    }, 5000);

    return () => clearInterval(interval);
  }, [tripId, status, dispatch]);

  useEffect(() => {
    if (status === "ASSIGNED") {
      dispatch(fetchTripOtp(tripId));
    }
  }, [status, tripId, dispatch]);


  useEffect(() => {
    if (status === "COMPLETED") {
      // Small delay so user sees completion UI
      const timer = setTimeout(() => {
        dispatch(resetTripState());
        dispatch(resetFareState());
        onNewRide();
      }, 2500);

      return () => clearTimeout(timer);
    }
  }, [status, dispatch, onNewRide]);

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


  if (status === "ASSIGNED" || status === "PICKED_UP") {
    return (
      <div className="panel-card fade-in">
        <div className="status-view assigned">
          <h3 className="panel-title">
            {status === "ASSIGNED"
              ? "Driver is on the way!"
              : "Trip in progress"}
          </h3>

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

            {otp?.otp && (
              <div className="otp-display">
                <span>OTP</span>
                <strong>{otp.otp}</strong>
              </div>
            )}
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
