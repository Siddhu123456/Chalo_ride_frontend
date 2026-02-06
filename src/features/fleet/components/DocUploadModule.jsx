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

  const uploadedDocs = Array.isArray(docStatus?.uploaded) ? docStatus.uploaded : [];

  const isUploaded = (key) => uploadedDocs.some((d) => d.document_type === key);

  const progress = useMemo(() => {
    if (DOC_TYPES.length === 0) return 0;
    return Math.round((uploadedDocs.length / DOC_TYPES.length) * 100);
  }, [uploadedDocs]);

  const handleFileSubmit = async (e) => {
    e.preventDefault();
    if (!file || !activeDoc) return;

    await dispatch(uploadAction({ fleetId, docData: { document_type: activeDoc, file } }));
    setActiveDoc(null);
    setFile(null);
  };

  return (
    <div className="du-container">
      <div className="du-progress-bar">
        <div className="du-progress-text">Verification Progress: {progress}%</div>
        <div className="du-track">
          <div className="du-fill" style={{ width: `${progress}%` }}></div>
        </div>
      </div>

      <div className="du-grid">
        {DOC_TYPES.map((doc) => {
          const done = isUploaded(doc.key);

          return (
            <div key={doc.key} className={`du-card ${done ? "done" : ""}`}>
              <div className="du-card-info">
                <h3>{doc.label}</h3>
                <p>{doc.desc}</p>
              </div>

              {done ? (
                <span className="du-status-tag">Uploaded</span>
              ) : (
                <button className="du-upload-btn" onClick={() => setActiveDoc(doc.key)}>
                  Upload Now
                </button>
              )}
            </div>
          );
        })}
      </div>

      {activeDoc && (
        <div className="du-modal-overlay" onClick={() => setActiveDoc(null)}>
          <div className="du-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Upload {activeDoc}</h3>
            <form onSubmit={handleFileSubmit}>
              <input type="file" onChange={(e) => setFile(e.target.files?.[0])} required />
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
    </div>
  );
};

export default DocUploadModule;
