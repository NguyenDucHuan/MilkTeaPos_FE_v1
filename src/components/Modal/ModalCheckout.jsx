import {
  Box,
  FormControl,
  MenuItem,
  Modal,
  Select,
  Typography,
  Button,
  CircularProgress,
  TextField,
  InputAdornment,
} from "@mui/material";
import { useEffect, useState } from "react";
import "./ModalCheckout.css";
import { useDispatch, useSelector } from "react-redux";
import { listPaymentApi } from "../../store/slices/paymentSlice";
import { fetchVouchers, setSelectedVoucher, clearSelectedVoucher } from "../../store/slices/voucherSlice";
import { useNavigate } from "react-router-dom";
import fetcher from "../../apis/fetcher";
import toast from "react-hot-toast";
import LocalOfferIcon from '@mui/icons-material/LocalOffer';

export default function ModalCheckout({ open, onClose, cart, total }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { payment, isLoading: paymentLoading, error: paymentError } = useSelector((state) => state.payment);
  const { vouchers, selectedVoucher, isLoading: voucherLoading } = useSelector((state) => state.voucher);
  const [paymentMethod, setPaymentMethod] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [voucherCode, setVoucherCode] = useState("");

  useEffect(() => {
    if (open) {
      dispatch(listPaymentApi());
      dispatch(fetchVouchers());
    }
  }, [dispatch, open]);

  const handleChange = (event) => {
    setPaymentMethod(event.target.value);
  };

  const handleVoucherApply = () => {
    const voucher = vouchers.find(v => v.voucherCode === voucherCode && !v.status);
    if (voucher) {
      if (total >= voucher.minimumOrderAmount) {
        dispatch(setSelectedVoucher(voucher));
        toast.success("Voucher applied successfully!");
      } else {
        toast.error(`Minimum order amount is ${voucher.minimumOrderAmount.toLocaleString('vi-VN')} VNĐ`);
      }
    } else {
      toast.error("Invalid or expired voucher code");
    }
  };

  const handleVoucherRemove = () => {
    dispatch(clearSelectedVoucher());
    setVoucherCode("");
    toast.success("Voucher removed");
  };

  const calculateDiscount = () => {
    if (!selectedVoucher) return 0;
    if (selectedVoucher.discountType === "Percentage") {
      return total * selectedVoucher.discountAmount;
    }
    return selectedVoucher.discountAmount;
  };

  const calculateFinalTotal = () => {
    return total - calculateDiscount();
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

  const calculateSubtotal = (cart) => {
    if (!cart || !Array.isArray(cart)) return 0;
    
    return cart.reduce((total, item) => {
      return total + (Number(item.subPrice) || 0);
    }, 0);
  };

  const calculateTotalQuantity = (cart) => {
    if (!cart || !Array.isArray(cart)) return 0;
    return cart.reduce((sum, item) => sum + (item.quantity || 0), 0);
  };

  const handleCreateOrder = async () => {
    try {
      setIsProcessing(true);
      const orderData = {
        note: "string",
        paymentMethodId: paymentMethod,
        staffId: 1,
        voucherId: selectedVoucher?.voucherId,
        orderItems: cart.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          price: item.subPrice || item.price || 0,
        })),
      };

      const response = await fetcher.post("/order", orderData);
      toast.success("Order created successfully!");
      console.log("Order created:", response.data);

      // Đóng modal
      onClose();
      
      // Chuyển hướng đến trang danh sách đơn hàng
      navigate("/orders");
    } catch (error) {
      toast.error("Failed to create order. Please try again.");
      console.error("Error creating order:", error);
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
          maxHeight: "90vh",
          display: "flex",
          flexDirection: "column",
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
        <Box 
          className="modal-checkout__body"
          sx={{
            flex: 1,
            overflow: "hidden",
            display: "flex",
            flexDirection: "column"
          }}
        >
          {/* Voucher Section */}
          <Box sx={{ mb: 2 }}>
            <Typography variant="body1" className="modal-checkout__body-title">
              Voucher
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <TextField
                fullWidth
                placeholder="Nhập mã voucher"
                value={voucherCode}
                onChange={(e) => setVoucherCode(e.target.value)}
                disabled={!!selectedVoucher || voucherLoading}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LocalOfferIcon />
                    </InputAdornment>
                  ),
                }}
              />
              {selectedVoucher ? (
                <Button
                  variant="outlined"
                  color="error"
                  onClick={handleVoucherRemove}
                  disabled={voucherLoading}
                >
                  Xóa
                </Button>
              ) : (
                <Button
                  variant="contained"
                  onClick={handleVoucherApply}
                  disabled={!voucherCode || voucherLoading}
                >
                  Áp dụng
                </Button>
              )}
            </Box>
            {selectedVoucher && (
              <Typography variant="body2" sx={{ mt: 1, color: 'success.main' }}>
                Đã áp dụng: {selectedVoucher.voucherCode} - 
                {selectedVoucher.discountType === "Percentage" 
                  ? `${(selectedVoucher.discountAmount * 100)}% giảm giá`
                  : `${selectedVoucher.discountAmount.toLocaleString('vi-VN')} VNĐ giảm giá`}
              </Typography>
            )}

            {/* Danh sách voucher đang hoạt động */}
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" sx={{ color: '#666', mb: 1 }}>
                Voucher đang hoạt động:
              </Typography>
              <Box sx={{ 
                maxHeight: '150px', 
                overflowY: 'auto',
                '&::-webkit-scrollbar': {
                  width: '6px',
                },
                '&::-webkit-scrollbar-track': {
                  background: '#f1f1f1',
                  borderRadius: '3px',
                },
                '&::-webkit-scrollbar-thumb': {
                  background: '#8a5a2a',
                  borderRadius: '3px',
                },
              }}>
                {vouchers.filter(v => !v.status).map((voucher) => (
                  <Box
                    key={voucher.voucherId}
                    sx={{
                      p: 1.5,
                      mb: 1,
                      border: '1px solid #e0e0e0',
                      borderRadius: '8px',
                      backgroundColor: '#f9f5f1',
                      cursor: 'pointer',
                      '&:hover': {
                        backgroundColor: '#f0e6da',
                      },
                    }}
                    onClick={() => {
                      setVoucherCode(voucher.voucherCode);
                      handleVoucherApply();
                    }}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#8a5a2a' }}>
                        {voucher.voucherCode}
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#666' }}>
                        {voucher.discountType === "Percentage" 
                          ? `${(voucher.discountAmount * 100)}% giảm giá`
                          : `${voucher.discountAmount.toLocaleString('vi-VN')} VNĐ giảm giá`}
                      </Typography>
                    </Box>
                    <Typography variant="caption" sx={{ color: '#666', display: 'block', mt: 0.5 }}>
                      Đơn hàng tối thiểu: {voucher.minimumOrderAmount.toLocaleString('vi-VN')} VNĐ
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#666', display: 'block' }}>
                      Hết hạn: {new Date(voucher.expirationDate).toLocaleDateString('vi-VN')}
                    </Typography>
                  </Box>
                ))}
                {vouchers.filter(v => !v.status).length === 0 && (
                  <Typography variant="body2" sx={{ color: '#666', textAlign: 'center', py: 2 }}>
                    Không có voucher nào đang hoạt động
                  </Typography>
                )}
              </Box>
            </Box>
          </Box>

          {/* Payment Method Section */}
          <Typography variant="body1" className="modal-checkout__body-title">
            Payment Method
          </Typography>
          <FormControl fullWidth>
            <Select
              labelId="payment-method-label"
              value={paymentMethod}
              onChange={handleChange}
              disabled={paymentLoading || !!paymentError || isProcessing}
            >
              {paymentLoading ? (
                <MenuItem value="" disabled>
                  <CircularProgress size={24} />
                </MenuItem>
              ) : paymentError ? (
                <MenuItem value="" disabled>
                  Error: {paymentError}
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

          {/* Order Summary Section */}
          <Box 
            className="modal-checkout__details" 
            sx={{ 
              mt: 2,
              flex: 1,
              overflow: "hidden",
              display: "flex",
              flexDirection: "column"
            }}
          >
            <Typography variant="body1" className="modal-checkout__details-title">
              Order Summary
            </Typography>
            <Box 
              className="modal-checkout__details-content"
              sx={{
                flex: 1,
                overflowY: "auto",
                pr: 1,
                "&::-webkit-scrollbar": {
                  width: "8px",
                },
                "&::-webkit-scrollbar-track": {
                  background: "#f1f1f1",
                  borderRadius: "4px",
                },
                "&::-webkit-scrollbar-thumb": {
                  background: "#8a5a2a",
                  borderRadius: "4px",
                },
                "&::-webkit-scrollbar-thumb:hover": {
                  background: "#70482f",
                },
              }}
            >
              {cart && Array.isArray(cart) && cart.length > 0 ? (
                cart.map((item) => (
                  <Box 
                    key={item.orderItemId} 
                    className="modal-checkout__details-item"
                    sx={{
                      backgroundColor: '#f9f5f1',
                      borderRadius: '8px',
                      padding: '12px',
                      mb: 2,
                      width: '100%',
                      display: 'flex',
                      flexDirection: 'row',
                      alignItems: 'flex-start',
                      justifyContent: 'space-between'
                    }}
                  >
                    <Box sx={{ flex: 1 }}>
                      <Typography 
                        variant="body1" 
                        sx={{ 
                          color: '#8a5a2a',
                          fontWeight: 'bold',
                          fontSize: '16px'
                        }}
                      >
                        {item.quantity}x {item.productName}
                        {item.sizeId && item.sizeId !== "Parent" && (
                          <span style={{ color: "#666", fontWeight: "normal" }}> (Size: {item.sizeId})</span>
                        )}
                      </Typography>
                      {item.toppings && item.toppings.length > 0 && (
                        <Box sx={{ mt: 1, ml: 2 }}>
                          <Typography
                            variant="body2"
                            sx={{
                              color: "#8a5a2a",
                              fontSize: "14px",
                              fontWeight: "medium",
                              mb: 0.5
                            }}
                          >
                            {item.productType === 'Combo' ? 'Sản phẩm bao gồm:' : 'Topping bao gồm:'}
                          </Typography>
                          {item.toppings.map((topping, index) => (
                            <Box 
                              key={topping.toppingId}
                              sx={{ 
                                display: 'flex',
                                alignItems: 'center',
                                ml: 1,
                                mb: 0.5
                              }}
                            >
                              <Typography
                                variant="body2"
                                sx={{
                                  color: "#666",
                                  fontSize: "14px",
                                  minWidth: '20px'
                                }}
                              >
                                {index + 1}.
                              </Typography>
                              <Typography
                                variant="body2"
                                sx={{
                                  color: "#666",
                                  fontSize: "14px",
                                  ml: 1
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
                                  fontWeight: "medium"
                                }}
                              >
                                ({topping.quantity || 1} phần)
                              </Typography>
                            </Box>
                          ))}
                        </Box>
                      )}
                    </Box>
                    <Box sx={{ 
                      width: '120px',
                      display: 'flex',
                      justifyContent: 'flex-end',
                      alignItems: 'flex-start',
                      textAlign: 'right'
                    }}>
                      <Typography 
                        variant="body1"
                        sx={{ 
                          color: '#8a5a2a',
                          fontWeight: 'bold',
                          fontSize: '16px',
                          whiteSpace: 'nowrap',
                          width: '100%'
                        }}
                      >
                        {(Number(item.subPrice) || 0).toLocaleString('vi-VN')} VNĐ
                      </Typography>
                    </Box>
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
              <Box className="order-summary-item" sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2">SỐ MÓN:</Typography>
                <Typography variant="body2" sx={{ minWidth: '120px', textAlign: 'right' }}>
                  {calculateTotalQuantity(cart)}
                </Typography>
              </Box>
              <Box className="order-summary-item" sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2">TỔNG CỘNG:</Typography>
                <Typography variant="body2" sx={{ minWidth: '120px', textAlign: 'right' }}>
                  {total.toLocaleString('vi-VN')} VNĐ
                </Typography>
              </Box>
              {selectedVoucher && (
                <Box className="order-summary-item" sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2">GIẢM GIÁ:</Typography>
                  <Typography variant="body2" sx={{ minWidth: '120px', textAlign: 'right', color: 'success.main' }}>
                    -{calculateDiscount().toLocaleString('vi-VN')} VNĐ
                  </Typography>
                </Box>
              )}
              <Box className="order-summary-item" sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2">THÀNH TIỀN:</Typography>
                <Typography variant="body2" fontWeight="bold" sx={{ minWidth: '120px', textAlign: 'right' }}>
                  {calculateFinalTotal().toLocaleString('vi-VN')} VNĐ
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
            disabled={!paymentMethod || !cart || cart.length === 0 || isProcessing}
            onClick={handleCreateOrder}
          >
            {isProcessing ? <CircularProgress size={24} /> : "Thanh toán"}
          </Button>
        </Box>
      </Box>
    </Modal>
  );
}