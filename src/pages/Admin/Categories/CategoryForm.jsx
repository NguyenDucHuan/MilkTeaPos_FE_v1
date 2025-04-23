import React from 'react';
import {
  Box,
  Typography,
  TextField,
  Switch,
  Button,
  FormControlLabel,
  InputLabel,
  FormHelperText,
} from '@mui/material';
import { useDispatch } from 'react-redux';
import { useForm, Controller } from 'react-hook-form';
import { createCategory, listCategory } from '../../../store/slices/categorySlice';

export default function CategoryForm({ isModal = false, onClose }) {
  const dispatch = useDispatch();

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      categoryName: '',
      description: '',
      status: true,
      imageFile: null,
    },
  });

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    console.log('Tệp đã chọn:', file);
    setValue('imageFile', file, { shouldValidate: true });
  };

  const onSubmit = async (data) => {
    console.log('Dữ liệu từ React Hook Form:', data);
    const formData = new FormData();
    formData.append('CategoryName', data.categoryName);
    formData.append('Description', data.description);
    formData.append('Status', data.status.toString());
    if (data.imageFile) {
      formData.append('ImageFile', data.imageFile);
    } else {
      console.warn('ImageFile không được cung cấp');
    }
  
    console.log('Nội dung FormData:');
    for (let [key, value] of formData.entries()) {
      console.log(`${key}: ${value}`);
    }
  
    try {
      const result = await dispatch(createCategory(formData)).unwrap();
      console.log('Tạo danh mục thành công:', result);
      // toast.success('Tạo danh mục thành công!'); // Nếu dùng react-toastify
      alert('Tạo danh mục thành công!');
      if (isModal && onClose) {
        onClose();
      }
      dispatch(listCategory()); // Làm mới danh sách
    } catch (err) {
      console.error('Lỗi khi tạo danh mục:', {
        message: err.message,
        status: err.status,
        data: err.data,
        stack: err.stack,
      });
      // toast.error(`Lỗi: ${err.message || 'Không thể tạo danh mục. Vui lòng thử lại.'}`); // Nếu dùng react-toastify
      alert(`Lỗi: ${err.message || 'Không thể tạo danh mục. Vui lòng thử lại.'}`);
    }
  };
  return (
    <Box sx={{ p: 3, maxWidth: 600 }}>
      <Typography variant="h6" fontWeight="bold" mb={2}>
        Thêm danh mục mới
      </Typography>
      {Object.keys(errors).length > 0 && (
        <pre>Lỗi xác thực: {JSON.stringify(errors, null, 2)}</pre>
      )}
      <form onSubmit={handleSubmit(onSubmit)}>
        <Controller
          name="categoryName"
          control={control}
          rules={{ required: 'Tên danh mục là bắt buộc' }}
          render={({ field }) => (
            <TextField
              {...field}
              label="Tên danh mục"
              fullWidth
              required
              error={!!errors.categoryName}
              helperText={errors.categoryName?.message}
              sx={{ mb: 2 }}
            />
          )}
        />
        <Controller
          name="description"
          control={control}
          rules={{ required: 'Mô tả là bắt buộc' }}
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
            />
          )}
        />
        <Controller
          name="imageFile"
          control={control}
          rules={{ required: 'Hình ảnh là bắt buộc' }}
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
              />
              {errors.imageFile && (
                <FormHelperText error>{errors.imageFile.message}</FormHelperText>
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
                />
              }
              label="Hiển thị"
              sx={{ mb: 3 }}
            />
          )}
        />
        <Box display="flex" gap={2}>
          <Button type="submit" variant="contained" color="primary">
            Tạo mới
          </Button>
          {isModal && (
            <Button variant="outlined" onClick={onClose}>
              Hủy
            </Button>
          )}
        </Box>
      </form>
    </Box>
  );
}