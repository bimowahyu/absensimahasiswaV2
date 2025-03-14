import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import useSWR from 'swr';
import { Box, Container, Grid, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Select, MenuItem, Typography, Button } from '@mui/material';
import { styled } from '@mui/system';
import ResizeObserver from 'resize-observer-polyfill';

axios.defaults.withCredentials = true;
const DashboardContainer = styled(Box)({
  padding: '2rem 1rem',
  marginLeft: 250,
  width: 'calc(100% - 250px)',
  '@media (max-width: 768px)': {
    marginLeft: 0,
    width: '100%',
  },
});

const getApiBaseUrl = () => {
  const protocol = window.location.protocol === 'https:' ? 'https' : 'http';
  const baseUrl = process.env.REACT_APP_API_BASE_URL.replace(/^https?:\/\//, '');
  return `${protocol}://${baseUrl}`;
};

const fetcher = (url) => axios.get(url).then((res) => res.data);

const formatRupiah = (angka) => {
  if (angka == null) return 'Rp0';
  return 'Rp' + angka.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
};


export const Datagaji = () => {
  const [selectedPeriode, setSelectedPeriode] = useState('');
  const { data: gaji, error, mutate } = useSWR(`${getApiBaseUrl()}/getgajiall`, fetcher);
  const scrollContainerRef = useRef(null);

  useEffect(() => {
    const resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        console.log('Container size changed:', entry.contentRect);
      }
    });

    if (scrollContainerRef.current) {
      resizeObserver.observe(scrollContainerRef.current);
    }

    return () => {
      if (scrollContainerRef.current) {
        resizeObserver.unobserve(scrollContainerRef.current);
      }
    };
  }, []);

  if (error) return <Typography color="error">Error loading data</Typography>;
  if (!gaji) return <Typography>Loading...</Typography>;

  const filteredGaji = selectedPeriode
    ? gaji.filter((gaji) => gaji.periode === selectedPeriode)
    : gaji;

  const deletegaji = async (id) => {
    const userConfirm = window.confirm('Apakah anda ingin menghapus Slip gaji?');

    if (userConfirm) {
      try {
        await axios.delete(`${getApiBaseUrl()}/deletegaji/${id}`);
        console.log('Slip gaji berhasil dihapus');
        mutate();
      } catch (error) {
        console.error('Slip gaji gagal dihapus:', error);
      }
    }
  };

  return (
    <DashboardContainer>
      <Container maxWidth="lg">
        <Grid container spacing={3}>
          <Box component={Paper} p={3} width="100%">
            <Typography variant="h8" mb={2}>Data Gaji Karyawan</Typography>
            <Select
              value={selectedPeriode}
              onChange={(e) => setSelectedPeriode(e.target.value)}
              fullWidth
              displayEmpty
            >
              <MenuItem value="">Semua Periode</MenuItem>
              {["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"].map((bulan) => (
                <MenuItem key={bulan} value={bulan.toLowerCase()}>{bulan}</MenuItem>
              ))}
            </Select>
            <TableContainer component={Paper} sx={{ mt: 3 }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>No</TableCell>
                    <TableCell>Nama Karyawan</TableCell>
                    <TableCell>Cabang</TableCell>
                    <TableCell>Tanggal Periode</TableCell>
                    <TableCell>Periode</TableCell>
                    <TableCell>Nominal</TableCell>
                    <TableCell>Tambahan</TableCell>
                    <TableCell>Potongan</TableCell>
                    <TableCell>Jumlah</TableCell>
                    <TableCell>Keterangan</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Aksi</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredGaji.map((gaji, index) => (
                    <TableRow key={gaji.id}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>{gaji.Karyawan?.nama_lengkap || 'N/A'}</TableCell>
                      <TableCell>{gaji.Karyawan?.Cabang?.nama_cabang || 'N/A'}</TableCell>
                      <TableCell>{gaji.tanggal_periode}</TableCell>
                      <TableCell>{gaji.periode}</TableCell>
                      <TableCell>{formatRupiah(gaji.nominal)}</TableCell>
                      <TableCell>{formatRupiah(gaji.tambahan)}</TableCell>
                      <TableCell>{formatRupiah(gaji.potongan)}</TableCell>
                      <TableCell>{formatRupiah(gaji.jumlah)}</TableCell>
                      <TableCell>{gaji.keterangan}</TableCell>
                      <TableCell>{gaji.status}</TableCell>
                      <TableCell>
                        <Button
                          component={Link}
                          to={`/editdatagaji/${gaji.id}`}
                          variant="contained"
                          color="primary"
                          size="small"
                          sx={{ mr: 1 }}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="contained"
                          color="error"
                          size="small"
                          onClick={() => deletegaji(gaji.id)}
                        >
                          Delete
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        </Grid>
      </Container>
    </DashboardContainer>
  );
};
