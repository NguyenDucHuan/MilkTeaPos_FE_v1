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
import fetcher from "../../../apis/fetcher"; // Đảm bảo đường dẫn đúng

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
    role: "Staff", // Giá trị mặc định khi thêm mới
    status: true, // Giá trị mặc định khi thêm mới
    // Không cần password ở đây trừ khi bạn muốn cho phép đặt/thay đổi pw
  });

  const [emailError, setEmailError] = useState(false);
  const [phoneError, setPhoneError] = useState(false);
  const [loading, setLoading] = useState(false); // Thêm state loading
  const [initialDataLoaded, setInitialDataLoaded] = useState(!isEditMode); // Theo dõi đã load data edit chưa

  useEffect(() => {
    if (isEditMode) {
      setLoading(true); // Bắt đầu loading khi fetch data edit
      console.log(`Fetching data for user ID: ${id}`);
      fetcher.get(`/user/${id}`) // Bỏ /api
        .then(res => {
          console.log("Fetched account data:", res.data);
          // Chỉ cập nhật những trường có trong state ban đầu để tránh lỗi không kiểm soát
          const fetchedData = res.data;
          setFormData({
              fullName: fetchedData.fullName || "",
              username: fetchedData.username || "",
              email: fetchedData.email || "",
              phone: fetchedData.phone || "",
              imageUrl: fetchedData.imageUrl || "",
              role: fetchedData.role || "Staff",
              status: fetchedData.status !== undefined ? fetchedData.status : true, // Xử lý status boolean
          });
          setInitialDataLoaded(true); // Đánh dấu đã load xong
        })
        .catch(err => {
          console.error("Failed to load account:", err?.message || err);
          alert(`Failed to load account data: ${err?.message || 'Unknown error'}`);
          // Có thể điều hướng về list nếu không load được
          // navigate("/admin/accounts");
        })
        .finally(() => setLoading(false)); // Kết thúc loading
    }
  }, [id, isEditMode]); // Chỉ chạy khi id hoặc isEditMode thay đổi

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name === "email") {
      const emailRegex = /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/;
      setEmailError(!emailRegex.test(value) && value !== ""); // Chỉ báo lỗi nếu không rỗng và sai định dạng
    }

    if (name === "phone") {
      // Cho phép rỗng hoặc đúng định dạng 10 số bắt đầu bằng 0
      const phoneRegex = /^0\d{9}$/;
      setPhoneError(value !== "" && !phoneRegex.test(value));
    }

    setFormData(prev => ({
      ...prev,
      [name]: type === "switch" ? checked : value, // Sửa type check cho Switch
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!initialDataLoaded && isEditMode) {
       alert("Data is still loading, please wait.");
       return;
    }
    if (emailError || phoneError) {
      alert("Please correct the errors in the form.");
      return;
    }
    setLoading(true); // Bắt đầu loading khi submit

    // Lọc bỏ các trường không cần thiết hoặc xử lý password nếu có
    const dataToSend = { ...formData };
    // Ví dụ: nếu không cho sửa username khi edit
    // if (isEditMode) delete dataToSend.username;

    console.log(`Submitting data (${isEditMode ? 'Edit' : 'Create'}):`, dataToSend);

    const apiCall = isEditMode
      ? fetcher.put(`/user/update-user/${id}`, dataToSend) // Bỏ /api
      : fetcher.post("/user/create-user", dataToSend); // Bỏ /api

    apiCall
      .then(() => {
        console.log(isEditMode ? "Account updated successfully!" : "Account created successfully!");
        alert(isEditMode ? "Account updated successfully!" : "Account created successfully!"); // Thêm thông báo
        navigate("/admin/accounts"); // Điều hướng sau khi thành công
      })
      .catch(err => {
        console.error("Failed to save account:", err?.message || err);
        alert(`Failed to save account: ${err?.message || 'Unknown error'}`);
      })
      .finally(() => setLoading(false)); // Kết thúc loading
  };

  // Hiển thị loading hoặc form
   if (loading && isEditMode && !initialDataLoaded) {
     return <Typography p={3}>Loading account data...</Typography>;
   }


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
          disabled={loading}
        />
        <TextField
          fullWidth
          label="Username"
          name="username"
          value={formData.username}
          onChange={handleChange}
          margin="normal"
          required
          disabled={loading || isEditMode} // Không cho sửa username khi edit?
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
          helperText={emailError ? "Invalid email format (e.g., user@example.com)" : ""}
          disabled={loading}
        />
        <TextField
          fullWidth
          label="Phone"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          margin="normal"
          error={phoneError}
          helperText={phoneError ? "Phone must be 10 digits starting with 0" : ""}
          disabled={loading}
        />
        <TextField
          fullWidth
          label="Image URL"
          name="imageUrl"
          value={formData.imageUrl}
          onChange={handleChange}
          margin="normal"
           disabled={loading}
        />
        {/* Thêm trường Password nếu tạo mới và muốn đặt mật khẩu */}
        {/* {!isEditMode && (
          <TextField
            fullWidth
            label="Password"
            name="password"
            type="password"
            // value={formData.password} // Cần thêm password vào state
            onChange={handleChange}
            margin="normal"
            required
            disabled={loading}
          />
        )} */}
        <TextField
          fullWidth
          select
          label="Role"
          name="role"
          value={formData.role}
          onChange={handleChange}
          margin="normal"
           disabled={loading}
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
               disabled={loading}
            />
          }
          label="Active"
          sx={{ mt: 2 }}
        />

        <Box mt={3} display="flex" justifyContent="space-between">
          <Button variant="outlined" onClick={() => navigate("/admin/accounts")} disabled={loading}>Cancel</Button>
          <Button type="submit" variant="contained" disabled={loading || emailError || phoneError}>
            {loading ? 'Saving...' : (isEditMode ? "Save Changes" : "Create")}
          </Button>
        </Box>
      </form>
    </Box>
  );
}