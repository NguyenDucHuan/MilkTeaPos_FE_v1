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
  Switch,
  FormControlLabel,
  Pagination,
  Checkbox,
  Grid,
  InputAdornment,
  Collapse,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  Divider,
  CircularProgress,
  Backdrop,
} from "@mui/material";
import {
  Edit as EditIcon,
  Add as AddIcon,
  ExpandMore as ExpandMoreIcon,
  Remove as RemoveIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
} from "@mui/icons-material";
import { useDispatch, useSelector } from "react-redux";
import { listItemApi, setPage } from "../../../store/slices/itemSlice";
import { createCombo, updateCombo } from "../../../store/slices/comboSlice";
import toast from "react-hot-toast";

export default function Combos() {
  const dispatch = useDispatch();
  const { items: allItems, currentPage, pageSize, totalPages, totalItems, isLoading: productsLoading, error: productsError } =
    useSelector((state) => state.item);
  const { isLoading: comboLoading, error: comboError } = useSelector((state) => state.combo); // Lấy trạng thái loading từ comboSlice
  const [openModal, setOpenModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editComboId, setEditComboId] = useState(null);
  const [formData, setFormData] = useState({
    ComboName: "",
    Description: "",
    Image: null,
    Price: "0",
    Status: true,
    ComboItems: [],
    categoryId: 5,
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [expandedProduct, setExpandedProduct] = useState(null);
  const [allProducts, setAllProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [openDetailsModal, setOpenDetailsModal] = useState(false);
  const [selectedCombo, setSelectedCombo] = useState(null);

  // Filter only combo products based on productType
  const combos = useMemo(() => {
    return allItems.filter(item => item.productType === "Combo");
  }, [allItems]);

  // Reset currentPage to 1 when the component mounts
  useEffect(() => {
    dispatch(setPage(1));
  }, [dispatch]);

  // Fetch products with pagination
  useEffect(() => {
    console.log(
      "Fetching products for Combos - Page:",
      currentPage,
      "PageSize:",
      pageSize
    );
    dispatch(
      listItemApi({ 
        Page: currentPage, 
        PageSize: pageSize
      })
    ).then((result) => {
      if (result.meta.requestStatus === "fulfilled") {
        console.log("Products fetched successfully:", result.payload);
      } else {
        console.error("Error fetching products:", result.error);
      }
    });
  }, [dispatch, currentPage, pageSize]);

  // Fetch all products for the modal (without pagination)
  useEffect(() => {
    console.log("Fetching all products for modal...");
    dispatch(listItemApi({ 
      Page: 1, 
      PageSize: 1000
    })).then((result) => {
      if (result.meta.requestStatus === "fulfilled") {
        const filteredProducts = (result.payload.items || []).filter(
          product => product.productType === "MaterProduct"
        );
        setAllProducts(filteredProducts);
        console.log("All products fetched for modal:", filteredProducts);
      } else {
        console.error("Error fetching all products for modal:", result.error);
      }
    });
  }, [dispatch]);

  // Group products by category
  const productsByCategory = useMemo(() => {
    const grouped = {};
    allProducts.forEach(product => {
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

  const handleOpenModal = (combo = null) => {
    if (allProducts.length === 0) {
      alert("No products available to create a combo!");
      return;
    }

    if (combo) {
      setIsEditMode(true);
      setEditComboId(combo.productId);
      setFormData({
        ComboName: combo.productName,
        Description: combo.description || "",
        Image: null,
        Price: combo.price.toString(),
        Status: combo.status,
        ComboItems: combo.comboItems || [],
        categoryId: 5,
      });
      setImagePreview(combo.imageUrl || null);
    } else {
      setIsEditMode(false);
      setEditComboId(null);
      setFormData({
        ComboName: "",
        Description: "",
        Image: null,
        Price: "0",
        Status: true,
        ComboItems: [],
        categoryId: 5,
      });
      setImagePreview(null);
    }
    setOpenModal(true);
    setExpandedProduct(null);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setImagePreview(null);
    setExpandedProduct(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleProductToggle = (productId) => {
    setFormData((prev) => {
      const product = allProducts.find(p => p.productId === productId);
      return {
        ...prev,
        ComboItems: [
          ...prev.ComboItems,
          { 
            id: Date.now(),
            productId, 
            quantity: 1, 
            discount: 0,
            size: product?.variants?.[0]?.sizeId || "Default",
            sizePrice: product?.variants?.[0]?.price || 0,
            toppings: []
          },
        ],
      };
    });
  };

  const handleRemoveItem = (itemId) => {
    setFormData((prev) => ({
      ...prev,
      ComboItems: prev.ComboItems.filter(item => item.id !== itemId)
    }));
  };

  const handleSizeChange = (itemId, size, price) => {
    setFormData((prev) => ({
      ...prev,
      ComboItems: prev.ComboItems.map((item) =>
        item.id === itemId 
          ? { ...item, size, sizePrice: price }
          : item
      ),
    }));
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
  };

  const handleProductFieldChange = (productId, field, value) => {
    const parsedValue = parseInt(value) || 0;
    if (parsedValue < 0) return;
    setFormData((prev) => ({
      ...prev,
      ComboItems: prev.ComboItems.map((item) =>
        item.productId === productId ? { ...item, [field]: parsedValue } : item
      ),
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
        setFormData((prev) => ({ ...prev, Image: file }));
      };
      reader.readAsDataURL(file);
    } else {
      setImagePreview(null);
      setFormData((prev) => ({ ...prev, Image: null }));
    }
  };

  const handleToggleStatus = () => {
    setFormData((prev) => ({
      ...prev,
      Status: !prev.Status,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    if (formData.ComboItems.length === 0) {
      toast.error("Vui lòng chọn ít nhất một sản phẩm cho combo!");
      return;
    }
  
    const price = parseFloat(formData.Price);
    if (isNaN(price) || price < 0) {
      toast.error("Giá không hợp lệ!");
      return;
    }
  
    const formDataToSend = new FormData();
    formDataToSend.append("ComboName", formData.ComboName);
    formDataToSend.append("description", formData.Description || "");
    formDataToSend.append("status", formData.Status.toString());
    formDataToSend.append("categoryId", formData.categoryId);
  
    if (isEditMode) {
      formDataToSend.append("productId", editComboId);
      formDataToSend.append("Prize", formData.Price);
    } else {
      formDataToSend.append("Price", formData.Price);
    }
  
    // Gửi file ảnh nếu có
    if (formData.Image) {
      formDataToSend.append("image", formData.Image);
    }
  
    formData.ComboItems.forEach((item, index) => {
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
      if (isEditMode) {
        await dispatch(updateCombo(formDataToSend)).unwrap();
        toast.success("Combo đã được cập nhật thành công!");
      } else {
        await dispatch(createCombo(formDataToSend)).unwrap();
        toast.success("Combo đã được tạo thành công!");
      }
      // Delay để đảm bảo backend đồng bộ dữ liệu
      await new Promise(resolve => setTimeout(resolve, 1000));
      await dispatch(listItemApi({ Page: currentPage, PageSize: pageSize }));
      handleCloseModal();
    } catch (error) {
      console.error("Error submitting combo:", error);
      toast.error(
        error.message || "Có lỗi xảy ra khi xử lý combo. Vui lòng thử lại!"
      );
    }
  };

  const handlePageChange = (event, newPage) => {
    console.log("Navigating to page:", newPage);
    dispatch(setPage(newPage));
  };

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
  };

  const handleOpenDetails = (combo) => {
    setSelectedCombo(combo);
    setOpenDetailsModal(true);
  };

  const handleCloseDetails = () => {
    setOpenDetailsModal(false);
    setSelectedCombo(null);
  };

  if (productsLoading) return <Typography>Loading...</Typography>;
  if (productsError) return <Typography color="error">Error: {productsError}</Typography>;

  return (
    <Box sx={{ padding: 3, bgcolor: "#fffbf2", minHeight: "100vh" }}>
      <Typography variant="h4" fontWeight="bold" color="#333" gutterBottom>
        Quản lý Combo
      </Typography>
      <Paper
        sx={{
          padding: 3,
          borderRadius: 2,
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        }}
      >
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={3}
          sx={{ color: "#fffbf2" }}
        >
          <Typography variant="h6" color="#555">
            Danh sách Combo
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenModal()}
            sx={{
              bgcolor: "#8B5E3C",
              "&:hover": { bgcolor: "#70482F" },
              borderRadius: 1,
              textTransform: "none",
              fontWeight: "bold",
            }}
          >
            Thêm Combo Mới
          </Button>
        </Box>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: "bold", color: "#333" }}>
                Tên combo
              </TableCell>
              <TableCell sx={{ fontWeight: "bold", color: "#333" }}>
                Mô tả
              </TableCell>
              <TableCell sx={{ fontWeight: "bold", color: "#333" }}>
                Giá (VND)
              </TableCell>
              <TableCell sx={{ fontWeight: "bold", color: "#333" }}>
                Trạng thái
              </TableCell>
              <TableCell sx={{ fontWeight: "bold", color: "#333" }}>
                Hành động
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {combos.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ color: "#888" }}>
                  Không có combo nào
                </TableCell>
              </TableRow>
            ) : (
              combos.map((combo) => (
                <TableRow
                  key={combo.productId}
                  sx={{ "&:hover": { bgcolor: "#f9f9f9" } }}
                >
                  <TableCell>{combo.productName}</TableCell>
                  <TableCell>{combo.description || "N/A"}</TableCell>
                  <TableCell>
                    {parseFloat(combo.price).toLocaleString("vi-VN", {
                      style: "currency",
                      currency: "VND",
                    })}
                  </TableCell>
                  <TableCell>
                    <Box
                      sx={{
                        bgcolor: combo.status ? "#e8f5e9" : "#ffebee",
                        color: combo.status ? "#2e7d32" : "#d32f2f",
                        borderRadius: 1,
                        textAlign: "center",
                        padding: "2px 8px",
                        fontSize: "0.8rem",
                      }}
                    >
                      {combo.status ? "Kích hoạt" : "Tắt"}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <IconButton
                        onClick={() => handleOpenDetails(combo)}
                        sx={{
                          color: "#8B5E3C",
                          "&:hover": { color: "#70482F" },
                        }}
                      >
                        <VisibilityIcon />
                      </IconButton>
                      <IconButton
                        onClick={() => handleOpenModal(combo)}
                        sx={{
                          color: "#8B5E3C",
                          "&:hover": { color: "#70482F" },
                        }}
                      >
                        <EditIcon />
                      </IconButton>
                    </Box>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        {totalPages > 1 && (
          <Box display="flex" justifyContent="center" mt={3}>
            <Typography variant="body2" sx={{ mr: 2 }}>
              Total Pages: {totalPages}, Current Page: {currentPage}
            </Typography>
            <Pagination
              count={totalPages}
              page={currentPage}
              onChange={handlePageChange}
              color="primary"
              sx={{ "& .Mui-selected": { bgcolor: "#8B5E3C !important" } }}
            />
          </Box>
        )}
      </Paper>

      {/* Modal chi tiết combo */}
      <Dialog
        open={openDetailsModal}
        onClose={handleCloseDetails}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ borderBottom: "2px solid #8B5E3C", pb: 1 }}>
          Chi tiết Combo: {selectedCombo?.productName}
        </DialogTitle>
        <DialogContent>
          {selectedCombo && (
            <Box sx={{ mt: 2 }}>
              <Box sx={{ 
                width: '100%', 
                height: 300, 
                mb: 3,
                overflow: 'hidden',
                borderRadius: 2,
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
              }}>
                <img
                  src={selectedCombo.imageUrl || '/placeholder-image.jpg'}
                  alt={selectedCombo.productName || 'Combo'}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover'
                  }}
                />
              </Box>
              <Typography variant="h6" gutterBottom>
                Thông tin cơ bản
              </Typography>
              <List>
                <ListItem>
                  <ListItemText
                    primary="Mô tả"
                    secondary={selectedCombo.description || "Không có mô tả"}
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="Giá"
                    secondary={parseFloat(selectedCombo.price).toLocaleString("vi-VN", {
                      style: "currency",
                      currency: "VND",
                    })}
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="Trạng thái"
                    secondary={selectedCombo.status ? "Kích hoạt" : "Tắt"}
                  />
                </ListItem>
              </List>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" gutterBottom>
                Danh sách sản phẩm có trong combo
              </Typography>
              <List>
                {selectedCombo.comboItems && selectedCombo.comboItems.length > 0 ? (
                  selectedCombo.comboItems.map((item) => {
                    const product = allProducts.find(p => p.productId === item.productId);
                    if (!product) return null;
                    
                    const sizeInfo = product.variants?.find(v => v.sizeId === item.size);
                    const sizeText = sizeInfo ? ` (Size: ${item.size})` : '';
                    
                    return (
                      <ListItem key={item.productId}>
                        <ListItemText
                          primary={`${product.productName}${sizeText}`}
                          secondary={`Số lượng: ${item.quantity}, Giảm giá: ${item.discount}%`}
                        />
                      </ListItem>
                    );
                  })
                ) : (
                  <ListItem>
                    <ListItemText primary="Chưa có sản phẩm" />
                  </ListItem>
                )}
              </List>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleCloseDetails}
            sx={{
              color: "#8B5E3C",
              "&:hover": { color: "#70482F" },
            }}
          >
            Đóng
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal chỉnh sửa combo */}
      <Modal open={openModal} onClose={handleCloseModal}>
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
          {/* Hiển thị loading overlay trong modal */}
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
          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Tên Combo"
                  name="ComboName"
                  value={formData.ComboName}
                  onChange={handleChange}
                  margin="normal"
                  required
                  variant="outlined"
                  disabled={comboLoading} // Vô hiệu hóa khi đang loading
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 1,
                      "&:hover fieldset": { borderColor: "#8B5E3C" },
                      "&.Mui-focused fieldset": { borderColor: "#8B5E3C" },
                    },
                  }}
                />
                <TextField
                  fullWidth
                  label="Mô tả"
                  name="Description"
                  value={formData.Description}
                  onChange={handleChange}
                  margin="normal"
                  multiline
                  rows={3}
                  variant="outlined"
                  disabled={comboLoading}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 1,
                      "&:hover fieldset": { borderColor: "#8B5E3C" },
                      "&.Mui-focused fieldset": { borderColor: "#8B5E3C" },
                    },
                  }}
                />
                <TextField
                  fullWidth
                  label="Giá (VND)"
                  name="Price"
                  type="number"
                  value={formData.Price}
                  onChange={handleChange}
                  margin="normal"
                  required
                  inputProps={{ min: 0 }}
                  variant="outlined"
                  disabled={comboLoading}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 1,
                      "&:hover fieldset": { borderColor: "#8B5E3C" },
                      "&.Mui-focused fieldset": { borderColor: "#8B5E3C" },
                    },
                  }}
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.Status}
                      onChange={handleToggleStatus}
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
                    style={{ display: 'none' }}
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
                        width: '100%',
                        height: '200px',
                        objectFit: 'cover',
                        borderRadius: 1,
                      }}
                    />
                  )}
                </Box>
              </Grid>
              <Grid item xs={12}>
                <Box sx={{ mb: 3 }}>
                  <Typography variant="h6" sx={{ mb: 2, color: '#8B5E3C' }}>
                    Chọn danh mục
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    <Button
                      variant={selectedCategory === null ? "contained" : "outlined"}
                      onClick={() => handleCategoryChange(null)}
                      sx={{
                        bgcolor: selectedCategory === null ? '#8B5E3C' : 'transparent',
                        color: selectedCategory === null ? 'white' : '#8B5E3C',
                        borderColor: '#8B5E3C',
                        '&:hover': {
                          bgcolor: selectedCategory === null ? '#70482F' : '#f5f5f5',
                        }
                      }}
                      disabled={comboLoading}
                    >
                      Tất cả
                    </Button>
                    {categories.map((category) => (
                      <Button
                        key={category}
                        variant={selectedCategory === category ? "contained" : "outlined"}
                        onClick={() => handleCategoryChange(category)}
                        sx={{
                          bgcolor: selectedCategory === category ? '#8B5E3C' : 'transparent',
                          color: selectedCategory === category ? 'white' : '#8B5E3C',
                          borderColor: '#8B5E3C',
                          '&:hover': {
                            bgcolor: selectedCategory === category ? '#70482F' : '#f5f5f5',
                          }
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
                  {(selectedCategory ? productsByCategory[selectedCategory] : allProducts).map((product) => (
                    <Grid item xs={12} sm={6} md={4} key={product.productId}>
                      <Paper
                        sx={{
                          p: 2,
                          border: '1px solid',
                          borderColor: 'divider',
                          borderRadius: 1,
                          height: '100%',
                          display: 'flex',
                          flexDirection: 'column',
                        }}
                      >
                        <Box sx={{ 
                          width: '100%', 
                          height: 200, 
                          mb: 2,
                          overflow: 'hidden',
                          borderRadius: 1
                        }}>
                          <img
                            src={product.imageUrl || '/placeholder-image.jpg'}
                            alt={product.productName}
                            style={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover'
                            }}
                          />
                        </Box>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="subtitle1" gutterBottom>
                            {product.productName}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
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
                      const product = allProducts.find(p => p.productId === item.productId);
                      return (
                        <Grid item xs={12} sm={6} md={4} key={item.id}>
                          <Paper
                            sx={{
                              p: 2,
                              border: '1px solid',
                              borderColor: 'primary.main',
                              borderRadius: 1,
                              height: '100%',
                              display: 'flex',
                              flexDirection: 'column',
                            }}
                          >
                            <Box sx={{ 
                              width: '100%', 
                              height: 150, 
                              mb: 2,
                              overflow: 'hidden',
                              borderRadius: 1
                            }}>
                              <img
                                src={product?.imageUrl || '/placeholder-image.jpg'}
                                alt={product?.productName}
                                style={{
                                  width: '100%',
                                  height: '100%',
                                  objectFit: 'cover'
                                }}
                              />
                            </Box>
                            <Box sx={{ flex: 1 }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                <IconButton
                                  size="small"
                                  onClick={() => handleRemoveItem(item.id)}
                                  sx={{ color: 'error.main' }}
                                  disabled={comboLoading}
                                >
                                  <DeleteIcon />
                                </IconButton>
                                <Typography variant="subtitle1">
                                  {product?.productName}
                                </Typography>
                              </Box>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                                <TextField
                                  select
                                  size="small"
                                  value={item.size}
                                  onChange={(e) => {
                                    const variant = product?.variants?.find(v => v.sizeId === e.target.value);
                                    handleSizeChange(item.id, e.target.value, variant?.price || 0);
                                  }}
                                  sx={{ minWidth: 120 }}
                                  disabled={comboLoading}
                                >
                                  {product?.variants?.map((variant) => (
                                    <MenuItem key={variant.sizeId} value={variant.sizeId}>
                                      {variant.sizeId}
                                    </MenuItem>
                                  ))}
                                </TextField>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
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
                disabled={comboLoading} // Vô hiệu hóa nút khi đang loading
                sx={{
                  bgcolor: "#8B5E3C",
                  "&:hover": { bgcolor: "#70482F" },
                  borderRadius: 1,
                  textTransform: "none",
                  fontWeight: "bold",
                  px: 3,
                }}
              >
                {comboLoading ? "Đang xử lý..." : isEditMode ? "Lưu Thay Đổi" : "Thêm Combo"}
              </Button>
              <Button
                variant="outlined"
                onClick={handleCloseModal}
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
    </Box>
  );
}