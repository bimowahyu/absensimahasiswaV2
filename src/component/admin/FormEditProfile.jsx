import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Container, TextField, Button, Card, CardContent, Typography, Alert } from '@mui/material';

const getApiBaseUrl = () => {
    const protocol = window.location.protocol === 'https:' ? 'https' : 'http';
    const baseUrl = process.env.REACT_APP_API_BASE_URL.replace(/^https?:\/\//, '');
    return `${protocol}://${baseUrl}`;
};

export const FormEditProfile = () => {
    const [profile, setProfile] = useState({});
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confPassword, setConfPassword] = useState('');
    const [message, setMessage] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await axios.get(`${getApiBaseUrl()}/Me`, { withCredentials: true });
                const profileData = response.data;
                setProfile(profileData);
                setName(profileData.name);
                setEmail(profileData.email);
            } catch (error) {
                setMessage(error.message);
            }
        };
        fetchProfile();
    }, []);

    const updateProfile = async (e) => {
        e.preventDefault();
        try {
            await axios.put(`${getApiBaseUrl()}/users/${profile.id}`, {
                name,
                email,
                password,
                confPassword
            }, { withCredentials: true });
            navigate('/admin');
        } catch (error) {
            setMessage(error.response?.data?.msg || 'Terjadi kesalahan saat mengupdate profil.');
        }
    };

    return (
        <Container maxWidth="sm">
            <Card sx={{ mt: 5, p: 3, boxShadow: 3 }}>
                <CardContent>
                    <Typography variant="h5" gutterBottom>Edit Profile</Typography>
                    {message && <Alert severity="error" sx={{ mb: 2 }}>{message}</Alert>}
                    <form onSubmit={updateProfile}>
                        <TextField
                            fullWidth
                            label="Nama"
                            variant="outlined"
                            margin="normal"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                        <TextField
                            fullWidth
                            label="Email"
                            variant="outlined"
                            margin="normal"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                        <TextField
                            fullWidth
                            label="Password"
                            variant="outlined"
                            margin="normal"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                        <TextField
                            fullWidth
                            label="Confirm Password"
                            variant="outlined"
                            margin="normal"
                            type="password"
                            value={confPassword}
                            onChange={(e) => setConfPassword(e.target.value)}
                        />
                        <Button
                            fullWidth
                            variant="contained"
                            color="primary"
                            type="submit"
                            sx={{ mt: 2 }}
                        >
                            Update Profile
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </Container>
    );
};
