import React, { useState, useEffect } from 'react';
import { 
    Container, 
    Box, 
    Typography, 
    Grid, 
    Avatar, 
    Button, 
    Paper, 
    CircularProgress,
    Chip
} from '@mui/material';
import { 
    LogoutOutlined, 
    EventNoteOutlined, 
    LocalOfferOutlined, 
    PersonOutlineOutlined, 
    AccountBalanceWalletOutlined, 
    AccessTimeOutlined,
    LocationOnOutlined,
    CheckCircleOutlineOutlined,
    TrendingUpOutlined,
    SchoolOutlined,
    BookOutlined
} from "@mui/icons-material";
import { NavLink, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { LogOut, reset } from "../fitur/AuthMahasiswa";
import { motion } from 'framer-motion';
import AbsenceRequestForm from './AbsenceRequestForm';


// Component for animated elements
const AnimatedBox = ({ children, delay = 0 }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay }}
    >
        {children}
    </motion.div>
);

function Dashboard() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [dataMahasiswa, setDataMahasiswa] = useState(null);
    const [error, setError] = useState(null);
    const [currentTime, setCurrentTime] = useState('');
    const [currentDate, setCurrentDate] = useState('');
    const [absensiData, setAbsensiData] = useState({ data: [] });
    const [matkulHariIni, setMatkulHariIni] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentDay, setCurrentDay] = useState('');
    
    // State for absence form
    const [showAbsenceForm, setShowAbsenceForm] = useState(false);
    
    const getApiBaseUrl = () => {
        const protocol = window.location.protocol === 'https:' ? 'https' : 'http';
        const baseUrl = process.env.REACT_APP_API_BASE_URL.replace(/^https?:\/\//, '');
        return `${protocol}://${baseUrl}`;
    };
    
    // Time and Date Update Effect
    useEffect(() => {
        const updateDateTime = () => {
            const now = new Date();
            
            // Format date
            const options = { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
            };
            const formattedDate = now.toLocaleDateString('id-ID', options);
            setCurrentDate(formattedDate);
            
            // Format time
            const formattedTime = now.toLocaleTimeString('id-ID', { 
                hour: 'numeric', 
                minute: 'numeric', 
                hour12: false 
            });
            setCurrentTime(formattedTime);

            // Get current day in lowercase Indonesian
            const days = ['minggu', 'senin', 'selasa', 'rabu', 'kamis', 'jumat', 'sabtu'];
            setCurrentDay(days[now.getDay()]);
        };

        updateDateTime();
        const interval = setInterval(updateDateTime, 1000);
        return () => clearInterval(interval);
    }, []);

    // Data Fetching Effect
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                
                // Fetch mahasiswa profile
                const profileResponse = await fetch(`${getApiBaseUrl()}/Memahasiswa`, { 
                    credentials: 'include'
                });
                
                if (!profileResponse.ok) {
                    throw new Error('Failed to fetch profile data');
                }
                
                const profileData = await profileResponse.json();
                setDataMahasiswa(profileData);
                
                // Fetch attendance data
                const absensiResponse = await fetch(`${getApiBaseUrl()}/absensi/get`, { 
                    credentials: 'include'
                });
                
                if (!absensiResponse.ok) {
                    throw new Error('Failed to fetch attendance data');
                }
                
                const absensiData = await absensiResponse.json();
                setAbsensiData(absensiData);
                
                const days = ['minggu', 'senin', 'selasa', 'rabu', 'kamis', 'jumat', 'sabtu'];
                const today = days[new Date().getDay()];
                
                const matkulResponse = await fetch(`${getApiBaseUrl()}/mahasiswa/${profileData.id}/matkul`, {
                    credentials: 'include'
                });
                
                if (!matkulResponse.ok) {
                    console.error('Error fetching courses:', matkulResponse.status);
                    setMatkulHariIni([]);
                } else {
                    const data = await matkulResponse.json();
                    console.log('API Response:', data); 
                    let allMatkul = [];
                    
                    if (Array.isArray(data)) {
                        allMatkul = data;
                    } else if (data && Array.isArray(data.matkul)) {
                        allMatkul = data.matkul;
                    } else {
                        console.error('Could not find matkul array in response:', data);
                        setMatkulHariIni([]);
                        return;
                    }
                    const matkulHariIni = allMatkul.filter(matkul => 
                        matkul && matkul.hari && matkul.hari.toLowerCase() === today
                    );
                    if (matkulHariIni.length > 0) {
                        matkulHariIni.sort((a, b) => {
                            if (a.jam_masuk_presensi < b.jam_masuk_presensi) return -1;
                            if (a.jam_masuk_presensi > b.jam_masuk_presensi) return 1;
                            return 0;
                        });
                    }
                    
                    setMatkulHariIni(matkulHariIni);
                }
            } catch (error) {
                console.error('Error fetching data:', error);
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };
    
        fetchData();
    }, []);

    // Function to handle form submission success
    const handleAbsenceSubmitSuccess = () => {
        // Optionally refresh the page data if needed
        window.location.reload();
    };

    // Logout Handler
    const logout = () => {
        dispatch(LogOut());
        dispatch(reset());
        navigate("/");
    };

    // Get absence data for a specific course
    const getAbsensiForMatkul = (matkulId) => {
        if (!absensiData || !absensiData.data || !Array.isArray(absensiData.data)) {
            console.log('Absensi data not available or not in expected format');
            return null;
        }
        
       // const today = new Date().toISOString().split('T')[0];
       const today = new Date().toLocaleDateString('en-CA'); 
        console.log(`Looking for attendance for matkul ID ${matkulId} on ${today}`);
        
        const found = absensiData.data.find(a => 
            a.matkul_id === matkulId && 
            a.tgl_absensi === today
        );
        
        console.log('Found attendance:', found);
        return found;
    };

    // Check course status based on time
    // const getCourseStatus = (matkul) => {
    //     if (!matkul) return { status: 'unknown', text: 'Unknown' };
        
    //     const now = new Date();
    //     const currentHour = now.getHours();
    //     const currentMinute = now.getMinutes();
    //     const currentTimeMinutes = currentHour * 60 + currentMinute;
        
    //     // Parse course times
    //     const parseTime = (timeStr) => {
    //         if (!timeStr) return 0;
    //         const [hours, minutes] = timeStr.split(':').map(Number);
    //         return (isNaN(hours) ? 0 : hours) * 60 + (isNaN(minutes) ? 0 : minutes);
    //     };
        
    //     const openTime = parseTime(matkul.jam_dibuka_presensi);
    //     const startTime = parseTime(matkul.jam_masuk_presensi);
    //     const endTime = parseTime(matkul.jam_keluar_presensi);
        
    //     console.log(`Course: ${matkul.nama_matkul}`);
    //     console.log(`Times: Open=${openTime}, Start=${startTime}, End=${endTime}, Current=${currentTimeMinutes}`);
        
    //     // Check if attendance is already recorded
    //     const matkulAbsensi = getAbsensiForMatkul(matkul.id);
    //     console.log('Absensi data for course:', matkulAbsensi);
        
    //     // If attendance is complete
    //     if (matkulAbsensi?.jam_masuk && matkulAbsensi?.jam_keluar) {
    //         console.log('Complete attendance detected');
    //         return { status: 'completed', text: 'Presensi Lengkap' };
    //     } 
    //     // If only check-in recorded
    //     else if (matkulAbsensi?.jam_masuk && !matkulAbsensi?.jam_keluar) {
    //         console.log('Check-in only detected, need checkout');
    //         // Always show need-checkout if end time has been reached
    //         if (currentTimeMinutes >= endTime) {
    //             return { status: 'need-checkout', text: 'Perlu Presensi Keluar' };
    //         } else {
    //             return { status: 'in-progress', text: 'Sedang Berlangsung' };
    //         }
    //     } 
    //     // No attendance recorded yet
    //     else {
    //         console.log('No attendance record yet');
    //         if (currentTimeMinutes < openTime) {
    //             return { status: 'upcoming', text: 'Belum Dibuka' };
    //         } else if (currentTimeMinutes >= openTime && currentTimeMinutes <= startTime) {
    //             return { status: 'open', text: 'Buka Presensi' };
    //         } else if (currentTimeMinutes > startTime && currentTimeMinutes < endTime) {
    //             return { status: 'ongoing', text: 'Sedang Berlangsung' };
    //         } else {
    //             // After end time with no attendance
    //             return { status: 'ended', text: 'Selesai' };
    //         }
    //     }
    // };
