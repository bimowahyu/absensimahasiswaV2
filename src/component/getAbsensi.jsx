import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, Card, CardContent, Typography, Grid, Button } from '@mui/material';
import LocationMap from './locationMaps';
import Location from './location';
import { NavLink } from "react-router-dom";
const getApiBaseUrl = () => {
  const protocol = window.location.protocol === 'https:' ? 'https' : 'http';
 const baseUrl = process.env.REACT_APP_API_BASE_URL.replace(/^https?:\/\//, '');
  return `${protocol}://${baseUrl}`;
};

const AbsensiPage = () => {
  const [absensiData, setAbsensiData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAbsensiData = async () => {
      try {
        const response = await axios.get(`${getApiBaseUrl()}/absensi/get`,{withCredentials: true});
        setAbsensiData(response.data);
      } catch (error) {
        setError(error.message);
      }
    };

    fetchAbsensiData();
  }, []);

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!absensiData) {
    return <div>Loading...</div>;
  }

  const parseCoordinates = (lokasiString) => {
    if (!lokasiString) {
      return { latitude: null, longitude: null };
    }
    const [latitude, longitude] = lokasiString.split(',');
    return { latitude: parseFloat(latitude), longitude: parseFloat(longitude) };
  };

  const { lokasi, absensiHariIni } = absensiData;

  if (!absensiHariIni) {
    return (
      <Container maxWidth="sm" style={{ marginTop: '20px' }}>
        <Card>
          <CardContent>
            <Typography variant="h5" style={{ marginBottom: '20px', textAlign: 'center' }}>Data Absensi Hari Ini</Typography>
            <Typography variant="body2" color="error">Anda belum absen hari ini.</Typography>
            <Typography variant="h5" style={{ marginTop: '20px', textAlign: 'center' }}>Data Lokasi</Typography>
            {lokasi ? (
              <Grid container spacing={2} style={{ marginTop: '10px' }}>
                <Grid item xs={12}>
                  <Typography variant="body1"><strong>Nama Cabang:</strong> {lokasi.nama_cabang}</Typography>
                  <Typography variant="body1"><strong>Lokasi Kantor:</strong> {lokasi.lokasi_kantor}</Typography>
                </Grid>
              </Grid>
            ) : (
              <Typography variant="body2" color="error">Data lokasi tidak tersedia.</Typography>
            )}
          </CardContent>
          <CardContent>
            <Grid container justifyContent="center">
              <Grid item xs={6}>
                <Button component={NavLink} to="/dashboard" variant="contained" fullWidth>
                  Kembali
                </Button>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Container>
    );
  }

  const { latitude: latitudeMasuk, longitude: longitudeMasuk } = parseCoordinates(absensiHariIni.lokasi_masuk);
  const { latitude: latitudeKeluar, longitude: longitudeKeluar } = parseCoordinates(absensiHariIni.lokasi_keluar);

  return (
    <Container maxWidth="sm" style={{ marginTop: '20px' }}>
      <Card>
        <CardContent>
          <Typography variant="h5" style={{ marginBottom: '20px', textAlign: 'center' }}>Data Absensi Hari Ini</Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Typography variant="body1">
                <strong>Tanggal:</strong> {new Date(absensiHariIni.tgl_absensi).toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' })}
              </Typography>
              <Typography variant="body1">
                <strong>Jam Masuk:</strong> {absensiHariIni.jam_masuk}
              </Typography>
              <Typography variant="body1">
                <strong>Jam Keluar:</strong> {absensiHariIni.jam_keluar || '-'}
              </Typography>

              <Typography variant="body1">
                <strong>Lokasi Masuk:</strong> {absensiHariIni.lokasi_masuk}
              </Typography>
              {latitudeMasuk && longitudeMasuk && (
                <LocationMap 
                  latitude={latitudeMasuk} 
                  longitude={longitudeMasuk} 
                  style={{ width: '100%', height: '200px', maxWidth: '400px' }}  
                />
              )}

              <Typography variant="body1">
                <strong>Lokasi Keluar:</strong> {absensiHariIni.lokasi_keluar || '-'}
              </Typography>
              {latitudeKeluar && longitudeKeluar && (
                <Location 
                  latitude={latitudeKeluar} 
                  longitude={longitudeKeluar} 
                  style={{ width: '100%', height: '200px', maxWidth: '400px' }}  
                />
              )}
            </Grid>
          </Grid>

          <Typography variant="h5" style={{ marginTop: '20px', textAlign: 'center' }}>Data Lokasi</Typography>
          {lokasi ? (
            <Grid container spacing={2} style={{ marginTop: '10px' }}>
              <Grid item xs={12}>
                <Typography variant="body1"><strong>Nama Cabang:</strong> {lokasi.nama_cabang}</Typography>
                <Typography variant="body1"><strong>Lokasi Kantor:</strong> {lokasi.lokasi_kantor}</Typography>
              </Grid>
            </Grid>
          ) : (
            <Typography variant="body2" color="error">Data lokasi tidak tersedia.</Typography>
          )}
        </CardContent>
        <CardContent>
          <Grid container justifyContent="center">
            <Grid item xs={6}>
              <Button component={NavLink} to="/dashboard" variant="contained" fullWidth>
                Kembali
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Container>
  );
};

export default AbsensiPage;
