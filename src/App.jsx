import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import "./App.css";
import "./style/variable.css";

import ProtectedRoute from "./routes/ProtectedRoute.jsx";


import AuthPage from "./features/auth/pages/AuthPage.jsx";


import FleetDashboard from "./features/fleet/FleetDashboard.jsx";
import FleetRegistration from "./features/fleet/FleetRegistration.jsx";


import DriverPage from "./features/driver/pages/DriverPage.jsx";
import DriverDashboard from "./features/driver/components/DriverDashboard.jsx";
import DriverProfile from "./features/driver/components/DriverProfile.jsx";
import TripOffers from "./features/driver/components/TripOffers.jsx";
import ActiveTrip from "./features/driver/components/ActiveTrip.jsx";
import AssignedVehicle from "./features/driver/components/AssignedVehicle.jsx";
import DriverDocsPage from "./features/driver/pages/DriverDocsPage.jsx";
import DriverTripHistory from "./features/driver/components/DriverTripHistory.jsx";


import RiderPage from "./features/rider/pages/RiderPage.jsx";
import RiderHome from "./features/rider/pages/RiderHome.jsx";
import RiderTripHistory from "./features/rider/components/RiderTripHistory.jsx";
import RiderProfile from "./features/rider/components/RiderProfile.jsx";


import AdminLogin from "./features/admin/AdminLogin.jsx";
import AdminLayout from "./features/admin/AdminLayout.jsx";
import TenantManager from "./features/admin/TenantManager.jsx";


import TenantDashboard from "./features/tenantAdmin/TenantDashboard.jsx";

import "leaflet/dist/leaflet.css";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        
        <Route path="/auth" element={<AuthPage />} />

        
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route
          path="/admin"
          element={<AdminLayout />}
        >
          <Route index element={<Navigate to="tenants" replace />} />
          <Route path="tenants" element={<TenantManager />} />
        </Route>

        
        <Route
          path="/rider"
          element={
            <ProtectedRoute allowedRoles={["RIDER"]}>
              <RiderPage />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="home" replace />} />
          <Route path="home" element={<RiderHome />} />
          <Route path="trips/history" element={<RiderTripHistory />} />
          <Route path="profile" element={<RiderProfile />} />
        </Route>

        
        <Route
          path="/driver"
          element={
            <ProtectedRoute allowedRoles={["DRIVER"]}>
              <DriverPage />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<DriverDashboard />} />
          <Route path="profile" element={<DriverProfile />} />
          <Route path="offers" element={<TripOffers />} />
          <Route path="trips/active" element={<ActiveTrip />} />
          <Route path="vehicle" element={<AssignedVehicle />} />
          <Route path="tripHistory" element={<DriverTripHistory />} />
        </Route>

        <Route
          path="/driver/docs"
          element={
            <ProtectedRoute allowedRoles={["DRIVER"]}>
              <DriverDocsPage />
            </ProtectedRoute>
          }
        />

        
        <Route
          path="/fleet-registration"
          element={
            <ProtectedRoute allowedRoles={["RIDER", "FLEET_OWNER"]}>
              <FleetRegistration />
            </ProtectedRoute>
          }
        />


        <Route
          path="/dashboard"
          element={
            <ProtectedRoute allowedRoles={["FLEET_OWNER"]}>
              <FleetDashboard />
            </ProtectedRoute>
          }
        />

        
        <Route
          path="/tenant-admin-dashboard"
          element={
            <ProtectedRoute allowedRoles={["TENANT_ADMIN"]}>
              <TenantDashboard />
            </ProtectedRoute>
          }
        />

        
        <Route path="*" element={<Navigate to="/auth" replace />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;
