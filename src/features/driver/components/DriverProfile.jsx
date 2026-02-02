import React from 'react';
import './DriverProfile.css';

const DriverProfile = () => {
  // Dummy Data - Matches the driver profile response object structure
  const driverProfile = {
    driver_id: 'DRV1001',
    full_name: 'Alex Sharma',
    phone: '+1 (555) 123-4567',
    rating: 4.8,
    approval_status: 'Approved',
    profile_image: "https://images.unsplash.com/photo-1535713875002-d1d0cfce72b.jpeg?auto=format&fit=crop&q=80&w=2940&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
  };

  return (
    <div className="driver-profile-page">
      <h1 className="profile-heading">Your Profile</h1>
      <p className="profile-tagline">Manage your personal information and status.</p>

      <div className="profile-card card">
        <div className="profile-header-section">
          <img src={driverProfile.profile_image} alt={driverProfile.full_name} className="profile-main-avatar" />
          <div className="profile-header-info">
            <h2 className="profile-name">{driverProfile.full_name}</h2>
            <p className="profile-status">Status: <span className={`status-badge ${driverProfile.approval_status.toLowerCase()}`}>{driverProfile.approval_status}</span></p>
          </div>
        </div>

        <div className="profile-details-grid">
          <div className="detail-item">
            <span className="detail-label">Driver ID:</span>
            <span className="detail-value">{driverProfile.driver_id}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Phone:</span>
            <span className="detail-value">{driverProfile.phone}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Rating:</span>
            <span className="detail-value star-rating">{'⭐'.repeat(Math.floor(driverProfile.rating))} {driverProfile.rating.toFixed(1)}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Email:</span> {/* Assuming email would be part of profile */}
            <span className="detail-value">alex.sharma@example.com</span>
          </div>
          {/* Add more profile details here if necessary */}
        </div>

        <div className="profile-actions">
          <button className="btn edit-profile-btn">Edit Profile</button>
        </div>
      </div>
    </div>
  );
};

export default DriverProfile;