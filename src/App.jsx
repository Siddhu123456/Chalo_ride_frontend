import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import './style/variable.css';
import AuthPage from './features/auth/pages/AuthPage.jsx';

// Driver pages
import DriverPage from './features/driver/pages/DriverPage.jsx';
import DriverDashboard from './features/driver/pages/DriverDashboard.jsx';
import DriverProfile from './features/driver/components/DriverProfile.jsx';
import TripOffers from './features/driver/components/TripOffers.jsx';
import ActiveTrip from './features/driver/components/ActiveTrip.jsx';
import AssignedVehicle from './features/driver/components/AssignedVehicle.jsx';
import DriverDocsPage from './features/driver/pages/DriverDocsPage.jsx';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Auth */}
        <Route path="/" element={<AuthPage />} />
        <Route path="/auth" element={<AuthPage />} />

        <Route path="/driver/docs" element={<DriverDocsPage />} />

        {/* Driver Layout with nested routes */}
        <Route path="/driver" element={<DriverPage />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<DriverDashboard />} />
          <Route path="profile" element={<DriverProfile />} />
          <Route path="offers" element={<TripOffers />} />
          <Route path="trips/active" element={<ActiveTrip />} />
          <Route path="vehicle" element={<AssignedVehicle />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
