import React, { useEffect } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { adminLogout } from '../../store/adminSlice';
import './AdminLayout.css';
import logo from '../../assets/logo.png'; // adjust path if needed

const AdminLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  //  SAFE SELECTOR
  const isAuthenticated = useSelector(
    (state) => state.admin?.isAuthenticated
  );

  useEffect(() => {
    // Redirect ONLY if explicitly false
    if (isAuthenticated === false) {
      navigate('/admin/login');
    }
  }, [isAuthenticated, navigate]);

  const handleLogout = () => {
    dispatch(adminLogout());
    navigate('/admin/login', { replace: true });
  };

  const isActive = (path) =>
    location.pathname.includes(path) ? 'active' : '';

  // Prevent premature unmount
  if (isAuthenticated === undefined) return null;

  return (
    <div className="layout-wrapper">
      {/* SIDEBAR */}
      <aside className="layout-sidebar">
        <div className="sidebar-brand">
          <img src={logo} alt="Rydo Logo" className="sidebar-logo" />
          Rydo<span className="sidebar-badge">ADMIN</span>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-label">PLATFORM</div>
          <Link
            to="/admin/tenants"
            className={`nav-link ${isActive('/tenants')}`}
          >
            Tenants & Regions
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

      {/* MAIN */}
      <main className="layout-main">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
