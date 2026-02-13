import React from 'react';
import { ChevronRight, Bike, Car, Truck } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { setVehicleCategory, selectRide } from '../../../store/fareSlice';
import './FareDiscovery.css';

const FareDiscovery = ({ onRideSelect }) => {
  const dispatch = useDispatch();

  const {
    estimates,
    vehicleCategory,
    loading,
  } = useSelector((state) => state.fare);

  const getIcon = (type) => {
    switch (type) {
      case 'BIKE':
        return <Bike size={28} />;
      case 'AUTO':
        return <Truck size={28} />;
      case 'CAB':
      default:
        return <Car size={28} />;
    }
  };

  
  const filteredEstimates = estimates.filter(
    (e) => e.vehicle_category === vehicleCategory
  );

  const noDriversAvailable =
    !loading &&
    estimates.length === 0;

  return (
    <div className="panel-card fade-in">
      <h3 className="panel-title">Choose Your Ride</h3>

      
      <div className="tabs">
        {['CAB', 'AUTO', 'BIKE'].map((cat) => (
          <button
            key={cat}
            className={`tab ${vehicleCategory === cat ? 'active' : ''}`}
            onClick={() => dispatch(setVehicleCategory(cat))}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="ride-list">
        
        {loading && <p>Fetching available rides...</p>}

        
        {noDriversAvailable && (
          <p>No drivers available at the moment</p>
        )}

        
        {!loading && !noDriversAvailable && filteredEstimates.length === 0 && (
          <p>No rides available for this vehicle type</p>
        )}

        
        {filteredEstimates.map((ride) => (
          <div
            key={ride.id}
            className="ride-item"
            onClick={() => {
              dispatch(selectRide(ride));
              onRideSelect(ride);
            }}
          >
            <div className="ride-details">
              <span className="ride-icon">
                {getIcon(ride.vehicle_category)}
              </span>
              <div>
                <h4>{ride.name}</h4>
                <p>{ride.available}</p>
              </div>
            </div>

            <div className="ride-price">
              <span>₹{Math.round(ride.price)}</span>
              <ChevronRight size={18} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FareDiscovery;
