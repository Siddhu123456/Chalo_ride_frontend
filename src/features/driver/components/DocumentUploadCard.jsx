import React, { useState, useRef } from "react";


const DocumentUploadCard = ({ type, uploaded, uploading, onUpload, status }) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  if (!type) return null;

  const documentTypes = {
    DRIVING_LICENSE: { name: "Driving License", description: "Front and back of valid license" },
    VEHICLE_REGISTRATION: { name: "Vehicle Registration", description: "Current registration certificate (RC)" },
    INSURANCE: { name: "Insurance Policy", description: "Valid vehicle insurance document" },
    PROFILE_PHOTO: { name: "Profile Photo", description: "A clear photo of your face" },
    BACKGROUND_CHECK: { name: "Background Check", description: "Police verification certificate" },
  };

  const docInfo = documentTypes[type] || { name: type.replace(/_/g, " "), description: "Upload required document" };

  const handleDrop = (e) => {
    e.preventDefault(); e.stopPropagation(); setIsDragging(false);
    if (!uploaded && !uploading && e.dataTransfer.files?.length > 0) {
      onUpload(type, e.dataTransfer.files[0]);
    }
  };

  const handleClick = () => {
    if (!uploaded && !uploading) fileInputRef.current?.click();
  };

  return (
    <div
      className={`doc-card ${uploaded ? 'card-uploaded' : 'card-pending'} ${isDragging ? "dragging" : ""}`}
      onDragEnter={(e) => { e.preventDefault(); setIsDragging(true); }}
      onDragLeave={(e) => { e.preventDefault(); setIsDragging(false); }}
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDrop}
      onClick={handleClick}
    >
      <div className="doc-card-inner">
        <div className={`doc-icon-wrapper ${uploaded ? 'icon-success' : 'icon-neutral'}`}>
            {uploaded ? (
                 <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
            ) : (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
            )}
        </div>

        <div className="doc-info">
            <h4 className="doc-name">{docInfo.name}</h4>
            <p className="doc-desc">{docInfo.description}</p>
        </div>

        <div className="doc-footer">
            {uploading ? (
                <div className="uploading-indicator">
                    <div className="spinner-small"></div>
                    <span>Uploading...</span>
                </div>
            ) : uploaded ? (
                <span className={`status-badge ${status?.toLowerCase()}`}>
                    {status === 'APPROVED' ? 'Verified' : 'Under Review'}
                </span>
            ) : (
                <span className="action-text">Click to browse</span>
            )}
        </div>
      </div>

      {!uploaded && !uploading && (
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.jpg,.jpeg,.png"
          onChange={(e) => e.target.files?.length && onUpload(type, e.target.files[0])}
          style={{ display: "none" }}
        />
      )}
    </div>
  );
};

export default DocumentUploadCard;