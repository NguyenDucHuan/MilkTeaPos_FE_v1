import React, { useState } from 'react';
import {
  Box,
  Container,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Typography,
  Chip,
  IconButton,
  TextField,
  InputAdornment,
  Card,
  CardContent,
  Grid,
} from '@mui/material';
import {
  Search as SearchIcon,
  Visibility as VisibilityIcon,
  LocalShipping as ShippingIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  AccessTime as PendingIcon,
} from '@mui/icons-material';

// Mock data - replace with actual API call later
const mockOrders = [
  {
    id: '#ORD001',
    customerName: 'Nguyễn Văn A',
    items: [
      { name: 'Trà sữa truyền thống', quantity: 2, price: 25000 },
      { name: 'Trà sữa matcha', quantity: 1, price: 30000 },
    ],
    total: 80000,
    status: 'pending',
    orderDate: '2024-01-15T09:30:00',
    paymentMethod: 'Tiền mặt',
    address: '123 Đường ABC, Quận 1, TP.HCM',
    phone: '0123456789',
  },
  {
    id: '#ORD002',
    customerName: 'Trần Thị B',
    items: [
      { name: 'Trà đào', quantity: 3, price: 20000 },
      { name: 'Trà sữa chocolate', quantity: 2, price: 28000 },
    ],
    total: 116000,
    status: 'delivered',
    orderDate: '2024-01-15T10:15:00',
    paymentMethod: 'Momo',
    address: '456 Đường XYZ, Quận 2, TP.HCM',
    phone: '0987654321',
  },
  // Add more mock orders as needed
];

const statusColors = {
  pending: {
    color: 'warning',
    icon: PendingIcon,
    label: 'Đang xử lý',
  },
  processing: {
    color: 'info',
    icon: ShippingIcon,
    label: 'Đang giao',
  },
  delivered: {
    color: 'success',
    icon: CheckCircleIcon,
    label: 'Đã giao',
  },
  cancelled: {
    color: 'error',
    icon: CancelIcon,
    label: 'Đã hủy',
  },
};

const OrderList = () => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
    setPage(0);
  };

  const handleViewDetails = (order) => {
    setSelectedOrder(order);
  };

  const filteredOrders = mockOrders.filter((order) =>
    order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.customerName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString) => {
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
    }).format(amount);
  };

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography variant="h4" sx={{ mb: 4, color: '#895a2a', fontWeight: 'bold' }}>
          Danh sách đơn hàng
        </Typography>

        {/* Search and Filters */}
        <Box sx={{ mb: 3 }}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Tìm kiếm theo mã đơn hàng hoặc tên khách hàng..."
            value={searchTerm}
            onChange={handleSearch}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            sx={{
              maxWidth: 500,
              '& .MuiOutlinedInput-root': {
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#895a2a',
                },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#895a2a',
                },
              },
            }}
          />
        </Box>

        {/* Orders Table */}
        <TableContainer component={Paper} sx={{ mb: 4, boxShadow: 3 }}>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                <TableCell>Mã đơn hàng</TableCell>
                <TableCell>Khách hàng</TableCell>
                <TableCell>Ngày đặt</TableCell>
                <TableCell>Tổng tiền</TableCell>
                <TableCell>Trạng thái</TableCell>
                <TableCell align="center">Chi tiết</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredOrders
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((order) => {
                  const StatusIcon = statusColors[order.status].icon;
                  return (
                    <TableRow key={order.id} hover>
                      <TableCell>{order.id}</TableCell>
                      <TableCell>{order.customerName}</TableCell>
                      <TableCell>{formatDate(order.orderDate)}</TableCell>
                      <TableCell>{formatCurrency(order.total)}</TableCell>
                      <TableCell>
                        <Chip
                          icon={<StatusIcon />}
                          label={statusColors[order.status].label}
                          color={statusColors[order.status].color}
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="center">
                        <IconButton
                          onClick={() => handleViewDetails(order)}
                          sx={{ color: '#895a2a' }}
                        >
                          <VisibilityIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  );
                })}
            </TableBody>
          </Table>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={filteredOrders.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            labelRowsPerPage="Số dòng mỗi trang:"
          />
        </TableContainer>

        {/* Order Details */}
        {selectedOrder && (
          <Card sx={{ mb: 4, boxShadow: 3 }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, color: '#895a2a' }}>
                Chi tiết đơn hàng {selectedOrder.id}
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Thông tin khách hàng
                  </Typography>
                  <Box sx={{ mt: 1 }}>
                    <Typography>Tên: {selectedOrder.customerName}</Typography>
                    <Typography>SĐT: {selectedOrder.phone}</Typography>
                    <Typography>Địa chỉ: {selectedOrder.address}</Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Thông tin đơn hàng
                  </Typography>
                  <Box sx={{ mt: 1 }}>
                    <Typography>Ngày đặt: {formatDate(selectedOrder.orderDate)}</Typography>
                    <Typography>Phương thức thanh toán: {selectedOrder.paymentMethod}</Typography>
                    <Typography>Tổng tiền: {formatCurrency(selectedOrder.total)}</Typography>
                  </Box>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Sản phẩm
                  </Typography>
                  <Box sx={{ mt: 1 }}>
                    {selectedOrder.items.map((item, index) => (
                      <Typography key={index}>
                        {item.name} x {item.quantity} - {formatCurrency(item.price * item.quantity)}
                      </Typography>
                    ))}
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        )}
      </Container>
    </Box>
  );
};

export default OrderList; 