import React, { useState, useEffect } from 'react';
import axios from 'axios';
import useSWR, { mutate } from 'swr';
import {
  Box, Container, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper,
  TextField, Button, Dialog, DialogTitle,
  DialogContent, DialogActions, Typography,
  Tabs, Tab, IconButton, Grid, MenuItem, Select,
  FormControl, InputLabel, Chip, CircularProgress,
  Alert, Snackbar, Autocomplete
} from '@mui/material';
import { FaInfoCircle, FaEdit, FaTrash, FaPlus, FaUserPlus, FaDownload, FaFilter, FaSearch, FaCalendarAlt } from 'react-icons/fa';
import { styled } from '@mui/system';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import moment from 'moment-timezone';

axios.defaults.withCredentials = true;

const DashboardContainer = styled(Box)({
  padding: '2rem',
  marginLeft: 250,
  width: 'calc(100% - 250px)',
  '@media (max-width: 768px)': {
    marginLeft: 0,
    width: '100%',
  },
});

const StyledTableCell = styled(TableCell)({
  fontWeight: 'bold',
  backgroundColor: '#f5f5f5',
});

const StyledHeaderCell = styled(TableCell)({
  fontWeight: 'bold',
  backgroundColor: '#3f51b5',
  color: 'white',
});

const FilterContainer = styled(Box)({
  marginBottom: '20px',
  padding: '15px',
  backgroundColor: '#f8f9fa',
  borderRadius: '8px',
  boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.05)',
});

const StyledPaper = styled(Paper)({
  padding: '20px',
  marginBottom: '20px',
  boxShadow: '0px 3px 6px rgba(0, 0, 0, 0.1)',
});

const StatusChip = styled(Chip)(({ status }) => ({
  backgroundColor: 
    status === 'hadir' ? '#4caf50' :
    status === 'sakit' ? '#ff9800' :
    status === 'izin' ? '#2196f3' : '#f44336',
  color: 'white',
  fontWeight: 'bold',
}));

