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
import EditIcon from "@mui/icons-material/Edit";
import ModalUpdateCart from "../../../components/Modal/ModalUpdateCart";
import { getAllCategoriesForHomepage } from "../../../store/slices/categorySlice";
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
    materProducts: { items: materProducts, pagination: materPagination },
    combos: { items: combos },
    extras: { items: extras },
    isLoading,
    error,
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
  const { selectedCategory, setSelectedCategory } = useOutletContext();
  const [openCheckout, setOpenCheckout] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [customization, setCustomization] = useState({
    size: "Medium",
    sizePrice: 0,
    sugar: "100%",
    ice: "Regular",
    toppings: [],
    quantity: 1,
  });
  const [comboCurrentPage, setComboCurrentPage] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [editOrderItemId, setEditOrderItemId] = useState(null);

  // Log dữ liệu để debug
  useEffect(() => {
    console.log("MaterProducts:", materProducts);
    console.log("Combos:", combos);
    console.log("Extras:", extras);
    console.log("Categories:", categories);
    console.log("SelectedCategory:", selectedCategory);
  }, [materProducts, combos, extras, categories, selectedCategory]);

  // Tải danh sách topping nếu chưa có
  useEffect(() => {
    if (extras.length === 0) {
      dispatch(
        listItemApi({
          CategoryId: null, // Lấy tất cả topping, không giới hạn danh mục
          Page: 1,
          PageSize: 100, // Lấy đủ topping trong một lần gọi
          ProductType: "Extra",
        })
      ).then((result) => {
        if (result.meta.requestStatus === "fulfilled") {
          console.log("Toppings fetched successfully:", result.payload);
        } else {
          console.error("Error fetching toppings:", result.error);
        }
      });
    }
  }, [dispatch, extras.length]);

  useEffect(() => {
    dispatch(getAllCategoriesForHomepage());
    dispatch(getCartApi());
  }, [dispatch]);

  // Đặt selectedCategory mặc định nếu chưa có
  useEffect(() => {
    if (categories.length > 0 && !selectedCategory) {
      setSelectedCategory(categories[0].categoryName);
    }
  }, [categories, selectedCategory, setSelectedCategory]);

  // Đặt lại trang khi danh mục thay đổi
  useEffect(() => {
    setCurrentPage(1);
    setComboCurrentPage(1);
  }, [selectedCategory]);

  // Gọi listItemApi khi selectedCategory hoặc currentPage thay đổi
  useEffect(() => {
    if (categories.length > 0 && selectedCategory) {
      const selectedCategoryObj = categories.find(
        (cat) => cat.categoryName === selectedCategory
      );
      if (selectedCategoryObj) {
        dispatch(
          listItemApi({
            CategoryId: selectedCategoryObj.categoryId,
            Page: currentPage,
            PageSize: pageSize,
            ProductType:
              selectedCategory === "Topping"
                ? "Extra"
                : selectedCategory === "Combo"
                ? "Combo"
                : "MaterProduct",
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
  }, [dispatch, selectedCategory, categories, currentPage, pageSize]);

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
    if (!item) {
      console.error("No item provided to open modal");
      return;
    }

    if (item.productType?.toLowerCase() === "extra") {
      console.log("Processing as topping");
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
            productId: item.productId,
            quantity: 1,
            toppingIds: [],
          })
        ).unwrap();
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
          toppings: customizedItem.toppingAllowed
            ? customizedItem.toppings
            : [],
        })
      );

      await dispatch(
        addToCartApi({
          masterId: customizedItem.productId,
          productId,
          quantity: customizedItem.quantity,
          price,
          toppingIds: customizedItem.toppingAllowed
            ? customizedItem.toppings.map((t) => t.toppingId)
            : [],
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
    console.log("Filtering items for category:", selectedCategory);
    if (selectedCategory === "Combo") {
      console.log("Returning combos:", combos);
      return combos;
    } else if (selectedCategory === "Topping") {
      console.log("Returning extras:", extras);
      return extras;
    } else {
      console.log("Returning materProducts:", materProducts);
      return materProducts;
    }
  };

  const handleCategoryClick = (category) => {
    setSelectedCategory(category);
  };

  const handleComboPageChange = (event, newPage) => {
    setComboCurrentPage(newPage);
  };

  const handlePageChange = (event, newPage) => {
    setCurrentPage(newPage);
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
          toppingIds: item.toppings?.map((t) => t.toppingId) || [],
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
              Page: currentPage,
              PageSize: pageSize,
              ProductType:
                selectedCategory === "Topping"
                  ? "Extra"
                  : selectedCategory === "Combo"
                  ? "Combo"
                  : "MaterProduct",
            })
          );
        }
      }

      setOpenCheckout(false);
    } catch (error) {
      console.error("Error creating order:", error);
    }
  };

  const paginatedCombos = useMemo(() => {
    console.log("Paginating combos:", combos);
    const startIndex = (comboCurrentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return combos.slice(startIndex, endIndex);
  }, [combos, comboCurrentPage, pageSize]);

  const totalComboPages = useMemo(() => {
    return Math.ceil(combos.length / pageSize);
  }, [combos, pageSize]);

  const handleOpenEditModal = (orderItemId) => {
    setEditOrderItemId(orderItemId);
    setOpenEditModal(true);
  };

  const handleCloseEditModal = () => {
    setOpenEditModal(false);
    setEditOrderItemId(null);
  };

  return (
    <Box className="home-page" sx={{ display: "flex" }}>
      <Grid
        item
        size={3}
        sx={{
          borderRight: "1px solid #e0e0e0",
          height: "100vh",
          overflowY: "auto",
        }}
      >
        <Box sx={{ p: 2 }}>
          <Typography
            variant="h6"
            sx={{ color: "#8a5a2a", fontWeight: "bold", mb: 2 }}
          >
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

      <Grid container spacing={2} sx={{ flex: 1, ml: 2 }}>
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
                {(selectedCategory === "Combo"
                  ? paginatedCombos
                  : getFilteredItems()
                ).map((item) => {
                  const firstVariant = item.variants?.[0] || {};
                  const price =
                    firstVariant.price !== null &&
                    firstVariant.price !== undefined
                      ? firstVariant.price
                      : item.price || 0;

                  return (
                    <Grid size={4} item key={item.productId}>
                      <Card
                        sx={{
                          maxWidth: 345,
                          borderRadius: "15px",
                          border: "1px solid #f0e6d9",
                          width: "100%",
                          height: "450px",
                          display: "flex",
                          flexDirection: "column",
                          position: "relative",
                          ...(item.status === false && {
                            "&::after": {
                              content: '""',
                              position: "absolute",
                              top: 0,
                              left: 0,
                              right: 0,
                              bottom: 0,
                              background: "rgba(138, 90, 42, 0.1)",
                              zIndex: 1,
                              pointerEvents: "none",
                            },
                            "&::before": {
                              content: '"TẠM NGƯNG BÁN"',
                              position: "absolute",
                              top: "50%",
                              left: "50%",
                              transform: "translate(-50%, -50%) rotate(-45deg)",
                              backgroundColor: "rgba(138, 90, 42, 0.8)",
                              color: "white",
                              padding: "8px 40px",
                              fontSize: "1.2rem",
                              fontWeight: "bold",
                              zIndex: 2,
                              whiteSpace: "nowrap",
                              pointerEvents: "none",
                            }
                          })
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
                            width: "100%",
                            objectFit: "cover",
                          }}
                        />
                        <CardContent
                          sx={{
                            flexGrow: 1,
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "space-between",
                            padding: "16px",
                          }}
                          className="menu-item-content"
                        >
                          <Box>
                            <Typography
                              variant="h6"
                              className="menu-item-name"
                              sx={{
                                color: "#8a5a2a",
                                minHeight: "32px",
                                fontSize: "1.25rem",
                              }}
                            >
                              {item.productName}
                            </Typography>
                            {/* {item.status === false && (
                              <Typography 
                                variant="caption" 
                                sx={{ 
                                  color: 'error.main',
                                  backgroundColor: 'error.light',
                                  padding: '2px 8px',
                                  borderRadius: '4px',
                                  display: 'inline-block',
                                  mb: 1
                                }}
                              >
                                Tạm ngưng bán
                              </Typography>
                            )} */}
                            <Typography
                              variant="body2"
                              color="text.secondary"
                              className="menu-item-description"
                              sx={{
                                minHeight: "60px",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                display: "-webkit-box",
                                WebkitLineClamp: 3,
                                WebkitBoxOrient: "vertical",
                                marginTop: "8px",
                              }}
                            >
                              {item.description}
                            </Typography>
                            {item.productType === "Combo" &&
                              item.comboItems &&
                              item.comboItems.length > 0 && (
                                <Box
                                  sx={{
                                    marginTop: "8px",
                                    minHeight: "60px",
                                    overflow: "hidden",
                                  }}
                                >
                                  <Typography
                                    variant="body2"
                                    sx={{
                                      color: "#8a5a2a",
                                      fontWeight: "bold",
                                    }}
                                  >
                                    Bao gồm:
                                  </Typography>
                                  {item.comboItems.map((comboItem) => (
                                    <Typography
                                      key={comboItem.comboItemId}
                                      variant="body2"
                                      sx={{ color: "#8a5a2a" }}
                                    >
                                      - {comboItem.quantity}{" "}
                                      {comboItem.productName}
                                    </Typography>
                                  ))}
                                </Box>
                              )}
                            {item.toppingAllowed &&
                              item.toppings &&
                              item.toppings.length > 0 && (
                                <Box
                                  sx={{
                                    marginTop: "8px",
                                    minHeight: "60px",
                                    overflow: "hidden",
                                  }}
                                >
                                  <Typography
                                    variant="body2"
                                    sx={{
                                      color: "#8a5a2a",
                                      fontWeight: "bold",
                                    }}
                                  >
                                    Topping đi kèm:
                                  </Typography>
                                  {item.toppings.map((topping) => {
                                    const toppingDetails = extras.find(
                                      (extra) =>
                                        extra.productId === topping.toppingId
                                    );
                                    console.log(
                                      `Topping ID: ${topping.toppingId}, Details:`,
                                      toppingDetails,
                                      "Extras:",
                                      extras
                                    );
                                    return (
                                      <Typography
                                        key={topping.toppingId}
                                        variant="body2"
                                        sx={{ color: "#8a5a2a" }}
                                      >
                                        -{" "}
                                        {toppingDetails?.productName ||
                                          "Loading Topping..."}{" "}
                                        ({topping.quantity} phần)
                                      </Typography>
                                    );
                                  })}
                                </Box>
                              )}
                          </Box>
                          <Box
                            sx={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              marginTop: "auto",
                            }}
                          >
                            <Typography
                              variant="h6"
                              color="text.primary"
                              className="menu-item-price"
                              sx={{ color: "#8a5a2a", fontSize: "1.25rem" }}
                            >
                              {price.toLocaleString("vi-VN")} VNĐ
                            </Typography>
                            <Box className="menu-item-actions">
                              {item.status !== false && (
                                <button
                                  onClick={() => handleOpenModal(item)}
                                  className="menu-item-add-button"
                                  style={{
                                    padding: "8px 16px",
                                    backgroundColor: "#8a5a2a",
                                    color: "white",
                                    border: "none",
                                    borderRadius: "8px",
                                    cursor: "pointer",
                                  }}
                                >
                                  Thêm
                                </button>
                              )}
                            </Box>
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>
                  );
                })}
              </Grid>
              {selectedCategory === "Combo" && totalComboPages > 1 && (
                <Box sx={{ display: "flex", justifyContent: "center", mt: 5 }}>
                  <Pagination
                    count={totalComboPages}
                    page={comboCurrentPage}
                    onChange={handleComboPageChange}
                    color="primary"
                    sx={{
                      "& .MuiPaginationItem-root": {
                        color: "#8a5a2a",
                      },
                    }}
                  />
                </Box>
              )}
              {selectedCategory !== "Combo" &&
                materPagination.totalPages > 1 && (
                  <Box
                    sx={{ display: "flex", justifyContent: "center", mt: 5 }}
                  >
                    <Pagination
                      count={materPagination.totalPages}
                      page={currentPage}
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
          ) : (
            <Typography
              variant="h6"
              sx={{ color: "#8a5a2a", fontWeight: "bold", mt: 2 }}
            >
              Không có món nào trong danh mục này. Hãy thử danh mục khác!
            </Typography>
          )}
        </Grid>

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
                      {cart.reduce(
                        (sum, item) => sum + (item.quantity || 0),
                        0
                      )}
                    </Typography>
                  </Box>
                  <Box className="order-summary-item">
                    <Typography variant="body2">TỔNG CỘNG:</Typography>
                    <Typography variant="body2">
                      {calculateSubtotal().toLocaleString("vi-VN")} VNĐ
                    </Typography>
                  </Box>
                  <Box className="order-summary-item">
                    <Typography variant="body2">THÀNH TIỀN:</Typography>
                    <Typography variant="body2" fontWeight="bold">
                      {calculateSubtotal().toLocaleString("vi-VN")} VNĐ
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
                            {item.sizeId &&
                              item.sizeId !== "Parent" &&
                              ` (${item.sizeId})`}
                          </span>
                          {item.toppings && item.toppings.length > 0 && (
                            <Box
                              sx={{
                                ml: 6,
                                mt: 0.5,
                                backgroundColor: "#f9f5f1",
                                borderRadius: "8px",
                                padding: "8px 12px",
                                width: "fit-content",
                              }}
                            >
                              <Typography
                                variant="body2"
                                sx={{
                                  color: "#8a5a2a",
                                  fontSize: "14px",
                                  fontWeight: "bold",
                                  mb: 1,
                                }}
                              >
                                Topping thêm bao gồm:
                              </Typography>
                              {item.toppings.map((topping, index) => (
                                <Box
                                  key={topping.toppingId}
                                  sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    ml: 1,
                                    mb: 0.5,
                                  }}
                                >
                                  <Typography
                                    variant="body2"
                                    sx={{
                                      color: "#666",
                                      fontSize: "14px",
                                      minWidth: "20px",
                                    }}
                                  >
                                    {index + 1}.
                                  </Typography>
                                  <Typography
                                    variant="body2"
                                    sx={{
                                      color: "#666",
                                      fontSize: "14px",
                                      ml: 1,
                                    }}
                                  >
                                    {topping.toppingName}
                                  </Typography>
                                  <Typography
                                    variant="body2"
                                    sx={{
                                      color: "#8a5a2a",
                                      fontSize: "14px",
                                      ml: 1,
                                      fontWeight: "medium",
                                    }}
                                  >
                                    ({topping.quantity || 1} phần)
                                  </Typography>
                                  <Typography
                                    variant="body2"
                                    sx={{
                                      color: "#b0855b",
                                      fontSize: "14px",
                                      ml: 2,
                                      fontWeight: "bold",
                                    }}
                                  >
                                    {topping.price
                                      ? `${Number(topping.price).toLocaleString(
                                          "vi-VN"
                                        )} VNĐ`
                                      : ""}
                                  </Typography>
                                </Box>
                              ))}
                            </Box>
                          )}
                        </Box>
                        <Box sx={{ mt: 1 }}>
                          <Typography
                            variant="body2"
                            sx={{
                              color: "#8a5a2a",
                              fontWeight: "bold",
                              fontSize: "15px",
                            }}
                          >
                            Thành tiền:{" "}
                            {(
                              Number(item.subPrice) || calculateItemPrice(item)
                            ).toLocaleString("vi-VN")}{" "}
                            VNĐ
                          </Typography>
                        </Box>
                      </Box>
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        <IconButton
                          onClick={(e) =>
                            handleUpdateQuantity(item, item.quantity - 1, e)
                          }
                          sx={{ color: "#8a5a2a" }}
                        >
                          <RemoveIcon />
                        </IconButton>
                        <Typography>{item.quantity}</Typography>
                        <IconButton
                          onClick={(e) =>
                            handleUpdateQuantity(item, item.quantity + 1, e)
                          }
                          sx={{ color: "#8a5a2a" }}
                        >
                          <AddIcon />
                        </IconButton>
                        <IconButton
                          onClick={(e) => handleUpdateQuantity(item, 0, e)}
                          sx={{ color: "#8a5a2a" }}
                        >
                          <DeleteIcon />
                        </IconButton>
                        <IconButton
                          onClick={() => handleOpenEditModal(item.orderItemId)}
                          sx={{ color: "#8a5a2a", ml: 1 }}
                        >
                          <EditIcon />
                        </IconButton>
                      </Box>
                    </Box>
                  ))}
                </Box>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    mt: 2,
                  }}
                >
                  <Button
                    variant="outlined"
                    onClick={handleClearCart}
                    sx={{
                      color: "#8a5a2a",
                      borderColor: "#8a5a2a",
                      "&:hover": {
                        borderColor: "#8a5a2a",
                        backgroundColor: "#f0e6d9",
                      },
                    }}
                  >
                    Xóa đơn hàng
                  </Button>
                  <Button
                    variant="contained"
                    onClick={handleOpenCheckoutModal}
                    sx={{
                      backgroundColor: "#8a5a2a",
                      "&:hover": { backgroundColor: "#70482f" },
                    }}
                    disabled={cart.length === 0}
                  >
                    Thanh toán
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
        toppings={extras}
      />

      <ModalCheckout
        open={openCheckout}
        onClose={handleCloseCheckoutModal}
        cart={cart}
        subtotal={subtotal}
        total={total}
        offers={offers}
        onCreateOrder={handleCreateOrder}
      />

      <ModalUpdateCart
        open={openEditModal}
        onClose={handleCloseEditModal}
        orderItemId={editOrderItemId}
      />
    </Box>
  );
}
