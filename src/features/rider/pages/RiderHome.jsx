import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Polyline } from 'react-leaflet';
import L from 'leaflet';

import LocationPicker from '../components/LocationPicker';
import FareDiscovery from '../components/FareDiscovery';
import TripSummary from '../components/TripSummary';
import TripTracking from '../components/TripTracking';

import './RiderHome.css';

// --- FIXED LEAFLET ICON SETUP ---
// Create custom icons using data URIs to avoid external resource loading issues
const defaultIcon = L.icon({
  iconUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABkAAAApCAYAAADAk4LOAAAFgUlEQVR4Aa1XA5BjWRTN2oW17d3YaZtr2962HUzbDNpjszW24mRt28p47v7zq/bXZtrp/lWnXr337j3nPCe85NcypgSFdugCpW5YoDAMRaIMqRi6aKq5E3YqDQO3qAwjVWrD8Ncq/RBpykd8oZUb/kaJutow8r1aP9II0WmLKLIsJyv1w/kqw9Ch2MYdB++12Onxee/QMwvf4/Dk/Lfp/i4nxTXtOoQ4pW5Aj7wpici1A9erdAN2OH64x8OSP9j3Ft3b7aWkTg/Fm91siTra0f9on5sQr9INejH6CUUUpavjFNq1B+Oadhxmnfa8RXGjRtxXhKs3dUOjMYGZt8R5+H3C55T+5LhIgRIZ+tYpZhJgv+bNPVhD8zMHa0JMkcdY6YoFw1WrJXoHR9LqLBz4rr0NHdyX3A4oQvUDKSPNqj6Kt0hqvlpC8n1nZQh1f2wA3Q3Y3j4D+6lhM3+O+3v+LZP+Qd3Wf3m2Y+Y4nf+Yw9v+dLl/P+1xN/+m+3vr//m3v+7Z/+dv+9M/+vfr/AAAA//8DAFBLAwQUAAYACAAAACEAU+VAu9MAAAC6AAAADwAAAHdvcmQvc3R5bGVzLnhtbKxSy07DMBC8I/EPVu5N2hYhVJVIH3D+ANsyJaHOI7KdQv6etaHQQhU4cLVnZ2Z3vPbycbLBA2iHxnJanVMGhlQW9a0svt69Xs0ZwcBISRubXSpwnBefn/jBqhYk44MlSwqoQqANxOUxE1xWQkkY85hNWtMSWU8avdDODgPJCp2LBnq7s9/TvqlhqJ+1Hv42bjzH+S3PWeN1YYFQAjhJ48T8CPgPYP7HXtPv1y7BAAAA//8DAFBLAwQUAAYACAAAACEAJDKR6aoAAABrAAAAEQAAAGRvY1Byb3BzL2NvcmUueG1spY/BDoIwEETvJv6D6V2xJiYGYjwY/QDaDULSbkkXFPx6y8G7h3qbzLx5M5uPp5XDE4yVWlSYRCFyEIKrSlSN/n2cg3s8EfGBWt1BgQs84PnP3d3mjjZ84QGYVbRA3VLjGSNaA9vqiDXgqIPWdLSxq/aM2TdoqkNmOccLxhS/ghG0KW0+wnAm5p7S5wR1Y6QflsXpWF+Lp7bHUzxdP1YT9q/oEw==</iconUrl>',
  iconRetinaUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABkAAAApCAYAAADAk4LOAAAFgUlEQVR4Aa1XA5BjWRTN2oW17d3YaZtr2962HUzbDNpjszW24mRt28p47v7zq/bXZtrp/lWnXr337j3nPCe85NcypgSFdugCpW5YoDAMRaIMqRi6aKq5E3YqDQO3qAwjVWrD8Ncq/RBpykd8oZUb/kaJutow8r1aP9II0WmLKLIsJyv1w/kqw9Ch2MYdB++12Onxee/QMwvf4/Dk/Lfp/i4nxTXtOoQ4pW5Aj7wpici1A9erdAN2OH64x8OSP9j3Ft3b7aWkTg/Fm91siTra0f9on5sQr9INejH6CUUUpavjFNq1B+Oadhxmnfa8RXGjRtxXhKs3dUOjMYGZt8R5+H3C55T+5LhIgRIZ+tYpZhJgv+bNPVhD8zMHa0JMkcdY6YoFw1WrJXoHR9LqLBz4rr0NHdyX3A4oQvUDKSPNqj6Kt0hqvlpC8n1nZQh1f2wA3Q3Y3j4D+6lhM3+O+3v+LZP+Qd3Wf3m2Y+Y4nf+Yw9v+dLl/P+1xN/+m+3vr//m3v+7Z/+dv+9M/+vfr/AAAA//8DAFBLAwQUAAYACAAAACEAU+VAu9MAAAC6AAAADwAAAHdvcmQvc3R5bGVzLnhtbKxSy07DMBC8I/EPVu5N2hYhVJVIH3D+ANsyJaHOI7KdQv6etaHQQhU4cLVnZ2Z3vPbycbLBA2iHxnJanVMGhlQW9a0svt69Xs0ZwcBISRubXSpwnBefn/jBqhYk44MlSwqoQqANxOUxE1xWQkkY85hNWtMSWU8avdDODgPJCp2LBnq7s9/TvqlhqJ+1Hv42bjzH+S3PWeN1YYFQAjhJ48T8CPgPYP7HXtPv1y7BAAAA//8DAFBLAwQUAAYACAAAACEAJDKR6aoAAABrAAAAEQAAAGRvY1Byb3BzL2NvcmUueG1spY/BDoIwEETvJv6D6V2xJiYGYjwY/QDaDULSbkkXFPx6y8G7h3qbzLx5M5uPp5XDE4yVWlSYRCFyEIKrSlSN/n2cg3s8EfGBWt1BgQs84PnP3d3mjjZ84QGYVbRA3VLjGSNaA9vqiDXgqIPWdLSxq/aM2TdoqkNmOccLxhS/ghG0KW0+wnAm5p7S5wR1Y6QflsXpWF+Lp7bHUzxdP1YT9q/oEw==',
  shadowUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACkAAAApCAQAAAACach9AAACMUlEQVR4Ae3ShY7jQBSF4dPKMmXm7/9r7eQhY5Lk7eQ+Qy4kkRRZEqlkEv///xW7tCKNlCKN1CKN9CKNDCONjCKNzCKNLCONrCKNbCON7CKNHCONnCKNXCONPCONfCONgiKNQiONoiKNYiONEiONUiONMiONciKNSiONKiONaiKNGiONWiONOiON+iKN+iKN+iKN+iKN+iKNBiONRiONJiONZiONFiONViONNiONdiONTiONLiONbiONHiONXiONPiONfiONASKNQSKNISKNYSKNESKNUSKNMSKNcSKNSSKNKSKNaSKNGSKNWSKNOSKNeSKNBSKNRSKNJSKNZSKNFSKNVSKNNSKNdSKNTSKNLSKNbSKNHSKNXSKNPSKNfSKNAyKNQyKNIyKNYyKNEyKNUyKNMyKNcyKNSyKNKyKNayKNGyKNWyKNOyKNeyKNByKNRyKNJyKNZyKNFyKNVyKNNyKNdyKNTyKNLyKNbyKNHyKNXyKNPyKNfyKNA6KNQ6KNI6KNY6KNE6KNU6KNM6KNc6KNS6KNK6KNa6KNG6KNW6KNO6KNe6KNB6KNR6KNJ6KNZ6KNF6KNV6KNN6KNd6KNT6KNL6KNb6KNH6KNX6KNP6KNf6KNgFBH6ih1lDpKHaWOUkdpoNRR6ih1lDpKHaWOUkepo9RR6ih1lDpKHaWOUkepo9RR6ih1lDpKHaWOUv8BUC2lAAAAAElFTkSuQmCC',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Set default icon
L.Marker.prototype.options.icon = defaultIcon;

const RiderHome = () => {
  const [step, setStep] = useState('location'); // location -> fare -> summary -> tracking
  const [pickup] = useState({ lat: 17.3850, lng: 78.4867, address: 'Nampally, Hyderabad' });
  const [drop] = useState({ lat: 17.4375, lng: 78.4483, address: 'Banjara Hills, Hyderabad' });
  const [selectedRide, setSelectedRide] = useState(null);

  const handleLocationConfirm = () => setStep('fare');
  const handleRideSelect = (ride) => {
    setSelectedRide(ride);
    setStep('summary');
  };
  const handleBookingConfirm = () => setStep('tracking');
  const handleChangeRide = () => setStep('fare');
  const handleNewRide = () => {
    setSelectedRide(null);
    setStep('location');
  };

  const renderControlPanel = () => {
    switch (step) {
      case 'fare':
        return <FareDiscovery onRideSelect={handleRideSelect} />;
      case 'summary':
        return (
          <TripSummary
            ride={selectedRide}
            pickup={pickup.address}
            drop={drop.address}
            onConfirm={handleBookingConfirm}
            onChange={handleChangeRide}
          />
        );
      case 'tracking':
        return <TripTracking ride={selectedRide} onNewRide={handleNewRide} />;
      case 'location':
      default:
        return (
          <LocationPicker
            pickup={pickup.address}
            drop={drop.address}
            onConfirm={handleLocationConfirm}
          />
        );
    }
  };

  return (
    <div className="rider-home-layout">
      <div className="map-section">
        <MapContainer 
          center={[pickup.lat, pickup.lng]} 
          zoom={13} 
          style={{ height: '100%', width: '100%' }}
          scrollWheelZoom={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Marker position={[pickup.lat, pickup.lng]} icon={defaultIcon} />
          <Marker position={[drop.lat, drop.lng]} icon={defaultIcon} />
          {step !== 'location' && (
            <Polyline 
              positions={[[pickup.lat, pickup.lng], [drop.lat, drop.lng]]} 
              color="#fecc18" 
              weight={4}
              opacity={0.8}
            />
          )}
        </MapContainer>
      </div>
      <div className="control-section">
        {renderControlPanel()}
      </div>
    </div>
  );
};

export default RiderHome;