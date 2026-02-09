import React from 'react';
import logo from '../../../assets/logo.png';
import './TenantSidebar.css';

const TenantSidebar = ({ activeView, onViewChange, counts }) => {
  const menuItems = [
    { id: 'FLEETS', label: 'Fleets', count: counts.fleets, icon: '🏢' },
    { id: 'DRIVERS', label: 'Drivers', count: counts.drivers, icon: '👤' },
    { id: 'VEHICLES', label: 'Vehicles', count: counts.vehicles, icon: '🚗' },
    { id: 'CITIES', label: 'Regional Setup', count: null, icon: '🌍' },
  ];

  const handleLogout = () => {
    dispatch(logout());        // optional but recommended
    localStorage.clear();

    navigate("/auth", { replace: true });
  };


  return (
    <aside className="ts-sidebar">
      <div className="ts-brand">
        <img src={logo} alt="ChaloRide Logo" className="menu-logo" />
        <span>TENANT</span>
      </div>

      <nav className="ts-nav">
        <div className="ts-nav-label">Verification Queue</div>
        {menuItems.map(item => (
          <button
            key={item.id}
            className={`ts-nav-item ${activeView === item.id ? 'active' : ''}`}
            onClick={() => onViewChange(item.id)}
          >
            <span className="ts-icon">{item.icon}</span>
            {item.label}
            {item.count > 0 && <span className="ts-badge">{item.count}</span>}
          </button>
        ))}
      </nav>

      <button className="ts-logout" onClick={handleLogout}>
        Sign Out
      </button>
    </aside>
  );
};

export default TenantSidebar;