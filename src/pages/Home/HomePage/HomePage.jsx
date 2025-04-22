import {
  Box,
  Button,
  Card,
  CardContent,
  CardMedia,
  Divider,
  Grid,
  Typography,
  IconButton,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import "./HomePage.css";
import ModalCheckout from "../../../components/Modal/ModalCheckout";
import CustomizationModal from "../../../components/Modal/CustomizationModal";
import ShoppingBagIcon from "@mui/icons-material/ShoppingBag";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import DeleteIcon from "@mui/icons-material/Delete";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { listCategory } from "../../../store/slices/categorySlice";
import { listItemApi } from "../../../store/slices/itemSlice";
import { useOutletContext } from "react-router-dom";
import { addToCartApi, getCartApi, updateCartItemQuantity, removeFromCartApi, updateCartQuantityApi, addToCart } from "../../../store/slices/orderSlice";

export default function HomePage() {
  const dispatch = useDispatch();
  const { item, isLoading, error } = useSelector((state) => state.item);
  const { category: categories, isLoading: categoryLoading, error: categoryError } = useSelector((state) => state.category);
  const { cart = [], isLoading: orderLoading, error: orderError } = useSelector((state) => state.order);
  const [openCheckout, setOpenCheckout] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const { selectedCategory, setSelectedCategory } = useOutletContext();
  const [customization, setCustomization] = useState({
    size: "Medium",
    sizePrice: 0,
    sugar: "100%",
    ice: "Regular",
    toppings: [],
    quantity: 1,
  });

  useEffect(() => {
    dispatch(listCategory()).then((result) => {
      if (result.meta.requestStatus === "fulfilled" && result.payload.length > 0) {
        if (!selectedCategory && result.payload[0]) {
          setSelectedCategory(result.payload[0].categoryName);
          dispatch(listItemApi({ CategoryId: result.payload[0].categoryId }));
        }
      }
    });
    dispatch(getCartApi());
  }, [dispatch]);

  useEffect(() => {
    if (selectedCategory && categories.length > 0) {
      const selectedCategoryObj = categories.find(
        (cat) => cat.categoryName === selectedCategory
      );
      if (selectedCategoryObj) {
        dispatch(listItemApi({ CategoryId: selectedCategoryObj.categoryId }));
      }
    }
  }, [dispatch, selectedCategory, categories]);

  const handleOpenCheckoutModal = () => {
    setOpenCheckout(true);
  };

  const handleCloseCheckoutModal = () => {
    setOpenCheckout(false);
  };

  const handleOpenModal = (item) => {
    setSelectedItem(item);
    setCustomization({
      size: "Medium",
      sizePrice: 0,
      sugar: "100%",
      ice: "Regular",
      toppings: [],
      quantity: 1,
    });
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setSelectedItem(null);
  };

  const handleAddToOrder = async (customizedItem) => {
    try {
      // First update local state for immediate UI feedback
      dispatch(addToCart({
        product: customizedItem,
        quantity: customizedItem.quantity
      }));

      // Then call API to update server
      await dispatch(addToCartApi({
        masterId: customizedItem.productId,
        productId: customizedItem.productId,
        quantity: customizedItem.quantity
      })).unwrap();
      
      // Refresh cart after adding item
      await dispatch(getCartApi()).unwrap();
      handleCloseModal();
    } catch (error) {
      console.error("Error adding to cart:", error);
      // If API call fails, remove the item from local state
      dispatch(updateCartItemQuantity({
        productId: customizedItem.productId,
        quantity: 0
      }));
    }
  };

  const calculateSubtotal = () => {
    if (!Array.isArray(cart) || cart.length === 0) return 0;
    return cart.reduce((total, item) => {
      const itemPrice = item.product?.price || 0;
      return total + (itemPrice * item.quantity);
    }, 0);
  };

  const handleUpdateQuantity = async (item, newQuantity, e) => {
    e?.preventDefault();
    e?.stopPropagation();
    try {
      if (newQuantity < item.quantity) {
        // Khi giảm số lượng (luôn giảm 1)
        await dispatch(removeFromCartApi({
          productId: item.product.productId,
          quantity: 1
        })).unwrap();

        // Cập nhật state local
        dispatch(updateCartItemQuantity({
          productId: item.product.productId,
          quantity: newQuantity
        }));
      } else if (newQuantity > item.quantity) {
        // Khi tăng số lượng (luôn tăng 1)
        await dispatch(addToCartApi({
          masterId: item.product.productId,
          productId: item.product.productId,
          quantity: 1
        })).unwrap();

        // Cập nhật state local
        dispatch(updateCartItemQuantity({
          productId: item.product.productId,
          quantity: newQuantity
        }));
      }

      // Làm mới giỏ hàng để đảm bảo đồng bộ
      await dispatch(getCartApi()).unwrap();
    } catch (error) {
      console.error("Error updating quantity:", error);
      // Nếu có lỗi, khôi phục lại state local
      dispatch(updateCartItemQuantity({
        productId: item.product.productId,
        quantity: item.quantity
      }));
    }
  };

  const getFilteredItems = () => {
    if (!Array.isArray(item)) {
      return [];
    }
    return item;
  };

  const handleCategoryClick = (category) => {
    setSelectedCategory(category);
  };

  const handleBackToCategories = () => {
    setSelectedCategory(null);
  };

  const subtotal = calculateSubtotal();
  const total = subtotal;

  return (
    <Box className="home-page">
      <Grid container spacing={2} className="home-page-grid">
        <Grid item xs={12} md={7} className="menu-section">
          <Box className="menu-container">
            <Typography variant="h4" className="menu-title">Menu Items</Typography>
            <Divider className="menu-divider" />
            {categoryLoading ? (
              <Typography>Đang tải danh mục...</Typography>
            ) : categoryError ? (
              <Typography color="error">Lỗi: {categoryError}</Typography>
            ) : isLoading ? (
              <Typography>Đang tải sản phẩm...</Typography>
            ) : error ? (
              <Typography color="error">Lỗi: {error}</Typography>
            ) : selectedCategory === null ? (
              <Grid container spacing={2} className="category-grid">
                {Array.isArray(categories) && categories.length > 0 ? (
                  categories.map((category) => (
                    <Grid item xs={12} sm={6} md={4} key={category.categoryId}>
                      <Card
                        className="category-card"
                        onClick={() => handleCategoryClick(category.categoryName)}
                      >
                        <CardContent className="category-content">
                          <Box className="category-image">
                            <img
                              src={category.image}
                              alt={category.categoryName}
                              className="category-img"
                            />
                          </Box>
                          <Box className="category-info">
                            <Typography variant="h6" className="category-name">
                              {category.categoryName}
                            </Typography>
                            <Typography variant="body2" className="category-description">
                              {category.description}
                            </Typography>
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))
                ) : (
                  <Typography>Không có danh mục nào</Typography>
                )}
              </Grid>
            ) : getFilteredItems().length > 0 ? (
              <>
                <Button
                  startIcon={<ArrowBackIcon />}
                  onClick={handleBackToCategories}
                  className="back-button"
                >
                  Quay lại Danh mục
                </Button>
                <Grid container spacing={2} className="menu-items-grid">
                  {getFilteredItems().map((item) => (
                    <Grid item xs={12} sm={6} md={4} key={item.productId}>
                      <Card
                        className="menu-item-card"
                        onClick={() => handleOpenModal(item)}
                      >
                        <CardContent>
                          <Box className="menu-item-content">
                            <img
                              src={item.imageUrl}
                              alt={item.productName}
                              className="menu-item-image"
                            />
                            <Typography variant="h6" className="menu-item-name">
                              {item.productName}
                            </Typography>
                            <Typography variant="body2" className="menu-item-description">
                              {item.description}
                            </Typography>
                            <Typography variant="h6" className="menu-item-price">
                              ${item.price}
                            </Typography>
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </>
            ) : (
              <Typography>Không có sản phẩm nào trong danh mục này</Typography>
            )}
          </Box>
        </Grid>

        <Grid item xs={12} md={5} className="order-section">
          <Box className="order-container">
            <Typography variant="h4" className="order-title">Đơn hàng hiện tại</Typography>
            <Divider className="order-divider" />
            {orderLoading ? (
              <Typography>Đang tải giỏ hàng...</Typography>
            ) : orderError ? (
              <Typography color="error">Lỗi: {orderError}</Typography>
            ) : !cart || cart.length === 0 ? (
              <Box className="order-empty-message">
                <Box sx={{ textAlign: "center", marginTop: "10%" }}>
                  <ShoppingBagIcon
                    className="order-empty-icon"
                    sx={{
                      color: "#8a5a2a",
                      fontSize: "50px",
                      marginBottom: "10px",
                    }}
                  />
                  <Typography
                    variant="body1"
                    className="order-empty-text"
                    sx={{ color: "#8a5a2a", fontWeight: "bold" }}
                  >
                    Chưa có món nào trong đơn hàng
                  </Typography>
                  <Typography
                    variant="body2"
                    className="order-empty-subtext"
                    sx={{ color: "#8a5a2a" }}
                  >
                    Thêm món từ menu để bắt đầu
                  </Typography>
                </Box>
              </Box>
            ) : (
              <>
                <Box className="order-summary">
                  <Typography variant="body1" className="order-summary-title">
                    TÓM TẮT ĐƠN HÀNG
                  </Typography>
                  <Box className="order-summary-content">
                    <Box className="order-summary-item">
                      <Typography variant="body2">SỐ MÓN:</Typography>
                      <Typography variant="body2">
                        {cart.reduce((sum, item) => sum + (item.quantity || 0), 0)}
                      </Typography>
                    </Box>
                    <Box className="order-summary-item">
                      <Typography variant="body2">TỔNG CỘNG:</Typography>
                      <Typography variant="body2">${subtotal.toFixed(2)}</Typography>
                    </Box>
                    <Box className="order-summary-item">
                      <Typography variant="body2">THÀNH TIỀN:</Typography>
                      <Typography variant="body2">${subtotal.toFixed(2)}</Typography>
                    </Box>
                  </Box>
                </Box>
                <Box className="order-details">
                  <Typography variant="body1" className="order-details-title">
                    CHI TIẾT ĐƠN HÀNG
                  </Typography>
                  {cart.map((item) => (
                    <Box key={item.orderItemId} className="order-detail-item">
                      <Box className="order-detail-info">
                        <Box component="span" className="order-detail-text">
                          <span className="order-detail-quantity">
                            {item.quantity}x
                          </span>
                          <span className="order-detail-name">
                            {item.product?.productName || 'Unknown Product'}
                          </span>
                        </Box>
                      </Box>
                      <Box className="order-detail-actions">
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            const newQuantity = Math.max(0, item.quantity - 1);
                            if (newQuantity !== item.quantity) {
                              handleUpdateQuantity(item, newQuantity, e);
                            }
                          }}
                        >
                          <RemoveIcon />
                        </IconButton>
                        <Typography className="order-detail-quantity">
                          {item.quantity}
                        </Typography>
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            const newQuantity = item.quantity + 1;
                            handleUpdateQuantity(item, newQuantity, e);
                          }}
                        >
                          <AddIcon />
                        </IconButton>
                        <Typography className="order-detail-price">
                          ${((item.product?.price || 0) * item.quantity).toFixed(2)}
                        </Typography>
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            handleUpdateQuantity(item, 0, e);
                          }}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                    </Box>
                  ))}
                </Box>
                <Box className="order-actions">
                  <Button
                    variant="outlined"
                    className="order-clear-button"
                    onClick={() => {
                      cart.forEach(item => {
                        if (item.product?.productId) {
                          dispatch(updateCartItemQuantity({
                            productId: item.product.productId,
                            quantity: 0
                          }));
                          dispatch(removeFromCartApi({
                            productId: item.product.productId,
                            quantity: item.quantity
                          }));
                        }
                      });
                    }}
                    fullWidth
                  >
                    Xóa đơn
                  </Button>
                  <Button
                    variant="contained"
                    className="order-checkout-button"
                    fullWidth
                    onClick={handleOpenCheckoutModal}
                    disabled={!cart || cart.length === 0}
                  >
                    THANH TOÁN
                  </Button>
                </Box>
              </>
            )}
          </Box>
        </Grid>
      </Grid>

      <CustomizationModal
        open={openModal}
        onClose={handleCloseModal}
        item={selectedItem}
        customization={customization}
        setCustomization={setCustomization}
        onAddToOrder={handleAddToOrder}
      />
      <ModalCheckout
        open={openCheckout}
        onClose={handleCloseCheckoutModal}
        order={cart || []}
        total={total}
      />
    </Box>
  );
}