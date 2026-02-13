import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";


import { fetchOffers } from "../../../store/driverSlice";
import usePolling from "../../../hooks/usePolling";

import LeafletMapModal from "./LeafletMapModal";
import "./TripOffers.css";

const TripOffers = () => {
  const dispatch = useDispatch();
  const { offers, activeTrip } = useSelector((state) => state.driver);


  const [selectedOffer, setSelectedOffer] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    if (activeTrip) {
      navigate("/driver/trips/active");
    }
  }, [activeTrip, navigate]);


  
  usePolling(
    () => dispatch(fetchOffers()),
    5000,
    true
  );

  return (
    <div className="trip-offers-page">
      <h1 className="offers-heading">Pending Trip Offers</h1>
      <p className="offers-tagline">
        Review and respond to incoming trip requests.
      </p>

      {offers.length > 0 ? (
        <div className="offers-list">
          {offers.map((offer) => (
            <div key={offer.attempt_id} className="offer-card">
              
              <div className="offer-header">
                <h3 className="offer-id">
                  Offer #{offer.attempt_id}
                </h3>
                <span className="offer-fare">
                  ₹{offer.fare_amount.toFixed(2)}
                </span>
              </div>

              
              <div className="offer-details-summary">
                <div className="detail-item-summary">
                  <span className="summary-label">Pickup:</span>
                  <p className="summary-value">
                    {offer.pickup_address}
                  </p>
                </div>

                <div className="detail-item-summary">
                  <span className="summary-label">Drop:</span>
                  <p className="summary-value">
                    {offer.drop_address}
                  </p>
                </div>

                <div className="detail-item-summary">
                  <span className="summary-label">Distance:</span>
                  <p className="summary-value">
                    {offer.distance_km} km
                  </p>
                </div>

                <div className="detail-item-summary">
                  <span className="summary-label">Sent:</span>
                  <p className="summary-value">
                    {new Date(offer.sent_at).toLocaleTimeString()}
                  </p>
                </div>
              </div>

              
              <div className="offer-actions">
                <button
                  className="btn view-map-btn"
                  onClick={() => setSelectedOffer(offer)}
                >
                  View Map
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="no-offers-message">
          No pending trip offers at the moment.
        </p>
      )}

      {selectedOffer && (
        <LeafletMapModal
          offer={selectedOffer}
          onClose={() => setSelectedOffer(null)}
        />
      )}
    </div>
  );
};

export default TripOffers;
