import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  IconButton,
  Button,
  Modal,
  TextField,
  MenuItem,
  Switch,
  FormControlLabel,
  Avatar,
  Grid,
} from "@mui/material";
import { Edit as EditIcon, Add as AddIcon, Delete as DeleteIcon } from "@mui/icons-material";
import { useDispatch, useSelector } from "react-redux";
import { getAllProducts, createProduct } from "../../../store/slices/itemSlice";
import { listCategory } from "../../../store/slices/categorySlice";

export default function ProductList() {
  const dispatch = useDispatch();
  const { item, isLoading, error } = useSelector((state) => state.item);
  const categoryState = useSelector((state) => state.category);
  const category = categoryState?.category || [];
  const categoryLoading = categoryState?.isLoading || false;
  const categoryError = categoryState?.error || null;

  const [openModal, setOpenModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editProductId, setEditProductId] = useState(null);
  const [formData, setFormData] = useState({
    productName: "",
    categoryId: "",
    description: "",
    sizes: [{ size: "Small", price: "0" }], // Mảng chứa nhiều kích thước và giá
    status: true,
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [localProducts, setLocalProducts] = useState(item);

  useEffect(() => {
    dispatch(getAllProducts());
    dispatch(listCategory());
  }, [dispatch]);

  useEffect(() => {
    setLocalProducts(item);
    console.log("Local products:", item); // Debug danh sách sản phẩm
  }, [item]);

  const handleOpenModal = (product = null) => {
    if (product) {
      setIsEditMode(true);
      setEditProductId(product.id);
      const sizes = product.variants?.length > 0
        ? product.variants.map((variant) => ({
            size: variant.sizeId || "Small",
            price: variant.price !== null && variant.price !== undefined ? variant.price.toString() : "0",
          }))
        : [{ size: "Small", price: "0" }];
      setFormData({
        productName: product.productName,
        categoryId: product.categoryId || "",
        description: product.description || "",
        sizes,
        status: product.status,
      });
      setImagePreview(product.imageUrl || null);
      setImageFile(null);
    } else {
      setIsEditMode(false);
      setEditProductId(null);
      setFormData({
        productName: "",
        categoryId: category.length > 0 ? category[0].categoryId : "",
        description: "",
        sizes: [{ size: "Small", price: "0" }],
        status: true,
      });
      setImageFile(null);
      setImagePreview(null);
    }
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setImageFile(null);
    setImagePreview(null);
  };

  const handleChange = (e, index = null) => {
    const { name, value } = e.target;
    if (index !== null) {
      // Cập nhật size hoặc price trong mảng sizes
      setFormData((prev) => {
        const newSizes = [...prev.sizes];
        newSizes[index] = { ...newSizes[index], [name]: value };
        return { ...prev, sizes: newSizes };
      });
    } else {
      // Cập nhật các trường khác
      setFormData((prev) => ({
        ...prev,
        [name]: name === "categoryId" ? parseInt(value) : value,
      }));
    }
    console.log("Input change:", { name, value, index }); // Debug giá nhập vào
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
      return { ...prev, sizes: newSizes.length > 0 ? newSizes : [{ size: "Small", price: "0" }] };
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

    const selectedCategory = category.find(
      (cat) => cat.categoryId === parseInt(formData.categoryId)
    );
    if (!selectedCategory) {
      alert("Vui lòng chọn danh mục hợp lệ!");
      return;
    }

    if (formData.sizes.length === 0) {
      alert("Vui lòng thêm ít nhất một kích thước!");
      return;
    }

    // Kiểm tra giá hợp lệ
    for (let i = 0; i < formData.sizes.length; i++) {
      const price = parseFloat(formData.sizes[i].price);
      if (isNaN(price) || price < 0) {
        alert(`Giá cho kích thước ${formData.sizes[i].size} không hợp lệ (phải là số không âm)!`);
        return;
      }
    }

    const formDataToSend = new FormData();
    formDataToSend.append("productName", formData.productName);
    formDataToSend.append("categoryId", parseInt(formData.categoryId));
    formDataToSend.append("description", formData.description || "");
    formData.sizes.forEach((sizeObj, index) => {
      formDataToSend.append(`sizes[${index}][size]`, sizeObj.size);
      formDataToSend.append(`sizes[${index}][price]`, parseFloat(sizeObj.price));
    });
    formDataToSend.append("status", formData.status);
    if (imageFile) {
      formDataToSend.append("parentImage", imageFile);
    }

    // Log FormData để debug
    console.log("FormData to send:", [...formDataToSend.entries()]);

    try {
      if (isEditMode) {
        alert("Chức năng cập nhật chưa được triển khai!");
      } else {
        const resultAction = await dispatch(createProduct(formDataToSend));
        if (createProduct.fulfilled.match(resultAction)) {
          await dispatch(getAllProducts());
        } else {
          throw new Error(resultAction.payload?.message || "Không thể tạo sản phẩm");
        }
      }
      handleCloseModal();
    } catch (error) {
      console.error("Error creating product:", error);
      alert(error.message || "Có lỗi xảy ra khi tạo sản phẩm!");
    }
  };

  if (isLoading) return <Typography>Loading...</Typography>;
  if (error) return <Typography color="error">Error: {error.message || error}</Typography>;
  if (categoryError)
    return (
      <Typography color="error">
        Error loading categories: {categoryError}
      </Typography>
    );

  return (
    <Box sx={{ padding: 3 }}>
      <Typography variant="h5" fontWeight="bold" gutterBottom>
        Quản lý sản phẩm
      </Typography>
      <Paper sx={{ padding: 2 }}>
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={2}
        >
          <Typography variant="h6">Danh sách sản phẩm</Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenModal()}
            sx={{ backgroundColor: "#8B5E3C" }}
          >
            THÊM SẢN PHẨM
          </Button>
        </Box>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Hình ảnh</TableCell>
              <TableCell>Tên sản phẩm</TableCell>
              <TableCell>Danh mục</TableCell>
              <TableCell>Kích thước</TableCell>
              <TableCell>Giá (VND)</TableCell>
              <TableCell>Hành động</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {localProducts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  No products found
                </TableCell>
              </TableRow>
            ) : (
              localProducts.map((product) => {
                // Hiển thị tất cả kích thước và giá
                const sizes = product.variants?.length > 0
                  ? product.variants.map((v) => v.sizeId).join(", ")
                  : "N/A";
                const prices = product.variants?.length > 0
                  ? product.variants
                      .map((v) =>
                        v.price !== null && v.price !== undefined
                          ? `${v.sizeId}: ${v.price.toLocaleString("vi-VN", {
                              style: "currency",
                              currency: "VND",
                            })}`
                          : `${v.sizeId}: N/A`
                      )
                      .join(", ")
                  : "N/A";

                return (
                  <TableRow key={product.productId}>
                    <TableCell>{product.productId}</TableCell>
                    <TableCell>
                      {product.imageUrl ? (
                        <Avatar
                          src={product.imageUrl}
                          alt={product.productName}
                          sx={{ width: 50, height: 50 }}
                        />
                      ) : (
                        "N/A"
                      )}
                    </TableCell>
                    <TableCell>{product.productName}</TableCell>
                    <TableCell>{product.categoryName || "N/A"}</TableCell>
                    <TableCell>{sizes}</TableCell>
                    <TableCell>{prices}</TableCell>
                    <TableCell>
                      <IconButton onClick={() => handleOpenModal(product)}>
                        <EditIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </Paper>
      <Modal open={openModal} onClose={handleCloseModal}>
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
            {isEditMode ? "Cập nhật sản phẩm" : "Thêm sản phẩm mới"}
          </Typography>
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
              value={formData.categoryId || ""}
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
              ) : category.length === 0 ? (
                <MenuItem value="" disabled>
                  Không có danh mục
                </MenuItem>
              ) : (
                category.map((cat) => (
                  <MenuItem key={cat.categoryId} value={cat.categoryId}>
                    {cat.categoryName}
                  </MenuItem>
                ))
              )}
            </TextField>
            <Typography variant="subtitle1" sx={{ mt: 2, mb: 1 }}>
              Kích thước và giá
            </Typography>
            {formData.sizes.map((sizeObj, index) => (
              <Grid container spacing={2} key={index} sx={{ mb: 2 }}>
                <Grid item xs={5}>
                  <TextField
                    select
                    fullWidth
                    label="Kích thước"
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
                    label="Giá (VND)"
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
              Thêm kích thước
            </Button>
            <TextField
              fullWidth
              type="file"
              label="Hình ảnh sản phẩm"
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
                  alt="Xem trước hình ảnh"
                  sx={{ width: 100, height: 100 }}
                />
              </Box>
            )}
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
              <Button variant="outlined" onClick={handleCloseModal}>
                Hủy
              </Button>
            </Box>
          </form>
        </Box>
      </Modal>
    </Box>
  );
}