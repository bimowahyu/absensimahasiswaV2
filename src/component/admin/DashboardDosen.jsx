import React, { useState, useEffect } from 'react';
import { Box, Container, Grid, Typography, Paper, CircularProgress, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Avatar, Chip } from '@mui/material';
import { FaUsers, FaBuilding, FaCalendarAlt, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import AbsensiChart from './DataAbsensi';
import DataAbsenHarian from './DataAbsenHarian';
import useSWR from 'swr';
import axios from 'axios';
import moment from 'moment';
import 'moment/locale/id';

// Styled components with modern design
const DashboardContainer = styled(Box)`
  padding: 1.5rem;
  margin-left: 250px; /* Width of your sidebar */
  width: calc(100% - 250px);
  background-color: #f8f9fa;
  min-height: 100vh;
  
  @media (max-width: 768px) {
    margin-left: 0;
    width: 100%;
    padding: 1rem;
  }
`;

const StatsCard = styled(motion.div)`
  border-radius: 20px;
  padding: 1.75rem;
  height: 100%;
  color: white;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  background-size: 200% 200%;
  animation: gradient 15s ease infinite;
  overflow: hidden;
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    top: -50%;
    right: -50%;
    width: 120%;
    height: 120%;
    background: rgba(255, 255, 255, 0.08);
    transform: rotate(30deg);
    pointer-events: none;
  }
  
  @keyframes gradient {
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
  }
`;

const CardContent = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 100%;
  position: relative;
  z-index: 2;
`;

const StatsInfo = styled.div`
  display: flex;
  flex-direction: column;
`;

const StatsTitle = styled(Typography)`
  font-size: 1rem;
  font-weight: 500;
  margin-bottom: 0.5rem;
  letter-spacing: 0.5px;
  opacity: 0.9;
`;

const StatsValue = styled(Typography)`
  font-size: 2.25rem;
  font-weight: 700;
  letter-spacing: 0.5px;
`;

const IconBox = styled(motion.div)`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 64px;
  height: 64px;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(5px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
`;

const SectionTitle = styled(Typography)`
  font-size: 1.35rem;
  font-weight: 600;
  margin: 2.5rem 0 1.25rem;
  color: #2d3748;
  position: relative;
  padding-bottom: 0.75rem;
  
  &:after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    width: 60px;
    height: 4px;
    background: linear-gradient(90deg, #4e54c8, #8f94fb);
    border-radius: 2px;
  }
`;

const ChartContainer = styled(Paper)`
  padding: 1.75rem;
  border-radius: 20px;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.05);
  margin-bottom: 2.5rem;
  background-color: white;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 12px 25px rgba(0, 0, 0, 0.08);
  }
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  flex-direction: column;
  gap: 1rem;
`;

const LoadingText = styled(Typography)`
  font-size: 1.2rem;
  color: #4e54c8;
  margin-top: 1rem;
`;

const AttendanceTableContainer = styled(TableContainer)`
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.06);
`;

const StyledTableHead = styled(TableHead)`
  background: linear-gradient(90deg, #4e54c8, #8f94fb);
  
  th {
    color: white;
    font-weight: 600;
    padding: 16px;
  }
`;

const StyledTableRow = styled(TableRow)`
  transition: background-color 0.2s ease;
  
  &:nth-of-type(odd) {
    background-color: rgba(0, 0, 0, 0.02);
  }
  
  &:hover {
    background-color: rgba(78, 84, 200, 0.1);
  }
`;

const StatusChip = styled(Chip)`
  font-weight: 600;
  text-transform: capitalize;
`;

// API fetcher
const getApiBaseUrl = () => {
  const protocol = window.location.protocol === 'https:' ? 'https' : 'http';
  const baseUrl = process.env.REACT_APP_API_BASE_URL.replace(/^https?:\/\//, '');
  return `${protocol}://${baseUrl}`;
};

const fetcher = url => axios.get(url, { withCredentials: true }).then(res => res.data);

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
};

const iconVariants = {
  hidden: { scale: 0.8, opacity: 0 },
  visible: { scale: 1, opacity: 1, transition: { delay: 0.3, duration: 0.5 } }
};