const TabPanel = ({ children, value, index }) => {
  return (
    <div role="tabpanel" hidden={value !== index}>
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
};

const getApiBaseUrl = () => {
  const protocol = window.location.protocol === 'https:' ? 'https' : 'http';
  const baseUrl = process.env.REACT_APP_API_BASE_URL.replace(/^https?:\/\//, '');
  return `${protocol}://${baseUrl}`;
};

const fetcher = (url) => axios.get(url).then(res => res.data);

export const RekapAbsenDosen = () => {
  const [tabValue, setTabValue] = useState(0);
  const [filter, setFilter] = useState({
    searchTerm: '',
    startDate: null,
    endDate: null,
    status: '',
    matkul: ''
  });
  const [matkulList, setMatkulList] = useState([]);
  const [alertInfo, setAlertInfo] = useState({
    open: false,
    message: '',
    severity: 'info'
  });
  const [loading, setLoading] = useState(false);
  const [filteredData, setFilteredData] = useState([]);

  // Fetch attendance data
  const { data: absensiData, error, isValidating } = useSWR(
    `${getApiBaseUrl()}/absensibydosen`,
    fetcher,
    {
      refreshInterval: 60000, // Refresh every minute
      revalidateOnFocus: true
    }
  );

  useEffect(() => {
    if (absensiData && absensiData.data) {
      applyFilters(absensiData.data);
      
      // Extract unique matkul
      const uniqueMatkul = [...new Set(absensiData.data.map(item => 
        item.matkul ? item.matkul.nama_matkul : ''
      ))].filter(Boolean);
      
      setMatkulList(uniqueMatkul);
    }
  }, [absensiData, filter]);

  const applyFilters = (data) => {
    if (!data) return;
    
    let filtered = [...data];
    
    // Apply search term filter
    if (filter.searchTerm) {
      const term = filter.searchTerm.toLowerCase();
      filtered = filtered.filter(item => 
        (item.mahasiswa && item.mahasiswa.nama_lengkap && 
         item.mahasiswa.nama_lengkap.toLowerCase().includes(term)) ||
        (item.mahasiswa && item.mahasiswa.username && 
         item.mahasiswa.username.toLowerCase().includes(term)) ||
        (item.matkul && item.matkul.nama_matkul && 
         item.matkul.nama_matkul.toLowerCase().includes(term))
      );
    }
    
    // Apply date filters
    if (filter.startDate) {
      filtered = filtered.filter(item => 
        new Date(item.tgl_absensi) >= new Date(filter.startDate)
      );
    }
    
    if (filter.endDate) {
      filtered = filtered.filter(item => 
        new Date(item.tgl_absensi) <= new Date(filter.endDate)
      );
    }
    
    // Apply status filter
    if (filter.status) {
      filtered = filtered.filter(item => item.status === filter.status);
    }
    
    // Apply matkul filter
    if (filter.matkul) {
      filtered = filtered.filter(item => 
        item.matkul && item.matkul.nama_matkul === filter.matkul
      );
    }
    
    setFilteredData(filtered);
  };

  const handleFilterChange = (field, value) => {
    setFilter(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const resetFilters = () => {
    setFilter({
      searchTerm: '',
      startDate: null,
      endDate: null,
      status: '',
      matkul: ''
    });
  };

  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(18);
    doc.text('Rekap Absensi Dosen', 14, 22);
    
    // Add date
    doc.setFontSize(11);
    doc.text(`Tanggal Cetak: ${moment().format('DD MMMM YYYY, HH:mm')}`, 14, 30);
    
    // Add filters info if any
    let yPos = 38;
    if (filter.startDate || filter.endDate || filter.status || filter.matkul) {
      doc.setFontSize(11);
      doc.text('Filter yang digunakan:', 14, yPos);
      yPos += 6;
      
      if (filter.startDate) {
        doc.text(`• Tanggal Mulai: ${moment(filter.startDate).format('DD/MM/YYYY')}`, 20, yPos);
        yPos += 6;
      }
      
      if (filter.endDate) {
        doc.text(`• Tanggal Selesai: ${moment(filter.endDate).format('DD/MM/YYYY')}`, 20, yPos);
        yPos += 6;
      }
      
      if (filter.status) {
        doc.text(`• Status: ${filter.status}`, 20, yPos);
        yPos += 6;
      }
      
      if (filter.matkul) {
        doc.text(`• Mata Kuliah: ${filter.matkul}`, 20, yPos);
        yPos += 6;
      }
      
      yPos += 4;
    }
    
    // Create table
    const tableColumn = [
      'No', 'Tanggal', 'Mahasiswa', 'Mata Kuliah', 'Jam Masuk', 'Jam Keluar', 'Status'
    ];
    
    const tableRows = filteredData.map((item, index) => [
      index + 1,
      moment(item.tgl_absensi).format('DD/MM/YYYY'),
      item.mahasiswa ? item.mahasiswa.nama_lengkap : '-',
      item.matkul ? item.matkul.nama_matkul : '-',
      item.jam_masuk ? moment(item.jam_masuk, 'HH:mm:ss').format('HH:mm') : '-',
      item.jam_keluar ? moment(item.jam_keluar, 'HH:mm:ss').format('HH:mm') : '-',
      item.status || '-'
    ]);
    
    autoTable(doc, {
      startY: yPos,
      head: [tableColumn],
      body: tableRows,
      theme: 'striped',
      headerStyles: {
        fillColor: [63, 81, 181],
        textColor: 255,
        fontStyle: 'bold'
      },
      styles: {
        fontSize: 10
      }
    });
    
    // Add summary
    const finalY = doc.lastAutoTable.finalY + 10;
    doc.setFontSize(12);
    doc.text('Ringkasan:', 14, finalY);
    
    const statusCounts = filteredData.reduce((acc, item) => {
      acc[item.status] = (acc[item.status] || 0) + 1;
      return acc;
    }, {});
    
    doc.setFontSize(10);
    doc.text(`• Total Data: ${filteredData.length}`, 20, finalY + 7);
    doc.text(`• Hadir: ${statusCounts.hadir || 0}`, 20, finalY + 14);
    doc.text(`• Sakit: ${statusCounts.sakit || 0}`, 20, finalY + 21);
    doc.text(`• Izin: ${statusCounts.izin || 0}`, 20, finalY + 28);
    
    doc.save('rekap-absensi-dosen.pdf');
    
    setAlertInfo({
      open: true,
      message: 'Berhasil mengunduh rekap absensi',
      severity: 'success'
    });
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleCloseAlert = () => {
    setAlertInfo(prev => ({
      ...prev,
      open: false
    }));
  };

  // Generate summary data
  const generateSummary = () => {
    if (!filteredData.length) return {
      total: 0,
      hadir: 0,
      sakit: 0,
      izin: 0,
      byMatkul: {},
      byDate: {}
    };
    
    const summary = {
      total: filteredData.length,
      hadir: 0,
      sakit: 0,
      izin: 0,
      byMatkul: {},
      byDate: {}
    };
    
    filteredData.forEach(item => {
      // Count by status
      if (item.status) {
        summary[item.status] = (summary[item.status] || 0) + 1;
      }
      
      // Group by matkul
      if (item.matkul && item.matkul.nama_matkul) {
        const matkulName = item.matkul.nama_matkul;
        if (!summary.byMatkul[matkulName]) {
          summary.byMatkul[matkulName] = {
            total: 0,
            hadir: 0,
            sakit: 0,
            izin: 0
          };
        }
        
        summary.byMatkul[matkulName].total += 1;
        if (item.status) {
          summary.byMatkul[matkulName][item.status] += 1;
        }
      }
      
      // Group by date
      if (item.tgl_absensi) {
        const date = moment(item.tgl_absensi).format('YYYY-MM-DD');
        if (!summary.byDate[date]) {
          summary.byDate[date] = {
            total: 0,
            hadir: 0,
            sakit: 0,
            izin: 0
          };
        }
        
        summary.byDate[date].total += 1;
        if (item.status) {
          summary.byDate[date][item.status] += 1;
        }
      }
    });
    
    return summary;
  };

  const summary = generateSummary();

  if (error) {
    return (
      <DashboardContainer>
        <Alert severity="error">
          Error loading data: {error.message || 'Unknown error'}
        </Alert>
      </DashboardContainer>
    );
  }

  return (
    <DashboardContainer>
      <StyledPaper>
        <Typography variant="h4" gutterBottom>
          Rekap Absensi Dosen
        </Typography>
        
        <Tabs value={tabValue} onChange={handleTabChange} sx={{ mb: 2 }}>
          <Tab label="Data Absensi" />
          <Tab label="Ringkasan" />
        </Tabs>
        
        <FilterContainer>
          <Typography variant="h6" gutterBottom>
            <FaFilter style={{ marginRight: '8px' }} /> Filter Data
          </Typography>
          
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                label="Cari Mahasiswa/Matkul"
                variant="outlined"
                value={filter.searchTerm}
                onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
                InputProps={{
                  startAdornment: <FaSearch style={{ marginRight: '8px' }} />
                }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6} md={2}>
              <TextField
                fullWidth
                label="Tanggal Mulai"
                type="date"
                value={filter.startDate ? moment(filter.startDate).format('YYYY-MM-DD') : ''}
                onChange={(e) => handleFilterChange('startDate', e.target.value)}
                InputProps={{
                  startAdornment: <FaCalendarAlt style={{ marginRight: '8px' }} />
                }}
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6} md={2}>
              <TextField
                fullWidth
                label="Tanggal Selesai"
                type="date"
                value={filter.endDate ? moment(filter.endDate).format('YYYY-MM-DD') : ''}
                onChange={(e) => handleFilterChange('endDate', e.target.value)}
                InputProps={{
                  startAdornment: <FaCalendarAlt style={{ marginRight: '8px' }} />
                }}
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={filter.status}
                  label="Status"
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                >
                  <MenuItem value="">Semua</MenuItem>
                  <MenuItem value="hadir">Hadir</MenuItem>
                  <MenuItem value="sakit">Sakit</MenuItem>
                  <MenuItem value="izin">Izin</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth>
                <InputLabel>Mata Kuliah</InputLabel>
                <Select
                  value={filter.matkul}
                  label="Mata Kuliah"
                  onChange={(e) => handleFilterChange('matkul', e.target.value)}
                >
                  <MenuItem value="">Semua</MenuItem>
                  {matkulList.map((matkul, index) => (
                    <MenuItem key={index} value={matkul}>
                      {matkul}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} container justifyContent="flex-end" spacing={1}>
              <Grid item>
                <Button
                  variant="outlined"
                  onClick={resetFilters}
                  startIcon={<FaFilter />}
                >
                  Reset Filter
                </Button>
              </Grid>
              
              <Grid item>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleDownloadPDF}
                  startIcon={<FaDownload />}
                  disabled={!filteredData.length}
                >
                  Unduh PDF
                </Button>
              </Grid>
            </Grid>
          </Grid>
        </FilterContainer>
        
        <TabPanel value={tabValue} index={0}>
          {isValidating && !absensiData ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <>
              <Typography variant="subtitle1" gutterBottom>
                Menampilkan {filteredData.length} data absensi
              </Typography>
              
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <StyledHeaderCell>No</StyledHeaderCell>
                      <StyledHeaderCell>Tanggal</StyledHeaderCell>
                      <StyledHeaderCell>Nama Mahasiswa</StyledHeaderCell>
                      <StyledHeaderCell>Username</StyledHeaderCell>
                      <StyledHeaderCell>Mata Kuliah</StyledHeaderCell>
                      <StyledHeaderCell>Hari</StyledHeaderCell>
                      <StyledHeaderCell>Jam Masuk</StyledHeaderCell>
                      <StyledHeaderCell>Jam Keluar</StyledHeaderCell>
                      <StyledHeaderCell>Status</StyledHeaderCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredData.length > 0 ? (
                      filteredData.map((item, index) => (
                        <TableRow key={item.id}>
                          <TableCell>{index + 1}</TableCell>
                          <TableCell>
                            {moment(item.tgl_absensi).format('DD/MM/YYYY')}
                          </TableCell>
                          <TableCell>
                            {item.mahasiswa ? item.mahasiswa.nama_lengkap : '-'}
                          </TableCell>
                          <TableCell>
                            {item.mahasiswa ? item.mahasiswa.username : '-'}
                          </TableCell>
                          <TableCell>
                            {item.matkul ? item.matkul.nama_matkul : '-'}
                          </TableCell>
                          <TableCell>
                            {item.matkul ? item.matkul.hari : '-'}
                          </TableCell>
                          <TableCell>
                            {item.jam_masuk ? moment(item.jam_masuk, 'HH:mm:ss').format('HH:mm') : '-'}
                          </TableCell>
                          <TableCell>
                            {item.jam_keluar ? moment(item.jam_keluar, 'HH:mm:ss').format('HH:mm') : '-'}
                          </TableCell>
                          <TableCell>
                            <StatusChip 
                              label={item.status || 'N/A'} 
                              status={item.status}
                            />
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={9} align="center">
                          Tidak ada data absensi yang ditemukan
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </>
          )}
        </TabPanel>
        
        <TabPanel value={tabValue} index={1}>
          <Grid container spacing={3}>
            {/* Overall Summary */}
            <Grid item xs={12} md={6}>
              <StyledPaper>
                <Typography variant="h6" gutterBottom>
                  Ringkasan Absensi
                </Typography>
                <Box sx={{ mt: 2 }}>
                  <Typography variant="body1">
                    Total Data: <strong>{summary.total}</strong>
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                    <StatusChip label={`Hadir: ${summary.hadir}`} status="hadir" />
                    <StatusChip label={`Sakit: ${summary.sakit}`} status="sakit" />
                    <StatusChip label={`Izin: ${summary.izin}`} status="izin" />
                  </Box>
                </Box>
              </StyledPaper>
            </Grid>
            
            {/* By Matkul Summary */}
            <Grid item xs={12} md={6}>
              <StyledPaper>
                <Typography variant="h6" gutterBottom>
                  Berdasarkan Mata Kuliah
                </Typography>
                {Object.keys(summary.byMatkul).length > 0 ? (
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <StyledTableCell>Mata Kuliah</StyledTableCell>
                          <StyledTableCell align="center">Total</StyledTableCell>
                          <StyledTableCell align="center">Hadir</StyledTableCell>
                          <StyledTableCell align="center">Sakit</StyledTableCell>
                          <StyledTableCell align="center">Izin</StyledTableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {Object.entries(summary.byMatkul).map(([matkul, data], index) => (
                          <TableRow key={index}>
                            <TableCell>{matkul}</TableCell>
                            <TableCell align="center">{data.total}</TableCell>
                            <TableCell align="center">{data.hadir}</TableCell>
                            <TableCell align="center">{data.sakit}</TableCell>
                            <TableCell align="center">{data.izin}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                ) : (
                  <Typography variant="body2">Tidak ada data</Typography>
                )}
              </StyledPaper>
            </Grid>
            
            {/* By Date Summary */}
            <Grid item xs={12}>
              <StyledPaper>
                <Typography variant="h6" gutterBottom>
                  Berdasarkan Tanggal
                </Typography>
                {Object.keys(summary.byDate).length > 0 ? (
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <StyledTableCell>Tanggal</StyledTableCell>
                          <StyledTableCell align="center">Total</StyledTableCell>
                          <StyledTableCell align="center">Hadir</StyledTableCell>
                          <StyledTableCell align="center">Sakit</StyledTableCell>
                          <StyledTableCell align="center">Izin</StyledTableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {Object.entries(summary.byDate)
                          .sort(([dateA], [dateB]) => new Date(dateB) - new Date(dateA))
                          .map(([date, data], index) => (
                            <TableRow key={index}>
                              <TableCell>{moment(date).format('DD MMMM YYYY')}</TableCell>
                              <TableCell align="center">{data.total}</TableCell>
                              <TableCell align="center">{data.hadir}</TableCell>
                              <TableCell align="center">{data.sakit}</TableCell>
                              <TableCell align="center">{data.izin}</TableCell>
                            </TableRow>
                          ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                ) : (
                  <Typography variant="body2">Tidak ada data</Typography>
                )}
              </StyledPaper>
            </Grid>
          </Grid>
        </TabPanel>
      </StyledPaper>
      
      <Snackbar
        open={alertInfo.open}
        autoHideDuration={6000}
        onClose={handleCloseAlert}
      >
        <Alert 
          onClose={handleCloseAlert} 
          severity={alertInfo.severity}
          sx={{ width: '100%' }}
        >
          {alertInfo.message}
        </Alert>
      </Snackbar>
    </DashboardContainer>
  );
};