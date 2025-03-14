import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import {
  Container, 
  TextField, 
  Button, 
  MenuItem, 
  Typography, 
  Box, 
  Snackbar, 
  Alert, 
  Autocomplete, 
  Grid, 
  Paper,
  InputAdornment,
  Divider,
  Card,
  CardContent,
  Avatar,
  Chip,
  IconButton,
  Fade,
  Stack
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { 
  PersonOutline, 
  CalendarMonth, 
  EventNote, 
  AttachMoney, 
  AddCircleOutline, 
  RemoveCircleOutline, 
  Notes,
  ArrowBack,
  CalculateOutlined
} from '@mui/icons-material';

const StyledPaper = styled(Paper)(({ theme }) => ({
  borderRadius: 16,
  boxShadow: '0 8px 40px rgba(0, 0, 0, 0.08)',
  overflow: 'hidden',
  position: 'relative',
}));

const FormHeader = styled(Box)(({ theme }) => ({
  background: 'linear-gradient(45deg, #1976d2 30%, #2196f3 90%)',
  padding: theme.spacing(4),
  color: 'white',
  textAlign: 'center',
}));

const SummaryCard = styled(Card)(({ theme }) => ({
  borderRadius: 12,
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
  height: '100%',
  background: 'linear-gradient(to right, #fbfcfd, #f8fafc)',
  border: '1px solid #e7eef8',
}));

const CalculationBox = styled(Box)(({ theme }) => ({
  background: 'rgba(25, 118, 210, 0.04)',
  borderRadius: 8,
  padding: theme.spacing(2),
  marginTop: theme.spacing(2),
}));

const TotalAmount = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: theme.spacing(2),
  marginTop: theme.spacing(2),
  borderRadius: 8,
  backgroundColor: '#1976d2',
  color: 'white',
  fontWeight: 'bold',
}));

const SalaryChip = styled(Chip)(({ theme, type }) => ({
  borderRadius: 8,
  fontWeight: 'bold',
  backgroundColor: type === 'tambahan' ? 'rgba(76, 175, 80, 0.1)' : 'rgba(244, 67, 54, 0.1)',
  color: type === 'tambahan' ? '#4caf50' : '#f44336',
  border: `1px solid ${type === 'tambahan' ? '#4caf50' : '#f44336'}`,
}));

const DashboardContainer = styled(Box)(({ theme }) => ({
  marginLeft: '250px', /* Width of your sidebar */
  width: 'calc(100% - 250px)',
  '@media (max-width: 768px)': {
    marginLeft: 0,
    width: '100%',
  }
}));

