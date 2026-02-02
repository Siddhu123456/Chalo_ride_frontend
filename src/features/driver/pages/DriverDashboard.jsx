import React from 'react';
import './DriverDashboard.css'; // Don't forget to create this CSS file

const Dashboard = () => {
  // Dummy Data
  const driverName = "Alex Sharma";
  const dashboardSummary = {
    totalTrips: 125,
    totalEarnings: 3250.75, // USD
    averageRating: 4.8,
    onlineHours: 180, // hours
    completedTripsToday: 5,
  };

  const recentTrips = [
    { id: 'T78901', status: 'Completed', earnings: 25.50, date: '2023-10-26 14:30' },
    { id: 'T78899', status: 'Completed', earnings: 35.00, date: '2023-10-26 12:15' },
    { id: 'T78898', status: 'Cancelled', earnings: 0.00, date: '2023-10-26 11:00' },
    { id: 'T78897', status: 'Completed', earnings: 18.25, date: '2023-10-26 10:30' },
  ];

  const docStatus = {
    license: 'Verified',
    vehicleRegistration: 'Pending',
    insurance: 'Verified',
    backgroundCheck: 'Verified',
  };

  const currentShift = {
    isActive: true,
    startTime: '2023-10-26 09:00',
    duration: '06h 45m',
  };

  return (
    <div className="driver-dashboard">
      <h1 className="dashboard-heading">Welcome Back, {driverName}!</h1>
      <p className="dashboard-tagline">Here's an overview of your activity.</p>

      {/* Summary Cards */}
      <div className="summary-cards">
        <div className="card summary-card">
          <span className="card-icon">🚗</span>
          <h3 className="card-title">Total Trips</h3>
          <p className="card-value">{dashboardSummary.totalTrips}</p>
        </div>
        <div className="card summary-card">
          <span className="card-icon">💰</span>
          <h3 className="card-title">Total Earnings</h3>
          <p className="card-value">${dashboardSummary.totalEarnings.toFixed(2)}</p>
        </div>
        <div className="card summary-card">
          <span className="card-icon">⭐</span>
          <h3 className="card-title">Avg. Rating</h3>
          <p className="card-value">{dashboardSummary.averageRating}</p>
        </div>
        <div className="card summary-card">
          <span className="card-icon">⏱️</span>
          <h3 className="card-title">Online Hours</h3>
          <p className="card-value">{dashboardSummary.onlineHours} hrs</p>
        </div>
        <div className="card summary-card">
          <span className="card-icon">✅</span>
          <h3 className="card-title">Trips Today</h3>
          <p className="card-value">{dashboardSummary.completedTripsToday}</p>
        </div>
      </div>

      <div className="dashboard-sections-row">
        <div className="dashboard-sidebar-cards">
          {/* Shift Status */}
          <div className="card shift-status-card">
            <h2 className="card-section-title">Shift Status</h2>
            <div className="shift-indicator">
              <span className={`status-dot ${currentShift.isActive ? 'active' : 'inactive'}`}></span>
              <p className="shift-text">{currentShift.isActive ? 'You are currently ON SHIFT' : 'You are currently OFF SHIFT'}</p>
            </div>
            {currentShift.isActive && (
              <div className="shift-details">
                <p>Started: {new Date(currentShift.startTime).toLocaleTimeString()}</p>
                <p>Duration: {currentShift.duration}</p>
              </div>
            )}
            <button className={`shift-toggle-btn ${currentShift.isActive ? 'end' : 'start'}`}>
              {currentShift.isActive ? 'End Shift' : 'Start Shift'}
            </button>
          </div>
        </div>

        {/* Recent Trips */}
        <div className="card recent-trips-card">
          <h2 className="card-section-title">Recent Trips</h2>
          <ul className="recent-trips-list">
            {recentTrips.map(trip => (
              <li key={trip.id} className="trip-item">
                <span className="trip-id">{trip.id}</span>
                <span className={`trip-status status-${trip.status.toLowerCase()}`}>{trip.status}</span>
                <span className="trip-earnings">${trip.earnings.toFixed(2)}</span>
                <span className="trip-date">{new Date(trip.date).toLocaleDateString()}</span>
              </li>
            ))}
          </ul>
          <button className="view-all-btn">View All Trips</button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;