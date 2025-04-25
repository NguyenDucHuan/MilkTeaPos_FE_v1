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

  // --- Sửa lại state loading và thêm initialDataLoaded ---
  const [loading, setLoading] = useState(isEditMode); // Bắt đầu loading nếu là edit mode
  const [initialDataLoaded, setInitialDataLoaded] = useState(!isEditMode);

  useEffect(() => {
    if (isEditMode) {
      setLoading(true);
      setInitialDataLoaded(false);
    }

    if (isEditMode) {
      fetcher.get('/user/id', { params: { id: id } }) // Đường dẫn cố định, ID trong params
        .then(res => {
          console.log("Fetched account data:", res.data);
          const fetchedData = res.data;
          setFormData({
            fullName: fetchedData.fullName || "",
            username: fetchedData.username || "",
            email: fetchedData.email || "",
            phone: fetchedData.phone || "",
            imageUrl: fetchedData.imageUrl || "",
            role: fetchedData.role || "Staff",
            status: fetchedData.status !== undefined ? fetchedData.status : true,
          });
          setInitialDataLoaded(true); // Đánh dấu đã load xong
        })
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

    const dataToSend = { ...formData }; // <-- Phải có dòng này!
    // ---------------------------------------------------------
    console.log(`Submitting data (${isEditMode ? 'Edit' : 'Create'}):`, dataToSend);
    console.log(`Target User ID for PUT: ${id}`);

    // ----- SỬA LẠI ĐƯỜNG DẪN PUT Ở ĐÂY -----
    const apiCall = isEditMode
      ? fetcher.put(`/user/update-user/${id}`, dataToSend) // Bỏ /api ở đầu
      : fetcher.post("/user/create-user", dataToSend);   

    apiCall
      .then(() => {
        console.log(isEditMode ? "Account updated successfully!" : "Account created successfully!");
        alert(isEditMode ? "Account updated successfully!" : "Account created successfully!");
        navigate("/admin/accounts");
      })
      .catch(err => {
        console.error("Failed to save account:", err?.message || err);
        // Hiển thị lỗi chi tiết hơn nếu có từ err.response.data
        const serverErrorMessage = err.response?.data?.message || err.message || 'Unknown error';
        alert(`Failed to save account: ${serverErrorMessage}`);
      })
      .finally(() => setLoading(false));
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