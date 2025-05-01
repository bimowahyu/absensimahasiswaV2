// authDosenSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const getApiBaseUrl = () => {
  const protocol = window.location.protocol === 'https:' ? 'https' : 'http';
  const baseUrl = process.env.REACT_APP_API_BASE_URL.replace(/^https?:\/\//, '');
  return `${protocol}://${baseUrl}`;
};

const initialState = {
  user: null,
  isError: false,
  isSuccess: false,
  isLoading: false,
  isAuthenticated: false,
  message: ""
}

const api = axios.create({
  baseURL: getApiBaseUrl(),
  withCredentials: true
});

export const LoginDosen = createAsyncThunk("dosen/loginDosen", async (user, thunkAPI) => {
  try {
    const response = await api.post('/loginDosen', {
      email: user.email,
      password: user.password
    });
    return response.data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.msg || 'An error occurred');
  }
});

export const getMeDosen = createAsyncThunk("dosen/getMeDosen", async (_, thunkAPI) => {
  try {
    const response = await api.get('/Me');
    return response.data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.msg || "An error occurred");
  }
});

export const LogOutDosen = createAsyncThunk("dosen/logOutDosen", async () => {
  await api.delete('/logoutDosen');
});

export const authDosenSlice = createSlice({
  name: "authDosen",
  initialState,
  reducers: {
    reset: (state) => initialState
  },
  extraReducers: (builder) => {
    builder.addCase(LoginDosen.pending, (state) => {
      state.isLoading = true;
      state.isAuthenticated = false;
    });
    builder.addCase(LoginDosen.fulfilled, (state, action) => {
      state.isLoading = false;
      state.isSuccess = true;
      state.isAuthenticated = true;
      state.user = action.payload;
    });
    builder.addCase(LoginDosen.rejected, (state, action) => {
      state.isLoading = false;
      state.isError = true;
      state.isAuthenticated = false;
      state.message = action.payload;
    });

    builder.addCase(getMeDosen.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(getMeDosen.fulfilled, (state, action) => {
      state.isLoading = false;
      state.isSuccess = true;
      state.isAuthenticated = true;
      state.user = action.payload;
    });
    builder.addCase(getMeDosen.rejected, (state, action) => {
      state.isLoading = false;
      state.isError = true;
      state.isAuthenticated = false;
      state.message = action.payload;
    });

    builder.addCase(LogOutDosen.fulfilled, (state) => {
      state.user = null;
      state.isAuthenticated = false;
    });
  }
});

export const { reset } = authDosenSlice.actions;
export default authDosenSlice.reducer;