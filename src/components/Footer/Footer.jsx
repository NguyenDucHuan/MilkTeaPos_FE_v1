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
        bgcolor: 'background.paper',
        py: 6,
        borderTop: '1px solid',
        borderColor: 'divider',
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          {/* About Section */}
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="h6" color="text.primary" gutterBottom>
              Milk Tea Shop
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Thưởng thức hương vị trà sữa tuyệt hảo với những nguyên liệu tươi ngon nhất.
            </Typography>
          </Grid>

          {/* Quick Links */}
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="h6" color="text.primary" gutterBottom>
              Liên kết nhanh
            </Typography>
            <Box component="ul" sx={{ listStyle: 'none', p: 0 }}>
              <Box component="li" sx={{ mb: 1 }}>
                <Link href="/" color="inherit" underline="hover">
                  Trang chủ
                </Link>
              </Box>
              <Box component="li" sx={{ mb: 1 }}>
                <Link href="/menu" color="inherit" underline="hover">
                  Thực đơn
                </Link>
              </Box>
              <Box component="li" sx={{ mb: 1 }}>
                <Link href="/about" color="inherit" underline="hover">
                  Về chúng tôi
                </Link>
              </Box>
              <Box component="li" sx={{ mb: 1 }}>
                <Link href="/contact" color="inherit" underline="hover">
                  Liên hệ
                </Link>
              </Box>
            </Box>
          </Grid>

          {/* Contact Info */}
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="h6" color="text.primary" gutterBottom>
              Thông tin liên hệ
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <LocationOn sx={{ mr: 1 }} />
              <Typography variant="body2" color="text.secondary">
                123 Đường ABC, Quận XYZ
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Phone sx={{ mr: 1 }} />
              <Typography variant="body2" color="text.secondary">
                0123-456-789
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Email sx={{ mr: 1 }} />
              <Typography variant="body2" color="text.secondary">
                info@milktea.com
              </Typography>
            </Box>
          </Grid>

          {/* Social Media & Newsletter */}
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="h6" color="text.primary" gutterBottom>
              Kết nối với chúng tôi
            </Typography>
            <Box sx={{ mb: 2 }}>
              <IconButton color="primary" aria-label="Facebook">
                <Facebook />
              </IconButton>
              <IconButton color="primary" aria-label="Twitter">
                <Twitter />
              </IconButton>
              <IconButton color="primary" aria-label="Instagram">
                <Instagram />
              </IconButton>
            </Box>
            <Typography variant="subtitle1" color="text.primary" gutterBottom>
              Đăng ký nhận tin
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <TextField
                size="small"
                placeholder="Email của bạn"
                variant="outlined"
                sx={{ flexGrow: 1 }}
              />
              <Button variant="contained" color="primary">
                Đăng ký
              </Button>
            </Box>
          </Grid>
        </Grid>

        {/* Copyright */}
        <Box sx={{ mt: 4, pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
          <Typography variant="body2" color="text.secondary" align="center">
            © {new Date().getFullYear()} Milk Tea Shop. All rights reserved.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;
