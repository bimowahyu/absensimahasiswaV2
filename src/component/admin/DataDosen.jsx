import React, { useState, useEffect } from 'react';
import axios from 'axios';
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

const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 500,
  bgcolor: 'background.paper',
  borderRadius: 2,
  boxShadow: 24,
  p: 4,
};

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  '&:nth-of-type(odd)': {
    backgroundColor: theme.palette.action.hover,
  },
  '&:hover': {
    backgroundColor: theme.palette.action.selected,
  },
  '&:last-child td, &:last-child th': {
    border: 0,
  },
}));

// Fetcher function for SWR
const fetcher = url => axios.get(url).then(res => res.data);
const getApiBaseUrl = () => {
  const protocol = window.location.protocol === 'https:' ? 'https' : 'http';
  const baseUrl = process.env.REACT_APP_API_BASE_URL?.replace(/^https?:\/\//, '') || 'localhost:5000';
  return `${protocol}://${baseUrl}`;
};

export const DataDosen = () => {
  // State management
  const [openModal, setOpenModal] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // 'add' or 'edit'
  const [searchTerm, setSearchTerm] = useState('');
  const [alertMessage, setAlertMessage] = useState('');
  const [alertSeverity, setAlertSeverity] = useState('success');
  const [showAlert, setShowAlert] = useState(false);
  const [mataKuliah, setMataKuliah] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Form state
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    email: '',
    password: '',
    confPassword: '',
    role: 'dosen', 
    MatkulId: ''
  });

  // Fetch users data
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${getApiBaseUrl()}/users`);
        setUsers(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching users:', err);
        setError(err);
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  // Fetch mata kuliah data
  useEffect(() => {
    const fetchMataKuliah = async () => {
      try {
        const response = await axios.get(`${getApiBaseUrl()}/getmatkul`);
        // Check data structure and handle accordingly
        if (response.data && Array.isArray(response.data)) {
          setMataKuliah(response.data);
        } else if (response.data && response.data.data && Array.isArray(response.data.data)) {
          // Handle case where data is wrapped in a data property
          setMataKuliah(response.data.data);
        } else {
          console.error('Unexpected data structure for mata kuliah:', response.data);
          setMataKuliah([]);
        }
      } catch (error) {
        console.error('Error fetching mata kuliah:', error);
        setMataKuliah([]);
      }
    };
    fetchMataKuliah();
  }, []);

  // Alert handling
  const showAlertMessage = (message, severity) => {
    setAlertMessage(message);
    setAlertSeverity(severity);
    setShowAlert(true);
    setTimeout(() => setShowAlert(false), 5000);
  };

  // Filter users based on search term and role
  const filteredUsers = users?.filter(user => 
    user.role === 'dosen' && 
    (user.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
     user.email?.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Handle modal open/close
  const handleOpenModal = (mode, user = null) => {
    setModalMode(mode);
    if (mode === 'add') {
      setFormData({
        id: '',
        name: '',
        email: '',
        password: '',
        confPassword: '',
        role: 'dosen',
        MatkulId: ''
      });
    } else if (mode === 'edit' && user) {
      setFormData({
        id: user.id,
        name: user.name,
        email: user.email,
        password: '',
        confPassword: '',
        role: 'dosen',
        MatkulId: user.MatkulId || ''
      });
    }
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.name || !formData.email || (!formData.id && (!formData.password || !formData.confPassword))) {
      showAlertMessage('Semua field wajib diisi', 'error');
      return;
    }

    if (formData.password !== formData.confPassword) {
      showAlertMessage('Password dan Confirm Password tidak cocok', 'error');
      return;
    }

    if (!formData.MatkulId) {
      showAlertMessage('Dosen harus memilih Mata Kuliah', 'error');
      return;
    }

    try {
      if (modalMode === 'add') {
        await axios.post(`${getApiBaseUrl()}/users`, formData);
        showAlertMessage('User berhasil ditambahkan', 'success');
      } else {
        await axios.put(`${getApiBaseUrl()}/users/${formData.id}`, formData);
        showAlertMessage('User berhasil diupdate', 'success');
      }
      handleCloseModal();
      // Refresh data after update
      const response = await axios.get(`${getApiBaseUrl()}/users`);
      setUsers(response.data);
    } catch (error) {
      showAlertMessage(error.response?.data?.msg || 'Terjadi kesalahan', 'error');
    }
  };

  // Handle delete user
  const handleDelete = async (id) => {
    Swal.fire({
      title: 'Apakah Anda yakin?',
      text: "Data yang dihapus tidak dapat dikembalikan!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Ya, hapus!',
      cancelButtonText: 'Batal'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axios.delete(`${getApiBaseUrl()}/users/${id}`);
          // Refresh data after delete
          const response = await axios.get(`${getApiBaseUrl()}/users`);
          setUsers(response.data);
          Swal.fire(
            'Terhapus!',
            'Data user berhasil dihapus.',
            'success'
          );
        } catch (error) {
          Swal.fire(
            'Error!',
            error.response?.data?.msg || 'Terjadi kesalahan saat menghapus data.',
            'error'
          );
        }
      }
    });
  };

  // Loading state
  if (loading) {
    return (
      <DashboardContainer>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
          <CircularProgress />
        </Box>
      </DashboardContainer>
    );
  }

  // Error state
  if (error) {
    return (
      <DashboardContainer>
        <Alert severity="error">
          Error loading data. Please try again later.
        </Alert>
      </DashboardContainer>
    );
  }

  return (
    <DashboardContainer>
      {/* Alert message */}
      {showAlert && (
        <Alert 
          severity={alertSeverity}
          sx={{ 
            marginBottom: 2,
            position: 'fixed',
            top: '20px',
            right: '20px',
            zIndex: 9999
          }}
        >
          {alertMessage}
        </Alert>
      )}

      {/* Header Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card sx={{ mb: 4, boxShadow: 3 }}>
          <CardContent>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={8}>
                <Typography variant="h4" gutterBottom component="div">
                  Manajemen Data Dosen
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Kelola data dosen dan mata kuliah yang mereka ajarkan
                </Typography>
              </Grid>
              <Grid item xs={12} md={4} sx={{ display: 'flex', justifyContent: { xs: 'flex-start', md: 'flex-end' } }}>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<AddIcon />}
                  onClick={() => handleOpenModal('add')}
                >
                  Tambah Dosen
                </Button>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </motion.div>

      {/* Search and Filter Section */}
      <Card sx={{ mb: 4, boxShadow: 2 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                variant="outlined"
                placeholder="Cari berdasarkan nama atau email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Data Table */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <TableContainer component={Paper} sx={{ boxShadow: 3 }}>
          <Table sx={{ minWidth: 650 }}>
            <TableHead sx={{ bgcolor: 'primary.main' }}>
              <TableRow>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>No</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Nama</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Email</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Mata Kuliah</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }} align="center">Aksi</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredUsers && filteredUsers.length > 0 ? (
                filteredUsers.map((user, index) => (
                  <StyledTableRow key={user.id}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                     <TableCell>
                    {user.Matkul ? user.Matkul.nama_matkul : 'Belum ditentukan'}
                    </TableCell>
                    <TableCell align="center">
                      <Stack direction="row" spacing={1} justifyContent="center">
                        <IconButton 
                          color="primary" 
                          onClick={() => handleOpenModal('edit', user)}
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton 
                          color="error"
                          onClick={() => handleDelete(user.id)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Stack>
                    </TableCell>
                  </StyledTableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    <Typography variant="body1" sx={{ py: 2 }}>
                      {searchTerm ? 'Tidak ada data dosen yang sesuai dengan pencarian' : 'Belum ada data dosen'}
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </motion.div>

      {/* Add/Edit Modal */}
      <Modal
        open={openModal}
        onClose={handleCloseModal}
        closeAfterTransition
        BackdropComponent={Backdrop}
        BackdropProps={{
          timeout: 500,
        }}
      >
        <Fade in={openModal}>
          <Box sx={modalStyle}>
            <Typography variant="h6" component="h2" sx={{ mb: 3 }}>
              {modalMode === 'add' ? 'Tambah Dosen Baru' : 'Edit Data Dosen'}
            </Typography>
            <form onSubmit={handleSubmit}>
              <Stack spacing={3}>
                <TextField
                  fullWidth
                  label="Nama Lengkap"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
                <TextField
                  fullWidth
                  label="Email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
                <TextField
                  fullWidth
                  label="Password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required={modalMode === 'add'}
                  helperText={modalMode === 'edit' ? 'Biarkan kosong jika tidak ingin mengubah password' : ''}
                />
                <TextField
                  fullWidth
                  label="Konfirmasi Password"
                  name="confPassword"
                  type="password"
                  value={formData.confPassword}
                  onChange={handleInputChange}
                  required={modalMode === 'add'}
                />
                <FormControl fullWidth required>
                  <InputLabel>Mata Kuliah</InputLabel>
                  <Select
                    name="MatkulId"
                    value={formData.MatkulId}
                    label="Mata Kuliah"
                    onChange={handleInputChange}
                  >
                    {Array.isArray(mataKuliah) ? (
                      mataKuliah.map((mk) => (
                        <MenuItem key={mk.id} value={mk.id}>
                          {mk.nama_matkul}
                        </MenuItem>
                      ))
                    ) : (
                      <MenuItem value="">No mata kuliah available</MenuItem>
                    )}
                  </Select>
                </FormControl>
                <Stack direction="row" spacing={2} justifyContent="flex-end">
                  <Button variant="outlined" onClick={handleCloseModal}>
                    Batal
                  </Button>
                  <Button variant="contained" type="submit">
                    {modalMode === 'add' ? 'Tambah' : 'Update'}
                  </Button>
                </Stack>
              </Stack>
            </form>
          </Box>
        </Fade>
      </Modal>
    </DashboardContainer>
  );
};