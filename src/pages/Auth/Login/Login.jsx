import { Box, Button, TextField, Typography, Link } from "@mui/material";
import React, { useState } from "react";
import "./Login.css";
import LocalPhoneIcon from "@mui/icons-material/LocalPhone";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import HttpsIcon from "@mui/icons-material/Https";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import IconButton from "@mui/material/IconButton";
import { Visibility, VisibilityOff } from "@mui/icons-material";

const schema = yup
  .object({
    phone: yup
      .string()
      .required("Số điện thoại là bắt buộc")
      .matches(/^[0-9]+$/, "Số điện thoại không hợp lệ")
      .min(10, "Số điện thoại phải có ít nhất 10 chữ số")
      .max(11, "Số điện thoại không được quá 11 số"),
    username: yup.string().required("Tên đăng nhập là bắt buộc"),
    password: yup.string().required("Mật khẩu là bắt buộc"),
  })
  .required();

export default function Login() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  const [showPassword, setShowPassword] = useState(false);

  const handleClickShowPassword = () => {
    setShowPassword((prev) => !prev);
  };

  const onSubmit = (data) => {
    console.log(data);
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
          <form onSubmit={handleSubmit(onSubmit)}>
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
                {...register("phone")}
                error={!!errors.phone}
                helperText={errors.phone ? errors.phone.message : ""}
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
                {...register("username")}
                error={!!errors.username}
                helperText={errors.username ? errors.username.message : ""}
              />
            </Box>
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <HttpsIcon className="login__icon" />
              <TextField
                label="Mật khẩu"
                type={showPassword ? "text" : "password"}
                variant="standard"
                fullWidth
                margin="normal"
                required
                className="login__input"
                {...register("password")}
                error={!!errors.password}
                helperText={errors.password ? errors.password.message : ""}
                InputProps={{
                  endAdornment: (
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={handleClickShowPassword}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  ),
                }}
              />
            </Box>
            <Button
              variant="contained"
              color="primary"
              type="submit"
              fullWidth
              sx={{ mt: 3 }}
              className="login__button"
            >
              Đăng nhập
            </Button>
            <Box sx={{ mt: 2, textAlign: "center" }}>
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
