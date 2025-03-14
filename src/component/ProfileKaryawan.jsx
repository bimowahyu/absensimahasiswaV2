import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, Card, CardContent, Typography, Grid, Avatar, Button } from '@mui/material';
import { IoPerson } from 'react-icons/io5';
import { NavLink, useNavigate } from "react-router-dom";
import { getMe } from '../fitur/AuthKaryawan';
const getApiBaseUrl = () => {
    const protocol = window.location.protocol === 'https:' ? 'https' : 'http';
   const baseUrl = process.env.REACT_APP_API_BASE_URL.replace(/^https?:\/\//, '');
    return `${protocol}://${baseUrl}`;
  };

const ProfileKaryawan = () => {
    const [dataKaryawan, setDataKaryawan] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
              
                const response = await axios.get(`${getApiBaseUrl()}/MeKaryawan`,{withCredentials: true});
                setDataKaryawan(response.data); 
            } catch (error) {
                setError(error.message);
            }
        };

        fetchProfile();
    }, []);

  
    if (error) {
        return <div>Error: {error}</div>;
    }

    
    return (
        <Container maxWidth="sm" style={{ marginTop: '20px' }}>
        <Card>
            <CardContent>
                {dataKaryawan ? (
                      <Grid container spacing={2} alignItems="center">
                      <Grid item xs={3}>
                        <Avatar 
                         
                          src={dataKaryawan.url} 
                          sx={{ width: 100, height: 100 }} // Menentukan ukuran avatar
                          alt={dataKaryawan.nama_lengkap} 
                        />
                      </Grid>
                      <Grid item xs={9}>
                        {/* <Typography variant="h6">{dataKaryawan.nama_lengkap}</Typography>
                        <Typography variant="body2">{dataKaryawan.jabatan}</Typography> */}
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="h6">{dataKaryawan.nama_lengkap}</Typography>
                        <Typography variant="body2">{dataKaryawan.jabatan}</Typography>
                      </Grid>
                    </Grid>
                ) : (
                    <div>Loading...</div>
                )}
                <Grid container spacing={2} style={{ marginTop: '20px' }}>
                   
                   
                </Grid>
               
                
              
                <Grid container spacing={2} style={{ marginTop: '20px' }}>
                   
                    <Grid item xs={6}>
                        <Card>
                            {/* <CardContent>
                                <Typography variant="body2">Absen Detail</Typography>
                                <Typography variant="h6">-</Typography>
                            </CardContent> */}
                        </Card>
                    </Grid>
                    <Grid item xs={6}>
                       
                    </Grid>
                    <Grid item xs={6}>
                    <Card>
                        {/* Nama:{dataKaryawan.nama_lengkap} */}
                        </Card>
                        <Card>
                       
                        {/* Jabatan:{dataKaryawan.jabatan} */}
                        </Card>
                       
                    </Grid>
                </Grid>
            </CardContent>
                       
        </Card>
        <Grid container spacing={2} style={{ marginTop: '20px' }}>
                       
                       <>
                           <Grid item xs={6}>
                               <Button component={NavLink} to="/dashboard" variant="contained" color="primary" fullWidth>
                                  Kembali
                               </Button>
                           </Grid>
                           <Grid item xs={6}>
                               <Button component={NavLink} to="/editprofilekaryawan" variant="contained" fullWidth>
                                  Edit Profile
                               </Button>
                           </Grid>
                       </>
                  
               </Grid>
    </Container>
      
    );
};

export default ProfileKaryawan;
