import React from 'react';
import {
  Box,
  Container,
  Grid,
  Typography,
  Link,
  IconButton,
  TextField,
  Button,
  alpha,
} from '@mui/material';
import {
  Facebook,
  Twitter,
  Instagram,
  LocationOn,
  Phone,
  Email,
} from '@mui/icons-material';

const Footer = () => {
  return (
    <Box
      component="footer"
      sx={{
        background: `linear-gradient(to bottom, #f3e5d8, #e6d5c3)`,
        position: 'relative',
        py: 6,
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23895a2a' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          opacity: 0.5,
          zIndex: 0,
        },
      }}
    >
      <Container 
        maxWidth="lg"
        sx={{
          position: 'relative',
          zIndex: 1,
        }}
      >
        <Grid container spacing={4}>
          {/* About Section */}
          <Grid item xs={12} sm={6} md={3}>
            <Typography 
              variant="h6" 
              sx={{ 
                color: '#895a2a',
                fontWeight: 'bold',
                mb: 2,
              }}
            >
              Milk Tea Shop
            </Typography>
            <Typography 
              variant="body2" 
              sx={{ 
                color: 'text.secondary',
                lineHeight: 1.6,
              }}
            >
              Thưởng thức hương vị trà sữa tuyệt hảo với những nguyên liệu tươi ngon nhất.
            </Typography>
          </Grid>

          {/* Quick Links */}
          <Grid item xs={12} sm={6} md={3}>
            <Typography 
              variant="h6" 
              sx={{ 
                color: '#895a2a',
                fontWeight: 'bold',
                mb: 2,
              }}
            >
              Liên kết nhanh
            </Typography>
            <Box component="ul" sx={{ listStyle: 'none', p: 0 }}>
              {['Trang chủ', 'Thực đơn', 'Về chúng tôi', 'Liên hệ'].map((text, index) => (
                <Box component="li" key={text} sx={{ mb: 1.5 }}>
                  <Link 
                    href={index === 0 ? '/' : `/${text.toLowerCase().replace(' ', '-')}`}
                    sx={{
                      color: 'text.secondary',
                      textDecoration: 'none',
                      transition: 'all 0.2s',
                      '&:hover': {
                        color: '#895a2a',
                        pl: 1,
                      },
                    }}
                  >
                    {text}
                  </Link>
                </Box>
              ))}
            </Box>
          </Grid>

          {/* Contact Info */}
          <Grid item xs={12} sm={6} md={3}>
            <Typography 
              variant="h6" 
              sx={{ 
                color: '#895a2a',
                fontWeight: 'bold',
                mb: 2,
              }}
            >
              Thông tin liên hệ
            </Typography>
            {[
              { icon: LocationOn, text: '123 Đường ABC, Quận XYZ' },
              { icon: Phone, text: '0123-456-789' },
              { icon: Email, text: 'info@milktea.com' },
            ].map(({ icon: Icon, text }) => (
              <Box 
                key={text}
                sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  mb: 2,
                  transition: 'transform 0.2s',
                  '&:hover': {
                    transform: 'translateX(8px)',
                  },
                }}
              >
                <Icon sx={{ mr: 1, color: '#895a2a' }} />
                <Typography variant="body2" color="text.secondary">
                  {text}
                </Typography>
              </Box>
            ))}
          </Grid>

          {/* Social Media & Newsletter */}
          <Grid item xs={12} sm={6} md={3}>
            <Typography 
              variant="h6" 
              sx={{ 
                color: '#895a2a',
                fontWeight: 'bold',
                mb: 2,
              }}
            >
              Kết nối với chúng tôi
            </Typography>
            <Box sx={{ mb: 3 }}>
              {[Facebook, Twitter, Instagram].map((Icon, index) => (
                <IconButton 
                  key={index}
                  sx={{
                    mr: 1,
                    color: '#895a2a',
                    transition: 'all 0.2s',
                    '&:hover': {
                      backgroundColor: alpha('#895a2a', 0.1),
                      transform: 'translateY(-3px)',
                    },
                  }}
                >
                  <Icon />
                </IconButton>
              ))}
            </Box>
            <Typography 
              variant="subtitle1" 
              sx={{ 
                color: '#895a2a',
                fontWeight: 'bold',
                mb: 1,
              }}
            >
              Đăng ký nhận tin
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <TextField
                size="small"
                placeholder="Email của bạn"
                variant="outlined"
                sx={{
                  flexGrow: 1,
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: 'white',
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#895a2a',
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#895a2a',
                    },
                  },
                }}
              />
              <Button 
                variant="contained"
                sx={{
                  backgroundColor: '#895a2a',
                  '&:hover': {
                    backgroundColor: '#6b4423',
                  },
                }}
              >
                Đăng ký
              </Button>
            </Box>
          </Grid>
        </Grid>

        {/* Copyright */}
        <Box 
          sx={{ 
            mt: 6, 
            pt: 3, 
            borderTop: '1px solid',
            borderColor: alpha('#895a2a', 0.2),
          }}
        >
          <Typography 
            variant="body2" 
            align="center"
            sx={{ 
              color: 'text.secondary',
              '& span': {
                color: '#895a2a',
                fontWeight: 'bold',
              },
            }}
          >
            © {new Date().getFullYear()} <span>Milk Tea Shop</span>. All rights reserved.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;
