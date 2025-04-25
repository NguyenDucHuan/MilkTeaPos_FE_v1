import {
  Box,
  FormControl,
  MenuItem,
  Modal,
  Select,
  Typography,
  Button,
  CircularProgress,
} from "@mui/material";
import { useEffect, useState } from "react";
import "./ModalCheckout.css";
import { useDispatch, useSelector } from "react-redux";
import { listPaymentApi } from "../../store/slices/paymentSlice";
import { useNavigate } from "react-router-dom";
import fetcher from "../../apis/fetcher";

export default function ModalCheckout({ open, onClose, order, total }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { payment, isLoading, error } = useSelector((state) => state.payment);
  const [paymentMethod, setPaymentMethod] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (open) {
      dispatch(listPaymentApi());
    }
  }, [dispatch, open]);

  const handleChange = (event) => {
    setPaymentMethod(event.target.value);
  };

  const calculateItemPrice = (item) => {
    // Nếu là size Parent, lấy giá từ MasterProduct
    if (item.sizeId === "Parent") {
      const basePrice = Number(item.product?.price || 0);
      const toppingsPrice = (item.toppings || []).reduce(
        (total, topping) => total + (Number(topping.price) || 0),
        0
      );
      return (basePrice + toppingsPrice) * item.quantity;
    }

    // Nếu là size khác, lấy giá từ SingleProduct
    const variantPrice = Number(item.price || 0);
    const toppingsPrice = (item.toppings || []).reduce(
      (total, topping) => total + (Number(topping.price) || 0),
      0
    );
    return (variantPrice + toppingsPrice) * item.quantity;
  };

  const calculateSubtotal = (order) => {
    if (!order || !Array.isArray(order)) return 0;
    
    return order.reduce((total, item) => {
      return total + (Number(item.subPrice) || 0);
    }, 0);
  };

  const handleCreateOrder = async () => {
    try {
      setIsProcessing(true);
      const orderData = {
        note: "string",
        paymentMethodId: paymentMethod,
        staffId: 1
      };

      const response = await fetcher.post("/order", orderData);
      console.log("Order created:", response.data);

      // Đóng modal
      onClose();
      
      // Chuyển hướng đến trang danh sách đơn hàng
      navigate("/orders");
    } catch (error) {
      console.error("Error creating order:", error);
      // Có thể thêm xử lý hiển thị lỗi ở đây
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          bgcolor: "white",
          p: 0,
          borderRadius: "10px",
          width: "500px",
          height: "auto",
          boxShadow: 24,
        }}
      >
        {/* Header */}
        <Box className="modal-checkout__header">
          <Typography variant="h6" component="h2">
            Complete Order
          </Typography>
        </Box>

        {/* Body */}
        <Box className="modal-checkout__body">
          <Typography
            variant="body1"
            component="p"
            className="modal-checkout__body-title"
          >
            Payment Method
          </Typography>
          <FormControl fullWidth>
            <Select
              labelId="payment-method-label"
              value={paymentMethod}
              onChange={handleChange}
              disabled={isLoading || !!error || isProcessing}
            >
              {isLoading ? (
                <MenuItem value="" disabled>
                  <CircularProgress size={24} />
                </MenuItem>
              ) : error ? (
                <MenuItem value="" disabled>
                  Error: {error}
                </MenuItem>
              ) : payment && payment.length > 0 ? (
                payment.map((method) => (
                  <MenuItem
                    key={method.paymentMethodId}
                    value={method.paymentMethodId}
                  >
                    {method.methodName}
                  </MenuItem>
                ))
              ) : (
                <MenuItem value="" disabled>
                  No payment methods available
                </MenuItem>
              )}
            </Select>
          </FormControl>

          <Box className="modal-checkout__details" sx={{ mt: 2 }}>
            <Typography
              variant="body1"
              component="p"
              className="modal-checkout__details-title"
            >
              Order Summary
            </Typography>
            <Box className="modal-checkout__details-content">
              {order && order.length > 0 ? (
                order.map((item) => (
                  <Box key={item.orderItemId} className="modal-checkout__details-item">
                    <Typography variant="body2">
                      {item.quantity}x {item.productName}
                      {item.sizeId && item.sizeId !== "Parent" && (
                        <span style={{ color: "#666" }}> (Size: {item.sizeId})</span>
                      )}
                      {item.toppings && item.toppings.length > 0 && (
                        <Box sx={{ fontSize: "12px", color: "#666" }}>
                          Toppings:{" "}
                          {item.toppings.map((topping, index) => (
                            <span key={topping.toppingId}>
                              {index > 0 ? ", " : ""}
                              {topping.toppingName}
                            </span>
                          ))}
                        </Box>
                      )}
                    </Typography>
                    <Typography variant="body2">
                      ${(Number(item.subPrice) || 0).toFixed(2)}
                    </Typography>
                  </Box>
                ))
              ) : (
                <Typography variant="body2">No items in the order.</Typography>
              )}
            </Box>
            <Box className="order-summary">
              <Typography variant="body1" className="order-summary-title">
                TÓM TẮT ĐƠN HÀNG
              </Typography>
              <Box className="order-summary-item">
                <Typography variant="body2">SỐ MÓN:</Typography>
                <Typography variant="body2">
                  {order.reduce((sum, item) => sum + (item.quantity || 0), 0)}
                </Typography>
              </Box>
              <Box className="order-summary-item">
                <Typography variant="body2">TỔNG CỘNG:</Typography>
                <Typography variant="body2">
                  ${calculateSubtotal(order).toFixed(2)}
                </Typography>
              </Box>
              <Box className="order-summary-item">
                <Typography variant="body2">THÀNH TIỀN:</Typography>
                <Typography variant="body2" fontWeight="bold">
                  ${calculateSubtotal(order).toFixed(2)}
                </Typography>
              </Box>
            </Box>
          </Box>
        </Box>

        {/* Footer */}
        <Box className="modal-checkout__footer">
          <Button 
            variant="outlined" 
            onClick={onClose}
            disabled={isProcessing}
          >
            Hủy
          </Button>
          <Button
            variant="contained"
            color="primary"
            disabled={!paymentMethod || order.length === 0 || isProcessing}
            onClick={handleCreateOrder}
          >
            {isProcessing ? <CircularProgress size={24} /> : "Thanh toán"}
          </Button>
        </Box>
      </Box>
    </Modal>
  );
}