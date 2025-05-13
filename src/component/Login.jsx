import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, NavLink } from 'react-router-dom';
import { LoginUser, reset as resetUser } from "../fitur/AuthMahasiswa";
import { LoginAdmin, reset as resetAdmin } from "../fitur/AuthSlice";
import useSWR from 'swr';
import axios from 'axios';
import { 
  Box, 
  TextField, 
  Button, 
  Checkbox, 
  FormControlLabel, 
  Typography, 
  CircularProgress, 
  Paper,
  Tabs,
  Tab,
  Alert
} from '@mui/material';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import AdminPanelSettingsOutlinedIcon from '@mui/icons-material/AdminPanelSettingsOutlined';

const getApiBaseUrl = () => {
  const protocol = window.location.protocol === 'https:' ? 'https' : 'http';
  const baseUrl = process.env.REACT_APP_API_BASE_URL.replace(/^https?:\/\//, '');
  return `${protocol}://${baseUrl}`;
};

const fetcher = url => axios.get(url).then(res => res.data);

export const Login = () => {
  // Tab state
  const [activeTab, setActiveTab] = useState(0);
  
  // User login state
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  
  // Admin login state
  const [email, setEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [adminRememberMe, setAdminRememberMe] = useState(false);
  
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  // User authentication state
  const { 
    user, 
    isError: isUserError, 
    isSuccess: isUserSuccess, 
    isLoading: isUserLoading, 
    message: userMessage 
  } = useSelector((state) => state.authMahasiswa);
  
  // Admin authentication state
  const { 
    user: admin, 
    isError: isAdminError, 
    isSuccess: isAdminSuccess, 
    isLoading: isAdminLoading, 
    message: adminMessage 
  } = useSelector((state) => state.authAdmin);

  // Server status check
  const { data, error } = useSWR(`${getApiBaseUrl()}/`, fetcher);

  // Load saved credentials
  useEffect(() => {
    const savedUsername = localStorage.getItem('username');
    const savedPassword = localStorage.getItem('password');
    if (savedUsername && savedPassword) {
      setUsername(savedUsername);
      setPassword(savedPassword);
      setRememberMe(true);
    }

    const savedEmail = localStorage.getItem('email');
    const savedAdminPassword = localStorage.getItem('adminPassword');
    if (savedEmail && savedAdminPassword) {
      setEmail(savedEmail);
      setAdminPassword(savedAdminPassword);
      setAdminRememberMe(true);
    }
  }, []);

  // Handle user login redirect
  useEffect(() => {
    if (user || isUserSuccess) {
      navigate("/dashboard");
    }
    dispatch(resetUser());
  }, [user, isUserSuccess, dispatch, navigate]);

  // Handle admin login redirect
  useEffect(() => {
    if (admin || isAdminSuccess) {
      navigate("/DashboardAdmin");
    }
    dispatch(resetAdmin());
  }, [admin, isAdminSuccess, dispatch, navigate]);

  useEffect(() => {
    if (admin) {
      if (admin.role === 'dosen') {
        navigate("/dashboarddosen");
      } else if (admin.role === 'admin') {
        navigate("/DashboardAdmin");
      } else {
        navigate("/dashboard");
      }
    }
    dispatch(resetAdmin());
  }, [admin, dispatch, navigate]);
  
  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  // Handle user login
  const handleUserLogin = (e) => {
    e.preventDefault();
    if (rememberMe) {
      localStorage.setItem('username', username);
      localStorage.setItem('password', password);
    } else {
      localStorage.removeItem('username');
      localStorage.removeItem('password');
    }
    dispatch(LoginUser({ username, password }));
  };

  // Handle admin login
  const handleAdminLogin = (e) => {
    e.preventDefault();
    if (adminRememberMe) {
      localStorage.setItem('email', email);
      localStorage.setItem('adminPassword', adminPassword);
    } else {
      localStorage.removeItem('email');
      localStorage.removeItem('adminPassword');
    }
    dispatch(LoginAdmin({ email, password: adminPassword }));
  };

  // Server status component
  const ServerStatus = () => {
    if (error) return <Alert severity="error">Server Offline</Alert>;
    if (data) return <Alert severity="success">Server Online: {data}</Alert>;
    return <Alert severity="info">Checking server status...</Alert>;
  };

  return (
    <Box sx={{ 
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      bgcolor: '#f5f5f5'
    }}>
      <Paper elevation={6} sx={{ 
        maxWidth: 450, 
        width: '100%', 
        borderRadius: 3,
        overflow: 'hidden'
      }}>
        {/* Tabs */}
        <Tabs 
          value={activeTab} 
          onChange={handleTabChange} 
          variant="fullWidth" 
          indicatorColor="primary"
          textColor="primary"
          sx={{ mb: 2, borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab 
            icon={<PersonOutlineIcon />} 
            label="USER" 
            sx={{ py: 2 }} 
          />
          <Tab 
            icon={<AdminPanelSettingsOutlinedIcon />} 
            label="ADMIN" 
            sx={{ py: 2 }} 
          />
        </Tabs>

        {/* Content area */}
        <Box sx={{ p: 4 }}>
          {/* User Login Form */}
          {activeTab === 0 && (
            <>
              <Typography variant="h4" fontWeight="bold" gutterBottom>
                Welcome User 👋
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                Please sign in to access your account
              </Typography>
              
              <ServerStatus />
              
              {isUserError && (
                <Alert severity="error" sx={{ mt: 2 }}>{userMessage}</Alert>
              )}
              
              <form onSubmit={handleUserLogin}>
                <TextField
                  fullWidth
                  label="Username"
                  variant="outlined"
                  margin="normal"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your Username"
                />
                <TextField
                  fullWidth
                  label="Password"
                  type="password"
                  variant="outlined"
                  margin="normal"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      color="primary"
                    />
                  }
                  label="Remember me"
                />
                <Button
                  fullWidth
                  variant="contained"
                  color="primary"
                  type="submit"
                  disabled={isUserLoading}
                  sx={{ mt: 3, py: 1.5, borderRadius: 2 }}
                >
                  {isUserLoading ? <CircularProgress size={24} /> : "Login"}
                </Button>
              </form>
            </>
          )}

          {/* Admin Login Form */}
          {activeTab === 1 && (
            <>
              <Typography variant="h4" fontWeight="bold" gutterBottom>
                Welcome Admin 👋
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                Please sign in to access administrative features
              </Typography>
              
              <ServerStatus />
              
              {isAdminError && (
                <Alert severity="error" sx={{ mt: 2 }}>{adminMessage}</Alert>
              )}
              
              <form onSubmit={handleAdminLogin}>
                <TextField
                  fullWidth
                  label="Email or Username"
                  variant="outlined"
                  margin="normal"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email or username"
                />
                <TextField
                  fullWidth
                  label="Password"
                  type="password"
                  variant="outlined"
                  margin="normal"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  placeholder="Password"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={adminRememberMe}
                      onChange={(e) => setAdminRememberMe(e.target.checked)}
                      color="primary"
                    />
                  }
                  label="Remember me"
                />
                <Button
                  fullWidth
                  variant="contained"
                  color="primary"
                  type="submit"
                  disabled={isAdminLoading}
                  sx={{ mt: 3, py: 1.5, borderRadius: 2 }}
                >
                  {isAdminLoading ? <CircularProgress size={24} /> : "Login"}
                </Button>
              </form>
            </>
          )}
        </Box>
      </Paper>
    </Box>
  );
};

export default Login;