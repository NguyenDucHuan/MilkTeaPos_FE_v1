import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  MenuItem,
  Switch,
  FormControlLabel,
} from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import mockProducts from "./mockProducts";
import mockCategories from "../Categories/mockCategories";

export default function ProductForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = Boolean(id);

  const [formData, setFormData] = useState({
    productName: "",
    categoryId: "",
    description: "",
    price: "",
    status: true,
  });

  useEffect(() => {
    if (isEditMode) {
      const productToEdit = mockProducts.find(
        (product) => product.id === parseInt(id)
      );
      if (productToEdit) {
        setFormData({
          productName: productToEdit.productName,
          categoryId: productToEdit.categoryId,
          description: productToEdit.description,
          price: productToEdit.price,
          status: productToEdit.status,
        });
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
    console.log("Submitted Data:", formData);
    navigate("/admin/products");
  };

  return (
    <Box sx={{ padding: 3 }}>
      <Typography variant="h5" fontWeight="bold" gutterBottom>
        {isEditMode ? "Cập nhật sản phẩm" : "Thêm sản phẩm mới"}
      </Typography>

      <Paper sx={{ padding: 3 }}>
        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Tên sản phẩm"
            name="productName"
            value={formData.productName}
            onChange={handleChange}
            margin="normal"
            required
          />

          <TextField
            select
            fullWidth
            label="Danh mục"
            name="categoryId"
            value={formData.categoryId}
            onChange={handleChange}
            margin="normal"
            required
          >
            {mockCategories.map((cat) => (
              <MenuItem key={cat.id} value={cat.id}>
                {cat.categoryName}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            fullWidth
            label="Mô tả"
            name="description"
            value={formData.description}
            onChange={handleChange}
            margin="normal"
            multiline
            rows={3}
          />

          <TextField
            fullWidth
            label="Giá sản phẩm (VND)"
            name="price"
            type="number"
            value={formData.price}
            onChange={handleChange}
            margin="normal"
            required
          />

          <FormControlLabel
            control={
              <Switch
                checked={formData.status}
                onChange={handleToggleStatus}
                color="primary"
              />
            }
            label="Trạng thái kích hoạt"
            sx={{ mt: 2 }}
          />

          <Box mt={3} display="flex" gap={2}>
            <Button
              variant="contained"
              type="submit"
              sx={{ backgroundColor: "#8B5E3C" }}
            >
              {isEditMode ? "Lưu thay đổi" : "Thêm mới"}
            </Button>
            <Button variant="outlined" onClick={() => navigate("/admin/products")}>
              Hủy
            </Button>
          </Box>
        </form>
      </Paper>
    </Box>
  );
}
