import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

import {
  fetchCurrentVehicleAssignment
} from "../../../store/driverSlice";

import "./AssignedVehicle.css";
import { FaCar } from 'react-icons/fa';

const AssignedVehicle = () => {
  const dispatch = useDispatch();

  const { vehicleAssignment, loading } = useSelector(
    (state) => state.driver
  );

  
  useEffect(() => {
    dispatch(fetchCurrentVehicleAssignment());
  }, [dispatch]);

  if (loading) {
    return (
      <p className="vehicle-loading">
        Loading assigned vehicle...
      </p>
    );
  }

  return (
    <div className="assigned-vehicle-page">
      <h1 className="vehicle-heading">Your Assigned Vehicle</h1>
      <p className="vehicle-tagline">
        Details of the vehicle currently assigned to you.
      </p>

      
      {vehicleAssignment ? (
        <div className="vehicle-assignment-card card">
          <div className="vehicle-header-section">
            <FaCar className="icon-inline vehicle-icon" />
            <div className="vehicle-header-info">
              <h2 className="vehicle-number">
                {vehicleAssignment.registration_no}
              </h2>
              <p className="vehicle-assignment-status">
                Status:{" "}
                <span className="status-badge active">
                  Active Assignment
                </span>
              </p>
            </div>
          </div>

          <div className="vehicle-details-grid">
            <div className="detail-item">
              <span className="detail-label">Registration No:</span>
              <span className="detail-value">
                {vehicleAssignment.registration_no}
              </span>
            </div>

            <div className="detail-item">
              <span className="detail-label">Category:</span>
              <span className="detail-value">
                {vehicleAssignment.category}
              </span>
            </div>

            <div className="detail-item">
              <span className="detail-label">Make:</span>
              <span className="detail-value">
                {vehicleAssignment.make}
              </span>
            </div>

            <div className="detail-item">
              <span className="detail-label">Model:</span>
              <span className="detail-value">
                {vehicleAssignment.model}
              </span>
            </div>

            {vehicleAssignment.year_of_manufacture && (
              <div className="detail-item">
                <span className="detail-label">Year:</span>
                <span className="detail-value">
                  {vehicleAssignment.year_of_manufacture}
                </span>
              </div>
            )}

            {vehicleAssignment.start_time && (
              <div className="detail-item">
                <span className="detail-label">
                  Assignment Start:
                </span>
                <span className="detail-value">
                  {new Date(
                    vehicleAssignment.start_time
                  ).toLocaleDateString()}
                </span>
              </div>
            )}
          </div>

          <div className="vehicle-actions">
            <button className="btn report-issue-btn">
              Report Vehicle Issue
            </button>
            <button className="btn view-documents-btn">
              View Vehicle Documents
            </button>
          </div>
        </div>
      ) : (
        <p className="no-vehicle-message card">
          No vehicle currently assigned. Please contact support.
        </p>
      )}
    </div>
  );
};

export default AssignedVehicle;
