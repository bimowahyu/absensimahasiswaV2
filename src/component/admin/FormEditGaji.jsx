import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  Box, 
  Container, 
  Paper, 
  Typography, 
  TextField, 
  Button, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  Grid, 
  Alert, 
  Snackbar, 
  InputAdornment,
  CircularProgress,
  Card,
  CardContent,
  CardHeader,
  Divider
} from '@mui/material';
import { 
  CalendarMonth, 
  AttachMoney, 
  PersonOutline, 
  Notes, 
  Save
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';

const getApiBaseUrl = () => {
  const protocol = window.location.protocol === 'https:' ? 'https' : 'http';
  const baseUrl = process.env.REACT_APP_API_BASE_URL.replace(/^https?:\/\//, '');
  return `${protocol}://${baseUrl}`;
};
const DashboardContainer = styled(Box)`
margin-left: 250px; /* Width of your sidebar */
width: calc(100% - 250px);

@media (max-width: 768px) {
  margin-left: 0;
  width: 100%;
}
`;
export const FormEditGaji = () => {
  const [tanggal_periode, setTanggalPeriode] = useState('');
  const [periode, setPeriode] = useState('');
  const [nominal, setNominal] = useState('');
  const [tambahan, setTambahan] = useState('');
  const [potongan, setPotongan] = useState('');
  const [keterangan, setKeterangan] = useState('');
  const [KaryawanId, setKaryawanId] = useState('');
  const [karyawans, setKaryawans] = useState([]);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  
  const navigate = useNavigate();
  const { id: gajiId } = useParams();
  
  // Format number with thousand separators
  const formatWithSeparator = (value) => {
    if (value === null || value === undefined || value === '') return '';
    return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  };

  // Parse formatted number back to number
  const parseFormattedNumber = (formattedValue) => {
    if (!formattedValue) return 0;
    return parseFloat(formattedValue.replace(/\./g, ''));
  };

  // Improved handler for formatted number inputs
  const handleFormattedNumberInput = (e, setValue) => {
    const input = e.target;
    const cursorPosition = input.selectionStart;
    
    // Get the value without separators
    const valueWithoutSeparators = input.value.replace(/\./g, '');
    
    // Only allow numeric input
    if (!/^\d*$/.test(valueWithoutSeparators)) {
      return;
    }
    
    // Format with separators
    const formattedValue = formatWithSeparator(valueWithoutSeparators);
    
    // Count digits before cursor in original value
    const digitsBeforeCursor = input.value.substring(0, cursorPosition).replace(/\./g, '').length;
    
    // Update state
    setValue(formattedValue);
    
    // Restore cursor position
    setTimeout(() => {
      // Find the position in the new formatted string that corresponds to the same number of digits
      let newPosition = 0;
      let digitCount = 0;
      
      for (let i = 0; i < formattedValue.length; i++) {
        if (formattedValue[i] !== '.') {
          digitCount++;
        }
        if (digitCount > digitsBeforeCursor) {
          break;
        }
        newPosition = i + 1;
      }
      
      input.setSelectionRange(newPosition, newPosition);
    }, 0);
  };

  // Handlers for each numeric field
  const handleNominalChange = (e) => handleFormattedNumberInput(e, setNominal);
  const handleTambahanChange = (e) => handleFormattedNumberInput(e, setTambahan);
  const handlePotonganChange = (e) => handleFormattedNumberInput(e, setPotongan);

  useEffect(() => {
    const fetchKaryawan = async () => {
      try {
        const response = await axios.get(`${getApiBaseUrl()}/karyawan`, { withCredentials: true });
        setKaryawans(response.data.karyawan || []);
      } catch (error) {
        console.error("Error fetching karyawan:", error);
        setError('Gagal mengambil data karyawan.');
      }
    };
    fetchKaryawan();
  }, []);

  useEffect(() => {
    const fetchGaji = async () => {
      try {
        setInitialLoading(true);
        console.log("Fetching gaji with ID:", gajiId);
        const response = await axios.get(`${getApiBaseUrl()}/getgajibyidadmin/${gajiId}`, { withCredentials: true });
        console.log("Data gaji yang diterima:", response.data);
        
        const gaji = response.data;
        
        // Set form values from API response
        setTanggalPeriode(gaji.tanggal_periode || '');
        setPeriode(gaji.periode || '');
        setNominal(formatWithSeparator(gaji.nominal));
        setTambahan(formatWithSeparator(gaji.tambahan));
        setPotongan(formatWithSeparator(gaji.potongan));
        setKeterangan(gaji.keterangan || '');
        setKaryawanId(gaji.KaryawanId || '');
      } catch (error) {
        console.error("Error fetching gaji:", error);
        setError('Gagal memuat data gaji.');
      } finally {
        setInitialLoading(false);
      }
    };
    
    if (gajiId) {
      fetchGaji();
    }
  }, [gajiId]);

  const handleSnackbarClose = () => {
    setOpenSnackbar(false);
  };

  const updateGaji = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    // Parse numeric values
    const nominalNumber = parseFormattedNumber(nominal);
    const tambahanNumber = parseFormattedNumber(tambahan);
    const potonganNumber = parseFormattedNumber(potongan);

    const data = {
      tanggal_periode,
      periode,
      nominal: nominalNumber,
      tambahan: tambahanNumber,
      potongan: potonganNumber,
      keterangan,
      KaryawanId
    };

    console.log("Sending data to update:", data);

    try {
      const response = await axios.put(`${getApiBaseUrl()}/updategajibyadmin/${gajiId}`, data, { withCredentials: true });
      console.log("Update response:", response.data);
      setMessage('Gaji berhasil diupdate.');
      setOpenSnackbar(true);
      setTimeout(() => {
        navigate('/datagaji');
      }, 1500);
    } catch (error) {
      console.error("Error updating gaji:", error);
      setError(error.response?.data?.msg || 'Terjadi kesalahan saat update.');
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ ml: 2 }}>Memuat data...</Typography>
      </Box>
    );
  }

  const months = [
    "januari", "februari", "maret", "april", "mei", "juni", 
    "juli", "agustus", "september", "oktober", "november", "desember"
  ];
  
 
  
  return (
    <DashboardContainer>
      <Card elevation={3}>
        <CardHeader 
          title="Edit Data Gaji Karyawan" 
          titleTypographyProps={{ variant: 'h5', align: 'center', fontWeight: 'medium' }}
          sx={{ bgcolor: 'primary.main', color: 'white', py: 2 }}
        />
        <CardContent sx={{ p: 3 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}
          
          <Box component="form" onSubmit={updateGaji}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <FormControl fullWidth variant="outlined">
                  <InputLabel id="karyawan-label">Karyawan</InputLabel>
                  <Select
                    labelId="karyawan-label"
                    value={KaryawanId}
                    onChange={(e) => setKaryawanId(e.target.value)}
                    label="Karyawan"
                    required
                    startAdornment={
                      <InputAdornment position="start">
                        <PersonOutline />
                      </InputAdornment>
                    }
                  >
                    <MenuItem value="">Pilih Karyawan</MenuItem>
                    {karyawans.map((karyawan) => (
                      <MenuItem key={karyawan.id} value={karyawan.id}>
                        {karyawan.nama_lengkap}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Tanggal Periode"
                  type="date"
                  value={tanggal_periode}
                  onChange={(e) => setTanggalPeriode(e.target.value)}
                  required
                  InputLabelProps={{ shrink: true }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <CalendarMonth />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth variant="outlined">
                  <InputLabel id="periode-label">Periode</InputLabel>
                  <Select
                    labelId="periode-label"
                    value={periode}
                    onChange={(e) => setPeriode(e.target.value)}
                    label="Periode"
                    required
                  >
                    <MenuItem value="">Pilih Periode</MenuItem>
                    {months.map((bulan, index) => (
                      <MenuItem key={index} value={bulan}>
                        {bulan.charAt(0).toUpperCase() + bulan.slice(1)}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12}>
                <Divider sx={{ my: 1 }}>
                  <Typography variant="body2" color="textSecondary">
                    Detail Nominal
                  </Typography>
                </Divider>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Nominal Gaji Pokok"
                  value={nominal}
                  onChange={handleNominalChange}
                  required
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <AttachMoney />
                      </InputAdornment>
                    ),
                    inputProps: { 
                      style: { textAlign: 'right' } 
                    }
                  }}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Tambahan"
                  value={tambahan}
                  onChange={handleTambahanChange}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <AttachMoney />
                      </InputAdornment>
                    ),
                    inputProps: { 
                      style: { textAlign: 'right' } 
                    }
                  }}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Potongan"
                  value={potongan}
                  onChange={handlePotonganChange}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <AttachMoney />
                      </InputAdornment>
                    ),
                    inputProps: { 
                      style: { textAlign: 'right' } 
                    }
                  }}
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Keterangan"
                  multiline
                  rows={3}
                  value={keterangan}
                  onChange={(e) => setKeterangan(e.target.value)}
                  placeholder="Tambahkan keterangan jika diperlukan"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start" sx={{ alignSelf: 'flex-start', mt: 1.5 }}>
                        <Notes />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                  <Button
                    variant="outlined"
                    color="secondary"
                    onClick={() => navigate('/datagaji')}
                    sx={{ px: 3 }}
                  >
                    Batal
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    disabled={loading}
                    startIcon={loading ? <CircularProgress size={20} /> : <Save />}
                    sx={{ px: 4 }}
                  >
                    {loading ? 'Menyimpan...' : 'Simpan Perubahan'}
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </Box>
        </CardContent>
      </Card>
      
      <Snackbar
        open={openSnackbar}
        autoHideDuration={3000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={handleSnackbarClose} severity="success" sx={{ width: '100%' }}>
          {message}
        </Alert>
      </Snackbar>
    </DashboardContainer>
  );
};