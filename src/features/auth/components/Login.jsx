import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser } from '../../../store/authSlice.js';
import './Login.css';

const Login = ({ onLoginSuccess }) => {
  const dispatch = useDispatch();
  const { loading, error, authStep } = useSelector(state => state.auth);

  const [creds, setCreds] = useState({ email: '', password: '' });

  const handleChange = (e) => {
    setCreds({ ...creds, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(loginUser(creds));
  };

  // ✅ When login step completes, notify parent
  useEffect(() => {
    if (authStep === 'ROLE_SELECT') {
      onLoginSuccess();
    }
  }, [authStep, onLoginSuccess]);

  return (
    <>
      <h1 className="login-heading">Welcome Back!</h1>
      <p>Login to continue your journey.</p>

      {error && <div className="auth-alert error">{error}</div>}

      <form className="login-form" onSubmit={handleSubmit}>
        <div className="form-row">
          <label>Email Address</label>
          <input
            type="email"
            name="email"
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-row">
          <label>Password</label>
          <input
            type="password"
            name="password"
            onChange={handleChange}
            required
          />
        </div>

        <button type="submit" className="submit-btn" disabled={loading}>
          {loading ? 'Verifying...' : 'Continue'}
        </button>
      </form>
    </>
  );
};

export default Login;
