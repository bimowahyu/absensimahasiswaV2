import React, { useState, useEffect } from 'react';
import { 
    Dialog, 
    DialogTitle, 
    DialogContent, 
    DialogActions, 
    Button, 
    FormControl, 
    FormLabel, 
    RadioGroup, 
    FormControlLabel, 
    Radio, 
    TextField,
    Box, 
    Typography,
    MenuItem,
    Select,
    InputLabel,
    CircularProgress,
    Alert
} from '@mui/material';
import { 
    SickOutlined, 
    AssignmentLateOutlined,
    CloseOutlined
} from "@mui/icons-material";

function AbsenceRequestForm({ open, handleClose, matkulHariIni, onSubmitSuccess }) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const [formData, setFormData] = useState({
        status: 'izin',
        // alasan: '',
        matkul_id: '',
        latitude: null,
        longitude: null
    });

    // Get geolocation on component mount
    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setFormData(prev => ({
                        ...prev,
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude
                    }));
                },
                (err) => {
                    console.error("Error getting geolocation:", err);
                    setError("Tidak dapat mengakses lokasi Anda. Mohon aktifkan izin lokasi.");
                }
            );
        } else {
            setError("Browser Anda tidak mendukung geolokasi.");
        }
    }, []);

    // Reset form when dialog opens
    useEffect(() => {
        if (open) {
            setFormData({
                status: 'izin',
                alasan: '',
                matkul_id: matkulHariIni.length > 0 ? matkulHariIni[0].id : '',
                latitude: formData.latitude,
                longitude: formData.longitude
            });
            setError(null);
            setSuccess(false);
        }
    }, [open, matkulHariIni]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    const getApiBaseUrl = () => {
        const protocol = window.location.protocol === 'https:' ? 'https' : 'http';
        const baseUrl = process.env.REACT_APP_API_BASE_URL.replace(/^https?:\/\//, '');
        return `${protocol}://${baseUrl}`;
    };

    const handleSubmit = async () => {
        if (!formData.matkul_id) {
            setError("Silakan pilih mata kuliah");
            return;
        }

        // if (!formData.alasan) {
        //     setError("Silakan masukkan alasan ketidakhadiran");
        //     return;
        // }

        if (!formData.latitude || !formData.longitude) {
            setError("Lokasi tidak tersedia. Mohon aktifkan layanan lokasi");
            return;
        }

        try {
            setLoading(true);
            setError(null);

            // Generate dummy image data (1x1 transparent pixel)
            const dummyImage = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";

            const response = await fetch(`${getApiBaseUrl()}/absensi/mahasiswa/create`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({
                    latitude: formData.latitude,
                    longitude: formData.longitude,
                    image: dummyImage, // Required but not used for izin/sakit
                    matkul_id: formData.matkul_id,
                    status: formData.status
                })
            });

            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.msg || "Gagal mengirim permintaan");
            }

            setSuccess(true);
            setTimeout(() => {
                if (onSubmitSuccess) onSubmitSuccess();
                handleClose();
            }, 1500);
        } catch (error) {
            console.error("Error submitting absence request:", error);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog 
            open={open} 
            onClose={handleClose} 
            fullWidth 
            maxWidth="sm"
            PaperProps={{
                sx: {
                    borderRadius: '16px',
                    padding: 1
                }
            }}
        >
            <DialogTitle sx={{ 
                display: 'flex', 
                justifyContent: 'space-between',
                alignItems: 'center',
                pb: 1
            }}>
                <Typography variant="h6" fontWeight="bold">Form Ketidakhadiran</Typography>
                <Button 
                    onClick={handleClose}
                    sx={{ minWidth: 'auto', p: 1 }}
                >
                    <CloseOutlined />
                </Button>
            </DialogTitle>
            
            <DialogContent>
                {success ? (
                    <Alert severity="success" sx={{ my: 2 }}>
                        Permintaan ketidakhadiran berhasil dikirim!
                    </Alert>
                ) : (
                    <>
                        {error && (
                            <Alert severity="error" sx={{ mb: 2 }}>
                                {error}
                            </Alert>
                        )}
                        
                        <Box sx={{ my: 2 }}>
                            <FormControl fullWidth sx={{ mb: 3 }}>
                                <InputLabel id="matkul-select-label">Mata Kuliah</InputLabel>
                                <Select
                                    labelId="matkul-select-label"
                                    id="matkul-select"
                                    name="matkul_id"
                                    value={formData.matkul_id}
                                    onChange={handleChange}
                                    label="Mata Kuliah"
                                >
                                  {Array.isArray(matkulHariIni) && matkulHariIni.map((matkul) => (
    <MenuItem key={matkul.id} value={matkul.id}>
        {matkul.nama_matkul}
    </MenuItem>
))}

                                </Select>
                            </FormControl>

                            <FormControl component="fieldset" sx={{ mb: 3 }}>
                                <FormLabel component="legend">Jenis Ketidakhadiran</FormLabel>
                                <RadioGroup
                                    row
                                    name="status"
                                    value={formData.status}
                                    onChange={handleChange}
                                >
                                    <FormControlLabel 
                                        value="izin" 
                                        control={<Radio />} 
                                        label={
                                            <Box display="flex" alignItems="center">
                                                <AssignmentLateOutlined color="primary" sx={{ mr: 0.5 }} />
                                                <Typography>Izin</Typography>
                                            </Box>
                                        } 
                                    />
                                    <FormControlLabel 
                                        value="sakit" 
                                        control={<Radio />} 
                                        label={
                                            <Box display="flex" alignItems="center">
                                                <SickOutlined color="error" sx={{ mr: 0.5 }} />
                                                <Typography>Sakit</Typography>
                                            </Box>
                                        } 
                                    />
                                </RadioGroup>
                            </FormControl>

                            {/* <TextField
                                fullWidth
                                label="Alasan Ketidakhadiran"
                                name="alasan"
                                value={formData.alasan}
                                onChange={handleChange}
                                multiline
                                rows={4}
                                variant="outlined"
                                sx={{ mb: 2 }}
                                placeholder={formData.status === 'sakit' ? 
                                    "Jelaskan alasan sakit Anda..." : 
                                    "Jelaskan alasan ketidakhadiran Anda..."
                                }
                            /> */}
                            
                            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                {formData.status === 'sakit' ? 
                                    "* Silakan siapkan surat keterangan dokter jika diminta oleh dosen" :
                                    "* Permohonan izin akan diproses dan menunggu persetujuan dosen"
                                }
                            </Typography>
                        </Box>
                    </>
                )}
            </DialogContent>
            
            {!success && (
                <DialogActions sx={{ px: 3, pb: 3 }}>
                    <Button 
                        onClick={handleClose} 
                        variant="outlined"
                        sx={{ borderRadius: '8px' }}
                    >
                        Batal
                    </Button>
                    <Button 
                        onClick={handleSubmit} 
                        variant="contained" 
                        color={formData.status === 'sakit' ? "error" : "primary"}
                        disabled={loading}
                        sx={{ 
                            borderRadius: '8px',
                            position: 'relative'
                        }}
                    >
                        {loading && (
                            <CircularProgress 
                                size={24} 
                                sx={{ 
                                    position: 'absolute',
                                    color: 'white'
                                }} 
                            />
                        )}
                        Kirim
                    </Button>
                </DialogActions>
            )}
        </Dialog>
    );
}

export default AbsenceRequestForm;