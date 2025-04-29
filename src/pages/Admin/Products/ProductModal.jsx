import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Modal,
  TextField,
  Button,
  Grid,
  IconButton,
  Switch,
  FormControlLabel,
  Avatar,
  MenuItem,
} from "@mui/material";
import { Add as AddIcon, Delete as DeleteIcon } from "@mui/icons-material";
import { useDispatch } from "react-redux";
import { createProduct, updateProduct } from "../../../store/slices/itemSlice";

const ProductModal = ({
  open,
  onClose,
  isEditMode,
  product,
  filteredCategories,
  categoryLoading,
  onSubmitSuccess,
    categoryError,
}) => {
  const dispatch = useDispatch();
  const [formData, setFormData] = useState({
    productName: "",
    categoryId: null,
    description: "",
    sizes: [{ size: "Small", price: "0" }],
    status: true,
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [editProductId, setEditProductId] = useState(null);

  // Initialize form data when modal opens
  useEffect(() => {
    if (isEditMode && product) {
      setEditProductId(product.productId);
      const sizes =
        product.variants?.length > 0
          ? product.variants.map((variant) => ({
              size: variant.sizeId || "Small",
              price:
                variant.price !== null && variant.price !== undefined
                  ? variant.price.toString()
                  : "0",
            }))
          : [{ size: "Small", price: "0" }];
      const newFormData = {
        productName: product.productName,
        categoryId: Number(product.categoryId),
        description: product.description || "",
        sizes,
        status: product.status,
      };
      setFormData(newFormData);
      setImagePreview(product.imageUrl || null);
      setImageFile(null);
    } else {
      const newFormData = {
        productName: "",
        categoryId:
          filteredCategories.length > 0
            ? Number(filteredCategories[0].categoryId)
            : null,
        description: "",
        sizes: [{ size: "Small", price: "0" }],
        status: true,
      };
      setFormData(newFormData);
      setImageFile(null);
      setImagePreview(null);
    }
  }, [isEditMode, product, filteredCategories]);

  const handleChange = (e, index = null) => {
    const { name, value } = e.target;
    if (index !== null) {
      setFormData((prev) => {
        const newSizes = [...prev.sizes];
        newSizes[index] = { ...newSizes[index], [name]: value };
        return { ...prev, sizes: newSizes };
      });
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: name === "categoryId" ? Number(value) : value,
      }));
    }
  };

  const handleAddSize = () => {
    setFormData((prev) => ({
      ...prev,
      sizes: [...prev.sizes, { size: "Small", price: "0" }],
    }));
  };

  const handleRemoveSize = (index) => {
    setFormData((prev) => {
      const newSizes = prev.sizes.filter((_, i) => i !== index);
      return {
        ...prev,
        sizes: newSizes.length > 0 ? newSizes : [{ size: "Small", price: "0" }],
      };
    });
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

    const selectedCategory = filteredCategories.find(
      (cat) => cat.categoryId === formData.categoryId
    );
    if (!selectedCategory) {
      alert("Please select a valid category!");
      return;
    }

    if (formData.sizes.length === 0) {
      alert("Please add at least one size!");
      return;
    }

    for (let i = 0; i < formData.sizes.length; i++) {
      const price = parseFloat(formData.sizes[i].price);
      if (isNaN(price) || price < 0) {
        alert(`Price for size ${formData.sizes[i].size} is invalid!`);
        return;
      }
    }

    const formDataToSend = new FormData();
    if (isEditMode) {
      formDataToSend.append("productId", editProductId);
    }
    formDataToSend.append("productName", formData.productName);
    formDataToSend.append("categoryId", formData.categoryId);
    formDataToSend.append("description", formData.description || "");
    formData.sizes.forEach((sizeObj, index) => {
      formDataToSend.append(`sizes[${index}][size]`, sizeObj.size);
      formDataToSend.append(
        `sizes[${index}][price]`,
        parseFloat(sizeObj.price)
      );
    });
    formDataToSend.append("status", formData.status);
    if (imageFile) {
      formDataToSend.append("parentImage", imageFile);
    }

    try {
      if (isEditMode) {
        await dispatch(updateProduct(formDataToSend)).unwrap();
      } else {
        await dispatch(createProduct(formDataToSend)).unwrap();
      }
      onSubmitSuccess();
      onClose();
    } catch (error) {
      alert(error.message || "An error occurred while processing the product!");
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
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
          {isEditMode ? "Update Product" : "Add New Product"}
        </Typography>
        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Product Name"
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
                   value={
                     formData.categoryId !== ""
                       ? formData.categoryId
                       : filteredCategories.length > 0
                       ? filteredCategories[0].categoryId
                       : ""
                   }
                   onChange={(e) => {
                     console.log(
                       "TextField onChange triggered, selected value:",
                       e.target.value
                     );
                     handleChange(e);
                   }}
                   margin="normal"
                   required
                   disabled={categoryLoading}
                 >
                   {categoryLoading ? (
                     <MenuItem value="" disabled>
                       Đang tải danh mục...
                     </MenuItem>
                   ) : categoryError ? (
                     <MenuItem value="" disabled>
                       Lỗi: {categoryError}
                     </MenuItem>
                   ) : filteredCategories.length === 0 ? (
                     <MenuItem value="" disabled>
                       Không có danh mục
                     </MenuItem>
                   ) : (
                     filteredCategories.map((cat) => (
                       <MenuItem key={cat.categoryId} value={Number(cat.categoryId)}>
                         {cat.categoryName}
                       </MenuItem>
                     ))
                   )}
                 </TextField>
          <Typography variant="subtitle1" sx={{ mt: 2, mb: 1 }}>
            Sizes and Prices
          </Typography>
          {formData.sizes.map((sizeObj, index) => (
            <Grid container spacing={2} key={index} sx={{ mb: 2 }}>
              <Grid item xs={5}>
                <TextField
                  select
                  fullWidth
                  label="Size"
                  name="size"
                  value={sizeObj.size}
                  onChange={(e) => handleChange(e, index)}
                  required
                >
                  <MenuItem value="Small">Small</MenuItem>
                  <MenuItem value="Medium">Medium</MenuItem>
                  <MenuItem value="Large">Large</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={5}>
                <TextField
                  fullWidth
                  label="Price (VND)"
                  name="price"
                  type="number"
                  value={sizeObj.price}
                  onChange={(e) => handleChange(e, index)}
                  required
                  inputProps={{ min: 0 }}
                />
              </Grid>
              <Grid item xs={2}>
                <IconButton
                  onClick={() => handleRemoveSize(index)}
                  disabled={formData.sizes.length === 1}
                >
                  <DeleteIcon />
                </IconButton>
              </Grid>
            </Grid>
          ))}
          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={handleAddSize}
            sx={{ mb: 2 }}
          >
            Add Size
          </Button>
          <TextField
            fullWidth
            type="file"
            label="Product Image"
            name="parentImage"
            onChange={handleImageChange}
            margin="normal"
            InputLabelProps={{ shrink: true }}
            inputProps={{ accept: "image/*" }}
          />
          {imagePreview && (
            <Box mt={2} display="flex" justifyContent="center">
              <Avatar
                src={imagePreview}
                alt="Image Preview"
                sx={{ width: 100, height: 100 }}
              />
            </Box>
          )}
          <TextField
            fullWidth
            label="Description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            margin="normal"
            multiline
            rows={3}
          />
          <FormControlLabel
            control={
              <Switch
                checked={formData.status}
                onChange={handleToggleStatus}
                color="primary"
              />
            }
            label="Active Status"
            sx={{ mt: 2 }}
          />
          <Box mt={3} display="flex" gap={2}>
            <Button
              variant="contained"
              type="submit"
              sx={{ backgroundColor: "#8B5E3C" }}
            >
              {isEditMode ? "Save Changes" : "Add Product"}
            </Button>
            <Button variant="outlined" onClick={onClose}>
              Cancel
            </Button>
          </Box>
        </form>
      </Box>
    </Modal>
  );
};

export default ProductModal;