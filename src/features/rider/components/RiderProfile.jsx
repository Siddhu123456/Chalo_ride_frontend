import React from 'react';
import { User, Phone, Mail, MapPin, Calendar } from 'lucide-react';
import './RiderProfile.css';

const RiderProfile = () => {
  const profile = {
    user_id: "USR001",
    full_name: "Rahul Sharma",
    phone: "+91 98765 43210",
    email: "rahul.sharma@example.com",
    gender: "Male",
    country_code: "+91",
    status: "active",
    joined_on: "2024-01-15"
  };

  return (
    <div className="rider-profile-container">
      <div className="profile-header">
        <h1 className="profile-page-title">My Profile</h1>
      </div>

      <div className="profile-content">
        {/* Profile Avatar Section */}
        <div className="profile-avatar-section">
          <div className="avatar-circle">
            <User size={48} />
          </div>
          <div className="avatar-info">
            <h2>{profile.full_name}</h2>
            <p className="user-id">ID: {profile.user_id}</p>
            <span className={`status-badge ${profile.status}`}>
              {profile.status.charAt(0).toUpperCase() + profile.status.slice(1)}
            </span>
          </div>
        </div>

        {/* Profile Details Section */}
        <div className="profile-details-section">
          <h3 className="section-title">Personal Information</h3>
          
          <div className="detail-grid">
            <div className="detail-item">
              <div className="detail-icon">
                <Phone size={20} />
              </div>
              <div className="detail-content">
                <label>Phone Number</label>
                <p>{profile.phone}</p>
              </div>
            </div>

            <div className="detail-item">
              <div className="detail-icon">
                <Mail size={20} />
              </div>
              <div className="detail-content">
                <label>Email Address</label>
                <p>{profile.email}</p>
              </div>
            </div>

            <div className="detail-item">
              <div className="detail-icon">
                <User size={20} />
              </div>
              <div className="detail-content">
                <label>Gender</label>
                <p>{profile.gender}</p>
              </div>
            </div>

            <div className="detail-item">
              <div className="detail-icon">
                <MapPin size={20} />
              </div>
              <div className="detail-content">
                <label>Country Code</label>
                <p>{profile.country_code}</p>
              </div>
            </div>

            <div className="detail-item">
              <div className="detail-icon">
                <Calendar size={20} />
              </div>
              <div className="detail-content">
                <label>Member Since</label>
                <p>{new Date(profile.joined_on).toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Statistics Section */}
        <div className="profile-stats-section">
          <h3 className="section-title">Ride Statistics</h3>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-value">47</div>
              <div className="stat-label">Total Rides</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">₹3,240</div>
              <div className="stat-label">Total Spent</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">4.8</div>
              <div className="stat-label">Avg Rating</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">234 km</div>
              <div className="stat-label">Distance Traveled</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RiderProfile;