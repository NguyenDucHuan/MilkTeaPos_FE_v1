import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  TextField,
  Switch,
  Button,
  FormControlLabel,
  InputLabel,
  FormHelperText,
  CircularProgress,
} from "@mui/material";
import { useDispatch } from "react-redux";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import {
  createCategory,
  updateCategory,
  getallCategory,
} from "../../../store/slices/categorySlice";
import toast from "react-hot-toast";

// Validation schema với Yup
const schema = yup.object().shape({
  categoryName: yup.string().required("Tên danh mục là bắt buộc"),
  description: yup.string().required("Mô tả là bắt buộc"),
  imageFile: yup
    .mixed()
    .required("Hình ảnh là bắt buộc")
    .test("file", "Vui lòng chọn một tệp hình ảnh", (value) => {
      return value instanceof File || (value === null && !value); // Cho phép null khi khởi tạo
    }),
  status: yup.boolean().required("Trạng thái là bắt buộc"),
});

export default function CategoryForm({
  isModal = false,
  onClose,
  categoryData,
}) {
  const dispatch = useDispatch();
  const isEditMode = !!categoryData;
  const [isSubmitting, setIsSubmitting] = useState(false); // Loading state

  const {
    control,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      categoryId: "",
      categoryName: "",
      description: "",
      status: true,
      imageFile: null,
    },
  });

  useEffect(() => {
    if (isEditMode && categoryData) {
      const categoryId = categoryData.categoryId;
      if (!categoryId) {
        console.error("Category ID is missing in categoryData:", categoryData);
      }
      setValue("categoryId", categoryId || "");
      setValue("categoryName", categoryData.categoryName || "");
      setValue("description", categoryData.description || "");
      setValue("status", categoryData.status ?? true);
      setValue("imageFile", null); // Không load ảnh cũ, yêu cầu chọn ảnh mới
    } else {
      reset({
        categoryId: "",
        categoryName: "",
        description: "",
        status: true,
        imageFile: null,
      });
    }
  }, [categoryData, isEditMode, setValue, reset]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    console.log("Tệp đã chọn:", file);
    setValue("imageFile", file, { shouldValidate: true });
  };

  const onSubmit = async (data) => {
    setIsSubmitting(true); // Start loading
    console.log("Dữ liệu từ React Hook Form:", data);
    const formData = new FormData();
    formData.append("CategoryName", data.categoryName);
    formData.append("Description", data.description);
    formData.append("Status", data.status.toString());
    if (data.imageFile) {
      formData.append("ImageFile", data.imageFile);
    }

    for (let [key, value] of formData.entries()) {
      console.log(`${key}: ${value}`);
    }

    try {
      if (isEditMode && !data.categoryId) {
        throw new Error("Category ID is missing during update.");
      }
      const action = isEditMode
        ? updateCategory({ categoryId: data.categoryId, formData })
        : createCategory(formData);
      const result = await dispatch(action).unwrap();
      console.log(
        `${isEditMode ? "Cập nhật" : "Tạo"} danh mục thành công:`,
        result
      );
      toast.success(`${isEditMode ? "Cập nhật" : "Tạo"} danh mục thành công!`);
      if (isModal && onClose) {
        onClose(); // Close modal
      }
      dispatch(getallCategory({ page: 1 })); // Refresh category list
    } catch (err) {

      toast.error(
        `Lỗi: ${
          err.message ||
          `Không thể ${
            isEditMode ? "cập nhật" : "tạo"
          } danh mục. Vui lòng thử lại.`
        }`
      );
    } finally {
      setIsSubmitting(false); // Stop loading
    }
  };

  return (
    <Box sx={{ p: 3, maxWidth: 600 }}>
      <Typography variant="h6" fontWeight="bold" mb={2}>
        {isEditMode ? "Cập nhật danh mục" : "Thêm danh mục mới"}
      </Typography>
 
      <form onSubmit={handleSubmit(onSubmit)}>
        <Controller
          name="categoryName"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="Tên danh mục"
              fullWidth
              required
              error={!!errors.categoryName}
              helperText={errors.categoryName?.message}
              sx={{ mb: 2 }}
              disabled={isSubmitting}
            />
          )}
        />
        <Controller
          name="description"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="Mô tả"
              fullWidth
              required
              multiline
              rows={3}
              error={!!errors.description}
              helperText={errors.description?.message}
              sx={{ mb: 2 }}
              disabled={isSubmitting}
            />
          )}
        />
        <Controller
          name="imageFile"
          control={control}
          render={({ field }) => (
            <Box sx={{ mb: 2 }}>
              <InputLabel htmlFor="imageFile">Hình ảnh (bắt buộc)</InputLabel>
              <input
                id="imageFile"
                type="file"
                accept="image/*"
                onChange={(e) => {
                  handleFileChange(e);
                  field.onChange(e.target.files[0]);
                }}
                style={{ marginTop: 8 }}
                disabled={isSubmitting}
              />
              {errors.imageFile && (
                <FormHelperText error>
                  {errors.imageFile.message}
                </FormHelperText>
              )}
            </Box>
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
                  onChange={(e) => field.onChange(e.target.checked)}
                  color="primary"
                  disabled={isSubmitting}
                />
              }
              label="Hiển thị"
              sx={{ mb: 3 }}
            />
          )}
        />
        <Box display="flex" gap={2}>
          <Button
            type="submit"
            variant="contained"
            sx={{ backgroundColor: "#8B5E3C" }}
            disabled={isSubmitting}
            startIcon={isSubmitting ? <CircularProgress size={20} /> : null}
          >
            {isSubmitting
              ? "Đang xử lý..."
              : isEditMode
              ? "Lưu thay đổi"
              : "Tạo mới"}
          </Button>
          {isModal && (
            <Button
              variant="outlined"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Hủy
            </Button>
          )}
        </Box>
      </form>
    </Box>
  );
}