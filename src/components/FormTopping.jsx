import React, { useState } from "react";
import {
  Box,
  Button,
  TextField,
  FormControlLabel,
  Switch,
  Typography,
  Modal,
} from "@mui/material";
import { useDispatch } from "react-redux";
import { createExtraProduct } from "../store/slices/itemSlice";

export default function FormTopping({ open, handleClose }) {
  const dispatch = useDispatch();
  const [formData, setFormData] = useState({
    productName: "",
    description: "",
    price: "",
    status: true,
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "price" ? parseFloat(value) : value,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      setImageFile(null);
      setImagePreview(null);
    }
  };

  const handleToggleStatus = () => {
    setFormData((prev) => ({
      ...prev,
      status: !prev.status,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.productName.trim()) {
      alert("Vui lòng nhập tên topping!");
      return;
    }

    if (isNaN(formData.price) || formData.price <= 0) {
      alert("Vui lòng nhập giá hợp lệ!");
      return;
    }

    const formDataToSend = new FormData();
    formDataToSend.append("ProductName", formData.productName);
    formDataToSend.append("Description", formData.description || "");
    formDataToSend.append("Price", formData.price);
    formDataToSend.append("Status", formData.status);
    if (imageFile) {
      formDataToSend.append("Image", imageFile);
    }

    try {
      const resultAction = await dispatch(createExtraProduct(formDataToSend));
      if (createExtraProduct.fulfilled.match(resultAction)) {
        alert("Thêm topping thành công!");
        handleClose();
        // Reset form
        setFormData({
          productName: "",
          description: "",
          price: "",
          status: true,
        });
        setImageFile(null);
        setImagePreview(null);
      } else {
        throw new Error(resultAction.payload?.message || "Không thể thêm topping");
      }
    } catch (error) {
      console.error("Error creating topping:", error);
      alert(error.message || "Có lỗi xảy ra khi thêm topping!");
    }
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
    >
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 500,
          bgcolor: "background.paper",
          boxShadow: 24,
          p: 4,
          borderRadius: 2,
        }}
      >
        <Typography variant="h6" fontWeight="bold" gutterBottom>
          Thêm Topping mới
        </Typography>
        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Tên topping"
            name="productName"
            value={formData.productName}
            onChange={handleChange}
            margin="normal"
            required
          />
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
            label="Giá (VND)"
            name="price"
            type="number"
            value={formData.price}
            onChange={handleChange}
            margin="normal"
            required
            inputProps={{ min: 0 }}
          />
          <TextField
            fullWidth
            type="file"
            label="Hình ảnh"
            name="image"
            onChange={handleImageChange}
            margin="normal"
            InputLabelProps={{ shrink: true }}
            inputProps={{ accept: "image/*" }}
          />
          {imagePreview && (
            <Box mt={2} display="flex" justifyContent="center">
              <img
                src={imagePreview}
                alt="Preview"
                style={{ maxWidth: "100%", maxHeight: 200 }}
              />
            </Box>
          )}
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
              Thêm mới
            </Button>
            <Button variant="outlined" onClick={handleClose}>
              Hủy
            </Button>
          </Box>
        </form>
      </Box>
    </Modal>
  );
} 