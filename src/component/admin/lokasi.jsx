import React from 'react';
import 'leaflet/dist/leaflet.css';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet'; 
import markerIcon from '../marker2.png'; 

const Lokasi = ({ latitude, longitude }) => {
  const customMarkerIcon = L.icon({
    iconUrl: markerIcon,
    iconSize: [25, 41], 
    iconAnchor: [12, 41], 
    popupAnchor: [0, -41] 
  });

  return (
    <MapContainer center={[latitude, longitude]} zoom={17} style={{ height: '300px', width: '100%' }}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker position={[latitude, longitude]} icon={customMarkerIcon}>
        <Popup>Your Location</Popup>
      </Marker>
    </MapContainer>
  );
};

export default Lokasi;
