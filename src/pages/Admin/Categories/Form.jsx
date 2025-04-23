import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  TextField,
  Switch,
  Button,
  FormControlLabel,
} from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import mockCategories from "./mockCategories";

export default function CategoryForm() {
  const navigate = useNavigate();
  const { id } = useParams(); // nếu có id → chỉnh sửa
  const isEditMode = Boolean(id);

  const [formData, setFormData] = useState({
    categoryName: "",
    description: "",
    status: true,
  });

  useEffect(() => {
    if (isEditMode) {
      const selected = mockCategories.find((cat) => String(cat.id) === id);
      if (selected) {
        setFormData(selected);
      }
    }
  }, [id, isEditMode]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleToggleStatus = () => {
    setFormData((prev) => ({
      ...prev,
      status: !prev.status,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (isEditMode) {
      console.log("Cập nhật danh mục:", formData);
    } else {
      console.log("Tạo mới danh mục:", formData);
    }

    navigate("/admin/categories");
  };

  return (
    <Box sx={{ p: 3, maxWidth: 600 }}>
      <Typography variant="h6" fontWeight="bold" mb={2}>
        {isEditMode ? "Chỉnh sửa danh mục" : "Thêm danh mục mới"}
      </Typography>

      <form onSubmit={handleSubmit}>
        <TextField
          label="Tên danh mục"
          name="categoryName"
          fullWidth
          required
          value={formData.categoryName}
          onChange={handleChange}
          sx={{ mb: 2 }}
        />
        <TextField
          label="Mô tả"
          name="description"
          fullWidth
          multiline
          rows={3}
          value={formData.description}
          onChange={handleChange}
          sx={{ mb: 2 }}
        />
        <FormControlLabel
          control={
            <Switch
              checked={formData.status}
              onChange={handleToggleStatus}
              color="primary"
            />
          }
          label="Hiển thị"
          sx={{ mb: 3 }}
        />
        <Box display="flex" gap={2}>
          <Button type="submit" variant="contained" color="primary">
            {isEditMode ? "Cập nhật" : "Tạo mới"}
          </Button>
          <Button variant="outlined" onClick={() => navigate("/admin/categories")}>
            Hủy
          </Button>
        </Box>
      </form>
    </Box>
  );
}
