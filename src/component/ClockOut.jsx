import React, { useState, useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
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
  CardContent, 
  Typography, 
  Grid, 
  Button, 
  LinearProgress,
  Avatar,
  Box,
  Paper,
  Divider,
  CircularProgress
} from '@mui/material';

const getApiBaseUrl = () => {
  const protocol = window.location.protocol === 'https:' ? 'https' : 'http';
  const baseUrl = process.env.REACT_APP_API_BASE_URL.replace(/^https?:\/\//, '');
  return `${protocol}://${baseUrl}`;
};

export const ClockOut = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  // State Variables
  const [radius, setRadius] = useState(null);
  const [imageSrc, setImageSrc] = useState('');
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);
  
  // Face Recognition States
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [faceDetected, setFaceDetected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Refs
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  
  const [profileImage, setProfileImage] = useState(null);
  const [namaCabang, setNamaCabang] = useState(null)
  const [photoTaken, setPhotoTaken] = useState(false);

  // Load Face API Models
  useEffect(() => {
    const loadModels = async () => {
      try {
        await Promise.all([
          faceapi.nets.ssdMobilenetv1.loadFromUri('/models'),
          faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
          faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
          faceapi.nets.faceRecognitionNet.loadFromUri('/models')
        ]);
        setModelsLoaded(true);
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
  }, []);

 useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const response = await axios.get(`${getApiBaseUrl()}/MeKaryawan`, { withCredentials: true });
        setProfileImage(response.data.url);
        if (response.data.Cabang && response.data.Cabang.nama_cabang) {
          setNamaCabang(response.data.Cabang.nama_cabang);
        } else {
          const branchResponse = await axios.get(`${getApiBaseUrl()}/cabang`, { withCredentials: true });
          setNamaCabang(branchResponse.data.name || 'Kantor Pusat');
        }
      } catch (error) {
        console.error('Error fetching profile data:', error);
        setNamaCabang('Kantor Pusat');
      }
    };
    fetchProfileData();
  }, []);

  // Open Camera and Start Face Detection
  const startCamera = async () => {
    try {
      // Stop any existing stream first
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { width: 320, height: 240, facingMode: 'user' } 
      });
  
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
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

  useEffect(() => {
    if (modelsLoaded) {
      startCamera();
    }
  
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, [modelsLoaded]);

  // Continuous Face Detection
  useEffect(() => {
    let intervalId;
    const detectFaceContinuously = async () => {
      if (videoRef.current && modelsLoaded && !photoTaken) {
        try {
          const detections = await faceapi
            .detectAllFaces(videoRef.current, new faceapi.SsdMobilenetv1Options())
            .withFaceLandmarks()
            .withFaceDescriptors();

          if (detections.length > 0) {
            setFaceDetected(true);
          } else {
            setFaceDetected(false);
          }
        } catch (error) {
          console.error('Face detection error:', error);
        }
      }
    };

    if (modelsLoaded && !photoTaken) {
      // Check for face every 5 seconds
      intervalId = setInterval(detectFaceContinuously, 5000);
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [modelsLoaded, photoTaken]);

  // Take Picture Manually
  const takePicture = async () => {
    try {
      if (!modelsLoaded || !videoRef.current || !faceDetected) {
        Swal.fire({
          icon: 'warning',
          title: 'Peringatan',
          text: 'Wajah belum terdeteksi dengan benar.',
        });
        return;
      }

      const photo = document.createElement('canvas');
      const video = videoRef.current;
      
      const originalWidth = video.videoWidth;
      const originalHeight = video.videoHeight;
      const targetWidth = 400;
      const targetHeight = (originalHeight / originalWidth) * targetWidth;

      photo.width = targetWidth;
      photo.height = targetHeight;
      
      const context = photo.getContext('2d');
      context.drawImage(video, 0, 0, targetWidth, targetHeight);
      
      const compressedImageUrl = photo.toDataURL('image/jpeg', 0.7);
      
      // Face Detection on Captured Image
      const img = new Image();
      img.src = compressedImageUrl;
      
      img.onload = async () => {
        const detections = await faceapi
          .detectAllFaces(videoRef.current, new faceapi.TinyFaceDetectorOptions())
          .withFaceLandmarks()
          .withFaceDescriptors();
      
        if (detections.length > 0) {
          setImageSrc(compressedImageUrl);
          setPhotoTaken(true);
          // Get location when picture is taken
          getLocation();
        }
      };
    } catch (error) {
      console.error('Error taking picture:', error);
    }
  };

  // Retake Picture - Now refreshes the page
  const retakePicture = () => {
    // Option 1: Refresh the page to ensure camera is fully reset
    window.location.reload();
    
    // Option 2: If you don't want a full page refresh, uncomment this code instead
    /*
    setPhotoTaken(false);
    setImageSrc('');
    setFaceDetected(false);
    
    // Need to restart camera
    setTimeout(() => {
      startCamera();
    }, 300);
    */
  };

  // Get Location
  const getLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLatitude(position.coords.latitude);
          setLongitude(position.coords.longitude);
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
      if (!imageSrc) {
        Swal.fire({
          icon: 'warning',
          title: 'Peringatan',
          text: 'Silakan ambil foto terlebih dahulu',
        });
        return;
      }

      if (!latitude || !longitude) {
        Swal.fire({
          icon: 'warning',
          title: 'Peringatan',
          text: 'Silakan tunggu proses lokasi',
        });
        return;
      }

      setIsLoading(true);
      setIsSubmitting(true);

      const response = await axios.post(`${getApiBaseUrl()}/absensi/karyawan/keluar`, {
        latitude,
        longitude,
        image: imageSrc,
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
      setIsLoading(false);
      setIsSubmitting(false);
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
                {/* Branch Name - Added here */}
                <Typography variant="subtitle2" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                  <IoBusinessOutline size={16} />
                  <span>{namaCabang || 'Loading...'}</span>
                </Typography>
                
                <Typography variant="subtitle2" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <IoLocationOutline size={16} />
                  <span>{moment().format('DD MMM YYYY HH:mm:ss')}</span>
                </Typography>
              </Box>
              {profileImage ? (
                <Avatar src={profileImage} alt="Profile" sx={{ width: 32, height: 32, border: '1px solid white' }} />
              ) : (
                <Avatar sx={{ width: 32, height: 32, bgcolor: 'grey.700', border: '1px solid white' }} />
              )}
            </Box>
  

          {!photoTaken ? (
            <>
              {/* Live Camera Feed */}
              {modelsLoaded && (
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
                  {faceDetected ? (
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
                    {faceDetected ? 'Wajah Terdeteksi' : 'Posisikan Wajah'}
                  </Typography>
                </Box>
              </Box>
            </>
          ) : (
            // Captured Photo
            <img 
              src={imageSrc} 
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
                {formatCoordinate(latitude)}
              </Typography>
              <Typography variant="body2" sx={{ mt: 0.5, fontWeight: 'medium' }}>
                {formatCoordinate(longitude)}
              </Typography>
            </Box>
            
            {/* Center - Action Button */}
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              {!photoTaken ? (
                // Capture Button
                <Button
                  disabled={!faceDetected}
                  onClick={takePicture}
                  sx={{ 
                    minWidth: 64, 
                    height: 64, 
                    borderRadius: '50%', 
                    bgcolor: 'white',
                    '&:hover': { bgcolor: '#f5f5f5' },
                    '&:disabled': { bgcolor: 'grey.700' },
                    border: faceDetected ? '3px solid #4CAF50' : '3px solid #9e9e9e'
                  }}
                >
                  <IoCamera size={32} color={faceDetected ? "#4CAF50" : "#9e9e9e"} />
                </Button>
              ) : (
                // Submit/Retake Buttons
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Button
                    variant="contained"
                    color="error"
                    size="small"
                    onClick={createAbsensiKeluar}
                    disabled={isLoading || !latitude || !longitude}
                    sx={{ 
                      borderRadius: 4,
                      minWidth: 120,
                      position: 'relative'
                    }}
                  >
                    {isSubmitting ? (
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
                    disabled={isLoading}
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
                latitude={latitude} 
                longitude={longitude} 
                radius={radius} 
              />
            </Box>
          </Box>
          
          {/* Loading Bar at Top */}
          {isLoading && (
            <LinearProgress sx={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3 }} />
          )}
          
          {/* Full Screen Loading Overlay */}
          {isSubmitting && (
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
              disabled={isLoading}
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