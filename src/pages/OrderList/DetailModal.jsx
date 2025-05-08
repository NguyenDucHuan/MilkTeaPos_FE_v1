import React from 'react';
import {
  Modal,
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  CircularProgress,
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import OrderStatus from './OrderStatus';

const DetailModal = ({ open, onClose, orderDetails, isLoadingDetails, selectedOrder }) => {
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const options = {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    };
    return new Date(dateString).toLocaleString('vi-VN', options);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount || 0);
  };

  const normalizeStatus = (status) => {
    if (!status) return 'Pending';
    if (status === 'Success') return 'Success';
    if ([
      'Successed', 'Successfull', 'Done', 'Completed'
    ].includes(status)) return 'Completed';
    if (status === 'Cancel' || status === 'Cancelled') return 'Cancelled';
    if (status === 'Processing') return 'Processing';
    if (status === 'Pending') return 'Pending';
    return status;
  };

  const PaymentStatus = ({ paymentStatus }) => {
    const isPaid = paymentStatus === 'Paid';
    return (
      <div 
        className={`flex items-center gap-2 px-3 py-1 rounded-full ${isPaid ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}
      >
        <span className="text-sm font-medium">{isPaid ? 'Đã thanh toán' : 'Chưa thanh toán'}</span>
      </div>
    );
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      aria-labelledby="order-detail-modal"
    >
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '90%',
          maxWidth: 1000,
          bgcolor: 'background.paper',
          boxShadow: 24,
          p: 4,
          borderRadius: 2,
          maxHeight: '90vh',
          overflowY: 'auto',
        }}
      >
        {isLoadingDetails ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        ) : orderDetails ? (
          <>
            <div className="flex justify-between items-center mb-4">
              <Typography variant="h6" component="h2">
                Chi tiết đơn hàng #{orderDetails.orderId}
              </Typography>
              <IconButton onClick={onClose}>
                <CloseIcon />
              </IconButton>
            </div>

            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" gutterBottom>
                Thông tin đơn hàng
              </Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2 }}>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Ngày tạo: {formatDate(orderDetails.createAt)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Tổng tiền: {formatCurrency(orderDetails.totalAmount)}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Phương thức thanh toán: {orderDetails.paymentMethod || 'Chưa thanh toán'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Trạng thái: <OrderStatus status={normalizeStatus(orderDetails.status)} />
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Thanh toán: <PaymentStatus paymentStatus={selectedOrder?.paymentStatus} />
                  </Typography>
                </Box>
              </Box>
            </Box>

            <Typography variant="subtitle1" gutterBottom>
              Danh sách sản phẩm
            </Typography>
            <TableContainer component={Paper}>
              <Table sx={{ minWidth: 900 }}>
                <TableHead>
                  <TableRow>
                    <TableCell>Sản phẩm</TableCell>
                    <TableCell>Size</TableCell>
                    <TableCell>Toppings</TableCell>
                    <TableCell align="right" sx={{ width: 100 }}>Số lượng</TableCell>
                    <TableCell align="right" sx={{ width: 140 }}>Đơn giá</TableCell>
                    <TableCell align="right" sx={{ width: 160 }}>Thành tiền</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {orderDetails.orderitems
                    ?.filter(item => !item.masterId)
                    .map((item) => {
                      // Tìm các topping liên quan nếu là sản phẩm chính
                      const toppings = item.product?.productType !== 'Extra' 
                        ? orderDetails.orderitems.filter(
                            topping => topping.masterId === item.orderItemId
                          )
                        : [];
                      
                      // Giá sản phẩm sau khi áp dụng combo
                      const itemPrice = item.price || 0;
                      // Tổng giá topping
                      const toppingsPrice = toppings.reduce(
                        (total, topping) => total + (topping.price || 0),
                        0
                      );
                      // Tổng giá (sản phẩm + topping)
                      const totalPrice = itemPrice + toppingsPrice;

                      return (
                        <TableRow key={item.orderItemId}>
                          <TableCell>
                            <div style={{ fontWeight: 600, color: '#8a5a2a', fontSize: 15 }}>
                              {item.product?.productName}
                              {item.product?.sizeId && (
                                <span style={{ color: '#70482f', fontWeight: 400, fontSize: 13 }}>
                                  {' '}({item.product.sizeId})
                                </span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            {item.product?.sizeId || 'Mặc định'}
                          </TableCell>
                          <TableCell>
                            {toppings.length > 0 ? (
                              <ul style={{ margin: 0, paddingLeft: 20 }}>
                                {toppings.map(topping => (
                                  <li key={topping.orderItemId} style={{ color: '#b0855b' }}>
                                    {topping.product?.productName} ({formatCurrency(topping.price)})
                                  </li>
                                ))}
                              </ul>
                            ) : (
                              <span style={{ color: '#b0855b' }}>Không có</span>
                            )}
                          </TableCell>
                          <TableCell align="right">
                            {item.quantity}
                          </TableCell>
                          <TableCell align="right">
                            {formatCurrency(totalPrice)}
                          </TableCell>
                          <TableCell align="right">
                            {formatCurrency(totalPrice * item.quantity)}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                </TableBody>
              </Table>
            </TableContainer>

            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
              <IconButton onClick={onClose}>
                <CloseIcon />
              </IconButton>
            </Box>
          </>
        ) : (
          <Typography>Không tìm thấy thông tin chi tiết đơn hàng</Typography>
        )}
      </Box>
    </Modal>
  );
};

export default DetailModal; 