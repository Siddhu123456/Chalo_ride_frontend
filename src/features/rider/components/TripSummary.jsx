import React from 'react';
import { MapPin, Navigation, IndianRupee } from 'lucide-react';
import './TripSummary.css';

const TripSummary = ({ ride, pickup, drop, onConfirm, onChange }) => {
  if (!ride) return null;

  return (
    <div className="panel-card fade-in">
      <h3 className="panel-title">Confirm Your Ride</h3>
      <div className="summary-card">
        <h4>{ride.name}</h4>
        <span className="summary-price">₹{ride.price}</span>
      </div>
      <div className="route-display">
        <div className="route-point">
          <MapPin size={16} className="icon pickup-icon"/>
          <span>{pickup}</span>
        </div>
        <div className="route-line"></div>
        <div className="route-point">
          <Navigation size={16} className="icon drop-icon"/>
          <span>{drop}</span>
        </div>
      </div>
      <div className="fare-breakup">
        <div className="fare-line">
          <span>Base Fare</span>
          <span>₹50.00</span>
        </div>
        <div className="fare-line">
          <span>Distance Fare (7.8 km)</span>
          <span>₹155.00</span>
        </div>
        <div className="fare-line total">
          <span>Total Payable</span>
          <span>₹{ride.price}</span>
        </div>
      </div>
      <div className="booking-actions">
        <button className="secondary-btn" onClick={onChange}>Change Ride</button>
        <button className="primary-btn" onClick={onConfirm}>Confirm Booking</button>
      </div>
    </div>
  );
};

export default TripSummary;