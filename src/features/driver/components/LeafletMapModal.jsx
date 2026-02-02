import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Polyline } from 'react-leaflet';
import L from 'leaflet'; // Import Leaflet itself for custom icons
import 'leaflet/dist/leaflet.css'; // Import Leaflet CSS
import './LeafletMapModal.css'; // Don't forget to create this CSS file

// Fix for default marker icons not showing in Webpack
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

// Custom icons for pickup and dropoff
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


const LeafletMapModal = ({ offer, onConfirmAccept, onBack, onReject }) => {
  if (!offer) return null;

  const pickupCoords = [offer.pickup_lat, offer.pickup_lng];
  const dropCoords = [offer.drop_lat, offer.drop_lng];
  const centerCoords = [(pickupCoords[0] + dropCoords[0]) / 2, (pickupCoords[1] + dropCoords[1]) / 2];

  // Simple distance calculation (Haversine formula approximation)
  const getDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Radius of Earth in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return (R * c * 0.621371).toFixed(1); // Convert to miles and one decimal place
  };

  const distance = getDistance(pickupCoords[0], pickupCoords[1], dropCoords[0], dropCoords[1]);


  return (
    <div className="map-modal-overlay">
      <div className="map-modal-content card">
        <h2 className="modal-heading">Confirm Trip Offer</h2>
        <p className="modal-subheading">Review the route before accepting.</p>

        <div className="map-container">
          <MapContainer
            center={centerCoords}
            zoom={13} // Adjust zoom level as needed
            scrollWheelZoom={true}
            style={{ height: '100%', width: '100%', borderRadius: '8px' }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker position={pickupCoords} icon={pickupIcon} />
            <Marker position={dropCoords} icon={dropoffIcon} />
            <Polyline positions={[pickupCoords, dropCoords]} color="blue" weight={4} opacity={0.7} />
          </MapContainer>
        </div>
        <div className="modal-actions">
          <button className="btn accept-confirm-btn" onClick={() => onConfirmAccept(offer.attempt_id, offer.trip_id)}>Confirm Accept</button>
          <button className="btn reject-modal-btn" onClick={() => onReject(offer.attempt_id)}>Reject Offer</button> {/* Option to reject from modal */}
          <button className="btn back-btn" onClick={onBack}>Back</button>
        </div>
      </div>
    </div>
  );
};

export default LeafletMapModal;