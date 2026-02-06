import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { checkFleetStatus } from '../../store/fleetSlice';
import { 
  addVehicle, uploadVehicleDoc, fetchVehicleDocStatus, 
  resetVehicleState, clearMessages 
} from '../../store/vehicleSlice';
import './VehicleOnboarding.css';

const VEHICLE_DOCS = [
  { key: 'REGISTRATION_CERTIFICATE', label: 'RC Book' },
  { key: 'INSURANCE_POLICY', label: 'Insurance Policy' },
  { key: 'VEHICLE_PERMIT', label: 'Vehicle Permit' },
  { key: 'POLLUTION_CERT', label: 'Pollution Certificate' }
];

const VEHICLE_CATEGORIES = ['SEDAN', 'SUV', 'HATCHBACK', 'LUXURY'];

const VehicleOnboarding = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const { fleet, hasExistingFleet } = useSelector((state) => state.fleet);
  const { currentVehicle, docStatus, loading, error, successMsg, step } = useSelector((state) => state.vehicle);

  const [vehicleForm, setVehicleForm] = useState({
    registration_no: '', category: 'SEDAN', make: '', model: '', year_of_manufacture: new Date().getFullYear()
  });

  const [activeDoc, setActiveDoc] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) navigate('/login');
    else if (!fleet) dispatch(checkFleetStatus());
  }, [dispatch, navigate, fleet]);

  useEffect(() => {
    if (step === 2 && currentVehicle) {
      dispatch(fetchVehicleDocStatus(currentVehicle.vehicle_id));
    }
  }, [step, currentVehicle, dispatch]);

  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!fleet) return;
    dispatch(addVehicle({ fleetId: fleet.fleet_id, vehicleData: vehicleForm }));
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) setSelectedFile(e.target.files[0]);
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile) return;
    await dispatch(uploadVehicleDoc({
      vehicleId: currentVehicle.vehicle_id,
      docData: { document_type: activeDoc, file: selectedFile }
    }));
    setActiveDoc(null);
    setSelectedFile(null);
  };

  const handleReset = () => { dispatch(resetVehicleState()); };
  const isUploaded = (key) => docStatus.uploaded.some(d => d.document_type === key);

  if (!hasExistingFleet) return <div className="rydo-layout"><div className="form-pane">Checking Access...</div></div>;

  return (
    <div className="rydo-layout">
      <div className="nyc-visual-pane" style={{backgroundImage: 'url(https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?q=80&w=2560&auto=format&fit=crop)'}}>
        <div className="hero-content"><h1 className="brand-logo">Rydo<span className="brand-badge">ASSETS</span></h1></div>
      </div>

      <div className="form-pane">
        <div className="form-content-box wide">
          <header className="form-intro">
            <button className="back-link" onClick={() => navigate('/dashboard')}>← Dashboard</button>
            <h2>{step === 1 ? 'Add New Vehicle' : 'Vehicle Documentation'}</h2>
            <p>{step === 1 ? 'Enter details to register vehicle.' : `Upload docs for ${currentVehicle?.registration_no}`}</p>
          </header>

          {(error || successMsg) && <div className={`auth-alert ${error ? 'error' : 'success'}`}>{error || successMsg}</div>}

          {step === 1 && (
            <form onSubmit={handleAddSubmit} className="registration-form">
              <div className="form-row">
                <label>Registration Number</label>
                <input type="text" placeholder="MH02AB1234" required value={vehicleForm.registration_no} onChange={(e) => setVehicleForm({...vehicleForm, registration_no: e.target.value.toUpperCase()})} />
              </div>
              <div className="form-row split-flex-row">
                <div className="form-row"><label>Category</label><select value={vehicleForm.category} onChange={(e) => setVehicleForm({...vehicleForm, category: e.target.value})}>{VEHICLE_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}</select></div>
                <div className="form-row"><label>Year</label><input type="number" required value={vehicleForm.year_of_manufacture} onChange={(e) => setVehicleForm({...vehicleForm, year_of_manufacture: parseInt(e.target.value)})} /></div>
              </div>
              <div className="form-row split-flex-row">
                <div className="form-row"><label>Make</label><input type="text" required value={vehicleForm.make} onChange={(e) => setVehicleForm({...vehicleForm, make: e.target.value})} /></div>
                <div className="form-row"><label>Model</label><input type="text" required value={vehicleForm.model} onChange={(e) => setVehicleForm({...vehicleForm, model: e.target.value})} /></div>
              </div>
              <button type="submit" className="rydo-submit-btn" disabled={loading}>{loading ? 'Creating...' : 'Register Vehicle'}</button>
            </form>
          )}

          {step === 2 && (
            <div className="docs-container">
              <div className="docs-list">
                {VEHICLE_DOCS.map((doc) => {
                  const done = isUploaded(doc.key);
                  return (
                    <div key={doc.key} className={`doc-card ${done ? 'completed' : ''}`}>
                      <div className="doc-info"><span className="doc-name">{doc.label}</span><span className={`doc-status ${done ? 'ok' : 'pending'}`}>{done ? '✓ Uploaded' : 'Required'}</span></div>
                      {!done && <button className="doc-action-btn" onClick={() => { setActiveDoc(doc.key); dispatch(clearMessages()); }}>Upload</button>}
                    </div>
                  );
                })}
              </div>
              {docStatus.all_uploaded && (
                <div className="success-box"><h3>Vehicle Ready</h3><button className="rydo-submit-btn" onClick={handleReset}>Add Another</button></div>
              )}
            </div>
          )}

          {activeDoc && (
            <div className="modal-overlay">
              <div className="modal-box">
                <h3>Upload {VEHICLE_DOCS.find(d => d.key === activeDoc)?.label}</h3>
                <form onSubmit={handleUploadSubmit} className="registration-form">
                  <div className="form-row">
                    <label>Select File</label>
                    <input type="file" onChange={handleFileChange} required className="file-input-real" />
                  </div>
                  <div className="modal-actions">
                    <button type="button" className="rydo-btn-sec" onClick={() => setActiveDoc(null)}>Cancel</button>
                    <button type="submit" className="rydo-btn-pri" disabled={loading}>Confirm</button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VehicleOnboarding;