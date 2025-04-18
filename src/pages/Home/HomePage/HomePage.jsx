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
import CustomizationModal from "../../../components/Modal/CustomizationModal";
import { listItemApi } from "../../../store/slices/itemSlice";
import ShoppingBagIcon from "@mui/icons-material/ShoppingBag";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import DeleteIcon from "@mui/icons-material/Delete";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CardGiftcardIcon from "@mui/icons-material/CardGiftcard";
import LocalDrinkIcon from "@mui/icons-material/LocalDrink";
import StarIcon from "@mui/icons-material/Star";
import AppleIcon from "@mui/icons-material/Apple";
import { listCategory } from "../../../store/slices/categorySlice";

export default function HomePage() {
  const dispatch = useDispatch();
  const { item, isLoading, error } = useSelector((state) => state.item);
  const { category: categories } = useSelector((state) => state.category);

  const [order, setOrder] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [customization, setCustomization] = useState({
    size: "Medium",
    sizePrice: 0,
    sugar: "100%",
    ice: "Regular",
    toppings: [],
    quantity: 1,
  });

  useEffect(() => {
    dispatch(listItemApi());
    dispatch(listCategory());
  }, [dispatch]);

  const handleOpenModal = (item) => {
    setSelectedItem(item);
    setCustomization({
      size: item.options.sizes[0]?.label || "Medium",
      sizePrice: item.options.sizes[0]?.priceModifier || 0,
      sugar:
        item.options.sugarLevels[item.options.sugarLevels.length - 1] || "100%",
      ice: item.options.iceLevels[2] || "Regular",
      toppings: [],
      quantity: 1,
    });
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setSelectedItem(null);
  };

  const handleAddToOrder = (customizedItem) => {
    const existingItemIndex = order.findIndex(
      (orderItem) =>
        orderItem.name === customizedItem.name &&
        orderItem.size === customizedItem.size &&
        orderItem.sugar === customizedItem.sugar &&
        orderItem.ice === customizedItem.ice &&
        JSON.stringify(orderItem.toppings.sort()) ===
          JSON.stringify(customizedItem.toppings.sort())
    );

    if (existingItemIndex !== -1) {
      const updatedOrder = [...order];
      updatedOrder[existingItemIndex].quantity += customizedItem.quantity;
      updatedOrder[existingItemIndex].itemPrice +=
        customizedItem.itemPrice * customizedItem.quantity;
      setOrder(updatedOrder);
    } else {
      setOrder([...order, customizedItem]);
    }
    handleCloseModal();
  };

  const handleRemoveItem = (index) => {
    setOrder(order.filter((_, i) => i !== index));
  };

  const handleAdjustQuantity = (index, change) => {
    const updatedOrder = [...order];
    const currentQuantity = updatedOrder[index].quantity;
    const newQuantity = currentQuantity + change;
    if (newQuantity < 1) return;
    const basePrice = updatedOrder[index].itemPrice / currentQuantity;
    updatedOrder[index].quantity = newQuantity;
    updatedOrder[index].itemPrice = basePrice * newQuantity;
    setOrder(updatedOrder);
  };

  const handleClearOrder = () => {
    setOrder([]);
  };

  const calculateSubtotal = () => {
    return order.reduce((total, item) => total + item.itemPrice, 0);
  };

  const calculateTax = (subtotal) => {
    return subtotal * 0.08;
  };

  const getFilteredItems = () => {
    if (!selectedCategory) return item;
    const selectedCategoryObj = categories.find(
      (cat) => cat.displayName === selectedCategory
    );
    if (!selectedCategoryObj) return [];
    return item.filter((i) => i.category === selectedCategoryObj.apiName);
  };

  const handleCategoryClick = (category) => {
    setSelectedCategory(category);
  };

  const handleBackToCategories = () => {
    setSelectedCategory(null);
  };

  const subtotal = calculateSubtotal();
  const tax = calculateTax(subtotal);
  const total = subtotal + tax;

  return (
    <Box className="home-page">
      <Grid container spacing={2} className="home-page-grid">
        <Grid size={7} className="menu-section">
          <Typography className="menu-title">Menu Items</Typography>
          <Box className="menu-items-container">
            <Divider className="menu-divider" />
            {isLoading ? (
              <Typography>Đang tải...</Typography>
            ) : error ? (
              <Typography color="error">Lỗi: {error}</Typography>
            ) : selectedCategory === null ? (
              <Grid container spacing={2} className="category-grid">
                {categories.map((category) => (
                  <Grid item xs={4} key={category.displayName}>
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
                      onClick={() => handleCategoryClick(category.displayName)}
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
                            src={category.image}
                            alt={category.displayName}
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
                            {category.displayName}
                          </Typography>
                          <Typography variant="body2" sx={{ color: "#8a5a2a" }}>
                            {category.description}
                          </Typography>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            ) : getFilteredItems().length > 0 ? (
              <>
                <Button
                  startIcon={<ArrowBackIcon />}
                  onClick={handleBackToCategories}
                  sx={{ mb: 2, color: "#8a5a2a" }}
                >
                  Back to Categories
                </Button>
                <Grid container spacing={2} className="menu-items-grid">
                  {getFilteredItems().map((item) => (
                    <Grid key={item.id}>
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
                          src={item.image}
                          alt={item.name}
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
                            {item.name}
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
                              ${item.basePrice.toFixed(2)}
                            </Typography>
                            <Box className="menu-item-actions">
                              <button
                                onClick={() => handleOpenModal(item)}
                                className="menu-item-add-button"
                              >
                                Add
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
                  Back to Categories
                </Button>
                <Typography
                  variant="h6"
                  sx={{ color: "#8a5a2a", fontWeight: "bold" }}
                >
                  No items available in this category
                </Typography>
              </Box>
            )}
          </Box>
        </Grid>
        <Grid size={5} className="order-section">
          <Typography variant="h6" className="order-title">
            Current Order
          </Typography>
          {order.length === 0 ? (
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
                  No items in order yet
                </Typography>
                <Typography
                  variant="body2"
                  className="order-empty-subtext"
                  sx={{ color: "#8a5a2a" }}
                >
                  Add items from the menu to get started
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
                  ORDER SUMMARY
                </Typography>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    mb: "5px",
                  }}
                >
                  <Typography variant="body2" className="order-summary-item">
                    ITEMS:
                  </Typography>
                  <Typography variant="body2" className="order-summary-item">
                    {order.reduce((sum, item) => sum + item.quantity, 0)}
                  </Typography>
                </Box>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    mb: "5px",
                  }}
                >
                  <Typography
                    variant="body2"
                    className="order-summary-subtotal"
                  >
                    SUBTOTAL:
                  </Typography>
                  <Typography
                    variant="body2"
                    className="order-summary-subtotal"
                  >
                    ${subtotal.toFixed(2)}
                  </Typography>
                </Box>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    mb: "5px",
                    borderBottom: "1px solid #f0e6d9",
                  }}
                >
                  <Typography variant="body2" className="order-summary-tax">
                    TAX (8%):
                  </Typography>
                  <Typography variant="body2" className="order-summary-tax">
                    ${tax.toFixed(2)}
                  </Typography>
                </Box>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    mt: "5px",
                  }}
                >
                  <Typography variant="body2" className="order-summary-total">
                    TOTAL:
                  </Typography>
                  <Typography variant="body2" className="order-summary-total">
                    ${total.toFixed(2)}
                  </Typography>
                </Box>
              </Box>
              <Box className="order-details">
                <Typography variant="body1" className="order-details-title">
                  ORDER DETAILS
                </Typography>
                {order.map((item, index) => (
                  <Box
                    key={index}
                    className="order-detail-item"
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <Box>
                      <Typography variant="body2" className="order-detail-text">
                        <Box>
                          <span
                            style={{
                              color: "#b0855b",
                              fontSize: "20px",
                              padding: "0px 20px",
                            }}
                          >
                            {item.quantity}x{" "}
                          </span>
                          <span
                            style={{
                              color: "#8e857c",
                              fontSize: "20px",
                              fontWeight: "bold",
                            }}
                          >
                            {item.name}
                          </span>
                        </Box>
                        <br />
                        <Box
                          sx={{
                            marginLeft: "66px",
                            color: "#bab1a8",
                            fontWeight: "bold",
                          }}
                        >
                          {item.size}, {item.sugar} sugar, {item.ice} ice
                          {item.toppings.length > 0 && (
                            <>, {item.toppings.join(", ")}</>
                          )}
                          {item.isCombo && (
                            <Box>
                              Combo:{" "}
                              {item.comboItems.map((ci) => ci.name).join(", ")}
                            </Box>
                          )}
                        </Box>
                      </Typography>
                    </Box>
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <IconButton
                        onClick={() => handleAdjustQuantity(index, -1)}
                        size="small"
                      >
                        <RemoveIcon />
                      </IconButton>
                      <Typography sx={{ mx: 1 }}>{item.quantity}</Typography>
                      <IconButton
                        onClick={() => handleAdjustQuantity(index, 1)}
                        size="small"
                      >
                        <AddIcon />
                      </IconButton>
                      <Typography
                        variant="body2"
                        className="order-detail-price"
                        sx={{ mx: 2 }}
                      >
                        ${item.itemPrice.toFixed(2)}
                      </Typography>
                      <IconButton
                        onClick={() => handleRemoveItem(index)}
                        size="small"
                        color="error"
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
                  onClick={handleClearOrder}
                  className="order-clear-button"
                  fullWidth
                >
                  Clear
                </Button>
                <Button
                  variant="contained"
                  className="order-checkout-button"
                  fullWidth
                >
                  CHECKOUT
                </Button>
              </Box>
            </>
          )}
        </Grid>
      </Grid>

      <CustomizationModal
        open={openModal}
        onClose={handleCloseModal}
        item={selectedItem}
        onAddToOrder={handleAddToOrder}
        customization={customization}
        setCustomization={setCustomization}
      />
    </Box>
  );
}
