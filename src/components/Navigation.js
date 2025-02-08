import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';

function Navigation() {
  const navigate = useNavigate();

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          Gestion des Appareils IoT
        </Typography>
        <Box>
          <Button color="inherit" onClick={() => navigate('/devices')}>
            Appareils
          </Button>
          <Button color="inherit" onClick={() => navigate('/monitoring')}>
            Monitoring
          </Button>
          <Button color="inherit" onClick={() => {
            localStorage.removeItem('token');
            navigate('/login');
          }}>
            Déconnexion
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
}

export default Navigation; 