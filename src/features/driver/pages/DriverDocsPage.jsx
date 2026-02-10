import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import DriverNavBar from "../components/DriverNavBar";
import DocumentUploadCard from "../components/DocumentUploadCard";

import {
  fetchDriverDocStatus,
  uploadDriverDocument,
  fetchDriverProfile,
  fetchDriverDashboardSummary
} from "../../../store/driverSlice";
import { logout } from "../../../store/authSlice";

import "./DriverDocsPage.css";

const DriverDocsPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { docStatus, profile } = useSelector(
    (state) => state.driver
  );

  const [uploadProgress, setUploadProgress] = useState({});

  /* ================= LOGOUT HANDLER ================= */
  const handleLogout = () => {
    dispatch(logout());        // optional but recommended
    localStorage.clear();

    navigate("/auth", { replace: true });
  };
  
  /* ================= INITIAL LOAD ================= */
  useEffect(() => {
    dispatch(fetchDriverProfile());
    dispatch(fetchDriverDocStatus());
    dispatch(fetchDriverDashboardSummary());
  }, [dispatch]);

  /* ================= REDIRECT IF APPROVED ================= */
  useEffect(() => {
    if (profile?.approval_status === "APPROVED") {
      navigate("/driver/dashboard", { replace: true });
    }
  }, [profile, navigate]);

  /* ================= LOADING ================= */
  if (!docStatus || !profile) {
    return (
      <div className="docs-loading">
        <p>Loading document status...</p>
      </div>
    );
  }

  /* ================= PROGRESS ================= */
  const totalRequired =
    docStatus.missing.length + docStatus.uploaded.length;

  const uploadedCount = docStatus.uploaded.length;

  const progressPercent =
    totalRequired === 0
      ? 100
      : Math.round((uploadedCount / totalRequired) * 100);

  /* ================= UPLOAD HANDLER ================= */
  const handleUpload = async (type, file) => {
    if (!file || file.type !== "application/pdf") {
      alert("Only PDF files are allowed");
      return;
    }

    setUploadProgress((prev) => ({ ...prev, [type]: true }));

    const formData = new FormData();
    formData.append("document_type", type);
    formData.append("file", file);

    try {
      await dispatch(uploadDriverDocument(formData)).unwrap();
      dispatch(fetchDriverDocStatus());
      dispatch(fetchDriverProfile());
    } catch (err) {
      console.error("Upload failed:", err);
    } finally {
      setUploadProgress((prev) => ({ ...prev, [type]: false }));
    }
  };

  /* ================= SPLIT UPLOADED DOCS BY STATUS ================= */
  // CHANGE: Separate rejected docs from the rest for a dedicated section
  const rejectedDocs = docStatus.uploaded.filter(
    (doc) => doc.verification_status === "REJECTED"
  );
  const nonRejectedUploadedDocs = docStatus.uploaded.filter(
    (doc) => doc.verification_status !== "REJECTED"
  );

  return (
    <div className="driver-layout">
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
                <span className="progress-label">Completion Status</span>
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

            {/* CHANGE: Logout button anchored to the right of the header */}
            <div className="header-actions">
              <button className="logout-btn" onClick={handleLogout}>
                <svg
                  className="logout-icon"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
                Logout
              </button>
            </div>
          </div>

          {/* ================= REJECTED DOCUMENTS ================= */}
          {/* CHANGE: Dedicated section for rejected docs with attention-grabbing heading */}
          {rejectedDocs.length > 0 && (
            <div className="docs-section">
              <h3 className="section-heading section-heading--rejected">
                Action Required — Documents Rejected
              </h3>

              <div className="docs-grid">
                {rejectedDocs.map((doc) => (
                  <DocumentUploadCard
                    key={doc.document_id}
                    type={doc.document_type}
                    status={doc.verification_status}   // "REJECTED"
                    uploaded={false}                   // CHANGE: rejected = not accepted
                    uploading={uploadProgress[doc.document_type] || false}
                    onUpload={handleUpload}            // CHANGE: always allow re-upload
                  />
                ))}
              </div>
            </div>
          )}

          {/* ================= MISSING DOCUMENTS ================= */}
          {docStatus.missing.length > 0 && (
            <div className="docs-section">
              <h3 className="section-heading">Pending Uploads</h3>

              <div className="docs-grid">
                {docStatus.missing.map((type) => (
                  <DocumentUploadCard
                    key={type}
                    type={type}
                    status={null}
                    uploaded={false}
                    uploading={uploadProgress[type] || false}
                    onUpload={handleUpload}
                  />
                ))}
              </div>
            </div>
          )}

          {/* ================= UPLOADED DOCUMENTS ================= */}
          {nonRejectedUploadedDocs.length > 0 && (
            <div className="docs-section">
              <h3 className="section-heading">Uploaded Documents</h3>

              <div className="docs-grid">
                {nonRejectedUploadedDocs.map((doc) => {
                  const status = doc.verification_status;
                  const isApproved = status === "APPROVED";
                  // CHANGE: explicit check — only PENDING gets re-upload here
                  const isReuploadable = status === "PENDING";

                  return (
                    <DocumentUploadCard
                      key={doc.document_id}
                      type={doc.document_type}
                      status={status}
                      uploaded={isApproved}
                      uploading={uploadProgress[doc.document_type] || false}
                      onUpload={isReuploadable ? handleUpload : undefined}
                    />
                  );
                })}
              </div>
            </div>
          )}

          {/* ================= ALL SUBMITTED ================= */}
          {docStatus.missing.length === 0 &&
            rejectedDocs.length === 0 &&        // CHANGE: hide banner if any rejections exist
            profile.approval_status !== "APPROVED" && (
              <div className="completion-banner">
                <div className="completion-icon"></div>
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