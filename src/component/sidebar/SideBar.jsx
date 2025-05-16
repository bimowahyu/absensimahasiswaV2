import React, { useState, useEffect, useRef } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import { useDispatch, useSelector } from "react-redux";
import { 
  LogoutOutlined, 
  ExpandMore, 
  ExpandLess, 
  Dashboard, 
  CalendarMonth, 
  Edit, 
  AttachMoney, 
  Business, 
  People, 
  Person, 
  AdminPanelSettings,
  Book
} from "@mui/icons-material";
import { LogOutAdmin, reset } from "../../fitur/AuthSlice";
import { Collapse, List, ListItem, ListItemIcon, ListItemText } from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";

// Create a localStorage key for menu state
const MENU_STATE_KEY = 'sidebar_menu_state';

export const Sidebar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  
  const auth = useSelector((state) => state.authAdmin || {});
  const user = auth.user || null;
  const isDosen = user?.role === "dosen";
  const sidebarRef = useRef(null);
  
  // Initialize menu state from localStorage or with all menus closed by default
  const [openMenus, setOpenMenus] = useState(() => {
    const savedState = localStorage.getItem(MENU_STATE_KEY);
    if (savedState) {
      try {
        return JSON.parse(savedState);
      } catch (e) {
        console.error("Error parsing saved menu state", e);
      }
    }
    
    // Default state with all menus closed
    return {
      absensi: false,
      penggajian: false,
      cabang: false,
      karyawan: false,
      admin: false
    };
  });

  // Force all menus to be closed on first render
  useEffect(() => {
    // Set all menus to closed on initial render
    setOpenMenus({
      absensi: false,
      penggajian: false,
      cabang: false,
      karyawan: false,
      admin: false
    });
  }, []);

  // Save menu state to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem(MENU_STATE_KEY, JSON.stringify(openMenus));
  }, [openMenus]);

  // Toggle menu without auto-closing
  const toggleMenu = (menu, event) => {
    // Stop event propagation to prevent any navigation
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    
    setOpenMenus(prev => ({
      ...prev,
      [menu]: !prev[menu]
    }));
  };

  const [openConfirmDialog, setOpenConfirmDialog] = useState(false);

  const handleLogoutClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setOpenConfirmDialog(true);
  };

  const handleConfirmLogout = () => {
    dispatch(LogOutAdmin());
    dispatch(reset());
    navigate("/");
    setOpenConfirmDialog(false);
  };

  const handleCancelLogout = () => {
    setOpenConfirmDialog(false);
  };

  const navLinkStyle = {
    textDecoration: "none",
    color: "#f0f8ff",
    padding: "10px 12px",
    borderRadius: "8px",
    transition: "all 0.3s ease",
    display: "flex",
    alignItems: "center",
    "&:hover": {
      backgroundColor: "rgba(177, 240, 247, 0.2)",
      color: "white",
      transform: "translateX(5px)",
    },
    "&.active": {
      backgroundColor: "#B1F0F7",
      color: "#0A5EB0",
      fontWeight: "600",
      boxShadow: "0 4px 6px rgba(177, 240, 247, 0.2)",
    },
  };

  const menuItemStyle = {
    color: "#f0f8ff",
    padding: "10px 12px",
    borderRadius: "8px",
    transition: "all 0.3s ease",
    display: "flex",
    alignItems: "center",
    cursor: "pointer",
    "&:hover": {
      backgroundColor: "rgba(177, 240, 247, 0.2)",
      color: "white",
    },
  };

  const subMenuLinkStyle = {
    textDecoration: "none",
    color: "#e0f4ff",
    padding: "8px 10px 8px 42px",
    borderRadius: "8px",
    transition: "all 0.3s ease",
    fontSize: "0.95rem",
    display: "block",
    "&:hover": {
      backgroundColor: "rgba(177, 240, 247, 0.15)",
      color: "white",
      transform: "translateX(5px)",
    },
    "&.active": {
      backgroundColor: "rgba(177, 240, 247, 0.3)",
      color: "white",
      fontWeight: "500",
    },
  };

  const menuGroups = isDosen
  ? [
    {
      title: "Dashboard",
      icon: <CalendarMonth fontSize="small" sx={{ mr: 1.5 }} />,
      to: "/dashboarddosen",
      type: "single"
    },
      {
        title: "Presensi Matkul",
        icon: <CalendarMonth fontSize="small" sx={{ mr: 1.5 }} />,
        to: "/presensi-matkul",
        type: "single"
      }
    ]
  : [
      {
        title: "Dashboard",
        icon: <Dashboard fontSize="small" sx={{ mr: 1.5 }} />,
        to: "/DashboardAdmin",
        type: "single"
      },
      {
        title: "Absensi",
        icon: <CalendarMonth fontSize="small" sx={{ mr: 1.5 }} />,
        key: "absensi",
        type: "dropdown",
        items: [
          { to: "/data/bulanan", text: "Data Bulanan" },
          { to: "/data/mingguan", text: "Data Mingguan" },
          { to: "/absenmanual", text: "Absensi Manual" },
          { to: "/editdata", text: "Edit Absensi" },
        ]
      },
      {
        title: "Matkul",
        icon: <Book fontSize="small" sx={{ mr: 1.5 }} />,
        key: "matkul",
        type: "dropdown",
        items: [
          { to: "/datamatkul", text: "Data Matkul" },
          { to: "/settingabsensimatkul", text: "Setting Presensi Matkul" },
        ]
      },
      {
        title: "Management Dosen",
        icon: <Person fontSize="small" sx={{ mr: 1.5 }} />,
        key: "dosen",
        type: "dropdown",
        items: [
          { to: "/datadosen", text: "Data Dosen" },
          // { to: "/datadosen/tambah", text: "Create Dosen" },
        ]
      },
      {
        title: "Lokasi Presensi",
        icon: <Business fontSize="small" sx={{ mr: 1.5 }} />,
        key: "lokasi presensi",
        type: "dropdown",
        items: [
          { to: "/datalokasi", text: "Data Lokasi Presensi" },
          { to: "/datalokasi/tambah", text: "Tambah Lokasi" },
        ]
      },
      {
        title: "Mahasiswa",
        icon: <People fontSize="small" sx={{ mr: 1.5 }} />,
        key: "Mahasiswa",
        type: "dropdown",
        items: [
          { to: "/datamahasiswa", text: "Data Mahasiswa" },
          { to: "/mahasiswa/tambah", text: "Tambah Mahasiswa" },
        ]
      },
      {
        title: "Admin",
        icon: <AdminPanelSettings fontSize="small" sx={{ mr: 1.5 }} />,
        key: "admin",
        type: "dropdown",
        items: [
          { to: "/admin", text: "Profile Admin" },
          { to: "/admin/data", text: "Admin List" },
        ]
      },
    ];

  // const menuGroups = [
  //   {
  //     title: "Dashboard",
  //     icon: <Dashboard fontSize="small" sx={{ mr: 1.5 }} />,
  //     to: "/DashboardAdmin",
  //     type: "single"
  //   },
  //   {
  //     title: "Absensi",
  //     icon: <CalendarMonth fontSize="small" sx={{ mr: 1.5 }} />,
  //     key: "absensi",
  //     type: "dropdown",
  //     items: [
  //       { to: "/data/bulanan", text: "Data Bulanan" },
  //       { to: "/data", text: "Data Absensi" },
  //       { to: "/absenmanual", text: "Absensi Manual" },
  //       { to: "/editdata", text: "Edit Absensi" },
  //     ]
  //   },
  //   {
  //     title: "Matkul",
  //     icon: <AttachMoney fontSize="small" sx={{ mr: 1.5 }} />,
  //     key: "matkul",
  //     type: "dropdown",
  //     items: [
  //       { to: "/datamatkul", text: "Data Matkul" },
  //       { to: "/datamatkul/tambah", text: "Create Matkul" },
  //       // { to: "/creategaji", text: "Create Penggajian" },
  //     ]
  //   },
  //   {
  //     title: "Management Dosen",
  //     icon: <AttachMoney fontSize="small" sx={{ mr: 1.5 }} />,
  //     key: "dosen",
  //     type: "dropdown",
  //     items: [
  //       { to: "/datadosen", text: "Data Dosen" },
  //       // { to: "/datagajicabang", text: "Export Data Gaji" },
  //       { to: "/datadosen/tambah", text: "Create Dosen" },
  //     ]
  //   },
  //   {
  //     title: "Lokasi Presensi",
  //     icon: <Business fontSize="small" sx={{ mr: 1.5 }} />,
  //     key: "lokasi presensi",
  //     type: "dropdown",
  //     items: [
  //       { to: "/datalokasi", text: "Data Lokasi Presensi" },
  //       { to: "/datalokasi/tambah", text: "Tambah Data Lokasi Presensi" },
  //     ]
  //   },
  //   {
  //     title: "Mahasiswa",
  //     icon: <People fontSize="small" sx={{ mr: 1.5 }} />,
  //     key: "Mahasiswa",
  //     type: "dropdown",
  //     items: [
  //       { to: "/datamahasiswa", text: "Data Mahasiswa" },
  //       { to: "/mahasiswa/tambah", text: "Tambah Data Mahasiswa" },
  //       // { to: "/karyawan/edit", text: "Edit Data Karyawan" },
  //     ]
  //   },
  //   {
  //     title: "Admin",
  //     icon: <AdminPanelSettings fontSize="small" sx={{ mr: 1.5 }} />,
  //     key: "admin",
  //     type: "dropdown",
  //     items: [
  //       { to: "/admin", text: "Profile Admin" },
  //       { to: "/admin/data", text: "Admin List" },
  //     ]
  //   },
  // ];

  const dropdownVariants = {
    hidden: { opacity: 0, height: 0, overflow: "hidden" },
    visible: { 
      opacity: 1, 
      height: "auto",
      transition: { 
        duration: 0.3,
        when: "beforeChildren",
        staggerChildren: 0.05
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: { opacity: 1, x: 0 }
  };

  return (
    <Box
      ref={sidebarRef}
      sx={{
        background: "linear-gradient(180deg, #0A5EB0 0%, #074a8e 100%)",
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        width: { xs: 250, lg: 280 },
        position: "fixed",
        top: 0,
        left: 0,
        p: 2,
        zIndex: 1200,
        overflowY: "auto",
        boxShadow: "4px 0 10px rgba(0, 0, 0, 0.1)",
        "&::-webkit-scrollbar": {
          width: "6px",
        },
        "&::-webkit-scrollbar-thumb": {
          backgroundColor: "#B1F0F7",
          borderRadius: "10px",
          "&:hover": {
            backgroundColor: "#90E0E7",
          },
        },
      }}
    >
      {/* Logo Section */}
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          py: 2,
          mb: 3,
          position: "relative",
          "&::after": {
            content: '""',
            position: "absolute",
            bottom: 0,
            left: "10%",
            width: "80%",
            height: "2px",
            background: "linear-gradient(90deg, rgba(177,240,247,0) 0%, rgba(177,240,247,1) 50%, rgba(177,240,247,0) 100%)",
          }
        }}
      >
        <Typography
          variant="h6"
          sx={{
            textAlign: "center",
            color: "#fff",
            fontWeight: "bold",
            fontSize: "16px",
            lineHeight: "1.4",
            mb: 1,
            textShadow: "0px 2px 4px rgba(0,0,0,0.2)"
          }}
        >
          Sistem Informasi Absensi <br />
          Mahasiswa
        </Typography>
      </Box>

      {/* Navigation Links */}
      <Stack spacing={0.5} sx={{ flex: 1, mt: 1 }}>
        {menuGroups.map((group) => (
          <React.Fragment key={group.title}>
            {group.type === "single" ? (
              <Typography 
                component={NavLink} 
                to={group.to} 
                sx={navLinkStyle} 
                key={group.to}
              >
                {group.icon}
                {group.title}
              </Typography>
            ) : (
              <>
                <Box 
                  sx={menuItemStyle}
                  onClick={(e) => toggleMenu(group.key, e)}
                >
                  {group.icon}
                  <Typography sx={{ flex: 1 }}>{group.title}</Typography>
                  {openMenus[group.key] ? 
                    <ExpandLess fontSize="small" /> : 
                    <ExpandMore fontSize="small" />
                  }
                </Box>
                
                <AnimatePresence>
                  {openMenus[group.key] && (
                    <motion.div
                      variants={dropdownVariants}
                      initial="hidden"
                      animate="visible"
                      exit="hidden"
                      key={`${group.key}-dropdown`}
                    >
                      <List dense disablePadding sx={{ mt: 0.5, mb: 1 }}>
                        {group.items.map((item) => (
                          <motion.div
                            key={item.to}
                            variants={itemVariants}
                            onClick={(e) => {
                              // Don't let this click affect menu state
                              e.stopPropagation();
                            }}
                          >
                            <Typography 
                              component={NavLink} 
                              to={item.to} 
                              sx={subMenuLinkStyle}
                              // This click shouldn't affect menu state
                              onClick={(e) => e.stopPropagation()}
                            >
                              {item.text}
                            </Typography>
                          </motion.div>
                        ))}
                      </List>
                    </motion.div>
                  )}
                </AnimatePresence>
              </>
            )}
          </React.Fragment>
        ))}

        {/* Divider before Logout */}
        <Divider 
          sx={{ 
            bgcolor: "#B1F0F7", 
            my: 2, 
            opacity: 0.4, 
            "&:hover": { opacity: 0.8 },
            transition: "opacity 0.3s ease"
          }} 
        />

        {/* Logout Button */}
        <Button
          onClick={handleLogoutClick}
          sx={{
            width: "100%",
            justifyContent: "flex-start",
            color: "#f0f8ff",
            p: 1.5,
            borderRadius: 2,
            textTransform: "none",
            transition: "all 0.3s ease",
            "&:hover": {
              bgcolor: "#FB4141",
              color: "white",
              transform: "translateX(5px)"
            },
            minHeight: "48px",
          }}
          startIcon={<LogoutOutlined />}
        >
          Log Out
        </Button>
      </Stack>

      {/* Logout Dialog */}
      <Dialog 
        open={openConfirmDialog} 
        onClose={handleCancelLogout}
        PaperProps={{
          sx: {
            borderRadius: "12px",
            boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
          }
        }}
      >
        <DialogTitle sx={{ fontSize: "1.2rem", fontWeight: 600, pb: 1 }}>
          Konfirmasi Logout
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Apakah Anda yakin ingin keluar dari aplikasi?
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button 
            onClick={handleCancelLogout} 
            color="secondary"
            variant="outlined"
            sx={{ 
              borderRadius: "8px",
              textTransform: "none",
            }}
          >
            Batal
          </Button>
          <Button 
            onClick={handleConfirmLogout} 
            color="error" 
            variant="contained"
            autoFocus
            sx={{ 
              borderRadius: "8px",
              textTransform: "none",
              boxShadow: "0 4px 8px rgba(251, 65, 65, 0.25)"
            }}
          >
            Keluar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Sidebar;