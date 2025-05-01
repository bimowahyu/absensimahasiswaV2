import { configureStore } from '@reduxjs/toolkit';
import authAdminReducer from "../fitur/AuthSlice";
import authMahasiswaReducer from "../fitur/AuthMahasiswa";
import authDosenReducer from '../fitur/AuthSliceDosen';

export const store = configureStore({
  reducer: {
    authAdmin: authAdminReducer, // untuk admin
    authMahasiswa: authMahasiswaReducer,
    authDosen : authDosenReducer
  },
});
