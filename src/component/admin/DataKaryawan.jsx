import React, { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import useSWR from 'swr';
import { Box, Container, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, TextField, Button, Dialog, DialogTitle, DialogContent, DialogActions, Typography } from '@mui/material';
import { FaInfoCircle, FaEdit, FaTrash } from 'react-icons/fa';
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

const getApiBaseUrl = () => {
  const protocol = window.location.protocol === 'https:' ? 'https' : 'http';
  const baseUrl = process.env.REACT_APP_API_BASE_URL.replace(/^https?:\/\//, '');
  return `${protocol}://${baseUrl}`;
};

const fetcher = (url) => axios.get(url).then(res => res.data);


export const DataKaryawan = () => {
  const { data: karyawan, error, mutate } = useSWR(`${getApiBaseUrl()}/karyawan`, fetcher);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedKaryawan, setSelectedKaryawan] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);

  if (error) return <div>Error loading data</div>;
  if (!karyawan) return <div>Loading...</div>;

  const karyawanList = Array.isArray(karyawan) ? karyawan : karyawan.karyawan;
  if (!Array.isArray(karyawanList)) return <div>Data format is incorrect</div>;

  const filteredKaryawan = karyawanList.filter((karyawan) =>
    karyawan.nama_lengkap?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const deleteKaryawan = async (id) => {
    if (window.confirm('Apakah anda ingin menghapus data?')) {
      try {
        await axios.delete(`${getApiBaseUrl()}/karyawan/${id}`);
        mutate();
      } catch (error) {
        console.error('Data gagal dihapus:', error.response ? error.response.data : error.message);
      }
    }
  };

  return (
    <DashboardContainer>
      <Container maxWidth="lg">
        <TextField
          fullWidth
          label="Cari Nama Karyawan"
          variant="outlined"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ marginBottom: 2 }}
        />

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>No</TableCell>
                <TableCell>Username</TableCell>
                <TableCell>Nama</TableCell>
                <TableCell>Jabatan</TableCell>
                <TableCell>Cabang</TableCell>
                <TableCell>Aksi</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredKaryawan.map((karyawan, index) => (
                <TableRow key={karyawan.id || index}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>{karyawan.username}</TableCell>
                  <TableCell>{karyawan.nama_lengkap}</TableCell>
                  <TableCell>{karyawan.jabatan}</TableCell>
                  <TableCell>{karyawan.Cabang?.nama_cabang || 'N/A'}</TableCell>
                  <TableCell>
                    <Button size="small" color="info" onClick={() => { setSelectedKaryawan(karyawan); setOpenDialog(true); }}>
                      <FaInfoCircle />
                    </Button>
                    <Button size="small" color="primary" component={Link} to={`/datakaryawan/edit/${karyawan.id}`}>
                      <FaEdit />
                    </Button>
                    <Button size="small" color="error" onClick={() => deleteKaryawan(karyawan.id)}>
                      <FaTrash />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Container>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Detail Karyawan</DialogTitle>
        <DialogContent>
          {selectedKaryawan && (
            <>
              <Typography><strong>Nama Lengkap:</strong> {selectedKaryawan.nama_lengkap}</Typography>
              <Typography><strong>Username:</strong> {selectedKaryawan.username}</Typography>
              <Typography><strong>Jabatan:</strong> {selectedKaryawan.jabatan}</Typography>
              <Typography><strong>Cabang:</strong> {selectedKaryawan.Cabang?.nama_cabang || 'N/A'}</Typography>
              <Typography><strong>Telepon:</strong> {selectedKaryawan.no_telp}</Typography>
              <img
                src={`${getApiBaseUrl()}/uploads/karyawan/${selectedKaryawan.avatar}`}
                alt="Avatar"
                style={{ width: 100, height: 100, marginTop: 10 }}
              />
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Tutup</Button>
        </DialogActions>
      </Dialog>
    </DashboardContainer>
  );
};