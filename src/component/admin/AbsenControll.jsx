import React, { useState } from 'react';
import useSWR from 'swr';
import axios from 'axios';
import { 
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, 
  Paper, IconButton, TextField, Select, MenuItem, FormControl, 
  InputLabel, Modal, Box, Typography, Grid, Card, CardContent,
  Chip, Button, Tooltip, Badge, InputAdornment
} from '@mui/material';
import { FaTrashAlt, FaEdit, FaSearch, FaCalendarAlt, FaSort, FaFilter } from 'react-icons/fa';
import FormEditAbsensi from './FormEditAbsensi';
import styled from 'styled-components';

axios.defaults.withCredentials = true;

const DashboardContainer = styled(Box)({
  padding: '2rem 1rem',
  marginLeft: 250,
  width: 'calc(100% - 250px)',
  '@media (max-width: 768px)': {
    marginLeft: 0,
    width: '100%',
    padding: '1rem 0.5rem',
  },
});

const FilterCard = styled(Card)({
  marginBottom: '20px',
  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
  borderRadius: '12px',
});

const TableWrapper = styled(TableContainer)({
  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
  borderRadius: '12px',
  overflow: 'hidden',
  marginBottom: '20px',
});

const StyledTableRow = styled(TableRow)({
  '&:nth-of-type(odd)': {
    backgroundColor: '#f9f9f9',
  },
  '&:hover': {
    backgroundColor: '#f1f1f1',
  },
});

const StyledTableCell = styled(TableCell)({
  padding: '16px',
});

const StyledTableHeader = styled(TableCell)({
  backgroundColor: '#f0f4f8',
  color: '#3a3a3a',
  fontWeight: '600',
  padding: '16px',
});

const ActionButton = styled(IconButton)({
  marginRight: '8px',
});

const SortableHeader = styled(StyledTableHeader)({
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
});

const PaginationControls = styled(Box)({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '16px',
  backgroundColor: 'white',
  borderRadius: '12px',
  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
});

const PaginationButton = styled(Button)({
  textTransform: 'none',
  borderRadius: '8px',
  padding: '8px 16px',
});

const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: { xs: '90%', sm: '400px' },
  bgcolor: 'background.paper',
  boxShadow: 24,
  borderRadius: 2,
  p: 4,
};

const getApiBaseUrl = () => {
  const protocol = window.location.protocol === 'https:' ? 'https' : 'http';
  const baseUrl = process.env.REACT_APP_API_BASE_URL.replace(/^https?:\/\//, '');
  return `${protocol}://${baseUrl}`;
};

const fetcher = (url) => axios.get(url).then(res => res.data);

const monthNames = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember"
];

