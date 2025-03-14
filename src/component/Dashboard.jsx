import React, { useState, useEffect } from 'react';
import { 
    Container, 
    Card, 
    CardContent, 
    Typography, 
    Grid, 
    Avatar, 
    Button, 
    Box, 
    Paper, 
    Divider,
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
    TrendingUpOutlined
} from "@mui/icons-material";
import axios from 'axios';
import { NavLink, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { LogOut, reset } from "../fitur/AuthKaryawan";
import { styled } from '@mui/material/styles';
import { motion } from 'framer-motion';

// Styled components
const DashboardCard = styled(Card)(({ theme }) => ({
    borderRadius: '24px',
    boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
    background: 'white',
    overflow: 'visible'
}));

const ProfileAvatar = styled(Avatar)(({ theme }) => ({
    width: 80,
    height: 80,
    border: `4px solid white`,
    boxShadow: '0 8px 16px rgba(0,0,0,0.15)',
}));

const GradientButton = styled(Button)(({ theme }) => ({
    borderRadius: '12px',
    textTransform: 'none',
    padding: '14px 20px',
    background: 'linear-gradient(90deg, #1976d2 0%, #2196f3 100%)',
    color: 'white',
    fontWeight: 'bold',
    boxShadow: '0 4px 10px rgba(33, 150, 243, 0.3)',
    '&:hover': {
        background: 'linear-gradient(90deg, #1565c0 0%, #1976d2 100%)',
        boxShadow: '0 6px 12px rgba(33, 150, 243, 0.4)',
    }
}));

const MenuCard = styled(Paper)(({ theme }) => ({
    borderRadius: '16px',
    padding: theme.spacing(2),
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-start',
    boxShadow: '0 3px 8px rgba(0,0,0,0.05)',
    border: '1px solid #f0f0f0',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    '&:hover': {
        boxShadow: '0 5px 15px rgba(0,0,0,0.1)',
        transform: 'translateY(-2px)'
    }
}));

const StatusChip = styled(Chip)(({ theme, status }) => ({
    borderRadius: '8px',
    fontWeight: '600',
    padding: '0 8px',
    backgroundColor: status === 'active' ? '#e3f8ea' : '#f5f5f5',
    color: status === 'active' ? '#43a047' : theme.palette.text.secondary,
}));

const TimeDisplayCard = styled(Paper)(({ theme }) => ({
    borderRadius: '16px',
    padding: theme.spacing(3),
    background: 'linear-gradient(135deg, #1976d2 0%, #0d47a1 100%)',
    color: 'white',
    boxShadow: '0 8px 20px rgba(25, 118, 210, 0.3)',
}));

const AttendanceCard = styled(Paper)(({ theme, isActive }) => ({
    borderRadius: '16px',
    padding: theme.spacing(3),
    background: isActive ? 'linear-gradient(135deg, #4caf50 0%, #2e7d32 100%)' : '#f5f5f5',
    color: isActive ? 'white' : theme.palette.text.primary,
    boxShadow: isActive ? '0 8px 20px rgba(76, 175, 80, 0.3)' : 'none',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    transition: 'all 0.3s ease',
}));

// Menu item icon colors
const menuColors = {
    gaji: '#1976d2',      // Blue
    riwayat: '#7e57c2',   // Purple
    profil: '#26a69a',    // Teal
    statistik: '#ef5350'  // Red
};

// Animate components with framer-motion
const AnimatedBox = ({ children, delay = 0 }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay }}
    >
        {children}
    </motion.div>
);

