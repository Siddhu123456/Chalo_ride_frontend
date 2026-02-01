import React from 'react';
import './Login.css';

const Login = () => {

    return (
        <>
            <h1 className="login-heading">Welcome Back!</h1>
            <p>Login to continue your journey.</p>
            
            <form className="login-form">
                <div className="form-row">
                    <label>Email Address</label>
                    <input type="email" placeholder="Enter your email" />
                </div>

                <div className="form-row">
                    <label>Password</label>
                    <input type="password" placeholder="Enter your password" />
                </div>

                <button type="submit" className="submit-btn">
                    Continue
                </button>
            </form>
        </>
    );
}

export default Login;