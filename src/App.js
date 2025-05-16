import { BrowserRouter, Route, Routes } from "react-router-dom";
// import Login from "./component/loginAdmin";
import Login from "./component/Login";
import { DashboardMahasiswaPages } from "./pages/DashboardPages";
import { CreateAbsenPages } from "./pages/CreateAbsenPages";
import { ClockOutPages } from "./pages/ClockoutPages";
import { GetAbsen } from "./pages/GetAbsen";
import { Profile } from "./pages/Profile";
import { CabangPages } from "./pages/adminpages/CabangPages";
import Dashboard from "./pages/adminpages/DashboardAdminPages";
import { TambahCabangPages } from "./pages/adminpages/CrateCabangPages";
import { EditCabangPages } from "./pages/adminpages/EditCabangPages";
import { DataMahasiswaPages } from "./pages/adminpages/DataMahasiswaPages";
import { CreateMahasiswaPages } from "./pages/adminpages/CreateMahasiswaPages";
import { ProfileAdminPages } from "./pages/adminpages/ProfileAdminPages";
import { EditProfilePages } from "./pages/adminpages/EditProfilePages";
import { EditprofileMahasiswaPages } from "./pages/EditprofileMahasiswaPages";
import  DataPages  from "./pages/adminpages/DataPages";
import { KehadiranBulanPages } from "./pages/KehadiranBulanPages";
import DataBulanPages from "./pages/adminpages/DataBulanPages";
import { EditMahasiswaPages } from "./pages/adminpages/EditMahasiswaPages";
import { MatkulPages } from "./pages/adminpages/MatkulPages";
import { DataDosenPages } from "./pages/adminpages/DataDosenPages";
import { SettingAbsensiMatkulPages } from "./pages/adminpages/SettingAbsensiMatkulPages";
import DashboardDosenPages from "./pages/adminpages/DashboardDosenPages";
import RekapAbsenDosenPages from "./pages/adminpages/RekapAbsenDosenPages";
// import Lokasi from "./component/lokasi";
import { AbsenceRequestFormPages } from "./pages/AbsenceRequestFormPages";

import { AkademikPages } from "./pages/AkademikPages";
import { AbsenControllPages } from "./pages/adminpages/AbsenControllPages";
import { EditAbsenPages } from "./pages/adminpages/EditAbsenPages";
import { AddAdminPages } from "./pages/adminpages/AddAdminPages";
import { DataAdminPages } from "./pages/adminpages/DataAdminPages";
import { AbsenManualPages } from "./pages/adminpages/AbsenManualPages";
import { FormEditAdminPages } from "./pages/adminpages/FormEditAdminPages";
import DataMingguPages from "./pages/adminpages/DataMingguPages";

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
        <Route path="/" element={<Login />} />
        {/* <Route path="/loginadmin" element={<Login />} /> */}
        <Route path="/datalokasi" element={<CabangPages />} />
        {/* <Route path="/dashboard" element={<PrivateRoute element={<DashboardKaryawanPages />} />} /> */}
        <Route path="/dashboard" element={<DashboardMahasiswaPages />} />

        <Route path="/dashboarddosen" element={<DashboardDosenPages />} />

        <Route path="/clockout" element={<ClockOutPages />} />
        <Route path="/datalokasi/tambah" element={<TambahCabangPages />} />
        <Route path="/datalokasi/edit/:id" element={<EditCabangPages />} />
        <Route path="/datamahasiswa" element={<DataMahasiswaPages />} />
        <Route path="/mahasiswa/tambah" element={<CreateMahasiswaPages />} />
        <Route path="/datamahasiswa/edit/:id" element={<EditMahasiswaPages />} />
        <Route path="/DashboardAdmin" element={<Dashboard />} />
        <Route path="/dashboard" element={<DashboardMahasiswaPages />}/>
        <Route path="/createabsen" element={<CreateAbsenPages />} />
        <Route path="/GetAbsen" element={<GetAbsen />} />
        <Route path="/GetAbsenBulan" element={<KehadiranBulanPages />} />
        <Route path="/users" element={<Profile />} />
        <Route path="/admin" element={<ProfileAdminPages />} />
        <Route path="/admin/data" element={<DataAdminPages />} />
        <Route path="/admin/add" element={<AddAdminPages />} />
        <Route path="/data" element={<DataPages />} /> 
        <Route path="/data/bulanan" element={<DataBulanPages />} /> 
        <Route path="/data/mingguan" element={<DataMingguPages />} /> 
        <Route path="/admin/edit/:id" element={<EditProfilePages />} />
        <Route path="/dataadmin/edit/:id" element={<FormEditAdminPages />} />
        <Route path="/editprofile" element={<EditprofileMahasiswaPages />} />
        <Route path="/presensi-matkul" element={<RekapAbsenDosenPages />}/>
        <Route path="/datamatkul" element={<MatkulPages />} /> 
        <Route path="/settingabsensimatkul" element={<SettingAbsensiMatkulPages />} /> 
        <Route path="/datadosen" element={<DataDosenPages />} /> 
       
        <Route path="/akademik" element={<AkademikPages />} /> 
       <Route path="/izin" element={<AbsenceRequestFormPages />} /> 
       
        {/* <Route path="/lokasi" element={<Lokasi  />} /> */}
        
        <Route path="/editdata" element={<AbsenControllPages />} />
        <Route path="/dataabsen/edit/:id" element={<EditAbsenPages  />} />
        <Route path="/absenmanual" element={<AbsenManualPages  />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;
