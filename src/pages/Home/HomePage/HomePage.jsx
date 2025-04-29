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
  Pagination,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
} from "@mui/material";
import React, { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import "./HomePage.css";
import ModalCheckout from "../../../components/Modal/ModalCheckout";
import CustomizationModal from "../../../components/Modal/CustomizationModal";
import ShoppingBagIcon from "@mui/icons-material/ShoppingBag";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import DeleteIcon from "@mui/icons-material/Delete";
import { getallCategory } from "../../../store/slices/categorySlice";
import { listItemApi } from "../../../store/slices/itemSlice";
import { useOutletContext } from "react-router-dom";
import {
  addToCartApi,
  getCartApi,
  updateCartItemQuantity,
  removeFromCartApi,
  addToCart,
  clearCartApi,
} from "../../../store/slices/orderSlice";
import fetcher from "../../../apis/fetcher";

export default function HomePage() {
  const dispatch = useDispatch();
  const {
    items,
    isLoading,
    error,
    currentPage: itemPage,
    totalPages: itemTotalPages,
    pageSize: itemPageSize,
  } = useSelector((state) => state.item);
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
  const [itemCurrentPage, setItemCurrentPage] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(6); // Số sản phẩm hiển thị trên mỗi trang

  useEffect(() => {
    // Fetch all categories without pagination
    dispatch(getallCategory());
    dispatch(getCartApi());
  }, [dispatch]);

  useEffect(() => {
    if (selectedCategory && categories.length > 0) {
      const selectedCategoryObj = categories.find(
        (cat) => cat.categoryName === selectedCategory
      );
      if (selectedCategoryObj) {
        dispatch(
          listItemApi({
            CategoryId: selectedCategoryObj.categoryId,
            Page: itemCurrentPage,
            PageSize: itemPageSize,
          })
        ).then((result) => {
          if (result.meta.requestStatus === "fulfilled") {
            console.log("Products fetched successfully:", result.payload);
          } else {
            console.error("Error fetching items:", result.error);
          }
        });
      } else {
        console.warn("Selected category not found:", selectedCategory);
      }
    }
  }, [dispatch, selectedCategory, categories, itemCurrentPage, itemPageSize]);

  useEffect(() => {
    console.log("Cart updated:", cart);
  }, [cart]);

  useEffect(() => {
    const refreshCart = async () => {
      try {
        await dispatch(getCartApi()).unwrap();
      } catch (error) {
        console.error("Error refreshing cart:", error);
      }
    };
    refreshCart();
  }, [dispatch, cart.length]);

  const handleOpenCheckoutModal = () => {
    setOpenCheckout(true);
  };

  const handleCloseCheckoutModal = () => {
    setOpenCheckout(false);
  };

  const handleOpenModal = async (item) => {
    console.log("Item being processed:", item);
    console.log("Product Type:", item.productType);

    // Xử lý topping trực tiếp
    if (item.productType?.toLowerCase() === "extra") {
      console.log("Processing as topping");
      try {
        // Thêm vào giỏ hàng local
        dispatch(
          addToCart({
            product: { ...item, productId: item.productId, price: item.price },
            quantity: 1,
            size: "Parent",
          })
        );
        // Gọi API thêm vào giỏ hàng
        await dispatch(
          addToCartApi({
            productId: item.productId,
            quantity: 1,
            toppingIds: []
          })
        ).unwrap();
        // Cập nhật giỏ hàng
        await dispatch(getCartApi()).unwrap();
      } catch (error) {
        console.error("Error adding topping to cart:", error);
        dispatch(
          updateCartItemQuantity({
            productId: item.productId,
            quantity: 0,
          })
        );
      }
      return;
    }

    // Xử lý combo
    if (item.productType === "Combo") {
      try {
        dispatch(
          addToCart({
            product: { ...item, productId: item.productId, price: item.price },
            quantity: 1,
            size: "Parent",
          })
        );
        await dispatch(
          addToCartApi({
            masterId: item.productId,
            productId: item.productId,
            quantity: 1,
            price: item.price,
          })
        ).unwrap();
        await dispatch(getCartApi()).unwrap();
      } catch (error) {
        console.error("Error adding combo to cart:", error);
        dispatch(
          updateCartItemQuantity({
            productId: item.productId,
            quantity: 0,
          })
        );
      }
      return;
    }

    // Xử lý sản phẩm thông thường (không phải topping và không phải combo)
    if (!item || !item.variants || !Array.isArray(item.variants)) {
      console.error("Invalid item or variants:", item);
      return;
    }

    const sizes = item.variants.map((variant) => ({
      label: variant.sizeId || "Default",
      priceModifier:
        variant.price !== null && variant.price !== undefined
          ? variant.price
          : 0,
    }));

    const itemWithOptions = {
      ...item,
      basePrice: sizes[0]?.priceModifier || 0,
      options: { sizes },
    };

    setSelectedItem(itemWithOptions);
    setCustomization({
      size: sizes.length > 0 ? sizes[0].label : "",
      sizePrice: sizes.length > 0 ? sizes[0].priceModifier : 0,
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
      const selectedVariant = customizedItem.variants.find(
        (variant) => variant.sizeId === customizedItem.size
      );
      const productId = selectedVariant
        ? selectedVariant.productId
        : customizedItem.productId;
      const price = selectedVariant
        ? Number(selectedVariant.price)
        : Number(customizedItem.basePrice || 0);

      dispatch(
        addToCart({
          product: { ...customizedItem, productId, price },
          quantity: customizedItem.quantity,
          size: customizedItem.size,
        })
      );

      await dispatch(
        addToCartApi({
          masterId: customizedItem.productId,
          productId,
          quantity: customizedItem.quantity,
          price,
        })
      ).unwrap();

      await dispatch(getCartApi()).unwrap();
      handleCloseModal();
    } catch (error) {
      console.error("Error adding to cart:", error);
      dispatch(
        updateCartItemQuantity({
          productId: customizedItem.productId,
          quantity: 0,
        })
      );
    }
  };

  const calculateItemPrice = (item) => {
    if (item.sizeId === "Parent") {
      const basePrice = Number(item.product?.price || 0);
      const toppingsPrice = (item.toppings || []).reduce(
        (total, topping) => total + (Number(topping.price) || 0),
        0
      );
      return (basePrice + toppingsPrice) * item.quantity;
    }

    const variantPrice = Number(item.price || 0);
    const toppingsPrice = (item.toppings || []).reduce(
      (total, topping) => total + (Number(topping.price) || 0),
      0
    );
    return (variantPrice + toppingsPrice) * item.quantity;
  };

  const calculateSubtotal = () => {
    if (!cart || !Array.isArray(cart)) return 0;
    return cart.reduce((total, item) => {
      return total + (Number(item.subPrice) || 0);
    }, 0);
  };

  const calculateTotal = () => {
    return calculateSubtotal();
  };

  const handleUpdateQuantity = async (item, newQuantity, e) => {
    e?.preventDefault();
    e?.stopPropagation();

    try {
      if (newQuantity === 0) {
        await dispatch(
          removeFromCartApi({
            orderItemId: item.orderItemId,
            quantity: item.quantity,
          })
        ).unwrap();
      } else if (newQuantity < item.quantity) {
        await dispatch(
          removeFromCartApi({
            orderItemId: item.orderItemId,
            quantity: 1,
          })
        ).unwrap();
      } else if (newQuantity > item.quantity) {
        await dispatch(
          addToCartApi({
            productId: item.productId,
            quantity: 1,
            toppingIds: item.toppings?.map((t) => t.toppingId) || [],
          })
        ).unwrap();
      }
      await dispatch(getCartApi());
    } catch (error) {
      console.error("Error updating quantity:", error);
    }
  };

  const handleClearCart = async () => {
    try {
      for (const item of cart) {
        await dispatch(
          removeFromCartApi({
            orderItemId: item.orderItemId,
            quantity: item.quantity,
          })
        );
      }
      await dispatch(getCartApi());
    } catch (error) {
      console.error("Error clearing cart:", error);
    }
  };

  const getFilteredItems = () => {
    if (!Array.isArray(items)) {
      console.warn("Items is not an array:", items);
      return [];
    }
    return items;
  };

  const handleCategoryClick = (category) => {
    setSelectedCategory(category);
    setItemCurrentPage(1);
  };

  const handleItemPageChange = (event, newPage) => {
    setItemCurrentPage(newPage);
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
          price: item.price || item.product?.price || 0,
        })),
      };

      await fetcher.post("/order", orderData);
      await dispatch(getCartApi());

      if (selectedCategory && categories.length > 0) {
        const selectedCategoryObj = categories.find(
          (cat) => cat.categoryName === selectedCategory
        );
        if (selectedCategoryObj) {
          await dispatch(
            listItemApi({
              CategoryId: selectedCategoryObj.categoryId,
              Page: itemCurrentPage,
              PageSize: itemPageSize,
            })
          );
        }
      }

      setOpenCheckout(false);
    } catch (error) {
      console.error("Error creating order:", error);
    }
  };

  // Lọc và phân trang combo
  const combos = useMemo(() => {
    const filteredCombos = items.filter(item => item.categoryId === 5 && item.categoryName === "Combo");
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return filteredCombos.slice(startIndex, endIndex);
  }, [items, currentPage, pageSize]);

  // Tính tổng số trang
  const totalPages = useMemo(() => {
    const totalCombos = items.filter(item => item.categoryId === 5 && item.categoryName === "Combo").length;
    return Math.ceil(totalCombos / pageSize);
  }, [items, pageSize]);

  const handlePageChange = (event, newPage) => {
    setCurrentPage(newPage);
  };

  return (
    <Box className="home-page" sx={{ display: "flex" }}>
      {/* Sidebar for Categories */}
      <Grid item size={3} sx={{ borderRight: "1px solid #e0e0e0", height: "100vh", overflowY: "auto" }}>
        <Box sx={{ p: 2 }}>
          <Typography variant="h6" sx={{ color: "#8a5a2a", fontWeight: "bold", mb: 2 }}>
            Danh mục
          </Typography>
          {categoryLoading ? (
            <Typography>Đang tải danh mục...</Typography>
          ) : categoryError ? (
            <Typography color="error">Lỗi: {categoryError}</Typography>
          ) : (
            <List>
              {Array.isArray(categories) && categories.length > 0 ? (
                categories.map((category) => (
                  <ListItem key={category.categoryId} disablePadding>
                    <ListItemButton
                      selected={selectedCategory === category.categoryName}
                      onClick={() => handleCategoryClick(category.categoryName)}
                      sx={{
                        borderRadius: "8px",
                        mb: 1,
                        "&.Mui-selected": {
                          backgroundColor: "#f0e6d9",
                        },
                        "&:hover": {
                          backgroundColor: "#f9f5f1",
                        },
                      }}
                    >
                      <ListItemText
                        primary={category.categoryName}
                        primaryTypographyProps={{
                          sx: { color: "#8a5a2a", fontWeight: "medium" },
                        }}
                      />
                    </ListItemButton>
                  </ListItem>
                ))
              ) : (
                <Typography>Không có danh mục nào</Typography>
              )}
            </List>
          )}
        </Box>
      </Grid>

      {/* Main Content */}
      <Grid container spacing={2} sx={{ flex: 1, ml: 2 }}>
        {/* Menu Items Section */}
        <Grid item size={8} className="menu-section">
          <Typography className="menu-title">Menu Items</Typography>
          <Divider className="menu-divider" />
          {isLoading ? (
            <Typography>Đang tải sản phẩm...</Typography>
          ) : error ? (
            <Typography color="error">Lỗi: {error}</Typography>
          ) : !selectedCategory ? (
            <Typography
              variant="h6"
              sx={{ color: "#8a5a2a", fontWeight: "bold", mt: 2 }}
            >
              Vui lòng chọn một danh mục
            </Typography>
          ) : getFilteredItems().length > 0 ? (
            <>
              <Grid container spacing={2} className="menu-items-grid">
                {getFilteredItems().map((item) => {
                  const firstVariant = item.variants?.[0] || {};
                  const price =
                    firstVariant.price !== null &&
                    firstVariant.price !== undefined
                      ? firstVariant.price
                      : item.price || 0;

                  return (
                    <Grid item key={item.productId}>
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
                          src={
                            item.imageUrl || "https://via.placeholder.com/150"
                          }
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
                          {item.productType === "Combo" &&
                            item.comboItems &&
                            item.comboItems.length > 0 && (
                              <Box
                                sx={{
                                  marginTop: "5px",
                                  display: "flex",
                                  flexDirection: "row",
                                }}
                              >
                                <Typography
                                  variant="body2"
                                  sx={{ color: "#8a5a2a", fontWeight: "bold" }}
                                >
                                  Bao gồm:
                                </Typography>
                                {item.comboItems.map((comboItem) => (
                                  <Typography
                                    key={comboItem.comboItemId}
                                    variant="body2"
                                    sx={{ color: "#8a5a2a" }}
                                  >
                                    - {comboItem.quantity} {comboItem.productName}
                                  </Typography>
                                ))}
                              </Box>
                            )}
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
                              {price.toLocaleString('vi-VN')} VNĐ
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
                  );
                })}
              </Grid>
              {itemTotalPages > 1 && (
                <Box sx={{ display: "flex", justifyContent: "center", mt: 5 }}>
                  <Pagination
                    count={itemTotalPages}
                    page={itemCurrentPage}
                    onChange={handleItemPageChange}
                    color="primary"
                    sx={{
                      "& .MuiPaginationItem-root": {
                        color: "#8a5a2a",
                      },
                    }}
                  />
                </Box>
              )}
            </>
          ) : (
            <Typography
              variant="h6"
              sx={{ color: "#8a5a2a", fontWeight: "bold", mt: 2 }}
            >
              Không có món nào trong danh mục này
            </Typography>
          )}
        </Grid>

        {/* Order Section */}
        <Grid item size={4} className="order-section">
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
                      {cart.reduce((sum, item) => sum + (item.quantity || 0), 0)}
                    </Typography>
                  </Box>
                  <Box className="order-summary-item">
                    <Typography variant="body2">TỔNG CỘNG:</Typography>
                    <Typography variant="body2">
                      {calculateSubtotal().toLocaleString('vi-VN')} VNĐ
                    </Typography>
                  </Box>
                  <Box className="order-summary-item">
                    <Typography variant="body2">THÀNH TIỀN:</Typography>
                    <Typography variant="body2" fontWeight="bold">
                      {calculateSubtotal().toLocaleString('vi-VN')} VNĐ
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
                            {item.productName}
                            {item.sizeId && item.sizeId !== "Parent" && ` (${item.sizeId})`}
                            {item.toppings && item.toppings.length > 0 && (
                              <Box sx={{ fontSize: "14px", color: "#666" }}>
                                {item.toppings.map((topping, index) => (
                                  <span key={topping.toppingId}>
                                    {index > 0 ? ", " : ""}
                                    {topping.toppingName}
                                  </span>
                                ))}
                              </Box>
                            )}
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
                          {(item.subPrice || 0).toLocaleString('vi-VN')} VNĐ
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
                    className="order-detail-button"
                    onClick={handleClearCart}
                    sx={{
                      backgroundColor: "#b0855b",
                      color: "white",
                      "&:hover": {
                        backgroundColor: "#8d6b48",
                      },
                    }}
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

      {/* Phần hiển thị combo */}
      <Box sx={{ mt: 4 }}>
        <Typography variant="h5" sx={{ mb: 2, color: '#8B5E3C' }}>
        </Typography>
        <Grid container spacing={2}>
          {combos.map((item) => (
            <Grid item xs={12} sm={6} md={4} key={item.productId}>
              {/* Card hiển thị combo */}
            </Grid>
          ))}
        </Grid>
        {totalPages > 1 && (
          <Box display="flex" justifyContent="center" mt={3}>
            <Pagination
              count={totalPages}
              page={currentPage}
              onChange={handlePageChange}
              color="primary"
              sx={{
                '& .Mui-selected': {
                  bgcolor: '#8B5E3C !important',
                  color: 'white',
                },
                '& .MuiPaginationItem-root': {
                  color: '#8B5E3C',
                },
              }}
            />
          </Box>
        )}
      </Box>
    </Box>
  );
}