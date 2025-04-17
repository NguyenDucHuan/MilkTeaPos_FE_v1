import { Box, Button, TextField, Typography, Link } from "@mui/material";
import React from "react";
import "./Login.css";
import LocalPhoneIcon from "@mui/icons-material/LocalPhone";
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import HttpsIcon from '@mui/icons-material/Https';
import { useNavigate } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    // Xử lý đăng nhập ở đây
    navigate("/"); // Chuyển hướng về trang chủ sau khi đăng nhập thành công
  };

  return (
    <Box className="login">
      <Box className="login__container">
        <Box className="login__header">
          <Typography variant="h4" className="login__title">
            Đăng nhập
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Vui lòng đăng nhập để tiếp tục
          </Typography>
        </Box>

        <Box className="login__container__form">
          <form onSubmit={handleSubmit}>
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <LocalPhoneIcon className="login__icon" />
              <TextField
                label="Số điện thoại"
                type="tel"
                variant="standard"
                fullWidth
                margin="normal"
                required
                className="login__input"
              />
            </Box>
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <AccountCircleIcon className="login__icon" />
              <TextField
                label="Tên đăng nhập"
                type="text"
                variant="standard"
                fullWidth
                margin="normal"
                required
                className="login__input"
              />
            </Box>
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <HttpsIcon className="login__icon" />
              <TextField
                label="Mật khẩu"
                type="password"
                variant="standard"
                fullWidth
                margin="normal"
                required
                className="login__input"
              />
            </Box>
            <Button
              variant="contained"
              color="primary"
              type="submit"
              fullWidth
              sx={{ mt: 3 }}
            >
              Đăng nhập
            </Button>
            <Box sx={{ mt: 2, textAlign: 'center' }}>
              <Link href="/auth/register" variant="body2">
                Chưa có tài khoản? Đăng ký ngay
              </Link>
            </Box>
          </form>
        </Box>
      </Box>
    </Box>
  );
}
