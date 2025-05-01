import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Container, TextField, Button, Paper, Typography, Box } from '@mui/material';
import styled from 'styled-components';

const DashboardContainer = styled(Box)`
padding: 2rem 1rem;
margin-left: 250px; /* Width of your sidebar */
width: calc(100% - 250px);

@media (max-width: 768px) {
  margin-left: 0;
  width: 100%;
}
`;
const getApiBaseUrl = () => {
  const protocol = window.location.protocol === 'https:' ? 'https' : 'http';
  const baseUrl = process.env.REACT_APP_API_BASE_URL.replace(/^https?:\/\//, '');
  return `${protocol}://${baseUrl}`;
};


export const CreateCabang = () => {
  const [kodeCabang, setKodeCabang] = useState('');
  const [namaCabang, setNamaCabang] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [radius, setRadius] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const saveCabang = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${getApiBaseUrl()}/cabang`, {
        kode: kodeCabang,
        nama: namaCabang,
        latitude,
        longitude,
        radius,
      });
      setMessage('Lokasi berhasil ditambahkan');
      navigate('/datalokasi');
    } catch (error) {
      setMessage(error.response?.data?.msg || 'Terjadi kesalahan');
    }
  };
 

  return (
    <DashboardContainer>
      <Paper elevation={3} sx={{ p: 3, mt: 5, borderRadius: 2 }}>
        <Typography variant="h5" gutterBottom align="center">
          Tambah Lokasi Baru
        </Typography>
        {message && (
          <Typography color="error" align="center" sx={{ mb: 2 }}>
            {message}
          </Typography>
        )}
        <Box component="form" onSubmit={saveCabang} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField label="Nama" variant="outlined" fullWidth value={namaCabang} onChange={(e) => setNamaCabang(e.target.value)} required />
          <TextField label="Kode" variant="outlined" fullWidth value={kodeCabang} onChange={(e) => setKodeCabang(e.target.value)} required />
          <TextField label="Latitude" variant="outlined" fullWidth value={latitude} onChange={(e) => setLatitude(e.target.value)} required />
          <TextField label="Longitude" variant="outlined" fullWidth value={longitude} onChange={(e) => setLongitude(e.target.value)} required />
          <TextField label="Radius Absensi (Meter)" type="number" variant="outlined" fullWidth value={radius} onChange={(e) => setRadius(e.target.value)} required />
          <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 2 }}>
            Simpan
          </Button>
        </Box>
      </Paper>
    </DashboardContainer>
  );
};

export default CreateCabang;