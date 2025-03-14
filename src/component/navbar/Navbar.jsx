import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import { List as ListIcon } from '@phosphor-icons/react/dist/ssr/List';
import { Users as UsersIcon } from '@phosphor-icons/react/dist/ssr/Users';
import Sidebar from "../sidebar/SideBar";
import { useSelector } from "react-redux";

export const Navbar = () => {
  const [openDrawer, setOpenDrawer] = useState(false);
  const { user } = useSelector((state) => state.authAdmin || {});

  const toggleDrawer = () => {
    setOpenDrawer((prev) => !prev);
  };

  return (
    <React.Fragment>
      {/* Navbar Container */}
      <Box
        component="header"
        sx={{
          borderBottom: '1px solid var(--mui-palette-divider)',
          backgroundColor: 'var(--mui-palette-background-paper)',
          position: 'sticky',
          top: 0,
          zIndex: 1200,
        }}
      >
        <Stack
          direction="row"
          spacing={0}
          sx={{ alignItems: 'center', justifyContent: 'space-between', minHeight: '64px', px: 0 }}
        >
          {/* Mobile Menu Button */}
          <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
            <Tooltip title="Sidebar">
              <IconButton onClick={toggleDrawer} size="small">
                <ListIcon size={20} />
              </IconButton>
            </Tooltip>
          </Stack>

          {/* Navbar Right Actions */}
          {user && user.role === "admin" && (
            <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
              <Tooltip title="User List">
                <Link to="/datakaryawan" style={{ textDecoration: 'none' }}>
                  <IconButton size="small">
                    <UsersIcon size={20} />
                  </IconButton>
                </Link>
              </Tooltip>

              <Link to="/admin" style={{ textDecoration: 'none' }}>
                <Avatar
                  sx={{
                    cursor: 'pointer',
                    width: 40,
                    height: 40,
                    bgcolor: 'primary.main',
                    color: 'white',
                  }}
                />
              </Link>
            </Stack>
          )}
        </Stack>
      </Box>

      {/* Sidebar for Mobile */}
      {openDrawer && (
        <Box
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            zIndex: 1300,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            animation: 'fadeIn 0.3s ease',
            '@keyframes fadeIn': {
              from: { opacity: 0 },
              to: { opacity: 1 }
            }
          }}
          onClick={toggleDrawer} // Hanya menutup jika klik di luar sidebar
        >
          {/* Sidebar - Stop Propagation */}
          <Box
            sx={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: { xs: 200, lg: 250 },
              height: '100vh',
              bgcolor: 'white',
              '@keyframes slideIn': {
                from: { transform: 'translateX(-100%)' },
                to: { transform: 'translateX(0)' }
              },
              animation: {
                xs: 'slideIn 0.3s ease',
                lg: 'none'
              }
            }}
            onClick={(e) => e.stopPropagation()} // Mencegah sidebar tertutup saat dropdown diklik
          >
            <Sidebar />
          </Box>
        </Box>
      )}
    </React.Fragment>
  );
};

export default Navbar;
