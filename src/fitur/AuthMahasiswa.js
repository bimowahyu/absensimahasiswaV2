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

// Fungsi Login
export const LoginUser = createAsyncThunk("user/loginUser", async (user, thunkAPI) => {
    try {
        // const response = await axios.post(`${process.env.REACT_APP_API_BASE_URL}/loginKaryawan`, {
        //     username: user.username,
        //     password: user.password
        // }, { withCredentials: true });
        const response = await axios.post(
            `${getApiBaseUrl()}/loginmahasiswa`,
            new URLSearchParams({
              username: user.username,
              password: user.password,
            }),
            {
              withCredentials: true,
              headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
              },
            }
          );
          
        return response.data;
    } catch (error) {
        if (error.response) {
            const message = error.response.data.msg;
            return thunkAPI.rejectWithValue(message);
        }
    }
});

// Fungsi GetMe untuk validasi sesi pengguna
export const getMe = createAsyncThunk("user/getMe", async (_, thunkAPI) => {
    try {
        const response = await axios.get(`${getApiBaseUrl()}/Memahasiswa`, { withCredentials: true });
        return response.data;
    } catch (error) {
        if (error.response) {
            const message = error.response.data.msg;
            return thunkAPI.rejectWithValue(message);
        }
    }
});

// Fungsi Logout
export const LogOut = createAsyncThunk("user/logOut", async () => {
    await axios.delete(`${getApiBaseUrl()}/logoutmahasiswa`);
});

// Slice Redux
export const authMahasiswaSlice = createSlice({
    name: "authMahasiswa",
    initialState,
    reducers: {
        reset: (state) => initialState
    },
    extraReducers: (builder) => {
        // Login
        builder.addCase(LoginUser.pending, (state) => {
            state.isLoading = true;
        });
        builder.addCase(LoginUser.fulfilled, (state, action) => {
            state.isLoading = false;
            state.isSuccess = true;
            state.user = action.payload;
            state.isAuthenticated = true; 
        });
        builder.addCase(LoginUser.rejected, (state, action) => {
            state.isLoading = false;
            state.isError = true;
            state.message = action.payload;
        });

        // GetMe (validasi sesi pengguna)
        builder.addCase(getMe.pending, (state) => {
            state.isLoading = true;
        });
        builder.addCase(getMe.fulfilled, (state, action) => {
            state.isLoading = false;
            state.isSuccess = true;
            state.user = action.payload;
            state.isAuthenticated = true;
        });
        builder.addCase(getMe.rejected, (state, action) => {
            state.isLoading = false;
            state.isError = true;
            state.message = action.payload;
            state.isAuthenticated = false; 
        });

        // Logout
        builder.addCase(LogOut.fulfilled, (state) => {
            state.user = null;
            state.isAuthenticated = false; 
        });
    }
});

export const { reset } = authMahasiswaSlice.actions;
export default authMahasiswaSlice.reducer;
