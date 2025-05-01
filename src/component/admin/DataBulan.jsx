import React, { useState, useRef } from 'react';
import axios from 'axios';
import useSWR from 'swr';
import jsPDF from 'jspdf';
import "jspdf-autotable";
import { 
  Box, 
  Container,
  Paper,
  Typography,
  Grid,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Alert,
  Stack,
  Divider,
  Card,
  CardHeader,
  CardContent,
  CardActions,
  IconButton,
  Tooltip,
  useTheme,
  useMediaQuery,
  Collapse,
  LinearProgress
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  FileXls,
  FilePdf,
  Calendar,
  CaretRight,
  MagnifyingGlass,
  Warning,
  CaretDown,
  CaretUp
} from '@phosphor-icons/react';
import 'bootstrap/dist/css/bootstrap.min.css';

axios.defaults.withCredentials = true;

const getApiBaseUrl = () => {
  const protocol = window.location.protocol === 'https:' ? 'https' : 'http';
  const baseUrl = process.env.REACT_APP_API_BASE_URL.replace(/^https?:\/\//, '');
  return `${protocol}://${baseUrl}`;
};

const fetcher = async (url) => {
  try {
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Utility function to calculate lesson duration
const calculateLessonDuration = (jamMasuk, jamKeluar) => {
  if (!jamMasuk || !jamKeluar) return { totalHours: 0, totalMinutes: 0 };
  
  // Parse time strings
  const [inHour, inMinute] = jamMasuk.split(':').map(Number);
  const [outHour, outMinute] = jamKeluar.split(':').map(Number);
  
  // Calculate total minutes
  let totalMinutes = (outHour * 60 + outMinute) - (inHour * 60 + inMinute);
  
  // Handle negative time (if someone clocked out the next day)
  if (totalMinutes < 0) {
    totalMinutes += 24 * 60; // Add a full day in minutes
  }
  
  // Convert to hours and minutes
  const totalHours = Math.floor(totalMinutes / 60);
  const remainingMinutes = totalMinutes % 60;
  
  return {
    totalHours,
    totalMinutes: remainingMinutes
  };
};

// Format time to display as HH:MM
const formatTime = (hours, minutes) => {
  return `${hours}:${minutes.toString().padStart(2, '0')}`;
};

// Styled components
const ContentContainer = styled(Container)(({ theme }) => ({
  padding: theme.spacing(3),
  marginLeft: '250px',
  width: 'calc(100% - 250px)',
  [theme.breakpoints.down('md')]: {
    marginLeft: 0,
    width: '100%',
  },
}));

const StyledTableContainer = styled(TableContainer)(({ theme }) => ({
  maxHeight: '70vh',
  marginTop: theme.spacing(2),
  borderRadius: theme.shape.borderRadius,
  boxShadow: theme.shadows[2],
  overflow: 'auto',
  '&::-webkit-scrollbar': {
    width: '0.4em',
    height: '0.4em',
  },
  '&::-webkit-scrollbar-track': {
    background: theme.palette.grey[100],
  },
  '&::-webkit-scrollbar-thumb': {
    backgroundColor: theme.palette.primary.main,
    borderRadius: '4px',
  },
}));

const StickyTableCell = styled(TableCell)(({ theme }) => ({
  position: 'sticky',
  left: 0,
  background: theme.palette.background.paper,
  zIndex: 1,
  boxShadow: '2px 0px 3px rgba(0,0,0,0.1)',
}));

const SubtleCard = styled(Card)(({ theme }) => ({
  boxShadow: '0 4px 10px rgba(0,0,0,0.05)',
  borderRadius: theme.shape.borderRadius * 1.5,
  transition: 'transform 0.2s, box-shadow 0.2s',
  overflow: 'hidden',
  marginBottom: theme.spacing(3),
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: '0 10px 20px rgba(0,0,0,0.1)',
  },
}));

const CardHeaderStyled = styled(CardHeader)(({ theme }) => ({
  backgroundColor: theme.palette.primary.light,
  color: theme.palette.primary.contrastText,
  '& .MuiCardHeader-title': {
    fontWeight: 600,
  },
}));

const ExportButtonsContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: theme.spacing(2),
  flexWrap: 'wrap',
  marginTop: theme.spacing(2),
}));

