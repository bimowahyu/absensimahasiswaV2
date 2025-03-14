// src/Dashboard.js
import React from 'react';
import { Container, Card, CardContent, Typography, Grid, Avatar, Button } from '@mui/material';
import '../app/dashboardKaryawan.css'

const DashboardKaryawan = () => {
  return (
    <Container maxWidth="sm" style={{ marginTop: '20px' }}>
      <Card>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={3}>
              <Avatar alt="Denis Vanetra" src="path-to-avatar-image.jpg" />
            </Grid>
            <Grid item xs={9}>
              <Typography variant="h6">Denis Vanetra</Typography>
              <Typography variant="body2">Mobile Programmer</Typography>
            </Grid>
          </Grid>
          <Grid container spacing={2} style={{ marginTop: '20px' }}>
            <Grid item xs={3}>
              <Button variant="outlined" fullWidth>Time Off</Button>
            </Grid>
            <Grid item xs={3}>
              <Button variant="outlined" fullWidth>History</Button>
            </Grid>
            <Grid item xs={3}>
              <Button variant="outlined" fullWidth>Agenda</Button>
            </Grid>
            <Grid item xs={3}>
              <Button variant="outlined" fullWidth>Others</Button>
            </Grid>
          </Grid>
          <Typography variant="h6" style={{ marginTop: '20px' }}>PT. Sumber Bahagia</Typography>
          <Typography variant="body2">Wednesday, 1 November 2023 - 1:48:28 PM</Typography>
          <Grid container spacing={2} style={{ marginTop: '20px' }}>
            <Grid item xs={6}>
              <Button variant="contained" color="primary" fullWidth>Clock In 13:27:18</Button>
            </Grid>
            <Grid item xs={6}>
              <Button variant="contained" fullWidth>Clock Out</Button>
            </Grid>
          </Grid>
          <Grid container spacing={2} style={{ marginTop: '20px' }}>
            <Grid item xs={6}>
              <Card>
                <CardContent>
                  <Typography variant="body2">Present</Typography>
                  <Typography variant="h6">1 day</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={6}>
              <Card>
                <CardContent>
                  <Typography variant="body2">Permission</Typography>
                  <Typography variant="h6">0 day</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={6}>
              <Card>
                <CardContent>
                  <Typography variant="body2">Sick</Typography>
                  <Typography variant="h6">0 day</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={6}>
              <Card>
                <CardContent>
                  <Typography variant="body2">Overdue</Typography>
                  <Typography variant="h6">1 day</Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Container>
  );
}

export default DashboardKaryawan;
