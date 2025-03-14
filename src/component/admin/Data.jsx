import React, { useRef, useState, useEffect } from 'react';
import axios from 'axios';
import useSWR from 'swr';
import { 
  Container, 
  Paper, 
  Typography, 
  Box, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  CircularProgress,
  IconButton,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  TextField,
  Grid,
  Tooltip
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import HourglassTopIcon from '@mui/icons-material/HourglassTop';
import styled from 'styled-components';

const DashboardContainer = styled(Box)`
  padding: 2rem 1rem;
  margin-left: 250px; /* Width of your sidebar */
  width: calc(100% - 250px);
  
  @media (max-width: 768px) {
    margin-left: 0;
    width: 100%;
  }
`;

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

const CabangAccordion = styled(Accordion)`
  margin-bottom: 1rem !important;
  border-radius: 12px !important;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08) !important;
  overflow: hidden;
  
  &:before {
    display: none;
  }
`;

const AccordionHeader = styled(AccordionSummary)`
  background-color: #f5f7ff;
  
  .MuiAccordionSummary-content {
    margin: 0.75rem 0;
  }
`;

const CabangTitle = styled(Typography)`
  font-weight: 600;
  color: #3f51b5;
`;

const ScrollableTableContainer = styled(Box)`
  position: relative;
  overflow: hidden;
`;

const ScrollButtons = styled(Box)`
  display: flex;
  justify-content: flex-end;
  margin-bottom: 0.5rem;
`;

const TableWrapper = styled(Box)`
  overflow-x: auto;
  scrollbar-width: thin;
  
  &::-webkit-scrollbar {
    height: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 10px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: #c1c1c1;
    border-radius: 10px;
  }
  
  &::-webkit-scrollbar-thumb:hover {
    background: #888;
  }
`;

const StyledTable = styled(Table)`
  border-collapse: separate;
  border-spacing: 0;
  
  .MuiTableCell-head {
    background-color: #f5f7ff;
    font-weight: 600;
    color: #3f51b5;
    white-space: nowrap;
  }
  
  .MuiTableCell-root {
    border: 1px solid #e0e0e0;
    padding: 12px;
    text-align: center;
  }
  
  .MuiTableRow-root:hover {
    background-color: #f9f9f9;
  }
  
  .name-cell {
    position: sticky;
    left: 0;
    background-color: white;
    z-index: 1;
    font-weight: 500;
  }
  
  .name-cell-header {
    position: sticky;
    left: 0;
    z-index: 2;
  }
  
  tr:hover .name-cell {
    background-color: #f9f9f9;
  }

  .overtime-cell {
    background-color: #fff8e1;
    color: #ff6d00;
    font-weight: 500;
  }

  .total-hours-cell {
    background-color: #e8f5e9;
    color: #2e7d32;
    font-weight: 500;
  }
`;

// Function to calculate total working hours
const calculateWorkingHours = (jamMasuk, jamKeluar) => {
  if (!jamMasuk || !jamKeluar || jamMasuk === '-' || jamKeluar === '-') {
    return { totalHours: 0, overtime: 0, formattedTotal: '-', formattedOvertime: '-' };
  }

  try {
    // Parse times
    const [inHours, inMinutes] = jamMasuk.split(':').map(Number);
    const [outHours, outMinutes] = jamKeluar.split(':').map(Number);
    
    // Calculate total minutes
    const inTotalMinutes = inHours * 60 + inMinutes;
    const outTotalMinutes = outHours * 60 + outMinutes;
    
    // Calculate difference in minutes
    let diffMinutes = outTotalMinutes - inTotalMinutes;
    
    // If negative, assume next day (24-hour work)
    if (diffMinutes < 0) {
      diffMinutes += 24 * 60;
    }
    
    // Convert to hours and minutes
    const totalHours = diffMinutes / 60;
    
    // Calculate overtime (over 8 hours, but only if exceeding 8.5 hours)
    let overtime = 0;
    if (totalHours > 8.5) {
      overtime = totalHours - 8;
    }
    
    // Format for display
    const formattedTotal = formatHoursAndMinutes(totalHours);
    const formattedOvertime = overtime > 0 ? formatHoursAndMinutes(overtime) : '-';
    
    return { totalHours, overtime, formattedTotal, formattedOvertime };
  } catch (e) {
    console.error('Error calculating working hours:', e);
    return { totalHours: 0, overtime: 0, formattedTotal: '-', formattedOvertime: '-' };
  }
};

// Function to format hours and minutes
const formatHoursAndMinutes = (totalHours) => {
  const hours = Math.floor(totalHours);
  const minutes = Math.round((totalHours - hours) * 60);
  return `${hours}:${minutes.toString().padStart(2, '0')}`;
};

const Data = () => {
  const now = new Date();
  const bulan = now.getMonth() + 1; 
  const tahun = now.getFullYear();
  const tableRefs = useRef({});
  const [expandedCabang, setExpandedCabang] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const { data: absensi, error } = useSWR(`${getApiBaseUrl()}/absensicabang/get?bulan=${bulan}&tahun=${tahun}`, fetcher);

  if (error) return (
    <DashboardContainer>
      <Container maxWidth="lg">
        <Alert severity="error">Error loading data. Please try again later.</Alert>
      </Container>
    </DashboardContainer>
  );
  if (!absensi) return (
    <DashboardContainer>
      <Container maxWidth="lg">
        <Box display="flex" justifyContent="center" alignItems="center" height="50vh">
          <CircularProgress />
        </Box>
      </Container>
    </DashboardContainer>
  );
  const extractDates = (data) => {
    const dateSet = new Set();
    Object.keys(data).forEach((key) => {
      data[key].absensi.forEach((absensi) => {
        dateSet.add(absensi.tgl_absensi);
      });
    });
    return Array.from(dateSet).sort((a, b) => new Date(a) - new Date(b));
  };

  const dates = extractDates(absensi);

  const sortedCabangKeys = Object.keys(absensi)
    .sort((a, b) => {
      const cabangA = absensi[a].cabang.nama_cabang.toLowerCase();
      const cabangB = absensi[b].cabang.nama_cabang.toLowerCase();
      return cabangA.localeCompare(cabangB);
    })
    .filter(key => 
      absensi[key].cabang.nama_cabang.toLowerCase().includes(searchTerm.toLowerCase())
    );

  const scroll = (cabangKey, direction) => {
    const tableRef = tableRefs.current[cabangKey];
    if (tableRef) {
      const scrollAmount = direction === 'left' ? -200 : 200;
      tableRef.scrollLeft += scrollAmount;
    }
  };

  const handleAccordionChange = (cabangKey) => (event, isExpanded) => {
    setExpandedCabang(isExpanded ? cabangKey : null);
  };

  return (
    <DashboardContainer maxWidth="xl">
      <Container maxWidth="lg">
       <Grid container spacing={3}>
         <Grid item xs={12}>
           <PageHeader variant="h4">Data Absensi Bulan {new Date(0, bulan - 1).toLocaleString('id-ID', { month: 'long' })} {tahun}</PageHeader>
         </Grid>
         
         <Grid item xs={12}>
           <Box mb={3}>
             <TextField
               fullWidth
               variant="outlined"
               label="Cari berdasarkan nama cabang"
               placeholder="Masukkan nama cabang..."
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
               sx={{ 
                 backgroundColor: 'white',
                 borderRadius: '8px',
                 '& .MuiOutlinedInput-root': {
                   borderRadius: '8px'
                 }
               }}
             />
           </Box>
         </Grid>
      
         <Grid item xs={12}>
           {sortedCabangKeys.length === 0 ? (
             <Alert severity="info">Tidak ada data yang sesuai dengan pencarian "{searchTerm}".</Alert>
           ) : (
             sortedCabangKeys.map((key) => {
               const cabang = absensi[key];
              
               // Prepare data for rendering
               const employeeData = cabang.absensi.reduce((acc, record) => {
                 const existingRow = acc.find(row => row.nama === record.karyawan.nama_lengkap);
                 if (existingRow) {
                   existingRow.data[record.tgl_absensi] = {
                     jamMasuk: record.jam_masuk,
                     jamKeluar: record.jam_keluar,
                     // Calculate work hours and overtime
                     ...calculateWorkingHours(record.jam_masuk, record.jam_keluar)
                   };
                 } else {
                   acc.push({
                     nama: record.karyawan.nama_lengkap,
                     data: {
                       [record.tgl_absensi]: {
                         jamMasuk: record.jam_masuk,
                         jamKeluar: record.jam_keluar,
                         // Calculate work hours and overtime
                         ...calculateWorkingHours(record.jam_masuk, record.jam_keluar)
                       }
                     }
                   });
                 }
                 return acc;
               }, []);
              
               return (
                 <CabangAccordion 
                   key={key} 
                   expanded={expandedCabang === key}
                   onChange={handleAccordionChange(key)}
                 >
                   <AccordionHeader expandIcon={<ExpandMoreIcon />}>
                     <CabangTitle variant="h6">{cabang.cabang.nama_cabang}</CabangTitle>
                   </AccordionHeader>
                   <AccordionDetails>
                     <ScrollableTableContainer>
                       <ScrollButtons>
                         <IconButton 
                           onClick={() => scroll(key, 'left')} 
                           size="small"
                           sx={{ bgcolor: '#f5f7ff', mr: 1 }}
                         >
                           <ChevronLeftIcon />
                         </IconButton>
                         <IconButton 
                           onClick={() => scroll(key, 'right')} 
                           size="small"
                           sx={{ bgcolor: '#f5f7ff' }}
                         >
                           <ChevronRightIcon />
                         </IconButton>
                       </ScrollButtons>
                      
                       <TableWrapper 
                         ref={el => tableRefs.current[key] = el}
                       >
                         <StyledTable size="small">
                           <TableHead>
                             <TableRow>
                               <TableCell className="name-cell-header" rowSpan={2}>Nama</TableCell>
                               {dates.map(date => (
                                 <TableCell key={date} colSpan={4} align="center">
                                   {new Date(date).toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit' })}
                                 </TableCell>
                               ))}
                             </TableRow>
                             <TableRow>
                               {dates.map(date => (
                                 <React.Fragment key={date}>
                                   <TableCell>
                                     <Tooltip title="Jam Masuk">
                                       <Box display="flex" alignItems="center" justifyContent="center">
                                         Masuk
                                       </Box>
                                     </Tooltip>
                                   </TableCell>
                                   <TableCell>
                                     <Tooltip title="Jam Keluar">
                                       <Box display="flex" alignItems="center" justifyContent="center">
                                         Keluar
                                       </Box>
                                     </Tooltip>
                                   </TableCell>
                                   <TableCell>
                                     <Tooltip title="Total Jam Kerja">
                                       <Box display="flex" alignItems="center" justifyContent="center">
                                         <AccessTimeIcon fontSize="small" sx={{ mr: 0.5 }} />
                                         Total
                                       </Box>
                                     </Tooltip>
                                   </TableCell>
                                   <TableCell>
                                     <Tooltip title="Jam Lembur (>8.5 jam)">
                                       <Box display="flex" alignItems="center" justifyContent="center">
                                         <HourglassTopIcon fontSize="small" sx={{ mr: 0.5 }} />
                                         Lembur
                                       </Box>
                                     </Tooltip>
                                   </TableCell>
                                 </React.Fragment>
                               ))}
                             </TableRow>
                           </TableHead>
                           <TableBody>
                             {employeeData.map((row, index) => (
                               <TableRow key={index}>
                                 <TableCell className="name-cell">{row.nama}</TableCell>
                                 {dates.map(date => (
                                   <React.Fragment key={date}>
                                     <TableCell>{row.data[date]?.jamMasuk || '-'}</TableCell>
                                     <TableCell>{row.data[date]?.jamKeluar || '-'}</TableCell>
                                     <TableCell className={row.data[date]?.totalHours > 0 ? "total-hours-cell" : ""}>
                                       {row.data[date]?.formattedTotal || '-'}
                                     </TableCell>
                                     <TableCell className={row.data[date]?.overtime > 0 ? "overtime-cell" : ""}>
                                       {row.data[date]?.formattedOvertime || '-'}
                                     </TableCell>
                                   </React.Fragment>
                                 ))}
                               </TableRow>
                             ))}
                           </TableBody>
                         </StyledTable>
                       </TableWrapper>
                     </ScrollableTableContainer>
                   </AccordionDetails>
                 </CabangAccordion>
               );
             })
           )}
         </Grid>
       </Grid>
     </Container>
    </DashboardContainer>
  );
};

export default Data;