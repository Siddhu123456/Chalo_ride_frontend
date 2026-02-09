import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import './AuthPage.css';
import NavBar from '../components/NavBar';
import Register from '../components/Register';
import Login from '../components/Login';
import RoleSelection from '../components/RoleSelection';

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [phase, setPhase] = useState("AUTH"); // AUTH | ROLE

  const { token } = useSelector(state => state.auth);

  /**
   * 🔁 On logout (token removed):
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
          <h1>Want a Ride..?</h1>
          <h2>ChaloRide</h2>
          <p className="tagline">Your Journey, Our Drive.</p>
        </div>

        <div className="form-card">

          {/* 🔹 TOGGLE ONLY FOR LOGIN / REGISTER */}
          {phase === "AUTH" && (
            <div className="form-toggle">
              <button
                className={isLogin ? 'active' : ''}
                onClick={() => setIsLogin(true)}
              >
                Take a Ride
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
                  // ✅ move to role selection (NO TOKEN YET)
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
