import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchVehicleDocStatus,
  uploadVehicleDoc,
  clearSelectedVehicleForDocs,
  clearFleetError,
} from "../../../store/fleetSlice";
import "./VehicleDocsModal.css";

const REQUIRED_DOCS = [
  { key: "REGISTRATION", label: "Registration Certificate (RC)" },
  { key: "INSURANCE", label: "Insurance Policy" },
];

const VehicleDocsModal = () => {
  const dispatch = useDispatch();

  const {
    selectedVehicleForDocs,
    selectedVehicleDocStatus,
    loading,
    error,
    successMsg,
  } = useSelector((state) => state.fleet);

  const vehicleId = selectedVehicleForDocs?.vehicle_id;

  useEffect(() => {
    if (vehicleId) dispatch(fetchVehicleDocStatus(vehicleId));
  }, [vehicleId, dispatch]);

  const closeModal = () => {
    if (loading) return;
    dispatch(clearFleetError());
    dispatch(clearSelectedVehicleForDocs());
  };

  const uploadedTypes = selectedVehicleDocStatus?.uploaded
    ? selectedVehicleDocStatus.uploaded.map((d) => d.document_type)
    : [];

  const isUploaded = (type) => uploadedTypes.includes(type);

  const handleUpload = (docType, file) => {
    if (!file || !vehicleId) return;

    dispatch(
      uploadVehicleDoc({
        vehicleId,
        docData: { document_type: docType, file },
      })
    ).then(() => {
      dispatch(fetchVehicleDocStatus(vehicleId));
    });
  };

  return (
    <div className="vd-overlay" onClick={closeModal}>
      <div className="vd-modal" onClick={(e) => e.stopPropagation()}>
        <header className="vd-head">
          <div>
            <h3>Upload Vehicle Documents</h3>
            <p className="vd-sub">
              Vehicle: <strong>{selectedVehicleForDocs?.registration_no}</strong>
            </p>
          </div>
          <button className="vd-close" onClick={closeModal} disabled={loading}>
            ✕
          </button>
        </header>

        {(error || successMsg) && (
          <div className={`vd-banner ${error ? "error" : "success"}`}>
            {String(error || successMsg)}
          </div>
        )}

        <div className="vd-body">
          {REQUIRED_DOCS.map((doc) => (
            <div key={doc.key} className="vd-doc-row">
              <div className="vd-doc-info">
                <span className="vd-doc-title">{doc.label}</span>
                <span className={`vd-chip ${isUploaded(doc.key) ? "done" : "pending"}`}>
                  {isUploaded(doc.key) ? "Uploaded ✅" : "Pending 📄"}
                </span>
              </div>

              <div className="vd-doc-action">
                <input
                  type="file"
                  disabled={loading}
                  onChange={(e) => handleUpload(doc.key, e.target.files?.[0])}
                />
              </div>
            </div>
          ))}

          <div className="vd-footer">
            <button className="vd-btn" onClick={closeModal} disabled={loading}>
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VehicleDocsModal;
