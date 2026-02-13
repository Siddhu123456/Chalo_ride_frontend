import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import {
  fetchDriverDashboardSummary,
  fetchCurrentShift,
  startShift,
  endShift,
  fetchDriverTrips,
  updateDriverLocation
} from "../../../store/driverSlice";

import useGeolocation from "../../../hooks/useGeolocation";
import usePolling from "../../../hooks/usePolling";

import "./DriverDashboard.css";
import { FaCheck, FaMoneyBillWave } from 'react-icons/fa';

const Dashboard = () => {
  const dispatch = useDispatch();
  const { getCurrentLocation } = useGeolocation();

  const {
    dashboardSummary,
    shift,
    tripHistory,
    profile
  } = useSelector((state) => state.driver);

  const [coords, setCoords] = useState(null);

  
  useEffect(() => {
    dispatch(fetchDriverDashboardSummary());
    dispatch(fetchCurrentShift());
    dispatch(fetchDriverTrips({ page: 1, limit: 5 }));

    getCurrentLocation()
      .then(setCoords)
      .catch(() => {});
  }, [dispatch, getCurrentLocation]);

  
  usePolling(
    () => {
      if (!shift || !coords || !profile) return;

      dispatch(
        updateDriverLocation({
          driver_id: profile.driver_id,
          latitude: coords.lat,
          longitude: coords.lng
        })
      );
    },
    15000,
    !!shift 
  );

  
  if (!dashboardSummary || !profile) {
    return <p className="dashboard-loading">Loading dashboard...</p>;
  }

  
  const { today, tenant } = dashboardSummary;
  const isOnline = !!shift;

  const startedAt = shift?.started_at
    ? new Date(shift.started_at)
    : null;

  const recentTrips = tripHistory?.list || [];

  
  const handleShiftToggle = () => {
    if (isOnline) {
      dispatch(endShift({ driver_id: profile.driver_id }));
    } else {
      if (!coords) return;

      dispatch(
        startShift({
          driver_id: profile.driver_id,
          tenant_id: tenant?.tenant_id,
          latitude: coords.lat,
          longitude: coords.lng
        })
      );
    }
  };

  return (
    <div className="driver-dashboard">
      <h1 className="dashboard-heading">
        Welcome Back, {profile.full_name}!
      </h1>

      <p className="dashboard-tagline">
        Here's an overview of your activity.
      </p>

      <div className="summary-cards">
        {today?.trip_count !== undefined && (
          <div className="card summary-card">
            <FaCheck className="icon-inline card-icon" />
            <h3 className="card-title">Trips Today</h3>
            <p className="card-value">{today.trip_count}</p>
          </div>
        )}

        {today?.total_earnings !== undefined && (
          <div className="card summary-card">
            <FaMoneyBillWave className="icon-inline card-icon" />
            <h3 className="card-title">Earnings Today</h3>
            <p className="card-value">
              ₹{today.total_earnings.toFixed(2)}
            </p>
          </div>
        )}
      </div>

      <div className="dashboard-sections-row">
        <div className="dashboard-sidebar-cards">
          <div className="card shift-status-card">
            <h2 className="card-section-title">Shift Status</h2>

            <div className="shift-indicator">
              <span className={`status-dot ${isOnline ? "active" : "inactive"}`} />
              <p className="shift-text">
                {isOnline
                  ? "You are currently ONLINE"
                  : "You are currently OFFLINE"}
              </p>
            </div>

            {isOnline && startedAt && (
              <div className="shift-details">
                <p>
                  Started at{" "}
                  {startedAt.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit"
                  })}
                </p>
              </div>
            )}

            <button
              className={`shift-toggle-btn ${isOnline ? "end" : "start"}`}
              onClick={handleShiftToggle}
            >
              {isOnline ? "End Shift" : "Start Shift"}
            </button>
          </div>
        </div>

        {recentTrips.length > 0 && (
          <div className="card recent-trips-card">
            <h2 className="card-section-title">Recent Trips</h2>

            <ul className="recent-trips-list">
              {recentTrips.map((trip) => (
                <li key={trip.trip_id} className="trip-item">
                  <span className="trip-id">#{trip.trip_id}</span>
                  <span className={`trip-status status-${trip.status.toLowerCase()}`}>
                    {trip.status}
                  </span>
                  <span className="trip-earnings">
                    ₹{trip.fare_amount.toFixed(2)}
                  </span>
                  <span className="trip-date">
                    {trip.completed_at
                      ? new Date(trip.completed_at).toLocaleDateString()
                      : "-"}
                  </span>
                </li>
              ))}
            </ul>

            <button className="view-all-btn">View All Trips</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
