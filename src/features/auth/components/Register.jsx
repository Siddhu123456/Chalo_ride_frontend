import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { registerUser, resetAuth, fetchCountries } from '../../../store/authSlice.js';
import './Register.css';

const Register = ({ onRegisterSuccess }) => {
  const dispatch = useDispatch();
  const { loading, success, error, countries } = useSelector(state => state.auth);

  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    gender: '',
    country_code: '',
    password: ''
  });

  /* -----------------------------------------
     Fetch countries on mount
  ------------------------------------------ */
  useEffect(() => {
    dispatch(fetchCountries());
  }, [dispatch]);

  /* -----------------------------------------
     Auto-select first country once loaded
  ------------------------------------------ */
  useEffect(() => {
    if (countries.length > 0 && !formData.country_code) {
      setFormData(prev => ({
        ...prev,
        country_code: countries[0].country_code
      }));
    }
  }, [countries, formData.country_code]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(registerUser(formData));
  };

  /* -----------------------------------------
     After successful registration → switch to login
  ------------------------------------------ */
  useEffect(() => {
    if (success) {
      onRegisterSuccess();
      dispatch(resetAuth());
    }
  }, [success, dispatch, onRegisterSuccess]);

  return (
    <>
      <h1 className="register-heading">Create Account</h1>
      <p>Join us to start your ride sharing journey.</p>

      {error && <div className="auth-alert error">{error}</div>}

      <form className="registration-form" onSubmit={handleSubmit}>
        <div className="form-row">
          <label>Full Name</label>
          <input name="full_name" onChange={handleChange} required />
        </div>

        <div className="form-row">
          <label>Email Address</label>
          <input name="email" type="email" onChange={handleChange} required />
        </div>

        <div className="phone-flex-row">
          <div className="form-row code-box">
            <label>Code</label>
            <select name="country_code" value={formData.country_code} onChange={handleChange}>
              {countries.length === 0 && <option>Loading...</option>}

              {countries.map((c) => (
                <option key={c.country_id || c.country_code} value={c.country_code}>
                  {c.country_code}
                </option>
              ))}
            </select>
          </div>

          <div className="form-row phone-box">
            <label>Mobile Number</label>
            <input name="phone" onChange={handleChange} />
          </div>
        </div>

        <div className="split-flex-row">
          <div className="form-row">
            <label>Gender</label>
            <select name="gender" onChange={handleChange}>
              <option value="MALE">Male</option>
              <option value="FEMALE">Female</option>
            </select>
          </div>

          <div className="form-row">
            <label>Password</label>
            <input name="password" type="password" onChange={handleChange} />
          </div>
        </div>

        <button className="submit-btn" disabled={loading}>
          {loading ? 'Creating...' : 'Create Account'}
        </button>
      </form>
    </>
  );
};

export default Register;
