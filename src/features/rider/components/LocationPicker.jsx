import React from 'react';
import { MapPin, Navigation, MapPinned, AlertTriangle } from 'lucide-react';
import './LocationPicker.css';

const LocationPicker = ({
  pickup,
  drop,
  onConfirm,
  onPickupFocus,
  onDropFocus,
  sameCityError,
  checkingCity,
}) => {
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

        {sameCityError && (
          <div className="same-city-error">
            <AlertTriangle size={16} className="error-icon" />
            <span>{sameCityError}</span>
          </div>
        )}

        <button
          className="primary-btn"
          onClick={onConfirm}
          disabled={!pickup || !drop || checkingCity}
        >
          {checkingCity ? 'Checking...' : 'Confirm Location'}
        </button>
      </div>
    </div>
  );
};

export default LocationPicker;