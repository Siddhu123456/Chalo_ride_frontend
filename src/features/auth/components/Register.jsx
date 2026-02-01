import React from 'react';
import './Register.css';

const Register = () => {
  return (
    <>
      <h1 className="register-heading">Create Account</h1>
      <p>Join us to start your ride sharing journey.</p>
      
      <form className="registration-form">
        <div className="form-row">
          <label>Full Name</label>
          <input type="text" placeholder="Enter your full name" />
        </div>

        <div className="form-row">
          <label>Email Address</label>
          <input type="email" placeholder="Enter your email" />
        </div>

        <div className="phone-flex-row">
          <div className="form-row code-box">
            <label>Code</label>
            <select>
              <option value="">Country</option>
              <option value="+1">+1 (USA)</option>
              <option value="+91">+91 (India)</option>
            </select>
          </div>

          <div className="form-row phone-box">
            <label>Mobile Number</label>
            <input type="tel" placeholder="Enter mobile number" />
          </div>
        </div>

        <div className="split-flex-row">
          <div className="form-row">
            <label>Gender</label>
            <select>
              <option value="">Gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div className="form-row">
            <label>Password</label>
            <input type="password" placeholder="Enter password" />
          </div>
        </div>

        <button type="submit" className="submit-btn">
          Create Account
        </button>
      </form>
    </>
  );
};

export default Register;
