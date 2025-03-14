import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { Box, Container, Card, CardContent, Typography, Grid, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button } from '@mui/material';
import { NavLink } from 'react-router-dom';

const getApiBaseUrl = () => {
  const protocol = window.location.protocol === 'https:' ? 'https' : 'http';
  const baseUrl = process.env.REACT_APP_API_BASE_URL.replace(/^https?:\/\//, '');
  return `${protocol}://${baseUrl}`;
};

// Utility function to calculate total working hours and overtime
const calculateWorkingHours = (jamMasuk, jamKeluar) => {
  if (!jamMasuk || !jamKeluar) return { totalHours: 0, totalMinutes: 0, overtime: { hours: 0, minutes: 0 } };
  
  // Parse time strings
  const [inHour, inMinute] = jamMasuk.split(':').map(Number);
  const [outHour, outMinute] = jamKeluar.split(':').map(Number);
  
  // Calculate total minutes
  let totalMinutes = (outHour * 60 + outMinute) - (inHour * 60 + inMinute);
  
  // Handle negative time (if someone clocked out the next day)
  if (totalMinutes < 0) {
    totalMinutes += 24 * 60; // Add a full day in minutes
  }
  
  // Convert to hours and minutes
  const totalHours = Math.floor(totalMinutes / 60);
  const remainingMinutes = totalMinutes % 60;
  
  // Calculate overtime (if more than 8 hours)
  let overtimeHours = 0;
  let overtimeMinutes = 0;
  
  // Only consider overtime if total is more than 8 hours and 30 minutes (510 minutes)
  if (totalMinutes > 510) {
    const overtimeMinutesTotal = totalMinutes - 510;
    overtimeHours = Math.floor(overtimeMinutesTotal / 60);
    overtimeMinutes = overtimeMinutesTotal % 60;
  }
  
  return {
    totalHours,
    totalMinutes: remainingMinutes,
    overtime: { hours: overtimeHours, minutes: overtimeMinutes }
  };
};

// Format time to display as HH:MM
const formatTime = (hours, minutes) => {
  return `${hours}:${minutes.toString().padStart(2, '0')}`;
};

export const Kehadiranbulan = () => {
  const now = new Date();
  const [absensiData, setAbsensiData] = useState([]);
  const [error, setError] = useState(null);
  const [bulan, setBulan] = useState(now.getMonth() + 1);
  const [tahun, setTahun] = useState(now.getFullYear());
  const [warning, setWarning] = useState('');

  useEffect(() => {
    const fetchAbsensiData = async () => {
      try {
        const response = await axios.get(`${getApiBaseUrl()}/absensibulan/get?bulan=${bulan}&tahun=${tahun}`, { withCredentials: true });
        if (response.data.length === 0) {
          setError("Tidak ada data absensi untuk bulan ini.");
        } else {
          setAbsensiData(response.data.sort((a, b) => new Date(a.tgl_absensi) - new Date(b.tgl_absensi)));
          setError(null); // Clear error on success
        }
      } catch (error) {
        setError(error.message);
      }
    };

    fetchAbsensiData();
  }, [bulan, tahun]);

  // Memoize the calculation of total attendance and overtime for the month
  const { totalAbsenBulanIni, totalOvertimeHours, totalWorkHours } = useMemo(() => {
    const totalAbsenBulanIni = absensiData.length;
    
    // Calculate total overtime and working hours for the month
    let totalOvertimeMinutes = 0;
    let totalWorkMinutes = 0;
    
    absensiData.forEach(absensi => {
      if (absensi.jam_masuk && absensi.jam_keluar) {
        const { totalHours, totalMinutes, overtime } = calculateWorkingHours(absensi.jam_masuk, absensi.jam_keluar);
        const totalMinutesWorked = totalHours * 60 + totalMinutes;
        totalWorkMinutes += totalMinutesWorked;
        
        const overtimeMinutesTotal = overtime.hours * 60 + overtime.minutes;
        totalOvertimeMinutes += overtimeMinutesTotal;
      }
    });
    
    const totalOvertimeHours = (totalOvertimeMinutes / 60).toFixed(2);
    const totalWorkHours = (totalWorkMinutes / 60).toFixed(2);
    
    return { totalAbsenBulanIni, totalOvertimeHours, totalWorkHours };
  }, [absensiData]);

  const handleMonthChange = (e) => {
    const [year, month] = e.target.value.split("-");
    setBulan(month);
    setTahun(year);
    setError(null); // Clear error when month/year changes
  };

  const handleTampilkanData = () => {
    if (!bulan || !tahun) {
      setWarning('Silahkan pilih bulan dan tahun.');
    } else {
      setWarning('');
    }
  };

  return (
    <Container maxWidth="lg" style={{ marginTop: '20px' }}>
      <Card>
        <CardContent>
          <Typography variant="h5" style={{ marginBottom: '20px', textAlign: 'center' }}>Data Absensi Bulanan</Typography>
          
          {/* Month Selector */}
          <Box component="form" onSubmit={(e) => e.preventDefault()} sx={{ display: 'flex', justifyContent: 'center', flexDirection: 'column', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
            <input
              type="month"
              value={`${tahun}-${bulan.toString().padStart(2, '0')}`}
              onChange={handleMonthChange}
              placeholder="YYYY-MM"
              style={{ padding: '8px', width: '100%' }}
            />
            <Button type="button" onClick={handleTampilkanData} variant="contained" sx={{ width: '100%', fontSize: '12px' }}>
              Tampilkan Data
            </Button>
          </Box>
          
          {/* Error/Warning Handling */}
          {warning && <Typography color="error" sx={{ textAlign: 'center' }}>{warning}</Typography>}
          {error ? (
            <Typography color="error" sx={{ textAlign: 'center' }}>{error}</Typography>
          ) : (
            <>
              {/* Display Monthly Attendance Summary */}
              <Grid container spacing={2} style={{ marginTop: '20px' }}>
                <Grid item xs={12} md={4}>
                  <Card>
                    <CardContent>
                      <Typography variant="body2">Absensi Bulan Ini</Typography>
                      <Typography variant="h6">{totalAbsenBulanIni} Kehadiran</Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Card>
                    <CardContent>
                      <Typography variant="body2">Total Jam Kerja</Typography>
                      <Typography variant="h6">{totalWorkHours} Jam</Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Card>
                    <CardContent>
                      <Typography variant="body2">Total Lembur</Typography>
                      <Typography variant="h6">{totalOvertimeHours} Jam</Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>

              {/* Display Attendance Table */}
              <TableContainer component={Paper} className="responsive-container" style={{ marginTop: '20px' }}>
                <Table sx={{ minWidth: 650 }}>
                  <TableHead>
                    <TableRow>
                      <TableCell align="center"><strong>Tanggal</strong></TableCell>
                      <TableCell align="center"><strong>Jam Masuk</strong></TableCell>
                      <TableCell align="center"><strong>Jam Keluar</strong></TableCell>
                      <TableCell align="center"><strong>Total Jam Kerja</strong></TableCell>
                      <TableCell align="center"><strong>Lembur</strong></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {absensiData.map((absensi) => {
                      const workingTime = absensi.jam_masuk && absensi.jam_keluar 
                        ? calculateWorkingHours(absensi.jam_masuk, absensi.jam_keluar) 
                        : { totalHours: 0, totalMinutes: 0, overtime: { hours: 0, minutes: 0 } };
                      
                      return (
                        <TableRow key={absensi.id}>
                          <TableCell align="center">
                            {new Date(absensi.tgl_absensi).toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                          </TableCell>
                          <TableCell align="center">{absensi.jam_masuk || '-'}</TableCell>
                          <TableCell align="center">{absensi.jam_keluar || '-'}</TableCell>
                          <TableCell align="center">
                            {absensi.jam_masuk && absensi.jam_keluar 
                              ? `${workingTime.totalHours}:${workingTime.totalMinutes.toString().padStart(2, '0')}`
                              : '-'}
                          </TableCell>
                          <TableCell align="center">
                            {(workingTime.overtime.hours > 0 || workingTime.overtime.minutes > 0)
                              ? `${workingTime.overtime.hours}:${workingTime.overtime.minutes.toString().padStart(2, '0')}`
                              : '-'}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            </>
          )}

          {/* Back Button */}
          <Grid container spacing={2} style={{ marginTop: '20px' }}>
            <Grid item xs={12}>
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

export default Kehadiranbulan;