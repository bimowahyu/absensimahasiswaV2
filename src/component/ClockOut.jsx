import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, NavLink } from 'react-router-dom';
import axios from 'axios'; 
import moment from 'moment-timezone'; 
import * as faceapi from 'face-api.js';
import Lokasi from './lokasi';
import Swal from 'sweetalert2';
import { 
  IoLocationOutline, 
  IoTimeOutline, 
  IoCheckmarkCircleOutline, 
  IoCloseCircleOutline,
  IoCamera,
  IoRefreshOutline,
  IoExitOutline,
  IoBusinessOutline
} from "react-icons/io5";
import { 
  Container, 
  Card, 
  Typography, 
  Button, 
  LinearProgress,
  Avatar,
  Box,
  CircularProgress
} from '@mui/material';

const getApiBaseUrl = () => {
  const protocol = window.location.protocol === 'https:' ? 'https' : 'http';
  const baseUrl = process.env.REACT_APP_API_BASE_URL.replace(/^https?:\/\//, '');
  return `${protocol}://${baseUrl}`;
};

export const ClockOut = () => {
  const navigate = useNavigate();
  
  // Combined state for better performance
  const [appState, setAppState] = useState({
    profileImage: null,
    namaCabang: '',
    radius: null,
    imageSrc: '',
    latitude: null,
    longitude: null,
    modelsLoaded: false,
    faceDetected: false,
    isLoading: false,
    isSubmitting: false,
    photoTaken: false
  });

  // Update state helper function
  const updateState = (newState) => {
    setAppState(prev => ({...prev, ...newState}));
  };
  
  // Refs
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const detectTimeoutRef = useRef(null);
  
  // Load only essential Face API Models
  useEffect(() => {
    const loadModels = async () => {
      try {
        // Load only the essential model
        await faceapi.nets.tinyFaceDetector.loadFromUri('/models');
        updateState({ modelsLoaded: true });
      } catch (error) {
        console.error('Error loading face-api models:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Gagal memuat model face recognition'
        });
      }
    };

    loadModels();
    
    // Cleanup function
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (detectTimeoutRef.current) {
        clearTimeout(detectTimeoutRef.current);
      }
    };
  }, []);

  // Fetch profile data
  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const response = await axios.get(`${getApiBaseUrl()}/Memahasiswa`, { withCredentials: true });
        
        let branchName = '';
        if (response.data.Cabang && response.data.Cabang.nama_cabang) {
          branchName = response.data.Cabang.nama_cabang;
        } else {
          try {
            const branchResponse = await axios.get(`${getApiBaseUrl()}/cabang`, { withCredentials: true });
            branchName = branchResponse.data.name || '';
          } catch (branchError) {
            console.error('Error fetching branch data:', branchError);
          }
        }
        
        updateState({ 
          profileImage: response.data.url,
          namaCabang: branchName
        });
      } catch (error) {
        console.error('Error fetching profile data:', error);
      }
    };
    
    fetchProfileData();
  }, []);

  // Camera initialization
  useEffect(() => {
    const startCamera = async () => {
      try {
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
        }
        
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { 
            width: { ideal: 320 },
            height: { ideal: 240 },
            facingMode: 'user',
            // Lower framerate to reduce CPU usage
            frameRate: { max: 15 }
          } 
        });
      
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          streamRef.current = stream;
          
          // Start face detection once camera is ready
          if (appState.modelsLoaded) {
            detectFace();
          }
        }
      } catch (error) {
        console.error('Error accessing camera:', error);
        Swal.fire({
          icon: 'error',
          title: 'Kesalahan',
          text: 'Tidak dapat mengakses kamera. Pastikan izin kamera diaktifkan.',
        });
      }
    };

    if (appState.modelsLoaded && !appState.photoTaken) {
      startCamera();
    }
  }, [appState.modelsLoaded, appState.photoTaken]);

  // Optimized face detection - run once then only when needed
  const detectFace = async () => {
    if (videoRef.current && appState.modelsLoaded && !appState.photoTaken) {
      try {
        // Use lighter TinyFaceDetector instead of SSD MobileNet
        const detections = await faceapi.detectAllFaces(
          videoRef.current, 
          new faceapi.TinyFaceDetectorOptions({ scoreThreshold: 0.5 })
        );

        updateState({ faceDetected: detections.length > 0 });
        
        // Only schedule next detection if component is still mounted
        // Use longer interval to reduce CPU load
        detectTimeoutRef.current = setTimeout(detectFace, 2000);
      } catch (error) {
        console.error('Face detection error:', error);
        detectTimeoutRef.current = setTimeout(detectFace, 3000);
      }
    }
  };

  // Take Picture with optimized processing
  const takePicture = async () => {
    try {
      if (!appState.modelsLoaded || !videoRef.current || !appState.faceDetected) {
        Swal.fire({
          icon: 'warning',
          title: 'Peringatan',
          text: 'Wajah belum terdeteksi dengan benar.',
        });
        return;
      }

      // Clear detection timeout to save resources
      if (detectTimeoutRef.current) {
        clearTimeout(detectTimeoutRef.current);
      }

      const video = videoRef.current;
      const canvas = document.createElement('canvas');
      
      // Optimize canvas size (smaller than original for better performance)
      canvas.width = 320;
      canvas.height = 240;
      
      const context = canvas.getContext('2d');
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      // Use higher compression for smaller file size
      const compressedImageUrl = canvas.toDataURL('image/jpeg', 0.6);
      
      updateState({ 
        imageSrc: compressedImageUrl,
        photoTaken: true
      });
      
      // Get location when picture is taken
      getLocation();
      
      // Stop camera stream to save resources
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    } catch (error) {
      console.error('Error taking picture:', error);
    }
  };

  // Retake Picture
  const retakePicture = () => {
    // Reset state
    updateState({
      photoTaken: false,
      imageSrc: '',
      faceDetected: false
    });
    
    // Need to restart camera
    setTimeout(() => {
      if (appState.modelsLoaded) {
        const startCamera = async () => {
          try {
            const stream = await navigator.mediaDevices.getUserMedia({ 
              video: { 
                width: { ideal: 320 },
                height: { ideal: 240 },
                facingMode: 'user',
                frameRate: { max: 15 }
              } 
            });
          
            if (videoRef.current) {
              videoRef.current.srcObject = stream;
              streamRef.current = stream;
              detectFace();
            }
          } catch (error) {
            console.error('Error restarting camera:', error);
          }
        };
        startCamera();
      }
    }, 300);
  };

  // Get Location
  const getLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          updateState({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
        },
        (error) => {
          console.error("Error getting location:", error);
          Swal.fire({
            icon: 'error',
            title: 'Kesalahan',
            text: 'Gagal mendapatkan lokasi. Pastikan GPS aktif.',
          });
        }
      );
    } else {
      console.error("Geolocation is not supported by this browser.");
      Swal.fire({
        icon: 'error',
        title: 'Tidak Didukung',
        text: 'Geolokasi tidak didukung oleh browser Anda.',
      });
    }
  };

  // Create Absensi Keluar
  const createAbsensiKeluar = async () => {
    try {
      // Validasi
      if (!appState.imageSrc) {
        Swal.fire({
          icon: 'warning',
          title: 'Peringatan',
          text: 'Silakan ambil foto terlebih dahulu',
        });
        return;
      }

      if (!appState.latitude || !appState.longitude) {
        Swal.fire({
          icon: 'warning',
          title: 'Peringatan',
          text: 'Silakan tunggu proses lokasi',
        });
        return;
      }

      updateState({ 
        isLoading: true,
        isSubmitting: true
      });

      const response = await axios.post(`${getApiBaseUrl()}/absensi/mahasiswa/keluar`, {
        latitude: appState.latitude,
        longitude: appState.longitude,
        image: appState.imageSrc,
      }, {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json'
        }
      });

      Swal.fire({
        icon: 'success',
        title: 'Berhasil',
        text: response.data.msg,
      });

      navigate('/Dashboard');
    } catch (error) {
      console.error('Error creating absensi keluar:', error);
      
      if (error.response) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: error.response.data.msg || 'Terjadi kesalahan',
        });
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Terjadi kesalahan tidak terduga',
        });
      }
    } finally {
      updateState({
        isLoading: false,
        isSubmitting: false
      });
    }
  };

  // Format for displaying coordinates
  const formatCoordinate = (coord) => {
    if (coord === null) return "Menunggu...";
    return coord.toFixed(6);
  };
  
  const getResponsiveHeight = () => {
    return {
      height: 'calc(100vh - 32px)', 
      maxHeight: '640px', 
      minHeight: '500px'  
    };
  };
  
  return (
    <Container 
      maxWidth="sm" 
      sx={{ 
        mt: 2, 
        mb: 2,
        width: { xs: '100%', sm: '480px' }, 
        px: 0 
      }}
      disableGutters 
    >
      <Card sx={{ 
        borderRadius: 2, 
        overflow: 'hidden', 
        boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
        bgcolor: '#121212',
        width: '100%'
      }}>
        {/* Camera/Photo View - Responsive Height */}
        <Box sx={{ 
          position: 'relative', 
          width: '100%',
          ...getResponsiveHeight(),
          bgcolor: '#000',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          overflow: 'hidden'
        }}>
          {/* Location Header */}
          <Box sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            zIndex: 10,
            p: 1.5,
            bgcolor: 'rgba(0,0,0,0.5)',
            borderBottom: '1px solid rgba(255,255,255,0.1)',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
              {/* Branch Name */}
              <Typography variant="subtitle2" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                <IoBusinessOutline size={16} />
                <span>{appState.namaCabang || 'Loading...'}</span>
              </Typography>
              
              <Typography variant="subtitle2" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <IoTimeOutline size={16} />
                <span>{moment().format('DD MMM YYYY HH:mm:ss')}</span>
              </Typography>
            </Box>
            
            {appState.profileImage ? (
              <Avatar 
                src={appState.profileImage} 
                alt="Profile" 
                sx={{ width: 32, height: 32, border: '1px solid white' }} 
              />
            ) : (
              <Avatar sx={{ width: 32, height: 32, bgcolor: 'grey.700', border: '1px solid white' }} />
            )}
          </Box>

          {!appState.photoTaken ? (
            <>
              {/* Live Camera Feed */}
              {appState.modelsLoaded && (
                <video 
                  ref={videoRef} 
                  autoPlay 
                  muted 
                  playsInline
                  style={{ 
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover'
                  }}
                />
              )}

              {/* Camera Overlay */}
              <Box sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                pointerEvents: 'none'
              }}>
                {/* Face Guide Circle */}
                <Box sx={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  width: '220px',
                  height: '220px',
                  border: '3px solid rgba(255,255,255,0.6)',
                  borderRadius: '50%'
                }} />
                
                {/* Status Indicator */}
                <Box sx={{
                  position: 'absolute',
                  top: 90, 
                  right: 16, 
                  bgcolor: 'rgba(0,0,0,0.6)',
                  borderRadius: '50%',
                  width: 40,
                  height: 40,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {appState.faceDetected ? (
                    <IoCheckmarkCircleOutline color="#4CAF50" size={30} />
                  ) : (
                    <IoCloseCircleOutline color="#F44336" size={30} />
                  )}
                </Box>
                
                {/* Face Detection Text */}
                <Box sx={{
                  position: 'absolute',
                  top: 140,
                  right: 16,
                  bgcolor: 'rgba(0,0,0,0.6)',
                  borderRadius: 1,
                  px: 1,
                  py: 0.5
                }}>
                  <Typography variant="caption" color="white">
                    {appState.faceDetected ? 'Wajah Terdeteksi' : 'Posisikan Wajah'}
                  </Typography>
                </Box>
              </Box>
            </>
          ) : (
            // Captured Photo
            <img 
              src={appState.imageSrc} 
              alt="Captured" 
              style={{ 
                width: '100%',
                height: '100%',
                objectFit: 'cover'
              }} 
            />
          )}

          {/* Bottom Action Area with Maps and Coordinates */}
          <Box sx={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '120px',
            bgcolor: 'rgba(0,0,0,0.75)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderTop: '1px solid rgba(255,255,255,0.1)',
            px: 2
          }}>
            {/* Left Side - Coordinates */}
            <Box sx={{ 
              width: '30%', 
              height: '100%', 
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              color: 'white'
            }}>
              <Typography variant="caption" color="grey.400">Koordinat:</Typography>
              <Typography variant="body2" sx={{ mt: 0.5, fontWeight: 'medium' }}>
                {formatCoordinate(appState.latitude)}
              </Typography>
              <Typography variant="body2" sx={{ mt: 0.5, fontWeight: 'medium' }}>
                {formatCoordinate(appState.longitude)}
              </Typography>
            </Box>
            
            {/* Center - Action Button */}
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              {!appState.photoTaken ? (
                // Capture Button
                <Button
                  disabled={!appState.faceDetected}
                  onClick={takePicture}
                  sx={{ 
                    minWidth: 64, 
                    height: 64, 
                    borderRadius: '50%', 
                    bgcolor: 'white',
                    '&:hover': { bgcolor: '#f5f5f5' },
                    '&:disabled': { bgcolor: 'grey.700' },
                    border: appState.faceDetected ? '3px solid #4CAF50' : '3px solid #9e9e9e'
                  }}
                >
                  <IoCamera size={32} color={appState.faceDetected ? "#4CAF50" : "#9e9e9e"} />
                </Button>
              ) : (
                // Submit/Retake Buttons
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Button
                    variant="contained"
                    color="error"
                    size="small"
                    onClick={createAbsensiKeluar}
                    disabled={appState.isLoading || !appState.latitude || !appState.longitude}
                    sx={{ 
                      borderRadius: 4,
                      minWidth: 120,
                      position: 'relative'
                    }}
                  >
                    {appState.isSubmitting ? (
                      <>
                        <CircularProgress 
                          size={24} 
                          color="inherit" 
                          sx={{ 
                            position: 'absolute', 
                            left: 10,
                            color: 'white' 
                          }}
                        />
                        <Box sx={{ ml: 3 }}>Proses...</Box>
                      </>
                    ) : (
                      <>
                        <IoExitOutline style={{ marginRight: '8px' }} />
                        Absen Keluar
                      </>
                    )}
                  </Button>
                  <Button
                    variant="outlined"
                    color="secondary"
                    size="small"
                    onClick={retakePicture}
                    disabled={appState.isLoading}
                    startIcon={<IoRefreshOutline />}
                    sx={{ borderRadius: 4, color: 'white', borderColor: 'white' }}
                  >
                    Ulangi
                  </Button>
                </Box>
              )}
            </Box>
            
            {/* Right Side - Map */}
            <Box sx={{ 
              width: '30%', 
              height: '80%', 
              borderRadius: 1,
              overflow: 'hidden',
              border: '1px solid rgba(255,255,255,0.2)'
            }}>
              <Lokasi 
                latitude={appState.latitude} 
                longitude={appState.longitude} 
                radius={appState.radius} 
              />
            </Box>
          </Box>
          
          {/* Loading Bar at Top */}
          {appState.isLoading && (
            <LinearProgress sx={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3 }} />
          )}
          
          {/* Full Screen Loading Overlay */}
          {appState.isSubmitting && (
            <Box sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              bgcolor: 'rgba(0,0,0,0.7)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 20
            }}>
              <CircularProgress 
                size={60} 
                sx={{ color: '#DC3545', mb: 2 }} 
              />
              <Typography variant="h6" color="white">
                Mengirim Data...
              </Typography>
              <Typography variant="body2" color="grey.400" sx={{ mt: 1 }}>
                Mohon tunggu sebentar
              </Typography>
            </Box>
          )}
          
          {/* Back Button */}
          <Box sx={{
            position: 'absolute',
            bottom: 130,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 5
          }}>
            <Button 
              component={NavLink} 
              to="/dashboard" 
              variant="text" 
              size="small"
              sx={{ 
                color: 'white', 
                opacity: 0.7, 
                '&:hover': { opacity: 1 } 
              }}
              disabled={appState.isLoading}
            >
              Kembali ke Dashboard
            </Button>
          </Box>
        </Box>
      </Card>
    </Container>
  );
};

export default ClockOut;