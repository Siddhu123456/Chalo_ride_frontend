import React from 'react';
import { MapPin, Navigation, MapPinned } from 'lucide-react';
import './LocationPicker.css';

const LocationPicker = ({ pickup, drop, onConfirm, onPickupFocus, onDropFocus }) => {
  return (
    <div className="panel-card fade-in">
      <div className="panel-inner">
        <div className="card-icon">
          <MapPinned size={220} strokeWidth={2.2} />
        </div>
        <h3 className="panel-title">Book Your Ride</h3>
        <div className="location-inputs">
          <div className="input-wrapper">
            <MapPin className="icon pickup-icon" size={20} />
            <input
              type="text"
              value={pickup}
              placeholder="Pickup Location"
              readOnly
              onClick={onPickupFocus}
            />
          </div>
          <div className="input-wrapper">
            <Navigation className="icon drop-icon" size={20} />
            <input
              type="text"
              value={drop}
              placeholder="Drop Location"
              readOnly
              onClick={onDropFocus}
            />
          </div>
        </div>
        <button
          className="primary-btn"
          onClick={onConfirm}
          disabled={!pickup || !drop}
        >
          Confirm Location
        </button>
      </div>
    </div>
  );
};

export default LocationPicker;