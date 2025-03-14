import { configureStore } from '@reduxjs/toolkit';
import authAdminReducer from "../fitur/AuthSlice";
import authKaryawanReducer from "../fitur/AuthKaryawan"; // Perbaiki nama impor

export const store = configureStore({
  reducer: {
    authAdmin: authAdminReducer, // untuk admin
    authKaryawan: authKaryawanReducer // untuk karyawan, beri nama yang konsisten
  },
});
