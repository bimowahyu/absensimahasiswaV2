import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { 
  Box, 
  Typography, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper, 
  Button, 
  CircularProgress, 
  Card, 
  CardContent, 
  Avatar 
} from '@mui/material';
import styled from 'styled-components';

const getApiBaseUrl = () => {
  const protocol = window.location.protocol === 'https:' ? 'https' : 'http';
  const baseUrl = process.env.REACT_APP_API_BASE_URL.replace(/^https?:\/\//, '');
  return `${protocol}://${baseUrl}`;
};
const DashboardContainer = styled(Box)`
  padding: 2rem 1rem;
  margin-left: 250px; /* Width of your sidebar */
  width: calc(100% - 250px);
  
  @media (max-width: 768px) {
    margin-left: 0;
    width: 100%;
  }
`;

export const ProfileAdmin = () => {
  const [profile, setProfile] = useState({});
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await axios.get(`${getApiBaseUrl()}/Me`, { withCredentials: true });
        setProfile(response.data);
      } catch (error) {
        setMessage(error.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, []);

  return (
    <DashboardContainer>
    <Box sx={{ padding: 3 }}>
     
      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
          <CircularProgress />
        </Box>
      ) : (
        <Card variant="outlined">
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', marginBottom: 3 }}>
              <Avatar 
                sx={{ width: 100, height: 100, marginRight: 3 }} 
                src={profile.avatar} // Jika ada field avatar di response
                alt={profile.name}
              />
              <Box>
                <Typography variant="h5" component="div">
                  {profile.name}
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  {profile.email}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Role: {profile.role}
                </Typography>
              </Box>
            </Box>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>No</TableCell>
                    <TableCell>Nama</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Role</TableCell>
                    <TableCell>Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow>
                    <TableCell>1</TableCell>
                    <TableCell>{profile.name}</TableCell>
                    <TableCell>{profile.email}</TableCell>
                    <TableCell>{profile.role}</TableCell>
                    <TableCell>
                      <Button
                        variant="contained"
                        color="primary"
                        size="small"
                        component={Link}
                        to={`/admin/edit/${profile.id}`}
                      >
                        Edit
                      </Button>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}
      {message && (
        <Typography variant="body1" color="error" sx={{ marginTop: 2 }}>
          {message}
        </Typography>
      )}
    </Box>
    </DashboardContainer>
  );
};