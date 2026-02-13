import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  MapPin,
  Navigation,
  Calendar,
  IndianRupee,
  Filter,
  Search,
  Bike,
  Car,
  Truck,
} from "lucide-react";

import { fetchRiderTripHistory } from "../../../store/riderSlice";
import "./RiderTripHistory.css";

const RiderTripHistory = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  const dispatch = useDispatch();

  const {
    tripHistory = [],
    loadingTripHistory,
    error,
  } = useSelector((state) => state.rider);

  useEffect(() => {
    dispatch(fetchRiderTripHistory());
  }, [dispatch]);

  const trips = tripHistory;

  

  const getVehicleIcon = (category = "") => {
    switch (category.toLowerCase()) {
      case "bike":
        return <Bike size={20} />;
      case "cab":
        return <Car size={20} />;
      case "auto":
        return <Truck size={20} />;
      default:
        return <Car size={20} />;
    }
  };

  const getStatusBadge = (status = "") => {
    const statusClass = status.toLowerCase();
    return (
      <span className={`trip-status-badge ${statusClass}`}>
        {status}
      </span>
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatTime = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  

  const filteredTrips = trips.filter((trip) => {
    const matchesSearch =
      trip.pickup_address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      trip.drop_address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      trip.tenant_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      trip.trip_id?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter =
      filterStatus === "all" || trip.status === filterStatus;

    return matchesSearch && matchesFilter;
  });

  

  return (
    <div className="trip-history-container">
      
      <div className="history-header">
        <div>
          <h1 className="history-page-title">Trip History</h1>
          <p className="history-subtitle">Review your past rides</p>
        </div>
      </div>

      
      <div className="history-controls">
        <div className="search-box">
          <Search size={20} />
          <input
            type="text"
            placeholder="Search by location, tenant, or trip ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="filter-group">
          <Filter size={20} />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="all">All Trips</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      
      <div className="trips-list">
        {loadingTripHistory ? (
          <div className="no-trips">
            <p>Loading trips...</p>
          </div>
        ) : error ? (
          <div className="no-trips">
            <p>{error}</p>
          </div>
        ) : filteredTrips.length === 0 ? (
          <div className="no-trips">
            <p>No trips found matching your criteria</p>
          </div>
        ) : (
          filteredTrips.map((trip) => (
            <div key={trip.trip_id} className="trip-card">
              
              <div className="trip-header">
                <div className="trip-meta">
                  <span className="trip-id">#{trip.trip_id}</span>
                  <span className="trip-tenant">{trip.tenant_name}</span>
                </div>
                {getStatusBadge(trip.status)}
              </div>

              
              <div className="trip-route">
                <div className="route-line-wrapper">
                  <div className="route-point pickup">
                    <MapPin size={18} />
                    <div className="point-details">
                      <span className="point-label">Pickup</span>
                      <span className="point-address">
                        {trip.pickup_address}
                      </span>
                    </div>
                  </div>

                  <div className="route-connector"></div>

                  <div className="route-point drop">
                    <Navigation size={18} />
                    <div className="point-details">
                      <span className="point-label">Drop</span>
                      <span className="point-address">
                        {trip.drop_address}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              
              <div className="trip-details">
                <div className="detail-item">
                  <div className="detail-icon-wrapper vehicle">
                    {getVehicleIcon(trip.vehicle_category)}
                  </div>
                  <div className="detail-text">
                    <span className="detail-label">Vehicle</span>
                    <span className="detail-value">
                      {trip.vehicle_category}
                    </span>
                  </div>
                </div>

                <div className="detail-item">
                  <div className="detail-icon-wrapper date">
                    <Calendar size={18} />
                  </div>
                  <div className="detail-text">
                    <span className="detail-label">Date & Time</span>
                    <span className="detail-value">
                      {formatDate(trip.created_at)} •{" "}
                      {formatTime(trip.created_at)}
                    </span>
                  </div>
                </div>

                <div className="detail-item">
                  <div className="detail-icon-wrapper fare">
                    <IndianRupee size={18} />
                  </div>
                  <div className="detail-text">
                    <span className="detail-label">Fare</span>
                    <span className="detail-value fare-amount">
                      ₹{Number(trip.fare_amount).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default RiderTripHistory;
