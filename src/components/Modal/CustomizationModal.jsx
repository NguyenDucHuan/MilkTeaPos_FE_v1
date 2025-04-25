import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Typography,
  Modal,
  Radio,
  RadioGroup,
  FormControlLabel,
  Checkbox,
  IconButton,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import CloseIcon from "@mui/icons-material/Close";
import "./CustomizationModal.css";
import fetcher from "../../apis/fetcher";

const CustomizationModal = ({
  open,
  onClose,
  item,
  onAddToOrder,
  customization,
  setCustomization,
}) => {
  const [toppings, setToppings] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchToppings = async () => {
      try {
        setLoading(true);
        // Fetch page 1
        const response1 = await fetcher.get("/products", {
          params: {
            Page: 1
          }
        });
        
        // Fetch page 2
        const response2 = await fetcher.get("/products", {
          params: {
            Page: 2
          }
        });

        // Combine items from both pages
        const items1 = response1.data?.data?.items || [];
        const items2 = response2.data?.data?.items || [];
        const allItems = [...items1, ...items2];

        // Filter for Extra type products
        setToppings(allItems.filter(item => item.productType === "Extra"));
      } catch (error) {
        console.error("Error fetching toppings:", error);
      } finally {
        setLoading(false);
      }
    };

    if (open) {
      fetchToppings();
    }
  }, [open]);

  const handleCustomizationChange = (key, value) => {
    if (key === "size") {
      const selectedSize = item?.options?.sizes?.find((s) => s.label === value);
      const sizePrice = selectedSize?.priceModifier || 0;
      setCustomization({ ...customization, size: value, sizePrice });
    } else if (key === "toppings") {
      const updatedToppings = customization.toppings.includes(value)
        ? customization.toppings.filter((topping) => topping !== value)
        : [...customization.toppings, value];
      setCustomization({ ...customization, toppings: updatedToppings });
    } else if (key === "quantity") {
      const newQuantity = Math.max(1, customization.quantity + value);
      setCustomization({ ...customization, quantity: newQuantity });
    } else {
      setCustomization({ ...customization, [key]: value });
    }
  };

  // calculate the total price
  const handleAdd = () => {
    const toppingCost = customization.toppings.reduce((total, toppingName) => {
      const topping = item?.options?.toppings?.find(
        (t) => t.name === toppingName
      );
      return total + (topping ? topping.price : 0);
    }, 0);

    const itemPrice =
      (item?.basePrice || 0) + customization.sizePrice + toppingCost;
    const totalItemPrice = itemPrice * customization.quantity;

    onAddToOrder({
      ...item,
      size: customization.size,
      sugar: customization.sugar,
      ice: customization.ice,
      toppings: customization.toppings,
      quantity: customization.quantity,
      itemPrice: totalItemPrice,
    });
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box className="customization-modal">
        <Box className="customization-modal__header">
          <Typography className="customization-modal__title">
            {item?.name || "Item"}
          </Typography>
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>

        <Box className="customization-modal__content">
          <Box className="customization-modal__section">
            <Typography className="customization-modal__section-title">
              Size
            </Typography>
            <RadioGroup
              className="customization-modal__radio-group"
              row
              value={customization.size}
              onChange={(e) =>
                handleCustomizationChange("size", e.target.value)
              }
            >
              {item?.options?.sizes?.length > 0 ? (
                item.options.sizes.map((size) => (
                  <FormControlLabel
                    key={size.label}
                    value={size.label}
                    control={<Radio className="customization-modal__radio" />}
                    label={`${size.label} ${
                      size.priceModifier > 0
                        ? `+ $${size.priceModifier.toFixed(2)}`
                        : size.priceModifier < 0
                        ? `- $${Math.abs(size.priceModifier).toFixed(2)}`
                        : ""
                    }`}
                    className="customization-modal__label"
                  />
                ))
              ) : (
                <Typography>Không có kích cỡ</Typography>
              )}
            </RadioGroup>
          </Box>

          <Box className="customization-modal__section">
            <Typography className="customization-modal__section-title">
              Sugar Level
            </Typography>
            <RadioGroup
              className="customization-modal__radio-group"
              row
              value={customization.sugar}
              onChange={(e) =>
                handleCustomizationChange("sugar", e.target.value)
              }
            >
              {item?.options?.sugarLevels?.length > 0 ? (
                item.options.sugarLevels.map((level) => (
                  <FormControlLabel
                    key={level}
                    value={level}
                    control={<Radio className="customization-modal__radio" />}
                    label={level}
                    className="customization-modal__label"
                  />
                ))
              ) : (
                <Typography>Không có mức đường</Typography>
              )}
            </RadioGroup>
          </Box>

          <Box className="customization-modal__section">
            <Typography className="customization-modal__section-title">
              Ice Level
            </Typography>
            <RadioGroup
              className="customization-modal__radio-group"
              row
              value={customization.ice}
              onChange={(e) => handleCustomizationChange("ice", e.target.value)}
            >
              {item?.options?.iceLevels?.length > 0 ? (
                item.options.iceLevels.map((level) => (
                  <FormControlLabel
                    key={level}
                    value={level}
                    control={<Radio className="customization-modal__radio" />}
                    label={level}
                    className="customization-modal__label"
                  />
                ))
              ) : (
                <Typography>Không có mức đá</Typography>
              )}
            </RadioGroup>
          </Box>

          <Box className="customization-modal__section">
            <Typography className="customization-modal__section-title">
              Toppings
            </Typography>
            <Box sx={{ mt: 2 }}>
              <Typography variant="h6" sx={{ mb: 1 }}>Toppings</Typography>
              {loading ? (
                <Typography>Loading toppings...</Typography>
              ) : (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {toppings.map((topping) => (
                    <Chip
                      key={topping.productId}
                      label={`${topping.productName} ($${topping.price})`}
                      onClick={() => {
                        const isSelected = customization.toppings.some(t => t.productId === topping.productId);
                        if (isSelected) {
                          setCustomization(prev => ({
                            ...prev,
                            toppings: prev.toppings.filter(t => t.productId !== topping.productId)
                          }));
                        } else {
                          setCustomization(prev => ({
                            ...prev,
                            toppings: [...prev.toppings, topping]
                          }));
                        }
                      }}
                      color={customization.toppings.some(t => t.productId === topping.productId) ? "primary" : "default"}
                      variant={customization.toppings.some(t => t.productId === topping.productId) ? "filled" : "outlined"}
                    />
                  ))}
                </Box>
              )}
            </Box>
          </Box>

          {/* <Box className="customization-modal__section">
            <Typography className="customization-modal__section-title"> */}
              {/* Quantity
            </Typography>
            <Box className="customization-modal__quantity">
              <IconButton
                onClick={() => handleCustomizationChange("quantity", -1)}
              >
                <RemoveIcon />
              </IconButton>
              <Typography className="customization-modal__quantity-text">
                {customization.quantity}
              </Typography>
              <IconButton
                onClick={() => handleCustomizationChange("quantity", 1)}
              >
                <AddIcon />
              </IconButton>
            </Box>
          </Box> */}

          <Box className="customization-modal__actions">
            <Button
              onClick={onClose}
              className="customization-modal__button--cancel"
            >
              Cancel
            </Button>
            <Button
              onClick={handleAdd}
              className="customization-modal__button--add"
            >
              Add to Order
            </Button>
          </Box>
        </Box>
      </Box>
    </Modal>
  );
};

export default CustomizationModal;
