import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

import DriverNavBar from "../components/DriverNavBar";
import DocumentUploadCard from "../components/DocumentUploadCard";

import {
  fetchDriverDocStatus,
  uploadDriverDocument,
  fetchDriverProfile
} from "../../../store/driverSlice";

import "./DriverDocsPage.css";

const DriverDocsPage = () => {
  const dispatch = useDispatch();

  const { docStatus, profile } = useSelector((state) => state.driver);

  const [uploadProgress, setUploadProgress] = useState({});

  /* =====================================================
     LOAD PROFILE + DOCUMENT STATUS
  ===================================================== */
  useEffect(() => {
    dispatch(fetchDriverProfile());
    dispatch(fetchDriverDocStatus());
  }, [dispatch]);

  /* =====================================================
     AUTO REDIRECT WHEN APPROVED
     (CRITICAL FIX)
  ===================================================== */
  if (profile?.approval_status === "APPROVED") {
    return <Navigate to="/driver/dashboard" replace />;
  }

  /* =====================================================
     LOADING STATE
  ===================================================== */
  if (!docStatus) {
    return (
      <div className="docs-loading">
        <p>Loading document status...</p>
      </div>
    );
  }

  /* =====================================================
     PROGRESS CALCULATION
  ===================================================== */
  const totalRequired =
    docStatus.missing.length + docStatus.uploaded.length;

  const uploadedCount = docStatus.uploaded.length;

  const progressPercent =
    totalRequired === 0
      ? 100
      : Math.round((uploadedCount / totalRequired) * 100);

  /* =====================================================
     DOCUMENT UPLOAD HANDLER (REAL BACKEND)
  ===================================================== */
  const handleUpload = async (type, file) => {
    setUploadProgress((prev) => ({ ...prev, [type]: true }));

    const formData = new FormData();
    formData.append("document_type", type);
    formData.append("file", file);

    try {
      await dispatch(uploadDriverDocument(formData)).unwrap();

      // 🔁 Refresh state after successful upload
      dispatch(fetchDriverDocStatus());
      dispatch(fetchDriverProfile());
    } catch (err) {
      console.error("Upload failed:", err);
    } finally {
      setUploadProgress((prev) => ({ ...prev, [type]: false }));
    }
  };

  return (
    <div className="driver-layout">
      {/* NavBar reused across pages */}
      <DriverNavBar />

      <div className="driver-docs-content">
        <div className="docs-container">

          {/* ================= HEADER ================= */}
          <div className="docs-header">
            <div className="header-text">
              <h1 className="page-title">Driver Verification</h1>
              <p className="page-subtitle">
                Upload required documents to activate your account.
              </p>
            </div>

            <div className="progress-container">
              <div className="progress-stats">
                <span className="progress-label">
                  Completion Status
                </span>
                <span className="progress-value">
                  {uploadedCount} of {totalRequired}
                </span>
              </div>

              <div className="progress-track">
                <div
                  className="progress-fill"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          </div>

          {/* ================= MISSING DOCUMENTS ================= */}
          {docStatus.missing.length > 0 && (
            <div className="docs-section">
              <h3 className="section-heading">
                Pending Uploads
              </h3>

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

          {/* ================= UPLOADED DOCUMENTS ================= */}
          {docStatus.uploaded.length > 0 && (
            <div className="docs-section">
              <h3 className="section-heading">
                Uploaded Documents
              </h3>

              <div className="docs-grid">
                {docStatus.uploaded.map((doc) => (
                  <DocumentUploadCard
                    key={doc.document_id}
                    type={doc.document_type}
                    uploaded={true}
                    status={doc.verification_status}
                  />
                ))}
              </div>
            </div>
          )}

          {/* ================= ALL DOCS SUBMITTED ================= */}
          {docStatus.missing.length === 0 &&
            profile?.approval_status !== "APPROVED" && (
              <div className="completion-banner">
                <div className="completion-icon">⏳</div>
                <div className="completion-text">
                  <h4>Documents Submitted</h4>
                  <p>
                    Your documents are under review. You will be
                    automatically redirected once approved.
                  </p>
                </div>
              </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default DriverDocsPage;
