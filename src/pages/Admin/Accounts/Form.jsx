import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  MenuItem,
  TextField,
  Typography,
  FormControlLabel,
  Switch,
  Avatar,
} from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import fetcher from "../../../apis/fetcher";

export default function AccountForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = Boolean(id);

  const [formData, setFormData] = useState({
    fullName: "",
    username: "",
    email: "",
    phone: "",
    imageUrl: "",
    role: "Staff",
    status: true,
  });

  const [emailError, setEmailError] = useState(false);
  const [phoneError, setPhoneError] = useState(false);

  useEffect(() => {
    if (isEditMode) {
      fetcher.get(`/api/user/${id}`)
        .then(res => setFormData(res.data))
        .catch(err => console.error("Failed to load account:", err.message));
    }
  }, [id, isEditMode]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name === "email") {
      const emailRegex = /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/;
      setEmailError(!emailRegex.test(value));
    }

    if (name === "phone") {
      const phoneRegex = /^0\d{9}$/;
      setPhoneError(!phoneRegex.test(value));
    }

    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (emailError || phoneError) {
      alert("Vui lòng kiểm tra lại thông tin nhập.");
      return;
    }

    const apiCall = isEditMode
      ? fetcher.put(`/api/user/update-user/${id}`, formData)
      : fetcher.post("/api/user/create-user", formData);

    apiCall
      .then(() => navigate("/admin/accounts"))
      .catch(err => alert(err.message));
  };

  return (
    <Box p={3} maxWidth="600px" mx="auto">
      <Typography variant="h5" mb={3}>
        {isEditMode ? "Edit Account" : "Add New Account"}
      </Typography>

      {formData.imageUrl && (
        <Box display="flex" justifyContent="center" mb={2}>
          <Avatar
            src={formData.imageUrl}
            alt="avatar preview"
            sx={{ width: 80, height: 80 }}
          />
        </Box>
      )}

      <form onSubmit={handleSubmit}>
        <TextField
          fullWidth
          label="Full Name"
          name="fullName"
          value={formData.fullName}
          onChange={handleChange}
          margin="normal"
          required
        />
        <TextField
          fullWidth
          label="Username"
          name="username"
          value={formData.username}
          onChange={handleChange}
          margin="normal"
          required
        />
        <TextField
          fullWidth
          label="Email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          margin="normal"
          required
          error={emailError}
          helperText={emailError ? "Email không hợp lệ (vd: user@gmail.com)" : ""}
        />
        <TextField
          fullWidth
          label="Phone"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          margin="normal"
          error={phoneError}
          helperText={phoneError ? "Số điện thoại phải có 10 chữ số và bắt đầu bằng 0" : ""}
        />
        <TextField
          fullWidth
          label="Image URL"
          name="imageUrl"
          value={formData.imageUrl}
          onChange={handleChange}
          margin="normal"
        />
        <TextField
          fullWidth
          select
          label="Role"
          name="role"
          value={formData.role}
          onChange={handleChange}
          margin="normal"
        >
          <MenuItem value="Manager">Manager</MenuItem>
          <MenuItem value="Staff">Staff</MenuItem>
        </TextField>
        <FormControlLabel
          control={
            <Switch
              checked={formData.status}
              onChange={handleChange}
              name="status"
            />
          }
          label="Active"
          sx={{ mt: 2 }}
        />

        <Box mt={3} display="flex" justifyContent="space-between">
          <Button variant="outlined" onClick={() => navigate("/admin/accounts")}>Cancel</Button>
          <Button type="submit" variant="contained">{isEditMode ? "Save Changes" : "Create"}</Button>
        </Box>
      </form>
    </Box>
  );
}