import { Box, Button, TextField, Typography, Link } from "@mui/material";
import React from "react";
import "./Login.css";
import logo from "../../../assets/img/1000_F_600982365_D1fxcXpO2R0vwx3qifLY0oje7qXu22Hf.jpg"; // Thêm logo (bạn cần thêm file logo vào thư mục assets)
import LocalPhoneIcon from "@mui/icons-material/LocalPhone";
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import HttpsIcon from '@mui/icons-material/Https';
export default function Login() {
  return (
    <>
      <Box className="login">
        <Box className="login__container">
          <Box className="login__header">
            <img src={logo} alt="KiotViet Logo" className="login__logo" />
            <Typography variant="h4" className="login__title">
              Login
            </Typography>
          </Box>

          <Box className="login__container__form">
            <form>
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
                  type="tel"
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
                sx={{ mt: 2 }}
              >
                Đăng nhập
              </Button>
            </form>
          </Box>
        </Box>
      </Box>
    </>
  );
}