const StyledButton = styled(Button)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius * 1.5,
  textTransform: 'none',
  fontWeight: 600,
  boxShadow: 'none',
  padding: theme.spacing(1, 2),
  '&:hover': {
    boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
  },
}));

const DatePickerWrapper = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(2),
  flexWrap: 'wrap',
  marginBottom: theme.spacing(3),
}));

// DataBulan Component
const DataBulan = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  
  const [bulan, setBulan] = useState('');
  const [tahun, setTahun] = useState('');
  const [fetchData, setFetchData] = useState(false);
  const [warning, setWarning] = useState('');
  const [expandedMatkul, setExpandedMatkul] = useState({});
  const scrollRef = useRef(null);

  const { data: absensi, error, isLoading } = useSWR(
    fetchData ? `${getApiBaseUrl()}/absensibymatkul/get?bulan=${bulan}&tahun=${tahun}` : null,
    fetcher
  );

  const extractDates = (data) => {
    const dateSet = new Set();
    Object.keys(data).forEach((key) => {
      data[key].absensi.forEach((absensi) => {
        dateSet.add(absensi.tgl_absensi);
      });
    });
    return Array.from(dateSet).sort();
  };

  const dates = absensi ? extractDates(absensi) : [];

  const sortedMatkulKeys = absensi ? Object.keys(absensi).sort((a, b) => {
    const matkulA = absensi[a].matkul.nama_matkul.toLowerCase();
    const matkulB = absensi[b].matkul.nama_matkul.toLowerCase();
    return matkulA.localeCompare(matkulB);
  }) : [];

  const handleMonthChange = (e) => {
    const [year, month] = e.target.value.split("-");
    setBulan(month);
    setTahun(year);
  };

  const handleTampilkanData = () => {
    if (!bulan || !tahun) {
      setWarning('Silahkan pilih bulan dan tahun.');
    } else {
      setWarning('');
      setFetchData(true);
    }
  };

  const toggleMatkulExpand = (matkulId) => {
    setExpandedMatkul(prev => ({
      ...prev,
      [matkulId]: !prev[matkulId]
    }));
  };

  const handleExportPDF = (matkulId) => {
    const matkul = absensi[matkulId];
    const doc = new jsPDF({ orientation: 'landscape' });
    const chunkSize = 5;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text(`Absensi Mata Kuliah ${matkul.matkul.nama_matkul}`, 14, 10);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(`Periode: ${bulan}/${tahun}`, 14, 18);
    let startYPosition = 25;
    
    for (let i = 0; i < dates.length; i += chunkSize) {
      const dateChunk = dates.slice(i, i + chunkSize);
      const headerRow1 = ["Nama", ...dateChunk.map(date => ({
        content: new Date(date).toLocaleDateString('id-ID'),
        colSpan: 3, // Jam Masuk, Jam Keluar, Durasi
        styles: { halign: 'center' }
      }))];

      const headerRow2 = ["", ...dateChunk.flatMap(() => ["Jam Masuk", "Jam Keluar", "Durasi"])];
      const tableRows = [];

      // Mendapatkan semua mahasiswa unik yang hadir di mata kuliah ini
      const mahasiswaSet = new Set();
      matkul.absensi.forEach(record => {
        mahasiswaSet.add(record.mahasiswa.nama_lengkap);
      });
      
      // Membuat baris data untuk setiap mahasiswa
      Array.from(mahasiswaSet).forEach(namaMahasiswa => {
        const rowData = [namaMahasiswa];
        
        dateChunk.forEach(date => {
          // Mencari data absensi untuk mahasiswa ini pada tanggal ini
          const absensiRecord = matkul.absensi.find(record => 
            record.mahasiswa.nama_lengkap === namaMahasiswa && 
            record.tgl_absensi === date
          );
          
          const jamMasuk = absensiRecord?.jam_masuk || '-';
          const jamKeluar = absensiRecord?.jam_keluar || '-';
          
          let durasi = '-';
          if (jamMasuk !== '-' && jamKeluar !== '-') {
            const durasiData = calculateLessonDuration(jamMasuk, jamKeluar);
            durasi = `${durasiData.totalHours}:${durasiData.totalMinutes.toString().padStart(2, '0')}`;
          }
          
          rowData.push(jamMasuk, jamKeluar, durasi);
        });
        
        tableRows.push(rowData);
      });
      
      if (startYPosition + 10 > doc.internal.pageSize.height - 30) {
        doc.addPage();
        startYPosition = 20;
      }
      
      doc.autoTable({
        head: [headerRow1, headerRow2],
        body: tableRows,
        startY: startYPosition,
        theme: 'grid',
        styles: {
          fontSize: 8, // reduced font size to fit more columns
        },
        headStyles: {
          fillColor: [66, 139, 202],
          textColor: [255, 255, 255],
          halign: 'center',
          valign: 'middle',
          lineWidth: 0.5,
          lineColor: [220, 220, 220]
        },
        bodyStyles: {
          lineWidth: 0.5,
          lineColor: [220, 220, 220]
        },
        alternateRowStyles: {
          fillColor: [245, 245, 245]
        }
      });

      // Update posisi Y untuk tabel berikutnya
      startYPosition = doc.previousAutoTable.finalY + 10;
    }

    // Lebar halaman
    const pageWidth = doc.internal.pageSize.getWidth();

    // Tambahkan teks untuk tanggal dan tanda tangan setelah semua data
    const currentDate = new Date();
    const formattedDate = currentDate.toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });

    // Cek jika butuh halaman baru untuk tanda tangan
    if (startYPosition + 50 > doc.internal.pageSize.height - 30) {
      doc.addPage();
      startYPosition = 20;
    }

    // Menambahkan teks "Semarang, tanggal - bulan - tahun" di pojok kanan
    startYPosition += 20;
    doc.text(`Semarang, ${formattedDate}`, pageWidth - 100, startYPosition);

    // Menambahkan spasi kosong untuk tanda tangan
    startYPosition += 25;
    doc.text('_____________', pageWidth - 80, startYPosition);
    doc.text(' Dosen ', pageWidth - 80, startYPosition + 10);

    // Menyimpan file PDF
    doc.save(`export-${matkul.matkul.nama_matkul}-${bulan}-${tahun}.pdf`);
  };

  const handleExportExcel = async (matkulId) => {
    try {
      // Create enhanced data with duration
      const matkulData = absensi[matkulId];
      const enhancedData = {
        ...matkulData,
        absensi: matkulData.absensi.map(record => {
          const duration = record.jam_masuk && record.jam_keluar 
            ? calculateLessonDuration(record.jam_masuk, record.jam_keluar) 
            : { totalHours: 0, totalMinutes: 0 };
            
          return {
            ...record,
            durasi: record.jam_masuk && record.jam_keluar 
              ? `${duration.totalHours}:${duration.totalMinutes.toString().padStart(2, '0')}` 
              : '-',
          };
        })
      };
      
      const response = await axios.post(
        `${getApiBaseUrl()}/export/excel`,
        { data: enhancedData },
        { responseType: 'blob' }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `export-${absensi[matkulId].matkul.nama_matkul}-${bulan}-${tahun}.xlsx`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

    } catch (error) {
      console.error('Error exporting Excel:', error);
    }
  };

  const formatWithLeadingZero = (num) => {
    return num < 10 ? `0${num}` : num;
  };

  // Current date values for default input value
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = formatWithLeadingZero(today.getMonth() + 1);
  const defaultDateValue = `${currentYear}-${currentMonth}`;

  return (
    <ContentContainer maxWidth="xl">
      <Paper 
        elevation={0}
        sx={{ 
          p: 3, 
          mb: 4, 
          borderRadius: 3,
          background: 'linear-gradient(to right, #f5f7ff, #ffffff)',
          border: '1px solid #e0e6ff'
        }}
      >
        <Typography variant="h5" component="h1" gutterBottom fontWeight={600} color="primary">
          Data Absensi Mata Kuliah
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Silahkan pilih bulan dan tahun untuk melihat data absensi mahasiswa per mata kuliah
        </Typography>

        <DatePickerWrapper>
          <TextField
            label="Pilih Bulan dan Tahun"
            type="month"
            value={bulan && tahun ? `${tahun}-${bulan}` : ''}
            onChange={handleMonthChange}
            defaultValue={defaultDateValue}
            InputLabelProps={{ shrink: true }}
            fullWidth={isMobile}
            size="small"
            sx={{ maxWidth: isMobile ? '100%' : '300px' }}
            InputProps={{
              startAdornment: <Calendar size={20} weight="bold" style={{ marginRight: 8, color: theme.palette.primary.main }} />
            }}
          />
          <StyledButton
            variant="contained"
            color="primary"
            disableElevation
            onClick={handleTampilkanData}
            startIcon={<MagnifyingGlass weight="bold" />}
            disabled={!bulan || !tahun}
            size={isMobile ? "large" : "medium"}
            fullWidth={isMobile}
          >
            Tampilkan Data
          </StyledButton>
        </DatePickerWrapper>

        {warning && (
          <Alert 
            severity="warning" 
            icon={<Warning size={24} />}
            sx={{ mb: 3, borderRadius: 2 }}
          >
            {warning}
          </Alert>
        )}

        {fetchData && isLoading && (
          <Box sx={{ width: '100%', mt: 4, mb: 4 }}>
            <LinearProgress />
            <Typography variant="body2" sx={{ mt: 1 }} align="center">
              Memuat data absensi...
            </Typography>
          </Box>
        )}

        {fetchData && error && (
          <Alert 
            severity="info" 
            sx={{ mb: 3, borderRadius: 2 }}
          >
            Data kosong untuk bulan {bulan} dan tahun {tahun}.
          </Alert>
        )}

        {sortedMatkulKeys.length > 0 && (
          <Box>
            <Typography variant="subtitle1" gutterBottom sx={{ mt: 2, fontWeight: 500 }}>
              Menampilkan data untuk periode: {bulan}/{tahun}
            </Typography>
            
            {sortedMatkulKeys.map((key) => {
              const matkul = absensi[key];
              const isExpanded = expandedMatkul[key] !== false; // Default to expanded
              
              return (
                <SubtleCard key={key}>
                  <CardHeaderStyled
                    title={`${matkul.matkul.nama_matkul} (${matkul.matkul.hari})`}
                    action={
                      <IconButton 
                        onClick={() => toggleMatkulExpand(key)}
                        sx={{ color: 'white' }}
                      >
                        {isExpanded ? <CaretUp weight="bold" /> : <CaretDown weight="bold" />}
                      </IconButton>
                    }
                  />
                  
                  <Collapse in={isExpanded}>
                    <CardContent>
                      <StyledTableContainer ref={scrollRef}>
                        <Table stickyHeader sx={{ minWidth: dates.length * 240 }}>
                          <TableHead>
                            <TableRow>
                              <TableCell 
                                rowSpan={2} 
                                sx={{ 
                                  fontWeight: 'bold', 
                                  backgroundColor: theme.palette.primary.main,
                                  color: 'white',
                                  position: 'sticky', 
                                  left: 0, 
                                  zIndex: 3 
                                }}
                              >
                                Nama Mahasiswa
                              </TableCell>
                              {dates.map(date => (
                                <TableCell 
                                  key={date} 
                                  colSpan={3} 
                                  align="center"
                                  sx={{ 
                                    fontWeight: 'bold',
                                    backgroundColor: theme.palette.primary.light,
                                    color: 'white',
                                  }}
                                >
                                  {new Date(date).toLocaleDateString('id-ID')}
                                </TableCell>
                              ))}
                            </TableRow>
                            <TableRow>
                              {dates.map(date => (
                                <React.Fragment key={date}>
                                  <TableCell 
                                    align="center" 
                                    sx={{ 
                                      backgroundColor: theme.palette.primary.lighter || '#e3f2fd',
                                      color: theme.palette.primary.dark,
                                      fontWeight: 'medium',
                                      minWidth: 80
                                    }}
                                  >
                                    Jam Masuk
                                  </TableCell>
                                  <TableCell 
                                    align="center"
                                    sx={{ 
                                      backgroundColor: theme.palette.primary.lighter || '#e3f2fd',
                                      color: theme.palette.primary.dark,
                                      fontWeight: 'medium',
                                      minWidth: 80
                                    }}
                                  >
                                    Jam Keluar
                                  </TableCell>
                                  <TableCell 
                                    align="center"
                                    sx={{ 
                                      backgroundColor: theme.palette.primary.lighter || '#e3f2fd',
                                      color: theme.palette.primary.dark,
                                      fontWeight: 'medium',
                                      minWidth: 80
                                    }}
                                  >
                                    Durasi
                                  </TableCell>
                                </React.Fragment>
                              ))}
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {/* Mendapatkan daftar mahasiswa unik */}
                            {(() => {
                              // Kumpulkan semua mahasiswa yang ada dalam absensi mata kuliah ini
                              const mahasiswaMap = {};
                              
                              matkul.absensi.forEach(record => {
                                const mahasiswaId = record.mahasiswa.id;
                                if (!mahasiswaMap[mahasiswaId]) {
                                  mahasiswaMap[mahasiswaId] = record.mahasiswa;
                                }
                              });
                              
                              // Konversi map ke array dan urutkan berdasarkan nama
                              return Object.values(mahasiswaMap)
                                .sort((a, b) => a.nama_lengkap.localeCompare(b.nama_lengkap))
                                .map((mahasiswa, index) => (
                                  <TableRow key={index} hover sx={{ '&:nth-of-type(odd)': { backgroundColor: theme.palette.action.hover } }}>
                                    <StickyTableCell sx={{ fontWeight: 'medium' }}>
                                      {mahasiswa.nama_lengkap}
                                    </StickyTableCell>
                                    
                                    {dates.map(date => {
                                      // Cari data absensi untuk mahasiswa ini pada tanggal tersebut
                                      const absensiData = matkul.absensi.find(
                                        a => a.mahasiswa.id === mahasiswa.id && a.tgl_absensi === date
                                      );
                                      
                                      const jamMasuk = absensiData?.jam_masuk;
                                      const jamKeluar = absensiData?.jam_keluar;
                                      
                                      // Hitung durasi jika ada jam masuk dan keluar
                                      const durasiData = jamMasuk && jamKeluar 
                                        ? calculateLessonDuration(jamMasuk, jamKeluar)
                                        : null;
                                        
                                      return (
                                        <React.Fragment key={date}>
                                          <TableCell align="center">
                                            {jamMasuk || (
                                              <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                                                -
                                              </Typography>
                                            )}
                                          </TableCell>
                                          <TableCell align="center">
                                            {jamKeluar || (
                                              <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                                                -
                                              </Typography>
                                            )}
                                          </TableCell>
                                          <TableCell align="center">
                                            {durasiData ? (
                                              <Typography variant="body2" color="text.primary">
                                                {`${durasiData.totalHours}:${durasiData.totalMinutes.toString().padStart(2, '0')}`}
                                              </Typography>
                                            ) : (
                                              <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                                                -
                                              </Typography>
                                            )}
                                          </TableCell>
                                        </React.Fragment>
                                      );
                                    })}
                                  </TableRow>
                                ));
                            })()}
                          </TableBody>
                        </Table>
                      </StyledTableContainer>
                      
                      <ExportButtonsContainer>
                        <Tooltip title="Export data ke Excel">
                          <StyledButton
                            variant="contained"
                            color="success"
                            startIcon={<FileXls weight="bold" />}
                            onClick={() => handleExportExcel(key)}
                            disableElevation
                            size={isMobile ? "large" : "medium"}
                          >
                            Export ke Excel
                          </StyledButton>
                        </Tooltip>
                        
                        <Tooltip title="Export data ke PDF">
                          <StyledButton
                            variant="contained"
                            color="error"
                            startIcon={<FilePdf weight="bold" />}
                            onClick={() => handleExportPDF(key)}
                            disableElevation
                            size={isMobile ? "large" : "medium"}
                          >
                            Export ke PDF
                          </StyledButton>
                        </Tooltip>
                      </ExportButtonsContainer>
                    </CardContent>
                  </Collapse>
                </SubtleCard>
              );
            })}
          </Box>
        )}
      </Paper>
    </ContentContainer>
  );
};

export default DataBulan;