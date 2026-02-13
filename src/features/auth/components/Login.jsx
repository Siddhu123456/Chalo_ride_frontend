import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

import { loginUser } from '../../../store/authSlice.js';
import './Login.css';

const Login = ({ onLoginSuccess }) => {
  const dispatch = useDispatch();
  const { loading, error, authStep } = useSelector(state => state.auth);

  const [creds, setCreds] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setCreds({ ...creds, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(loginUser(creds));
  };

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
          <div className="password-wrapper">
            <input
              name="password"
              type={showPassword ? 'text' : 'password'}
              value={creds.password}
              onChange={handleChange}
              required
            />
            <span
              className="eye-icon"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>
        </div>

        <button type="submit" className="submit-btn" disabled={loading}>
          {loading ? 'Verifying...' : 'Continue'}
        </button>
      </form>
    </>
  );
};

export default Login;
