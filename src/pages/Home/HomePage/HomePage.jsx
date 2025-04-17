import {
  Box,
  Button,
  Card,
  CardContent,
  CardMedia,
  Divider,
  Grid,
  Tab,
  Tabs,
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

export default function HomePage() {
  const dispatch = useDispatch();
  const { item, isLoading, error } = useSelector((state) => state.item);
  const [tabValue, setTabValue] = useState(0);
  const [order, setOrder] = useState([]);
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

  useEffect(() => {
    dispatch(listItemApi());
  }, [dispatch]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleOpenModal = (item) => {
    setSelectedItem(item);
    setCustomization({
      size: item.options.sizes[1]?.label || "Medium",
      sizePrice: item.options.sizes[1]?.priceModifier || 0,
      sugar: item.options.sugarLevels[4] || "100%",
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
    const newQuantity = updatedOrder[index].quantity + change;
    if (newQuantity < 1) return;
    updatedOrder[index].quantity = newQuantity;
    const basePrice =
      updatedOrder[index].itemPrice / updatedOrder[index].quantity;
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

  const subtotal = calculateSubtotal();
  const tax = calculateTax(subtotal);
  const total = subtotal + tax;

  return (
    <Box className="home-page">
      <Grid container spacing={2} className="home-page-grid">
        <Grid size={7} className="menu-section">
          <Typography className="menu-title">Menu Items</Typography>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            variant="fullWidth"
            className="menu-tabs"
          >
            <Tab label="ALL ITEMS" className="menu-tab" />
            <Tab label="CLASSIC" className="menu-tab" />
            <Tab label="SPECIAL" className="menu-tab" />
            <Tab label="FRUIT" className="menu-tab" />
          </Tabs>

          <Box className="menu-items-container">
            <Divider className="menu-divider" />
            {isLoading ? (
              <Typography>Đang tải...</Typography>
            ) : error ? (
              <Typography color="error">Lỗi: {error}</Typography>
            ) : item.length > 0 ? (
              <Grid container spacing={2} className="menu-items-grid">
                {item.map((item) => (
                  <Grid key={item.id}>
                    <Card sx={{ maxWidth: 345 }} className="menu-item">
                      <CardMedia
                        className="menu-item-image-placeholder"
                        component="img"
                        src={item.image}
                        alt={item.name}
                        sx={{
                          width: "100%",
                          height: "150px",
                          maxWidth: "250px",
                          objectFit: "cover",
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
                          sx={{ marginTop: "5px" }}
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
            ) : (
              <Typography>Không có món nào để hiển thị.</Typography>
            )}
          </Box>
        </Grid>
        <Grid size={5} className="order-section">
          <Typography variant="h6" className="order-title">
            CURRENT ORDER
          </Typography>
          {order.length === 0 ? (
            <Box className="order-empty-message">
              <Box sx={{ textAlign: "center", marginTop: "-6%" }}>
                <ShoppingBagIcon
                  className="order-empty-icon"
                  sx={{
                    color: "#786c5f",
                    fontSize: "50px",
                    marginBottom: "5px",
                  }}
                />
                <Typography variant="body1" className="order-empty-text">
                  No items in order yet
                </Typography>
                <Typography variant="body2" className="order-empty-subtext">
                  Add items from the menu to get started
                </Typography>
              </Box>
            </Box>
          ) : (
            <>
              <Box className="order-summary">
                <Typography variant="body1" className="order-summary-title">
                  ORDER SUMMARY
                </Typography>
                <Typography variant="body2" className="order-summary-item">
                  ITEMS: {order.reduce((sum, item) => sum + item.quantity, 0)}
                </Typography>
                <Typography variant="body2" className="order-summary-subtotal">
                  SUBTOTAL: ${subtotal.toFixed(2)}
                </Typography>
                <Typography variant="body2" className="order-summary-tax">
                  TAX (8%): ${tax.toFixed(2)}
                </Typography>
                <Typography variant="body2" className="order-summary-total">
                  TOTAL: ${total.toFixed(2)}
                </Typography>
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
                              padding: " 0px 20px",
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
                        </Box>{" "}
                        <br />
                        <Box
                          sx={{
                            marginLeft: "66px",
                            color: "#bab1a8",
                            fontWeight: "bold",
                          }}
                        >
                          {item.size}, {item.sugar} sugar, {item.ice} ice,
                          {item.toppings.length > 0 && (
                            <>{item.toppings.join(", ")}</>
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
