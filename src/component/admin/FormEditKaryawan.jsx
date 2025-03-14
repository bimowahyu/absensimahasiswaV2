import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import Swal from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';
import { 
  Container, 
  TextField, 
  Button, 
  Card, 
  CardContent, 
  CardMedia, 
  MenuItem, 
  Typography, 
  Grid, 
  Box, 
  Paper, 
  Divider,
  Avatar,
  IconButton,
  InputAdornment,
  Chip
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { 
  Person, 
  BusinessCenter, 
  Phone, 
  Store, 
  Lock, 
  CloudUpload,
  ArrowBack
} from '@mui/icons-material';

const VisuallyHiddenInput = styled('input')({
  clip: 'rect(0 0 0 0)',
  clipPath: 'inset(50%)',
  height: 1,
  overflow: 'hidden',
  position: 'absolute',
  bottom: 0,
  left: 0,
  whiteSpace: 'nowrap',
  width: 1,
});
const DashboardContainer = styled(Box)`
 
  margin-left: 250px; /* Width of your sidebar */
  width: calc(100% - 250px);
  
  @media (max-width: 768px) {
    margin-left: 0;
    width: 100%;
  }
`;

const StyledCard = styled(Card)(({ theme }) => ({
  borderRadius: 16,
  boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  position: 'relative',
  overflow: 'visible',
  transition: 'transform 0.3s ease-in-out',
  '&:hover': {
    transform: 'translateY(-5px)',
  },
}));

const AvatarWrapper = styled(Box)(({ theme }) => ({
  position: 'relative',
  marginTop: theme.spacing(2),
  display: 'flex',
  justifyContent: 'center',
}));

const StyledAvatar = styled(Avatar)(({ theme }) => ({
  width: 120,
  height: 120,
  border: `4px solid ${theme.palette.background.paper}`,
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
}));

const CardHeader = styled(Box)(({ theme }) => ({
  textAlign: 'center',
  padding: theme.spacing(2, 2, 0, 2),
}));

const StyledChip = styled(Chip)(({ theme }) => ({
  margin: theme.spacing(0.5),
  fontWeight: 600,
}));

const getApiBaseUrl = () => {
  const protocol = window.location.protocol === 'https:' ? 'https' : 'http';
  const baseUrl = process.env.REACT_APP_API_BASE_URL.replace(/^https?:\/\//, '');
  return `${protocol}://${baseUrl}`;
};

export const FormEditKaryawan = () => {
  const [namaLengkap, setNamaLengkap] = useState('');
  const [username, setUsername] = useState('');
  const [jabatan, setJabatan] = useState('');
  const [noTelp, setNoTelp] = useState('');
  const [avatar, setAvatar] = useState(null);
  const [password, setPassword] = useState('');
  const [cabangId, setCabangId] = useState('');
  const [cabangs, setCabangs] = useState([]);
  const [message, setMessage] = useState('');
  const [preview, setPreview] = useState('');
  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    const getKaryawanById = async () => {
      try {
        const response = await axios.get(`${getApiBaseUrl()}/karyawan/${id}`, { withCredentials: true });
        setNamaLengkap(response.data.nama_lengkap);
        setUsername(response.data.username);
        setJabatan(response.data.jabatan);
        setNoTelp(response.data.no_telp);
        setCabangId(response.data.CabangId);
        setAvatar(response.data.avatar);
        if (response.data.avatar) {
          setPreview(`${getApiBaseUrl()}/uploads/karyawan/${response.data.avatar}`);
        }
      } catch (error) {
        setMessage(error.response?.data?.msg || 'Error fetching data');
      }
    };
    getKaryawanById();
  }, [id]);

  useEffect(() => {
    const fetchCabangs = async () => {
      try {
        const response = await axios.get(`${getApiBaseUrl()}/cabang`, { withCredentials: true });
        setCabangs(response.data);
      } catch (error) {
        console.error(error);
      }
    };
    fetchCabangs();
  }, []);

  const updateKaryawan = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append('username', username);
      formData.append('nama_lengkap', namaLengkap);
      formData.append('jabatan', jabatan);
      formData.append('no_telp', noTelp);
      formData.append('password', password);
      formData.append('CabangId', cabangId);
      if (avatar) formData.append('file', avatar);

      await axios.put(`${getApiBaseUrl()}/karyawan/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        withCredentials: true
      });
      
      Swal.fire({
        icon: 'success',
        title: 'Berhasil!',
        text: 'Data karyawan berhasil diperbarui',
        showConfirmButton: false,
        timer: 1500
      });
      
      navigate('/datakaryawan');
    } catch (error) {
      if (error.response?.data?.msg === 'Username sudah digunakan') {
        Swal.fire({ 
          icon: 'error', 
          title: 'Peringatan', 
          text: 'Username sudah digunakan!' 
        });
      } else {
        setMessage(error.response?.data?.msg || 'Terjadi kesalahan saat memperbarui karyawan');
      }
    }
  };

  const loadImage = (e) => {
    const image = e.target.files[0];
    setAvatar(image);
    setPreview(URL.createObjectURL(image));
  };

  const cabangName = cabangs.find(cabang => cabang.id === cabangId)?.nama_cabang || 'Cabang tidak ditemukan';
  
  return (
    <DashboardContainer>
      <Paper elevation={0} sx={{ borderRadius: 3, overflow: 'hidden', bgcolor: '#f8fafc' }}>
        <Box sx={{ p: 2, bgcolor: '#1976d2', color: 'white' }}>
          <Typography variant="h6">Informasi Karyawan</Typography>
        </Box>
        <Box sx={{ p: 3 }}>
          <Grid container spacing={4}>
            <Grid item xs={12} md={8}>
              <form onSubmit={updateKaryawan}>
                {message && (
                  <Box sx={{ mb: 2, p: 2, bgcolor: '#ffebee', borderRadius: 1 }}>
                    <Typography color="error">{message}</Typography>
                  </Box>
                )}
                
                <TextField
                  fullWidth
                  label="Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  margin="normal"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Person color="primary" />
                      </InputAdornment>
                    ),
                  }}
                  required
                />
                
                <TextField
                  fullWidth
                  label="Nama Lengkap"
                  value={namaLengkap}
                  onChange={(e) => setNamaLengkap(e.target.value)}
                  margin="normal"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Person color="primary" />
                      </InputAdornment>
                    ),
                  }}
                  required
                />
                
                <TextField
                  fullWidth
                  label="Jabatan"
                  value={jabatan}
                  onChange={(e) => setJabatan(e.target.value)}
                  margin="normal"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <BusinessCenter color="primary" />
                      </InputAdornment>
                    ),
                  }}
                  required
                />
                
                <TextField
                  fullWidth
                  select
                  label="Pilih Cabang"
                  value={cabangId}
                  onChange={(e) => setCabangId(e.target.value)}
                  margin="normal"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Store color="primary" />
                      </InputAdornment>
                    ),
                  }}
                  required
                >
                  {cabangs.map((cabang) => (
                    <MenuItem key={cabang.id} value={cabang.id}>{cabang.nama_cabang}</MenuItem>
                  ))}
                </TextField>
                
                <TextField
                  fullWidth
                  label="Nomor Telepon"
                  type="number"
                  value={noTelp}
                  onChange={(e) => setNoTelp(e.target.value)}
                  margin="normal"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Phone color="primary" />
                      </InputAdornment>
                    ),
                  }}
                  required
                />
                
                <TextField
                  fullWidth
                  label="Password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  margin="normal"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Lock color="primary" />
                      </InputAdornment>
                    ),
                  }}
                  helperText="Biarkan kosong jika tidak ingin mengubah password"
                />
                
                <Box sx={{ mt: 3, mb: 3 }}>
                  <Button
                    component="label"
                    variant="outlined"
                    startIcon={<CloudUpload />}
                    sx={{ mb: 2 }}
                  >
                    Upload Foto
                    <VisuallyHiddenInput type="file" accept="image/*" onChange={loadImage} />
                  </Button>
                  
                  {preview && (
                    <Box sx={{ mt: 2, display: 'flex', alignItems: 'center' }}>
                      <Avatar src={preview} sx={{ width: 60, height: 60, mr: 2 }} />
                      <Typography variant="body2" color="text.secondary">
                        Foto baru telah dipilih
                      </Typography>
                    </Box>
                  )}
                </Box>
                
                <Box sx={{ mt: 4, display: 'flex', gap: 2 }}>
                  <Button 
                    variant="contained" 
                    color="primary" 
                    type="submit" 
                    size="large"
                    sx={{ 
                      px: 4,
                      borderRadius: 2,
                      boxShadow: '0 4px 10px rgba(25, 118, 210, 0.3)'
                    }}
                  >
                    Simpan Perubahan
                  </Button>
                  
                  <Button 
                    variant="outlined" 
                    onClick={() => navigate('/datakaryawan')}
                    size="large"
                    sx={{ borderRadius: 2 }}
                  >
                    Batal
                  </Button>
                </Box>
              </form>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <StyledCard>
                <CardHeader>
                  <AvatarWrapper>
                    <StyledAvatar
                      src={preview || (avatar ? `${getApiBaseUrl()}/uploads/karyawan/${avatar}` : '')}
                      alt={namaLengkap}
                    />
                  </AvatarWrapper>
                </CardHeader>
                
                <CardContent sx={{ p: 3, flexGrow: 1, mt: 2 }}>
                  <Typography variant="h5" fontWeight="bold" align="center" gutterBottom>
                    {namaLengkap || 'Nama Karyawan'}
                  </Typography>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                    <StyledChip
                      label={jabatan || 'Jabatan'}
                      color="primary"
                      variant="outlined"
                    />
                  </Box>
                  
                  <Divider sx={{ my: 2 }} />
                  
                  <Box sx={{ mt: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                      <Person fontSize="small" color="primary" sx={{ mr: 1.5 }} />
                      <Typography variant="body1">{username || 'username'}</Typography>
                    </Box>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                      <Store fontSize="small" color="primary" sx={{ mr: 1.5 }} />
                      <Typography variant="body1">{cabangName}</Typography>
                    </Box>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                      <Phone fontSize="small" color="primary" sx={{ mr: 1.5 }} />
                      <Typography variant="body1">{noTelp || '-'}</Typography>
                    </Box>
                  </Box>
                  
                  <Box sx={{ mt: 3, bgcolor: '#f0f7ff', borderRadius: 2, p: 2 }}>
                    <Typography variant="subtitle2" color="text.secondary" align="center">
                      ID Karyawan: #{id}
                    </Typography>
                  </Box>
                </CardContent>
              </StyledCard>
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </DashboardContainer>
  );
};