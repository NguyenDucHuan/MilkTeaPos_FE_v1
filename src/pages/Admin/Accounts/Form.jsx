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
    // ... (kiểm tra lỗi email/phone, setLoading) ...
    if (!initialDataLoaded && isEditMode) {
      alert("Data is still loading, please wait.");
      return;
    }
    if (emailError || phoneError) {
      alert("Please correct the errors in the form.");
      return;
    }
    setLoading(true);

    // ----- SỬA CÁCH CHUẨN BỊ DATA -----
    // 1. Tạo đối tượng FormData
    const formDataApi = new FormData();

    // 2. Append các trường từ state formData vào formDataApi
    // Lưu ý: Tên key phải khớp với thuộc tính trong UpdateUserRequest của backend
    formDataApi.append('FullName', formData.fullName);
    formDataApi.append('Username', formData.username); // Backend có cho update username không? Nếu không thì bỏ dòng này
    formDataApi.append('Email', formData.email);
    formDataApi.append('Phone', formData.phone || ''); // Gửi chuỗi rỗng nếu phone null/undefined
    formDataApi.append('Role', formData.role);
    formDataApi.append('Status', String(formData.status)); // Chuyển boolean thành string "true"/"false"

    // 3. Chỉ append file ảnh NẾU người dùng đã chọn file MỚI
    // formData.imageFile là state chứa File object từ input
    if (formData.imageFile instanceof File) {
      // Key "avatarFile" phải khớp với tên tham số IFormFile trong Controller
      formDataApi.append('avatarFile', formData.imageFile);
      console.log('Appending new avatarFile:', formData.imageFile.name);
    } else {
      console.log('No new avatar file selected.');
      // Không cần append gì nếu không có file mới, backend sẽ tự xử lý giữ ảnh cũ
    }

    console.log(`Submitting FormData (${isEditMode ? 'Edit' : 'Create'})...`);
    // Log FormData content (chỉ hiển thị key, không hiển thị File trực tiếp)
    for (let [key, value] of formDataApi.entries()) {
      console.log(`  ${key}: ${value instanceof File ? `File(${value.name})` : value}`);
    }
    console.log(`Target User ID for PUT: ${id}`);
    // ----------------------------------


    // Gọi API với formDataApi
    // Axios sẽ tự động đặt Content-Type là multipart/form-data khi data là FormData
    const apiCall = isEditMode
      // Truyền formDataApi làm data body
      ? fetcher.put(`/user/update-user/${id}`, formDataApi)
      // Create user có thể cũng cần FormData nếu có avatarFile
      // Nếu API CreateUser cũng nhận [FromForm], bạn cần sửa tương tự
      : fetcher.post("/user/create-user", formDataApi); // Giả sử create cũng dùng FormData

    apiCall
      .then(() => {
        // ... xử lý thành công ...
        console.log(isEditMode ? "Account updated successfully!" : "Account created successfully!");
        alert(isEditMode ? "Account updated successfully!" : "Account created successfully!");
        navigate("/admin/accounts");
      })
      .catch(err => {
        // ... xử lý lỗi ...
        console.error("Failed to save account:", err?.message || err, err.response);
        const serverErrorMessage = err.response?.data?.message || err.message || 'Unknown error';
        // Lỗi 500 thường không có message rõ ràng từ data, cần xem log backend
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