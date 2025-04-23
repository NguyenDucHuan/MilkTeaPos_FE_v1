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
import {
  addToCartApi,
  getCartApi,
  updateCartItemQuantity,
  removeFromCartApi,
  updateCartQuantityApi,
  addToCart,
} from "../../../store/slices/orderSlice";
import fetcher from "../../../apis/fetcher";

export default function HomePage() {
  const dispatch = useDispatch();
  const { item, isLoading, error } = useSelector((state) => state.item);
  const {
    category: categories,
    isLoading: categoryLoading,
    error: categoryError,
  } = useSelector((state) => state.category);
  const orderState = useSelector((state) => state.order);
  const {
    cart = [],
    offers = [],
    isLoading: orderLoading,
    error: orderError,
  } = orderState;
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
      if (
        result.meta.requestStatus === "fulfilled" &&
        result.payload.length > 0
      ) {
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
        dispatch(
          listItemApi({ CategoryId: selectedCategoryObj.categoryId })
        ).then((result) => {
          if (result.meta.requestStatus === "rejected") {
            console.error("Error fetching items:", result.error);
          }
        });
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
      dispatch(
        addToCart({
          product: customizedItem,
          quantity: customizedItem.quantity,
        })
      );

      // Then call API to update server
      await dispatch(
        addToCartApi({
          masterId: customizedItem.productId,
          productId: customizedItem.productId,
          quantity: customizedItem.quantity,
        })
      ).unwrap();

      // Refresh cart after adding item
      await dispatch(getCartApi()).unwrap();
      handleCloseModal();
    } catch (error) {
      console.error("Error adding to cart:", error);
      // If API call fails, remove the item from local state
      dispatch(
        updateCartItemQuantity({
          productId: customizedItem.productId,
          quantity: 0,
        })
      );
    }
  };

  const calculateSubtotal = () => {
    if (!Array.isArray(cart) || cart.length === 0) return 0;
    return cart.reduce((total, item) => {
      const itemPrice = item.price || item.product?.prize || 0;
      const itemQuantity = item.quantity || 0;
      return total + itemPrice * itemQuantity;
    }, 0);
  };

  const calculateTotal = () => {
    return calculateSubtotal();
  };

  const handleUpdateQuantity = async (item, newQuantity, e) => {
    e?.preventDefault();
    e?.stopPropagation();
    try {
      if (newQuantity < item.quantity) {
        // Khi giảm số lượng (luôn giảm 1)
        await dispatch(
          removeFromCartApi({
            productId: item.product.productId,
            quantity: 1,
          })
        ).unwrap();

        // Cập nhật state local
        dispatch(
          updateCartItemQuantity({
            productId: item.product.productId,
            quantity: newQuantity,
          })
        );
      } else if (newQuantity > item.quantity) {
        // Khi tăng số lượng (luôn tăng 1)
        await dispatch(
          addToCartApi({
            masterId: item.product.productId,
            productId: item.product.productId,
            quantity: 1,
          })
        ).unwrap();

        // Cập nhật state local
        dispatch(
          updateCartItemQuantity({
            productId: item.product.productId,
            quantity: newQuantity,
          })
        );
      }

      // Làm mới giỏ hàng để đảm bảo đồng bộ
      await dispatch(getCartApi()).unwrap();
    } catch (error) {
      console.error("Error updating quantity:", error);
      // Nếu có lỗi, khôi phục lại state local
      dispatch(
        updateCartItemQuantity({
          productId: item.product.productId,
          quantity: item.quantity,
        })
      );
    }
  };

  const getFilteredItems = () => {
    if (!Array.isArray(item)) {
      console.log("item is not an array:", item);
      return [];
    }
    console.log("Filtered items:", item);
    return item;
  };

  const handleCategoryClick = (category) => {
    setSelectedCategory(category);
  };

  const handleBackToCategories = () => {
    setSelectedCategory(null);
  };

  const subtotal = calculateSubtotal();
  const total = calculateTotal();

  const handleCreateOrder = async () => {
    try {
      const orderData = {
        totalAmount: calculateTotal(),
        note: "string",
        staffId: 1,
        paymentMethodId: 1,
        orderitems: cart.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          price: item.price || item.product?.prize || 0,
        })),
      };

      await fetcher.post("/order", orderData);

      // Sau khi tạo đơn hàng thành công
      // 1. Làm mới giỏ hàng
      await dispatch(getCartApi());

      // 2. Làm mới danh sách sản phẩm
      if (selectedCategory && categories.length > 0) {
        const selectedCategoryObj = categories.find(
          (cat) => cat.categoryName === selectedCategory
        );
        if (selectedCategoryObj) {
          await dispatch(
            listItemApi({ CategoryId: selectedCategoryObj.categoryId })
          );
        }
      }

      // 3. Đóng modal checkout
      setOpenCheckout(false);

      // 4. Hiển thị thông báo thành công
      // (Bạn có thể thêm toast hoặc alert ở đây)
    } catch (error) {
      console.error("Error creating order:", error);
      // Xử lý lỗi ở đây
    }
  };

  return (
    <Box className="home-page">
      <Grid container spacing={2} className="home-page-grid">
        <Grid size={7} className="menu-section">
          <Typography className="menu-title">Menu Items</Typography>
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
                  <Grid item xs={4} key={category.categoryId}>
                    <Card
                      sx={{
                        cursor: "pointer",
                        backgroundColor: "#f9f5f1",
                        borderRadius: "15px",
                        boxShadow: "none",
                        marginTop: "20px",
                        marginLeft: "30px",
                        width: "300px",
                      }}
                      onClick={() => handleCategoryClick(category.categoryName)}
                    >
                      <CardContent
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          height: "150px",
                        }}
                      >
                        <Box sx={{ mr: 2 }}>
                          <img
                            src={category.imageUrl}
                            alt={category.categoryName}
                            style={{
                              width: "100px",
                              height: "100px",
                              objectFit: "cover",
                              borderRadius: "8px",
                              margin: "7px 9px",
                            }}
                          />
                        </Box>
                        <Box>
                          <Typography
                            variant="h6"
                            sx={{ color: "#8a5a2a", fontWeight: "bold" }}
                          >
                            {category.categoryName}
                          </Typography>
                          <Typography variant="body2" sx={{ color: "#8a5a2a" }}>
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
                sx={{ mb: 2, color: "#8a5a2a" }}
              >
                Quay lại Danh mục
              </Button>
              <Grid container spacing={2} className="menu-items-grid">
                {getFilteredItems().map((item) => (
                  <Grid key={item.productId}>
                    <Card
                      sx={{
                        maxWidth: 345,
                        borderRadius: "15px",
                        border: "1px solid #f0e6d9",
                        width: "280px",
                        height: "350px",
                      }}
                      className="menu-item"
                    >
                      <CardMedia
                        className="menu-item-image-placeholder"
                        component="img"
                        src={item.imageUrl || "https://via.placeholder.com/150"}
                        alt={item.productName}
                        sx={{
                          height: "150px",
                          maxWidth: "250px",
                          objectFit: "cover",
                          margin: "12px 12px",
                        }}
                      />
                      <CardContent className="menu-item-content">
                        <Typography
                          variant="h6"
                          className="menu-item-name"
                          sx={{ marginTop: "5px", color: "#8a5a2a" }}
                        >
                          {item.productName}
                        </Typography>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          className="menu-item-description"
                          sx={{
                            marginTop: "5px",
                            padding: "10px 10px 10px 0px",
                          }}
                        >
                          {item.description}
                        </Typography>
                        <Box
                          sx={{
                            display: "flex",
                            flexDirection: "row",
                            justifyContent: "space-between",
                            alignItems: "center",
                            marginTop: "5px",
                          }}
                        >
                          <Typography
                            variant="h6"
                            color="text.primary"
                            className="menu-item-price"
                            sx={{ marginTop: "5px", color: "#8a5a2a" }}
                          >
                            ${item.price.toFixed(2)}
                          </Typography>
                          <Box className="menu-item-actions">
                            <button
                              onClick={() => handleOpenModal(item)}
                              className="menu-item-add-button"
                            >
                              Thêm
                            </button>
                          </Box>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </>
          ) : (
            <Box>
              <Button
                startIcon={<ArrowBackIcon />}
                onClick={handleBackToCategories}
                sx={{ mb: 2, color: "#8a5a2a" }}
              >
                Quay lại Danh mục
              </Button>
              <Typography
                variant="h6"
                sx={{ color: "#8a5a2a", fontWeight: "bold" }}
              >
                Không có món nào trong danh mục này
              </Typography>
            </Box>
          )}
        </Grid>

        <Grid item size={5} className="order-section">
          <Box className="order-container">
            <Typography variant="h4" className="order-title">
              Đơn hàng hiện tại
            </Typography>
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
                <Box
                  className="order-summary"
                  sx={{
                    padding: "15px",
                    backgroundColor: "#f9f5f1",
                    borderRadius: "15px",
                    marginBottom: "20px",
                  }}
                >
                  <Typography variant="body1" className="order-summary-title">
                    TÓM TẮT ĐƠN HÀNG
                  </Typography>

                  <Box className="order-summary-item">
                    <Typography variant="body2">SỐ MÓN:</Typography>
                    <Typography variant="body2">
                      {cart.reduce(
                        (sum, item) => sum + (item.quantity || 0),
                        0
                      )}
                    </Typography>
                  </Box>
                  <Box className="order-summary-item">
                    <Typography variant="body2">TỔNG CỘNG:</Typography>
                    <Typography variant="body2">
                      ${calculateSubtotal().toFixed(2)}
                    </Typography>
                  </Box>
                  <Box className="order-summary-item">
                    <Typography variant="body2">THÀNH TIỀN:</Typography>
                    <Typography variant="body2" fontWeight="bold">
                      ${calculateTotal().toFixed(2)}
                    </Typography>
                  </Box>
                </Box>
                <Box className="order-details">
                  <Typography variant="body1" className="order-details-title">
                    CHI TIẾT ĐƠN HÀNG
                  </Typography>
                  {cart.map((item) => (
                    <Box
                      key={item.orderItemId}
                      className="order-detail-item"
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <Box>
                        <Box component="span" className="order-detail-text">
                          <span
                            style={{
                              color: "#b0855b",
                              fontSize: "20px",
                              padding: "0px 20px",
                            }}
                          >
                            {item.quantity}x
                          </span>
                          <span
                            className="order-detail-name"
                            style={{
                              color: "#8e857c",
                              fontSize: "20px",
                              fontWeight: "bold",
                            }}
                          >
                            {item.product?.productName || "Unknown Product"}
                          </span>
                        </Box>
                      </Box>
                      <Box
                        className="order-detail-actions"
                        sx={{ display: "flex", alignItems: "center" }}
                      >
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
                          $
                          {(
                            (item.price || item.product?.prize || 0) *
                            item.quantity
                          ).toFixed(2)}
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
                      cart.forEach((item) => {
                        if (item.product?.productId) {
                          dispatch(
                            updateCartItemQuantity({
                              productId: item.product.productId,
                              quantity: 0,
                            })
                          );
                          dispatch(
                            removeFromCartApi({
                              productId: item.product.productId,
                              quantity: item.quantity,
                            })
                          );
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
