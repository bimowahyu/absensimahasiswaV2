import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, NavLink } from 'react-router-dom';
import { Container, Card, CardContent, Typography, Grid, Button, TextField } from '@mui/material';
import { useSelector } from 'react-redux';
const getApiBaseUrl = () => {
  const protocol = window.location.protocol === 'https:' ? 'https' : 'http';
 const baseUrl = process.env.REACT_APP_API_BASE_URL.replace(/^https?:\/\//, '');
  return `${protocol}://${baseUrl}`;
};

export const FormEditProfile = () => {
  const [profile, setProfile] = useState({});
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  // const [file, setFile] = useState(null);
  // const [preview, setPreview] = useState('');
  const [message, setMessage] = useState('');

  const { user } = useSelector((state) => state.authKaryawan);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await axios.get(`${getApiBaseUrl()}/MeKaryawan`,{withCredentials: true});
        setProfile(response.data);
        setName(response.data.nama_lengkap);
        // setPreview(response.data.url);
      } catch (error) {
        setMessage(error.message);
      }
    };

    fetchProfile();
  }, []);

  const updateProfile = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('nama_lengkap', name);
    if (password) {
      formData.append('password', password);
    }
    // if (file) {
    //   formData.append('avatar', file);
    // }

    try {
      await axios.put(`${getApiBaseUrl()}/updatebykaryawan/${user.id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      navigate('/dashboard');
    } catch (error) {
      console.error("Error details:", error.response || error.message);
  setMessage(error.response?.data?.message || 'An error occurred while updating the profile.');
    }
  };

 
  return (
    <Container maxWidth="sm" style={{ marginTop: '20px' }}>
      <Card>
        <CardContent>
          <form onSubmit={updateProfile}>
            <Grid container spacing={2} alignItems="center">
             
              <Grid item xs={9}>
                <Typography variant="h5">{profile.nama_lengkap}</Typography>
              </Grid>
            </Grid>

            <Grid container spacing={2} style={{ marginTop: '20px' }}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Name"
                  variant="outlined"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Password"
                  type="password"
                  variant="outlined"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </Grid>
              
            </Grid>
            {message && (
              <Typography color="error" variant="body2" style={{ marginTop: '10px' }}>
                {message}
              </Typography>
            )}

            <Grid container spacing={2} style={{ marginTop: '20px' }}>
              <Grid item xs={6}>
                <Button component={NavLink} to="/dashboard" variant="contained" color="primary" fullWidth>
                  Kembali
                </Button>
              </Grid>
              <Grid item xs={6}>
                <Button type="submit" variant="contained" color="secondary" fullWidth>
                  Update Profile
                </Button>
              </Grid>
            </Grid>
          </form>
        </CardContent>
      </Card>
    </Container>
  );
};
