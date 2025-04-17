import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { PATH } from '../../routes/path';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Box,
  Button,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Drawer,
  List,
  ListItem,
  Avatar,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Home as HomeIcon,
  MenuBook as MenuBookIcon,
  Group as GroupIcon,
  Settings as SettingsIcon,
  Person as PersonIcon,
  ShoppingCart as ShoppingCartIcon,
  Logout as LogoutIcon,
  Menu as MenuIcon,
  Close as CloseIcon,
} from '@mui/icons-material';

const HEADER_HEIGHT = 80; // Define header height constant

const Header = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleMobileMenuToggle = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const handleNavigation = (path) => {
    navigate(path);
    setMobileMenuOpen(false);
    handleMenuClose();
  };

  const menuItems = [
    { text: 'Trang chủ', icon: HomeIcon, path: PATH.HOME },
    { text: 'Thực đơn', icon: MenuBookIcon, path: '/menu' },
    { text: 'Nhân viên', icon: GroupIcon, path: '/staff' },
    { text: 'Cài đặt', icon: SettingsIcon, path: '/settings' },
  ];

  const userMenuItems = [
    { text: 'Thông tin cá nhân', icon: PersonIcon, path: '/profile' },
    { text: 'Đơn hàng', icon: ShoppingCartIcon, path: '/orders' },
    { text: 'Đăng xuất', icon: LogoutIcon, path: PATH.LOGIN },
  ];

  return (
    <>
      <AppBar 
        position="fixed" 
        sx={{ 
          backgroundColor: isScrolled ? 'rgba(255, 255, 255, 0.95)' : 'transparent',
          backdropFilter: isScrolled ? 'blur(8px)' : 'none',
          boxShadow: isScrolled ? 1 : 0,
          transition: 'all 0.3s ease-in-out',
          zIndex: (theme) => theme.zIndex.drawer + 1,
        }}
      >
        <Toolbar sx={{ height: HEADER_HEIGHT }}>
          {/* Logo */}
          <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 0 }}>
            <Link 
              to={PATH.HOME} 
              style={{ 
                textDecoration: 'none', 
                display: 'flex', 
                alignItems: 'center',
                gap: 16
              }}
            >
              <Avatar 
                sx={{ 
                  bgcolor: '#895a2a',
                  width: 40,
                  height: 40,
                  transition: 'transform 0.2s',
                  '&:hover': {
                    transform: 'scale(1.1)',
                  },
                }}
              >
                M
              </Avatar>
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 'bold',
                  color: '#895a2a',
                  transition: 'color 0.2s',
                  '&:hover': {
                    color: '#6b4423',
                  },
                }}
              >
                Milk Tea Shop
              </Typography>
            </Link>
          </Box>

          {/* Desktop Menu */}
          {!isMobile && (
            <Box sx={{ ml: 4, display: 'flex', gap: 2 }}>
              {menuItems.map((item) => (
                <Button
                  key={item.text}
                  startIcon={<item.icon />}
                  onClick={() => handleNavigation(item.path)}
                  sx={{
                    color: '#895a2a',
                    '&:hover': {
                      backgroundColor: 'rgba(137, 90, 42, 0.08)',
                    },
                  }}
                >
                  {item.text}
                </Button>
              ))}
            </Box>
          )}

          <Box sx={{ flexGrow: 1 }} />

          {/* User Menu */}
          {!isMobile ? (
            <>
              <IconButton
                onClick={handleMenuOpen}
                sx={{
                  ml: 2,
                  transition: 'transform 0.2s',
                  '&:hover': {
                    transform: 'scale(1.1)',
                  },
                }}
              >
                <Avatar sx={{ bgcolor: '#895a2a' }}>U</Avatar>
              </IconButton>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
                PaperProps={{
                  elevation: 3,
                  sx: {
                    mt: 1.5,
                    minWidth: 200,
                    borderRadius: 2,
                  },
                }}
              >
                {userMenuItems.map((item) => (
                  <MenuItem
                    key={item.text}
                    onClick={() => handleNavigation(item.path)}
                    sx={{
                      py: 1.5,
                      '&:hover': {
                        backgroundColor: 'rgba(137, 90, 42, 0.08)',
                      },
                    }}
                  >
                    <ListItemIcon>
                      <item.icon sx={{ color: '#895a2a' }} />
                    </ListItemIcon>
                    <ListItemText primary={item.text} />
                  </MenuItem>
                ))}
              </Menu>
            </>
          ) : (
            <IconButton
              edge="end"
              color="inherit"
              onClick={handleMobileMenuToggle}
              sx={{ color: '#895a2a' }}
            >
              {mobileMenuOpen ? <CloseIcon /> : <MenuIcon />}
            </IconButton>
          )}
        </Toolbar>
      </AppBar>

      {/* Toolbar placeholder to prevent content from going under AppBar */}
      <Toolbar sx={{ height: HEADER_HEIGHT }} />

      {/* Mobile Menu */}
      <Drawer
        anchor="right"
        open={mobileMenuOpen}
        onClose={handleMobileMenuToggle}
        PaperProps={{
          sx: {
            width: 280,
            p: 2,
            mt: `${HEADER_HEIGHT}px`, // Add margin-top equal to header height
          },
        }}
      >
        <List>
          {menuItems.map((item) => (
            <ListItem
              key={item.text}
              button
              onClick={() => handleNavigation(item.path)}
              sx={{
                borderRadius: 1,
                mb: 1,
                '&:hover': {
                  backgroundColor: 'rgba(137, 90, 42, 0.08)',
                },
              }}
            >
              <ListItemIcon>
                <item.icon sx={{ color: '#895a2a' }} />
              </ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItem>
          ))}
          <Box sx={{ height: 1, bgcolor: 'divider', my: 2 }} />
          {userMenuItems.map((item) => (
            <ListItem
              key={item.text}
              button
              onClick={() => handleNavigation(item.path)}
              sx={{
                borderRadius: 1,
                mb: 1,
                '&:hover': {
                  backgroundColor: 'rgba(137, 90, 42, 0.08)',
                },
              }}
            >
              <ListItemIcon>
                <item.icon sx={{ color: '#895a2a' }} />
              </ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItem>
          ))}
        </List>
      </Drawer>
    </>
  );
};

export default Header;
