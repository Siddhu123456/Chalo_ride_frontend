import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import './style/variable.css';

// --- RIDER IMPORTS ---
import RiderPage from './features/rider/pages/RiderPage.jsx';
import RiderHome from './features/rider/pages/RiderHome.jsx';

import 'leaflet/dist/leaflet.css';


const RiderHistory = () => (
  <div style={{ padding: '20px' }}>
    <h2>📜 Trip History</h2>
    <p>List of past rides will go here.</p>
  </div>
);

const RiderProfile = () => (
  <div style={{ padding: '20px' }}>
    <h2>👤 Rider Profile</h2>
    <p>User settings and details will go here.</p>
  </div>
);

function App() {
  return (
    <BrowserRouter>
      <Routes>
        
        {/* --- RIDER ROUTES --- */}
        {/* We use path="/" so the NavLinks in SideMenu (e.g., to="/home") work automatically */}
        <Route path="/" element={<RiderPage />}>
          {/* Default redirect to Home */}
          <Route index element={<Navigate to="home" replace />} />
          
          <Route path="home" element={<RiderHome />} />
          <Route path="trips/history" element={<RiderHistory />} />
          <Route path="profile" element={<RiderProfile />} />
        </Route>

        {/* --- DRIVER ROUTES (Kept for reference/future use) --- */}
        {/* 
        <Route path="/driver" element={<DriverPage />}>
           <Route index element={<Navigate to="dashboard" replace />} />
           <Route path="dashboard" element={<DriverDashboard />} />
           <Route path="profile" element={<DriverProfile />} />
           <Route path="offers" element={<TripOffers />} />
           <Route path="trips/active" element={<ActiveTrip />} />
           <Route path="vehicle" element={<AssignedVehicle />} />
        </Route> 
        */}

        {/* Fallback for unknown routes */}
        <Route path="*" element={<Navigate to="/home" replace />} />
      
      </Routes>
    </BrowserRouter>
  );
}

export default App;