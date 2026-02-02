import React, { useState } from 'react';
import LeafletMapModal from './LeafletMapModal'; // Import the new modal
import './TripOffers.css';

const TripOffers = () => {
  // Dummy Data - Matches DriverOfferResponse structure
  const [pendingOffers, setPendingOffers] = useState([ // Using useState to manage offers for removal
    {
      attempt_id: 'OFF1001',
      trip_id: 'TRIP2023001',
      pickup_lat: 34.0522,
      pickup_lng: -118.2437,
      pickup_address: '123 Main St, Downtown Los Angeles',
      drop_lat: 34.0207,
      drop_lng: -118.6919,
      drop_address: '456 Beach Rd, Santa Monica',
      fare_amount: 35.75,
      sent_at: '2023-10-27T10:00:00Z',
    },
    {
      attempt_id: 'OFF1002',
      trip_id: 'TRIP2023002',
      pickup_lat: 33.9416,
      pickup_lng: -118.4061,
      pickup_address: 'LAX Airport Terminal 3',
      drop_lat: 34.0522,
      drop_lng: -118.2437,
      drop_address: 'Hollywood Walk of Fame, Los Angeles',
      fare_amount: 50.20,
      sent_at: '2023-10-27T10:15:00Z',
    },
    {
      attempt_id: 'OFF1003',
      trip_id: 'TRIP2023003',
      pickup_lat: 34.1018,
      pickup_lng: -118.3392,
      pickup_address: 'Universal Studios Hollywood',
      drop_lat: 34.0522,
      drop_lng: -118.2437,
      drop_address: 'Chinatown, Los Angeles',
      fare_amount: 22.00,
      sent_at: '2023-10-27T10:30:00Z',
    },
  ]);

  const [selectedOffer, setSelectedOffer] = useState(null); // State to store the offer for the modal

  const handleViewOffer = (offer) => {
    setSelectedOffer(offer); // Set the offer to display in the modal
  };

  const handleConfirmAccept = (attemptId, tripId) => {
    console.log(`CONFIRMED Accept offer ${attemptId} for trip ${tripId}`);
    // In a real app, dispatch an action to accept the offer
    // Then, remove the offer from pendingOffers
    setPendingOffers(prevOffers => prevOffers.filter(o => o.attempt_id !== attemptId));
    setSelectedOffer(null); // Close the modal
  };

  const handleReject = (attemptId) => {
    console.log(`REJECTED offer: ${attemptId}`);
    // In a real app, dispatch an action to reject the offer
    // Then, remove the offer from pendingOffers
    setPendingOffers(prevOffers => prevOffers.filter(o => o.attempt_id !== attemptId));
    setSelectedOffer(null); // Close the modal
  };

  const handleBack = () => {
    setSelectedOffer(null); // Close the modal
  };

  return (
    <div className="trip-offers-page">
      <h1 className="offers-heading">Pending Trip Offers</h1>
      <p className="offers-tagline">Review and respond to new trip requests.</p>

      {pendingOffers.length > 0 ? (
        <div className="offers-list">
          {pendingOffers.map(offer => (
            <div key={offer.attempt_id} className="offer-card card">
              <div className="offer-header">
                <h3 className="offer-id">Offer ID: {offer.attempt_id}</h3>
                <span className="offer-fare">${offer.fare_amount.toFixed(2)}</span>
              </div>
              <div className="offer-details-summary"> {/* Simplified details for card */}
                <div className="detail-item-summary">
                  <span className="summary-label">Pickup:</span>
                  <p className="summary-value">{offer.pickup_address}</p>
                </div>
                <div className="detail-item-summary">
                  <span className="summary-label">Dropoff:</span>
                  <p className="summary-value">{offer.drop_address}</p>
                </div>
                {/* Distance could be calculated here or passed from backend */}
                <div className="detail-item-summary">
                  <span className="summary-label">Offer Sent:</span>
                  <p className="summary-value">{new Date(offer.sent_at).toLocaleTimeString()}</p>
                </div>
              </div>
              <div className="offer-actions">
                <button className="btn view-map-btn" onClick={() => handleViewOffer(offer)}>View Map & Accept</button>
                <button className="btn reject-btn" onClick={() => handleReject(offer.attempt_id)}>Reject</button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="no-offers-message">No pending trip offers at the moment. Stay tuned!</p>
      )}

      {/* Render the Leaflet Map Modal if an offer is selected */}
      {selectedOffer && (
        <LeafletMapModal
          offer={selectedOffer}
          onConfirmAccept={handleConfirmAccept}
          onBack={handleBack}
          onReject={handleReject} // Pass reject handler to modal
        />
      )}
    </div>
  );
};

export default TripOffers;