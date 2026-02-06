import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { adminLogin } from '../../store/adminSlice';
import { useNavigate } from 'react-router-dom';
import './AdminLogin.css'; // Importing the specific CSS

const AdminLogin = () => {
  const [key, setKey] = useState('');
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    if (key.trim()) {
      dispatch(adminLogin(key.trim()));
      navigate('/admin/tenants');
    }
  };

  return (
    <div className="al-layout">
      {/* LEFT SIDE: Visual Pane */}
      <div className="al-visual-pane">
        <div className="al-hero-content">
          <h1 className="al-brand">Rydo<span className="al-brand-badge">ADMIN</span></h1>
          <p className="al-hero-text">Platform Configuration Console.</p>
        </div>
      </div>

      {/* RIGHT SIDE: Form Pane */}
      <div className="al-form-pane">
        <div className="al-content-box">
          <div className="al-header">
            <h2>Authentication</h2>
            <p>Enter your master key to access the mainframe.</p>
          </div>

          <form onSubmit={handleLogin} className="al-form">
            <div className="al-input-group">
              <label>Super Admin Key</label>
              <input 
                type="password" 
                placeholder="sk_live_..." 
                value={key}
                onChange={(e) => setKey(e.target.value)}
                autoFocus
                required 
              />
            </div>

            <button type="submit" className="al-submit-btn">
              Access Console
            </button>
          </form>

          <div className="al-footer">
            Authorized Personnel Only
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;