// Perbaikan pada fungsi getCourseStatus
const getCourseStatus = (matkul) => {
    if (!matkul) return { status: 'unknown', text: 'Unknown' };

    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentTimeMinutes = currentHour * 60 + currentMinute;

    const parseTime = (timeStr) => {
        if (!timeStr) return 0;
        const [hours, minutes] = timeStr.split(':').map(Number);
        return (isNaN(hours) ? 0 : hours) * 60 + (isNaN(minutes) ? 0 : minutes);
    };

    const openTime = parseTime(matkul.jam_dibuka_presensi);
    const startTime = parseTime(matkul.jam_masuk_presensi);
    const endTime = parseTime(matkul.jam_keluar_presensi);

    const matkulAbsensi = getAbsensiForMatkul(matkul.id);

    if (matkulAbsensi?.jam_masuk && matkulAbsensi?.jam_keluar) {
        return { status: 'completed', text: 'Presensi Lengkap' };
    } else if (matkulAbsensi?.jam_masuk && !matkulAbsensi?.jam_keluar) {
        // Selalu tampilkan perlu checkout jika sudah checkin
        return { status: 'need-checkout', text: 'Perlu Presensi Keluar' };
    } else {
        if (currentTimeMinutes < openTime) {
            return { status: 'upcoming', text: 'Belum Dibuka' };
        } else if (currentTimeMinutes >= openTime && currentTimeMinutes <= startTime) {
            return { status: 'open', text: 'Buka Presensi' };
        } else if (currentTimeMinutes > startTime && currentTimeMinutes < endTime) {
            return { status: 'ongoing', text: 'Sedang Berlangsung' };
        } else {
            return { status: 'ended', text: 'Selesai' };
        }
    }
};
    // Format waktu dari format 24 jam ke format biasa
    const formatTime = (timeString) => {
        if (!timeString) return '';
        
        // Jika waktu dalam format HH:MM:SS, ambil hanya HH:MM
        if (timeString.length > 5) {
            return timeString.substring(0, 5);
        }
        return timeString;
    };

    // Menu items configuration
    const menuItems = [
        { 
            icon: <SchoolOutlined sx={{ color: '#1976d2' }} />, 
            label: 'Akademik', 
            link: '/akademik' 
        },
        { 
            icon: <EventNoteOutlined sx={{ color: '#7e57c2' }} />, 
            label: 'Riwayat', 
            link: '/GetAbsen' 
        },
        { 
            icon: <PersonOutlineOutlined sx={{ color: '#26a69a' }} />, 
            label: 'Profil', 
            link: '/users' 
        },
        { 
            icon: <TrendingUpOutlined sx={{ color: '#ef5350' }} />, 
            label: 'Statistik', 
            link: '/GetAbsenBulan' 
        },
        // Updated to open the absence form on click
        { 
             icon: <LocalOfferOutlined sx={{ color: '#ff9800' }} />, 
                label: 'Izin', 
                onClick: () => setShowAbsenceForm(true),
                fullWidth: true,
                centerContent: true
        }
    ];

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
                <Typography color="error">Error: {error}</Typography>
            </Box>
        );
    }

   return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
        {/* Render AbsenceRequestForm conditionally */}
        {showAbsenceForm && (
            <AbsenceRequestForm 
                open={showAbsenceForm}
              //  onClose={() => setShowAbsenceForm(false)}
              handleClose={() => setShowAbsenceForm(false)}
                onSubmitSuccess={handleAbsenceSubmitSuccess}
                // Pass any other props needed by the form
                mahasiswaId={dataMahasiswa?.id}
                matkulHariIni={matkulHariIni}
            />
        )}
            <Paper 
                component={motion.div} 
                initial={{ opacity: 0, y: 30 }} 
                animate={{ opacity: 1, y: 0 }} 
                transition={{ duration: 0.6 }}
                sx={{ 
                    borderRadius: '24px', 
                    boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
                    overflow: 'hidden'
                }}
            >
                <Box sx={{ p: 3 }}>
                    {/* Header with Profile and Logout */}
                    <AnimatedBox>
                        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                            <Box display="flex" alignItems="center">
                                <Avatar 
                                    alt={dataMahasiswa?.nama_lengkap} 
                                    src={
                                        dataMahasiswa?.avatar 
                                        ? `${getApiBaseUrl()}/uploads/mahasiswa/${dataMahasiswa.avatar}`
                                        : undefined
                                    }
                                    sx={{
                                        width: 80,
                                        height: 80,
                                        border: '4px solid white',
                                        boxShadow: '0 8px 16px rgba(0,0,0,0.15)',
                                    }}
                                />
                                <Box ml={2}>
                                    <Typography variant="h6" fontWeight="bold">
                                        {dataMahasiswa?.nama_lengkap}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        {dataMahasiswa?.npm || 'Mahasiswa'}
                                    </Typography>
                                    <Box mt={0.5} display="flex" alignItems="center">
                                        <LocationOnOutlined fontSize="small" color="primary" sx={{ mr: 0.5, fontSize: 14 }} />
                                        <Typography variant="caption" color="primary">
                                            {dataMahasiswa?.Cabang?.nama || 'Kampus'}
                                        </Typography>
                                    </Box>
                                </Box>
                            </Box>
                            <Button 
                                variant="outlined" 
                                color="error" 
                                size="small"
                                startIcon={<LogoutOutlined />} 
                                onClick={logout}
                                sx={{ borderRadius: '8px' }}
                            >
                                Logout
                            </Button>
                        </Box>
                    </AnimatedBox>

                    {/* Time Display */}
                    <AnimatedBox delay={0.1}>
                        <Paper sx={{
                            borderRadius: '16px',
                            padding: 3,
                            background: 'linear-gradient(135deg, #1976d2 0%, #0d47a1 100%)',
                            color: 'white',
                            boxShadow: '0 8px 20px rgba(25, 118, 210, 0.3)',
                        }}>
                            <Box display="flex" justifyContent="space-between" alignItems="center">
                                <Box>
                                    <Typography variant="h3" fontWeight="bold">
                                        {currentTime}
                                    </Typography>
                                    <Typography variant="body2" sx={{ opacity: 0.8, mt: 1 }}>
                                        {currentDate}
                                    </Typography>
                                </Box>
                                <AccessTimeOutlined sx={{ fontSize: 48, opacity: 0.8 }} />
                            </Box>
                            <Typography variant="body2" sx={{ mt: 2, fontStyle: "italic", opacity: 0.9 }}>
                                "Jangan lupa berdoa sebelum melakukan aktivitas"
                            </Typography>
                        </Paper>
                    </AnimatedBox>

                    {/* Today's Courses */}
                    <AnimatedBox delay={0.2}>
                        <Typography variant="subtitle1" fontWeight="bold" sx={{ mt: 3, mb: 2 }}>
                            Mata Kuliah Hari Ini
                        </Typography>
                        {matkulHariIni.length === 0 ? (
                            <Paper sx={{ 
                                p: 3, 
                                borderRadius: '16px',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                backgroundColor: '#f5f5f5'
                            }}>
                                <BookOutlined sx={{ fontSize: 40, color: '#bdbdbd', mb: 1 }} />
                                <Typography variant="body1" color="text.secondary" align="center">
                                    Tidak ada mata kuliah hari ini
                                </Typography>
                            </Paper>
                        ) : (
                            <Grid container spacing={2}>
                              {matkulHariIni.map((matkul, index) => {
    const courseStatus = getCourseStatus(matkul);
    const matkulAbsensi = getAbsensiForMatkul(matkul.id);
    
    return (
        <Grid item xs={12} key={index}>
            <Paper sx={{ 
                p: 2, 
                borderRadius: '16px',
                border: '1px solid #f0f0f0',
                boxShadow: '0 3px 10px rgba(0,0,0,0.05)',
            }}>
                <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                    <Box>
                        <Typography variant="subtitle1" fontWeight="bold">
                            {matkul.nama_matkul}
                        </Typography>
                        <Box display="flex" alignItems="center" mt={0.5}>
                            <AccessTimeOutlined fontSize="small" sx={{ mr: 0.5, fontSize: 14, color: '#757575' }} />
                            <Typography variant="caption" color="text.secondary">
                                {formatTime(matkul.jam_masuk_presensi)} - {formatTime(matkul.jam_keluar_presensi)}
                            </Typography>
                        </Box>
                        <Box display="flex" alignItems="center" mt={0.5}>
                            <PersonOutlineOutlined fontSize="small" sx={{ mr: 0.5, fontSize: 14, color: '#757575' }} />
                            <Typography variant="caption" color="text.secondary">
                                {matkul.User?.name || 'Dosen'}
                            </Typography>
                        </Box>
                    </Box>
                    <Box>
                        <Chip 
                            label={courseStatus.text} 
                            size="small"
                            sx={{
                                borderRadius: '8px',
                                fontWeight: '600',
                                backgroundColor: 
                                    courseStatus.status === 'open' ? '#e3f8ea' : 
                                    courseStatus.status === 'ongoing' ? '#e3f2fd' :
                                    courseStatus.status === 'in-progress' ? '#e3f2fd' :
                                    courseStatus.status === 'need-checkout' ? '#fff3e0' :
                                    courseStatus.status === 'completed' ? '#e8f5e9' : '#f5f5f5',
                                color: 
                                    courseStatus.status === 'open' ? '#43a047' :
                                    courseStatus.status === 'ongoing' ? '#1976d2' :
                                    courseStatus.status === 'in-progress' ? '#1976d2' :
                                    courseStatus.status === 'need-checkout' ? '#ff9800' :
                                    courseStatus.status === 'completed' ? '#2e7d32' : '#757575',
                            }}
                        />
                    </Box>
                </Box>
                
                {/* Area untuk button - dibersihkan dan diorganisir */}
                <Box mt={2}>
                    {/* Button untuk presensi masuk - hanya muncul jika status open */}
                    {courseStatus.status === 'open' && (
                        <Button 
                            variant="contained"
                            fullWidth
                            onClick={() => {
                                navigate(`/createAbsen?matkulId=${matkul.id}&matkulName=${encodeURIComponent(matkul.nama_matkul)}`);
                            }}
                            sx={{ 
                                borderRadius: '12px',
                                textTransform: 'none',
                                padding: '10px',
                                background: 'linear-gradient(90deg, #1976d2 0%, #2196f3 100%)',
                                fontWeight: 'bold',
                                boxShadow: '0 4px 10px rgba(33, 150, 243, 0.3)',
                            }}
                        >
                            Presensi Masuk
                        </Button>
                    )}
                    
                    {/* Status presensi jika sudah presensi masuk */}
                    {matkulAbsensi?.jam_masuk && (
                        <Box>
                            <Button 
                                variant="outlined"
                                fullWidth
                                disabled
                                startIcon={<CheckCircleOutlineOutlined />}
                                sx={{ 
                                    borderRadius: '12px',
                                    textTransform: 'none',
                                    padding: '10px',
                                    borderColor: '#e0e0e0',
                                    color: '#43a047',
                                    fontWeight: 'medium',
                                    mb: 1, // margin bottom untuk jarak dengan button berikutnya
                                    '&.Mui-disabled': {
                                        color: '#43a047',
                                        borderColor: '#e0e0e0',
                                    }
                                }}
                            >
                                Presensi Masuk: {formatTime(matkulAbsensi?.jam_masuk) || (matkulAbsensi?.status)} 
                            </Button>
                            
                            {/* Button untuk presensi keluar - hanya muncul jika belum presensi keluar */}
                            {!matkulAbsensi?.jam_keluar && (
                                <Button 
                                    variant="contained"
                                    fullWidth
                                    onClick={() => {
                                        navigate(`/clockout?matkulId=${matkul.id}&matkulName=${encodeURIComponent(matkul.nama_matkul)}`);
                                    }}
                                    sx={{ 
                                        borderRadius: '12px',
                                        textTransform: 'none',
                                        padding: '10px',
                                        background: 'linear-gradient(90deg, #ff9800 0%, #ff7043 100%)',
                                        fontWeight: 'bold',
                                        boxShadow: '0 4px 10px rgba(255, 152, 0, 0.3)',
                                    }}
                                >
                                    Presensi Keluar
                                </Button>
                            )}
                            
                            {/* Status presensi keluar jika sudah presensi keluar */}
                            {matkulAbsensi?.jam_keluar && (
                                <Button 
                                    variant="outlined"
                                    fullWidth
                                    disabled
                                    startIcon={<CheckCircleOutlineOutlined />}
                                    sx={{ 
                                        borderRadius: '12px',
                                        textTransform: 'none',
                                        padding: '10px',
                                        borderColor: '#e0e0e0',
                                        color: '#43a047',
                                        fontWeight: 'medium',
                                        '&.Mui-disabled': {
                                            color: '#43a047',
                                            borderColor: '#e0e0e0',
                                        }
                                    }}
                                >
                                    Presensi Keluar: {formatTime(matkulAbsensi?.jam_keluar)}
                                </Button>
                            )}
                        </Box>
                    )}
                    
                    {/* Status untuk kelas yang sudah selesai tapi belum ada presensi */}
                    {!matkulAbsensi?.jam_masuk && courseStatus.status === 'ended' && (
                        <Button 
                            variant="outlined"
                            fullWidth
                            disabled
                            sx={{ 
                                borderRadius: '12px',
                                textTransform: 'none',
                                padding: '10px',
                                borderColor: '#e0e0e0',
                                color: '#757575',
                                fontWeight: 'medium',
                                '&.Mui-disabled': {
                                    color: '#757575',
                                    borderColor: '#e0e0e0',
                                }
                            }}
                        >
                            Kelas Telah Berakhir Anda:{matkulAbsensi?.status || 'N/A'}
                        </Button>
                    )}
                </Box>
            </Paper>
        </Grid>
    );
})}
                            </Grid>
                        )}
                    </AnimatedBox>

                    {/* Menu Utama */}
                    <AnimatedBox delay={0.3}>
                        <Typography variant="subtitle1" fontWeight="bold" sx={{ mt: 4, mb: 2 }}>
                            Menu Utama
                        </Typography>
                        <Grid container spacing={2}>
                            {menuItems.map((item, index) => (
                                // <Grid item xs={6} sm={6} key={index}>
                                <Grid item xs={item.fullWidth ? 12 : 6} sm={item.fullWidth ? 12 : 6} key={index}>

                                    <Paper 
                                    component={item.link ? NavLink : 'div'}
                                    to={item.link}
                                    onClick={item.onClick}
                                    sx={{ 
                                        width: '100%',
                                        textDecoration: 'none',
                                        borderRadius: '16px',
                                        padding: 2,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: item.centerContent ? 'center' : 'flex-start',
                                        boxShadow: '0 3px 8px rgba(0,0,0,0.05)',
                                        border: '1px solid #f0f0f0',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s ease',
                                        '&:hover': {
                                        boxShadow: '0 5px 15px rgba(0,0,0,0.1)',
                                        transform: 'translateY(-2px)'
                                        }
                                    }}
                                    >
                                    <Box sx={{ 
                                        width: 40, 
                                        height: 40, 
                                        borderRadius: '50%', 
                                        display: 'flex', 
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        backgroundColor: `${item.icon.props.sx.color}15`,
                                        mr: item.centerContent ? 0 : 2
                                    }}>
                                        {item.icon}
                                    </Box>
                                    <Typography 
                                        variant="subtitle2" 
                                        fontWeight="500"
                                        color="text.primary"
                                        sx={{
                                        ml: item.centerContent ? 1 : 0, // sedikit jarak dari ikon jika center
                                        textAlign: item.centerContent ? 'center' : 'left'
                                        }}
                                    >
                                        {item.label}
                                    </Typography>
                                    </Paper>

                                </Grid>
                            ))}
                        </Grid>
                    </AnimatedBox>

                </Box>
            </Paper>
        </Container>
    );
}
export default Dashboard;