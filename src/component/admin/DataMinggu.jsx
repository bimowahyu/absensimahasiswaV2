import React, { useState, useRef, useEffect } from 'react';
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
  LinearProgress,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  FormHelperText
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

// Helper function to get week number of the month
const getWeekOfMonth = (date) => {
  const firstDayOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
  const dayOfMonth = date.getDate();
  
  // Calculate the first day of the month
  // If the first day is not Sunday, we consider it part of the previous week
  // Adjust by adding days until Sunday to get the start of the first full week
  
  return Math.ceil((dayOfMonth + firstDayOfMonth.getDay()) / 7);
};

// Helper function to get date range of a specific week in a month
const getWeekDates = (year, month, weekNum) => {
  // Create first day of the month
  const firstDayOfMonth = new Date(year, month - 1, 1);
  
  // Calculate days to add to get to the first day of the desired week
  // We subtract 1 from weekNum to get to the start of the week (0-indexed)
  const daysToAdd = (weekNum - 1) * 7 - firstDayOfMonth.getDay();
  
  // If first day of month is not Sunday, adjust for the partial week
  const startDay = Math.max(1, daysToAdd + 1);
  const startDate = new Date(year, month - 1, startDay);
  
  // End date is 6 days after start date for a full week
  const endDate = new Date(startDate);
  endDate.setDate(startDate.getDate() + 6);
  
  // Ensure end date doesn't go into next month
  const lastDayOfMonth = new Date(year, month, 0).getDate();
  if (endDate.getMonth() !== month - 1) {
    endDate.setDate(lastDayOfMonth);
  }
  
  return {
    start: new Date(year, month - 1, startDay),
    end: endDate
  };
};

