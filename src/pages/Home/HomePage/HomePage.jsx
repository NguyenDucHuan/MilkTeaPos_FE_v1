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
  addToCart,
} from "../../../store/slices/orderSlice";
import fetcher from "../../../apis/fetcher";

export default function HomePage() {
  const dispatch = useDispatch();
  const { items, isLoading, error } = useSelector((state) => state.item);
  const {
    category: categories,
    isLoading: categoryLoading,
    error: categoryError,
    currentPage: categoryPage,
    totalPages: categoryTotalPages,
    pageSize: categoryPageSize,
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
  const [page, setPage] = useState(categoryPage);

  useEffect(() => {
    dispatch(listCategory({ page, pageSize: categoryPageSize }));
    dispatch(getCartApi());
  }, [dispatch, page, categoryPageSize]);

  useEffect(() => {
    if (selectedCategory && categories.length > 0) {
      const selectedCategoryObj = categories.find(
        (cat) => cat.categoryName === selectedCategory
      );
      if (selectedCategoryObj) {
        console.log("Fetching products for CategoryId:", selectedCategoryObj.categoryId);
        dispatch(
          listItemApi({ CategoryId: selectedCategoryObj.categoryId })
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
  }, [dispatch, selectedCategory, categories]);

  useEffect(() => {
    console.log("Cart updated:", cart);
  }, [cart]);

  const handleOpenCheckoutModal = () => {
    setOpenCheckout(true);
  };

  const handleCloseCheckoutModal = () => {
    setOpenCheckout(false);
  };

  const handleOpenModal = async (item) => {
    // Check if the item is a combo
    if (item.productType === "Combo") {
      try {
        // Directly add combo to cart without opening customization modal
        console.log("Adding combo to cart:", item);
        dispatch(
          addToCart({
            product: { ...item, productId: item.productId, price: item.price },
            quantity: 1,
            size: "Parent",
          })
        );
        // Add combo to cart API
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

    // For non-combo items, proceed with customization modal
    if (!item || !item.variants || !Array.isArray(item.variants)) {
      console.error("Invalid item or variants:", item);
      return;
    }

    const sizes = item.variants.map((variant) => ({
      label: variant.sizeId || "Default",
      priceModifier: variant.price !== null && variant.price !== undefined ? variant.price : 0,
    }));

    const itemWithOptions = {
      ...item,
      basePrice: sizes[0]?.priceModifier || 0,
      options: {
        sizes,
      },
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

      console.log("Adding to cart:", customizedItem, "Price:", price);
      if (isNaN(price)) {
        console.error("Invalid price for item:", customizedItem);
        return;
      }

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

  const calculateSubtotal = () => {
    if (!Array.isArray(cart) || cart.length === 0) return 0;
    console.log("Cart items for subtotal calculation:", cart);
    
    return cart.reduce((total, item) => {
      console.log("Processing item:", {
        itemId: item.orderItemId,
        quantity: item.quantity,
        price: item.price,
        product: item.product
      });

      const itemPrice = Number(item.price || 0);
      
      if (isNaN(itemPrice)) {
        console.warn(`Invalid price for item:`, item);
        return total;
      }

      console.log(`Item total: ${itemPrice}`);
      
      return total + itemPrice;
    }, 0);
  };

  const calculateTotal = () => {
    return calculateSubtotal();
  };

  const handleUpdateQuantity = async (item, newQuantity, e) => {
    e?.preventDefault();
    e?.stopPropagation();

    console.log("Updating quantity for item:", {
      itemId: item.orderItemId,
      currentQuantity: item.quantity,
      newQuantity: newQuantity,
      price: item.price,
      product: item.product
    });

    try {
      const productId = item.product?.productId;
      if (!productId) {
        console.error("Invalid productId for item:", item);
        return;
      }

      if (newQuantity === 0) {
        await dispatch(
          removeFromCartApi({
            productId,
            quantity: item.quantity,
          })
        ).unwrap();
        dispatch(
          updateCartItemQuantity({
            productId,
            quantity: 0,
          })
        );
      } else if (newQuantity !== item.quantity) {
        const quantityChange = newQuantity - item.quantity;
        
        if (quantityChange > 0) {
          await dispatch(
            addToCartApi({
              masterId: productId,
              productId,
              quantity: quantityChange
            })
          ).unwrap();
        } else {
          await dispatch(
            removeFromCartApi({
              productId,
              quantity: Math.abs(quantityChange)
            })
          ).unwrap();
        }

        dispatch(
          updateCartItemQuantity({
            productId,
            quantity: newQuantity,
          })
        );
      }

      await dispatch(getCartApi()).unwrap();
    } catch (error) {
      console.error("Error updating quantity:", error);
      dispatch(
        updateCartItemQuantity({
          productId: item.product?.productId,
          quantity: item.quantity,
        })
      );
    }
  };

  const getFilteredItems = () => {
    console.log("Current items state:", items);
    if (!Array.isArray(items)) {
      console.warn("Items is not an array:", items);
      return [];
    }
    console.log("Filtered items:", items);
    return items;
  };

  const handleCategoryClick = (category) => {
    setSelectedCategory(category);
  };

  const handleBackToCategories = () => {
    setSelectedCategory(null);
  };

  const handlePageChange = (event, newPage) => {
    setPage(newPage);
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
            listItemApi({ CategoryId: selectedCategoryObj.categoryId })
          );
        }
      }

      setOpenCheckout(false);
    } catch (error) {
      console.error("Error creating order:", error);
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
            <>
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
                              src={category.imageUrl || "https://via.placeholder.com/100"}
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
              {categoryTotalPages > 1 && (
                <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
                  <Pagination
                    count={categoryTotalPages}
                    page={page}
                    onChange={handlePageChange}
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
                {getFilteredItems().map((item) => {
                  const firstVariant = item.variants?.[0] || {};
                  const price =
                    firstVariant.price !== null && firstVariant.price !== undefined
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
                          {/* Display comboItems for Combo products */}
                          {item.productType === "Combo" && item.comboItems && item.comboItems.length > 0 && (
                            <Box sx={{ marginTop: "5px", display: "flex", flexDirection: "row" }}>
                              <Typography variant="body2" sx={{ color: "#8a5a2a", fontWeight: "bold" }}>
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
                              ${price.toFixed(2)}
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
                            {item.product?.productName || "Unknown Product"} (
                            {item.size || "Default"})
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
                            item.price
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