const getApiBaseUrl = () => {
  const protocol = window.location.protocol === 'https:' ? 'https' : 'http';
  const baseUrl = process.env.REACT_APP_API_BASE_URL.replace(/^https?:\/\//, '');
  return `${protocol}://${baseUrl}`;
};

export const CreateGaji = () => {
  const [tanggal_periode, setTanggalPeriode] = useState('');
  const [periode, setPeriode] = useState('');
  const [nominal, setNominal] = useState('');
  const [tambahan, setTambahan] = useState('');
  const [potongan, setPotongan] = useState('');
  const [keterangan, setKeterangan] = useState('');
  const [karyawan, setKaryawan] = useState(null);
  const [karyawans, setKaryawans] = useState([]);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [showAlert, setShowAlert] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`${getApiBaseUrl()}/karyawan`);
        setKaryawans(response.data.karyawan || []);
      } catch (error) {
        setError('Gagal mengambil data karyawan.');
        setShowAlert(true);
      }
    };
    fetchData();
  }, []);

  const formatRupiah = (value) => {
    // Remove all non-digit characters first
    const numericValue = value.replace(/\D/g, '');
    // Format with thousand separators
    return numericValue.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  };

  // Handle input changes with formatRupiah
  const handleNominalChange = (e) => {
    const formatted = formatRupiah(e.target.value);
    setNominal(formatted);
  };

  const handleTambahanChange = (e) => {
    const formatted = formatRupiah(e.target.value);
    setTambahan(formatted);
  };

  const handlePotonganChange = (e) => {
    const formatted = formatRupiah(e.target.value);
    setPotongan(formatted);
  };

  const calculateTotal = () => {
    const baseNominal = parseFloat(nominal.replace(/\./g, '') || 0);
    const tambahanAmount = parseFloat(tambahan.replace(/\./g, '') || 0);
    const potonganAmount = parseFloat(potongan.replace(/\./g, '') || 0);
    return baseNominal + tambahanAmount - potonganAmount;
  };

  const formatRupiahDisplay = (amount) => {
    return new Intl.NumberFormat('id-ID', { 
      style: 'currency', 
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${getApiBaseUrl()}/creategaji`, {
        tanggal_periode,
        periode,
        nominal: parseFloat(nominal.replace(/\./g, '')),
        tambahan: parseFloat(tambahan.replace(/\./g, '') || 0),
        potongan: parseFloat(potongan.replace(/\./g, '') || 0),
        keterangan,
        id: karyawan?.id,
      });
      setMessage('Gaji berhasil dibuat');
      setShowAlert(true);
      setTimeout(() => navigate('/datagaji'), 1500);
    } catch (error) {
      setError(error.response?.data?.msg || 'Terjadi kesalahan');
      setShowAlert(true);
    }
  };

  return (
    <DashboardContainer>
      <Snackbar 
        open={showAlert && (message || error)} 
        autoHideDuration={6000} 
        onClose={() => setShowAlert(false)}
        TransitionComponent={Fade}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert 
          severity={message ? "success" : "error"} 
          onClose={() => setShowAlert(false)}
          variant="filled"
          elevation={6}
          sx={{ width: '100%' }}
        >
          {message || error}
        </Alert>
      </Snackbar>

      <StyledPaper>
        <FormHeader>
          <Typography variant="h5" fontWeight="bold">Form Penggajian</Typography>
          <Typography variant="body2" sx={{ mt: 1, opacity: 0.9 }}>
            Isi data berikut untuk mencatat gaji karyawan
          </Typography>
        </FormHeader>

        <Box sx={{ p: 4 }}>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={4}>
              <Grid item xs={12} md={8}>
                <Autocomplete
                  options={karyawans}
                  getOptionLabel={(option) => `${option.nama_lengkap} - ${option.Cabang?.nama_cabang || 'Tanpa Cabang'}`}
                  renderInput={(params) => (
                    <TextField 
                      {...params} 
                      label="Pilih Karyawan" 
                      variant="outlined" 
                      required 
                      InputProps={{
                        ...params.InputProps,
                        startAdornment: (
                          <>
                            <InputAdornment position="start">
                              <PersonOutline color="primary" />
                            </InputAdornment>
                            {params.InputProps.startAdornment}
                          </>
                        ),
                      }}
                    />
                  )}
                  onChange={(event, newValue) => setKaryawan(newValue)}
                  renderOption={(props, option) => (
                    <Box component="li" {...props} sx={{ py: 1.5 }}>
                      <Avatar 
                        sx={{ mr: 2, bgcolor: option.id % 5 === 0 ? '#1976d2' : 
                                         option.id % 4 === 0 ? '#9c27b0' : 
                                         option.id % 3 === 0 ? '#4caf50' : 
                                         option.id % 2 === 0 ? '#ff9800' : '#f44336' 
                        }}
                      >
                        {option.nama_lengkap.charAt(0)}
                      </Avatar>
                      <Box>
                        <Typography variant="body1">{option.nama_lengkap}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {option.jabatan} - {option.Cabang?.nama_cabang || 'Tanpa Cabang'}
                        </Typography>
                      </Box>
                    </Box>
                  )}
                />

                <Grid container spacing={3} sx={{ mt: 1 }}>
                  <Grid item xs={12} md={6}>
                    <TextField 
                      fullWidth 
                      label="Tanggal Periode" 
                      type="date" 
                      InputLabelProps={{ shrink: true }} 
                      value={tanggal_periode} 
                      onChange={(e) => setTanggalPeriode(e.target.value)} 
                      required 
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <CalendarMonth color="primary" />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField 
                      fullWidth 
                      select 
                      label="Periode Bulan" 
                      value={periode} 
                      onChange={(e) => setPeriode(e.target.value)} 
                      required
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <EventNote color="primary" />
                          </InputAdornment>
                        ),
                      }}
                    >
                      {['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'].map((bulan) => (
                        <MenuItem key={bulan} value={bulan.toLowerCase()}>{bulan}</MenuItem>
                      ))}
                    </TextField>
                  </Grid>
                </Grid>

                <Divider sx={{ my: 3 }} />

                <Typography variant="h6" sx={{ mb: 2 }}>Informasi Gaji</Typography>
                
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <TextField 
                      fullWidth 
                      label="Nominal Gaji Pokok" 
                      value={nominal} 
                      onChange={handleNominalChange} 
                      required 
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <AttachMoney color="primary" />
                          </InputAdornment>
                        ),
                        endAdornment: <InputAdornment position="end">IDR</InputAdornment>,
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField 
                      fullWidth 
                      label="Tambahan" 
                      value={tambahan} 
                      onChange={handleTambahanChange} 
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <AddCircleOutline style={{ color: '#4caf50' }} />
                          </InputAdornment>
                        ),
                        endAdornment: <InputAdornment position="end">IDR</InputAdornment>,
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField 
                      fullWidth 
                      label="Potongan" 
                      value={potongan} 
                      onChange={handlePotonganChange} 
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <RemoveCircleOutline style={{ color: '#f44336' }} />
                          </InputAdornment>
                        ),
                        endAdornment: <InputAdornment position="end">IDR</InputAdornment>,
                      }}
                    />
                  </Grid>
                </Grid>

                <TextField 
                  fullWidth 
                  label="Keterangan" 
                  multiline 
                  rows={3} 
                  sx={{ mt: 3 }} 
                  value={keterangan} 
                  onChange={(e) => setKeterangan(e.target.value)} 
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start" sx={{ alignSelf: 'flex-start', mt: 1.5 }}>
                        <Notes color="primary" />
                      </InputAdornment>
                    ),
                  }}
                  placeholder="Tambahkan catatan atau keterangan tambahan di sini..."
                />

                <Button 
                  type="submit" 
                  variant="contained" 
                  color="primary" 
                  size="large"
                  sx={{ 
                    mt: 4, 
                    py: 1.5, 
                    px: 4, 
                    borderRadius: 2,
                    boxShadow: '0 4px 10px rgba(25, 118, 210, 0.3)'
                  }}
                >
                  Simpan Data Gaji
                </Button>
              </Grid>

              <Grid item xs={12} md={4}>
                <SummaryCard>
                  <CardContent sx={{ p: 3 }}>
                    <Typography variant="h6" gutterBottom fontWeight="bold">
                      Ringkasan Penggajian
                    </Typography>
                    
                    <Box sx={{ mt: 3 }}>
                      {karyawan ? (
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                          <Avatar 
                            sx={{ 
                              width: 56, 
                              height: 56, 
                              mr: 2,
                              bgcolor: karyawan.id % 5 === 0 ? '#1976d2' : 
                                      karyawan.id % 4 === 0 ? '#9c27b0' : 
                                      karyawan.id % 3 === 0 ? '#4caf50' : 
                                      karyawan.id % 2 === 0 ? '#ff9800' : '#f44336'
                            }}
                          >
                            {karyawan.nama_lengkap?.charAt(0)}
                          </Avatar>
                          <Box>
                            <Typography variant="subtitle1" fontWeight="bold">
                              {karyawan.nama_lengkap}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {karyawan.jabatan}
                            </Typography>
                            <Chip 
                              size="small" 
                              label={karyawan.Cabang?.nama_cabang || 'Tanpa Cabang'} 
                              sx={{ mt: 0.5, borderRadius: 1 }}
                              variant="outlined"
                              color="primary"
                            />
                          </Box>
                        </Box>
                      ) : (
                        <Box sx={{ p: 2, textAlign: 'center', color: 'text.secondary' }}>
                          <PersonOutline sx={{ fontSize: 40, opacity: 0.5, mb: 1 }} />
                          <Typography>Pilih karyawan terlebih dahulu</Typography>
                        </Box>
                      )}
                    </Box>

                    {(nominal || tambahan || potongan) && (
                      <>
                        <Divider sx={{ my: 2 }} />
                        
                        <Box sx={{ mt: 3 }}>
                          <Stack spacing={2}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                              <Typography variant="body2" color="text.secondary">Periode:</Typography>
                              <Typography variant="body2" fontWeight="medium">
                                {periode ? periode.charAt(0).toUpperCase() + periode.slice(1) : '-'} {tanggal_periode ? new Date(tanggal_periode).getFullYear() : ''}
                              </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                              <Typography variant="body2" color="text.secondary">Tanggal:</Typography>
                              <Typography variant="body2" fontWeight="medium">
                                {tanggal_periode ? new Date(tanggal_periode).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '-'}
                              </Typography>
                            </Box>
                          </Stack>
                        </Box>

                        <CalculationBox>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
                            <Typography variant="body2">Gaji Pokok</Typography>
                            <Typography variant="body2" fontWeight="bold">
                              {nominal ? formatRupiahDisplay(parseFloat(nominal.replace(/\./g, ''))) : 'Rp 0'}
                            </Typography>
                          </Box>
                          
                          {tambahan && parseFloat(tambahan.replace(/\./g, '')) > 0 && (
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <Typography variant="body2">Tambahan</Typography>
                                <SalaryChip 
                                  size="small" 
                                  label="+" 
                                  type="tambahan"
                                  sx={{ ml: 1, height: 20, width: 20, '& .MuiChip-label': { p: 0 } }}
                                />
                              </Box>
                              <Typography variant="body2" color="success.main" fontWeight="bold">
                                {formatRupiahDisplay(parseFloat(tambahan.replace(/\./g, '')))}
                              </Typography>
                            </Box>
                          )}
                          
                          {potongan && parseFloat(potongan.replace(/\./g, '')) > 0 && (
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <Typography variant="body2">Potongan</Typography>
                                <SalaryChip 
                                  size="small" 
                                  label="-" 
                                  type="potongan"
                                  sx={{ ml: 1, height: 20, width: 20, '& .MuiChip-label': { p: 0 } }}
                                />
                              </Box>
                              <Typography variant="body2" color="error.main" fontWeight="bold">
                                {formatRupiahDisplay(parseFloat(potongan.replace(/\./g, '')))}
                              </Typography>
                            </Box>
                          )}
                          
                          <Divider sx={{ my: 1.5 }} />
                          
                          <TotalAmount>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <CalculateOutlined sx={{ mr: 1 }} />
                              <Typography variant="subtitle2">Total Gaji</Typography>
                            </Box>
                            <Typography variant="subtitle1" fontWeight="bold">
                              {formatRupiahDisplay(calculateTotal())}
                            </Typography>
                          </TotalAmount>
                        </CalculationBox>
                      </>
                    )}
                  </CardContent>
                </SummaryCard>
              </Grid>
            </Grid>
          </form>
        </Box>
      </StyledPaper>
    </DashboardContainer>
  );
};

export default CreateGaji;