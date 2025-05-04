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
import {
  createProduct,
  updateProduct,
  updateImageProduct,
} from "../../../store/slices/itemSlice";
import toast from "react-hot-toast";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

// Danh sách kích thước khả dụng
const AVAILABLE_SIZES = ["Small", "Medium", "Large"];

// Validation schema với Yup
const schema = yup.object().shape({
  productName: yup.string().required("Tên sản phẩm không được để trống"),
  categoryId: yup
    .number()
    .required("Danh mục không được để trống")
    .typeError("Vui lòng chọn danh mục hợp lệ"),
  description: yup.string().nullable(),
  sizes: yup
    .array()
    .of(
      yup.object().shape({
        size: yup.string().required("Kích thước không được để trống"),
        price: yup
          .number()
          .typeError("Giá phải là một số")
          .required("Giá không được để trống")
          .min(0, "Giá không được âm"),
        status: yup.boolean(),
      })
    )
    .min(1, "Phải có ít nhất một kích thước"),
  status: yup.boolean(),
});

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
      productName: "",
      categoryId:
        filteredCategories.length > 0
          ? Number(filteredCategories[0].categoryId)
          : null,
      description: "",
      sizes: [{ size: "Small", price: "0", status: true }],
      status: true,
    },
  });

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
        productName: product.productName || "",
        categoryId: Number(product.categoryId) || null,
        description: product.description || "",
        sizes,
        status: product.status !== undefined ? product.status : true,
      };
      setFormData(newFormData);
      setImagePreview(product.imageUrl || null);
      setImageFile(null);
      reset(newFormData);
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
      reset(newFormData);
    }
  }, [isEditMode, product, filteredCategories, reset]);

  const handleAddSize = () => {
    const usedSizes = formData.sizes.map((s) => s.size);
    const nextSize = AVAILABLE_SIZES.find((size) => !usedSizes.includes(size));
    if (!nextSize) {
      toast.error("Không còn kích thước để thêm!");
      return;
    }
    const newSizeObj = { size: nextSize, price: "0", status: true };
    setFormData((prev) => ({
      ...prev,
      sizes: [...prev.sizes, newSizeObj],
    }));
    setValue("sizes", [...formData.sizes, newSizeObj]);
  };

  const handleRemoveSize = (index) => {
    setFormData((prev) => {
      const newSizes = prev.sizes.filter((_, i) => i !== index);
      return {
        ...prev,
        sizes:
          newSizes.length > 0
            ? newSizes
            : [{ size: "Small", price: "0", status: true }],
      };
    });
    setValue(
      "sizes",
      formData.sizes.filter((_, i) => i !== index).length > 0
        ? formData.sizes.filter((_, i) => i !== index)
        : [{ size: "Small", price: "0", status: true }]
    );
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
    setValue("status", !formData.status);
  };

  const onSubmit = async (data) => {
    const formDataToSend = new FormData();
    formDataToSend.append("productName", data.productName);
    formDataToSend.append("CategoryId", data.categoryId.toString());
    formDataToSend.append("description", data.description || "");
    formDataToSend.append("status", data.status.toString());

    if (!isEditMode) {
      // Create product
      data.sizes.forEach((sizeObj, index) => {
        const price = parseFloat(sizeObj.price) || 0;
        formDataToSend.append(`sizes[${index}][size]`, sizeObj.size);
        formDataToSend.append(`sizes[${index}][price]`, price.toString());
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
      formDataToSend.append("ProductId", editProductId.toString());
      formDataToSend.append("CategoryId", data.categoryId.toString());
      data.sizes.forEach((sizeObj, index) => {
        if (sizeObj.productId) {
          formDataToSend.append(`Variants[${index}].ProductId`, sizeObj.productId.toString());
        }
        formDataToSend.append(`Variants[${index}].SizeId`, sizeObj.size);
        formDataToSend.append(`Variants[${index}].Prize`, sizeObj.price.toString());
        formDataToSend.append(`Variants[${index}].Status`, sizeObj.status.toString());
        formDataToSend.append(`Variants[${index}].Description`, data.description || "");
      });
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
        const updateResponse = await dispatch(
          updateProduct({ productId: editProductId, formData: formDataToSend })
        ).unwrap();
        console.log("updateProduct response:", updateResponse);
        if (imageFile) {
          const imageFormData = new FormData();
          imageFormData.append("formFile", imageFile);
          const imageResponse = await dispatch(
            updateImageProduct({ productId: editProductId, formData: imageFormData })
          ).unwrap();
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

  const availableSizes = AVAILABLE_SIZES.filter(
    (size) => !formData.sizes.some((sizeObj) => sizeObj.size === size)
  );

  return (
    <Modal open={open} onClose={onClose}>
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 500,
          maxHeight: "80vh",
          overflowY: "auto",
          bgcolor: "background.paper",
          boxShadow: 24,
          p: 4,
          borderRadius: 2,
        }}
      >
        <Typography variant="h6" fontWeight="bold" gutterBottom>
          {isEditMode ? "Cập nhật Sản phẩm" : "Thêm Sản phẩm Mới"}
        </Typography>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Controller
            name="productName"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                label="Tên Sản phẩm"
                margin="normal"
                required
                error={!!errors.productName}
                helperText={errors.productName?.message}
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
            name="categoryId"
            control={control}
            render={({ field }) => (
              <>
                {isEditMode ? (
                  // Hiển thị giá trị tĩnh khi ở chế độ chỉnh sửa
                  <TextField
                    value={
                      product
                        ? filteredCategories.find((cat) => cat.categoryId === Number(product.categoryId))?.categoryName ||
                          "Không tìm thấy danh mục"
                        : "N/A"
                    }
                    fullWidth
                    label="Danh mục"
                    margin="normal"
                    disabled={true} // Vô hiệu hóa hoàn toàn khi edit
                    InputProps={{
                      readOnly: true, // Ngăn người dùng tương tác
                    }}
                    helperText="Danh mục không thể thay đổi khi cập nhật"
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 1,
                        "&:hover fieldset": { borderColor: "#8B5E3C" },
                        "&.Mui-focused fieldset": { borderColor: "#8B5E3C" },
                      },
                    }}
                  />
                ) : (
                  // Dropdown bình thường khi tạo mới
                  <TextField
                    {...field}
                    select
                    fullWidth
                    label="Danh mục"
                    margin="normal"
                    required
                    disabled={categoryLoading}
                    error={!!errors.categoryId}
                    helperText={errors.categoryId?.message}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 1,
                        "&:hover fieldset": { borderColor: "#8B5E3C" },
                        "&.Mui-focused fieldset": { borderColor: "#8B5E3C" },
                      },
                    }}
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
                        <MenuItem
                          key={cat.categoryId}
                          value={Number(cat.categoryId)}
                        >
                          {cat.categoryName}
                        </MenuItem>
                      ))
                    )}
                  </TextField>
                )}
              </>
            )}
          />
          <Typography variant="subtitle1" sx={{ mt: 2, mb: 1 }}>
            Kích thước và Giá
          </Typography>
          {formData.sizes.map((sizeObj, index) => (
            <Grid container spacing={2} key={index} sx={{ mb: 2 }}>
              <Grid item xs={4}>
                <Controller
                  name={`sizes[${index}].size`}
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      select
                      fullWidth
                      label="Kích thước"
                      required
                      error={!!errors.sizes?.[index]?.size}
                      helperText={errors.sizes?.[index]?.size?.message}
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          borderRadius: 1,
                          "&:hover fieldset": { borderColor: "#8B5E3C" },
                          "&.Mui-focused fieldset": { borderColor: "#8B5E3C" },
                        },
                      }}
                    >
                      <MenuItem value="Small">Small</MenuItem>
                      <MenuItem value="Medium">Medium</MenuItem>
                      <MenuItem value="Large">Large</MenuItem>
                    </TextField>
                  )}
                />
              </Grid>
              <Grid item xs={3}>
                <Controller
                  name={`sizes[${index}].price`}
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Giá (VND)"
                      type="number"
                      required
                      inputProps={{ min: 0 }}
                      onChange={(e) => {
                        const value = e.target.value;
                        field.onChange(value);
                        setFormData((prev) => {
                          const newSizes = [...prev.sizes];
                          newSizes[index] = { ...newSizes[index], price: value };
                          return { ...prev, sizes: newSizes };
                        });
                      }}
                      value={field.value || "0"}
                      error={!!errors.sizes?.[index]?.price}
                      helperText={errors.sizes?.[index]?.price?.message}
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
              </Grid>
              <Grid item xs={3}>
                <Controller
                  name={`sizes[${index}].status`}
                  control={control}
                  render={({ field }) => (
                    <FormControlLabel
                      control={
                        <Switch
                          {...field}
                          checked={field.value}
                          onChange={(e) => field.onChange(e.target.checked)}
                          color="primary"
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
                      label="Kích hoạt"
                    />
                  )}
                />
              </Grid>
              <Grid item xs={2}>
                <IconButton
                  onClick={() => handleRemoveSize(index)}
                  disabled={formData.sizes.length === 1}
                  sx={{ color: "#8B5E3C" }}
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
            disabled={availableSizes.length === 0}
            sx={{
              mb: 2,
              borderColor: "#8B5E3C",
              color: "#8B5E3C",
              "&:hover": { borderColor: "#70482F", color: "#70482F" },
              width: "100%",
            }}
          >
            Thêm Kích thước
          </Button>
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Hình ảnh Sản phẩm
            </Typography>
            <input
              accept="image/*"
              type="file"
              onChange={handleImageChange}
              style={{ display: "none" }}
              id="image-upload"
            />
            <label htmlFor="image-upload">
              <Button
                variant="outlined"
                component="span"
                fullWidth
                sx={{
                  borderColor: "#8B5E3C",
                  color: "#8B5E3C",
                  "&:hover": { borderColor: "#70482F", color: "#70482F" },
                }}
              >
                Chọn Ảnh
              </Button>
            </label>
            {imagePreview && (
              <Box mt={2} display="flex" justifyContent="center">
                <Avatar
                  src={imagePreview}
                  alt="Image Preview"
                  sx={{ width: 100, height: 100 }}
                />
              </Box>
            )}
          </Box>
          <Controller
            name="description"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                label="Mô tả"
                margin="normal"
                multiline
                rows={3}
                error={!!errors.description}
                helperText={errors.description?.message}
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
            name="status"
            control={control}
            render={({ field }) => (
              <FormControlLabel
                control={
                  <Switch
                    {...field}
                    checked={field.value}
                    onChange={(e) => {
                      field.onChange(e.target.checked);
                      handleToggleStatus();
                    }}
                    color="primary"
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
                sx={{ mt: 2 }}
              />
            )}
          />
          <Box mt={3} display="flex" gap={2} justifyContent="flex-end">
            <Button
              variant="contained"
              type="submit"
              sx={{
                bgcolor: "#8B5E3C",
                "&:hover": { bgcolor: "#70482F" },
                borderRadius: 1,
                textTransform: "none",
                fontWeight: "bold",
              }}
            >
              {isEditMode ? "Lưu Thay Đổi" : "Thêm Sản phẩm"}
            </Button>
            <Button
              variant="outlined"
              onClick={onClose}
              sx={{
                borderColor: "#8B5E3C",
                color: "#8B5E3C",
                "&:hover": { borderColor: "#70482F", color: "#70482F" },
                borderRadius: 1,
                textTransform: "none",
              }}
            >
              Hủy
            </Button>
          </Box>
        </form>
      </Box>
    </Modal>
  );
};

export default ProductModal;
