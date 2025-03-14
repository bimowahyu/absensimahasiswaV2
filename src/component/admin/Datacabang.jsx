import React, { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import useSWR from 'swr';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Modal, Button } from 'react-bootstrap';
import { MapContainer, TileLayer, Circle, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Box, Container, Grid, Table, TableHead, TableBody, TableRow, TableCell } from '@mui/material';
import styled from 'styled-components';

// Set default icon for leaflet markers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

axios.defaults.withCredentials = true;

const getApiBaseUrl = () => {
  const protocol = window.location.protocol === 'https:' ? 'https' : 'http';
  const baseUrl = process.env.REACT_APP_API_BASE_URL.replace(/^https?:\/\//, '');
  return `${protocol}://${baseUrl}`;
};

const fetcher = (url) => axios.get(url).then(res => res.data);

const DashboardContainer = styled(Box)`
  padding: 2rem 1rem;
  margin-left: 250px;
  width: calc(100% - 250px);

  @media (max-width: 768px) {
    margin-left: 0;
    width: 100%;
  }
`;

export const Datacabang = () => {
  const { data: cabang, error, mutate } = useSWR(`${getApiBaseUrl()}/cabang`, fetcher);
  const [selectedCabang, setSelectedCabang] = useState(null);
  const [showModal, setShowModal] = useState(false);

  if (error) return <div>Error loading data</div>;
  if (!cabang) return <div>Loading...</div>;

  const deleteCabang = async (id) => {
    if (window.confirm('Apakah anda ingin menghapus cabang?')) {
      try {
        await axios.delete(`${getApiBaseUrl()}/cabang/${id}`);
        mutate(); 
      } catch (error) {
        console.error('Cabang gagal dihapus:', error);
      }
    }
  };

  const handleShowModal = (cabang) => {
    const [latitude, longitude] = cabang.lokasi_kantor.split(',').map(coord => parseFloat(coord.trim()));
    if (latitude && longitude) {
      setSelectedCabang({ ...cabang, latitude, longitude });
      setShowModal(true);
    } else {
      alert('Lokasi tidak tersedia untuk cabang ini.');
    }
  };

  const handleCloseModal = () => {
    setSelectedCabang(null);
    setShowModal(false);
  };

  return (
    <DashboardContainer>
      <Container maxWidth="lg">
        <Grid container spacing={3}></Grid>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>No</TableCell>
              <TableCell>Nama Cabang</TableCell>
              <TableCell>Kode Cabang</TableCell>
              <TableCell>Lokasi Kantor</TableCell>
              <TableCell>Radius Absensi</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {cabang.map((cabang, index) => (
              <TableRow key={cabang.id}>
                <TableCell>{index + 1}</TableCell>
                <TableCell>{cabang.nama_cabang}</TableCell>
                <TableCell>{cabang.kode_cabang}</TableCell>
                <TableCell>{cabang.lokasi_kantor}</TableCell>
                <TableCell>{cabang.radius} Meter</TableCell>
                <TableCell>
                  <Button variant="primary" size="sm" onClick={() => handleShowModal(cabang)}>Lihat Lokasi</Button>
                  <Link to={`/datacabang/edit/${cabang.id}`} className="btn btn-info btn-sm mx-1">Edit</Link>
                  <Button variant="danger" size="sm" onClick={() => deleteCabang(cabang.id)}>Delete</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Container>

      <Modal show={showModal} 
  onHide={handleCloseModal}
  centered
  backdrop="static" 
  keyboard={false} 
  style={{ zIndex: 1050 }}> 
 <Modal.Header closeButton>
    <Modal.Title>Detail Lokasi Cabang</Modal.Title>
  </Modal.Header>
  <Modal.Body 
    style={{ 
      maxHeight: '400px',  // Set a maximum height for the modal body
      overflowY: 'auto',   // Enable vertical scrolling if content exceeds height
    }}
  >
    {selectedCabang && (
      <>
        <div>
          <p><strong>Nama Cabang:</strong> {selectedCabang.nama_cabang}</p>
          <p><strong>Kode Cabang:</strong> {selectedCabang.kode_cabang}</p>
          <p><strong>Lokasi Kantor:</strong> {selectedCabang.lokasi_kantor}</p>
          <p><strong>Radius Absensi:</strong> {selectedCabang.radius} Meter</p>
        </div>
        
        <div style={{ marginTop: '30px' }}>
          <p><strong>Lokasi pada Peta:</strong></p>
          <div style={{ width: '100%', height: '400px', borderRadius: '5px', marginBottom: '10px' }}>
            {selectedCabang.latitude && selectedCabang.longitude ? (
              <MapContainer
                center={[selectedCabang.latitude, selectedCabang.longitude]}
                zoom={15}
                style={{ height: '100%', width: '100%' }}
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                <Marker position={[selectedCabang.latitude, selectedCabang.longitude]}>
                  <Popup>{selectedCabang.nama_cabang}</Popup>
                </Marker>
                <Circle
                  center={[selectedCabang.latitude, selectedCabang.longitude]}
                  radius={selectedCabang.radius}
                  color="blue"
                />
              </MapContainer>
            ) : (
              <p>Lokasi tidak tersedia</p>
            )}
          </div>
        </div>
      </>
    )}
  </Modal.Body>
  <Modal.Footer>
    <Button variant="secondary" onClick={handleCloseModal}>
      Tutup
    </Button>
  </Modal.Footer>
</Modal>
    </DashboardContainer>
  );
};

export default Datacabang;