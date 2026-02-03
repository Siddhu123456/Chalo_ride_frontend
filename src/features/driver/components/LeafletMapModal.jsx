import React from "react";
import { MapContainer, TileLayer, Marker, Polyline } from "react-leaflet";
import L from "leaflet";
import { useDispatch } from "react-redux";
import { respondOffer } from "../../../store/driverSlice";

import "leaflet/dist/leaflet.css";
import "./LeafletMapModal.css";

/* Fix Leaflet marker icons */
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
  iconUrl:
    "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  shadowUrl:
    "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png"
});

const LeafletMapModal = ({ offer, onClose }) => {
  const dispatch = useDispatch();
  if (!offer) return null;

  const pickupCoords = [offer.pickup_lat, offer.pickup_lng];
  const dropCoords = [offer.drop_lat, offer.drop_lng];
  const centerCoords = [
    (pickupCoords[0] + dropCoords[0]) / 2,
    (pickupCoords[1] + dropCoords[1]) / 2
  ];

  const handleAccept = () => {
    dispatch(
      respondOffer({
        attemptId: offer.attempt_id,
        accept: true
      })
    );
    onClose();
  };

  const handleReject = () => {
    dispatch(
      respondOffer({
        attemptId: offer.attempt_id,
        accept: false
      })
    );
    onClose();
  };

  return (
    <div className="map-modal-overlay">
      <div className="map-modal-content card">
        <h2 className="modal-heading">Confirm Trip Offer</h2>

        <div className="map-info">
          <p><strong>Distance:</strong> {offer.distance_km} km</p>
          <p><strong>Fare:</strong> ₹{offer.fare_amount.toFixed(2)}</p>
        </div>

        <div className="map-container">
          <MapContainer
            center={centerCoords}
            zoom={13}
            style={{ height: "100%", width: "100%" }}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker position={pickupCoords} />
            <Marker position={dropCoords} />
            <Polyline positions={[pickupCoords, dropCoords]} />
          </MapContainer>
        </div>

        <div className="modal-actions">
          <button className="btn accept-confirm-btn" onClick={handleAccept}>
            Accept
          </button>
          <button className="btn reject-modal-btn" onClick={handleReject}>
            Reject
          </button>
          <button className="btn back-btn" onClick={onClose}>
            Back
          </button>
        </div>
      </div>
    </div>
  );
};

export default LeafletMapModal;
