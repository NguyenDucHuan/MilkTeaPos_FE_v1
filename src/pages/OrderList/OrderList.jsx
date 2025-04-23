import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Avatar,
  IconButton,
  InputAdornment,
  TextField,
  CircularProgress,
} from '@mui/material';
import {
  Search as SearchIcon,
  Visibility as VisibilityIcon,
  LocalShipping as ShippingIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  AccessTime as PendingIcon,
} from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { fetchOrders } from '../../store/slices/orderSlice';

const statusColors = {
  Pending: {
    color: 'bg-yellow-100 text-yellow-800',
    icon: PendingIcon,
    label: 'Đang xử lý',
  },
  Processing: {
    color: 'bg-blue-100 text-blue-800',
    icon: ShippingIcon,
    label: 'Đang giao',
  },
  Completed: {
    color: 'bg-green-100 text-green-800',
    icon: CheckCircleIcon,
    label: 'Hoàn thành',
  },
  Cancelled: {
    color: 'bg-red-100 text-red-800',
    icon: CancelIcon,
    label: 'Đã hủy',
  },
};

const OrderList = () => {
  const dispatch = useDispatch();
  const { orders, isLoading, error } = useSelector((state) => state.order);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    dispatch(fetchOrders());
  }, [dispatch]);

  const handleChangePage = (newPage) => {
    setPage(newPage);
  };

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
    setPage(0);
  };

  const handleViewDetails = (order) => {
    setSelectedOrder(order === selectedOrder ? null : order);
  };

  const filteredOrders = orders?.items
    ? orders.items.filter((order) =>
        order.orderId.toString().includes(searchTerm.toLowerCase()) ||
        order.note?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];

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

  const OrderStatus = ({ status }) => {
    const statusInfo = statusColors[status] || statusColors.Pending;
    const StatusIcon = statusInfo.icon;
    return (
      <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${statusInfo.color}`}>
        <StatusIcon className="w-4 h-4" />
        <span className="text-sm font-medium">{statusInfo.label}</span>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <CircularProgress />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Typography color="error">Error: {error}</Typography>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <Container maxWidth="lg">
        <div className="bg-white rounded-xl shadow-lg p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <Typography variant="h4" className="text-gray-800 font-bold">
              Danh sách đơn hàng
            </Typography>
            <TextField
              placeholder="Tìm kiếm đơn hàng..."
              value={searchTerm}
              onChange={handleSearch}
              className="w-80"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon className="text-gray-400" />
                  </InputAdornment>
                ),
                className: "bg-gray-50 rounded-lg",
              }}
            />
          </div>

          {/* Orders List */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Mã đơn hàng
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ngày đặt
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tổng tiền
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Trạng thái
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Chi tiết
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                      Không có đơn hàng nào
                    </td>
                  </tr>
                ) : (
                  filteredOrders
                    .slice(page * rowsPerPage, (page + 1) * rowsPerPage)
                    .map((order) => (
                      <tr key={order.orderId} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          #{order.orderId}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(order.createAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                          {formatCurrency(order.totalAmount)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <OrderStatus status={order.orderstatusupdates?.[0]?.orderStatus} />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <IconButton
                            onClick={() => handleViewDetails(order)}
                            className="text-primary hover:text-primary-dark"
                          >
                            <VisibilityIcon />
                          </IconButton>
                        </td>
                      </tr>
                    ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between px-4 py-3 bg-white border-t border-gray-200 sm:px-6">
            <div className="flex items-center">
              <span className="text-sm text-gray-700">
                Hiển thị {filteredOrders.length > 0 ? page * rowsPerPage + 1 : 0} đến{' '}
                {Math.min((page + 1) * rowsPerPage, filteredOrders.length)} trong{' '}
                {filteredOrders.length} kết quả
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handleChangePage(page - 1)}
                disabled={page === 0}
                className="relative inline-flex items-center px-4 py-2 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Trước
              </button>
              <button
                onClick={() => handleChangePage(page + 1)}
                disabled={(page + 1) * rowsPerPage >= filteredOrders.length}
                className="relative inline-flex items-center px-4 py-2 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Sau
              </button>
            </div>
          </div>

          {/* Order Details */}
          {selectedOrder && (
            <div className="mt-6 bg-white rounded-lg shadow p-6 border border-gray-200">
              <div className="flex justify-between items-start mb-4">
                <Typography variant="h6" className="text-gray-900 font-bold">
                  Chi tiết đơn hàng #{selectedOrder.orderId}
                </Typography>
                <OrderStatus status={selectedOrder.orderstatusupdates?.[0]?.orderStatus} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Order Info */}
                <div className="space-y-4">
                  <div>
                    <Typography variant="subtitle2" className="text-gray-600">
                      Ngày đặt hàng
                    </Typography>
                    <Typography variant="body1" className="text-gray-900">
                      {formatDate(selectedOrder.createAt)}
                    </Typography>
                  </div>
                  <div>
                    <Typography variant="subtitle2" className="text-gray-600">
                      Ghi chú
                    </Typography>
                    <Typography variant="body1" className="text-gray-900">
                      {selectedOrder.note || "Không có ghi chú"}
                    </Typography>
                  </div>
                  <div>
                    <Typography variant="subtitle2" className="text-gray-600">
                      Phương thức thanh toán
                    </Typography>
                    <Typography variant="body1" className="text-gray-900">
                      {selectedOrder.paymentMethodId === 1 ? "Tiền mặt" : "Chuyển khoản"}
                    </Typography>
                  </div>
                </div>

                {/* Order Items */}
                <div className="space-y-4">
                  <Typography variant="subtitle2" className="text-gray-600">
                    Chi tiết sản phẩm
                  </Typography>
                  {selectedOrder.orderitems?.map((item, index) => (
                    <div key={index} className="flex justify-between items-center py-2 border-b">
                      <div>
                        <Typography variant="body1" className="text-gray-900">
                          {item.product?.productName}
                        </Typography>
                        <Typography variant="body2" className="text-gray-600">
                          Số lượng: {item.quantity}
                        </Typography>
                      </div>
                      <Typography variant="body1" className="text-gray-900 font-medium">
                        {formatCurrency(item.price * item.quantity)}
                      </Typography>
                    </div>
                  ))}
                  <div className="pt-4 border-t">
                    <div className="flex justify-between items-center">
                      <Typography variant="subtitle1" className="text-gray-900 font-bold">
                        Tổng cộng
                      </Typography>
                      <Typography variant="h6" className="text-gray-900 font-bold">
                        {formatCurrency(selectedOrder.totalAmount)}
                      </Typography>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </Container>
    </div>
  );
};

export default OrderList; 