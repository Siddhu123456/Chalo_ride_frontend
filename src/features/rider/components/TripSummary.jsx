import React from 'react';
import { MapPin, Navigation } from 'lucide-react';
import './TripSummary.css';

const TripSummary = ({ ride, pickup, drop, onConfirm, onChange }) => {
  if (!ride) return null;

  const breakup      = ride.breakup || {};
  const baseFare     = breakup.base_fare     ?? 0;
  const distanceFare = breakup.distance_fare ?? 0;
  const platformFee  = breakup.platform_fee  ?? 0;
  const totalFare    = breakup.total_fare    ?? ride.price ?? 0;
  const distanceKm   = breakup.distance_km   ?? null;

  return (
    <div className="ts-card fade-in">
      <div className="ts-inner">

        {/* Header */}
        <h3 className="ts-title">Confirm Your Ride</h3>

        {/* Ride name + price — full width */}
        <div className="ts-summary-row">
          <span className="ts-ride-name">{ride.tenant_name || ride.name}</span>
          <span className="ts-ride-price">₹{Math.round(totalFare)}</span>
        </div>

        {/* Route — locations shown fully, no truncation */}
        <div className="ts-route">
          <div className="ts-route-point">
            <div className="ts-route-icon pickup">
              <MapPin size={14} />
            </div>
            <div className="ts-route-text">
              <span className="ts-route-label">Pickup</span>
              <span className="ts-route-value">{pickup}</span>
            </div>
          </div>

          <div className="ts-route-connector">
            <div className="ts-connector-dot" />
            <div className="ts-connector-line" />
            <div className="ts-connector-dot" />
          </div>

          <div className="ts-route-point">
            <div className="ts-route-icon drop">
              <Navigation size={14} />
            </div>
            <div className="ts-route-text">
              <span className="ts-route-label">Drop</span>
              <span className="ts-route-value">{drop}</span>
            </div>
          </div>
        </div>

        {/* Fare breakup */}
        <div className="ts-breakup">
          <div className="ts-fare-row">
            <span>Base Fare</span>
            <span>₹{Math.round(baseFare)}</span>
          </div>

          {distanceKm !== null && (
            <div className="ts-fare-row">
              <span>Distance ({distanceKm} km)</span>
              <span>₹{Math.round(distanceFare)}</span>
            </div>
          )}

          {platformFee > 0 && (
            <div className="ts-fare-row">
              <span>Platform Fee</span>
              <span>₹{Math.round(platformFee)}</span>
            </div>
          )}

          <div className="ts-fare-row total">
            <span>Total Payable</span>
            <span>₹{Math.round(totalFare)}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="ts-actions">
          <button className="ts-secondary-btn" onClick={onChange}>
            Change Ride
          </button>
          <button className="ts-primary-btn" onClick={onConfirm}>
            Confirm Booking
          </button>
        </div>

      </div>
    </div>
  );
};

export default TripSummary;