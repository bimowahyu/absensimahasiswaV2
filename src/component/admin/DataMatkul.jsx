import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import useSWR from 'swr';
import {
  Box,
  Container,
  Typography,
  Button,
  Modal,
  TextField,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Paper,
  IconButton,
  Stack,
  InputAdornment,
  CircularProgress,
  Card,
  CardContent,
  Grid,
  TableContainer,
  Fade,
  Backdrop,
  Alert
} from '@mui/material';

import {
  Search as SearchIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Info as InfoIcon,
  Add as AddIcon
} from '@mui/icons-material';

import { styled } from '@mui/material/styles';
import { motion } from 'framer-motion';
import Swal from 'sweetalert2';

axios.defaults.withCredentials = true;

const DashboardContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(4),
  marginLeft: '250px',
  width: 'calc(100% - 250px)',
  [theme.breakpoints.down('md')]: {
    marginLeft: 0,
    width: '100%'
  }
}));

const PageTitle = styled(Typography)(({ theme }) => ({
  marginBottom: theme.spacing(3),
  fontWeight: 600,
  color: theme.palette.text.primary
}));

const StyledButton = styled(Button)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  marginTop: theme.spacing(1)
}));

const StyledTableContainer = styled(TableContainer)(({ theme }) => ({
  boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
  '& .MuiTableHead-root .MuiTableCell-root': {
    backgroundColor: theme.palette.grey[50],
    fontWeight: 600
  }
}));

const ActionButton = styled(IconButton)(({ theme }) => ({
  padding: theme.spacing(0.5),
  margin: theme.spacing(0, 0.25)
}));

const SearchContainer = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  display: 'flex',
  alignItems: 'center'
}));

const ModalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  boxShadow: 24,
  p: 4,
  borderRadius: 1
};

const getApiBaseUrl = () => {
  const protocol = window.location.protocol === 'https:' ? 'https' : 'http';
  const baseUrl = process.env.REACT_APP_API_BASE_URL || 'localhost:5000';
  return `${protocol}://${baseUrl}`;
};

// Modified fetcher to handle direct array response
const fetcher = (url) => axios.get(url).then(res => res.data);

// Format time for display (HH:MM:SS -> HH:MM)
const formatTimeForDisplay = (timeString) => {
  if (!timeString) return '';
  try {
    const [hours, minutes] = timeString.split(':');
    return `${hours}:${minutes}`;
  } catch (error) {
    console.error('Error formatting time:', error);
    return timeString;
  }
};

// Format time for API (Date object -> HH:MM:SS)
const formatTimeForApi = (timeString) => {
  if (!timeString) return null;
  return timeString + ':00'; // Add seconds to HH:MM format
};

const HARI_OPTIONS = ['senin', 'selasa', 'rabu', 'kamis', 'jumat', 'sabtu', 'minggu'];

