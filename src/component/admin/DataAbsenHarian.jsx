import React, { useState } from 'react'; 
import axios from 'axios';
import useSWR from 'swr';
import { 
  Container, 
  Typography, 
  Box, 
  Card, 
  CardContent, 
  Divider,
  Grid,
  TextField,
  InputAdornment,
  CircularProgress,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Paper,
  Tab,
  Tabs,
  Alert
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PersonIcon from '@mui/icons-material/Person';
import BusinessIcon from '@mui/icons-material/Business';
import styled from 'styled-components';
import Lokasi from './lokasi';

axios.defaults.withCredentials = true;

const getApiBaseUrl = () => {
  const protocol = window.location.protocol === 'https:' ? 'https' : 'http';
  const baseUrl = process.env.REACT_APP_API_BASE_URL.replace(/^https?:\/\//, '');
  return `${protocol}://${baseUrl}`;
};

const fetcher = (url) => axios.get(url).then(res => res.data);

// Styled components
const StyledContainer = styled(Container)`
  padding: 2rem 1rem;
`;

const PageHeader = styled(Typography)`
  margin-bottom: 1.5rem;
  font-weight: 600;
  position: relative;
  padding-bottom: 0.5rem;
  
  &:after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    width: 50px;
    height: 3px;
    background: #3f51b5;
  }
`;

const CabangCard = styled(Card)`
  margin-bottom: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  overflow: hidden;
`;

const CabangHeader = styled(Box)`
  background-color: #f5f7ff;
  padding: 1rem 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const CabangTitle = styled(Typography)`
  font-weight: 600;
  color: #3f51b5;
`;

const AbsenRow = styled(Box)`
  display: flex;
  align-items: center;
  padding: 0.75rem 1.5rem;
  border-bottom: 1px solid #f0f0f0;
  transition: background-color 0.2s;
  
  &:last-child {
    border-bottom: none;
  }
  
  &:hover {
    background-color: #f9f9f9;
    cursor: pointer;
  }
`;

const AbsenInfo = styled(Box)`
  flex: 1;
  display: flex;
  flex-direction: column;
`;

const EmployeeName = styled(Typography)`
  font-weight: 500;
`;

const AbsenTime = styled(Box)`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.25rem;
`;

const StyledChip = styled(Chip)`
  border-radius: 4px;
  height: 24px;
  font-size: 0.75rem;
`;

const SearchField = styled(TextField)`
  background-color: white;
  border-radius: 8px;
  
  .MuiOutlinedInput-root {
    border-radius: 8px;
  }
`;

const DetailDialog = styled(Dialog)`
  .MuiDialog-paper {
    border-radius: 12px;
    overflow: hidden;
  }
`;

const DialogImageContainer = styled(Box)`
  width: 100%;
  display: flex;
  justify-content: center;
  margin: 1rem 0;
`;

const DialogImage = styled('img')`
  max-width: 100%;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
`;

const InfoItem = styled(Box)`
  display: flex;
  margin-bottom: 0.75rem;
  align-items: flex-start;
  
  svg {
    margin-top: 3px;
    margin-right: 8px;
    color: #3f51b5;
  }
`;

const MapContainer = styled(Box)`
  height: 300px;
  width: 100%;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
`;

const NoDataContainer = styled(Box)`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 2rem;
  text-align: center;
`;

const EmptyStateText = styled(Typography)`
  color: #666;
`;

const DataAbsenHarian = () => {
  const { data, error } = useSWR(`${getApiBaseUrl()}/absensihari/get`, fetcher);
  const [showModal, setShowModal] = useState(false);
  const [selectedAbsen, setSelectedAbsen] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState(0);

  if (error) return (
    <StyledContainer>
      <Alert severity="error">Error loading data. Please try again later.</Alert>
    </StyledContainer>
  );
  
  if (!data) return (
    <StyledContainer>
      <Box display="flex" justifyContent="center" alignItems="center" height="50vh">
        <CircularProgress />
      </Box>
    </StyledContainer>
  );

  const { absensiHarian } = data;

  // Mengelompokkan absensi berdasarkan cabang
  const absensiPerCabang = absensiHarian.reduce((acc, absen) => {
    const cabang = absen.mahasiswa.Cabang.nama;
    if (!acc[cabang]) {
      acc[cabang] = [];
    }
    acc[cabang].push(absen);
    return acc;
  }, {});

  // Filter berdasarkan cabang yang sesuai dengan input pencarian
  const filteredCabang = Object.keys(absensiPerCabang).filter(cabang => 
    cabang.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleRowClick = (absen) => {
    setSelectedAbsen(absen);
    setShowModal(true);
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  return (
    <StyledContainer maxWidth="lg">
      {/* <PageHeader variant="h4">Data Absensi Hari Ini</PageHeader> */}
      
      <Box mb={3}>
        <SearchField
          fullWidth
          variant="outlined"
          placeholder="Cari berdasarkan cabang..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
            endAdornment: searchTerm && (
              <InputAdornment position="end">
                <CloseIcon 
                  style={{ cursor: 'pointer' }} 
                  onClick={() => setSearchTerm('')}
                />
              </InputAdornment>
            )
          }}
        />
      </Box>
      
      {filteredCabang.length === 0 ? (
        <NoDataContainer>
          <Paper 
            elevation={0} 
            sx={{ 
              padding: 4, 
              borderRadius: 2, 
              backgroundColor: '#f9f9f9', 
              width: '100%' 
            }}
          >
            <EmptyStateText variant="h6">
              Tidak ada data yang sesuai dengan pencarian "{searchTerm}".
            </EmptyStateText>
          </Paper>
        </NoDataContainer>
      ) : (
        filteredCabang.map((cabang, cabangIndex) => (
          <CabangCard key={cabangIndex}>
            <CabangHeader>
              <CabangTitle variant="h6">
                <BusinessIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
                {cabang}
              </CabangTitle>
              <Typography variant="subtitle2" color="textSecondary">
                {absensiPerCabang[cabang].length} mahasiswa
              </Typography>
            </CabangHeader>
            
            <CardContent sx={{ padding: 0 }}>
              {absensiPerCabang[cabang].map((absen, index) => (
                <AbsenRow key={absen.id} onClick={() => handleRowClick(absen)}>
                  <Typography variant="body2" color="textSecondary" sx={{ width: 40, textAlign: 'center' }}>
                    {index + 1}
                  </Typography>
                  
                  <AbsenInfo>
                    <EmployeeName variant="body1">{absen.mahasiswa.nama_lengkap}</EmployeeName>
                    <AbsenTime>
                      <CalendarTodayIcon fontSize="small" color="action" />
                      <Typography variant="body2" color="textSecondary">
                        {new Date(absen.tgl_absensi).toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                      </Typography>
                    </AbsenTime>
                  </AbsenInfo>
                  
                  <Box display="flex" alignItems="center" gap={1}>
                    <Box textAlign="right" mr={1}>
                      <Typography variant="body2" color="textSecondary">Masuk</Typography>
                      <Typography variant="body1">{absen.jam_masuk}</Typography>
                    </Box>
                    <Divider orientation="vertical" flexItem />
                    <Box textAlign="left" ml={1}>
                      <Typography variant="body2" color="textSecondary">Keluar</Typography>
                      <Typography variant="body1">{absen.jam_keluar || '-'}</Typography>
                    </Box>
                      <Box textAlign="left" ml={1}>
                      <Typography variant="body2" color="textSecondary">Status</Typography>
                      <Typography variant="body1">
                        {absen.status === 'izin' ? 'Izin' :
                        absen.status === 'sakit' ? 'Sakit' :
                        absen.status || '-'}
                      </Typography>
                    </Box>
                  </Box>
                  
                 <Box ml={2}>
                        {absen.status === 'izin' || absen.status === 'sakit' ? (
                          <StyledChip 
                            label={absen.status === 'izin' ? 'Izin' : 'Sakit'} 
                            color="info"
                            size="small"
                          />
                        ) : (
                          <StyledChip 
                            label={absen.jam_keluar ? "Lengkap" : "Masuk saja"} 
                            color={absen.jam_keluar ? "success" : "warning"}
                            size="small"
                          />
                        )}
                      </Box>
                  
                  <Button 
                    variant="outlined" 
                    size="small" 
                    sx={{ ml: 2, borderRadius: 2 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRowClick(absen);
                    }}
                  >
                    Detail
                  </Button>
                </AbsenRow>
              ))}
            </CardContent>
          </CabangCard>
        ))
      )}
      
      <DetailDialog
        fullWidth
        maxWidth="md"
        open={showModal}
        onClose={() => setShowModal(false)}
      >
        <DialogTitle sx={{ backgroundColor: '#f5f7ff', p: 2 }}>
          <Typography variant="h6">Detail Absensi</Typography>
        </DialogTitle>
        
        <DialogContent dividers sx={{ p: 3 }}>
          {selectedAbsen && (
            <>
              <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
                <Tabs 
                  value={activeTab} 
                  onChange={handleTabChange}
                  variant="fullWidth"
                >
                  <Tab label="Informasi Absensi" />
                  <Tab label="Lokasi" />
                </Tabs>
              </Box>
              
              {activeTab === 0 && (
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Box mb={3}>
                      <InfoItem>
                        <PersonIcon />
                        <Box>
                          <Typography variant="subtitle2">Nama Mahasiswa</Typography>
                          <Typography variant="body1">{selectedAbsen.mahasiswa.nama_lengkap}</Typography>
                        </Box>
                      </InfoItem>
                      
                      <InfoItem>
                        <BusinessIcon />
                        <Box>
                          <Typography variant="subtitle2">Nama Cabang</Typography>
                          <Typography variant="body1">{selectedAbsen.mahasiswa.Cabang.nama}</Typography>
                        </Box>
                      </InfoItem>
                      
                      <InfoItem>
                        <CalendarTodayIcon />
                        <Box>
                          <Typography variant="subtitle2">Tanggal Absensi</Typography>
                          <Typography variant="body1">
                            {new Date(selectedAbsen.tgl_absensi).toLocaleDateString('id-ID', { 
                              weekday: 'long', 
                              day: 'numeric', 
                              month: 'long', 
                              year: 'numeric' 
                            })}
                          </Typography>
                        </Box>
                      </InfoItem>
                      
                      <InfoItem>
                        <AccessTimeIcon />
                        <Box>
                          <Typography variant="subtitle2">Jam Masuk</Typography>
                          <Typography variant="body1">{selectedAbsen.jam_masuk}</Typography>
                        </Box>
                      </InfoItem>
                      
                      <InfoItem>
                        <AccessTimeIcon />
                        <Box>
                          <Typography variant="subtitle2">Jam Keluar</Typography>
                          <Typography variant="body1">
                            {selectedAbsen.jam_keluar || 
                              <Chip 
                                label="Belum absen keluar" 
                                size="small" 
                                color="warning"
                                sx={{ height: 24, fontSize: '0.75rem' }}
                              />
                            }
                          </Typography>
                        </Box>
                      </InfoItem>
                      
                      {selectedAbsen.lokasi_masuk && (
                        <InfoItem>
                          <LocationOnIcon />
                          <Box>
                            <Typography variant="subtitle2">Koordinat Masuk</Typography>
                            <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                              {selectedAbsen.lokasi_masuk}
                            </Typography>
                          </Box>
                        </InfoItem>
                      )}
                    </Box>
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle1" fontWeight={500} mb={1}>Foto Masuk</Typography>
                    {selectedAbsen.foto_masuk ? (
                      <DialogImageContainer>
                        <DialogImage 
                          src={`${getApiBaseUrl()}/uploads/absensi/${selectedAbsen.foto_masuk}`} 
                          alt="Foto Masuk" 
                        />
                      </DialogImageContainer>
                    ) : (
                      <Box p={3} textAlign="center">
                        <Typography variant="body2" color="textSecondary">
                          Foto Masuk tidak tersedia
                        </Typography>
                      </Box>
                    )}
                  </Grid>
                </Grid>
              )}
              
              {activeTab === 1 && (
                <Box>
                  <Typography variant="subtitle1" fontWeight={500} mb={2}>Lokasi Absensi Masuk</Typography>
                  {selectedAbsen.lokasi_masuk ? (
                    <MapContainer>
                      <Lokasi
                        latitude={parseFloat(selectedAbsen.lokasi_masuk.split(',')[0])}
                        longitude={parseFloat(selectedAbsen.lokasi_masuk.split(',')[1])}
                      />
                    </MapContainer>
                  ) : (
                    <Box p={4} textAlign="center">
                      <Typography variant="body1" color="textSecondary">
                        Data lokasi tidak tersedia
                      </Typography>
                    </Box>
                  )}
                </Box>
              )}
            </>
          )}
        </DialogContent>
        
        <DialogActions sx={{ p: 2 }}>
          <Button 
            onClick={() => setShowModal(false)}
            variant="contained"
            disableElevation
            sx={{ borderRadius: '8px' }}
          >
            Tutup
          </Button>
        </DialogActions>
      </DetailDialog>
    </StyledContainer>
  );
};

export default DataAbsenHarian;