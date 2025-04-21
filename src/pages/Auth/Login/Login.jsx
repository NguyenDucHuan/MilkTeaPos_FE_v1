import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Box, TextField, Button, Typography, Link, InputAdornment, Alert } from "@mui/material";
import { Email, Lock } from "@mui/icons-material";
import { loginApi } from "../../../store/slices/authSlice";  // Đảm bảo bạn đang sử dụng đúng action
import { PATH } from "../../../routes/path";
import "./Login.css";
import toast from "react-hot-toast";

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
      const result = await dispatch(loginApi(formData)).unwrap(); // Sử dụng unwrap để xử lý lỗi dễ dàng hơn
  
      // Đăng nhập thành công
      if (result?.accessToken) {
        // Lưu accessToken vào localStorage
        localStorage.setItem("accessToken", result.accessToken);
  
        // Hiển thị toast thành công
        toast.success("Đăng nhập thành công!", {
          position: "top-right",
          autoClose: 2000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
  
        // Điều hướng về trang HOME
        navigate(PATH.HOME, { replace: true });
      }
    } catch (error) {
      // Đăng nhập thất bại
      // Lấy thông điệp lỗi từ error (được trả về từ rejectWithValue trong loginApi)
      const errorMessage = error?.message || "Đăng nhập thất bại. Vui lòng thử lại.";
  
      // Hiển thị toast lỗi
      toast.error(errorMessage, {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
  
      console.error("Login error:", error);
    }
  };

  return (
    <Box className="login" >
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