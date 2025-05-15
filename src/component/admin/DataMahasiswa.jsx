import React, { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import useSWR from 'swr';
import { 
  Box, Container, Table, TableBody, TableCell, 
  TableContainer, TableHead, TableRow, Paper, 
  TextField, Button, Dialog, DialogTitle, 
  DialogContent, DialogActions, Typography 
} from '@mui/material';
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

export const DataMahasiswa = () => {
  const { data: mahasiswa, error, mutate } = useSWR(`${getApiBaseUrl()}/mahasiswa`, fetcher);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMahasiswa, setSelectedMahasiswa] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);

  if (error) return <div>Error loading data</div>;
  if (!mahasiswa) return <div>Loading...</div>;

  const mahasiswaList = Array.isArray(mahasiswa) ? mahasiswa : mahasiswa.mahasiswa;
  if (!Array.isArray(mahasiswaList)) return <div>Data format is incorrect</div>;

  const filteredMahasiswa = mahasiswaList.filter((mhs) =>
    mhs.nama_lengkap?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const deleteMahasiswa = async (id) => {
    if (window.confirm('Apakah anda ingin menghapus data?')) {
      try {
        await axios.delete(`${getApiBaseUrl()}/mahasiswa/${id}`);
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
          label="Cari Nama Mahasiswa"
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
                <TableCell>Nama Lengkap</TableCell>
               
                <TableCell>Cabang/Kampus</TableCell>
                <TableCell>Aksi</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredMahasiswa.map((mhs, index) => (
                <TableRow key={mhs.id || index}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>{mhs.username || 'N/A'}</TableCell>
                  <TableCell>{mhs.nama_lengkap || 'N/A'}</TableCell>
              
                  <TableCell>{mhs.Cabang?.nama || 'N/A'}</TableCell>
                  <TableCell>
                    <Button size="small" color="info" onClick={() => { setSelectedMahasiswa(mhs); setOpenDialog(true); }}>
                      <FaInfoCircle />
                    </Button>
                    <Button size="small" color="primary" component={Link} to={`/datamahasiswa/edit/${mhs.id}`}>
                      <FaEdit />
                    </Button>
                    <Button size="small" color="error" onClick={() => deleteMahasiswa(mhs.id)}>
                      <FaTrash />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Container>

      {/* Dialog Detail Mahasiswa */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Detail Mahasiswa</DialogTitle>
        <DialogContent>
          {selectedMahasiswa && (
            <>
              <Typography><strong>Nama Lengkap:</strong> {selectedMahasiswa.nama_lengkap  || 'N/A'}</Typography>
              <Typography><strong>Username:</strong> {selectedMahasiswa.username  || 'N/A'}</Typography>
             
              <Typography><strong>Kampus:</strong> {selectedMahasiswa.Cabang?.nama || 'N/A'}</Typography>
              {/* <Typography><strong>Telepon:</strong> {selectedMahasiswa.no_telp}</Typography> */}
              <img
                src={`${getApiBaseUrl()}/uploads/mahasiswa/${selectedMahasiswa.avatar}`}
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

export default DataMahasiswa;