export const Dashboard = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [dataKaryawan, setDataKaryawan] = useState(null);
    const [error, setError] = useState(null);
    const [currentTime, setCurrentTime] = useState('');
    const [currentDate, setCurrentDate] = useState('');
    const [absensiData, setAbsensiData] = useState(null);
    const [loading, setLoading] = useState(true);

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
                const profileResponse = await axios.get(`${getApiBaseUrl()}/MeKaryawan`, { withCredentials: true });
                const absensiResponse = await axios.get(`${getApiBaseUrl()}/absensi/get`, { withCredentials: true });
                
                setDataKaryawan(profileResponse.data);
                setAbsensiData(absensiResponse.data);
            } catch (error) {
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    // Logout Handler
    const logout = () => {
        dispatch(LogOut());
        dispatch(reset());
        navigate("/");
    };

    // API Base URL Helper
    const getApiBaseUrl = () => {
        const protocol = window.location.protocol === 'https:' ? 'https' : 'http';
        const baseUrl = process.env.REACT_APP_API_BASE_URL.replace(/^https?:\/\//, '');
        return `${protocol}://${baseUrl}`;
    };

    // Check if today's attendance exists
    const hasClockedIn = absensiData?.absensiHariIni?.jam_masuk;
    const hasClockedOut = absensiData?.absensiHariIni?.jam_keluar;

    // Menu items configuration
    const menuItems = [
        { 
            icon: <AccountBalanceWalletOutlined sx={{ color: menuColors.gaji }} />, 
            label: 'Gaji', 
            link: '/confrimgaji' 
        },
        { 
            icon: <EventNoteOutlined sx={{ color: menuColors.riwayat }} />, 
            label: 'Riwayat', 
            link: '/GetAbsen' 
        },
        { 
            icon: <PersonOutlineOutlined sx={{ color: menuColors.profil }} />, 
            label: 'Profil', 
            link: '/users' 
        },
        { 
            icon: <TrendingUpOutlined sx={{ color: menuColors.statistik }} />, 
            label: 'Statistik', 
            link: '/GetAbsenBulan' 
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
            <DashboardCard component={motion.div} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
                <CardContent sx={{ p: 3 }}>
                    {/* Header with Profile and Logout */}
                    <AnimatedBox>
                        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                            <Box display="flex" alignItems="center">
                                <ProfileAvatar 
                                    alt={dataKaryawan.nama_lengkap} 
                                    src={dataKaryawan.url} 
                                />
                                <Box ml={2}>
                                    <Typography variant="h6" fontWeight="bold">
                                        {dataKaryawan.nama_lengkap}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        {dataKaryawan.jabatan}
                                    </Typography>
                                    <Box mt={0.5} display="flex" alignItems="center">
                                        <LocationOnOutlined fontSize="small" color="primary" sx={{ mr: 0.5, fontSize: 14 }} />
                                        <Typography variant="caption" color="primary">
                                            {dataKaryawan.Cabang?.nama_cabang}
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
                        <TimeDisplayCard>
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
                        </TimeDisplayCard>
                    </AnimatedBox>

                    {/* Attendance Status */}
                    <AnimatedBox delay={0.2}>
                        <Typography variant="subtitle1" fontWeight="bold" sx={{ mt: 3, mb: 2 }}>
                            Status Kehadiran Hari Ini
                        </Typography>
                        <Grid container spacing={2}>
                            <Grid item xs={6}>
                                <AttendanceCard isActive={!!hasClockedIn}>
                                    <Typography variant="h6" fontWeight="600" mb={1}>
                                       Masuk
                                    </Typography>
                                    {hasClockedIn ? (
                                        <>
                                            <CheckCircleOutlineOutlined sx={{ fontSize: 36, mb: 1 }} />
                                            <Typography variant="h5" fontWeight="bold">
                                                {hasClockedIn}
                                            </Typography>
                                        </>
                                    ) : (
                                        <GradientButton 
                                            component={NavLink} 
                                            to="/createAbsen" 
                                            fullWidth
                                            sx={{ mt: 1 }}
                                        >
                                            Absen Masuk
                                        </GradientButton>
                                    )}
                                </AttendanceCard>
                            </Grid>
                            <Grid item xs={6}>
                                <AttendanceCard isActive={!!hasClockedOut}>
                                    <Typography variant="h6" fontWeight="600" mb={1}>
                                       Keluar
                                    </Typography>
                                    {hasClockedOut ? (
                                        <>
                                            <CheckCircleOutlineOutlined sx={{ fontSize: 36, mb: 1 }} />
                                            <Typography variant="h5" fontWeight="bold">
                                                {hasClockedOut}
                                            </Typography>
                                        </>
                                    ) : (
                                        <GradientButton 
                                            component={NavLink} 
                                            to="/clockout" 
                                            fullWidth
                                            sx={{ mt: 1 }}
                                        >
                                            Absen Keluar
                                        </GradientButton>
                                    )}
                                </AttendanceCard>
                            </Grid>
                        </Grid>
                    </AnimatedBox>

                    {/* Menu Utama - Redesigned to prevent cropping */}
                    <AnimatedBox delay={0.3}>
                        <Typography variant="subtitle1" fontWeight="bold" sx={{ mt: 4, mb: 2 }}>
                            Menu Utama
                        </Typography>
                        <Grid container spacing={2}>
                            {menuItems.map((item, index) => (
                                <Grid item xs={6} sm={6} key={index}>
                                    <MenuCard 
                                        component={NavLink} 
                                        to={item.link}
                                        sx={{ 
                                            textDecoration: 'none',
                                        }}
                                    >
                                        <Box sx={{ 
                                            width: 40, 
                                            height: 40, 
                                            borderRadius: '50%', 
                                            display: 'flex', 
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            backgroundColor: `${Object.values(menuColors)[index]}15`,
                                            mr: 2
                                        }}>
                                            {React.cloneElement(item.icon, { fontSize: 'medium' })}
                                        </Box>
                                        <Typography 
                                            variant="subtitle2" 
                                            fontWeight="500"
                                            color="text.primary"
                                        >
                                            {item.label}
                                        </Typography>
                                    </MenuCard>
                                </Grid>
                            ))}
                        </Grid>
                    </AnimatedBox>

                    {/* Recent Activity */}
                    <AnimatedBox delay={0.4}>
                        <Box mt={4}>
                            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                                <Typography variant="subtitle1" fontWeight="bold">
                                    Kehadiran Terakhir
                                </Typography>
                                <Button 
                                    component={NavLink} 
                                    to="/GetAbsen" 
                                    variant="text" 
                                    color="primary" 
                                    size="small"
                                >
                                    Lihat Semua
                                </Button>
                            </Box>
                            {absensiData?.absensiList?.slice(0, 3).map((absensi, index) => (
                                <Paper
                                    key={index}
                                    elevation={0}
                                    sx={{ 
                                        p: 2, 
                                        mb: 1.5, 
                                        borderRadius: '12px',
                                        border: '1px solid #f0f0f0'
                                    }}
                                >
                                    <Box display="flex" justifyContent="space-between" alignItems="center">
                                        <Box>
                                            <Typography variant="subtitle2" fontWeight="bold">
                                                {new Date(absensi.tanggal).toLocaleDateString('id-ID', { 
                                                    weekday: 'long', 
                                                    year: 'numeric', 
                                                    month: 'long', 
                                                    day: 'numeric' 
                                                })}
                                            </Typography>
                                            <Box display="flex" alignItems="center" mt={0.5}>
                                                <AccessTimeOutlined fontSize="small" sx={{ mr: 0.5, fontSize: 14, color: '#757575' }} />
                                                <Typography variant="caption" color="text.secondary">
                                                    {absensi.jam_masuk} - {absensi.jam_keluar || 'Belum Keluar'}
                                                </Typography>
                                            </Box>
                                        </Box>
                                        <StatusChip 
                                            label={absensi.jam_keluar ? "Completed" : "Active"} 
                                            status={absensi.jam_keluar ? 'completed' : 'active'}
                                            size="small"
                                        />
                                    </Box>
                                </Paper>
                            ))}
                        </Box>
                    </AnimatedBox>
                </CardContent>
            </DashboardCard>
        </Container>
    );
}

export default Dashboard;