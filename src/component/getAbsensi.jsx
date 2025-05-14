import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, Card, CardContent, Typography, Grid, Button, Divider } from '@mui/material';
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
        const response = await axios.get(`${getApiBaseUrl()}/absensi/get`, { withCredentials: true });
        
        // Gunakan seluruh data yang diterima dari API
        const transformedData = {
          lokasi: response.data.lokasi,
         absensiHariIni: Array.isArray(response.data.data) ? response.data.data : [],
          jumlah: response.data.jumlah
        };
        
        setAbsensiData(transformedData);
      } catch (error) {
        setError(error.message);
      }
    };
//=======================================NGELU WKWKWK===============================
    fetchAbsensiData();
  }, []);

  const parseCoordinates = (lokasiString) => {
    if (!lokasiString) {
      return { latitude: null, longitude: null };
    }
    const [latitude, longitude] = lokasiString.split(',');
    return { 
      latitude: parseFloat(latitude), 
      longitude: parseFloat(longitude) 
    };
  };

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!absensiData) {
    return <div>Loading...</div>;
  }

  const { lokasi, absensiHariIni, jumlah } = absensiData;

  if (!absensiHariIni || absensiHariIni.length === 0) {
    return (
      <Container maxWidth="sm" style={{ marginTop: '20px' }}>
        <Card>
          <CardContent>
            <Typography variant="h5" style={{ marginBottom: '20px', textAlign: 'center' }}>
              Data Absensi Hari Ini
            </Typography>
            <Typography variant="body2" color="error">
              Anda belum absen hari ini.
            </Typography>
            
            <Typography variant="h5" style={{ marginTop: '20px', textAlign: 'center' }}>
              Data Lokasi Kampus
            </Typography>
            
            {lokasi ? (
              <Grid container spacing={2} style={{ marginTop: '10px' }}>
                <Grid item xs={12}>
                  <Typography variant="body1">
                    <strong>Lokasi Radius:</strong> {lokasi.nama}
                  </Typography>
                  <Typography variant="body1">
                    <strong>Lokasi Presensi:</strong> {lokasi.lokasi}
                  </Typography>
                  <Typography variant="body1">
                    <strong>Radius Presensi:</strong> {lokasi.radius} meter
                  </Typography>
                  
                  {lokasi.lokasi && (
                    <LocationMap 
                      latitude={parseCoordinates(lokasi.lokasi).latitude}
                      longitude={parseCoordinates(lokasi.lokasi).longitude}
                      style={{ width: '100%', height: '200px', marginTop: '15px' }}
                    />
                  )}
                </Grid>
              </Grid>
            ) : (
              <Typography variant="body2" color="error">
                Data lokasi tidak tersedia.
              </Typography>
            )}
          </CardContent>
          <CardContent>
            <Grid container justifyContent="center">
              <Grid item xs={6}>
                <Button 
                  component={NavLink} 
                  to="/dashboard" 
                  variant="contained" 
                  fullWidth
                >
                  Kembali
                </Button>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Container>
    );
  }

  // Data lokasi kampus
  const { latitude: latitudeKampus, longitude: longitudeKampus } = parseCoordinates(lokasi.lokasi);

  return (
    <Container maxWidth="sm" style={{ marginTop: '20px', marginBottom: '20px' }}>
      <Card>
        <CardContent>
          <Typography variant="h5" style={{ marginBottom: '20px', textAlign: 'center' }}>
            Data Absensi Hari Ini ({jumlah} Kehadiran)
          </Typography>
          
          {/* Menampilkan semua data absensi hari ini */}
          {absensiHariIni.map((absensi, index) => {
            const { latitude: latitudeMasuk, longitude: longitudeMasuk } = parseCoordinates(absensi.lokasi_masuk);
            const { latitude: latitudeKeluar, longitude: longitudeKeluar } = parseCoordinates(absensi.lokasi_keluar);
            
            return (
              <div key={absensi.id}>
                {index > 0 && (
                  <Divider style={{ margin: '20px 0', borderColor: '#aaa', borderWidth: '2px' }} />
                )}
                
                <Typography variant="h6" style={{ marginBottom: '10px', color: '#1976d2' }}>
                  Mata Kuliah: {absensi.matkul?.nama_matkul || '-'}
                </Typography>
                
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Typography variant="body1">
                      <strong>Tanggal:</strong> {new Date(absensi.tgl_absensi).toLocaleDateString('id-ID', { 
                        day: '2-digit', 
                        month: '2-digit', 
                        year: 'numeric' 
                      })}
                    </Typography>
                    
                    <Typography variant="body1">
                      <strong>Jam Masuk:</strong> {absensi.jam_masuk || '-'}
                    </Typography>
                    
                    <Typography variant="body1">
                      <strong>Jam Keluar:</strong> {absensi.jam_keluar || '-'}
                    </Typography>

                    <Typography variant="body1">
                      <strong>Status:</strong> <span style={{ 
                        color: absensi.status === 'hadir' ? 'green' : 
                              absensi.status === 'izin' ? 'blue' : 'orange'
                      }}>{absensi.status || '-'}</span>
                    </Typography>
                    
                    <Typography variant="body1" style={{ marginTop: '15px' }}>
                      <strong>Lokasi Masuk:</strong>
                    </Typography>
                    {latitudeMasuk && longitudeMasuk ? (
                      <>
                        <Typography variant="body2">
                          {absensi.lokasi_masuk}
                        </Typography>
                        <LocationMap 
                          latitude={latitudeMasuk} 
                          longitude={longitudeMasuk} 
                          style={{ width: '100%', height: '200px', marginTop: '10px' }}  
                        />
                      </>
                    ) : (
                      <Typography variant="body2" color="textSecondary">
                        Tidak ada data lokasi masuk
                      </Typography>
                    )}

                    <Typography variant="body1" style={{ marginTop: '15px' }}>
                      <strong>Lokasi Keluar:</strong>
                    </Typography>
                    {latitudeKeluar && longitudeKeluar ? (
                      <>
                        <Typography variant="body2">
                          {absensi.lokasi_keluar}
                        </Typography>
                        <Location 
                          latitude={latitudeKeluar} 
                          longitude={longitudeKeluar} 
                          style={{ width: '100%', height: '200px', marginTop: '10px' }}  
                        />
                      </>
                    ) : (
                      <Typography variant="body2" color="textSecondary">
                        Tidak ada data lokasi keluar
                      </Typography>
                    )}
                  </Grid>
                </Grid>
              </div>
            );
          })}

          <Typography variant="h5" style={{ margin: '20px 0', textAlign: 'center' }}>
            Data Lokasi Kampus
          </Typography>
          
          {lokasi ? (
            <Grid container spacing={2} style={{ marginTop: '10px' }}>
              <Grid item xs={12}>
                <Typography variant="body1">
                  <strong>Nama Titik:</strong> {lokasi.nama}
                </Typography>
                <Typography variant="body1">
                  <strong>Lokasi:</strong> {lokasi.lokasi}
                </Typography>
                <Typography variant="body1">
                  <strong>Radius Presensi:</strong> {lokasi.radius} meter
                </Typography>
                
                {latitudeKampus && longitudeKampus && (
                  <LocationMap 
                    latitude={latitudeKampus}
                    longitude={longitudeKampus}
                    style={{ width: '100%', height: '200px', marginTop: '15px' }}
                  />
                )}
              </Grid>
            </Grid>
          ) : (
            <Typography variant="body2" color="error">
              Data lokasi tidak tersedia.
            </Typography>
          )}
        </CardContent>
        
        <CardContent>
          <Grid container justifyContent="center">
            <Grid item xs={6}>
              <Button 
                component={NavLink} 
                to="/dashboard" 
                variant="contained" 
                fullWidth
              >
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