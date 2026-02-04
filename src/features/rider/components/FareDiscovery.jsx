import React from 'react';
import { ChevronRight, Bike, Car, Truck } from 'lucide-react';
import './FareDiscovery.css';

const FareDiscovery = ({ onRideSelect }) => {
  const fareEstimates = [
    { id: 1, name: 'Ridex', price: 205, available: '3 drivers nearby', icon: 'bike' },
    { id: 2, name: 'QuickCab', price: 215, available: '2 drivers nearby', icon: 'car' },
    { id: 3, name: 'SpeedTaxi', price: 220, available: '3 drivers nearby', icon: 'truck' },
  ];

  const getIcon = (type) => {
    switch(type) {
      case 'bike': return <Bike size={28} />;
      case 'car': return <Car size={28} />;
      case 'truck': return <Truck size={28} />;
      default: return <Car size={28} />;
    }
  };

  return (
    <div className="panel-card fade-in">
      <h3 className="panel-title">Choose Your Ride</h3>
      <div className="tabs">
        <button className="tab active">CAB</button>
        <button className="tab">AUTO</button>
        <button className="tab">BIKE</button>
      </div>
      <div className="ride-list">
        {fareEstimates.map(ride => (
          <div key={ride.id} className="ride-item" onClick={() => onRideSelect(ride)}>
            <div className="ride-details">
              <span className="ride-icon">{getIcon(ride.icon)}</span>
              <div>
                <h4>{ride.name}</h4>
                <p>{ride.available}</p>
              </div>
            </div>
            <div className="ride-price">
              <span>₹{ride.price}</span>
              <ChevronRight size={18} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FareDiscovery;