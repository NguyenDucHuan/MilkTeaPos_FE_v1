import React, { useState, useMemo, useEffect } from "react";
import {
  Box,
  Typography,
  Modal,
  TextField,
  Switch,
  FormControlLabel,
  Grid,
  Button,
  Paper,
  IconButton,
  MenuItem,
  CircularProgress,
  Backdrop,
} from "@mui/material";
import {
  Add as AddIcon,
  Remove as RemoveIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";
import { useDispatch, useSelector } from "react-redux";
import { createCombo, updateCombo } from "../../../store/slices/comboSlice";
import { updateImageProduct, listItemApi } from "../../../store/slices/itemSlice";
import toast from "react-hot-toast";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

// Validation schema với Yup
const schema = yup.object().shape({
  ComboName: yup.string().required("Tên combo không được để trống"),
  Description: yup.string().required("Mô tả không được để trống"),
  Price: yup
    .number()
    .typeError("Giá phải là một số")
    .required("Giá không được để trống")
    .min(0, "Giá không được âm"),
  ComboItems: yup
    .array()
    .min(1, "Phải chọn ít nhất một sản phẩm cho combo")
    .required(),
});

export default function ComboModal({
  open,
  onClose,
  isEditMode,
  editComboId,
  initialFormData,
  imagePreview,
  setImagePreview,
  allProducts,
  currentPage,
  pageSize,
}) {
  const dispatch = useDispatch();
  const { isLoading: comboLoading } = useSelector((state) => state.combo);
  const [formData, setFormData] = useState(initialFormData);
  const [selectedCategory, setSelectedCategory] = useState(null);

  // React Hook Form setup
  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
    reset,
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      ComboName: initialFormData.ComboName,
      Description: initialFormData.Description,
      Price: initialFormData.Price,
      Status: initialFormData.Status,
      ComboItems: initialFormData.ComboItems,
    },
  });

  // Đồng bộ initialFormData với form khi mở modal
  useEffect(() => {
    reset({
      ComboName: initialFormData.ComboName,
      Description: initialFormData.Description,
      Price: initialFormData.Price,
      Status: initialFormData.Status,
      ComboItems: initialFormData.ComboItems,
    });
    setFormData(initialFormData);
  }, [initialFormData, reset]);

  // Group products by category
  const productsByCategory = useMemo(() => {
    const grouped = {};
    allProducts.forEach((product) => {
      if (!grouped[product.categoryName]) {
        grouped[product.categoryName] = [];
      }
      grouped[product.categoryName].push(product);
    });
    return grouped;
  }, [allProducts]);

  // Get unique categories
  const categories = useMemo(() => {
    return Object.keys(productsByCategory);
  }, [productsByCategory]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({ ...prev, Image: file }));
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      setImagePreview(null);
      setFormData((prev) => ({ ...prev, Image: null }));
    }
  };

  const handleProductToggle = (productId) => {
    const product = allProducts.find((p) => p.productId === productId);
    const newItem = {
      id: Date.now(),
      productId,
      quantity: 1,
      discount: 0,
      size: product?.variants?.[0]?.sizeId || "Default",
      sizePrice: product?.variants?.[0]?.price || 0,
      toppings: [],
    };
    setFormData((prev) => ({
      ...prev,
      ComboItems: [...prev.ComboItems, newItem],
    }));
    setValue("ComboItems", [...formData.ComboItems, newItem]);
  };

  const handleRemoveItem = (itemId) => {
    setFormData((prev) => ({
      ...prev,
      ComboItems: prev.ComboItems.filter((item) => item.id !== itemId),
    }));
    setValue(
      "ComboItems",
      formData.ComboItems.filter((item) => item.id !== itemId)
    );
  };

  const handleSizeChange = (itemId, size, price) => {
    setFormData((prev) => ({
      ...prev,
      ComboItems: prev.ComboItems.map((item) =>
        item.id === itemId ? { ...item, size, sizePrice: price } : item
      ),
    }));
    setValue("ComboItems", formData.ComboItems);
  };

  const handleQuantityChange = (itemId, change) => {
    setFormData((prev) => ({
      ...prev,
      ComboItems: prev.ComboItems.map((item) => {
        if (item.id === itemId) {
          const newQuantity = Math.max(1, item.quantity + change);
          return { ...item, quantity: newQuantity };
        }
        return item;
      }),
    }));
    setValue("ComboItems", formData.ComboItems);
  };

  const handleToggleStatus = () => {
    setFormData((prev) => ({
      ...prev,
      Status: !prev.Status,
    }));
    setValue("Status", !formData.Status);
  };

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
  };

  const onSubmit = async (data) => {
    const formDataToSend = new FormData();
    if (isEditMode) {
      formDataToSend.append("productName", data.ComboName);
      formDataToSend.append("productId", editComboId);
      formDataToSend.append("Prize", data.Price); // Note: Confirm if "Prize" is correct
    } else {
      formDataToSend.append("ComboName", data.ComboName);
      formDataToSend.append("Price", data.Price);
      if (formData.Image) {
        formDataToSend.append("image", formData.Image);
      }
    }
    formDataToSend.append("description", data.Description || "");
    formDataToSend.append("status", data.Status.toString());
    formDataToSend.append("categoryId", formData.categoryId);

    data.ComboItems.forEach((item, index) => {
      formDataToSend.append(`ComboItems[${index}][productId]`, item.productId);
      formDataToSend.append(`ComboItems[${index}][quantity]`, item.quantity);
      formDataToSend.append(`ComboItems[${index}][discount]`, item.discount);
      formDataToSend.append(`ComboItems[${index}][size]`, item.size);
      formDataToSend.append(`ComboItems[${index}][sizePrice]`, item.sizePrice);
      if (item.toppings && item.toppings.length > 0) {
        item.toppings.forEach((topping, tIndex) => {
          formDataToSend.append(
            `ComboItems[${index}][toppings][${tIndex}][toppingId]`,
            topping.toppingId
          );
          formDataToSend.append(
            `ComboItems[${index}][toppings][${tIndex}][quantity]`,
            topping.quantity
          );
        });
      }
    });

    try {
      console.log("formDataToSend before submit:", Object.fromEntries(formDataToSend));

      // Handle image update in edit mode
      if (isEditMode && formData.Image) {
        const imageFormData = new FormData();
        imageFormData.append("formFile", formData.Image);
        const imageResponse = await dispatch(
          updateImageProduct({ productId: editComboId, formData: imageFormData })
        ).unwrap();
        console.log("updateImageProduct response:", imageResponse);
      }

      // Handle combo create or update
      if (isEditMode) {
        const updateResponse = await dispatch(updateCombo(formDataToSend)).unwrap();
        console.log("updateCombo response:", updateResponse);
        toast.success("Combo đã được cập nhật thành công!");
      } else {
        const createResponse = await dispatch(createCombo(formDataToSend)).unwrap();
        console.log("createCombo response:", createResponse);
        toast.success("Combo đã được tạo thành công!");
      }

      // Refresh combo list and wait for completion
      await dispatch(listItemApi({ Page: currentPage, PageSize: pageSize })).unwrap();
      onClose();
    } catch (error) {
      console.error("Error submitting combo:", error);
      toast.error(
        error.message || "Có lỗi xảy ra khi xử lý combo. Vui lòng thử lại!"
      );
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
          width: { xs: "90%", md: 900 },
          bgcolor: "white",
          boxShadow: 24,
          p: 4,
          borderRadius: 2,
          maxHeight: "90vh",
          overflowY: "auto",
        }}
      >
        {comboLoading && (
          <Backdrop
            sx={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              bgcolor: "rgba(0, 0, 0, 0.2)",
              zIndex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
            open={comboLoading}
          >
            <CircularProgress sx={{ color: "#8B5E3C" }} />
          </Backdrop>
        )}
        <Typography
          variant="h5"
          fontWeight="bold"
          color="#333"
          gutterBottom
          sx={{ borderBottom: "2px solid #8B5E3C", pb: 1 }}
        >
          {isEditMode ? "Cập nhật Combo" : "Thêm Combo Mới"}
        </Typography>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Controller
                name="ComboName"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Tên Combo"
                    margin="normal"
                    required
                    variant="outlined"
                    disabled={comboLoading}
                    error={!!errors.ComboName}
                    helperText={errors.ComboName?.message}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 1,
                        "&:hover fieldset": { borderColor: "#8B5E3C" },
                        "&.Mui-focused fieldset": { borderColor: "#8B5E3C" },
                      },
                    }}
                  />
                )}
              />
              <Controller
                name="Description"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Mô tả"
                    margin="normal"
                    multiline
                    rows={3}
                    variant="outlined"
                    disabled={comboLoading}
                    error={!!errors.Description}
                    helperText={errors.Description?.message}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 1,
                        "&:hover fieldset": { borderColor: "#8B5E3C" },
                        "&.Mui-focused fieldset": { borderColor: "#8B5E3C" },
                      },
                    }}
                  />
                )}
              />
              <Controller
                name="Price"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Giá (VND)"
                    type="number"
                    margin="normal"
                    required
                    inputProps={{ min: 0 }}
                    variant="outlined"
                    disabled={comboLoading}
                    error={!!errors.Price}
                    helperText={errors.Price?.message}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 1,
                        "&:hover fieldset": { borderColor: "#8B5E3C" },
                        "&.Mui-focused fieldset": { borderColor: "#8B5E3C" },
                      },
                    }}
                  />
                )}
              />
              <Controller
                name="Status"
                control={control}
                render={({ field }) => (
                  <FormControlLabel
                    control={
                      <Switch
                        {...field}
                        checked={field.value}
                        onChange={(e) => {
                          field.onChange(e);
                          handleToggleStatus();
                        }}
                        color="primary"
                        disabled={comboLoading}
                        sx={{
                          "& .MuiSwitch-switchBase.Mui-checked": {
                            color: "#8B5E3C",
                          },
                          "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
                            bgcolor: "#8B5E3C",
                          },
                        }}
                      />
                    }
                    label="Trạng thái Kích hoạt"
                    sx={{ mt: 2, color: "#555" }}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Hình ảnh
                </Typography>
                <input
                  accept="image/*"
                  type="file"
                  onChange={handleImageChange}
                  style={{ display: "none" }}
                  id="image-upload"
                  disabled={comboLoading}
                />
                <label htmlFor="image-upload">
                  <Button
                    variant="outlined"
                    component="span"
                    fullWidth
                    sx={{ mb: 2 }}
                    disabled={comboLoading}
                  >
                    Chọn ảnh
                  </Button>
                </label>
                {imagePreview && (
                  <Box
                    component="img"
                    src={imagePreview}
                    alt="Preview"
                    sx={{
                      width: "100%",
                      height: "200px",
                      objectFit: "cover",
                      borderRadius: 1,
                    }}
                  />
                )}
              </Box>
            </Grid>
            <Grid item xs={12}>
              {errors.ComboItems && (
                <Typography color="error" sx={{ mb: 2 }}>
                  {errors.ComboItems.message}
                </Typography>
              )}
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" sx={{ mb: 2, color: "#8B5E3C" }}>
                  Chọn danh mục
                </Typography>
                <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                  <Button
                    variant={selectedCategory === null ? "contained" : "outlined"}
                    onClick={() => handleCategoryChange(null)}
                    sx={{
                      bgcolor: selectedCategory === null ? "#8B5E3C" : "transparent",
                      color: selectedCategory === null ? "white" : "#8B5E3C",
                      borderColor: "#8B5E3C",
                      "&:hover": {
                        bgcolor: selectedCategory === null ? "#70482F" : "#f5f5f5",
                      },
                      WebkitBoxSizing: "border-box",
                    }}
                    disabled={comboLoading}
                  >
                    Tất cả
                  </Button>
                  {categories.map((category) => (
                    <Button
                      key={category}
                      variant={
                        selectedCategory === category ? "contained" : "outlined"
                      }
                      onClick={() => handleCategoryChange(category)}
                      sx={{
                        bgcolor:
                          selectedCategory === category ? "#8B5E3C" : "transparent",
                        color:
                          selectedCategory === category ? "white" : "#8B5E3C",
                        borderColor: "#8B5E3C",
                        "&:hover": {
                          bgcolor:
                            selectedCategory === category ? "#70482F" : "#f5f5f5",
                        },
                        WebkitBoxSizing: "border-box",
                      }}
                      disabled={comboLoading}
                    >
                      {category}
                    </Button>
                  ))}
                </Box>
              </Box>
            </Grid>
            <Grid item xs={12}>
              <Grid container spacing={2}>
                {(selectedCategory
                  ? productsByCategory[selectedCategory]
                  : allProducts
                ).map((product) => (
                  <Grid item xs={12} sm={6} md={4} key={product.productId}>
                    <Paper
                      sx={{
                        p: 2,
                        border: "1px solid",
                        borderColor: "divider",
                        borderRadius: 1,
                        height: "100%",
                        display: "flex",
                        flexDirection: "column",
                      }}
                    >
                      <Box
                        sx={{
                          width: "100%",
                          height: 200,
                          mb: 2,
                          overflow: "hidden",
                          borderRadius: 1,
                        }}
                      >
                        <img
                          src={product.imageUrl || "/placeholder-image.jpg"}
                          alt={product.productName}
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                          }}
                        />
                      </Box>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="subtitle1" gutterBottom>
                          {product.productName}
                        </Typography>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ mb: 2 }}
                        >
                          {product.description}
                        </Typography>
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={() => handleProductToggle(product.productId)}
                          fullWidth
                          disabled={comboLoading}
                        >
                          Thêm vào combo
                        </Button>
                      </Box>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </Grid>
            <Grid item xs={12}>
              <Box sx={{ mt: 3 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Sản phẩm đã chọn
                </Typography>
                <Grid container spacing={2}>
                  {formData.ComboItems.map((item) => {
                    const product = allProducts.find(
                      (p) => p.productId === item.productId
                    );
                    return (
                      <Grid item xs={12} sm={6} md={4} key={item.id}>
                        <Paper
                          sx={{
                            p: 2,
                            border: "1px solid",
                            borderColor: "primary.main",
                            borderRadius: 1,
                            height: "100%",
                            display: "flex",
                            flexDirection: "column",
                          }}
                        >
                          <Box
                            sx={{
                              width: "100%",
                              height: 150,
                              mb: 2,
                              overflow: "hidden",
                              borderRadius: 1,
                            }}
                          >
                            <img
                              src={product?.imageUrl || "/placeholder-image.jpg"}
                              alt={product?.productName}
                              style={{
                                width: "100%",
                                height: "100%",
                                objectFit: "cover",
                              }}
                            />
                          </Box>
                          <Box sx={{ flex: 1 }}>
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 1,
                                mb: 1,
                              }}
                            >
                              <IconButton
                                size="small"
                                onClick={() => handleRemoveItem(item.id)}
                                sx={{ color: "error.main" }}
                                disabled={comboLoading}
                              >
                                <DeleteIcon />
                              </IconButton>
                              <Typography variant="subtitle1">
                                {product?.productName}
                              </Typography>
                            </Box>
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 2,
                                mb: 2,
                              }}
                            >
                              <TextField
                                select
                                size="small"
                                value={item.size}
                                onChange={(e) => {
                                  const variant = product?.variants?.find(
                                    (v) => v.sizeId === e.target.value
                                  );
                                  handleSizeChange(
                                    item.id,
                                    e.target.value,
                                    variant?.price || 0
                                  );
                                }}
                                sx={{ minWidth: 120 }}
                                disabled={comboLoading}
                              >
                                {product?.variants?.map((variant) => (
                                  <MenuItem
                                    key={variant.sizeId}
                                    value={variant.sizeId}
                                  >
                                    {variant.sizeId}
                                  </MenuItem>
                                ))}
                              </TextField>
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 1,
                                }}
                              >
                                <IconButton
                                  size="small"
                                  onClick={() => handleQuantityChange(item.id, -1)}
                                  disabled={comboLoading}
                                >
                                  <RemoveIcon />
                                </IconButton>
                                <Typography>{item.quantity}</Typography>
                                <IconButton
                                  size="small"
                                  onClick={() => handleQuantityChange(item.id, 1)}
                                  disabled={comboLoading}
                                >
                                  <AddIcon />
                                </IconButton>
                              </Box>
                            </Box>
                          </Box>
                        </Paper>
                      </Grid>
                    );
                  })}
                </Grid>
              </Box>
            </Grid>
          </Grid>
          <Box mt={3} display="flex" gap={2} justifyContent="flex-end">
            <Button
              variant="contained"
              type="submit"
              disabled={comboLoading}
              sx={{
                bgcolor: "#8B5E3C",
                "&:hover": { bgcolor: "#70482F" },
                borderRadius: 1,
                textTransform: "none",
                fontWeight: "bold",
                px: 3,
              }}
            >
              {comboLoading
                ? "Đang xử lý..."
                : isEditMode
                ? "Lưu Thay Đổi"
                : "Thêm Combo"}
            </Button>
            <Button
              variant="outlined"
              onClick={onClose}
              disabled={comboLoading}
              sx={{
                borderColor: "#8B5E3C",
                color: "#8B5E3C",
                "&:hover": { borderColor: "#70482F", color: "#70482F" },
                borderRadius: 1,
                textTransform: "none",
                px: 3,
              }}
            >
              Hủy
            </Button>
          </Box>
        </form>
      </Box>
    </Modal>
  );
}
