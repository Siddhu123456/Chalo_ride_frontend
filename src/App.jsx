import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import './style/variable.css';
import AuthPage from './features/auth/pages/AuthPage.jsx';

// Driver pages
import DriverPage from './features/driver/pages/DriverPage.jsx';
import DriverDashboard from './features/driver/pages/DriverDashboard.jsx';
import DriverProfile from './features/driver/pages/DriverProfile.jsx';
import CurrentShift from './features/driver/pages/CurrentShift.jsx';
import TripOffers from './features/driver/pages/TripOffers.jsx';
import ActiveTrip from './features/driver/pages/ActiveTrip.jsx';
import AssignedVehicle from './features/driver/pages/AssignedVehicle.jsx';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Auth */}
        <Route path="/" element={<AuthPage />} />
        <Route path="/auth" element={<AuthPage />} />

        {/* Driver Layout with nested routes */}
        <Route path="/driver" element={<DriverPage />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<DriverDashboard />} />
          <Route path="profile" element={<DriverProfile />} />
          <Route path="shift/current" element={<CurrentShift />} />
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
