import { Box, Button, TextField, Typography, Link } from "@mui/material";
import React, { useState } from "react";
import "./Register.css";
import LocalPhoneIcon from "@mui/icons-material/LocalPhone";
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import HttpsIcon from '@mui/icons-material/Https';
import EmailIcon from '@mui/icons-material/Email';
import { useNavigate } from "react-router-dom";

export default function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    phone: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Kiểm tra mật khẩu
    if (formData.password !== formData.confirmPassword) {
      alert('Mật khẩu không khớp!');
      return;
    }
    // Xử lý đăng ký ở đây
    console.log('Form data:', formData);
    navigate("/auth/login"); // Chuyển hướng về trang đăng nhập sau khi đăng ký thành công
  };

  return (
    <Box className="register">
      <Box className="register__container">
        <Box className="register__header">
          <Typography variant="h4" className="register__title">
            Đăng ký tài khoản
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Tạo tài khoản mới để bắt đầu
          </Typography>
        </Box>

        <Box className="register__container__form">
          <form onSubmit={handleSubmit}>
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <LocalPhoneIcon className="register__icon" />
              <TextField
                name="phone"
                label="Số điện thoại"
                type="tel"
                variant="standard"
                fullWidth
                margin="normal"
                required
                value={formData.phone}
                onChange={handleChange}
                className="register__input"
              />
            </Box>
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <AccountCircleIcon className="register__icon" />
              <TextField
                name="username"
                label="Tên đăng nhập"
                type="text"
                variant="standard"
                fullWidth
                margin="normal"
                required
                value={formData.username}
                onChange={handleChange}
                className="register__input"
              />
            </Box>
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <EmailIcon className="register__icon" />
              <TextField
                name="email"
                label="Email"
                type="email"
                variant="standard"
                fullWidth
                margin="normal"
                required
                value={formData.email}
                onChange={handleChange}
                className="register__input"
              />
            </Box>
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <HttpsIcon className="register__icon" />
              <TextField
                name="password"
                label="Mật khẩu"
                type="password"
                variant="standard"
                fullWidth
                margin="normal"
                required
                value={formData.password}
                onChange={handleChange}
                className="register__input"
              />
            </Box>
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <HttpsIcon className="register__icon" />
              <TextField
                name="confirmPassword"
                label="Xác nhận mật khẩu"
                type="password"
                variant="standard"
                fullWidth
                margin="normal"
                required
                value={formData.confirmPassword}
                onChange={handleChange}
                className="register__input"
              />
            </Box>
            <Button
              variant="contained"
              color="primary"
              type="submit"
              fullWidth
              sx={{ mt: 3 }}
            >
              Đăng ký
            </Button>
            <Box sx={{ mt: 2, textAlign: 'center' }}>
              <Link href="/auth/login" variant="body2">
                Đã có tài khoản? Đăng nhập ngay
              </Link>
            </Box>
          </form>
        </Box>
      </Box>
    </Box>
  );
}
