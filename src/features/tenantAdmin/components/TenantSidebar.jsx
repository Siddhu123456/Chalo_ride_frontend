import React from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import logo from '../../../assets/logo.png';
import { logout } from '../../../store/authSlice';
import './TenantSidebar.css';

/* Navigation definition — section marks the START of a new labelled group */
const MENU_ITEMS = [
  { id: 'FLEETS',   label: 'Fleets',         icon: '🏢', countKey: 'fleets',   sectionLabel: 'Verification Queue' },
  { id: 'DRIVERS',  label: 'Drivers',         icon: '👤', countKey: 'drivers',  sectionLabel: null },
  { id: 'VEHICLES', label: 'Vehicles',        icon: '🚗', countKey: 'vehicles', sectionLabel: null },
  { id: 'CITIES',   label: 'Regional Setup',  icon: '🌍', countKey: null,       sectionLabel: 'Configuration' },
];

const TenantSidebar = ({ activeView, onViewChange, profile, profileLoading, counts }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    localStorage.clear();
    navigate('/auth', { replace: true });
  };

  /* Two-character initials derived from full name */
  const initials = profile?.full_name
    ? profile.full_name
        .split(' ')
        .filter(Boolean)
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : '?';

  return (
    <aside className="ts-sidebar">

      {/* ── Brand / Logo ── */}
      <div className="ts-brand">
        <img src={logo} alt="ChaloRide" className="menu-logo" />
        <span className="ts-role-badge">TENANT</span>
      </div>

      {/* ── Profile Card ── */}
      <div className={`ts-profile-card ${profileLoading ? 'ts-profile-loading' : ''}`}>
        {profileLoading ? (
          <>
            <div className="ts-shimmer ts-shimmer-avatar" />
            <div className="ts-shimmer-lines">
              <div className="ts-shimmer ts-shimmer-line ts-shimmer-line-lg" />
              <div className="ts-shimmer ts-shimmer-line ts-shimmer-line-sm" />
            </div>
          </>
        ) : profile ? (
          <>
            <div className="ts-profile-avatar">{initials}</div>
            <div className="ts-profile-info">
              <span className="ts-profile-name">{profile.full_name}</span>
              <span className="ts-profile-tenant">{profile.tenant_name}</span>
              {profile.countries?.length > 0 && (
                <div className="ts-profile-countries">
                  {profile.countries.map((c) => (
                    <span key={c} className="ts-country-tag">{c}</span>
                  ))}
                </div>
              )}
            </div>
          </>
        ) : null}
      </div>

      {/* ── Navigation ── */}
      <nav className="ts-nav">
        {MENU_ITEMS.map((item) => (
          <React.Fragment key={item.id}>
            {/* Render section label only when defined on this item */}
            {item.sectionLabel && (
              <div className="ts-nav-label">{item.sectionLabel}</div>
            )}
            <button
              className={`ts-nav-item ${activeView === item.id ? 'active' : ''}`}
              onClick={() => onViewChange(item.id)}
            >
              <span className="ts-icon">{item.icon}</span>
              {item.label}
              {item.countKey && counts[item.countKey] > 0 && (
                <span className="ts-badge">{counts[item.countKey]}</span>
              )}
            </button>
          </React.Fragment>
        ))}
      </nav>

      {/* ── Logout ── */}
      <button className="ts-logout" onClick={handleLogout}>
        <span className="ts-logout-icon">⏏</span>
        Sign Out
      </button>
    </aside>
  );
};

export default TenantSidebar;