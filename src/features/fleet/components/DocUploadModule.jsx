import React, { useMemo, useState } from "react";
import "./DocUploadModule.css";

const DOC_TYPES = [
  { key: "AADHAAR", label: "Aadhaar Card", desc: "Personal ID Verification" },
  { key: "PAN", label: "PAN Card", desc: "Tax Identification" },
  { key: "GST_CERTIFICATE", label: "GST Certificate", desc: "Business Registration" },
  { key: "BUSINESS_REGISTRATION", label: "Incorporation", desc: "Proof of Ownership" },
];

const DocUploadModule = ({ fleetId, docStatus, dispatch, uploadAction }) => {
  const [activeDoc, setActiveDoc] = useState(null);
  const [file, setFile] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = (label) => {
    setToast(label);
    setTimeout(() => setToast(null), 3500);
  };

  const uploadedDocs = Array.isArray(docStatus?.uploaded) ? docStatus.uploaded : [];

  const getDocEntry = (key) =>
    uploadedDocs.find((d) => d.document_type === key);

  // API returns `verification_status`, not `status`
  const getDocStatus = (key) => getDocEntry(key)?.verification_status;

  const canUpload = (key) => {
    const status = getDocStatus(key);
    return !status || status === "PENDING" || status === "REJECTED";
  };

  const getStatusLabel = (key) => {
    const status = getDocStatus(key);
    if (status === "APPROVED") return "Approved";
    if (status === "REJECTED") return "Rejected";
    if (status === "PENDING") return "Under Review";
    return "Not Uploaded";
  };

  const progress = useMemo(() => {
    if (DOC_TYPES.length === 0) return 0;
    // use verification_status here too
    const approvedCount = uploadedDocs.filter(
      (d) => d.verification_status === "APPROVED"
    ).length;
    return Math.round((approvedCount / DOC_TYPES.length) * 100);
  }, [uploadedDocs]);

  const handleFileSubmit = async (e) => {
    e.preventDefault();
    if (!file || !activeDoc) return;

    const uploadedLabel = DOC_TYPES.find((d) => d.key === activeDoc)?.label || activeDoc;

    const result = await dispatch(
      uploadAction({
        fleetId,
        docData: {
          document_type: activeDoc,
          file,
        },
      })
    );

    setActiveDoc(null);
    setFile(null);

    // Show success toast unless the action was rejected
    if (!result?.error) {
      showToast(uploadedLabel);
    }
  };

  return (
    <div className="du-container">
      <div className="du-progress-bar">
        <div className="du-progress-text">
          Verification Progress: {progress}%
        </div>
        <div className="du-track">
          <div className="du-fill" style={{ width: `${progress}%` }}></div>
        </div>
      </div>

      <div className="du-grid">
        {DOC_TYPES.map((doc) => {
          const status = getDocStatus(doc.key);
          const uploadAllowed = canUpload(doc.key);

          return (
            <div key={doc.key} className={`du-card ${status ? "done" : ""}`}>
              <div className="du-card-info">
                <h3>{doc.label}</h3>
                <p>{doc.desc}</p>
              </div>

              {status ? (
                <span className={`du-status-tag ${status.toLowerCase()}`}>
                  {getStatusLabel(doc.key)}
                </span>
              ) : (
                <button
                  className="du-upload-btn"
                  onClick={() => uploadAllowed && setActiveDoc(doc.key)}
                >
                  Upload Now
                </button>
              )}

              {status && uploadAllowed && (
                <button
                  className="du-upload-btn"
                  onClick={() => setActiveDoc(doc.key)}
                >
                  Re-upload
                </button>
              )}
            </div>
          );
        })}
      </div>

      {activeDoc && (
        <div
          className="du-modal-overlay"
          onClick={() => setActiveDoc(null)}
        >
          <div className="du-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Upload {activeDoc.replace(/_/g, " ")}</h3>
            <form onSubmit={handleFileSubmit}>
              <input
                type="file"
                accept="application/pdf"
                onChange={(e) => setFile(e.target.files?.[0])}
                required
              />
              <div className="du-modal-actions">
                <button type="button" onClick={() => setActiveDoc(null)}>
                  Cancel
                </button>
                <button type="submit" className="du-btn-primary">
                  Submit File
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* ── Success Toast ── */}
      {toast && (
        <div className="du-toast">
          <span className="du-toast-icon">✓</span>
          <div className="du-toast-body">
            <strong>{toast}</strong>
            <span>uploaded successfully — pending review</span>
          </div>
          <button className="du-toast-close" onClick={() => setToast(null)}>✕</button>
        </div>
      )}
    </div>
  );
};

export default DocUploadModule;