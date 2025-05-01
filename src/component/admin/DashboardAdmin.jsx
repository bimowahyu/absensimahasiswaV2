import React from 'react';
import { Box, Container, Grid, Typography, Paper, CircularProgress } from '@mui/material';
import { FaBook, FaUsers, FaMapMarkerAlt, FaCalendarCheck } from 'react-icons/fa';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import AbsensiChart from './DataAbsensi';
import DataAbsenHarian from './DataAbsenHarian';
import useSWR from 'swr';
import axios from 'axios';

// Styled components with modern design
const DashboardContainer = styled(Box)`
  padding: 1.5rem;
  margin-left: 250px;
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

const DashboardAdmin = () => {
  const { data: mahasiswaData, error: mahasiswaError } = useSWR(`${getApiBaseUrl()}/mahasiswa`, fetcher);
  const { data: matkulData, error: matkulError } = useSWR(`${getApiBaseUrl()}/matkul`, fetcher);
  const { data: lokasiData, error: lokasiError } = useSWR(`${getApiBaseUrl()}/cabang`, fetcher);
  const { data: absensiHariIniData, error: absensiHariIniError } = useSWR(`${getApiBaseUrl()}/absensihari/get`, fetcher);

  const totalMahasiswa = mahasiswaData?.totalMahasiswa || 0;
  const totalMatkul = matkulData?.totalMatkul || 0;
  const totalLokasi = lokasiData?.length || 0;
  const totalKehadiranHariIni = absensiHariIniData?.jumlahAbsensi || 0;

  const isLoading = (!mahasiswaData && !mahasiswaError) || 
                   (!matkulData && !matkulError) || 
                   (!lokasiData && !lokasiError) || 
                   (!absensiHariIniData && !absensiHariIniError);
  const isError = mahasiswaError || matkulError || lokasiError || absensiHariIniError;

  if (isLoading) {
    return (
      <LoadingContainer>
        <CircularProgress size={60} thickness={4} style={{ color: '#4e54c8' }} />
        <LoadingText variant="h6">Loading dashboard data...</LoadingText>
      </LoadingContainer>
    );
  }

  if (isError) {
    console.error('Error fetching data:', mahasiswaError || matkulError || lokasiError || absensiHariIniError);
    return (
      <DashboardContainer>
        <Typography variant="h6" color="error" sx={{ fontWeight: 500 }}>
          Error loading data. Please try again later.
        </Typography>
      </DashboardContainer>
    );
  }

  return (
    <DashboardContainer>
      <Container maxWidth="xl">
        <Grid container spacing={4}>
          {/* Card Total Mahasiswa */}
          <Grid item xs={12} sm={6} md={3}>
            <StatsCard
              as={motion.div}
              initial="hidden"
              animate="visible"
              variants={cardVariants}
              style={{ background: 'linear-gradient(135deg, #4e54c8, #8f94fb)' }}
              whileHover={{ y: -10, transition: { duration: 0.3 } }}
            >
              <CardContent>
                <StatsInfo>
                  <StatsTitle variant="p">Total Mahasiswa</StatsTitle>
                  <StatsValue variant="p">{totalMahasiswa.toLocaleString()}</StatsValue>
                </StatsInfo>
                <IconBox
                  as={motion.div}
                  variants={iconVariants}
                >
                  <FaUsers size={32} />
                </IconBox>
              </CardContent>
            </StatsCard>
          </Grid>

          {/* Card Total Matkul */}
          <Grid item xs={12} sm={6} md={3}>
            <StatsCard
              as={motion.div}
              initial="hidden"
              animate="visible"
              variants={cardVariants}
              style={{ background: 'linear-gradient(135deg, #11998e, #38ef7d)' }}
              whileHover={{ y: -10, transition: { duration: 0.3 } }}
            >
              <CardContent>
                <StatsInfo>
                  <StatsTitle variant="p">Total Mata Kuliah</StatsTitle>
                  <StatsValue variant="p">{totalMatkul.toLocaleString()}</StatsValue>
                </StatsInfo>
                <IconBox
                  as={motion.div}
                  variants={iconVariants}
                >
                  <FaBook size={32} />
                </IconBox>
              </CardContent>
            </StatsCard>
          </Grid>

          {/* Card Total Lokasi Presensi */}
          <Grid item xs={12} sm={6} md={3}>
            <StatsCard
              as={motion.div}
              initial="hidden"
              animate="visible"
              variants={cardVariants}
              style={{ background: 'linear-gradient(135deg, #FF416C, #FF4B2B)' }}
              whileHover={{ y: -10, transition: { duration: 0.3 } }}
            >
              <CardContent>
                <StatsInfo>
                  <StatsTitle variant="p">Total Lokasi Presensi</StatsTitle>
                  <StatsValue variant="p">{totalLokasi.toLocaleString()}</StatsValue>
                </StatsInfo>
                <IconBox
                  as={motion.div}
                  variants={iconVariants}
                >
                  <FaMapMarkerAlt size={32} />
                </IconBox>
              </CardContent>
            </StatsCard>
          </Grid>

          {/* Card Total Kehadiran Hari Ini */}
          <Grid item xs={12} sm={6} md={3}>
            <StatsCard
              as={motion.div}
              initial="hidden"
              animate="visible"
              variants={cardVariants}
              style={{ background: 'linear-gradient(135deg, #FF8008, #FFC837)' }}
              whileHover={{ y: -10, transition: { duration: 0.3 } }}
            >
              <CardContent>
                <StatsInfo>
                  <StatsTitle variant="p">Kehadiran Hari Ini</StatsTitle>
                  <StatsValue variant="p">{totalKehadiranHariIni.toLocaleString()}</StatsValue>
                </StatsInfo>
                <IconBox
                  as={motion.div}
                  variants={iconVariants}
                >
                  <FaCalendarCheck size={32} />
                </IconBox>
              </CardContent>
            </StatsCard>
          </Grid>

          {/* Grafik Absensi */}
          <Grid item xs={12}>
            <SectionTitle variant="h5">Data Absensi Bulan Ini</SectionTitle>
            <ChartContainer>
              <AbsensiChart />
            </ChartContainer>
          </Grid>

          {/* Tabel Absensi Harian */}
          <Grid item xs={12}>
            <SectionTitle variant="h5">Data Absensi Hari Ini</SectionTitle>
            <ChartContainer>
              <DataAbsenHarian />
            </ChartContainer>
          </Grid>
        </Grid>
      </Container>
    </DashboardContainer>
  );
};

export default DashboardAdmin;