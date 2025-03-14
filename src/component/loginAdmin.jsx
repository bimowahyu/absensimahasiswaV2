import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { LoginAdmin, reset } from "../fitur/AuthSlice";
import { Box, TextField, Button, Checkbox, FormControlLabel, Typography, CircularProgress, Paper } from "@mui/material";
import useSWR from 'swr';
import axios from 'axios';
import background from "../img/backgound.png"
import "./Login.css";

const getApiBaseUrl = () => {
  const protocol = window.location.protocol === 'https:' ? 'https' : 'http';
  const baseUrl = process.env.REACT_APP_API_BASE_URL.replace(/^https?:\/\//, '');
  return `${protocol}://${baseUrl}`;
};

const fetcher = url => axios.get(url).then(res => res.data);

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, isError, isSuccess, isLoading, message } = useSelector(
    (state) => state.authAdmin
  );

  const { data, error } = useSWR(`${getApiBaseUrl()}/`, fetcher);

  useEffect(() => {
    const savedEmail = localStorage.getItem('email');
    const savedPassword = localStorage.getItem('password');
    if (savedEmail && savedPassword) {
      setEmail(savedEmail);
      setPassword(savedPassword);
      setRememberMe(true);
    }
  }, []);

  useEffect(() => {
    if (user || isSuccess) {
      navigate("/DashboardAdmin");
    }
    dispatch(reset());
  }, [user, isSuccess, dispatch, navigate]);

  const Auth = (e) => {
    e.preventDefault();
    if (rememberMe) {
      localStorage.setItem('email', email);
      localStorage.setItem('password', password);
    } else {
      localStorage.removeItem('email');
      localStorage.removeItem('password');
    }
    dispatch(LoginAdmin({ email, password }));
  };

  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: { xs: 'column', md: 'row' }, 
      minHeight: '100vh', 
      backgroundImage: `url(${background})`, 
      backgroundSize: 'cover', 
      backgroundPosition: 'center' 
    }}>
      <Box sx={{ 
        flex: 1, 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        p: 4 
      }}>
        <Paper elevation={3} sx={{ 
          p: 4, 
          borderRadius: 2, 
          maxWidth: 400, 
          width: '100%', 
          backgroundColor: 'rgba(255, 255, 255, 0.8)' 
        }}>
          <Typography variant="h4" gutterBottom>
            Welcome Admin 👋
          </Typography>
          <Typography variant="body1" gutterBottom>
            Please sign-in to your account and start the adventure
          </Typography>
          {isError && <Typography color="error">{message}</Typography>}
          {error ? (
            <Typography color="error">Server Offline</Typography>
          ) : data ? (
            <Typography color="success">Server Online: {data}</Typography>
          ) : (
            <Typography>Checking server status...</Typography>
          )}
          <form onSubmit={Auth}>
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
              disabled={isLoading}
              sx={{ mt: 2 }}
            >
              {isLoading ? <CircularProgress size={24} /> : "Login"}
            </Button>
          </form>
        </Paper>
      </Box>
    </Box>
  );
};

export default Login;