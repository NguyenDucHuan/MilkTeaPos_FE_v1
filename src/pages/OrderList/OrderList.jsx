import React, { useState } from 'react';
import {
  Container,
  Typography,
  Avatar,
  IconButton,
  InputAdornment,
  TextField,
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
    color: 'bg-yellow-100 text-yellow-800',
    icon: PendingIcon,
    label: 'Đang xử lý',
  },
  processing: {
    color: 'bg-blue-100 text-blue-800',
    icon: ShippingIcon,
    label: 'Đang giao',
  },
  delivered: {
    color: 'bg-green-100 text-green-800',
    icon: CheckCircleIcon,
    label: 'Đã giao',
  },
  cancelled: {
    color: 'bg-red-100 text-red-800',
    icon: CancelIcon,
    label: 'Đã hủy',
  },
};

const OrderList = () => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);

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

  const OrderStatus = ({ status }) => {
    const StatusIcon = statusColors[status].icon;
    return (
      <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${statusColors[status].color}`}>
        <StatusIcon className="w-4 h-4" />
        <span className="text-sm font-medium">{statusColors[status].label}</span>
      </div>
    );
  };

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
                    Khách hàng
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
                {filteredOrders
                  .slice(page * rowsPerPage, (page + 1) * rowsPerPage)
                  .map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {order.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {order.customerName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(order.orderDate)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                        {formatCurrency(order.total)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <OrderStatus status={order.status} />
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
                  ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between px-4 py-3 bg-white border-t border-gray-200 sm:px-6">
            <div className="flex items-center">
              <span className="text-sm text-gray-700">
                Hiển thị {page * rowsPerPage + 1} đến{' '}
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
                  Chi tiết đơn hàng {selectedOrder.id}
                </Typography>
                <OrderStatus status={selectedOrder.status} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Customer Info */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900">Thông tin khách hàng</h3>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                    <p className="text-sm text-gray-600">
                      Tên: <span className="text-gray-900">{selectedOrder.customerName}</span>
                    </p>
                    <p className="text-sm text-gray-600">
                      SĐT: <span className="text-gray-900">{selectedOrder.phone}</span>
                    </p>
                    <p className="text-sm text-gray-600">
                      Địa chỉ: <span className="text-gray-900">{selectedOrder.address}</span>
                    </p>
                  </div>
                </div>

                {/* Order Info */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900">Thông tin đơn hàng</h3>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                    <p className="text-sm text-gray-600">
                      Ngày đặt: <span className="text-gray-900">{formatDate(selectedOrder.orderDate)}</span>
                    </p>
                    <p className="text-sm text-gray-600">
                      Phương thức thanh toán: <span className="text-gray-900">{selectedOrder.paymentMethod}</span>
                    </p>
                    <p className="text-sm text-gray-600">
                      Tổng tiền: <span className="text-gray-900 font-medium">{formatCurrency(selectedOrder.total)}</span>
                    </p>
                  </div>
                </div>

                {/* Order Items */}
                <div className="md:col-span-2 space-y-4">
                  <h3 className="text-lg font-medium text-gray-900">Chi tiết sản phẩm</h3>
                  <div className="bg-gray-50 rounded-lg overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sản phẩm</th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Số lượng</th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Đơn giá</th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Thành tiền</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {selectedOrder.items.map((item, index) => (
                          <tr key={index}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.name}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">{item.quantity}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                              {formatCurrency(item.price)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right font-medium">
                              {formatCurrency(item.price * item.quantity)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot className="bg-gray-50">
                        <tr>
                          <td colSpan="3" className="px-6 py-4 text-sm font-medium text-gray-900 text-right">
                            Tổng cộng:
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-primary font-bold text-right">
                            {formatCurrency(selectedOrder.total)}
                          </td>
                        </tr>
                      </tfoot>
                    </table>
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