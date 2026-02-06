import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchEntityDocs, verifyDocument } from '../../../store/tenantAdminSlice';
import './VerificationPortal.css';

const VerificationPortal = ({ type, data, title }) => {
  const dispatch = useDispatch();
  const { activeDocs, loading } = useSelector(state => state.tenantAdmin);
  const [selectedId, setSelectedId] = useState(null);

  const handleSelect = (item) => {
    const id = typeof item === 'object' ? (item.fleet_id || item.driver_id) : item;
    setSelectedId(id);
    // Use type (fleets/drivers/vehicles) to fetch specific docs
    dispatch(fetchEntityDocs({ type, id }));
  };

  const handleAction = (docId, isApprove) => {
    console.log(`Verifying Doc: ${docId}, Type: ${type}, Action: ${isApprove}`);
    dispatch(verifyDocument({ 
      type: type, // Ensure this is 'fleets', 'drivers', or 'vehicles'
      docId: docId, 
      approve: isApprove 
    }));
  };

  return (
    <div className="vp-container">
      {/* Left List */}
      <div className="vp-list-pane">
        <div className="vp-pane-header">{title}</div>
        <div className="vp-scroll">
          {data.map((item, idx) => {
            const id = typeof item === 'object' ? (item.fleet_id || item.driver_id) : item;
            const name = item.fleet_name || item.full_name || `Asset #${item}`;
            return (
              <div 
                key={idx} 
                className={`vp-item-card ${selectedId === id ? 'active' : ''}`} 
                onClick={() => handleSelect(item)}
              >
                <span className="vp-item-id">ID: #{id}</span>
                <span className="vp-item-name">{name}</span>
              </div>
            );
          })}
          {data.length === 0 && <div className="vp-empty">No pending items found.</div>}
        </div>
      </div>

      {/* Right Inspector */}
      <div className="vp-inspect-pane">
        {selectedId ? (
          <div className="vp-docs-view">
            <header className="vp-inspect-header">
              <h3>Inspecting: ID #{selectedId}</h3>
              <p>Review all documents. Approval will activate the account automatically.</p>
            </header>
            <div className="vp-docs-grid">
              {activeDocs.map(doc => (
                <div key={doc.document_id} className="vp-doc-card">
                  <div className="vp-doc-type">
                    <span>{doc.document_type}</span>
                    <span className={`tag ${doc.verification_status.toLowerCase()}`}>
                      {doc.verification_status}
                    </span>
                  </div>
                  <button 
                    className="vp-view-btn" 
                    onClick={() => window.open(doc.file_url, '_blank')}
                  >
                    View Image / PDF
                  </button>
                  {/* ✅ ACTIONS ONLY SHOW IF PENDING */}
                  {doc.verification_status === 'PENDING' && (
                    <div className="vp-actions">
                      <button 
                        className="vp-approve" 
                        onClick={() => handleAction(doc.document_id, true)}
                      >
                        Approve
                      </button>
                      <button 
                        className="vp-reject" 
                        onClick={() => handleAction(doc.document_id, false)}
                      >
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="vp-placeholder">
            <div className="vp-placeholder-icon">📄</div>
            <p>Select an item from the left queue to inspect documents</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default VerificationPortal;