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
import { useDispatch } from "react-redux";
import { addToCart, getCartApi } from "../../store/slices/orderSlice";

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
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchToppings = async () => {
      try {
        setLoading(true);
        // Fetch page 1
        const response1 = await fetcher.get("/products", {
          params: {
            Page: 1,
          },
        });

        // Fetch page 2
        const response2 = await fetcher.get("/products", {
          params: {
            Page: 2,
          },
        });

        // Combine items from both pages
        const items1 = response1.data?.data?.items || [];
        const items2 = response2.data?.data?.items || [];
        const allItems = [...items1, ...items2];

        // Filter for Extra type products
        setToppings(allItems.filter((item) => item.productType === "Extra"));
      } catch (error) {
        console.error("Error fetching toppings:", error);
      } finally {
        setLoading(false);
      }
    };

    if (open && item?.toppingAllowed) {
      fetchToppings();
    }
  }, [open, item?.toppingAllowed]);

  const handleCustomizationChange = (key, value) => {
    if (key === "size") {
      const selectedVariant = item?.variants?.find((v) => v.sizeId === value);
      setCustomization({ ...customization, size: value });
    } else if (key === "toppings" && item?.toppingAllowed) {
      const isSelected = customization.toppings.some(
        (t) => t.productId === value.productId
      );
      const updatedToppings = isSelected
        ? customization.toppings.filter((t) => t.productId !== value.productId)
        : [...customization.toppings, value];
      setCustomization({ ...customization, toppings: updatedToppings });
    } else if (key === "quantity") {
      const newQuantity = Math.max(1, customization.quantity + value);
      setCustomization({ ...customization, quantity: newQuantity });
    } else {
      setCustomization({ ...customization, [key]: value });
    }
  };

  const calculateTotalPrice = () => {
    console.log("Calculating price for item:", item);
    console.log("Current customization:", customization);

    // Nếu chọn size Parent, lấy giá của MasterProduct
    if (customization.size === "Parent") {
      const basePrice = Number(item?.price || 0);
      const toppingsPrice = item?.toppingAllowed
        ? customization.toppings.reduce(
            (total, topping) => total + (Number(topping.price) || 0),
            0
          )
        : 0;
      return (basePrice + toppingsPrice) * customization.quantity;
    }

    // Nếu chọn size khác, lấy giá của SingleProduct tương ứng
    const selectedVariant = item?.variants?.find(
      (variant) => variant.sizeId === customization.size
    );
    const variantPrice = Number(selectedVariant?.price || 0);

    // Tính giá toppings
    const toppingsPrice = item?.toppingAllowed
      ? customization.toppings.reduce(
          (total, topping) => total + (Number(topping.price) || 0),
          0
        )
      : 0;

    // Tổng giá = giá variant + giá toppings
    return (variantPrice + toppingsPrice) * customization.quantity;
  };

  const handleAddToOrder = async (customizedItem) => {
    try {
      // Tìm variant tương ứng với size đã chọn
      const selectedVariant = customizedItem.variants.find(
        (variant) => variant.sizeId === customization.size
      );

      if (!selectedVariant) {
        console.error("Selected size not found in variants");
        return;
      }

      const productId = selectedVariant.productId;
      const basePrice = Number(selectedVariant.price || 0);

      // Tính giá toppings
      const toppingsPrice = customizedItem.toppingAllowed
        ? customization.toppings.reduce(
            (total, topping) => total + (Number(topping.price) || 0),
            0
          )
        : 0;

      // Tổng giá = giá sản phẩm + giá toppings
      const totalPrice = (basePrice + toppingsPrice) * customization.quantity;

      console.log("Adding to cart:", {
        basePrice,
        toppingsPrice,
        quantity: customization.quantity,
        totalPrice,
      });

      if (isNaN(totalPrice)) {
        console.error("Invalid price for item:", customizedItem);
        return;
      }

      // Prepare toppingIds array
      const toppingIds = customizedItem.toppingAllowed
        ? customization.toppings.map((topping) => topping.productId)
        : [];

      // Call the new API endpoint
      const response = await fetcher.post("/order-item/add-to-cart", {
        productId: productId,
        quantity: customization.quantity,
        toppingIds: toppingIds,
        sizeId: customization.size,
        prize: totalPrice / customization.quantity,
      });

      if (response.data) {
        console.log("Item added to cart successfully:", response.data);
        // Update local cart state if needed
        dispatch(
          addToCart({
            orderItemId: response.data.orderItemId,
            productId: productId,
            quantity: customization.quantity,
            prize: totalPrice / customization.quantity,
            product: {
              productId: productId,
              productName: customizedItem.productName,
              prize: totalPrice / customization.quantity,
              imageUrl: customizedItem.imageUrl,
            },
            toppings: customizedItem.toppingAllowed
              ? customization.toppings
              : [],
            sizeId: customization.size,
            subPrice: totalPrice,
          })
        );

        // Refresh cart data
        await dispatch(getCartApi());
      }

      onClose();
    } catch (error) {
      console.error("Error adding to cart:", error);
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box className="customization-modal">
        <Box className="customization-modal__header">
          <Typography className="customization-modal__title">
            {item?.productName || "Item"}
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
                    label={`${size.label} = ${size.priceModifier.toLocaleString(
                      "vi-VN"
                    )} VNĐ`}
                    className="customization-modal__label"
                  />
                ))
              ) : (
                <Typography>Không có kích cỡ</Typography>
              )}
            </RadioGroup>
          </Box>

          {item?.toppingAllowed && (
            <Box className="customization-modal__section">
              <Typography className="customization-modal__section-title">
                Toppings
              </Typography>
              <Box sx={{ mt: 2 }}>
                {loading ? (
                  <Typography>Loading toppings...</Typography>
                ) : (
                  <Box
                    sx={{
                      display: "grid",
                      gridTemplateColumns:
                        "repeat(auto-fill, minmax(200px, 1fr))",
                      gap: 2,
                      padding: "10px",
                    }}
                  >
                    {toppings.map((topping) => (
                      <Chip
                        key={topping.productId}
                        label={`${
                          topping.productName
                        } (${topping.price.toLocaleString("vi-VN")} VNĐ)`}
                        onClick={() =>
                          handleCustomizationChange("toppings", topping)
                        }
                        color={
                          customization.toppings.some(
                            (t) => t.productId === topping.productId
                          )
                            ? "primary"
                            : "default"
                        }
                        variant={
                          customization.toppings.some(
                            (t) => t.productId === topping.productId
                          )
                            ? "filled"
                            : "outlined"
                        }
                        sx={{
                          height: "40px",
                          fontSize: "14px",
                          "&:hover": {
                            backgroundColor: "#f0e6d9",
                          },
                        }}
                      />
                    ))}
                  </Box>
                )}
              </Box>
            </Box>
          )}

          <Box className="customization-modal__actions">
            <Typography variant="h6" className="customization-modal__total">
              Tổng cộng: {calculateTotalPrice().toLocaleString("vi-VN")} VNĐ
            </Typography>
            <Button
              onClick={onClose}
              className="customization-modal__button--cancel"
            >
              Cancel
            </Button>
            <Button
              onClick={() => handleAddToOrder(item)}
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
