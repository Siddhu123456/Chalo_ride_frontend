import React from 'react';
import logo from '../../../assets/logo.png';
import './NavBar.css';

const NavBar = () => {
    return (
        <nav className="navbar">
            <img src={logo} alt="App Logo" className="navbar-logo" />

            <div className="navbar-links">
                <a href="#home" className="navbar-link">Home</a>
                <a href="#about" className="navbar-link">About</a>
                <a href="#contact" className="navbar-link">Contact</a>
            </div>
        </nav>
    );
}

export default NavBar;