export const DataMatkul = () => {
  const { data, error, mutate } = useSWR(`${getApiBaseUrl()}/getmatkul`, fetcher);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMatkul, setSelectedMatkul] = useState(null);
  const [openDetailModal, setOpenDetailModal] = useState(false);
  const [openCreateModal, setOpenCreateModal] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);
  
  // Form states
  const [formData, setFormData] = useState({
    nama_matkul: '',
    hari: '',
    jam_dibuka_presensi: '',
    jam_masuk_presensi: '',
    jam_keluar_presensi: ''
  });

  // Set form data when editing
  useEffect(() => {
    if (selectedMatkul && openEditModal) {
      setFormData({
        nama_matkul: selectedMatkul.nama_matkul || '',
        hari: selectedMatkul.hari || '',
        jam_dibuka_presensi: selectedMatkul.jam_dibuka_presensi ? formatTimeForDisplay(selectedMatkul.jam_dibuka_presensi) : '',
        jam_masuk_presensi: selectedMatkul.jam_masuk_presensi ? formatTimeForDisplay(selectedMatkul.jam_masuk_presensi) : '',
        jam_keluar_presensi: selectedMatkul.jam_keluar_presensi ? formatTimeForDisplay(selectedMatkul.jam_keluar_presensi) : ''
      });
    }
  }, [selectedMatkul, openEditModal]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCreateMatkul = async () => {
    try {
      const dataToSubmit = {
        nama_matkul: formData.nama_matkul,
        hari: formData.hari,
        jam_dibuka_presensi: formatTimeForApi(formData.jam_dibuka_presensi),
        jam_masuk_presensi: formatTimeForApi(formData.jam_masuk_presensi),
        jam_keluar_presensi: formatTimeForApi(formData.jam_keluar_presensi)
      };

      await axios.post(`${getApiBaseUrl()}/creatematkul`, dataToSubmit);
      setOpenCreateModal(false);
      resetForm();
      mutate(); // Refresh data
      Swal.fire({
        icon: 'success',
        title: 'Berhasil!',
        text: 'Mata kuliah berhasil ditambahkan',
        timer: 2000,
        showConfirmButton: false
      });
    } catch (error) {
      console.error('Error creating matkul:', error.response ? error.response.data : error.message);
      Swal.fire({
        icon: 'error',
        title: 'Gagal!',
        text: 'Gagal membuat mata kuliah. Pastikan semua form diisi dengan benar.',
      });
    }
  };

  const handleUpdateMatkul = async () => {
    if (!selectedMatkul) return;
    
    try {
      const dataToSubmit = {
        nama_matkul: formData.nama_matkul,
        hari: formData.hari,
        jam_dibuka_presensi: formatTimeForApi(formData.jam_dibuka_presensi),
        jam_masuk_presensi: formatTimeForApi(formData.jam_masuk_presensi),
        jam_keluar_presensi: formatTimeForApi(formData.jam_keluar_presensi)
      };

      await axios.put(`${getApiBaseUrl()}/updatematkul/${selectedMatkul.id}`, dataToSubmit);
      setOpenEditModal(false);
      resetForm();
      mutate(); // Refresh data
      Swal.fire({
        icon: 'success',
        title: 'Berhasil!',
        text: 'Mata kuliah berhasil diperbarui',
        timer: 2000,
        showConfirmButton: false
      });
    } catch (error) {
      console.error('Error updating matkul:', error.response ? error.response.data : error.message);
      Swal.fire({
        icon: 'error',
        title: 'Gagal!',
        text: 'Gagal mengupdate mata kuliah. Pastikan semua form diisi dengan benar.',
      });
    }
  };

  const deleteMatkul = async (id) => {
    Swal.fire({
      title: 'Konfirmasi',
      text: 'Apakah anda ingin menghapus mata kuliah ini?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Ya, hapus!',
      cancelButtonText: 'Batal'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axios.delete(`${getApiBaseUrl()}/deletematkul/${id}`);
          mutate();
          Swal.fire({
            icon: 'success',
            title: 'Terhapus!',
            text: 'Mata kuliah berhasil dihapus.',
            timer: 2000,
            showConfirmButton: false
          });
        } catch (error) {
          console.error('Data gagal dihapus:', error.response ? error.response.data : error.message);
          Swal.fire({
            icon: 'error',
            title: 'Gagal!',
            text: 'Gagal menghapus mata kuliah.',
          });
        }
      }
    });
  };

  const resetForm = () => {
    setFormData({
      nama_matkul: '',
      hari: '',
      jam_dibuka_presensi: '',
      jam_masuk_presensi: '',
      jam_keluar_presensi: ''
    });
  };

  if (error) return (
    <Container sx={{ mt: 5 }}>
      <Alert severity="error">Error loading data: {error.message}</Alert>
    </Container>
  );
  
  if (!data) return (
    <Container sx={{ mt: 5, textAlign: 'center' }}>
      <CircularProgress />
    </Container>
  );

  // Direct use of data since it's already an array from the API
  const matkulList = Array.isArray(data) ? data : [];
  
  const filteredMatkul = matkulList.filter((mk) =>
    mk.nama_matkul?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DashboardContainer>
      <Container>
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <PageTitle variant="h6">Data Mata Kuliah</PageTitle>
          
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} md={8}>
              <SearchContainer>
                <TextField
                  fullWidth
                  placeholder="Cari Mata Kuliah"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    ),
                  }}
                  variant="outlined"
                  size="small"
                />
              </SearchContainer>
            </Grid>
            <Grid item xs={12} md={4} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button 
                variant="contained" 
                color="primary" 
                startIcon={<AddIcon />}
                onClick={() => setOpenCreateModal(true)}
              >
                Tambah Mata Kuliah
              </Button>
            </Grid>
          </Grid>

          <Card>
            <CardContent>
              <StyledTableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell width="5%">No</TableCell>
                      <TableCell width="25%">Nama Mata Kuliah</TableCell>
                      <TableCell width="10%">Hari</TableCell>
                      <TableCell width="15%">Jam Dibuka</TableCell>
                      <TableCell width="15%">Jam Masuk</TableCell>
                      <TableCell width="15%">Jam Keluar</TableCell>
                      <TableCell width="15%">Dosen</TableCell>
                      <TableCell width="15%">Aksi</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredMatkul.map((mk, index) => (
                      <TableRow key={mk.id || index}>
                        <TableCell>{index + 1}</TableCell>
                        <TableCell>{mk.nama_matkul}</TableCell>
                        <TableCell>{mk.hari ? mk.hari.charAt(0).toUpperCase() + mk.hari.slice(1) : ''}</TableCell>
                        <TableCell>{formatTimeForDisplay(mk.jam_dibuka_presensi)}</TableCell>
                        <TableCell>{formatTimeForDisplay(mk.jam_masuk_presensi)}</TableCell>
                        <TableCell>{formatTimeForDisplay(mk.jam_keluar_presensi)}</TableCell>
                        <TableCell>{mk.User?.name || 'Belum ditentukan'}</TableCell>
                        <TableCell>
                          <Stack direction="row" spacing={1}>
                            <ActionButton color="info" size="small"
                              onClick={() => { 
                                setSelectedMatkul(mk); 
                                setOpenDetailModal(true); 
                              }}
                            >
                              <InfoIcon fontSize="small" />
                            </ActionButton>
                            <ActionButton color="primary" size="small"
                              onClick={() => { 
                                setSelectedMatkul(mk); 
                                setOpenEditModal(true); 
                              }}
                            >
                              <EditIcon fontSize="small" />
                            </ActionButton>
                            <ActionButton color="error" size="small" 
                              onClick={() => deleteMatkul(mk.id)}
                            >
                              <DeleteIcon fontSize="small" />
                            </ActionButton>
                          </Stack>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </StyledTableContainer>
            </CardContent>
          </Card>
        </motion.div>
      </Container>

      {/* Detail Modal */}
      <Modal 
        open={openDetailModal} 
        onClose={() => setOpenDetailModal(false)}
        closeAfterTransition
        BackdropComponent={Backdrop}
        BackdropProps={{
          timeout: 500,
        }}
      >
        <Fade in={openDetailModal}>
          <Box sx={ModalStyle}>
            <Typography variant="h6" component="h2" sx={{ mb: 2 }}>
              Detail Mata Kuliah
            </Typography>
            {selectedMatkul && (
              <Card sx={{ mb: 2 }}>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 2 }}>
                    {selectedMatkul.nama_matkul}
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 1 }}>
                    <b>Hari:</b> {selectedMatkul.hari ? selectedMatkul.hari.charAt(0).toUpperCase() + selectedMatkul.hari.slice(1) : ''}
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 1 }}>
                    <b>Jam Dibuka Presensi:</b> {formatTimeForDisplay(selectedMatkul.jam_dibuka_presensi)}
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 1 }}>
                    <b>Jam Masuk Presensi:</b> {formatTimeForDisplay(selectedMatkul.jam_masuk_presensi)}
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 1 }}>
                    <b>Jam Keluar Presensi:</b> {formatTimeForDisplay(selectedMatkul.jam_keluar_presensi)}
                  </Typography>
                  
                  {selectedMatkul.User && (
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                        Dosen:
                      </Typography>
                      <Typography variant="body1">
                        {selectedMatkul.User.name || 'Belum ditentukan'}
                      </Typography>
                    </Box>
                  )}
                </CardContent>
              </Card>
            )}
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
              <Button variant="contained" onClick={() => setOpenDetailModal(false)}>
                Tutup
              </Button>
            </Box>
          </Box>
        </Fade>
      </Modal>

      {/* Create Modal */}
      <Modal 
        open={openCreateModal} 
        onClose={() => setOpenCreateModal(false)}
        closeAfterTransition
        BackdropComponent={Backdrop}
        BackdropProps={{
          timeout: 500,
        }}
      >
        <Fade in={openCreateModal}>
          <Box sx={ModalStyle}>
            <Typography variant="h6" component="h2" sx={{ mb: 2 }}>
              Tambah Mata Kuliah Baru
            </Typography>
            <Box component="form" sx={{ mt: 1 }}>
              <TextField
                margin="normal"
                required
                fullWidth
                label="Nama Mata Kuliah"
                name="nama_matkul"
                value={formData.nama_matkul}
                onChange={handleInputChange}
                sx={{ mb: 2 }}
              />
              
              <FormControl fullWidth required sx={{ mb: 2 }}>
                <InputLabel id="hari-label">Hari</InputLabel>
                <Select
                  labelId="hari-label"
                  id="hari"
                  name="hari"
                  value={formData.hari}
                  onChange={handleInputChange}
                  label="Hari"
                >
                  <MenuItem value="">
                    <em>Pilih Hari</em>
                  </MenuItem>
                  {HARI_OPTIONS.map((day) => (
                    <MenuItem key={day} value={day}>
                      {day.charAt(0).toUpperCase() + day.slice(1)}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              
              <TextField
                margin="normal"
                required
                fullWidth
                label="Jam Dibuka Presensi"
                name="jam_dibuka_presensi"
                type="time"
                value={formData.jam_dibuka_presensi}
                onChange={handleInputChange}
                InputLabelProps={{
                  shrink: true,
                }}
                inputProps={{
                  step: 300, // 5 min
                }}
                sx={{ mb: 2 }}
              />
              
              <TextField
                margin="normal"
                required
                fullWidth
                label="Jam Masuk Presensi"
                name="jam_masuk_presensi"
                type="time"
                value={formData.jam_masuk_presensi}
                onChange={handleInputChange}
                InputLabelProps={{
                  shrink: true,
                }}
                inputProps={{
                  step: 300, // 5 min
                }}
                sx={{ mb: 2 }}
              />
              
              <TextField
                margin="normal"
                required
                fullWidth
                label="Jam Keluar Presensi"
                name="jam_keluar_presensi"
                type="time"
                value={formData.jam_keluar_presensi}
                onChange={handleInputChange}
                InputLabelProps={{
                  shrink: true,
                }}
                inputProps={{
                  step: 300, // 5 min
                }}
                sx={{ mb: 2 }}
              />
              
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
                <Button 
                  variant="outlined" 
                  onClick={() => setOpenCreateModal(false)} 
                  sx={{ mr: 1 }}
                >
                  Batal
                </Button>
                <Button 
                  variant="contained" 
                  onClick={handleCreateMatkul}
                >
                  Simpan
                </Button>
              </Box>
            </Box>
          </Box>
        </Fade>
      </Modal>

      {/* Edit Modal */}
      <Modal 
        open={openEditModal} 
        onClose={() => setOpenEditModal(false)}
        closeAfterTransition
        BackdropComponent={Backdrop}
        BackdropProps={{
          timeout: 500,
        }}
      >
        <Fade in={openEditModal}>
          <Box sx={ModalStyle}>
            <Typography variant="h6" component="h2" sx={{ mb: 2 }}>
              Edit Mata Kuliah
            </Typography>
            <Box component="form" sx={{ mt: 1 }}>
              <TextField
                margin="normal"
                required
                fullWidth
                label="Nama Mata Kuliah"
                name="nama_matkul"
                value={formData.nama_matkul}
                onChange={handleInputChange}
                sx={{ mb: 2 }}
              />
              
              <FormControl fullWidth required sx={{ mb: 2 }}>
                <InputLabel id="hari-label-edit">Hari</InputLabel>
                <Select
                  labelId="hari-label-edit"
                  id="hari-edit"
                  name="hari"
                  value={formData.hari}
                  onChange={handleInputChange}
                  label="Hari"
                >
                  <MenuItem value="">
                    <em>Pilih Hari</em>
                  </MenuItem>
                  {HARI_OPTIONS.map((day) => (
                    <MenuItem key={day} value={day}>
                      {day.charAt(0).toUpperCase() + day.slice(1)}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              
              <TextField
                margin="normal"
                required
                fullWidth
                label="Jam Dibuka Presensi"
                name="jam_dibuka_presensi"
                type="time"
                value={formData.jam_dibuka_presensi}
                onChange={handleInputChange}
                InputLabelProps={{
                  shrink: true,
                }}
                inputProps={{
                  step: 300, // 5 min
                }}
                sx={{ mb: 2 }}
              />
              
              <TextField
                margin="normal"
                required
                fullWidth
                label="Jam Masuk Presensi"
                name="jam_masuk_presensi"
                type="time"
                value={formData.jam_masuk_presensi}
                onChange={handleInputChange}
                InputLabelProps={{
                  shrink: true,
                }}
                inputProps={{
                  step: 300, // 5 min
                }}
                sx={{ mb: 2 }}
              />
              
              <TextField
                margin="normal"
                required
                fullWidth
                label="Jam Keluar Presensi"
                name="jam_keluar_presensi"
                type="time"
                value={formData.jam_keluar_presensi}
                onChange={handleInputChange}
                InputLabelProps={{
                  shrink: true,
                }}
                inputProps={{
                  step: 300, // 5 min
                }}
                sx={{ mb: 2 }}
              />
              
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
                <Button 
                  variant="outlined" 
                  onClick={() => setOpenEditModal(false)} 
                  sx={{ mr: 1 }}
                >
                  Batal
                </Button>
                <Button 
                  variant="contained" 
                  onClick={handleUpdateMatkul}
                >
                  Update
                </Button>
              </Box>
            </Box>
          </Box>
        </Fade>
      </Modal>
    </DashboardContainer>
  );
};

export default DataMatkul;