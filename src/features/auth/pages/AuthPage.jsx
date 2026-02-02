import React, { useState } from 'react'
import { useSelector } from 'react-redux'
import './AuthPage.css'
import NavBar from '../components/NavBar'
import Register from '../components/Register'
import Login from '../components/Login'
import RoleSelection from '../components/RoleSelection'
import FleetRegistrationForm from '../components/FleetRegister'
import FleetOwnerDialog from '../components/FleetOwnerDialog'


const AuthPage = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [isLoggedIn, setIsLoggedIn] = useState(false); // ✅ FIX
    const [showRoleSelection, setShowRoleSelection] = useState(false);
    const [showFleetDialog, setShowFleetDialog] = useState(false);

    const { roles } = useSelector(state => state.auth);

    const isFleetOwner = roles.includes("FLEET_OWNER");


    const handleToggleButtonClick = () => {
        if (!isLoggedIn) {
            setIsLogin(prev => !prev);
        }

        if (isFleetOwner) {
            setShowFleetDialog(true);
            return;
        }

        setShowRoleSelection(prev => !prev);
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
                            className={(!isLoggedIn && isLogin) || (isLoggedIn && showRoleSelection) ? 'active' : ''}
                            onClick={handleToggleButtonClick}
                        >
                            {!isLoggedIn ? 'Take a Ride' : 'Select Role'}
                        </button>

                        <button
                            className={`${(!isLoggedIn && !isLogin) || (isLoggedIn && !showRoleSelection)
                                    ? 'active'
                                    : ''
                                } ${isFleetOwner ? 'fleet-locked' : ''}`}
                            onClick={handleToggleButtonClick}
                        >
                            {!isLoggedIn ? 'Register' : 'Fleet Registration'}
                        </button>
                    </div>

                    {/* LOGIN / REGISTER */}
                    {!isLoggedIn && (
                        isLogin ? (
                            <Login onLoginSuccess={() => {
                                setIsLoggedIn(true);
                                setShowRoleSelection(true);
                            }} />
                        ) : (
                            <Register onRegisterSuccess={() => setIsLogin(true)} />
                        )
                    )}

                    {/* ROLE / FLEET */}
                    {isLoggedIn && (
                        showRoleSelection ? (
                            <RoleSelection
                                onFleetSelect={() => setShowRoleSelection(false)}
                                onBack={() => setIsLoggedIn(false)}
                            />
                        ) : (
                            <FleetRegistrationForm />
                        )
                    )}
                </div>
            </div>

            <FleetOwnerDialog
                open={showFleetDialog}
                onClose={() => setShowFleetDialog(false)}
            />
        </div>
    );
};

export default AuthPage;
