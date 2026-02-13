import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchEntityDocs, verifyDocument } from '../../../store/tenantAdminSlice';
import './VerificationPortal.css';

const VerificationPortal = ({ type, data, title }) => {
  const dispatch = useDispatch();
  const { activeDocs, loading } = useSelector((state) => state.tenantAdmin);
  const [selectedId, setSelectedId] = useState(null);

  
  const resolveId = (item) =>
    typeof item === 'object'
      ? (item.fleet_id ?? item.driver_id ?? item.vehicle_id ?? null)
      : item;

  const handleSelect = (item) => {
    const id = resolveId(item);
    if (id === null) return;
    setSelectedId(id);
    dispatch(fetchEntityDocs({ type, id }));
  };

  const handleAction = (docId, isApprove) => {
    dispatch(
      verifyDocument({
        type,
        docId,
        approve:  isApprove,
        entityId: selectedId,   
      })
    );
  };

  return (
    <div className="vp-container">

      
      <div className="vp-list-pane">
        <div className="vp-pane-header">{title}</div>
        <div className="vp-scroll">
          {data.length === 0 && (
            <div className="vp-empty">No pending items found.</div>
          )}

          {data.map((item, idx) => {
            const id = resolveId(item) ?? idx;
            const name =
              item.fleet_name ||
              item.full_name  ||
              (item.vehicle_model ? `${item.vehicle_model} #${id}` : `Asset #${id}`);

            return (
              <div
                key={id}
                className={`vp-item-card ${selectedId === id ? 'active' : ''}`}
                onClick={() => handleSelect(item)}
              >
                <span className="vp-item-id">ID: #{id}</span>
                <span className="vp-item-name">{name}</span>
              </div>
            );
          })}
        </div>
      </div>

      
      <div className="vp-inspect-pane">
        {!selectedId ? (
          <div className="vp-placeholder">
            <div className="vp-placeholder-icon">📄</div>
            <p>Select an item from the left queue to inspect documents</p>
          </div>
        ) : loading && activeDocs.length === 0 ? (
          <div className="vp-placeholder">
            <div className="vp-placeholder-icon vp-loading-icon">⏳</div>
            <p>Loading documents…</p>
          </div>
        ) : (
          <div className="vp-docs-view">
            <header className="vp-inspect-header">
              <h3>Inspecting: ID #{selectedId}</h3>
              <p>
                Review all documents before approving. All four documents must be
                uploaded before verification can begin. Once all are approved, the
                account activates automatically.
              </p>
            </header>

            {activeDocs.length === 0 ? (
              <div className="vp-placeholder">
                <div className="vp-placeholder-icon">📭</div>
                <p>No documents uploaded yet for this entity.</p>
              </div>
            ) : (
              <div className="vp-docs-grid">
                {activeDocs.map((doc) => (
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

                    
                    {doc.verification_status === 'PENDING' && (
                      <div className="vp-actions">
                        <button
                          className="vp-approve"
                          onClick={() => handleAction(doc.document_id, true)}
                          disabled={loading}
                        >
                          Approve
                        </button>
                        <button
                          className="vp-reject"
                          onClick={() => handleAction(doc.document_id, false)}
                          disabled={loading}
                        >
                          Reject
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default VerificationPortal;