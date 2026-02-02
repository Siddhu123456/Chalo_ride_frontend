import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './ActiveTrip.css';

// Fix for default marker icons not showing in Webpack
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

// Custom icons for driver, pickup, and dropoff
const driverIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

const pickupIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

const dropoffIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});


// Helper component to update map view based on trip stage
const MapUpdater = ({ pickupCoords, dropCoords, driverCoords, otpVerified, tripCompleted }) => {
  const map = useMap();

  useEffect(() => {
    if (!map) return;

    if (!tripCompleted) {
      if (!otpVerified && driverCoords) {
        // Before pickup, focus on driver and pickup
        const bounds = L.latLngBounds([driverCoords, pickupCoords]);
        map.fitBounds(bounds, { padding: [100, 100, 200, 100] }); // Adjust padding for bottom card
      } else if (otpVerified && driverCoords) {
        // After pickup, focus on driver and dropoff
        const bounds = L.latLngBounds([driverCoords, dropCoords]);
        map.fitBounds(bounds, { padding: [100, 100, 200, 100] }); // Adjust padding for bottom card
      } else if (pickupCoords && dropCoords) {
        // Default: focus on pickup and dropoff
        const bounds = L.latLngBounds([pickupCoords, dropCoords]);
        map.fitBounds(bounds, { padding: [100, 100, 200, 100] }); // Adjust padding for bottom card
      }
    } else {
      // Trip completed, show full path
      const bounds = L.latLngBounds([pickupCoords, dropCoords]);
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [map, pickupCoords, dropCoords, driverCoords, otpVerified, tripCompleted]);

  return null;
};


const ActiveTrip = () => {
  // Dummy Data for an active trip
  const [trip, setTrip] = useState({
    trip_id: 'TRIP2023001',
    pickup_lat: 34.0522,
    pickup_lng: -118.2437,
    pickup_address: '123 Main St, Downtown Los Angeles',
    drop_lat: 34.0207,
    drop_lng: -118.6919,
    drop_address: '456 Beach Rd, Santa Monica',
    fare_amount: 35.75,
    status: 'DRIVER_ACCEPTED', // DRIVER_ACCEPTED -> OTP_VERIFIED -> COMPLETED
  });

  // Driver's current location (mocked to move towards pickup, then dropoff)
  const [driverLocation, setDriverLocation] = useState({
    lat: 34.06, // Slightly offset from pickup for visual demo
    lng: -118.25,
  });

  const [otpInputs, setOtpInputs] = useState(['', '', '', '']); // Array for 4 digit OTP
  const otpInputRefs = useRef([]);
  const [otpError, setOtpError] = useState('');

  const pickupCoords = [trip.pickup_lat, trip.pickup_lng];
  const dropCoords = [trip.drop_lat, trip.drop_lng];
  const driverCoords = [driverLocation.lat, driverLocation.lng];

  // Helper booleans for conditional rendering
  const isOtpWaiting = trip.status === 'DRIVER_ACCEPTED';
  const isRideInProgress = trip.status === 'OTP_VERIFIED';
  const isTripCompleted = trip.status === 'COMPLETED';


  // Simulate driver movement
  useEffect(() => {
    let interval;
    if (isOtpWaiting) {
      // Driver moving towards pickup
      interval = setInterval(() => {
        setDriverLocation(prevLoc => {
          // Simple linear interpolation to move towards pickup
          const newLat = prevLoc.lat + (pickupCoords[0] - prevLoc.lat) * 0.005; // Move 0.5% closer each second
          const newLng = prevLoc.lng + (pickupCoords[1] - prevLoc.lng) * 0.005;
          return { lat: newLat, lng: newLng };
        });
      }, 500); // Update every 0.5 seconds for smoother movement
    } else if (isRideInProgress) {
      // Driver moving towards dropoff
      interval = setInterval(() => {
        setDriverLocation(prevLoc => {
          // Simple linear interpolation to move towards dropoff
          const newLat = prevLoc.lat + (dropCoords[0] - prevLoc.lat) * 0.005;
          const newLng = prevLoc.lng + (dropCoords[1] - prevLoc.lng) * 0.005;
          return { lat: newLat, lng: newLng };
        });
      }, 500);
    }
    return () => clearInterval(interval);
  }, [trip.status, pickupCoords, dropCoords]);


  const handleOtpChange = (e, index) => {
    const { value } = e.target;
    if (/[^0-9]/.test(value)) return; // Only allow numbers

    const newOtpInputs = [...otpInputs];
    newOtpInputs[index] = value;
    setOtpInputs(newOtpInputs);
    setOtpError('');

    // Move focus to next input if a digit is entered
    if (value && index < 3) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (e, index) => {
    if (e.key === 'Backspace' && !otpInputs[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpSubmit = (e) => {
    e.preventDefault();
    setOtpError('');
    const fullOtp = otpInputs.join('');
    if (fullOtp === '1234') { // Dummy OTP for demo
      setTrip(prevTrip => ({ ...prevTrip, status: 'OTP_VERIFIED' }));
      console.log('OTP Verified! Rider picked up.');
    } else {
      setOtpError('Invalid OTP. Please try again.');
    }
  };

  const handleCompleteTrip = () => {
    setTrip(prevTrip => ({ ...prevTrip, status: 'COMPLETED' }));
    console.log('Trip Completed!');
    // In a real app, you would make an API call here.
  };

  return (
    <div className="active-trip-page">
      <div className="active-trip-map-container">
        <MapContainer
          center={pickupCoords} // Initial center, will be adjusted by MapUpdater
          zoom={13}
          scrollWheelZoom={true}
          className="active-trip-leaflet-map"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {!isTripCompleted && (
            <>
              {/* Driver Marker */}
              <Marker position={driverCoords} icon={driverIcon} />

              {/* Pickup Marker */}
              <Marker position={pickupCoords} icon={pickupIcon} />

              {/* Dropoff Marker */}
              <Marker position={dropCoords} icon={dropoffIcon} />

              {/* Polyline: Driver to Pickup (before OTP), then Pickup to Dropoff (after OTP) */}
              {isOtpWaiting && <Polyline positions={[driverCoords, pickupCoords]} color="#007bff" weight={5} opacity={0.7} />}
              {isRideInProgress && <Polyline positions={[pickupCoords, dropCoords]} color="#28a745" weight={5} opacity={0.7} />}
            </>
          )}

          {isTripCompleted && (
            <>
              {/* Show only pickup and dropoff and the completed path */}
              <Marker position={pickupCoords} icon={pickupIcon} />
              <Marker position={dropCoords} icon={dropoffIcon} />
              <Polyline positions={[pickupCoords, dropCoords]} color="#6c757d" weight={5} opacity={0.7} dashArray="10, 10" />
            </>
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
            <p className="location-address">{trip.pickup_address}</p>
          </div>
          <div className="trip-location-info">
            <h3 className="location-label">Dropoff Location:</h3>
            <p className="location-address">{trip.drop_address}</p>
          </div>
        </div>

        <div className="card-right-section">
          {isOtpWaiting && (
            <div className="otp-verification-section">
              <h2 className="section-title">Verify Pickup OTP</h2>
              <form onSubmit={handleOtpSubmit} className="otp-form">
                {otpInputs.map((digit, index) => (
                  <input
                    key={index}
                    type="text"
                    maxLength="1"
                    value={digit}
                    onChange={(e) => handleOtpChange(e, index)}
                    onKeyDown={(e) => handleOtpKeyDown(e, index)}
                    ref={(el) => (otpInputRefs.current[index] = el)}
                    className="otp-input-field"
                    autoFocus={index === 0}
                  />
                ))}
                <button type="submit" className="btn verify-otp-btn">Verify</button>
              </form>
              {otpError && <p className="otp-error-message">{otpError}</p>}
            </div>
          )}

          {isRideInProgress && (
            <div className="ride-in-progress-section">
              <h2 className="section-title">Ride in Progress</h2>
              <p className="ride-status-message">Driving to Destination!</p>
              <button className="btn complete-trip-btn" onClick={handleCompleteTrip}>Mark as Completed</button>
            </div>
          )}

          {isTripCompleted && (
            <div className="trip-completed-section">
              <h2 className="section-title">Trip Completed!</h2>
              <p className="trip-completed-message">Fare: ${trip.fare_amount.toFixed(2)}</p>
              <button className="btn go-to-dashboard-btn">Go to Dashboard</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ActiveTrip;