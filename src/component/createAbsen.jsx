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
  IoBusinessOutline
} from "react-icons/io5";
import { 
  Container, 
  Card, 
  Box, 
  Typography, 
  Button, 
  LinearProgress,
  Avatar,
  CircularProgress
} from '@mui/material';
import { useLocation, useSearchParams } from 'react-router-dom';


const getApiBaseUrl = () => {
  const protocol = window.location.protocol === 'https:' ? 'https' : 'http';
  const baseUrl = process.env.REACT_APP_API_BASE_URL.replace(/^https?:\/\//, '');
  return `${protocol}://${baseUrl}`;
};

const CreateAbsen = () => {
   const [searchParams] = useSearchParams();
    const matkulId = searchParams.get('matkulId');
    const matkulName = searchParams.get('matkulName');
    
    // Cara 2: Menggunakan location state (backup)
    const location = useLocation();
    const { state } = location;
    const fallbackMatkulId = state?.matkulId;
    const fallbackMatkulName = state?.matkulName;
    const navigate = useNavigate();
    // Gunakan query params dulu, fallback ke state
    const finalMatkulId = matkulId || fallbackMatkulId;
    const finalMatkulName = matkulName || fallbackMatkulName;
    
    console.log('matkulId dari query params:', matkulId);
    console.log('matkulId dari state:', fallbackMatkulId);
    console.log('Final matkulId:', finalMatkulId);
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
  const [modelLoadingProgress, setModelLoadingProgress] = useState(0);
  const [loadingModels, setLoadingModels] = useState(true);
  
  // Refs
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const faceCheckTimerRef = useRef(null);
  
  const [profileImage, setProfileImage] = useState(null);
  const [namaCabang, setNamaCabang] = useState(null)
  const [photoTaken, setPhotoTaken] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);

  useEffect(() => {
    const loadModels = async () => {
      try {
        setLoadingModels(true);
        await faceapi.nets.ssdMobilenetv1.loadFromUri('/models');
        setModelLoadingProgress(50);
        await faceapi.nets.faceRecognitionNet.loadFromUri('/models');
        setModelLoadingProgress(100);
        
        setModelsLoaded(true);
        setLoadingModels(false);
      } catch (error) {
        console.error('Error loading face-api models:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Gagal memuat model face recognition. Cek koneksi internet atau refresh halaman.'
        });
        setLoadingModels(false);
      }
    };

    loadModels();
    
    // Cleanup function
    return () => {
      if (faceCheckTimerRef.current) {
        clearInterval(faceCheckTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const response = await axios.get(`${getApiBaseUrl()}/Memahasiswa`, { withCredentials: true });
        setProfileImage(response.data.url);
        if (response.data.Cabang && response.data.Cabang.nama) {
          setNamaCabang(response.data.Cabang.nama);
        } else {
          const branchResponse = await axios.get(`${getApiBaseUrl()}/cabang`, { withCredentials: true });
          setNamaCabang(branchResponse.data.name || '');
        }
      } catch (error) {
        console.error('Error fetching profile data:', error);
        setNamaCabang('');
      }
    };
  
    fetchProfileData();
  }, []);
  
  const startCamera = async () => {
    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      
      // Use lower resolution for better performance
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: { ideal: 320 }, 
          height: { ideal: 240 }, 
          facingMode: 'user',
          frameRate: { ideal: 15, max: 20 } // Lower frameRate for better performance
        } 
      });
  
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setCameraActive(true);
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

  // Optimized Face Detection: Less frequent checks (3 seconds instead of 2)
  // Also using smaller detection network and parameters
  useEffect(() => {
    if (faceCheckTimerRef.current) {
      clearInterval(faceCheckTimerRef.current);
      faceCheckTimerRef.current = null;
    }

    const detectFace = async () => {
      if (videoRef.current && modelsLoaded && !photoTaken && cameraActive) {
        try {
          // Performance optimization - use tiny face detector with smaller min face size
          const detectionOptions = new faceapi.SsdMobilenetv1Options({ 
            minConfidence: 0.5,  // Lower threshold for faster detection
            maxResults: 1        // We only need to find one face
          });
          
          const detections = await faceapi.detectSingleFace(
            videoRef.current, 
            detectionOptions
          );

          setFaceDetected(!!detections);
        } catch (error) {
          console.error('Face detection error:', error);
        }
      }
    };

    if (modelsLoaded && !photoTaken && cameraActive) {
      // Initial detection
      detectFace();
      
      // Check face every 3 seconds instead of 2 for better performance
      faceCheckTimerRef.current = setInterval(detectFace, 3000);
    }

    return () => {
      if (faceCheckTimerRef.current) {
        clearInterval(faceCheckTimerRef.current);
        faceCheckTimerRef.current = null;
      }
    };
  }, [modelsLoaded, photoTaken, cameraActive]);

  // Take Picture with optimized compression
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
      
      // Use smaller image size for better performance
      const targetWidth = 320; // Smaller target width for better performance
      const targetHeight = (video.videoHeight / video.videoWidth) * targetWidth;

      photo.width = targetWidth;
      photo.height = targetHeight;
      
      const context = photo.getContext('2d');
      context.drawImage(video, 0, 0, targetWidth, targetHeight);
      
      // Higher compression for better performance (0.6 instead of 0.7)
      const compressedImageUrl = photo.toDataURL('image/jpeg', 0.6);
      
      // Verify face is still there
      setImageSrc(compressedImageUrl);
      setPhotoTaken(true);
      
      // Stop camera stream to free up resources
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        setCameraActive(false);
      }
      
      // Get location when picture is taken
      getLocation();
    } catch (error) {
      console.error('Error taking picture:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Gagal mengambil foto. Silakan coba lagi.',
      });
    }
  };

  // Retake Picture
  const retakePicture = () => {
    setPhotoTaken(false);
    setImageSrc('');
    setFaceDetected(false);
    // Restart camera
    startCamera();
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
useEffect(() => {
        if (!finalMatkulId) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Data mata kuliah tidak ditemukan',
                showConfirmButton: true,
                confirmButtonText: 'Kembali'
            }).then(() => {
                navigate('/Dashboard');
            });
        }
    }, [finalMatkulId, navigate]);
  // Create Absensi
   const createAbsensi = async () => {
        try {
            console.log('Sending matkulId:', finalMatkulId);
            if (!finalMatkulId) {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Data mata kuliah tidak valid',
                });
                return;
            }
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

      const response = await axios.post(`${getApiBaseUrl()}/absensi/mahasiswa/create`, {
        latitude,
        longitude,
        image: imageSrc,
        matkulId: finalMatkulId
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
      console.error('Error creating absensi:', error);
      
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
          {/* Loading Models Overlay */}
          {loadingModels && (
            <Box sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              bgcolor: 'rgba(0,0,0,0.85)',
              zIndex: 100,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center'
            }}>
              <CircularProgress variant="determinate" value={modelLoadingProgress} size={70} sx={{ mb: 2 }} />
              <Typography variant="h6" color="white">Loading Face Recognition</Typography>
              <Typography variant="body2" color="grey.400" sx={{ mt: 1, textAlign: 'center', maxWidth: '80%' }}>
                Mohon tunggu, sistem sedang memuat model pengenalan wajah ({modelLoadingProgress}%)
              </Typography>
            </Box>
          )}
          
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
                {/* <span>{namaCabang || 'Loading...'}</span> */}
                 <Typography variant="subtitle1">
              Presensi Masuk: {finalMatkulName}
            </Typography>
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
                  top: 60, 
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
                  top: 110,
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
            height: '100px',
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
                  disabled={!faceDetected || loadingModels}
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
                    color="primary"
                    size="small"
                    onClick={createAbsensi}
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
                        <IoTimeOutline style={{ marginRight: '8px' }} />
                        Absen
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
                sx={{ color: '#4CAF50', mb: 2 }} 
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
            bottom: 110,
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

export default CreateAbsen;