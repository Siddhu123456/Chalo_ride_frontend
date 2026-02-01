import React, { useState } from 'react'
import './AuthPage.css'
import NavBar from '../components/NavBar'
import Register from '../components/Register'
import Login from '../components/Login'


const AuthPage = () => {
    const [isLogin, setIsLogin] = useState(true);

    return (
        <div className="auth-wrapper">
            <NavBar />
            <div className="auth-page">
                {/* This section provides dynamic info on the background */}
                <div className="auth-info">
                    <h1>Want a Ride . .?</h1>
                    <h2>ChaloRide</h2>
                    <p className="tagline">Your Journey, Our Drive.</p>
                </div>

                <div className="form-card">
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

                    {isLogin ? <Login /> : <Register />}
                </div>
            </div>
        </div>
    )
}

export default AuthPage;