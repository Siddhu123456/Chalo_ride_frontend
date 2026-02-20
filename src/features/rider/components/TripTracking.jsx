import React, { useEffect, useState } from "react";
import { User, Phone, CheckCircle, X, Star } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";

import {
  fetchTripStatus,
  fetchTripOtp,
  cancelTrip,
  rateTrip,
  resetTripState,
} from "../../../store/tripSlice";

import { resetFareState } from "../../../store/fareSlice";

import "./TripTracking.css";

const ACTIVE_STATES = ["REQUESTED", "ASSIGNED", "PICKED_UP"];

const TripTracking = ({ onNewRide }) => {
  const dispatch = useDispatch();

  const {
    tripId,
    status,
    otp,
    loading,
    cancelling,
    ratingSubmitted,
    ratingLoading,
    ratingError,
  } = useSelector((state) => state.trip);

  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [selectedRating, setSelectedRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);

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

  const handleCancelTrip = () => {
    if (!cancelReason.trim()) {
      alert("Please provide a cancellation reason");
      return;
    }
    dispatch(cancelTrip({ tripId, reason: cancelReason }));
    setShowCancelModal(false);
    setCancelReason("");
  };

  const handleSubmitRating = () => {
    if (!selectedRating) return;
    dispatch(rateTrip({ tripId, rating: selectedRating }));
  };

  const handleReset = () => {
    dispatch(resetTripState());
    dispatch(resetFareState());
    onNewRide();
  };

  const canCancelTrip = status === "REQUESTED" || status === "ASSIGNED";

  /* ── SEARCHING ── */
  if (loading || status === "REQUESTED") {
    return (
      <div className="tt-card fade-in">
        <div className="tt-inner">
          <div className="tt-center-view">
            <div className="tt-pulse-ring">
              <div className="tt-pulse-core" />
            </div>
            <h3 className="tt-title">Finding your driver</h3>
            <p className="tt-subtitle">Hang tight, we're on it…</p>
            {canCancelTrip && (
              <button
                className="tt-cancel-standalone"
                onClick={() => setShowCancelModal(true)}
                disabled={cancelling}
              >
                <X size={15} /> Cancel Trip
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

  /* ── ASSIGNED ── */
  if (status === "ASSIGNED") {
    return (
      <div className="tt-card fade-in">
        <div className="tt-inner">
          <div className="tt-badge">Driver Assigned</div>
          <h3 className="tt-title">On the way!</h3>

          <div className="tt-driver-card">
            <div className="tt-avatar">
              <User size={22} />
            </div>
            <div className="tt-driver-details">
              <span className="tt-driver-name">{otp?.driver?.name || "—"}</span>
              <span className="tt-driver-meta">{otp?.driver?.phone}</span>
              <span className="tt-plate">{otp?.vehicle?.registration_no}</span>
            </div>
            {otp?.otp && (
              <div className="tt-otp-badge">
                <span className="tt-otp-label">OTP</span>
                <span className="tt-otp-code">{otp.otp}</span>
              </div>
            )}
          </div>

          <div className="tt-actions">
            <button className="tt-call-btn">
              <Phone size={15} /> Call Driver
            </button>
            {canCancelTrip && (
              <button
                className="tt-cancel-btn"
                onClick={() => setShowCancelModal(true)}
                disabled={cancelling}
              >
                <X size={15} /> Cancel
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

  /* ── PICKED UP ── */
  if (status === "PICKED_UP") {
    return (
      <div className="tt-card fade-in">
        <div className="tt-inner">
          <div className="tt-badge in-progress">In Progress</div>
          <h3 className="tt-title">Enjoy your ride!</h3>

          <div className="tt-driver-card">
            <div className="tt-avatar">
              <User size={22} />
            </div>
            <div className="tt-driver-details">
              <span className="tt-driver-name">{otp?.driver?.name || "—"}</span>
              <span className="tt-driver-meta">{otp?.driver?.phone}</span>
              <span className="tt-plate">{otp?.vehicle?.registration_no}</span>
            </div>
          </div>

          <button className="tt-call-btn full">
            <Phone size={15} /> Call Driver
          </button>
        </div>
      </div>
    );
  }

  /* ── COMPLETED ── */
  if (status === "COMPLETED") {
    return (
      <div className="tt-card fade-in">
        <div className="tt-inner">
          {!ratingSubmitted ? (
            <>
              <div className="tt-center-view">
                <div className="tt-success-circle">
                  <CheckCircle size={30} />
                </div>
                <h3 className="tt-title">Trip Completed!</h3>
                <p className="tt-subtitle">You've arrived at your destination.</p>
              </div>

              <div className="tt-rating-box">
                <p className="tt-rating-label">How was your experience?</p>
                <div className="tt-stars">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      className="tt-star-btn"
                      onClick={() => setSelectedRating(star)}
                      onMouseEnter={() => setHoveredRating(star)}
                      onMouseLeave={() => setHoveredRating(0)}
                    >
                      <Star
                        size={36}
                        fill={star <= (hoveredRating || selectedRating) ? "#fecc18" : "none"}
                        stroke={star <= (hoveredRating || selectedRating) ? "#fecc18" : "#d1d5db"}
                        strokeWidth={1.5}
                      />
                    </button>
                  ))}
                </div>
                {ratingError && <p className="tt-error">{ratingError}</p>}
              </div>

              <div className="tt-rating-actions">
                <button
                  className="tt-primary-btn"
                  onClick={handleSubmitRating}
                  disabled={!selectedRating || ratingLoading}
                >
                  {ratingLoading ? "Submitting…" : "Submit Rating"}
                </button>
                <button className="tt-ghost-btn" onClick={handleReset}>
                  Skip for now
                </button>
              </div>
            </>
          ) : (
            <div className="tt-center-view">
              <div className="tt-success-circle">
                <CheckCircle size={30} />
              </div>
              <h3 className="tt-title">Thanks for rating!</h3>
              <p className="tt-subtitle">Your feedback helps us improve.</p>
              <button className="tt-primary-btn" onClick={handleReset}>
                Book New Ride
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  /* ── CANCELLED ── */
  if (status === "CANCELLED") {
    return (
      <div className="tt-card fade-in">
        <div className="tt-inner">
          <div className="tt-center-view">
            <div className="tt-cancel-circle">
              <X size={28} />
            </div>
            <h3 className="tt-title">Trip Cancelled</h3>
            <p className="tt-subtitle">Your trip has been cancelled.</p>
            <button className="tt-primary-btn" onClick={handleReset}>
              Book New Ride
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

/* ── CANCEL MODAL ── */
const CancelModal = ({ cancelReason, setCancelReason, onCancel, onConfirm, cancelling }) => {
  const cancelReasons = [
    "Driver is taking too long",
    "Found alternative transportation",
    "Changed my plans",
    "Wrong pickup location",
    "Other",
  ];

  return (
    <div className="tt-modal-overlay" onClick={onCancel}>
      <div className="tt-modal" onClick={(e) => e.stopPropagation()}>
        <div className="tt-modal-header">
          <h3>Cancel Trip</h3>
          <button className="tt-modal-close" onClick={onCancel}>×</button>
        </div>
        <div className="tt-modal-body">
          <p>Select a reason for cancellation:</p>
          <div className="tt-reasons">
            {cancelReasons.map((reason) => (
              <button
                key={reason}
                className={`tt-reason ${cancelReason === reason ? "selected" : ""}`}
                onClick={() => setCancelReason(reason)}
              >
                {reason}
              </button>
            ))}
          </div>
          {cancelReason === "Other" && (
            <textarea
              className="tt-custom-reason"
              placeholder="Please describe your reason…"
              onChange={(e) => setCancelReason(e.target.value)}
              rows={3}
            />
          )}
        </div>
        <div className="tt-modal-footer">
          <button className="tt-modal-btn secondary" onClick={onCancel}>
            Go Back
          </button>
          <button
            className="tt-modal-btn danger"
            onClick={onConfirm}
            disabled={!cancelReason || cancelling}
          >
            {cancelling ? "Cancelling…" : "Confirm Cancel"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TripTracking;