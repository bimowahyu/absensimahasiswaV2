import React, { useState, useEffect } from 'react';
import axios from 'axios';
import useSWR, { mutate } from 'swr';
import {
  Box, Container, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper,
  TextField, Button, Dialog, DialogTitle,
  DialogContent, DialogActions, Typography,
  Tabs, Tab, IconButton, Grid, MenuItem, Select,
  FormControl, InputLabel, Chip, CircularProgress,
  Alert, Snackbar, Autocomplete
} from '@mui/material';
import { FaInfoCircle, FaEdit, FaTrash, FaPlus, FaUserPlus } from 'react-icons/fa';
import { styled } from '@mui/system';

axios.defaults.withCredentials = true;

const DashboardContainer = styled(Box)({
  padding: '2rem',
  marginLeft: 250,
  width: 'calc(100% - 250px)',
  '@media (max-width: 768px)': {
    marginLeft: 0,
    width: '100%',
  },
});

const StyledTableCell = styled(TableCell)({
  fontWeight: 'bold',
  backgroundColor: '#f5f5f5',
});

const TabPanel = ({ children, value, index }) => {
  return (
    <div role="tabpanel" hidden={value !== index}>
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
};

const getApiBaseUrl = () => {
  const protocol = window.location.protocol === 'https:' ? 'https' : 'http';
  const baseUrl = process.env.REACT_APP_API_BASE_URL.replace(/^https?:\/\//, '');
  return `${protocol}://${baseUrl}`;
};

const fetcher = (url) => axios.get(url).then(res => res.data);

export const SettingAbsensiMatkul = () => {
  const [tabValue, setTabValue] = useState(0);
  const [searchMatkul, setSearchMatkul] = useState('');
  const [searchMahasiswa, setSearchMahasiswa] = useState('');
  const [dayFilter, setDayFilter] = useState('');
  
  // Dialog states
  const [matkulDialog, setMatkulDialog] = useState(false);
  const [mahasiswaDialog, setMahasiswaDialog] = useState(false);
  const [enrollDialog, setEnrollDialog] = useState(false);
  const [confirmDeleteDialog, setConfirmDeleteDialog] = useState(false);
  const [enrollMahasiswaDialog, setEnrollMahasiswaDialog] = useState(false);
  
  // Form states
  const [matkulForm, setMatkulForm] = useState({
    id: '',
    nama_matkul: '',
    hari: '',
    jam_dibuka_presensi: '',
    jam_masuk_presensi: '',
    jam_keluar_presensi: ''
  });
  
  const [mahasiswaForm, setMahasiswaForm] = useState({
    id: '',
    nama_lengkap: '',
    username: '',
    password: '',
    CabangId: ''
  });
  
  const [enrollForm, setEnrollForm] = useState({
    mahasiswaId: '',
    matkulId: '',
  });
  
  const [batchEnrollForm, setBatchEnrollForm] = useState({
    matkulId: '',
    mahasiswaIds: []
  });
  
  const [deleteId, setDeleteId] = useState(null);
  const [deleteType, setDeleteType] = useState('');
  const [currentMatkulId, setCurrentMatkulId] = useState(null);
  
  // Notification state
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  // Data fetching
  const { data: matkulData, error: matkulError, isLoading: matkulLoading } = useSWR(
    `${getApiBaseUrl()}/matkul${searchMatkul ? `?nama_matkul=${searchMatkul}` : ''}${dayFilter ? `&hari=${dayFilter}` : ''}`,
    fetcher
  );
  
  const { data: mahasiswaData, error: mahasiswaError, isLoading: mahasiswaLoading } = useSWR(
    `${getApiBaseUrl()}/mahasiswa${searchMahasiswa ? `?nama_lengkap=${searchMahasiswa}` : ''}`,
    fetcher
  );

  const { data: matkulMahasiswaData, mutate: mutateMatkulMahasiswa } = useSWR(
    currentMatkulId ? `${getApiBaseUrl()}/matkul/${currentMatkulId}/mahasiswa` : null,
    fetcher
  );

  // Handler functions
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleOpenMatkulDialog = (matkul = null) => {
    if (matkul) {
      setMatkulForm({
        id: matkul.id,
        nama_matkul: matkul.nama_matkul,
        hari: matkul.hari,
        jam_dibuka_presensi: matkul.jam_dibuka_presensi,
        jam_masuk_presensi: matkul.jam_masuk_presensi,
        jam_keluar_presensi: matkul.jam_keluar_presensi
      });
    } else {
      setMatkulForm({
        id: '',
        nama_matkul: '',
        hari: '',
        jam_dibuka_presensi: '',
        jam_masuk_presensi: '',
        jam_keluar_presensi: ''
      });
    }
    setMatkulDialog(true);
  };

  const handleOpenMahasiswaDialog = (mahasiswa = null) => {
    if (mahasiswa) {
      setMahasiswaForm({
        id: mahasiswa.id,
        nama_lengkap: mahasiswa.nama_lengkap,
        username: mahasiswa.username,
        password: '', // Don't show password
        CabangId: mahasiswa.CabangId || ''
      });
    } else {
      setMahasiswaForm({
        id: '',
        nama_lengkap: '',
        username: '',
        password: '',
        CabangId: ''
      });
    }
    setMahasiswaDialog(true);
  };

  const handleOpenEnrollDialog = () => {
    setEnrollForm({
      mahasiswaId: '',
      matkulId: ''
    });
    setEnrollDialog(true);
  };

  const handleOpenEnrollMahasiswaDialog = (matkulId) => {
    setCurrentMatkulId(matkulId);
    setBatchEnrollForm({
      matkulId: matkulId,
      mahasiswaIds: []
    });
    setEnrollMahasiswaDialog(true);
  };

  const handleOpenDeleteDialog = (id, type) => {
    setDeleteId(id);
    setDeleteType(type);
    setConfirmDeleteDialog(true);
  };

  const handleMatkulFormChange = (e) => {
    setMatkulForm({ ...matkulForm, [e.target.name]: e.target.value });
  };

  const handleMahasiswaFormChange = (e) => {
    setMahasiswaForm({ ...mahasiswaForm, [e.target.name]: e.target.value });
  };

  const handleEnrollFormChange = (e) => {
    setEnrollForm({ ...enrollForm, [e.target.name]: e.target.value });
  };

  const handleBatchEnrollChange = (event, newValue) => {
    setBatchEnrollForm({
      ...batchEnrollForm,
      mahasiswaIds: newValue.map(mahasiswa => mahasiswa.id)
    });
  };

  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false });
  };

  const showNotification = (message, severity = 'success') => {
    setNotification({
      open: true,
      message,
      severity
    });
  };

  // Submit functions
  const handleSubmitMatkul = async () => {
    try {
      const url = matkulForm.id 
        ? `${getApiBaseUrl()}/matkul/${matkulForm.id}` 
        : `${getApiBaseUrl()}/matkul`;
      
      const method = matkulForm.id ? axios.put : axios.post;
      
      await method(url, matkulForm);
      
      // Refresh data
      mutate(`${getApiBaseUrl()}/matkul${searchMatkul ? `?nama_matkul=${searchMatkul}` : ''}${dayFilter ? `&hari=${dayFilter}` : ''}`);
      
      setMatkulDialog(false);
      showNotification(matkulForm.id ? 'Mata kuliah berhasil diperbarui' : 'Mata kuliah berhasil ditambahkan');
    } catch (error) {
      console.error('Error saving matkul:', error);
      showNotification(error.response?.data?.msg || 'Terjadi kesalahan', 'error');
    }
  };

  const handleSubmitMahasiswa = async () => {
    try {
      const url = mahasiswaForm.id 
        ? `${getApiBaseUrl()}/mahasiswa/${mahasiswaForm.id}` 
        : `${getApiBaseUrl()}/mahasiswa`;
      
      const method = mahasiswaForm.id ? axios.put : axios.post;
      
      await method(url, mahasiswaForm);
      
      // Refresh data
      mutate(`${getApiBaseUrl()}/mahasiswa${searchMahasiswa ? `?nama_lengkap=${searchMahasiswa}` : ''}`);
      
      setMahasiswaDialog(false);
      showNotification(mahasiswaForm.id ? 'Data mahasiswa berhasil diperbarui' : 'Mahasiswa berhasil ditambahkan');
    } catch (error) {
      console.error('Error saving mahasiswa:', error);
      showNotification(error.response?.data?.msg || 'Terjadi kesalahan', 'error');
    }
  };

  const handleSubmitEnroll = async () => {
    try {
      await axios.post(`${getApiBaseUrl()}/enroll`, enrollForm);
      
      // Refresh data if necessary
      if (currentMatkulId === enrollForm.matkulId) {
        mutateMatkulMahasiswa();
      }
      
      setEnrollDialog(false);
      showNotification('Mahasiswa berhasil didaftarkan ke mata kuliah');
    } catch (error) {
      console.error('Error enrolling student:', error);
      showNotification(error.response?.data?.msg || 'Terjadi kesalahan', 'error');
    }
  };

  const handleSubmitBatchEnroll = async () => {
    try {
      await axios.post(`${getApiBaseUrl()}/enroll/batch`, batchEnrollForm);
      
      // Refresh data
      mutateMatkulMahasiswa();
      
      setEnrollMahasiswaDialog(false);
      showNotification('Mahasiswa berhasil didaftarkan ke mata kuliah');
    } catch (error) {
      console.error('Error batch enrolling students:', error);
      showNotification(error.response?.data?.msg || 'Terjadi kesalahan', 'error');
    }
  };

  const handleDelete = async () => {
    try {
      if (deleteType === 'matkul') {
        await axios.delete(`${getApiBaseUrl()}/matkul/${deleteId}`);
        mutate(`${getApiBaseUrl()}/matkul${searchMatkul ? `?nama_matkul=${searchMatkul}` : ''}${dayFilter ? `&hari=${dayFilter}` : ''}`);
        showNotification('Mata kuliah berhasil dihapus');
      } else if (deleteType === 'mahasiswa') {
        await axios.delete(`${getApiBaseUrl()}/mahasiswa/${deleteId}`);
        mutate(`${getApiBaseUrl()}/mahasiswa${searchMahasiswa ? `?nama_lengkap=${searchMahasiswa}` : ''}`);
        showNotification('Mahasiswa berhasil dihapus');
      } else if (deleteType === 'enrollment' && currentMatkulId) {
        await axios.delete(`${getApiBaseUrl()}/enroll/${deleteId}/${currentMatkulId}`);
        mutateMatkulMahasiswa();
        showNotification('Mahasiswa berhasil dihapus dari mata kuliah');
      }
      
      setConfirmDeleteDialog(false);
    } catch (error) {
      console.error('Error deleting:', error);
      showNotification(error.response?.data?.msg || 'Terjadi kesalahan', 'error');
    }
  };

  const handleViewMatkulMahasiswa = (matkulId) => {
    setCurrentMatkulId(matkulId);
    setTabValue(2); // Switch to the mahasiswa list tab
  };

  // Render functions
  const renderMatkulTable = () => {
    if (matkulLoading) return <CircularProgress />;
    if (matkulError) return <Alert severity="error">Error loading mata kuliah</Alert>;
    if (!matkulData || !matkulData.matkul) return <Alert severity="info">No data available</Alert>;

    return (
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <StyledTableCell>Nama Mata Kuliah</StyledTableCell>
              <StyledTableCell>Hari</StyledTableCell>
              <StyledTableCell>Jam Dibuka</StyledTableCell>
              <StyledTableCell>Jam Masuk</StyledTableCell>
              <StyledTableCell>Jam Keluar</StyledTableCell>
              <StyledTableCell align="center">Actions</StyledTableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {matkulData.matkul.map((matkul) => (
              <TableRow key={matkul.id}>
                <TableCell>{matkul.nama_matkul}</TableCell>
                <TableCell style={{ textTransform: 'capitalize' }}>{matkul.hari}</TableCell>
                <TableCell>{matkul.jam_dibuka_presensi}</TableCell>
                <TableCell>{matkul.jam_masuk_presensi}</TableCell>
                <TableCell>{matkul.jam_keluar_presensi}</TableCell>
                <TableCell align="center">
                  <IconButton onClick={() => handleViewMatkulMahasiswa(matkul.id)} color="primary" title="View Students">
                    <FaInfoCircle />
                  </IconButton>
                  <IconButton onClick={() => handleOpenMatkulDialog(matkul)} color="primary" title="Edit">
                    <FaEdit />
                  </IconButton>
                  <IconButton onClick={() => handleOpenDeleteDialog(matkul.id, 'matkul')} color="error" title="Delete">
                    <FaTrash />
                  </IconButton>
                  <IconButton onClick={() => handleOpenEnrollMahasiswaDialog(matkul.id)} color="success" title="Add Students">
                    <FaUserPlus />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  };

  const renderMahasiswaTable = () => {
    if (mahasiswaLoading) return <CircularProgress />;
    if (mahasiswaError) return <Alert severity="error">Error loading mahasiswa</Alert>;
    if (!mahasiswaData || !mahasiswaData.mahasiswa) return <Alert severity="info">No data available</Alert>;

    return (
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <StyledTableCell>Nama Lengkap</StyledTableCell>
              <StyledTableCell>Username</StyledTableCell>
              <StyledTableCell>Cabang</StyledTableCell>
              <StyledTableCell align="center">Actions</StyledTableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {mahasiswaData.mahasiswa.map((mahasiswa) => (
              <TableRow key={mahasiswa.id}>
                <TableCell>{mahasiswa.nama_lengkap}</TableCell>
                <TableCell>{mahasiswa.username}</TableCell>
                <TableCell>{mahasiswa.CabangId}</TableCell>
                <TableCell align="center">
                  <IconButton onClick={() => handleOpenMahasiswaDialog(mahasiswa)} color="primary" title="Edit">
                    <FaEdit />
                  </IconButton>
                  <IconButton onClick={() => handleOpenDeleteDialog(mahasiswa.id, 'mahasiswa')} color="error" title="Delete">
                    <FaTrash />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  };

  const renderMatkulMahasiswaTable = () => {
    if (!currentMatkulId) return <Alert severity="info">Pilih mata kuliah untuk melihat daftar mahasiswa</Alert>;
    if (!matkulMahasiswaData) return <CircularProgress />;

    return (
      <>
        <Box sx={{ mb: 2 }}>
          <Typography variant="h6">
            Mata Kuliah: {matkulMahasiswaData?.matkul?.nama_matkul || 'Loading...'}
          </Typography>
          <Typography variant="subtitle1" style={{ textTransform: 'capitalize' }}>
            {matkulMahasiswaData?.matkul?.hari || ''}
          </Typography>
        </Box>
        
        <Box sx={{ mb: 2 }}>
          <Button 
            variant="contained" 
            color="primary" 
            startIcon={<FaUserPlus />}
            onClick={() => handleOpenEnrollMahasiswaDialog(currentMatkulId)}
          >
            Tambah Mahasiswa
          </Button>
        </Box>
        
        {matkulMahasiswaData?.mahasiswa?.length > 0 ? (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <StyledTableCell>Nama Lengkap</StyledTableCell>
                  <StyledTableCell>Username</StyledTableCell>
                  <StyledTableCell>Cabang</StyledTableCell>
                  <StyledTableCell align="center">Actions</StyledTableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {matkulMahasiswaData.mahasiswa.map((mahasiswa) => (
                  <TableRow key={mahasiswa.id}>
                    <TableCell>{mahasiswa.nama_lengkap}</TableCell>
                    <TableCell>{mahasiswa.username}</TableCell>
                    <TableCell>{mahasiswa.CabangId}</TableCell>
                    <TableCell align="center">
                      <IconButton 
                        onClick={() => handleOpenDeleteDialog(mahasiswa.id, 'enrollment')} 
                        color="error" 
                        title="Remove from course"
                      >
                        <FaTrash />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          <Alert severity="info">Belum ada mahasiswa yang terdaftar</Alert>
        )}
      </>
    );
  };

  return (
    <DashboardContainer>
      <Typography variant="h4" sx={{ mb: 4 }}>Pengaturan Mata Kuliah & Mahasiswa</Typography>
      
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab label="Mata Kuliah" />
          <Tab label="Mahasiswa" />
          <Tab label="Daftar Mahasiswa Per Matkul" />
        </Tabs>
      </Box>
      
      {/* Mata Kuliah Tab */}
      <TabPanel value={tabValue} index={0}>
        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', gap: 2, width: '70%' }}>
            <TextField
              label="Search Mata Kuliah"
              variant="outlined"
              size="small"
              value={searchMatkul}
              onChange={(e) => setSearchMatkul(e.target.value)}
              sx={{ flexGrow: 1 }}
            />
            <FormControl sx={{ minWidth: 120 }} size="small">
              <InputLabel id="day-filter-label">Filter Hari</InputLabel>
              <Select
                labelId="day-filter-label"
                value={dayFilter}
                label="Filter Hari"
                onChange={(e) => setDayFilter(e.target.value)}
              >
                <MenuItem value="">Semua</MenuItem>
                <MenuItem value="senin">Senin</MenuItem>
                <MenuItem value="selasa">Selasa</MenuItem>
                <MenuItem value="rabu">Rabu</MenuItem>
                <MenuItem value="kamis">Kamis</MenuItem>
                <MenuItem value="jumat">Jumat</MenuItem>
                <MenuItem value="sabtu">Sabtu</MenuItem>
                <MenuItem value="minggu">Minggu</MenuItem>
              </Select>
            </FormControl>
          </Box>
          <Button
            variant="contained"
            color="primary"
            startIcon={<FaPlus />}
            onClick={() => handleOpenMatkulDialog()}
          >
            Tambah Matkul
          </Button>
        </Box>
        
        {renderMatkulTable()}
      </TabPanel>
      
      {/* Mahasiswa Tab */}
      <TabPanel value={tabValue} index={1}>
        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <TextField
            label="Search Mahasiswa"
            variant="outlined"
            size="small"
            value={searchMahasiswa}
            onChange={(e) => setSearchMahasiswa(e.target.value)}
            sx={{ flexGrow: 1, maxWidth: '70%' }}
          />
          <Button
            variant="contained"
            color="primary"
            startIcon={<FaPlus />}
            onClick={() => handleOpenMahasiswaDialog()}
          >
            Tambah Mahasiswa
          </Button>
        </Box>
        
        {renderMahasiswaTable()}
      </TabPanel>
      
      {/* Daftar Mahasiswa Per Matkul Tab */}
      <TabPanel value={tabValue} index={2}>
        {renderMatkulMahasiswaTable()}
      </TabPanel>
      
      {/* Matkul Dialog */}
      <Dialog open={matkulDialog} onClose={() => setMatkulDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{matkulForm.id ? 'Edit Mata Kuliah' : 'Tambah Mata Kuliah'}</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <TextField
              name="nama_matkul"
              label="Nama Mata Kuliah"
              fullWidth
              margin="dense"
              value={matkulForm.nama_matkul}
              onChange={handleMatkulFormChange}
            />
            
            <FormControl fullWidth margin="dense">
              <InputLabel>Hari</InputLabel>
              <Select
                name="hari"
                value={matkulForm.hari}
                onChange={handleMatkulFormChange}
                label="Hari"
              >
                <MenuItem value="senin">Senin</MenuItem>
                <MenuItem value="selasa">Selasa</MenuItem>
                <MenuItem value="rabu">Rabu</MenuItem>
                <MenuItem value="kamis">Kamis</MenuItem>
                <MenuItem value="jumat">Jumat</MenuItem>
                <MenuItem value="sabtu">Sabtu</MenuItem>
                <MenuItem value="minggu">Minggu</MenuItem>
              </Select>
            </FormControl>
            
            <TextField
              name="jam_dibuka_presensi"
              label="Jam Dibuka Presensi (HH:MM:SS)"
              fullWidth
              margin="dense"
              value={matkulForm.jam_dibuka_presensi}
              onChange={handleMatkulFormChange}
            />
            
            <TextField
              name="jam_masuk_presensi"
              label="Jam Masuk Presensi (HH:MM:SS)"
              fullWidth
              margin="dense"
              value={matkulForm.jam_masuk_presensi}
              onChange={handleMatkulFormChange}
            />
            
            <TextField
              name="jam_keluar_presensi"
              label="Jam Keluar Presensi (HH:MM:SS)"
              fullWidth
              margin="dense"
              value={matkulForm.jam_keluar_presensi}
              onChange={handleMatkulFormChange}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setMatkulDialog(false)}>Batal</Button>
          <Button onClick={handleSubmitMatkul} variant="contained" color="primary">
            Simpan
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Mahasiswa Dialog */}
      <Dialog open={mahasiswaDialog} onClose={() => setMahasiswaDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{mahasiswaForm.id ? 'Edit Mahasiswa' : 'Tambah Mahasiswa'}</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <TextField
              name="nama_lengkap"
              label="Nama Lengkap"
              fullWidth
              margin="dense"
              value={mahasiswaForm.nama_lengkap}
              onChange={handleMahasiswaFormChange}
            />
            
            <TextField
              name="username"
              label="Username"
              fullWidth
              margin="dense"
              value={mahasiswaForm.username}
              onChange={handleMahasiswaFormChange}
            />
            
            <TextField
              name="password"
              label="Password"
              type="password"
              fullWidth
              margin="dense"
              value={mahasiswaForm.password}
              onChange={handleMahasiswaFormChange}
              helperText={mahasiswaForm.id ? "Biarkan kosong jika tidak ingin mengubah password" : ""}
            />
            
            <TextField
              name="CabangId"
              label="Cabang ID"
              fullWidth
              margin="dense"
              value={mahasiswaForm.CabangId}
              onChange={handleMahasiswaFormChange}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setMahasiswaDialog(false)}>Batal</Button>
          <Button onClick={handleSubmitMahasiswa} variant="contained" color="primary">
            Simpan
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Enroll Dialog (Single Student) */}
      <Dialog open={enrollDialog} onClose={() => setEnrollDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Daftarkan Mahasiswa ke Mata Kuliah</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <FormControl fullWidth margin="dense">
              <InputLabel>Mahasiswa</InputLabel>
              <Select
                name="mahasiswaId"
                value={enrollForm.mahasiswaId}
                onChange={handleEnrollFormChange}
                label="Mahasiswa"
              >
                {mahasiswaData?.mahasiswa?.map(mahasiswa => (
                  <MenuItem key={mahasiswa.id} value={mahasiswa.id}>
                    {mahasiswa.nama_lengkap}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <FormControl fullWidth margin="dense">
              <InputLabel>Mata Kuliah</InputLabel>
              <Select
                name="matkulId"
                value={enrollForm.matkulId}
                onChange={handleEnrollFormChange}
                label="Mata Kuliah"
              >
                {matkulData?.matkul?.map(matkul => (
                  <MenuItem key={matkul.id} value={matkul.id}>
                    {matkul.nama_matkul}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEnrollDialog(false)}>Batal</Button>
          <Button onClick={handleSubmitEnroll} variant="contained" color="primary">
            Daftarkan
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Batch Enroll Dialog (Multiple Students) */}
      <Dialog open={enrollMahasiswaDialog} onClose={() => setEnrollMahasiswaDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Daftarkan Mahasiswa ke Mata Kuliah</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle1" sx={{ mb: 2 }}>
              Mata Kuliah: {matkulData?.matkul?.find(m => m.id === batchEnrollForm.matkulId)?.nama_matkul || ''}
            </Typography>
            
            <Autocomplete
              multiple
              options={mahasiswaData?.mahasiswa || []}
              getOptionLabel={(option) => option.nama_lengkap}
              onChange={handleBatchEnrollChange}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Pilih Mahasiswa"
                  variant="outlined"
                  placeholder="Cari mahasiswa..."
                />
              )}
              renderTags={(value, getTagProps) =>
                value.map((option, index) => (
                  <Chip 
                    label={option.nama_lengkap} 
                    {...getTagProps({ index })} 
                    key={option.id}
                  />
                ))
              }
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEnrollMahasiswaDialog(false)}>Batal</Button>
          <Button 
            onClick={handleSubmitBatchEnroll} 
            variant="contained" 
            color="primary"
            disabled={!batchEnrollForm.mahasiswaIds.length}
          >
            Daftarkan
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Konfirmasi Hapus Dialog */}
      <Dialog open={confirmDeleteDialog} onClose={() => setConfirmDeleteDialog(false)}>
        <DialogTitle>Konfirmasi Hapus</DialogTitle>
        <DialogContent>
          <Typography>
            {deleteType === 'matkul' 
              ? 'Apakah Anda yakin ingin menghapus mata kuliah ini?' 
              : deleteType === 'mahasiswa' 
                ? 'Apakah Anda yakin ingin menghapus mahasiswa ini?' 
                : 'Apakah Anda yakin ingin menghapus mahasiswa dari mata kuliah ini?'}
          </Typography>
          <Typography variant="caption" color="error" sx={{ mt: 1, display: 'block' }}>
            {deleteType === 'matkul' && 'Menghapus mata kuliah akan menghapus semua data presensi terkait.'}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDeleteDialog(false)}>Batal</Button>
          <Button onClick={handleDelete} variant="contained" color="error">
            Hapus
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Notification Snackbar */}
      <Snackbar 
        open={notification.open} 
        autoHideDuration={6000} 
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleCloseNotification} 
          severity={notification.severity} 
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </DashboardContainer>
  );
};

export default SettingAbsensiMatkul