const DashboardDosen = () => {
  // Set locale for date formatting
  moment.locale('id');
  
  // Fetch attendance data
  const { data: absensiData, error: absensiError, isLoading } = useSWR(
    `${getApiBaseUrl()}/absensibydosen`,
    fetcher
  );

  // Calculate statistics based on absensi data
  const [stats, setStats] = useState({
    totalStudents: 0,
    presentToday: 0,
    courses: 0
  });

  useEffect(() => {
    if (absensiData && absensiData.data) {
      // Get unique students, courses, and count present today
      const uniqueStudents = new Set();
      const uniqueCourses = new Set();
      let presentCount = 0;
      
      absensiData.data.forEach(item => {
        uniqueStudents.add(item.mahasiswa_id);
        uniqueCourses.add(item.matkul_id);
        
        // Check if attendance is from today and student is present
        if (moment(item.tgl_absensi).isSame(moment(), 'day') && item.status === 'hadir') {
          presentCount++;
        }
      });
      
      setStats({
        totalStudents: uniqueStudents.size,
        presentToday: presentCount,
        courses: uniqueCourses.size
      });
    }
  }, [absensiData]);

  if (isLoading) {
    return (
      <LoadingContainer>
        <CircularProgress size={60} thickness={4} style={{ color: '#4e54c8' }} />
        <LoadingText>Memuat data absensi...</LoadingText>
      </LoadingContainer>
    );
  }

  if (absensiError) {
    return (
      <DashboardContainer>
        <Typography variant="h5" color="error" align="center">
          Terjadi kesalahan saat memuat data. Silakan coba lagi nanti.
        </Typography>
      </DashboardContainer>
    );
  }

  return (
    <DashboardContainer>
      <Container maxWidth="xl">
       

        {/* Stats Cards */}
        <Grid container spacing={3}>
          <Grid item xs={12} sm={4}>
            <StatsCard 
              as={motion.div}
              initial="hidden"
              animate="visible"
              variants={cardVariants}
              style={{ background: 'linear-gradient(45deg, #4776e6, #8e54e9)' }}
            >
              <CardContent>
                <StatsInfo>
                  <StatsTitle variant="body1">Total Mahasiswa</StatsTitle>
                  <StatsValue variant="h3">{stats.totalStudents}</StatsValue>
                </StatsInfo>
                <IconBox
                  as={motion.div}
                  variants={iconVariants}
                  initial="hidden"
                  animate="visible"
                >
                  <FaUsers size={30} />
                </IconBox>
              </CardContent>
            </StatsCard>
          </Grid>
          
          <Grid item xs={12} sm={4}>
            <StatsCard 
              as={motion.div}
              initial="hidden"
              animate="visible"
              variants={cardVariants}
              style={{ background: 'linear-gradient(45deg, #11998e, #38ef7d)' }}
            >
              <CardContent>
                <StatsInfo>
                  <StatsTitle variant="body1">Hadir Hari Ini</StatsTitle>
                  <StatsValue variant="h3">{stats.presentToday}</StatsValue>
                </StatsInfo>
                <IconBox
                  as={motion.div}
                  variants={iconVariants}
                  initial="hidden"
                  animate="visible"
                >
                  <FaCheckCircle size={30} />
                </IconBox>
              </CardContent>
            </StatsCard>
          </Grid>
          
          <Grid item xs={12} sm={4}>
            <StatsCard 
              as={motion.div}
              initial="hidden"
              animate="visible"
              variants={cardVariants}
              style={{ background: 'linear-gradient(45deg, #FF512F, #F09819)' }}
            >
              <CardContent>
                <StatsInfo>
                  <StatsTitle variant="body1">Total Mata Kuliah</StatsTitle>
                  <StatsValue variant="h3">{stats.courses}</StatsValue>
                </StatsInfo>
                <IconBox
                  as={motion.div}
                  variants={iconVariants}
                  initial="hidden"
                  animate="visible"
                >
                  <FaBuilding size={30} />
                </IconBox>
              </CardContent>
            </StatsCard>
          </Grid>
        </Grid>

        {/* Charts */}
        {/* <SectionTitle>Statistik Absensi</SectionTitle>
        <ChartContainer>
          <AbsensiChart data={absensiData?.data || []} />
        </ChartContainer> */}

        {/* Daily Attendance */}
        <Grid container spacing={3}>
          {/* <Grid item xs={12} md={5}>
            <SectionTitle>Absensi Harian</SectionTitle>
            <ChartContainer>
              <DataAbsenHarian data={absensiData?.data || []} />
            </ChartContainer>
          </Grid> */}
          
          <Grid item xs={12} md={7}>
            <SectionTitle>Data Absensi Terkini</SectionTitle>
            <ChartContainer>
              <AttendanceTableContainer>
                <Table>
                  <StyledTableHead>
                    <TableRow>
                      <TableCell>Mahasiswa</TableCell>
                      <TableCell>Mata Kuliah</TableCell>
                      <TableCell>Tanggal</TableCell>
                      <TableCell>Jam Masuk</TableCell>
                        <TableCell>izin</TableCell>
                      <TableCell>Status</TableCell>
                    </TableRow>
                  </StyledTableHead>
                  <TableBody>
                    {absensiData?.data?.length > 0 ? (
                      absensiData.data.map((attendance) => (
                        <StyledTableRow key={attendance.id}>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                              <Avatar>{attendance.mahasiswa.nama_lengkap.charAt(0)}</Avatar>
                              <Typography variant="body2" fontWeight={500}>
                                {attendance.mahasiswa.nama_lengkap || '-'}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell>{attendance.matkul?.nama_matkul || '-'}</TableCell>
                          <TableCell>{moment(attendance.tgl_absensi).format('DD MMMM YYYY')}</TableCell>
                          <TableCell>{attendance.jam_masuk || '-'}</TableCell>
                           <TableCell>{attendance.status || '-'}</TableCell>
                          <TableCell>
                            <StatusChip 
                              label={attendance.status}
                              color={attendance.status === 'hadir' ? 'success' : 'error'}
                              icon={attendance.status === 'hadir' ? <FaCheckCircle size={14} /> : <FaTimesCircle size={14} />}
                            />
                          </TableCell>
                        </StyledTableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} align="center">
                          <Typography variant="body1" p={3}>
                            Tidak ada data absensi yang tersedia
                          </Typography>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </AttendanceTableContainer>
            </ChartContainer>
          </Grid>
        </Grid>
      </Container>
    </DashboardContainer>
  );
};

export default DashboardDosen;