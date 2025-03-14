import React, { useState } from 'react';
import Box from '@mui/material/Box';
import NavBar from '../component/navbar/Navbar'
import Sidebar from '../component/sidebar/SideBar';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';




export const Layout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
      {/* Sidebar */}
      <Box
        sx={{
          display: { xs: isSidebarOpen ? 'block' : 'none', lg: 'block' },
          position: { xs: 'fixed', lg: 'relative' },
          zIndex: 1200,
          width: 300,
          flexShrink: 0,
        }}
      >
        <Sidebar />
      </Box>

      {/* Main Content Area */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Navbar */}
        <Box
          sx={{
            position: 'sticky',
            top: 0,
            zIndex: 1100,
            backgroundColor: 'white',
            boxShadow: 1,
          }}
        >
          <NavBar>
            <IconButton
              edge="start"
              color="inherit"
              aria-label="menu"
              sx={{ display: { lg: 'none' } }}
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            >
              <MenuIcon />
            </IconButton>
          </NavBar>
        </Box>

        {/* Content */}
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            overflowY: 'auto',
            backgroundColor: 'var(--mui-palette-background-default)',
            padding: { xs: 2, sm: 3 },
            width: '100%'
          }}
        >
          {children}
        </Box>

        {/* Footer */}
        {/* <Box
          sx={{
            position: 'sticky',
            bottom: 0,
            zIndex: 1100,
            backgroundColor: 'white',
            boxShadow: 1,
          }}
        >
          <Footer />
        </Box> */}
      </Box>
    </Box>
  );
};