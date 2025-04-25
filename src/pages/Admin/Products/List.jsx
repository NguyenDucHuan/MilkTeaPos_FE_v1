import React, { useEffect, useState, useMemo } from "react";
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
  Pagination,
} from "@mui/material";
import {
  Edit as EditIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";
import { useDispatch, useSelector } from "react-redux";
import {
  listItemApi,
  createProduct,
  setPage,
} from "../../../store/slices/itemSlice";
import { listCategory } from "../../../store/slices/categorySlice";

export default function ProductList() {
  const dispatch = useDispatch();
  const { items, totalItems, currentPage, pageSize, isLoading, error } =
    useSelector((state) => state.item);
  const categoryState = useSelector((state) => state.category);
  const category = categoryState?.category || [];
  const categoryLoading = categoryState?.isLoading || false;
  const categoryError = categoryState?.error || null;

  const [openModal, setOpenModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editProductId, setEditProductId] = useState(null);
  const [formData, setFormData] = useState({
    productName: "",
    categoryId: "", // Khởi tạo rỗng ban đầu
    description: "",
    sizes: [{ size: "Small", price: "0" }],
    status: true,
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [hasLoadedCategories, setHasLoadedCategories] = useState(false); // Trạng thái để kiểm soát việc gọi listCategory

  // Sử dụng useMemo để giữ danh sách category ổn định
  const stableCategory = useMemo(() => category, [category]);

  const totalPages = Math.ceil(totalItems / pageSize);

  // Tải danh mục chỉ một lần khi component mount
  useEffect(() => {
    if (!hasLoadedCategories) {
      console.log("Gọi listCategory khi component mount");
      dispatch(listCategory());
      setHasLoadedCategories(true);
    }
  }, [dispatch, hasLoadedCategories]);

  // Log để kiểm tra danh mục
  useEffect(() => {
    console.log("Danh sách category đã thay đổi:", stableCategory);
  }, [stableCategory]);

  // Tải danh sách sản phẩm khi currentPage hoặc pageSize thay đổi
  useEffect(() => {
    dispatch(
      listItemApi({ CategoryId: null, Page: currentPage, PageSize: pageSize })
    );
  }, [dispatch, currentPage, pageSize]);

  const handleOpenModal = (product = null) => {
    if (categoryLoading) {
      alert("Vui lòng đợi danh mục được tải!");
      return;
    }
    if (!stableCategory.length) {
      alert("Không có danh mục nào để chọn!");
      return;
    }

    if (product) {
      setIsEditMode(true);
      setEditProductId(product.id);
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
      console.log("FormData khi mở modal (chỉnh sửa):", newFormData);
      setImagePreview(product.imageUrl || null);
      setImageFile(null);
    } else {
      setIsEditMode(false);
      setEditProductId(null);
      const newFormData = {
        productName: "",
        categoryId:
          stableCategory.length > 0 ? Number(stableCategory[0].categoryId) : "",
        description: "",
        sizes: [{ size: "Small", price: "0" }],
        status: true,
      };
      setFormData(newFormData);
      console.log("FormData khi mở modal (thêm mới):", newFormData);
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
      setFormData((prev) => {
        const newSizes = [...prev.sizes];
        newSizes[index] = { ...newSizes[index], [name]: value };
        return { ...prev, sizes: newSizes };
      });
    } else {
      setFormData((prev) => {
        const newFormData = {
          ...prev,
          [name]: name === "categoryId" ? Number(value) : value,
        };
        console.log(`FormData sau khi thay đổi (${name}):`, newFormData);
        return newFormData;
      });
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

    const selectedCategory = stableCategory.find(
      (cat) => cat.categoryId === formData.categoryId
    );
    if (!selectedCategory) {
      alert("Vui lòng chọn danh mục hợp lệ!");
      return;
    }

    if (formData.sizes.length === 0) {
      alert("Vui lòng thêm ít nhất một kích thước!");
      return;
    }

    for (let i = 0; i < formData.sizes.length; i++) {
      const price = parseFloat(formData.sizes[i].price);
      if (isNaN(price) || price < 0) {
        alert(`Giá cho kích thước ${formData.sizes[i].size} không hợp lệ!`);
        return;
      }
    }

    const formDataToSend = new FormData();
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
        alert("Chức năng cập nhật chưa được triển khai!");
      } else {
        console.log("Gửi formDataToSend:", formDataToSend);
        const resultAction = await dispatch(createProduct(formDataToSend));
        if (createProduct.fulfilled.match(resultAction)) {
          console.log("Tạo sản phẩm thành công, gọi lại listItemApi");
          await dispatch(
            listItemApi({
              CategoryId: null,
              Page: currentPage,
              PageSize: pageSize,
            })
          );
        } else {
          throw new Error(
            resultAction.payload?.message || "Không thể tạo sản phẩm"
          );
        }
      }
      handleCloseModal();
    } catch (error) {
      console.error("Error creating product:", error);
      alert(error.message || "Có lỗi xảy ra khi tạo sản phẩm!");
    }
  };

  const handlePageChange = (event, newPage) => {
    dispatch(setPage(newPage));
  };

  if (isLoading) return <Typography>Loading...</Typography>;
  if (error)
    return (
      <Typography color="error">Error: {error.message || error}</Typography>
    );
  if (categoryError)
    return (
      <Typography color="error">
        Error loading categories: {categoryError}
      </Typography>
    );

  console.log("FormData trước khi render:", formData);

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
              <TableCell>Hình ảnh</TableCell>
              <TableCell>Tên sản phẩm</TableCell>
              <TableCell>Danh mục</TableCell>
              <TableCell>Giá (VND)</TableCell>
              <TableCell>Hành động</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  Không có sản phẩm nào
                </TableCell>
              </TableRow>
            ) : (
              items.map((product) => {
                const sizes =
                  product.variants?.length > 0
                    ? product.variants.map((v) => v.sizeId).join(", ")
                    : "N/A";
                const prices =
                  product.variants?.length > 0
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
        <Box display="flex" justifyContent="center" mt={3}>
          <Pagination
            count={totalPages}
            page={currentPage}
            onChange={handlePageChange}
            color="primary"
          />
        </Box>
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
              value={
                formData.categoryId !== ""
                  ? formData.categoryId
                  : stableCategory.length > 0
                  ? stableCategory[0].categoryId
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
              ) : stableCategory.length === 0 ? (
                <MenuItem value="" disabled>
                  Không có danh mục
                </MenuItem>
              ) : (
                stableCategory.map((cat) => (
                  <MenuItem key={cat.categoryId} value={Number(cat.categoryId)}>
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