const AbsenControll = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortDirection, setSortDirection] = useState('desc'); // Default to newest first
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [editId, setEditId] = useState(null);
  const [showFilters, setShowFilters] = useState(false);

  const { data, error, mutate } = useSWR(`${getApiBaseUrl()}/absensiall/get`, fetcher, { refreshInterval: 5000 });

  if (error) return (
    <DashboardContainer>
      <Card sx={{ p: 3, textAlign: 'center', backgroundColor: '#ffe6e6' }}>
        <Typography variant="h6" color="error">
          Terjadi kesalahan saat memuat data. Silahkan refresh halaman.
        </Typography>
        <Button variant="contained" color="primary" sx={{ mt: 2 }} onClick={() => window.location.reload()}>
          Refresh Halaman
        </Button>
      </Card>
    </DashboardContainer>
  );
  
  if (!data) return (
    <DashboardContainer>
      <Card sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h6" color="primary">
          Memuat data absensi...
        </Typography>
      </Card>
    </DashboardContainer>
  );

  const filteredData = data.filter(absensi => {
    const absensiDate = new Date(absensi.tgl_absensi);
    const matchesSearch = 
      (absensi.karyawan.nama_lengkap && absensi.karyawan.nama_lengkap.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (absensi.tgl_absensi && absensi.tgl_absensi.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (absensi.jam_masuk && absensi.jam_masuk.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (absensi.jam_keluar && absensi.jam_keluar.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesMonthYear = 
      (!selectedMonth || absensiDate.getMonth() + 1 === parseInt(selectedMonth)) &&
      (!selectedYear || absensiDate.getFullYear() === parseInt(selectedYear));

    return matchesSearch && matchesMonthYear;
  });

  const sortedData = filteredData.sort((a, b) => {
    const dateA = new Date(a.tgl_absensi);
    const dateB = new Date(b.tgl_absensi);
    return sortDirection === 'asc' ? dateA - dateB : dateB - dateA;
  });

  const itemsPerPage = 25;
  const totalPages = Math.ceil(sortedData.length / itemsPerPage);
  const currentPageData = sortedData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  
  const deleteAbsensi = async (id) => {
    if (window.confirm('Apakah anda ingin menghapus absensi?')) {
      try {
        await axios.delete(`${getApiBaseUrl()}/absensi/${id}`, { withCredentials: true });
        mutate();
      } catch (error) {
        console.error('Gagal menghapus absensi:', error);
      }
    }
  };
  
  const getYears = (yearsCount) => {
    const currentYear = new Date().getFullYear();
    return [...Array(yearsCount)].map((_, index) => currentYear - yearsCount + 1 + index);
  };

  const handleSort = () => {
    setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
  };

  const resetFilters = () => {
    setSelectedMonth('');
    setSelectedYear('');
    setSearchTerm('');
    setCurrentPage(1);
  };

  const formatDate = (dateString) => {
    const options = { day: 'numeric', month: 'long', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('id-ID', options);
  };

  const getStatusChip = (jamMasuk, jamKeluar) => {
    if (!jamMasuk) return <Chip label="Tidak Hadir" color="error" size="small" />;
    if (!jamKeluar) return <Chip label="Belum Keluar" color="warning" size="small" />;
    return <Chip label="Hadir" color="success" size="small" />;
  };

  return (
    <DashboardContainer>
      <FilterCard>
        <CardContent>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField 
                label="Cari Karyawan atau Tanggal" 
                variant="outlined" 
                fullWidth 
                value={searchTerm} 
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <FaSearch />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Box display="flex" justifyContent="flex-end">
                <Button 
                  variant="outlined" 
                  startIcon={<FaFilter />}
                  onClick={() => setShowFilters(!showFilters)}
                  sx={{ mr: 1 }}
                >
                  Filter
                </Button>
                <Button 
                  variant="outlined" 
                  color="secondary"
                  onClick={resetFilters}
                >
                  Reset
                </Button>
              </Box>
            </Grid>
            
            {showFilters && (
              <>
                <Grid item xs={12} sm={6}>
                  <FormControl variant="outlined" fullWidth>
                    <InputLabel>Bulan</InputLabel>
                    <Select
                      value={selectedMonth}
                      onChange={(e) => setSelectedMonth(e.target.value)}
                      label="Bulan"
                      startAdornment={
                        <InputAdornment position="start">
                          <FaCalendarAlt style={{ marginRight: '8px' }} />
                        </InputAdornment>
                      }
                    >
                      <MenuItem value="">Semua Bulan</MenuItem>
                      {monthNames.map((month, index) => (
                        <MenuItem key={index + 1} value={index + 1}>{month}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl variant="outlined" fullWidth>
                    <InputLabel>Tahun</InputLabel>
                    <Select
                      value={selectedYear}
                      onChange={(e) => setSelectedYear(e.target.value)}
                      label="Tahun"
                    >
                      <MenuItem value="">Semua Tahun</MenuItem>
                      {getYears(10).map((year) => (
                        <MenuItem key={year} value={year}>{year}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              </>
            )}
          </Grid>
          
          {(selectedMonth || selectedYear || searchTerm) && (
            <Box mt={2}>
              <Typography variant="body2" color="textSecondary">
                Filter aktif: {' '}
                {selectedMonth && (
                  <Chip 
                    label={`Bulan: ${monthNames[parseInt(selectedMonth) - 1]}`} 
                    size="small" 
                    onDelete={() => setSelectedMonth('')}
                    sx={{ mr: 1 }} 
                  />
                )}
                {selectedYear && (
                  <Chip 
                    label={`Tahun: ${selectedYear}`} 
                    size="small" 
                    onDelete={() => setSelectedYear('')}
                    sx={{ mr: 1 }} 
                  />
                )}
                {searchTerm && (
                  <Chip 
                    label={`Pencarian: ${searchTerm}`} 
                    size="small" 
                    onDelete={() => setSearchTerm('')} 
                  />
                )}
              </Typography>
            </Box>
          )}
        </CardContent>
      </FilterCard>

      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6" component="h2">
          Data Absensi
        </Typography>
        <Badge badgeContent={filteredData.length} color="primary" showZero>
          <Typography variant="body2">Total Data</Typography>
        </Badge>
      </Box>

      <TableWrapper component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <StyledTableHeader>No</StyledTableHeader>
              <StyledTableHeader>Nama Karyawan</StyledTableHeader>
              <SortableHeader onClick={handleSort}>
                Tanggal
                <FaSort style={{ opacity: 0.5 }} />
              </SortableHeader>
              <StyledTableHeader>Jam Masuk</StyledTableHeader>
              <StyledTableHeader>Jam Keluar</StyledTableHeader>
              <StyledTableHeader>Status</StyledTableHeader>
              <StyledTableHeader>Aksi</StyledTableHeader>
            </TableRow>
          </TableHead>
          <TableBody>
            {currentPageData.length > 0 ? (
              currentPageData.map((absensi, index) => (
                <StyledTableRow key={absensi.id}>
                  <StyledTableCell>{(currentPage - 1) * itemsPerPage + index + 1}</StyledTableCell>
                  <StyledTableCell>{absensi.karyawan.nama_lengkap}</StyledTableCell>
                  <StyledTableCell>{formatDate(absensi.tgl_absensi)}</StyledTableCell>
                  <StyledTableCell>{absensi.jam_masuk || '-'}</StyledTableCell>
                  <StyledTableCell>{absensi.jam_keluar || '-'}</StyledTableCell>
                  <StyledTableCell>
                    {getStatusChip(absensi.jam_masuk, absensi.jam_keluar)}
                  </StyledTableCell>
                  <StyledTableCell>
                    <Tooltip title="Edit">
                      <ActionButton color="primary" onClick={() => setEditId(absensi.id)}>
                        <FaEdit />
                      </ActionButton>
                    </Tooltip>
                    <Tooltip title="Hapus">
                      <ActionButton color="error" onClick={() => deleteAbsensi(absensi.id)}>
                        <FaTrashAlt />
                      </ActionButton>
                    </Tooltip>
                  </StyledTableCell>
                </StyledTableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
                  <Typography variant="body1" color="textSecondary">
                    Tidak ada data absensi yang ditemukan.
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableWrapper>
      
      {totalPages > 0 && (
        <PaginationControls>
          <Typography variant="body2">
            Halaman {currentPage} dari {totalPages}
          </Typography>
          
          <Box>
            <PaginationButton 
              variant="outlined" 
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(currentPage - 1)}
              sx={{ mr: 1 }}
            >
              Sebelumnya
            </PaginationButton>
            <PaginationButton 
              variant="contained" 
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(currentPage + 1)}
            >
              Selanjutnya
            </PaginationButton>
          </Box>
        </PaginationControls>
      )}
      
      <Modal open={Boolean(editId)} onClose={() => setEditId(null)}>
        <Box sx={modalStyle}>
          <Typography variant="h6" component="h2" mb={2}>
            Edit Data Absensi
          </Typography>
          <FormEditAbsensi id={editId} onClose={() => setEditId(null)} mutate={mutate} />
        </Box>
      </Modal>
    </DashboardContainer>
  );
};

export default AbsenControll;