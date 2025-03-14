import React, { useState, useEffect } from 'react';
import 'leaflet/dist/leaflet.css';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import L from 'leaflet'; 
import axios from 'axios';
import markerIcon from './marker2.png'; 
const getApiBaseUrl = () => {
  const protocol = window.location.protocol === 'https:' ? 'https' : 'http';
 const baseUrl = process.env.REACT_APP_API_BASE_URL.replace(/^https?:\/\//, '');
  return `${protocol}://${baseUrl}`;
};

const Lokasi = ({ latitude, longitude }) => {
  const [branchData, setBranchData] = useState(null);
  const [branchId, setBranchId] = useState(null);

  useEffect(() => {
    const fetchEmployeeData = async () => {
      try {
        const response = await axios.get(`${getApiBaseUrl()}/MeKaryawan`);
        const employeeData = response.data;
        setBranchId(employeeData.CabangId); // Periksa nama field ini
      } catch (error) {
        console.error('Error fetching employee data:', error);
      }
    };

    fetchEmployeeData();
  }, []);

  useEffect(() => {
    if (branchId) {
      const fetchBranchData = async () => {
        try {
          const response = await axios.get(`${getApiBaseUrl()}/cabang/${branchId}`);
          const branchData = response.data;
          setBranchData(branchData);
        } catch (error) {
          console.error('Error fetching branch data:', error);
        }
      };

      fetchBranchData();
    }
  }, [branchId]);

  if (!branchData || latitude === null || longitude === null) {
    return null;
  }

  const [lang_kantor, long_kantor] = branchData.lokasi_kantor.split(',');
  const radius = branchData.radius;

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
      <Circle
        center={[lang_kantor, long_kantor]}
        radius={radius}
        color='blue'
        fillColor='#1E90FF'
        fillOpacity={0.5}
      />
    </MapContainer>
  );
};

export default Lokasi;
