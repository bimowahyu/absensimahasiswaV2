import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import axios from 'axios';
import jsPDF from 'jspdf';
import Swal from 'sweetalert2';
import useSWR, { mutate } from 'swr';

import {
  Container,
  Card,
  CardContent,
  Typography,
  Grid,
  Button,
  Modal,
  Box,
  CircularProgress,
  Alert,
  Chip,
  Divider,
  Paper,
  IconButton,
  Stack,
  Fade,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  Download as DownloadIcon,
  CheckCircle as CheckCircleIcon,
  ArrowBack as ArrowBackIcon,
  Visibility as VisibilityIcon
} from '@mui/icons-material';

const getApiBaseUrl = () => {
  const protocol = window.location.protocol === 'https:' ? 'https' : 'http';
  const baseUrl = process.env.REACT_APP_API_BASE_URL.replace(/^https?:\/\//, '');
  return `${protocol}://${baseUrl}`;
};

// Fungsi fetcher untuk useSWR
const fetcher = (url) => axios.get(url, { withCredentials: true }).then((res) => res.data);

export const ConfirmGaji = () => {
  const navigate = useNavigate();
  const [selectedGaji, setSelectedGaji] = useState(null);
  const [open, setOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Menggunakan useSWR untuk fetch data
  const { data: gajiList, error, isLoading } = useSWR(
    `${getApiBaseUrl()}/getgaji`,
    fetcher,
    {
      onSuccess: (data) => data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    }
  );

  const handleOpenModal = async (id) => {
    try {
      const response = await axios.get(`${getApiBaseUrl()}/getgajibyid/${id}`, { withCredentials: true });
      setSelectedGaji(response.data);
      setOpen(true);
    } catch (error) {
      if (error.response && error.response.status === 401) {
        console.error("Unauthorized access. Redirecting to login...");
        navigate('/login');
      } else {
        console.error("Gagal mengambil detail slip gaji:", error);
        Swal.fire({
          title: 'Error!',
          text: 'Gagal mengambil detail slip gaji. Silakan coba lagi nanti.',
          icon: 'error',
          confirmButtonText: 'OK'
        });
      }
    }
  };

  const handleCloseModal = () => setOpen(false);

  const confirmGaji = async () => {
    if (!selectedGaji) return;

    setOpen(false);

    try {
      const result = await Swal.fire({
        title: 'Konfirmasi Terima Gaji',
        text: 'Apakah Anda yakin ingin menerima slip gaji ini?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Ya, Terima',
        cancelButtonText: 'Batal',
        position: 'top'
      });

      if (result.isConfirmed) {
        await axios.put(`${getApiBaseUrl()}/updategajibykaryawan/${selectedGaji.id}`, {
          status: 'diterima'
        }, { withCredentials: true });

        Swal.fire({
          title: 'Berhasil!',
          text: 'Slip gaji telah diterima.',
          icon: 'success',
          confirmButtonText: 'OK',
          position: 'top'
        });
        mutate(`${getApiBaseUrl()}/getgaji`);
      }
    } catch (error) {
      console.error("Gagal memperbarui status gaji:", error);
      Swal.fire({
        title: 'Gagal!',
        text: 'Gagal memperbarui status gaji. Silakan coba lagi nanti.',
        icon: 'error',
        confirmButtonText: 'OK',
        position: 'top'
      });
    }
  };

  const downloadPDF = () => {
    if (!selectedGaji) return;

    const doc = new jsPDF();
    const rightAlignX = 160;
    const leftAlignX = 10;

    // Header Slip Gaji PT. BR Solusindo
    doc.setFontSize(16);
    doc.text('Slip Gaji PT. Apalah', 105, 20, null, null, 'center');
    doc.setFontSize(12);
    doc.text('==========================================', 105, 25, null, null, 'center');
    // Detail Slip Gaji
    doc.setFontSize(12);
    doc.text('Detail Slip Gaji', leftAlignX, 40);

    const formattedDate = new Date(selectedGaji.tanggal_periode).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });

    // Teks dan data sejajar
    doc.text('Nama:', leftAlignX, 50);
    doc.text(selectedGaji.Karyawan?.nama_lengkap || 'Data tidak tersedia', rightAlignX, 50, null, null, 'right');

    doc.text('Cabang:', leftAlignX, 60);
    doc.text(selectedGaji.Karyawan?.Cabang?.nama_cabang || 'Data tidak tersedia', rightAlignX, 60, null, null, 'right');

    doc.text('Tanggal:', leftAlignX, 70);
    doc.text(formattedDate, rightAlignX, 70, null, null, 'right');

    doc.text('Nominal:', leftAlignX, 80);
    doc.text(formatRupiah(selectedGaji.nominal), rightAlignX, 80, null, null, 'right');

    doc.text('Tambahan:', leftAlignX, 90);
    doc.text(formatRupiah(selectedGaji.tambahan), rightAlignX, 90, null, null, 'right');

    doc.text('Potongan:', leftAlignX, 100);
    doc.text(formatRupiah(selectedGaji.potongan), rightAlignX, 100, null, null, 'right');

    doc.text('Jumlah:', leftAlignX, 110);
    doc.text(formatRupiah(selectedGaji.jumlah), rightAlignX, 110, null, null, 'right');

    doc.text('Status:', leftAlignX, 120);
    doc.text(selectedGaji.status, rightAlignX, 120, null, null, 'right');

    // Footer
    doc.text('==========================================', 105, 130, null, null, 'center');
    doc.text('Terima Kasih atas kerja keras Anda!', 105, 135, null, null, 'center');

    // Save the PDF
    doc.save(`Slip_Gaji_PT_BRSolusindo_${selectedGaji.Karyawan?.nama_lengkap || 'Data'}_${formattedDate}.pdf`);
  };

  const formatRupiah = (number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(number);
  };

  const getStatusChip = (status) => {
    let color = 'default';
    
    switch(status.toLowerCase()) {
      case 'diterima':
        color = 'success';
        break;
      case 'pending':
        color = 'warning';
        break;
      case 'ditolak':
        color = 'error';
        break;
      default:
        color = 'default';
    }
    
    return <Chip 
      label={status} 
      color={color} 
      size="small" 
      variant="filled"
      sx={{ fontWeight: 'medium' }}
    />;
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert 
        severity="error" 
        sx={{ 
          maxWidth: 600, 
          mx: 'auto', 
          mt: 4,
          borderRadius: 2,
          boxShadow: 2
        }}
      >
        Gagal mengambil data. Silakan coba lagi nanti.
      </Alert>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper 
        elevation={0}
        sx={{ 
          p: 3, 
          mb: 4, 
          borderRadius: 2,
          bgcolor: 'primary.light',
          color: 'primary.contrastText'
        }}
      >
        <Typography variant="h5" fontWeight="bold" mb={1}>
          Daftar Slip Gaji
        </Typography>
        <Typography variant="body2">
          Berikut adalah daftar slip gaji yang tersedia. Silakan periksa dan konfirmasi penerimaan slip gaji Anda.
        </Typography>
      </Paper>

      {gajiList?.length > 0 ? (
        <Stack spacing={2}>
          {gajiList.map((gaji) => (
            <Card 
              key={gaji.id} 
              sx={{ 
                borderRadius: 2,
                boxShadow: 2,
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 4
                }
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={8}>
                    <Typography variant="h6" fontWeight="medium" gutterBottom>
                      {gaji.Karyawan?.nama_lengkap || 'Data tidak tersedia'}
                    </Typography>
                    
                    <Grid container spacing={2} sx={{ mt: 1 }}>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">Periode</Typography>
                        <Typography variant="body1">{gaji.periode}</Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">Tanggal</Typography>
                        <Typography variant="body1">{new Date(gaji.tanggal_periode).toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' })}</Typography>
                      </Grid>
                    </Grid>
                  </Grid>
                  
                  <Grid item xs={12} sm={4}>
                    <Box sx={{ 
                      display: 'flex', 
                      flexDirection: 'column', 
                      alignItems: { xs: 'flex-start', sm: 'flex-end' }, 
                      height: '100%',
                      justifyContent: 'space-between'
                    }}>
                      <Box>
                        <Typography variant="body2" color="text.secondary" sx={{ textAlign: { xs: 'left', sm: 'right' } }}>Jumlah</Typography>
                        <Typography variant="h6" fontWeight="medium" sx={{ textAlign: { xs: 'left', sm: 'right' } }}>
                          {formatRupiah(gaji.jumlah)}
                        </Typography>
                      </Box>
                      
                      <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', alignItems: { xs: 'flex-start', sm: 'flex-end' } }}>
                        <Typography variant="body2" color="text.secondary" mb={0.5} sx={{ textAlign: { xs: 'left', sm: 'right' } }}>Status</Typography>
                        {getStatusChip(gaji.status)}
                      </Box>
                    </Box>
                  </Grid>
                </Grid>
                
                <Divider sx={{ my: 2 }} />
                
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => handleOpenModal(gaji.id)}
                  startIcon={<VisibilityIcon />}
                  sx={{ 
                    borderRadius: 6,
                    px: 3,
                    boxShadow: 2
                  }}
                >
                  Lihat Detail & Konfirmasi
                </Button>
              </CardContent>
            </Card>
          ))}
        </Stack>
      ) : (
        <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 2 }}>
          <Typography variant="body1">Data gaji tidak ditemukan.</Typography>
        </Paper>
      )}

      <Button 
        component={NavLink} 
        to="/dashboard" 
        variant="outlined" 
        startIcon={<ArrowBackIcon />}
        sx={{ 
          mt: 4,
          borderRadius: 6,
          px: 3
        }}
      >
        Kembali ke Dashboard
      </Button>

      <Modal 
        open={open} 
        onClose={handleCloseModal}
        closeAfterTransition
      >
        <Fade in={open}>
          <Box sx={{ 
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: isMobile ? '90%' : 500,
            bgcolor: 'background.paper',
            borderRadius: 3,
            boxShadow: 24,
            p: 4,
            maxHeight: '90vh',
            overflow: 'auto'
          }}>
            {selectedGaji ? (
              <>
                <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Typography variant="h5" fontWeight="bold">Detail Slip Gaji</Typography>
                  {getStatusChip(selectedGaji.status)}
                </Box>
                
                <Divider sx={{ mb: 3 }} />
                
                <Grid container spacing={2.5}>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">Nama</Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {selectedGaji.Karyawan?.nama_lengkap || 'Data tidak tersedia'}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">Cabang</Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {selectedGaji.Karyawan?.Cabang?.nama_cabang || 'Data tidak tersedia'}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">Periode</Typography>
                    <Typography variant="body1" fontWeight="medium">{selectedGaji.periode}</Typography>
                  </Grid>
                  
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">Tanggal</Typography>
                    <Typography variant="body1" fontWeight="medium">{
                      new Date(selectedGaji.tanggal_periode).toLocaleDateString('id-ID', { 
                        day: '2-digit', 
                        month: '2-digit', 
                        year: 'numeric' 
                      })
                    }</Typography>
                  </Grid>
                </Grid>
                
                <Paper 
                  sx={{ 
                    mt: 3, 
                    p: 2.5, 
                    borderRadius: 2,
                    bgcolor: 'grey.50'
                  }}
                >
                  <Typography variant="subtitle2" color="text.secondary" mb={2}>Rincian Pendapatan</Typography>
                  
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">Nominal</Typography>
                      <Typography variant="body1" fontWeight="medium">{formatRupiah(selectedGaji.nominal)}</Typography>
                    </Grid>
                    
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">Tambahan</Typography>
                      <Typography variant="body1" fontWeight="medium" color={selectedGaji.tambahan > 0 ? 'success.main' : 'text.primary'}>
                        {formatRupiah(selectedGaji.tambahan)}
                      </Typography>
                    </Grid>
                    
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">Potongan</Typography>
                      <Typography variant="body1" fontWeight="medium" color={selectedGaji.potongan > 0 ? 'error.main' : 'text.primary'}>
                        {formatRupiah(selectedGaji.potongan)}
                      </Typography>
                    </Grid>
                    
                    <Grid item xs={12}>
                      <Divider sx={{ my: 1.5 }} />
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="subtitle1" fontWeight="bold">Total Diterima</Typography>
                        <Typography variant="h6" fontWeight="bold" color="primary.main">
                          {formatRupiah(selectedGaji.jumlah)}
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </Paper>
                
                <Box sx={{ mt: 4, display: 'flex', gap: 2, justifyContent: 'space-between' }}>
                  <Button 
                    variant="contained" 
                    color="primary" 
                    onClick={confirmGaji}
                    disabled={selectedGaji.status.toLowerCase() === 'diterima'}
                    startIcon={<CheckCircleIcon />}
                    sx={{ 
                      borderRadius: 6,
                      px: 3,
                      flex: 1
                    }}
                  >
                    {selectedGaji.status.toLowerCase() === 'diterima' ? 'Sudah Diterima' : 'Terima Gaji'}
                  </Button>
                  
                  <Button 
                    variant="outlined" 
                    onClick={downloadPDF} 
                    startIcon={<DownloadIcon />}
                    sx={{ 
                      borderRadius: 6,
                      px: 3
                    }}
                  >
                    Download PDF
                  </Button>
                </Box>
              </>
            ) : (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                <CircularProgress />
              </Box>
            )}
          </Box>
        </Fade>
      </Modal>
    </Container>
  );
};