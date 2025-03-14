import React, { useCallback, useState } from 'react';
import axios from 'axios';
import useSWR from 'swr';
import { Box, Container, Grid, CircularProgress, Button, Table, TableHead, TableBody, TableRow, TableCell, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Select, MenuItem, FormControl, InputLabel, Typography } from '@mui/material';
import styled from 'styled-components';

axios.defaults.withCredentials = true;

const getApiBaseUrl = () => {
  const protocol = window.location.protocol === 'https:' ? 'https' : 'http';
  const baseUrl = process.env.REACT_APP_API_BASE_URL.replace(/^https?:\/\//, '');
  return `${protocol}://${baseUrl}`;
};

const fetcher = (url) => axios.get(url).then((res) => res.data);

const DashboardContainer = styled(Box)`
  padding: 2rem 1rem;
  margin-left: 250px;
  width: calc(100% - 250px);

  @media (max-width: 768px) {
    margin-left: 0;
    width: 100%;
  }
`;

const DataAdmin = () => {
  const { data: admin, error, mutate } = useSWR(`${getApiBaseUrl()}/users`, fetcher);
  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [formData, setFormData] = useState({ name: '', email: '', password: '', confPassword: '', role: '' });
  const [msg, setMsg] = useState('');

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleEditOpen = (admin) => {
    setSelectedAdmin(admin);
    setFormData({ name: admin.name, email: admin.email, password: '', confPassword: '', role: admin.role });
    setEditOpen(true);
  };
  const handleEditClose = () => setEditOpen(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const saveUser = async () => {
    if (formData.password !== formData.confPassword) {
      setMsg('Password konfirmasi tidak cocok');
      return;
    }
    try {
      await axios.post(`${getApiBaseUrl()}/users`, formData);
      mutate();
      handleClose();
    } catch (error) {
      setMsg(error.response?.data?.msg || 'Terjadi kesalahan');
    }
  };

  const updateUser = async () => {
    if (formData.password && formData.password !== formData.confPassword) {
      setMsg('Password konfirmasi tidak cocok');
      return;
    }
    try {
      await axios.put(`${getApiBaseUrl()}/users/${selectedAdmin.id}`, formData);
      mutate();
      handleEditClose();
    } catch (error) {
      setMsg(error.response?.data?.msg || 'Terjadi kesalahan');
    }
  };

  const deleteAdmin = useCallback(async (id) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus akun ini?')) {
      try {
        await axios.delete(`${getApiBaseUrl()}/users/${id}`);
        mutate();
      } catch (error) {
        console.error('Akun Admin Gagal Dihapus');
      }
    }
  }, [mutate]);

  if (error) return <Typography color="error">Error loading data</Typography>;
  if (!admin) return <CircularProgress />;

  return (
    <DashboardContainer>
      <Container maxWidth="lg">
        <Grid container spacing={3}>
          <Box mb={2}>
            <Button variant="contained" color="primary" onClick={handleOpen}>
              Tambah Admin
            </Button>
          </Box>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>No</TableCell>
                <TableCell>Nama</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Role Kantor</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {admin.map((user, index) => (
                <TableRow key={user.id}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.role}</TableCell>
                  <TableCell>
                    <Button onClick={() => handleEditOpen(user)} variant="contained" color="info" size="small" sx={{ mr: 1 }}>
                      Edit
                    </Button>
                    <Button onClick={() => deleteAdmin(user.id)} variant="contained" color="error" size="small">
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Grid>
      </Container>

      {/* Modal Tambah Admin */}
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Tambah Admin</DialogTitle>
        <DialogContent>
          <TextField fullWidth label="Nama" name="name" value={formData.name} onChange={handleChange} required />
          <TextField fullWidth label="Email" name="email" value={formData.email} onChange={handleChange} required />
          <TextField fullWidth label="Password" name="password" type="password" value={formData.password} onChange={handleChange} required />
          <TextField fullWidth label="Konfirmasi Password" name="confPassword" type="password" value={formData.confPassword} onChange={handleChange} required />
          <FormControl fullWidth>
            <InputLabel>Role</InputLabel>
            <Select name="role" value={formData.role} onChange={handleChange}>
              <MenuItem value="admin">Admin</MenuItem>
              <MenuItem value="user">User</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Batal</Button>
          <Button onClick={saveUser} color="primary">Simpan</Button>
        </DialogActions>
      </Dialog>

      {/* Modal Edit Admin */}
      <Dialog open={editOpen} onClose={handleEditClose}>
        <DialogTitle>Edit Admin</DialogTitle>
        <DialogContent>
          <TextField fullWidth label="Nama" name="name" value={formData.name} onChange={handleChange} required />
          <TextField fullWidth label="Email" name="email" value={formData.email} onChange={handleChange} required />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleEditClose}>Batal</Button>
          <Button onClick={updateUser} color="primary">Simpan</Button>
        </DialogActions>
      </Dialog>
    </DashboardContainer>
  );
};

export default DataAdmin;
