import React from 'react';
import './AssignedVehicle.css';

const AssignedVehicle = () => {
  // Dummy Data - Matches the vehicle assignment response object structure
  const assignedVehicle = {
    vehicle_id: 'VEH4001',
    vehicle_number: 'CHX-7890',
    category: 'Sedan',
    brand: 'Toyota',
    model: 'Camry',
    color: 'Silver',
    start_time: '2023-10-20T08:00:00Z',
    end_time: null, // null means currently assigned
    is_active_assignment: true
  };

  const assignmentHistory = [
    {
      vehicle_id: 'VEH3005',
      vehicle_number: 'CHX-1234',
      category: 'SUV',
      brand: 'Honda',
      model: 'CR-V',
      color: 'Blue',
      start_time: '2023-09-01T09:00:00Z',
      end_time: '2023-10-19T17:00:00Z',
      is_active_assignment: false
    },
    {
      vehicle_id: 'VEH2010',
      vehicle_number: 'CHX-5678',
      category: 'Hatchback',
      brand: 'Suzuki',
      model: 'Swift',
      color: 'Red',
      start_time: '2023-07-15T10:00:00Z',
      end_time: '2023-08-31T18:00:00Z',
      is_active_assignment: false
    }
  ];

  return (
    <div className="assigned-vehicle-page">
      <h1 className="vehicle-heading">Your Assigned Vehicle</h1>
      <p className="vehicle-tagline">Details of the vehicle currently assigned to you.</p>

      {assignedVehicle.is_active_assignment ? (
        <div className="vehicle-assignment-card card">
          <div className="vehicle-header-section">
            <span className="vehicle-icon">🚗</span>
            <div className="vehicle-header-info">
              <h2 className="vehicle-number">{assignedVehicle.vehicle_number}</h2>
              <p className="vehicle-assignment-status">Status: <span className="status-badge active">Active Assignment</span></p>
            </div>
          </div>

          <div className="vehicle-details-grid">
            <div className="detail-item">
              <span className="detail-label">Vehicle ID:</span>
              <span className="detail-value">{assignedVehicle.vehicle_id}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Category:</span>
              <span className="detail-value">{assignedVehicle.category}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Brand:</span>
              <span className="detail-value">{assignedVehicle.brand}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Model:</span>
              <span className="detail-value">{assignedVehicle.model}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Color:</span>
              <span className="detail-value">{assignedVehicle.color}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Assignment Start:</span>
              <span className="detail-value">{new Date(assignedVehicle.start_time).toLocaleDateString()}</span>
            </div>
            {assignedVehicle.end_time && (
              <div className="detail-item">
                <span className="detail-label">Assignment End:</span>
                <span className="detail-value">{new Date(assignedVehicle.end_time).toLocaleDateString()}</span>
              </div>
            )}
          </div>

          <div className="vehicle-actions">
            <button className="btn report-issue-btn">Report Vehicle Issue</button>
            <button className="btn view-documents-btn">View Vehicle Documents</button>
          </div>
        </div>
      ) : (
        <p className="no-vehicle-message card">No vehicle currently assigned. Please contact support.</p>
      )}

      <h2 className="section-sub-heading">Previous Assignments</h2>
      {assignmentHistory.length > 0 ? (
        <div className="previous-assignments-list">
          {assignmentHistory.map(assignment => (
            <div key={assignment.vehicle_id} className="previous-assignment-card card">
              <div className="assignment-summary">
                <span className="summary-label">Vehicle:</span>
                <span className="summary-value">{assignment.brand} {assignment.model} ({assignment.vehicle_number})</span>
              </div>
              <div className="assignment-summary">
                <span className="summary-label">Period:</span>
                <span className="summary-value">
                  {new Date(assignment.start_time).toLocaleDateString()} - {assignment.end_time ? new Date(assignment.end_time).toLocaleDateString() : 'Present'}
                </span>
              </div>
              {/* Add more details or a 'View Details' button if needed */}
            </div>
          ))}
        </div>
      ) : (
        <p className="no-previous-assignments card">No previous vehicle assignments found.</p>
      )}
    </div>
  );
};

export default AssignedVehicle;