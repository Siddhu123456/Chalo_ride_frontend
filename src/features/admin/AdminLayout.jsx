import React, { useEffect } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { adminLogout } from '../../store/adminSlice';
import './AdminLayout.css'; // Importing specific CSS

const AdminLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const { isAuthenticated } = useSelector((state) => state.admin);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/admin/login');
    }
  }, [isAuthenticated, navigate]);

  const handleLogout = () => {
    dispatch(adminLogout());
    navigate('/admin/login');
  };

  const isActive = (path) => location.pathname.includes(path) ? 'active' : '';

  if (!isAuthenticated) return null;

  return (
    <div className="layout-wrapper">
      {/* SIDEBAR */}
      <aside className="layout-sidebar">
        <div className="sidebar-brand">
          Rydo<span className="sidebar-badge">ADMIN</span>
        </div>
        
        <nav className="sidebar-nav">
          <div className="nav-label">PLATFORM</div>
          <Link to="/admin/tenants" className={`nav-link ${isActive('/tenants')}`}>
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

      {/* MAIN CONTENT */}
      <main className="layout-main">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;