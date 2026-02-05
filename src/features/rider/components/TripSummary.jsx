import React from 'react';
import { MapPin, Navigation } from 'lucide-react';
import './TripSummary.css';

const TripSummary = ({ ride, pickup, drop, onConfirm, onChange }) => {
  if (!ride) return null;

  const breakup = ride.breakup || {};

  const baseFare = breakup.base_fare ?? 0;
  const distanceFare = breakup.distance_fare ?? 0;
  const platformFee = breakup.platform_fee ?? 0;
  const totalFare = breakup.total_fare ?? ride.price ?? 0;
  const distanceKm = breakup.distance_km ?? null;

  return (
    <div className="panel-card fade-in">
      <h3 className="panel-title">Confirm Your Ride</h3>

      <div className="summary-card">
        <h4>{ride.tenant_name || ride.name}</h4>
        <span className="summary-price">
          ₹{Math.round(totalFare)}
        </span>
      </div>

      <div className="route-display">
        <div className="route-point">
          <MapPin size={16} className="icon pickup-icon" />
          <span>{pickup}</span>
        </div>

        <div className="route-line"></div>

        <div className="route-point">
          <Navigation size={16} className="icon drop-icon" />
          <span>{drop}</span>
        </div>
      </div>

      <div className="fare-breakup">
        <div className="fare-line">
          <span>Base Fare</span>
          <span>₹{Math.round(baseFare)}</span>
        </div>

        {distanceKm !== null && (
          <div className="fare-line">
            <span>Distance Fare ({distanceKm} km)</span>
            <span>₹{Math.round(distanceFare)}</span>
          </div>
        )}

        {platformFee > 0 && (
          <div className="fare-line">
            <span>Platform Fee</span>
            <span>₹{Math.round(platformFee)}</span>
          </div>
        )}

        <div className="fare-line total">
          <span>Total Payable</span>
          <span>₹{Math.round(totalFare)}</span>
        </div>
      </div>

      <div className="booking-actions">
        <button className="secondary-btn" onClick={onChange}>
          Change Ride
        </button>
        <button className="primary-btn" onClick={onConfirm}>
          Confirm Booking
        </button>
      </div>
    </div>
  );
};

export default TripSummary;
