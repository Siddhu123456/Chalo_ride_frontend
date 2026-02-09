import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import './AuthPage.css';
import NavBar from '../components/NavBar';
import Register from '../components/Register';
import Login from '../components/Login';
import RoleSelection from '../components/RoleSelection';

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [phase, setPhase] = useState("AUTH"); // AUTH | ROLE

  const { token } = useSelector(state => state.auth);

  const navigate = useNavigate();

  useEffect(() => {
    if (token) {
      const role = localStorage.getItem("role");

      if (role === "DRIVER") navigate("/driver/dashboard", { replace: true });
      if (role === "RIDER") navigate("/rider/home", { replace: true });
      if (role === "FLEET_OWNER") navigate("/dashboard", { replace: true });
      if (role === "TENANT_ADMIN")
        navigate("/tenant-admin-dashboard", { replace: true });
    }
  }, [token, navigate]);

  /**
   *  On logout (token removed):
   * Always reset back to login
   */
  useEffect(() => {
    if (!token) {
      setPhase("AUTH");
      setIsLogin(true);
    }
  }, [token]);

  return (
    <div className="auth-wrapper">
      <NavBar />

      <div className="auth-page">
        <div className="auth-info">
          <h1>Rides Made Easy</h1>
          <h2>ChaloRide</h2>
          <p className="tagline">
            For Your Daily Commute & Beyond.
          </p>
        </div>


        <div className="form-card">

          {/* 🔹 TOGGLE ONLY FOR LOGIN / REGISTER */}
          {phase === "AUTH" && (
            <div className="form-toggle">
              <button
                className={isLogin ? 'active' : ''}
                onClick={() => setIsLogin(true)}
              >
                Login
              </button>

              <button
                className={!isLogin ? 'active' : ''}
                onClick={() => setIsLogin(false)}
              >
                Register
              </button>
            </div>
          )}

          {/* 🔹 LOGIN / REGISTER */}
          {phase === "AUTH" && (
            isLogin ? (
              <Login
                onLoginSuccess={() => {
                  // move to role selection (NO TOKEN YET)
                  setPhase("ROLE");
                }}
              />
            ) : (
              <Register onRegisterSuccess={() => setIsLogin(true)} />
            )
          )}

          {/* 🔹 ROLE SELECTION (NO TOGGLE HERE) */}
          {phase === "ROLE" && (
            <RoleSelection
              onBack={() => {
                // optional: allow going back to login
                setPhase("AUTH");
                setIsLogin(true);
              }}
            />
          )}

        </div>
      </div>
    </div>
  );
};

export default AuthPage;
