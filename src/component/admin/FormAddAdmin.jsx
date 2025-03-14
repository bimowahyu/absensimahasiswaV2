import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Box, Container, TextField, Button, Typography, Select, MenuItem, FormControl, InputLabel, Alert, Grid, Paper } from '@mui/material';
import { styled } from '@mui/system';

const getApiBaseUrl = () => {
  const protocol = window.location.protocol === 'https:' ? 'https' : 'http';
  const baseUrl = process.env.REACT_APP_API_BASE_URL.replace(/^https?:\/\//, '');
  return `${protocol}://${baseUrl}`;
};

const FormContainer = styled(Paper)({
  padding: '2rem',
  maxWidth: 700,
  margin: 'auto',
  boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)',
});

export const FormAddAdmin = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confPassword, setConfPassword] = useState('');
  const [role, setRole] = useState('');
  const [msg, setMsg] = useState('');
  const navigate = useNavigate();

  const saveUser = async (e) => {
    e.preventDefault();
    if (password !== confPassword) {
      setMsg('Password Konfirmasi tidak cocok');
      return;
    }
    try {
      await axios.post(`${getApiBaseUrl()}/users`, {
        name,
        email,
        role,
        password,
        confPassword,
      }, { withCredentials: true });
      navigate('/admin/data');
    } catch (error) {
      setMsg(error.response?.data?.msg || 'Terjadi kesalahan');
    }
  };

  return (
    <Container>
      <FormContainer>
        <Typography variant="h5" align="center" gutterBottom>
          Tambah Admin Baru
        </Typography>
        {msg && <Alert severity="error" sx={{ mb: 2 }}>{msg}</Alert>}
        <form onSubmit={saveUser}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Nama" value={name} onChange={(e) => setName(e.target.value)} required />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Konfirmasi Password" type="password" value={confPassword} onChange={(e) => setConfPassword(e.target.value)} required />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth required>
                <InputLabel>Role</InputLabel>
                <Select value={role} onChange={(e) => setRole(e.target.value)}>
                  <MenuItem value="admin">Admin</MenuItem>
                  <MenuItem value="user">User</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <Button type="submit" variant="contained" color="primary" fullWidth>
                Simpan
              </Button>
            </Grid>
          </Grid>
        </form>
      </FormContainer>
    </Container>
  );
};
