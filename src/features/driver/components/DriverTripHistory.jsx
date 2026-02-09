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

import { fetchDriverTrips } from "../../../store/driverSlice";
import "./DriverTripHistory.css"; // KEEP SAME CSS

const DriverTripHistory = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  const dispatch = useDispatch();

  const {
    tripHistory,
    loading,
    error
  } = useSelector((state) => state.driver);

  useEffect(() => {
    dispatch(fetchDriverTrips({ page: 1, limit: 20 }));
  }, [dispatch]);

  const trips = tripHistory.list || [];

  /* ---------------- HELPERS ---------------- */

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

  /* ---------------- FILTERING ---------------- */

  const filteredTrips = trips.filter((trip) => {
    const matchesSearch =
      trip.pickup_address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      trip.drop_address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      trip.trip_id?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter =
      filterStatus === "all" || trip.status === filterStatus;

    return matchesSearch && matchesFilter;
  });

  /* ---------------- RENDER ---------------- */

  return (
    <div className="trip-history-container">
      {/* Header */}
      <div className="history-header">
        <div>
          <h1 className="history-page-title">Trip History</h1>
          <p className="history-subtitle">Review your completed trips</p>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="history-controls">
        <div className="search-box">
          <Search size={20} />
          <input
            type="text"
            placeholder="Search by location or trip ID..."
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

      {/* Trip List */}
      <div className="trips-list">
        {loading ? (
          <div className="no-trips">
            <p>Loading trips...</p>
          </div>
        ) : error ? (
          <div className="no-trips">
            <p>{error}</p>
          </div>
        ) : filteredTrips.length === 0 ? (
          <div className="no-trips">
            <p>No trips found</p>
          </div>
        ) : (
          filteredTrips.map((trip) => (
            <div key={trip.trip_id} className="trip-card">
              {/* Trip Header */}
              <div className="trip-header">
                <div className="trip-meta">
                  <span className="trip-id">#{trip.trip_id}</span>
                </div>
                {getStatusBadge(trip.status)}
              </div>

              {/* Trip Route */}
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

              {/* Trip Details */}
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
                      {formatDate(trip.completed_at)} •{" "}
                      {formatTime(trip.completed_at)}
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

export default DriverTripHistory;
