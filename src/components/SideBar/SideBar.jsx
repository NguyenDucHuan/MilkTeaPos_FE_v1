import { Box, Typography, List, ListItem, ListItemText } from '@mui/material';
import React from 'react';
import './SideBar.css';

export default function SideBar() {
  return (
    <Box className="sidebar">
      {/* Logo */}
      <Typography variant="h6" sx={{ p: 2, color: 'white', fontWeight: 'bold' }}>
        BOBA
      </Typography>
      {/* Navigation Items */}
      <List>
        <ListItem button>
          <ListItemText primary="POS System" sx={{ color: 'white' }} />
        </ListItem>
        <ListItem button selected>
          <ListItemText primary="Overview" sx={{ color: 'white' }} />
        </ListItem>
        <ListItem button>
          <ListItemText primary="Products" sx={{ color: 'white' }} />
        </ListItem>
        <ListItem button>
          <ListItemText primary="Combos" sx={{ color: 'white' }} />
        </ListItem>
      </List>
    </Box>
  );
}