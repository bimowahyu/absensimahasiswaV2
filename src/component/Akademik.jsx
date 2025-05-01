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
    Chip,
    Card,
    CardContent,
    CardHeader,
    Divider
} from '@mui/material';
import { 
    LogoutOutlined, 
    EventNoteOutlined, 
    LocalOfferOutlined, 
    PersonOutlineOutlined, 
    AccessTimeOutlined,
    BookOutlined,
    SchoolOutlined
} from "@mui/icons-material";
import { NavLink, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { LogOut, reset } from "../fitur/AuthMahasiswa";
import { motion } from 'framer-motion';
import axios from 'axios';

const getApiBaseUrl = () => {
    const protocol = window.location.protocol === 'https:' ? 'https' : 'http';
    const baseUrl = process.env.REACT_APP_API_BASE_URL.replace(/^https?:\/\//, '');
    return `${protocol}://${baseUrl}`;
};

export const Akademik = () => {
    const [loading, setLoading] = useState(true);
    const [kursus, setKursus] = useState([]);
    const [mahasiswa, setMahasiswa] = useState({});
    const [error, setError] = useState(null);
    
    const { user } = useSelector((state) => state.authMahasiswa);
    const navigate = useNavigate();
    const dispatch = useDispatch();
    
    const logout = () => {
        dispatch(LogOut());
        dispatch(reset());
        navigate("/");
    };
    
    useEffect(() => {
        // Redirect if no user is logged in
        if (!user) {
            navigate("/");
            return;
        }
        
        const fetchData = async () => {
            try {
                setLoading(true);
                // const mahasiswaResponse = await axios.get(`${getApiBaseUrl()}/mahasiswa/${user.id}`, {
                //     withCredentials: true
                //   });
                  
                
                const matkulResponse = await axios.get(`${getApiBaseUrl()}/mahasiswa/matkul/list`, {
                    withCredentials: true
                  });
                  
                  console.log("Matkul data:", matkulResponse.data);

                 // setMahasiswa(mahasiswaResponse.data);
                  setKursus(matkulResponse.data.matkul);
                  setLoading(false);
            } catch (err) {
                setError("Gagal memuat data: " + (err.response?.data?.message || err.message));
                setLoading(false);
            }
        };
        
        fetchData();
    }, [user, navigate]);
    
    // Helper to get current day's courses
    const getTodayCourses = () => {
        const days = ['minggu', 'senin', 'selasa', 'rabu', 'kamis', 'jumat', 'sabtu'];
        const today = days[new Date().getDay()];
        
        return kursus.filter(course => course.hari.toLowerCase() === today);
    };
    
    // Format time for display (24-hour format to 12-hour format)
    const formatTime = (time) => {
        const [hours, minutes] = time.split(':');
        const hour = parseInt(hours, 10);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const formattedHour = hour % 12 || 12;
        
        return `${formattedHour}:${minutes} ${ampm}`;
    };
    
    // Get course status based on current time
    const getCourseStatus = (course) => {
        const now = new Date();
        const currentTime = `${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}`;
        
        if (currentTime < course.jam_dibuka_presensi) {
            return { status: "Belum Dimulai", color: "warning" };
        } else if (currentTime >= course.jam_dibuka_presensi && currentTime < course.jam_masuk_presensi) {
            return { status: "Presensi Dibuka", color: "info" };
        } else if (currentTime >= course.jam_masuk_presensi && currentTime < course.jam_keluar_presensi) {
            return { status: "Sedang Berlangsung", color: "success" };
        } else {
            return { status: "Selesai", color: "default" };
        }
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <CircularProgress />
            </Box>
        );
    }
    
    if (error) {
        return (
            <Box sx={{ p: 3, textAlign: 'center' }}>
                <Typography variant="h6" color="error">
                    {error}
                </Typography>
                <Button variant="contained" onClick={() => window.location.reload()} sx={{ mt: 2 }}>
                    Coba Lagi
                </Button>
            </Box>
        );
    }

    const todayCourses = getTodayCourses();
    const avatarUrl = `${getApiBaseUrl()}/uploads/mahasiswa/${mahasiswa.avatar}`;
    console.log(avatarUrl)
    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            {/* Header / Profile Section */}
            <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <Paper elevation={3} sx={{ p: 3, mb: 4, borderRadius: 2 }}>
                    <Grid container spacing={3} alignItems="center">
                        <Grid item xs={12} sm={2} sx={{ display: 'flex', justifyContent: { xs: 'center', sm: 'flex-start' } }}>
                            {/* <Avatar 
                              src={avatarUrl
                                // mahasiswa?.avatar 
                                // ? `${getApiBaseUrl()}/uploads/mahasiswa/${mahasiswa.avatar}`
                                // : undefined
                            }
                                alt={mahasiswa.nama_lengkap}
                                sx={{ width: 100, height: 100 }}
                            /> */}
                        </Grid>
                        <Grid item xs={12} sm={8}>
                            <Typography variant="h4" gutterBottom>
                                {mahasiswa.nama_lengkap}
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                <PersonOutlineOutlined fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                                <Typography variant="body1" color="text.secondary">
                                    {mahasiswa.username}
                                </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <SchoolOutlined fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                                {/* <Typography variant="body1" color="text.secondary">
                                    {mahasiswa.Cabang?.nama || 'Kampus'}
                                </Typography> */}
                            </Box>
                        </Grid>
                        <Grid item xs={12} sm={2} sx={{ display: 'flex', justifyContent: { xs: 'center', sm: 'flex-end' } }}>
                            <Button 
                                variant="outlined" 
                                color="error" 
                                startIcon={<LogoutOutlined />}
                                onClick={logout}
                            >
                                Logout
                            </Button>
                        </Grid>
                    </Grid>
                </Paper>
            </motion.div>
            
            {/* Today's Schedule */}
            <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
            >
                <Box sx={{ mb: 4 }}>
                    <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                        <EventNoteOutlined sx={{ mr: 1 }} />
                        Jadwal Hari Ini
                    </Typography>
                    
                    {todayCourses.length > 0 ? (
                        <Grid container spacing={2}>
                            {todayCourses.map((course) => {
                                const courseStatus = getCourseStatus(course);
                                
                                return (
                                    <Grid item xs={12} md={6} key={course.id}>
                                        <Card sx={{ borderRadius: 2, height: '100%' }}>
                                            <CardHeader
                                                title={course.nama_matkul}
                                                subheader={
                                                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                                                        <AccessTimeOutlined fontSize="small" sx={{ mr: 1 }} />
                                                        <Typography variant="body2">
                                                            {formatTime(course.jam_masuk_presensi)} - {formatTime(course.jam_keluar_presensi)}
                                                        </Typography>
                                                    </Box>
                                                }
                                                action={
                                                    <Chip 
                                                        label={courseStatus.status} 
                                                        color={courseStatus.color} 
                                                        size="small" 
                                                    />
                                                }
                                            />
                                            <CardContent>
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    <Typography variant="body2" color="text.secondary">
                                                        Presensi dibuka: {formatTime(course.jam_dibuka_presensi)}
                                                    </Typography>
                                                    <Button 
                                                        variant="contained" 
                                                        size="small"
                                                        component={NavLink}
                                                        to={`/presensi/${course.id}`}
                                                        disabled={courseStatus.status === "Selesai" || courseStatus.status === "Belum Dimulai"}
                                                    >
                                                        Presensi
                                                    </Button>
                                                </Box>
                                            </CardContent>
                                        </Card>
                                    </Grid>
                                );
                            })}
                        </Grid>
                    ) : (
                        <Paper sx={{ p: 3, textAlign: 'center', borderRadius: 2 }}>
                            <Typography variant="body1">
                                Tidak ada jadwal kuliah hari ini.
                            </Typography>
                        </Paper>
                    )}
                </Box>
            </motion.div>
            
            {/* All Courses */}
            <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
            >
                <Box>
                    <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                        <BookOutlined sx={{ mr: 1 }} />
                        Semua Mata Kuliah
                    </Typography>
                    
                    <Grid container spacing={2}>
                        {kursus.map((course) => (
                            <Grid item xs={12} sm={6} md={4} key={course.id}>
                                <Card sx={{ borderRadius: 2, height: '100%' }}>
                                    {/* <CardHeader
                                        title={course.nama_matkul}
                                        subheader={`Hari ${course.hari.charAt(0).toUpperCase() + course.hari.slice(1)}`}
                                        action={
                                            <Chip 
                                                label={`ID: ${course.id}`} 
                                                color="primary" 
                                                size="small"
                                                variant="outlined" 
                                            />
                                        }
                                    /> */}
                                    <Divider />
                                    <CardContent>
                                        <Box sx={{ mb: 2 }}>
                                            <Typography variant="body2" color="text.secondary" gutterBottom>
                                                <strong>Waktu Kuliah:</strong>
                                            </Typography>
                                            <Typography variant="body2">
                                                {formatTime(course.jam_masuk_presensi)} - {formatTime(course.jam_keluar_presensi)}
                                            </Typography>
                                        </Box>
                                        
                                        <Box>
                                            <Typography variant="body2" color="text.secondary" gutterBottom>
                                                <strong>Presensi Dibuka:</strong>
                                            </Typography>
                                            <Typography variant="body2">
                                                {formatTime(course.jam_dibuka_presensi)}
                                            </Typography>
                                        </Box>
                                        
                                        {/* <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                                            <Button 
                                                variant="outlined" 
                                                size="small"
                                                component={NavLink}
                                                to={`/matkul/detail/${course.id}`}
                                            >
                                                Detail
                                            </Button>
                                        </Box> */}
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))}
                         
                    </Grid>
                    
                    
                    {kursus.length === 0 && (
                        <Paper sx={{ p: 3, textAlign: 'center', borderRadius: 2 }}>
                            <Typography variant="body1">
                                Tidak ada mata kuliah yang terdaftar.
                            </Typography>
                        </Paper>
                    )}
                </Box>
                <Button component={NavLink} to="/dashboard" variant="contained" color="primary" fullWidth>
                                           Kembali
                                         </Button>
            </motion.div>
        </Container>
    );
};