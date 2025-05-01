import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Box, 
  Paper, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  Button,
  Typography,
  Dialog,
  IconButton,
  CircularProgress
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import { styled } from '@mui/system';
import { FormEditAbsensi } from './FormEditAbsensi';

const getApiBaseUrl = () => {
  const protocol = window.location.protocol === 'https:' ? 'https' : 'http';
  const baseUrl = process.env.REACT_APP_API_BASE_URL.replace(/^https?:\/\//, '');
  return `${protocol}://${baseUrl}`;
};

const DashboardContainer = styled(Box)({
  padding: '2rem 1rem',
  marginLeft: 250,
  width: 'calc(100% - 250px)',
  '@media (max-width: 768px)': {
    marginLeft: 0,
    width: '100%',
  },
});

const AbsenControll = () => {
  const [absensiData, setAbsensiData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [selectedAbsensiId, setSelectedAbsensiId] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${getApiBaseUrl()}/absensiall/get`, { withCredentials: true });
      
      // Pastikan response.data.absensi adalah array
      if (Array.isArray(response.data.absensi)) {
        setAbsensiData(response.data.absensi);
      } else {
        setError('Format data tidak valid');
        setAbsensiData([]);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      setError(error.response?.data?.message || 'Terjadi kesalahan saat mengambil data');
      setAbsensiData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleEditClick = (id) => {
    setSelectedAbsensiId(id);
    setOpenEditDialog(true);
  };

  const handleCloseEditDialog = () => {
    setOpenEditDialog(false);
    setSelectedAbsensiId(null);
  };

  const formatTime = (timeString) => {
    if (!timeString) return '-';
    return timeString.substring(0, 5); // Format HH:MM
  };
  
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  if (loading) {
    return (
      <DashboardContainer>
        <Box display="flex" justifyContent="center" alignItems="center" height="50vh">
          <CircularProgress />
        </Box>
      </DashboardContainer>
    );
  }

  return (
    <DashboardContainer>
      <Typography variant="h4" gutterBottom>
        Data Absensi
      </Typography>
      
      {error && (
        <Typography color="error" gutterBottom>
          {error}
        </Typography>
      )}
      
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>No</TableCell>
              <TableCell>Tanggal</TableCell>
              <TableCell>Nama Mahasiswa</TableCell>
              <TableCell>Mata Kuliah</TableCell>
              <TableCell>Jam Masuk</TableCell>
              <TableCell>Jam Keluar</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Aksi</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {absensiData.length > 0 ? (
              absensiData.map((absensi, index) => (
                <TableRow key={absensi.id}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>{formatDate(absensi.tgl_absensi)}</TableCell>
                  <TableCell>{absensi.mahasiswa?.nama_lengkap || '-'}</TableCell>
                  <TableCell>{absensi.matkul?.nama_matkul || '-'}</TableCell>
                  <TableCell>{formatTime(absensi.jam_masuk)}</TableCell>
                  <TableCell>{formatTime(absensi.jam_keluar)}</TableCell>
                  <TableCell>{absensi.status}</TableCell>
                  <TableCell>
                    <IconButton 
                      color="primary" 
                      onClick={() => handleEditClick(absensi.id)}
                      size="small"
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  Tidak ada data absensi
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Dialog untuk edit absensi */}
      <Dialog open={openEditDialog} onClose={handleCloseEditDialog} maxWidth="sm" fullWidth>
        <FormEditAbsensi 
          id={selectedAbsensiId} 
          onClose={handleCloseEditDialog} 
          mutate={fetchData} 
        />
      </Dialog>
    </DashboardContainer>
  );
};

export default AbsenControll;