import React, { useEffect, useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { adminLogout } from '../../store/adminSlice';
import './AdminLayout.css';
import logo from '../../assets/logo.png';

const AdminLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isAuthenticated = useSelector((state) => state.admin?.isAuthenticated);

  useEffect(() => {
    if (isAuthenticated === false) {
      navigate('/admin/login');
    }
  }, [isAuthenticated, navigate]);

  // Auto-close sidebar on route change (mobile)
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    dispatch(adminLogout());
    navigate('/admin/login', { replace: true });
  };

  const isActive = (path) =>
    location.pathname.includes(path) ? 'active' : '';

  if (isAuthenticated === undefined) return null;

  return (
    <div className="layout-wrapper">
      {sidebarOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      <aside className={`layout-sidebar${sidebarOpen ? ' sidebar-open' : ''}`}>
        <div className="sidebar-brand">
          <img src={logo} alt="Rydo Logo" className="sidebar-logo" />
          Rydo<span className="sidebar-badge">ADMIN</span>
          <button
            className="sidebar-close-btn"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close sidebar"
          >
            ✕
          </button>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-label">PLATFORM</div>
          <Link
            to="/admin/tenants"
            className={`nav-link ${isActive('/tenants')}`}
          >
            Tenants &amp; Regions
          </Link>

          <div className="nav-label">SYSTEM</div>
          <button onClick={handleLogout} className="nav-link logout-btn">
            Logout
          </button>
        </nav>

        <div className="sidebar-profile">
          <div className="profile-avatar">S</div>
          <div className="profile-info">
            <span className="profile-name">Super Admin</span>
            <span className="profile-role">Root Access</span>
          </div>
        </div>
      </aside>

      <main className="layout-main">
        <div className="mobile-topbar">
          <button
            className="hamburger-btn"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open sidebar"
          >
            <span />
            <span />
            <span />
          </button>
          <div className="mobile-brand">
            <img src={logo} alt="Rydo Logo" className="mobile-logo" />
            Rydo<span className="sidebar-badge">ADMIN</span>
          </div>
        </div>

        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;