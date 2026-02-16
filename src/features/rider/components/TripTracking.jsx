import React, { useEffect, useState } from "react";
import { User, Phone, CheckCircle, Route, X } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";

import {
  fetchTripStatus,
  fetchTripOtp,
  cancelTrip,
  resetTripState,
} from "../../../store/tripSlice";

import { resetFareState } from "../../../store/fareSlice";

import "./TripTracking.css";

const ACTIVE_STATES = ["REQUESTED", "ASSIGNED", "PICKED_UP"];

const TripTracking = ({ onNewRide }) => {
  const dispatch = useDispatch();

  const { tripId, status, otp, loading, cancelling } = useSelector(
    (state) => state.trip
  );

  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState("");

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
    if (status === "COMPLETED" || status === "CANCELLED") {
      const timer = setTimeout(() => {
        dispatch(resetTripState());
        dispatch(resetFareState());
        onNewRide();
      }, 2500);

      return () => clearTimeout(timer);
    }
  }, [status, dispatch, onNewRide]);

  const handleCancelTrip = () => {
    if (!cancelReason.trim()) {
      alert("Please provide a cancellation reason");
      return;
    }

    dispatch(cancelTrip({ tripId, reason: cancelReason }));
    setShowCancelModal(false);
    setCancelReason("");
  };

  const canCancelTrip = status === "REQUESTED" || status === "ASSIGNED";

  if (loading || status === "REQUESTED") {
    return (
      <div className="panel-card fade-in">
        <div className="status-view searching">
          <div className="spinner"></div>
          <h4>Searching for a driver...</h4>
          <p>We're finding the best driver for you</p>

          {canCancelTrip && (
            <button
              className="cancel-trip-btn"
              onClick={() => setShowCancelModal(true)}
              disabled={cancelling}
            >
              <X size={16} />
              Cancel Trip
            </button>
          )}
        </div>

        {showCancelModal && (
          <CancelModal
            cancelReason={cancelReason}
            setCancelReason={setCancelReason}
            onCancel={() => setShowCancelModal(false)}
            onConfirm={handleCancelTrip}
            cancelling={cancelling}
          />
        )}
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

            {otp?.otp && (
              <div className="otp-display">
                <span>OTP</span>
                <strong>{otp.otp}</strong>
              </div>
            )}
          </div>

          <div className="action-buttons">
            <button className="call-btn">
              <Phone size={16} /> Call Driver
            </button>

            {canCancelTrip && (
              <button
                className="cancel-trip-btn secondary"
                onClick={() => setShowCancelModal(true)}
                disabled={cancelling}
              >
                <X size={16} />
                Cancel Trip
              </button>
            )}
          </div>
        </div>

        {showCancelModal && (
          <CancelModal
            cancelReason={cancelReason}
            setCancelReason={setCancelReason}
            onCancel={() => setShowCancelModal(false)}
            onConfirm={handleCancelTrip}
            cancelling={cancelling}
          />
        )}
      </div>
    );
  }

  if (status === "PICKED_UP") {
    return (
      <div className="panel-card fade-in">
        <div className="status-view assigned">
          <h3 className="panel-title">Trip in progress</h3>

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

  if (status === "CANCELLED") {
    return (
      <div className="panel-card fade-in">
        <div className="status-view cancelled">
          <X size={48} className="cancel-icon" />
          <h4>Trip Cancelled</h4>
          <p>Your trip has been cancelled successfully.</p>
        </div>
      </div>
    );
  }

  return null;
};

const CancelModal = ({ cancelReason, setCancelReason, onCancel, onConfirm, cancelling }) => {
  const cancelReasons = [
    "Driver is taking too long",
    "Found alternative transportation",
    "Changed my plans",
    "Wrong pickup location",
    "Other",
  ];

  return (
    <div className="cancel-modal-overlay" onClick={onCancel}>
      <div className="cancel-modal" onClick={(e) => e.stopPropagation()}>
        <div className="cancel-modal-header">
          <h3>Cancel Trip</h3>
          <button className="close-btn" onClick={onCancel}>
            ×
          </button>
        </div>

        <div className="cancel-modal-body">
          <p>Please select a reason for cancellation:</p>

          <div className="reason-options">
            {cancelReasons.map((reason) => (
              <button
                key={reason}
                className={`reason-option ${cancelReason === reason ? "selected" : ""}`}
                onClick={() => setCancelReason(reason)}
              >
                {reason}
              </button>
            ))}
          </div>

          {cancelReason === "Other" && (
            <textarea
              className="custom-reason"
              placeholder="Please specify your reason..."
              value={cancelReason === "Other" ? "" : cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              rows={3}
            />
          )}
        </div>

        <div className="cancel-modal-footer">
          <button className="modal-btn secondary" onClick={onCancel}>
            Go Back
          </button>
          <button
            className="modal-btn danger"
            onClick={onConfirm}
            disabled={!cancelReason || cancelling}
          >
            {cancelling ? "Cancelling..." : "Confirm Cancel"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TripTracking;