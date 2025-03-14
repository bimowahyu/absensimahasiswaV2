import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import { Box, TextField, Button, Typography, Alert, Grid, Paper } from '@mui/material';
import { styled } from '@mui/system';

const getApiBaseUrl = () => {
  const protocol = window.location.protocol === 'https:' ? 'https' : 'http';
  const baseUrl = process.env.REACT_APP_API_BASE_URL.replace(/^https?:\/\//, '');
  return `${protocol}://${baseUrl}`;
};
const DashboardContainer = styled(Box)({
  padding: '2rem 1rem',
  marginLeft: 250,
  width: 'calc(100% - 250px)',
  '@media (max-width: 768px)': {
    marginLeft: 0,
    width: '100%',
  },
});
const StyledPaper = styled(Paper)({
  padding: '2rem',
  maxWidth: 500,
  margin: 'auto',
  marginTop: '3rem',
  boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)',
  borderRadius: '10px',
});

export const FormEditAbsensi = ({ id, onClose, mutate }) => {
  const [jam_masuk, setjam_masuk] = useState('');
  const [jam_keluar, setjam_keluar] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();
  // const { id } = useParams();

  useEffect(() => {
    const getAbsensiAll = async () => {
      try {
        const response = await axios.get(`${getApiBaseUrl()}/absensiall/${id}`, { withCredentials: true });
        if (response.data.jam_masuk) setjam_masuk(response.data.jam_masuk.substring(0, 5));
        if (response.data.jam_keluar) setjam_keluar(response.data.jam_keluar.substring(0, 5));
      } catch (error) {
        if (error.response) setMessage(error.response.data.message);
      }
    };
    getAbsensiAll();
  }, [id]);

  const updateAbsen = async (e) => {
    e.preventDefault();
    if (!jam_masuk || !jam_keluar) {
      setMessage('Jam Masuk dan Jam Keluar harus diisi');
      return;
    }
    try {
      await axios.put(`${getApiBaseUrl()}/absensi/${id}`, { jam_masuk, jam_keluar }, { withCredentials: true });
      mutate();  
      onClose();
    } catch (error) {
      if (error.response) setMessage(error.response.data.message);
    }
  };
  

  return (
    <StyledPaper>
      <Typography variant="h5" align="center" gutterBottom>
        Edit Absensi
      </Typography>
      {message && <Alert severity="error">{message}</Alert>}
      <form onSubmit={updateAbsen}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField fullWidth label="Jam Masuk" type="time" value={jam_masuk} onChange={(e) => setjam_masuk(e.target.value)} required />
          </Grid>
          <Grid item xs={12}>
            <TextField fullWidth label="Jam Keluar" type="time" value={jam_keluar} onChange={(e) => setjam_keluar(e.target.value)} required />
          </Grid>
          <Grid item xs={12}>
            <Button type="submit" variant="contained" color="primary" fullWidth>
              Update Absensi
            </Button>
          </Grid>
        </Grid>
      </form>
    </StyledPaper>
  );
};

export default FormEditAbsensi;