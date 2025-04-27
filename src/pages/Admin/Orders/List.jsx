import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
  CircularProgress,
  IconButton,
  Modal,
  TablePagination,
  Chip,
} from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { fetchOrders } from "../../../store/slices/orderSlice";
import {
  Visibility as VisibilityIcon,
  Close as CloseIcon,
  LocalShipping as ShippingIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  AccessTime as PendingIcon,
  Payment as PaymentIcon,
  CreditCard as CreditCardIcon,
} from "@mui/icons-material";
import fetcher from "../../../apis/fetcher";

const statusColors = {
  Pending: {
    color: 'warning',
    icon: PendingIcon,
    label: 'Đang xử lý',
  },
  Processing: {
    color: 'info',
    icon: ShippingIcon,
    label: 'Đang giao',
  },
  Completed: {
    color: 'success',
    icon: CheckCircleIcon,
    label: 'Hoàn thành',
  },
  Cancelled: {
    color: 'error',
    icon: CancelIcon,
    label: 'Đã hủy',
  },
};

const paymentMethodColors = {
  1: {
    color: 'success',
    icon: PaymentIcon,
    label: 'Tiền mặt',
  },
  2: {
    color: 'primary',
    icon: CreditCardIcon,
    label: 'Thẻ',
  },
  3: {
    color: 'info',
    icon: PaymentIcon,
    label: 'Chuyển khoản',
  },
};

const OrderStatus = ({ status }) => {
  const statusInfo = statusColors[status] || statusColors.Pending;
  const StatusIcon = statusInfo.icon;
  return (
    <Chip
      icon={<StatusIcon />}
      label={statusInfo.label}
      color={statusInfo.color}
      size="small"
      variant="outlined"
    />
  );
};

const PaymentMethod = ({ methodId }) => {
  const methodInfo = paymentMethodColors[methodId] || paymentMethodColors[1];
  const MethodIcon = methodInfo.icon;
  return (
    <Chip
      icon={<MethodIcon />}
      label={methodInfo.label}
      color={methodInfo.color}
      size="small"
      variant="outlined"
    />
  );
};

export default function OrderList() {
  const dispatch = useDispatch();
  const { orders, isLoading, error } = useSelector((state) => state.order);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderDetails, setOrderDetails] = useState(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  useEffect(() => {
    dispatch(fetchOrders());
  }, [dispatch]);

  const handleViewDetails = async (order) => {
    try {
      setIsLoadingDetails(true);
      const response = await fetcher.get(`/order/get-by-id/${order.orderId}`);
      setOrderDetails(response.data.data);
      setSelectedOrder(order);
    } catch (error) {
      console.error('Error fetching order details:', error);
    } finally {
      setIsLoadingDetails(false);
    }
  };

  const handleCloseDetails = () => {
    setSelectedOrder(null);
    setOrderDetails(null);
  };

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

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography color="error">Error: {error}</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" fontWeight="bold" mb={2}>
        Danh sách đơn hàng
      </Typography>
      <Paper sx={{ p: 2 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Ngày tạo</TableCell>
              <TableCell>Tổng tiền</TableCell>
              <TableCell>Ghi chú</TableCell>
              <TableCell>Nhân viên</TableCell>
              <TableCell>Thanh toán</TableCell>
              <TableCell>Trạng thái</TableCell>
              <TableCell>Chi tiết</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {orders?.items
              ?.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((order) => (
                <TableRow key={order.orderId}>
                  <TableCell>{order.orderId}</TableCell>
                  <TableCell>{formatDate(order.createAt)}</TableCell>
                  <TableCell>{formatCurrency(order.totalAmount)}</TableCell>
                  <TableCell>{order.note || 'Không có'}</TableCell>
                  <TableCell>{order.staffId}</TableCell>
                  <TableCell>
                    <PaymentMethod methodId={order.paymentMethodId} />
                  </TableCell>
                  <TableCell>
                    <OrderStatus status={order.orderstatusupdates?.[0]?.orderStatus} />
                  </TableCell>
                  <TableCell>
                    <IconButton
                      onClick={() => handleViewDetails(order)}
                      size="small"
                    >
                      <VisibilityIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={orders?.items?.length || 0}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Số hàng mỗi trang"
          labelDisplayedRows={({ from, to, count }) => 
            `${from}-${to} trên ${count !== -1 ? count : `hơn ${to}`}`
          }
        />
      </Paper>

      {/* Order Details Modal */}
      <Modal
        open={!!selectedOrder}
        onClose={handleCloseDetails}
        aria-labelledby="order-details-modal"
      >
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '80%',
            maxWidth: '800px',
            bgcolor: 'background.paper',
            boxShadow: 24,
            p: 4,
            borderRadius: 2,
            maxHeight: '90vh',
            overflow: 'auto',
          }}
        >
          {isLoadingDetails ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress />
            </Box>
          ) : orderDetails ? (
            <>
              <Typography variant="h6" component="h2" gutterBottom>
                Chi tiết đơn hàng #{orderDetails.orderId}
              </Typography>
              
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Thông tin đơn hàng
                </Typography>
                <Typography variant="body2">
                  Ngày đặt: {formatDate(orderDetails.createAt)}
                </Typography>
                <Typography variant="body2">
                  Tổng tiền: {formatCurrency(orderDetails.totalAmount)}
                </Typography>
                <Typography variant="body2">
                  Trạng thái: {orderDetails.orderstatusupdates?.[0]?.orderStatus}
                </Typography>
                <Typography variant="body2">
                  Phương thức thanh toán: {orderDetails.paymentMethod?.methodName}
                </Typography>
                <Typography variant="body2">
                  Ghi chú: {orderDetails.note || 'Không có'}
                </Typography>
              </Box>

              <Typography variant="subtitle1" gutterBottom>
                Danh sách sản phẩm
              </Typography>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Sản phẩm</TableCell>
                    <TableCell>Size</TableCell>
                    <TableCell>Toppings</TableCell>
                    <TableCell align="right">Số lượng</TableCell>
                    <TableCell align="right">Đơn giá</TableCell>
                    <TableCell align="right">Thành tiền</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {orderDetails.orderitems
                    ?.filter(item => !item.masterId)
                    .map((item) => {
                      const toppings = item.product?.productType !== 'Extra' 
                        ? orderDetails.orderitems.filter(
                            topping => topping.masterId === item.orderItemId
                          )
                        : [];
                      
                      const basePrice = item.price;
                      const toppingsPrice = toppings.reduce(
                        (total, topping) => total + topping.price,
                        0
                      );
                      const totalPrice = basePrice + toppingsPrice;
                      
                      return (
                        <TableRow key={item.orderItemId}>
                          <TableCell>{item.product?.productName}</TableCell>
                          <TableCell>{item.product?.sizeId || 'Mặc định'}</TableCell>
                          <TableCell>
                            {toppings.length > 0 ? (
                              toppings.map((topping, index) => (
                                <span key={topping.orderItemId}>
                                  {index > 0 ? ', ' : ''}
                                  {topping.product?.productName}
                                </span>
                              ))
                            ) : 'Không có'}
                          </TableCell>
                          <TableCell align="right">{item.quantity}</TableCell>
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

              <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
                <IconButton onClick={handleCloseDetails}>
                  <CloseIcon />
                </IconButton>
              </Box>
            </>
          ) : (
            <Typography>Không tìm thấy thông tin chi tiết đơn hàng</Typography>
          )}
        </Box>
      </Modal>
    </Box>
  );
}

