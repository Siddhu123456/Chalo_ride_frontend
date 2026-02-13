import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchDriverProfile } from "../../../store/driverSlice";
import "./DriverProfile.css";

const DriverProfile = () => {
  const dispatch = useDispatch();

  const { profile } = useSelector((state) => state.driver);

  
  useEffect(() => {
    if (!profile) {
      dispatch(fetchDriverProfile());
    }
  }, [dispatch, profile]);

  if (!profile) {
    return (
      <div className="driver-profile-page">
        <p>Loading profile...</p>
      </div>
    );
  }

  const approvalClass = profile.approval_status?.toLowerCase();

  return (
    <div className="driver-profile-page">
      <h1 className="profile-heading">Your Profile</h1>
      <p className="profile-tagline">
        Manage your personal information and status.
      </p>

      <div className="profile-card card">
        <div className="profile-header-section">
          
          <img
            src="https://images.unsplash.com/photo-1535713875002-d1d0cfce72b.jpeg"
            alt={profile.full_name}
            className="profile-main-avatar"
          />

          <div className="profile-header-info">
            <h2 className="profile-name">{profile.full_name}</h2>
            <p className="profile-status">
              Status:{" "}
              <span className={`status-badge ${approvalClass}`}>
                {profile.approval_status}
              </span>
            </p>
          </div>
        </div>

        <div className="profile-details-grid">
          <div className="detail-item">
            <span className="detail-label">Driver ID:</span>
            <span className="detail-value">{profile.driver_id}</span>
          </div>

          <div className="detail-item">
            <span className="detail-label">Phone:</span>
            <span className="detail-value">{profile.phone}</span>
          </div>

          <div className="detail-item">
            <span className="detail-label">Rating:</span>
            <span className="detail-value star-rating">
              {"⭐".repeat(Math.floor(profile.rating || 0))}{" "}
              {profile.rating?.toFixed(1) || "0.0"}
            </span>
          </div>

          <div className="detail-item">
            <span className="detail-label">Type:</span>
            <span className="detail-value">{profile.driver_type}</span>
          </div>
        </div>

        <div className="profile-actions">
          <button className="btn edit-profile-btn" disabled>
            Edit Profile
          </button>
        </div>
      </div>
    </div>
  );
};

export default DriverProfile;
