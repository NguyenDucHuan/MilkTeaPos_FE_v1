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

export default function ModalCheckout({ open, onClose, order }) {
  const dispatch = useDispatch();
  const { payment, isLoading, error } = useSelector((state) => state.payment);
  const [paymentMethod, setPaymentMethod] = useState("");

  useEffect(() => {
    if (open) {
      dispatch(listPaymentApi());
    }
  }, [dispatch, open]);

  const handleChange = (event) => {
    setPaymentMethod(event.target.value);
  };

  // Hàm tính tổng tiền từ order
  const calculateTotal = () => {
    if (!order || order.length === 0) return 0;
    return order.reduce((total, item) => total + item.itemPrice, 0);
  };

  const total = calculateTotal();

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
              disabled={isLoading || !!error}
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
                order.map((item, index) => (
                  <Typography
                    key={index}
                    variant="body2"
                    component="p"
                    className="modal-checkout__details-item"
                  >
                    {item.quantity} x {item.name}{" "}
                    <span>${item.itemPrice.toFixed(2)}</span>
                  </Typography>
                ))
              ) : (
                <Typography
                  variant="body2"
                  component="p"
                  className="modal-checkout__details-item"
                >
                  No items in the order.
                </Typography>
              )}
            </Box>
            <Typography
              variant="h6"
              component="p"
              className="modal-checkout__total-price"
            >
              Total: <span>${total.toFixed(2)}</span>
            </Typography>
          </Box>
        </Box>

        {/* Footer */}
        <Box className="modal-checkout__footer">
          <Button variant="outlined" onClick={onClose}>
            Hủy
          </Button>
          <Button
            variant="contained"
            onClick={() => alert("Đơn hàng đã được xác nhận!")}
            sx={{ ml: 2 }}
            disabled={!paymentMethod}
          >
            Xác nhận
          </Button>
        </Box>
      </Box>
    </Modal>
  );
}