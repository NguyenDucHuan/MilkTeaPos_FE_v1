import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Box, TextField, Button, Typography, Link, InputAdornment, Alert } from "@mui/material";
import { Email, Lock } from "@mui/icons-material";
import { loginApi } from "../../../store/slices/authSlice";
import { PATH } from "../../../routes/path";
import "./Login.css";
import toast from "react-hot-toast";
import { jwtDecode } from "jwt-decode";

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  // ----- SỬA 1: Lấy thêm 'user' từ Redux store -----
  const { isAuthenticated, error, loading, user } = useSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    phoneOrEmail: "",
    password: "",
  });

  useEffect(() => {
    // Kiểm tra khi component mount hoặc state thay đổi
    // ----- SỬA 2: Thêm kiểm tra 'user' tồn tại -----
    if (isAuthenticated && user) { // Chỉ kiểm tra role khi user đã có trong state
      console.log("useEffect - User Role:", user.role); // Debug xem role là gì
      if (user.role === 'Manager') { // <-- Sử dụng tên role chính xác từ backend
        navigate(PATH.ADMIN, { replace: true });
      } else { // Giả sử các role khác (Staff, ...) đều về HOME
        navigate(PATH.HOME, { replace: true });
      }
    }
    // ----- SỬA 3: Thêm 'user' vào dependency array -----
  }, [isAuthenticated, user, navigate]); // Thêm user để effect chạy lại khi user thay đổi

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("[handleSubmit] Bắt đầu submit.");
    let userRole = null; // Khai báo ở ngoài

    try {
      console.log("[handleSubmit] Gọi dispatch(loginApi)...");
      const result = await dispatch(loginApi(formData)).unwrap();
      console.log("[handleSubmit] Kết quả loginApi:", result);

      // Lấy token string
      const token = result?.accessToken?.token;
      if (!token || typeof token !== "string") {
        console.error("[handleSubmit] Token không hợp lệ hoặc thiếu:", token);
        throw new Error("Token không hợp lệ hoặc không tìm thấy.");
      }
      console.log("[handleSubmit] Đã tìm thấy token hợp lệ.");

      // Lưu token
      localStorage.setItem("accessToken", token);
      console.log("[handleSubmit] Đã lưu token vào localStorage.");

      // ----- GIẢI MÃ JWT ĐỂ LẤY ROLE -----
      try {
        console.log("[handleSubmit] Đang giải mã JWT...");
        const decodedToken = jwtDecode(token); // Giải mã token
        console.log("[handleSubmit] Decoded JWT Payload:", decodedToken);

        // Lấy role từ payload đã giải mã (DÙNG ĐÚNG KEY NÀY!)
        userRole = decodedToken['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];

        console.log("[handleSubmit] Giá trị userRole được gán sau khi giải mã:", userRole);

        if (!userRole) {
          console.warn("[handleSubmit] Không tìm thấy claim role trong JWT payload.");
          throw new Error("Không thể xác định vai trò người dùng từ token.");
        }
      } catch (decodeError) {
        console.error("[handleSubmit] Lỗi giải mã JWT:", decodeError);
        throw new Error("Lỗi xử lý thông tin đăng nhập."); // Throw lỗi chung hơn
      }
      // ------------------------------------

      // Toast thành công
      toast.success("Đăng nhập thành công!", { /* ... */ });
      console.log("[handleSubmit] Đã hiển thị toast thành công.");

      // ----- SỬ DỤNG userRole ĐỂ CHUYỂN HƯỚNG -----
      console.log(`[handleSubmit] Chuẩn bị kiểm tra userRole (giá trị hiện tại: ${userRole}) trước khi chuyển hướng...`);

      if (userRole === 'Manager') { // <-- So sánh với giá trị role lấy được
        console.log("[handleSubmit] Role là Manager -> Chuyển hướng đến ADMIN.");
        navigate(PATH.ADMIN, { replace: true });
      } else {
        console.log(`[handleSubmit] Role là ${userRole} -> Chuyển hướng đến HOME.`);
        navigate(PATH.HOME, { replace: true });
      }
      console.log("[handleSubmit] Kết thúc khối try thành công.");

    } catch (err) {
      const errorMessage = err?.message || "Đăng nhập thất bại. Vui lòng thử lại.";
      console.error("[handleSubmit] Lỗi trong khối catch:", err);
      console.error("[handleSubmit] Giá trị userRole tại thời điểm lỗi catch:", userRole);
      toast.error(errorMessage, { /* ... */ });
    }
    console.log("[handleSubmit] Kết thúc hàm.");
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