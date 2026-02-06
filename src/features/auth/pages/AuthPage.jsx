import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import './AuthPage.css';
import NavBar from '../components/NavBar';
import Register from '../components/Register';
import Login from '../components/Login';
import RoleSelection from '../components/RoleSelection';

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [isPreAuth, setIsPreAuth] = useState(false);

  const { token } = useSelector(state => state.auth);
  const isAuthenticated = Boolean(token);

  useEffect(() => {
    if (!isAuthenticated) {
      setIsLogin(true);
      setIsPreAuth(false);
    }
  }, [isAuthenticated]);

  const handleToggleButtonClick = () => {
    if (!isPreAuth && !isAuthenticated) {
      setIsLogin(prev => !prev);
    }
  };

  return (
    <div className="auth-wrapper">
      <NavBar />

      <div className="auth-page">
        <div className="auth-info">
          <h1>Want a Ride..?</h1>
          <h2>ChaloRide</h2>
          <p className="tagline">Your Journey, Our Drive.</p>
        </div>

        <div className="form-card">
          <div className="form-toggle">
            <button
              className={
                (!isPreAuth && isLogin) || isPreAuth ? 'active' : ''
              }
              onClick={handleToggleButtonClick}
            >
              {!isPreAuth ? 'Take a Ride' : 'Select Role'}
            </button>

            <button
              className={
                (!isPreAuth && !isLogin) ? 'active' : ''
              }
              onClick={handleToggleButtonClick}
            >
              Register
            </button>
          </div>

          {/* Login / Register */}
          {!isPreAuth && !isAuthenticated && (
            isLogin ? (
              <Login onLoginSuccess={() => setIsPreAuth(true)} />
            ) : (
              <Register onRegisterSuccess={() => setIsLogin(true)} />
            )
          )}

          {/* Role Selection */}
          {isPreAuth && !isAuthenticated && (
            <RoleSelection onBack={() => setIsPreAuth(false)} />
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
