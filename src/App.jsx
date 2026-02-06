import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import './style/variable.css';

// --- AUTH IMPORTS
import AuthPage from './features/auth/pages/AuthPage.jsx';

// --- FLEET OWNER IMPORTS (Kept for reference/future use) ---
import FleetDashboard from './features/fleet/FleetDashboard.jsx';
import FleetRegistration from './features/fleet/FleetRegistration.jsx';

// --- DRIVER IMPORTS
import DriverPage from './features/driver/pages/DriverPage.jsx';
import DriverDashboard from './features/driver/components/DriverDashboard.jsx';
import DriverProfile from './features/driver/components/DriverProfile.jsx';
import TripOffers from './features/driver/components/TripOffers.jsx';
import ActiveTrip from './features/driver/components/ActiveTrip.jsx';
import AssignedVehicle from './features/driver/components/AssignedVehicle.jsx';
import DriverDocsPage from './features/driver/pages/DriverDocsPage.jsx';

// --- RIDER IMPORTS ---
import RiderPage from './features/rider/pages/RiderPage.jsx';
import RiderHome from './features/rider/pages/RiderHome.jsx';
import RiderTripHistory from './features/rider/components/RiderTripHistory.jsx';
import RiderProfile from './features/rider/components/RiderProfile.jsx';

// --- ADMIN IMPORTS ---
import AdminLogin from './features/admin/AdminLogin.jsx';
import AdminLayout from './features/admin/AdminLayout.jsx';
import TenantManager from './features/admin/TenantManager.jsx';

// --- TENANT ADMIN IMPORTS ---
import TenantDashboard from './features/tenantAdmin/TenantDashboard.jsx';

import 'leaflet/dist/leaflet.css';


function App() {
  return (
    <BrowserRouter>
      <Routes>

        <Route path="/auth" element={<AuthPage />} />

        {/* --- RIDER ROUTES --- */}
        {/* We use path="/" so the NavLinks in SideMenu (e.g., to="/home") work automatically */}
        <Route path="/rider" element={<RiderPage />}>
          {/* Default redirect to Home */}
          <Route index element={<Navigate to="home" replace />} />

          <Route path="home" element={<RiderHome />} />
          <Route path="trips/history" element={<RiderTripHistory />} />
          <Route path="profile" element={<RiderProfile />} />
        </Route>

        {/* --- FLEET OWNER ROUTES (Kept for reference/future use) --- */}
              <Route path="/fleet-registration" element={<FleetRegistration />} />
        <Route path="/dashboard" element={<FleetDashboard />} />

        {/* --- DRIVER ROUTES (Kept for reference/future use) --- */}

        <Route path="/driver" element={<DriverPage />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<DriverDashboard />} />
          <Route path="profile" element={<DriverProfile />} />
          <Route path="offers" element={<TripOffers />} />
          <Route path="trips/active" element={<ActiveTrip />} />
          <Route path="vehicle" element={<AssignedVehicle />} />
          <Route path="docs" element={<DriverDocsPage />} />
        </Route>

        {/* ================= ADMIN ================= */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="tenants" replace />} />
          <Route path="tenants" element={<TenantManager />} />
        </Route>

        {/* ================= TENANT ADMIN ================= */}
        <Route path="/tenant-admin-dashboard" element={<TenantDashboard />} />



        {/* Fallback for unknown routes */}
        <Route path="*" element={<Navigate to="/auth" replace />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;