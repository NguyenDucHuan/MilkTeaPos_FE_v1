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
import { createProduct, updateProduct, updateImageProduct } from "../../../store/slices/itemSlice";
import toast from "react-hot-toast";

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
    sizes: [{ size: "Small", price: "0", status: true }],
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
              productId: variant.productId,
              size: variant.sizeId || "Small",
              price:
                variant.price !== null && variant.price !== undefined
                  ? variant.price.toString()
                  : "0",
              status: variant.status !== undefined ? variant.status : true,
            }))
          : [{ size: "Small", price: "0", status: true }];
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
      setEditProductId(null);
      const newFormData = {
        productName: "",
        categoryId:
          filteredCategories.length > 0
            ? Number(filteredCategories[0].categoryId)
            : null,
        description: "",
        sizes: [{ size: "Small", price: "0", status: true }],
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
        if (name === "status") {
          newSizes[index] = { ...newSizes[index], [name]: value === "true" };
        } else {
          newSizes[index] = { ...newSizes[index], [name]: value };
        }
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
      sizes: [...prev.sizes, { size: "Small", price: "0", status: true }],
    }));
  };

  const handleRemoveSize = (index) => {
    setFormData((prev) => {
      const newSizes = prev.sizes.filter((_, i) => i !== index);
      return {
        ...prev,
        sizes: newSizes.length > 0 ? newSizes : [{ size: "Small", price: "0", status: true }],
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
      toast.error("Vui lòng chọn danh mục hợp lệ!");
      return;
    }

    if (formData.sizes.length === 0) {
      toast.error("Vui lòng thêm ít nhất một kích thước!");
      return;
    }

    for (let i = 0; i < formData.sizes.length; i++) {
      const price = parseFloat(formData.sizes[i].price);
      if (isNaN(price) || price < 0) {
        toast.error(`Giá cho kích thước ${formData.sizes[i].size} không hợp lệ!`);
        return;
      }
    }

    const formDataToSend = new FormData();
    formDataToSend.append("productName", formData.productName);
    formDataToSend.append("categoryId", formData.categoryId);
    formDataToSend.append("description", formData.description || "");
    formDataToSend.append("status", formData.status.toString());

    if (!isEditMode) {
      // Create product
      formData.sizes.forEach((sizeObj, index) => {
        formDataToSend.append(`sizes[${index}][size]`, sizeObj.size);
        formDataToSend.append(`sizes[${index}][price]`, sizeObj.price.toString());
        formDataToSend.append(`sizes[${index}][status]`, sizeObj.status.toString());
      });
      if (imageFile) {
        formDataToSend.append("parentImage", imageFile);
      }
    } else {
      // Update product
      if (!editProductId) {
        toast.error("Không tìm thấy ProductId để cập nhật!");
        return;
      }
      formData.sizes.forEach((sizeObj, index) => {
        if (sizeObj.productId) {
          formDataToSend.append(`Variants[${index}].ProductId`, sizeObj.productId.toString());
        }
        formDataToSend.append(`Variants[${index}].SizeId`, sizeObj.size);
        formDataToSend.append(`Variants[${index}].Prize`, sizeObj.price.toString());
        formDataToSend.append(`Variants[${index}].Status`, sizeObj.status.toString());
        formDataToSend.append(`Variants[${index}].Description`, formData.description || "");
      });
      formDataToSend.append("ProductId", editProductId);
      if (imageFile) {
        formDataToSend.append("parentImage", imageFile);
      }
    }

    try {
      console.log("formDataToSend before submit:", Object.fromEntries(formDataToSend));
      if (!isEditMode) {
        const createResponse = await dispatch(createProduct(formDataToSend)).unwrap();
        console.log("createProduct response:", createResponse);
        toast.success("Sản phẩm đã được tạo thành công!");
      } else {
        const updateResponse = await dispatch(updateProduct({ productId: editProductId, formData: formDataToSend })).unwrap();
        console.log("updateProduct response:", updateResponse);
        if (imageFile) {
          const imageFormData = new FormData();
          imageFormData.append("formFile", imageFile);
          const imageResponse = await dispatch(updateImageProduct({ productId: editProductId, formData: imageFormData })).unwrap();
          console.log("updateImageProduct response:", imageResponse);
        }
        toast.success("Sản phẩm đã được cập nhật thành công!");
      }
      onSubmitSuccess();
      onClose();
    } catch (error) {
      console.error("Submit error:", error);
      toast.error(error.message || "Có lỗi xảy ra khi xử lý sản phẩm!");
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
            onChange={handleChange}
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
              <Grid item xs={4}>
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
              <Grid item xs={3}>
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
              <Grid item xs={3}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={sizeObj.status}
                      onChange={(e) =>
                        handleChange(
                          { target: { name: "status", value: e.target.checked.toString() } },
                          index
                        )
                      }
                      color="primary"
                    />
                  }
                  label="Active"
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