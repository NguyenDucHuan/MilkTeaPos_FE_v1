import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Box, TextField, Button, Typography, Link, InputAdornment, Alert } from "@mui/material";
import { Email, Lock } from "@mui/icons-material";
import { loginApi } from "../../../store/slices/authSlice";  // Đảm bảo bạn đang sử dụng đúng action
import { PATH } from "../../../routes/path";
import "./Login.css";

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, error, loading } = useSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    phoneOrEmail: "",
    password: "",
  });

  useEffect(() => {
    // Nếu người dùng đã đăng nhập, chuyển hướng ngay đến trang Home
    if (isAuthenticated) {
      navigate(PATH.HOME, { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const result = await dispatch(loginApi(formData));

      // Kiểm tra nếu login thành công
      if (result?.payload?.accessToken) {
        // Lưu accessToken vào localStorage khi đăng nhập thành công
        localStorage.setItem("accessToken", result.payload.accessToken);

        // Điều hướng về trang HOME sau khi login thành công
        navigate(PATH.HOME, { replace: true });
      } else {
        console.log("Login failed: ", result?.error || "Unknown error");
      }
    } catch (error) {
      console.error("Login error:", error);
    }
  };

  return (
    <Box className="login">
      <Box className="login__container">
        <Box className="login__header">
          <Typography variant="h4" className="login__title">
            Đăng nhập
          </Typography>
          <Typography variant="body2" className="login__subtitle">
            Chào mừng trở lại! Vui lòng đăng nhập để tiếp tục.
          </Typography>
        </Box>
        <form className="login__container__form" onSubmit={handleSubmit}>
          {error && (
            <Alert severity="error" className="login__error">
              {error}
            </Alert>
          )}
          <TextField
            fullWidth
            label="Email hoặc số điện thoại"
            name="phoneOrEmail"
            type="text"
            value={formData.phoneOrEmail}
            onChange={handleChange}
            required
            className="login__input"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Email className="login__icon" />
                </InputAdornment>
              ),
            }}
          />
          <TextField
            fullWidth
            label="Mật khẩu"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            required
            className="login__input"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Lock className="login__icon" />
                </InputAdornment>
              ),
            }}
          />
          <Button
            type="submit"
            variant="contained"
            fullWidth
            className="login__button"
            disabled={loading}
          >
            {loading ? "Đang đăng nhập..." : "Đăng nhập"}
          </Button>
          <Box className="login__footer">
            <Typography>
              Chưa có tài khoản?{" "}
              <Link href={PATH.REGISTER} underline="hover">
                Đăng ký ngay
              </Link>
            </Typography>
          </Box>
        </form>
      </Box>
    </Box>
  );
};

export default Login;
// import React, { useState, useEffect } from "react";