// Helper function to get dates between two dates
const getDatesInRange = (startDate, endDate) => {
  const dates = [];
  let currentDate = new Date(startDate);
  
  while (currentDate <= endDate) {
    dates.push(new Date(currentDate));
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  return dates;
};

// Helper function to get number of weeks in a month
const getWeeksInMonth = (year, month) => {
  const firstDay = new Date(year, month - 1, 1);
  const lastDay = new Date(year, month, 0);
  
  // Get the first and last days of the month
  const firstDayDate = firstDay.getDate();
  const lastDayDate = lastDay.getDate();
  
  // Calculate the number of weeks
  return Math.ceil((lastDayDate + firstDay.getDay()) / 7);
};

// Helper function to format date as YYYY-MM-DD
const formatDateToYYYYMMDD = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
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

// DataMinggu Component
const DataMinggu = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  
  // State for date selection
  const [bulan, setBulan] = useState('');
  const [tahun, setTahun] = useState('');
  const [fetchData, setFetchData] = useState(false);
  const [warning, setWarning] = useState('');
  const [expandedMatkul, setExpandedMatkul] = useState({});
  const [minggu, setMinggu] = useState(1);
  const [totalMinggu, setTotalMinggu] = useState(0);
  const scrollRef = useRef(null);

  // Fetch data from API
  const { data: absensi, error, isLoading } = useSWR(
    fetchData ? `${getApiBaseUrl()}/absensibymatkul/get?bulan=${bulan}&tahun=${tahun}` : null,
    fetcher
  );

  // Generate dates for selected week
  const generateWeekDates = () => {
    if (!bulan || !tahun || !minggu) return [];
    
    const weekRange = getWeekDates(parseInt(tahun), parseInt(bulan), parseInt(minggu));
    return getDatesInRange(weekRange.start, weekRange.end)
      .map(date => formatDateToYYYYMMDD(date));
  };

  // Filter data by week dates
  const filterDataByWeek = (data, weekDates) => {
    if (!data) return null;
    
    const filteredData = {};
    
    // For each matkul in the original data
    Object.keys(data).forEach(key => {
      const matkul = data[key];
      
      // Filter absensi records for the current week
      const weeklyAbsensi = matkul.absensi.filter(record => 
        weekDates.includes(record.tgl_absensi)
      );
      
      // Only include this matkul if it has data for the selected week
      if (weeklyAbsensi.length > 0) {
        filteredData[key] = {
          matkul: matkul.matkul,
          absensi: weeklyAbsensi
        };
      }
    });
    
    return filteredData;
  };

  // Get week dates
  const weekDates = generateWeekDates();
  
  // Filter data by week
  const weeklyData = absensi ? filterDataByWeek(absensi, weekDates) : null;
  
  // Get sorted matkul keys for the filtered data
  const sortedMatkulKeys = weeklyData ? Object.keys(weeklyData).sort((a, b) => {
    const matkulA = weeklyData[a].matkul.nama_matkul.toLowerCase();
    const matkulB = weeklyData[b].matkul.nama_matkul.toLowerCase();
    return matkulA.localeCompare(matkulB);
  }) : [];

  // Update total weeks when month/year changes
  useEffect(() => {
    if (bulan && tahun) {
      const weeksCount = getWeeksInMonth(parseInt(tahun), parseInt(bulan));
      setTotalMinggu(weeksCount);
      
      // Reset minggu selection if it's greater than the number of weeks in the new month
      if (minggu > weeksCount) {
        setMinggu(1);
      }
    }
  }, [bulan, tahun]);

  const handleMonthChange = (e) => {
    const [year, month] = e.target.value.split("-");
    setBulan(month);
    setTahun(year);
    setMinggu(1); // Reset to first week when month changes
    setFetchData(false); // Reset fetch state
  };

  const handleWeekChange = (e) => {
    setMinggu(e.target.value);
  };

  const handleTampilkanData = () => {
    if (!bulan || !tahun || !minggu) {
      setWarning('Silahkan pilih bulan, tahun, dan minggu.');
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
    const matkul = weeklyData[matkulId];
    const doc = new jsPDF({ orientation: 'landscape' });
    const weekRange = getWeekDates(parseInt(tahun), parseInt(bulan), parseInt(minggu));
    const weekStart = weekRange.start.toLocaleDateString('id-ID');
    const weekEnd = weekRange.end.toLocaleDateString('id-ID');
    
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text(`Absensi Mata Kuliah ${matkul.matkul.nama_matkul}`, 14, 10);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(`Periode: Minggu ${minggu} (${weekStart} - ${weekEnd})`, 14, 18);
    let startYPosition = 25;
    
    const headerRow1 = ["Nama", ...weekDates.map(date => ({
      content: new Date(date).toLocaleDateString('id-ID'),
      colSpan: 4, // Jam Masuk, Jam Keluar, Durasi, Status
      styles: { halign: 'center' }
    }))];

    const headerRow2 = ["", ...weekDates.flatMap(() => ["Jam Masuk", "Jam Keluar", "Durasi", "Status"])];
    const tableRows = [];

    // Get all unique students in this course
    const mahasiswaSet = new Set();
    matkul.absensi.forEach(record => {
      if (record.mahasiswa && record.mahasiswa.nama_lengkap) {
        mahasiswaSet.add(record.mahasiswa.nama_lengkap);
      }
    });
    
    // Create data rows for each student
    Array.from(mahasiswaSet).forEach(namaMahasiswa => {
      const rowData = [namaMahasiswa];
      
      weekDates.forEach(date => {
        // Find attendance record for this student on this date
        const absensiRecord = matkul.absensi.find(record =>
          record.mahasiswa &&
          record.mahasiswa.nama_lengkap === namaMahasiswa &&
          record.tgl_absensi === date
        );
        
        const jamMasuk = absensiRecord?.jam_masuk || '-';
        const jamKeluar = absensiRecord?.jam_keluar || '-';
        const status = absensiRecord?.status || '-';
        let durasi = '-';
        if (jamMasuk !== '-' && jamKeluar !== '-') {
          const durasiData = calculateLessonDuration(jamMasuk, jamKeluar);
          durasi = `${durasiData.totalHours}:${durasiData.totalMinutes.toString().padStart(2, '0')}`;
        }
        
        rowData.push(jamMasuk, jamKeluar, durasi, status);
      });
      
      tableRows.push(rowData);
    });
    
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

    // Update Y position for next table
    startYPosition = doc.previousAutoTable.finalY + 10;

    // Page width
    const pageWidth = doc.internal.pageSize.getWidth();

    // Add text for date and signature
    const currentDate = new Date();
    const formattedDate = currentDate.toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });

    // Check if we need a new page for signature
    if (startYPosition + 50 > doc.internal.pageSize.height - 30) {
      doc.addPage();
      startYPosition = 20;
    }

    // Add "Semarang, date" at the right corner
    startYPosition += 20;
    doc.text(`Semarang, ${formattedDate}`, pageWidth - 100, startYPosition);

    // Add empty space for signature
    startYPosition += 25;
    doc.text('_____________', pageWidth - 80, startYPosition);
    doc.text(' Dosen ', pageWidth - 80, startYPosition + 10);

    // Save PDF file
    doc.save(`export-${matkul.matkul.nama_matkul}-minggu${minggu}-${bulan}-${tahun}.pdf`);
  };

  const handleExportExcel = async (matkulId) => {
    try {
      // Create enhanced data with duration
      const matkulData = weeklyData[matkulId];
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
      link.setAttribute('download', `export-${weeklyData[matkulId].matkul.nama_matkul}-minggu${minggu}-${bulan}-${tahun}.xlsx`);
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

  // Generate week options
  const weekOptions = [];
  for (let i = 1; i <= totalMinggu; i++) {
    if (bulan && tahun) {
      const weekRange = getWeekDates(parseInt(tahun), parseInt(bulan), i);
      const startDate = weekRange.start.toLocaleDateString('id-ID');
      const endDate = weekRange.end.toLocaleDateString('id-ID');
      weekOptions.push(
        <MenuItem key={i} value={i}>
          Minggu {i} ({startDate} - {endDate})
        </MenuItem>
      );
    }
  }

  // Get week date range for display
  let weekDateRange = "";
  if (bulan && tahun && minggu) {
    const weekRange = getWeekDates(parseInt(tahun), parseInt(bulan), parseInt(minggu));
    const weekStart = weekRange.start.toLocaleDateString('id-ID');
    const weekEnd = weekRange.end.toLocaleDateString('id-ID');
    weekDateRange = `${weekStart} - ${weekEnd}`;
  }

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
          Data Absensi Mata Kuliah Mingguan
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Silahkan pilih bulan, tahun, dan minggu untuk melihat data absensi mahasiswa per mata kuliah
        </Typography>

        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={12} sm={4}>
            <TextField
              label="Pilih Bulan dan Tahun"
              type="month"
              value={bulan && tahun ? `${tahun}-${bulan}` : ''}
              onChange={handleMonthChange}
              defaultValue={defaultDateValue}
              InputLabelProps={{ shrink: true }}
              fullWidth
              size="small"
              InputProps={{
                startAdornment: <Calendar size={20} weight="bold" style={{ marginRight: 8, color: theme.palette.primary.main }} />
              }}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth size="small">
              <InputLabel id="minggu-select-label">Pilih Minggu</InputLabel>
              <Select
                labelId="minggu-select-label"
                id="minggu-select"
                value={minggu}
                label="Pilih Minggu"
                onChange={handleWeekChange}
                disabled={!bulan || !tahun}
              >
                {weekOptions}
              </Select>
              {bulan && tahun && weekDateRange && (
                <FormHelperText>{weekDateRange}</FormHelperText>
              )}
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={4}>
            <StyledButton
              variant="contained"
              color="primary"
              disableElevation
              onClick={handleTampilkanData}
              startIcon={<MagnifyingGlass weight="bold" />}
              disabled={!bulan || !tahun || !minggu}
              size={isMobile ? "large" : "medium"}
              fullWidth
            >
              Tampilkan Data
            </StyledButton>
          </Grid>
        </Grid>

        {warning && (
          <Alert 
            severity="warning" 
            icon={<Warning size={24} />}
            sx={{ mb: 3, mt: 3, borderRadius: 2 }}
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

        {fetchData && !isLoading && (!weeklyData || Object.keys(weeklyData).length === 0) && (
          <Alert 
            severity="info" 
            sx={{ mb: 3, mt: 3, borderRadius: 2 }}
          >
            Data kosong untuk minggu {minggu} bulan {bulan} tahun {tahun}.
          </Alert>
        )}

        {sortedMatkulKeys.length > 0 && (
          <Box sx={{ mt: 3 }}>
            <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 500 }}>
              Menampilkan data untuk minggu {minggu} ({weekDateRange})
            </Typography>
            
            {sortedMatkulKeys.map((key) => {
              const matkul = weeklyData[key];
              const isExpanded = expandedMatkul[key] !== false; // Default to expanded
              if (!matkul || !matkul.absensi) return null;
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
                        <Table stickyHeader sx={{ minWidth: weekDates.length * 240 }}>
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
                              {weekDates.map(date => (
                                <TableCell 
                                  key={date} 
                                  colSpan={4} 
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
                              {weekDates.map(date => (
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
                                  <TableCell 
                                    align="center"
                                    sx={{ 
                                      backgroundColor: theme.palette.primary.lighter || '#e3f2fd',
                                      color: theme.palette.primary.dark,
                                      fontWeight: 'medium',
                                      minWidth: 80
                                    }}
                                  >
                                    Status
                                  </TableCell>
                                </React.Fragment>
                              ))}
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {(() => {
                              // Collect all students in this course's attendance
                              const mahasiswaMap = {};
                              
                              matkul.absensi.forEach(record => {
                                const mahasiswaId = record.mahasiswa.id;
                                if (!mahasiswaMap[mahasiswaId]) {
                                  mahasiswaMap[mahasiswaId] = record.mahasiswa;
                                }
                              });
                              
                              // Convert map to array and sort by name
                              return Object.values(mahasiswaMap)
                                .sort((a, b) => a.nama_lengkap.localeCompare(b.nama_lengkap))
                                .map((mahasiswa, index) => (
                                  <TableRow key={index} hover sx={{ '&:nth-of-type(odd)': { backgroundColor: theme.palette.action.hover } }}>
                                    <StickyTableCell sx={{ fontWeight: 'medium' }}>
                                      {mahasiswa.nama_lengkap}
                                    </StickyTableCell>
                                    
                                    {weekDates.map(date => {
                                      const absensiData = matkul.absensi.find(
                                        a => a.mahasiswa.id === mahasiswa.id && a.tgl_absensi === date
                                      );
                                      
                                      // Calculate duration if both jamMasuk and jamKeluar exist
                                      let duration = null;
                                      if (absensiData && absensiData.jam_masuk && absensiData.jam_keluar) {
                                        duration = calculateLessonDuration(absensiData.jam_masuk, absensiData.jam_keluar);
                                      }
                                      
                                      return (
                                        <React.Fragment key={date}>
                                          <TableCell align="center">
                                            {absensiData?.jam_masuk || '-'}
                                          </TableCell>
                                          <TableCell align="center">
                                            {absensiData?.jam_keluar || '-'}
                                          </TableCell>
                                          <TableCell align="center">
                                            {duration ? formatTime(duration.totalHours, duration.totalMinutes) : '-'}
                                          </TableCell>
                                          <TableCell 
                                            align="center"
                                            sx={{
                                              color: absensiData?.status === 'Hadir' 
                                                ? theme.palette.success.main 
                                                : absensiData?.status === 'Absen' 
                                                ? theme.palette.error.main 
                                                : theme.palette.text.primary,
                                              fontWeight: absensiData?.status ? 'medium' : 'normal'
                                            }}
                                          >
                                            {absensiData?.status || '-'}
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
                            variant="outlined"
                            color="primary"
                            startIcon={<FileXls size={20} weight="fill" />}
                            onClick={() => handleExportExcel(key)}
                          >
                            Export Excel
                          </StyledButton>
                        </Tooltip>
                        <Tooltip title="Export data ke PDF">
                          <StyledButton
                            variant="outlined"
                            color="secondary"
                            startIcon={<FilePdf size={20} weight="fill" />}
                            onClick={() => handleExportPDF(key)}
                          >
                            Export PDF
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

export default DataMinggu;