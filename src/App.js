import { BrowserRouter, Route, Routes } from "react-router-dom";
import Login from "./component/loginAdmin";
import LoginKaryawan from "./component/loginKaryawan";
import { DashboardKaryawanPages } from "./pages/DashboardPages";
import { CreateAbsenPages } from "./pages/CreateAbsenPages";
import { ClockOutPages } from "./pages/ClockoutPages";
import { GetAbsen } from "./pages/GetAbsen";
import { Profile } from "./pages/Profile";
import { CabangPages } from "./pages/adminpages/CabangPages";
import Dashboard from "./pages/adminpages/DashboardAdminPages";
import { TambahCabangPages } from "./pages/adminpages/CrateCabangPages";
import { EditCabangPages } from "./pages/adminpages/EditCabangPages";
import { DataKaryawanPages } from "./pages/adminpages/DataKaryawanPages";
import { CreateKaryawanPages } from "./pages/adminpages/CreateKaryawanPages";
import { ProfileAdminPages } from "./pages/adminpages/ProfileAdminPages";
import { EditProfilePages } from "./pages/adminpages/EditProfilePages";
import { EditprofileKaryawanPages } from "./pages/EditprofileKaryawanPages";
import  DataPages  from "./pages/adminpages/DataPages";
import { KehadiranBulanPages } from "./pages/KehadiranBulanPages";
import DataBulanPages from "./pages/adminpages/DataBulanPages";
import { EditKaryawanPages } from "./pages/adminpages/EditKaryawanPages";
import { DataGajiPages } from "./pages/adminpages/DataGajiPages";
// import Lokasi from "./component/lokasi";
import { AbsenControllPages } from "./pages/adminpages/AbsenControllPages";
import { EditAbsenPages } from "./pages/adminpages/EditAbsenPages";
import { CreateGajiPages } from "./pages/adminpages/CreateGajiPages";
import { ConfrimGajiPages } from "./pages/ConfrimGajiPages";
import { DataGajiCabangPages } from "./pages/adminpages/DataGajiCabangPages";
import { FormEditGajiPages } from "./pages/adminpages/FormEditGajiPages";
import { AddAdminPages } from "./pages/adminpages/AddAdminPages";
import { DataAdminPages } from "./pages/adminpages/DataAdminPages";
import { AbsenManualPages } from "./pages/adminpages/AbsenManualPages";
import { FormEditAdminPages } from "./pages/adminpages/FormEditAdminPages";
// import { useNavigate } from "react-router-dom";
// import { useSelector } from "react-redux";


// function PrivateRoute({ element, ...rest }) {
//   const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
//   return isAuthenticated ? element : <Navigate to="/loginadmin" />;
// }
function App() {
  return (
    <BrowserRouter>
      <Routes> 
        <Route path="/" element={<LoginKaryawan />} />
        <Route path="/loginadmin" element={<Login />} />
        <Route path="/datacabang" element={<CabangPages />} />
        {/* <Route path="/dashboard" element={<PrivateRoute element={<DashboardKaryawanPages />} />} /> */}
        <Route path="/dashboard" element={<DashboardKaryawanPages />} />
        <Route path="/clockout" element={<ClockOutPages />} />
        <Route path="/datacabang/tambah" element={<TambahCabangPages />} />
        <Route path="/datacabang/edit/:id" element={<EditCabangPages />} />
        <Route path="/datakaryawan" element={<DataKaryawanPages />} />
        <Route path="/karyawan/tambah" element={<CreateKaryawanPages />} />
        <Route path="/datakaryawan/edit/:id" element={<EditKaryawanPages />} />
        <Route path="/DashboardAdmin" element={<Dashboard />} />
        <Route path="/dashboard" element={<DashboardKaryawanPages />}/>
        <Route path="/createabsen" element={<CreateAbsenPages />} />
        <Route path="/GetAbsen" element={<GetAbsen />} />
        <Route path="/GetAbsenBulan" element={<KehadiranBulanPages />} />
        <Route path="/users" element={<Profile />} />
        <Route path="/admin" element={<ProfileAdminPages />} />
        <Route path="/admin/data" element={<DataAdminPages />} />
        <Route path="/admin/add" element={<AddAdminPages />} />
        <Route path="/data" element={<DataPages />} /> 
        <Route path="/data/bulanan" element={<DataBulanPages />} /> 
        <Route path="/admin/edit/:id" element={<EditProfilePages />} />
        <Route path="/dataadmin/edit/:id" element={<FormEditAdminPages />} />
        <Route path="/editprofilekaryawan" element={<EditprofileKaryawanPages />} />
        <Route path="/datagaji" element={<DataGajiPages />} />
        <Route path="/editdatagaji/:id" element={<FormEditGajiPages />} />
        <Route path="/creategaji" element={<CreateGajiPages />} />
        <Route path="/datagajicabang" element={<DataGajiCabangPages />} />
        <Route path="/confrimgaji" element={<ConfrimGajiPages />} />
        {/* <Route path="/lokasi" element={<Lokasi  />} /> */}
        
        <Route path="/editdata" element={<AbsenControllPages />} />
        <Route path="/dataabsen/edit/:id" element={<EditAbsenPages  />} />
        <Route path="/absenmanual" element={<AbsenManualPages  />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;
