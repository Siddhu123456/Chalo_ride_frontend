import React, { useState, useEffect } from "react";
import DriverNavBar from "../components/DriverNavBar"; // Ensure path is correct
import DocumentUploadCard from "../components/DocumentUploadCard"; // We will create this below
import "./DriverDocsPage.css";

const DriverDocsPage = () => {
  const driverName = "Alex Sharma";
  const fleetName = "Chalo Express Fleet";
  const profileImage = "https://images.unsplash.com/photo-1535713875002-d1d0cfce72b.jpeg?auto=format&fit=crop&q=80&w=2940&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D";

  // Dummy State to simulate Backend Data
  const [docStatus, setDocStatus] = useState({
    missing: ["DRIVING_LICENSE", "VEHICLE_REGISTRATION" ],
    uploaded: [
      { document_type: "PAN", status: "APPROVED", document_id: "1" }
    ],
    all_uploaded: false
  });

  const [uploadProgress, setUploadProgress] = useState({});

  // Calculations for Progress Bar
  const totalRequired = 3; // Total docs needed
  const uploadedCount = docStatus.uploaded.length;
  const progressPercent = (uploadedCount / totalRequired) * 100;

  // Simulate File Upload
  const handleUpload = (type, file) => {
    // 1. Set loading state for specific card
    setUploadProgress((prev) => ({ ...prev, [type]: true }));

    console.log(`Uploading ${type}...`, file);

    // 2. Simulate Network Delay (2 seconds)
    setTimeout(() => {
      setDocStatus((prev) => {
        // Remove from missing
        const newMissing = prev.missing.filter((doc) => doc !== type);
        
        // Add to uploaded with "PENDING" status
        const newUploaded = [
          ...prev.uploaded,
          { document_type: type, status: "PENDING", document_id: Date.now().toString() }
        ];

        return {
          missing: newMissing,
          uploaded: newUploaded,
          all_uploaded: newMissing.length === 0
        };
      });

      // 3. Remove loading state
      setUploadProgress((prev) => ({ ...prev, [type]: false }));
    }, 2000);
  };

  return (
    <div className="driver-layout">
      {/* Reusing your existing NavBar */}
      <DriverNavBar 
        driverName={driverName} 
        fleetName={fleetName} 
        profileImage={profileImage} 
      />

      <div className="driver-docs-content">
        <div className="docs-container">
          
          {/* Header Section */}
          <div className="docs-header">
            <div className="header-text">
              <h1 className="page-title">Driver Verification</h1>
              <p className="page-subtitle">Upload the required documents to activate your account.</p>
            </div>

            {/* Progress Bar */}
            <div className="progress-container">
              <div className="progress-stats">
                <span className="progress-label">Completion Status</span>
                <span className="progress-value">{uploadedCount} of {totalRequired}</span>
              </div>
              <div className="progress-track">
                <div 
                  className="progress-fill" 
                  style={{ width: `${progressPercent}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Missing Documents Grid */}
          {docStatus.missing.length > 0 && (
            <div className="docs-section">
              <h3 className="section-heading">Pending Uploads</h3>
              <div className="docs-grid">
                {docStatus.missing.map((type) => (
                  <DocumentUploadCard
                    key={type}
                    type={type}
                    uploaded={false}
                    uploading={uploadProgress[type] || false}
                    onUpload={handleUpload}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Uploaded Documents Grid */}
          {docStatus.uploaded.length > 0 && (
            <div className="docs-section">
              <h3 className="section-heading">Uploaded Documents</h3>
              <div className="docs-grid">
                {docStatus.uploaded.map((doc) => (
                  <DocumentUploadCard
                    key={doc.document_id}
                    type={doc.document_type}
                    uploaded={true}
                    status={doc.status}
                    onUpload={() => {}} // No action for uploaded
                  />
                ))}
              </div>
            </div>
          )}

          {/* Success Banner (Shows when all docs are uploaded) */}
          {docStatus.all_uploaded && (
            <div className="completion-banner">
              <div className="completion-icon">🎉</div>
              <div className="completion-text">
                <h4>All Documents Submitted!</h4>
                <p>Our team is currently reviewing your profile. You will be notified via SMS once approved.</p>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default DriverDocsPage;