import {
  Box,
  Button,
  CardContent,
  Divider,
  Grid,
  Tab,
  Tabs,
  Typography,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import "./HomePage.css";
import CustomizationModal from "../../../components/Modal/CustomizationModal";
import { listItemApi } from "../../../store/slices/itemSlice";

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
      size: item.options.sizes[1]?.label || "Medium", // Mặc định chọn size thứ 2 (Medium)
      sizePrice: item.options.sizes[1]?.priceModifier || 0,
      sugar: item.options.sugarLevels[4] || "100%", // Mặc định 100%
      ice: item.options.iceLevels[2] || "Regular", // Mặc định Regular
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
    setOrder([...order, customizedItem]);
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
        <Grid size={6} className="menu-section">
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
                  <Grid item xs={6} key={item.id} className="menu-item">
                    <Box
                      className="menu-item-image-placeholder"
                      component="img"
                      src={item.image}
                      alt={item.name}
                      sx={{ width: "100%", height: "auto" }}
                    />
                    <CardContent className="menu-item-content">
                      <Typography variant="h6" className="menu-item-name">
                        {item.name}
                      </Typography>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        className="menu-item-description"
                      >
                        {item.description}
                      </Typography>
                      <Typography
                        variant="h6"
                        color="text.primary"
                        className="menu-item-price"
                      >
                        ${item.basePrice.toFixed(2)}
                      </Typography>
                    </CardContent>
                    <Box className="menu-item-actions">
                      <Button
                        onClick={() => handleOpenModal(item)}
                        className="menu-item-add-button"
                      >
                        Add
                      </Button>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            ) : (
              <Typography>Không có món nào để hiển thị.</Typography>
            )}
          </Box>
        </Grid>
        <Grid size={6} className="order-section">
          <Typography variant="h6" className="order-title">
            CURRENT ORDER
          </Typography>
          {order.length === 0 ? (
            <Box className="order-empty-message">
              <Typography variant="body1" className="order-empty-text">
                No items in order yet
              </Typography>
              <Typography variant="body2" className="order-empty-subtext">
                Add items from the menu to get started
              </Typography>
            </Box>
          ) : (
            <>
              <Box className="order-summary">
                <Typography variant="body1" className="order-summary-title">
                  ORDER SUMMARY
                </Typography>
                <Typography variant="body2" className="order-summary-item">
                  ITEMS: {order.length}
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
                  <Box key={index} className="order-detail-item">
                    <Typography variant="body2" className="order-detail-text">
                      {item.quantity}x {item.name} <br />
                      {item.size}, {item.sugar} sugar, {item.ice} ice
                      {item.toppings.length > 0 && (
                        <>
                          <br />
                          Toppings: {item.toppings.join(", ")}
                        </>
                      )}
                    </Typography>
                    <Typography variant="body2" className="order-detail-price">
                      ${item.itemPrice.toFixed(2)}
                    </Typography>
                  </Box>
                ))}
              </Box>
              <Box className="order-actions">
                <Button
                  variant="outlined"
                  onClick={handleClearOrder}
                  className="order-clear-button"
                >
                  Clear
                </Button>
                <Button variant="contained" className="order-checkout-button">
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