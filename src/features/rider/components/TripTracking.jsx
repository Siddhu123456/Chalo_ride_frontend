import React, { useState, useEffect } from 'react';
import { User, Phone, CheckCircle } from 'lucide-react';
import { Route } from 'lucide-react';
import './TripTracking.css';

const TripTracking = ({ ride, onNewRide }) => {
    const [status, setStatus] = useState('SEARCHING'); // SEARCHING -> ASSIGNED -> COMPLETED

    useEffect(() => {
        if (status === 'SEARCHING') {
            const timer = setTimeout(() => setStatus('ASSIGNED'), 3000);
            return () => clearTimeout(timer);
        }
        if (status === 'ASSIGNED') {
            const timer = setTimeout(() => setStatus('COMPLETED'), 8000);
            return () => clearTimeout(timer);
        }
    }, [status]);

    return (
        <div className="panel-card fade-in">
            {status === 'SEARCHING' && (
                <div className="status-view searching">
                    <div className="spinner"></div>
                    <h4>Searching for a driver...</h4>
                    <p>We're finding the best driver for you</p>
                </div>
            )}
            {status === 'ASSIGNED' && (
                <div className="status-view assigned">
                    <h3 className="panel-title">Driver is on the way!</h3>
                    <div className="driver-card">
                        <div className="driver-avatar"><User /></div>
                        <div className="driver-info">
                            <h5>Suresh Kumar</h5>
                            <p>+91 98765 43210</p>
                            <p className="vehicle-plate">TS09 EX 1234</p>
                        </div>
                        <div className="otp-display">
                            <span>OTP</span><strong>4582</strong>
                        </div>
                    </div>
                    <button className="call-btn"><Phone size={16} /> Call Driver</button>
                </div>
            )}
            {status === 'COMPLETED' && (
                <div className="status-view completed">
                    <CheckCircle size={48} className="success-icon" />
                    <h4>Trip Completed!</h4>
                    <p>You have arrived at your destination.</p>
                    <div className="fare-breakup final-fare">
                        <div className="fare-line total">
                            <span>Total Fare Paid</span><span>₹{ride.price}</span>
                        </div>
                    </div>
                    <button className="primary-btn" onClick={onNewRide}>Book Another Ride</button>
                     <div className="route-indicator">
                        <Route size={200} />
                    </div>
                </div>
            )}
        </div>
    );
};

export default TripTracking;