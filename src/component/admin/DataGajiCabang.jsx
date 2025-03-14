import React, { useState } from 'react';
import axios from 'axios';
import useSWR from 'swr';
import jsPDF from 'jspdf';
import "jspdf-autotable";
import moment from 'moment-timezone';
import { Box, Container, Grid, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Select, MenuItem, Typography, Button, TextField } from '@mui/material';
import { styled } from '@mui/system';

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

const fetcher = (url) => axios.get(url).then(res => res.data);

const formatRupiah = (angka) => {
  if (angka == null) return 'Rp0';
  return 'Rp' + angka.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
};


const DataGajiCabang = () => {
  const [bulan, setBulan] = useState(moment().format('MM'));
  const [tahun, setTahun] = useState(moment().format('YYYY'));
  const [fetchData, setFetchData] = useState(false);
  const [warning, setWarning] = useState('');

  const { data: gaji, error } = useSWR(
    fetchData ? `${getApiBaseUrl()}/getgajibycabang?bulan=${bulan}&tahun=${tahun}` : null,
    fetcher
  );

  const handleTampilkanData = () => {
    if (!bulan || !tahun) {
      setWarning('Silahkan pilih bulan dan tahun.');
    } else {
      setWarning('');
      setFetchData(true);
    }
  };

  return (
    <DashboardContainer>
      <Container maxWidth="lg">
        <Typography variant="p" gutterBottom>Data Gaji Cabang</Typography>
        <Grid container spacing={3} alignItems="center">
          <Grid item>
            <TextField
              type="month"
              value={`${tahun}-${bulan}`}
              onChange={(e) => {
                const [year, month] = e.target.value.split("-");
                setBulan(month);
                setTahun(year);
              }}
              label="Pilih Bulan"
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item>
            <Button variant="contained" color="primary" onClick={handleTampilkanData}>Tampilkan Data</Button>
          </Grid>
        </Grid>
        {warning && <Typography color="error">{warning}</Typography>}

        {fetchData && error && (
          <Typography color="error">{error.response?.status === 404 ? 'Data tidak ditemukan.' : 'Terjadi kesalahan saat mengambil data.'}</Typography>
        )}

        {gaji && Object.keys(gaji).map((key) => {
          const cabang = gaji[key];
          return (
            <Box key={key} mt={3} p={2} component={Paper} elevation={3}>
              <Typography variant="h6">{cabang.cabang.nama_cabang}</Typography>
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Nama</TableCell>
                      <TableCell>Periode</TableCell>
                      <TableCell>Nominal</TableCell>
                      <TableCell>Tambahan</TableCell>
                      <TableCell>Potongan</TableCell>
                      <TableCell>Jumlah</TableCell>
                      <TableCell>Keterangan</TableCell>
                      <TableCell>Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {cabang.gaji.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>{item.Karyawan.nama_lengkap}</TableCell>
                        <TableCell>{item.periode}</TableCell>
                        <TableCell>{formatRupiah(item.nominal)}</TableCell>
                        <TableCell>{formatRupiah(item.tambahan)}</TableCell>
                        <TableCell>{formatRupiah(item.potongan)}</TableCell>
                        <TableCell>{formatRupiah(item.jumlah)}</TableCell>
                        <TableCell>{item.keterangan}</TableCell>
                        <TableCell>{item.status}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              <Button variant="contained" color="secondary" style={{ marginTop: '10px' }}>Export to PDF</Button>
            </Box>
          );
        })}
      </Container>
    </DashboardContainer>
  );
};

export default DataGajiCabang;
