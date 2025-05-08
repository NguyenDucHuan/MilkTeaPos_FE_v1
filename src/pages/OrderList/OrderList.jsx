import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Avatar,
  IconButton,
  InputAdornment,
  TextField,
  CircularProgress,
  Modal,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Select,
  MenuItem,
  FormControl,
  Button,
} from '@mui/material';
import {
  Search as SearchIcon,
  Visibility as VisibilityIcon,
  LocalShipping as ShippingIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  AccessTime as PendingIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { fetchOrders } from '../../store/slices/orderSlice';
import fetcher from '../../apis/fetcher';
import { toast } from 'react-hot-toast';
import PaymentMethodModal from './PaymentMethodModal';
import DetailModal from './DetailModal';
import axios from 'axios';

const statusColors = {
  Pending: {
    color: 'bg-yellow-100 text-yellow-800',
    icon: PendingIcon,
    label: 'Đang xử lý',
  },

  Success: {
    color: 'bg-green-100 text-green-800',
    icon: CheckCircleIcon,
    label: 'Thành công',
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
  const [orderDetails, setOrderDetails] = useState(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedOrderForPayment, setSelectedOrderForPayment] = useState(null);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('');
  const [isLoadingPaymentMethods, setIsLoadingPaymentMethods] = useState(false);

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

  const handleViewDetails = async (order) => {
    try {
      setIsLoadingDetails(true);
      const response = await fetcher.get(`/order/get-by-id/${order.orderId}`);
      setOrderDetails(response.data);
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

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await axios.get(`https://localhost:7186/api/order/order-status/${orderId}`, {
        status: newStatus
      });
      
      // Cập nhật lại danh sách đơn hàng
      dispatch(fetchOrders());
      toast.success('Cập nhật trạng thái thành công');
    } catch (error) {
      console.error('Error updating order status:', error);
      toast.error('Không thể cập nhật trạng thái đơn hàng');
    }
  };

  const fetchPaymentMethods = async () => {
    try {
      setIsLoadingPaymentMethods(true);
      const response = await fetcher.get('/payment-methods');
      setPaymentMethods(response.data);
    } catch (error) {
      console.error('Error fetching payment methods:', error);
      toast.error('Không thể tải danh sách phương thức thanh toán');
    } finally {
      setIsLoadingPaymentMethods(false);
    }
  };

  const handlePaymentStatusClick = async (order) => {
    if (order.paymentStatus === 'Unpaid') {
      setSelectedOrderForPayment(order);
      setShowPaymentModal(true);
    }
  };

  const handlePaymentSuccess = () => {
    dispatch(fetchOrders());
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

  const OrderStatus = ({ status, onStatusChange }) => {
    const statusInfo = statusColors[status] || statusColors.Pending;
    const StatusIcon = statusInfo.icon;
    return (
      <button
        onClick={() => onStatusChange(status)}
        className={`flex items-center gap-2 px-3 py-1 rounded-full ${statusInfo.color} hover:opacity-80 transition-opacity`}
      >
        <StatusIcon className="w-4 h-4" />
        <span className="text-sm font-medium">{statusInfo.label}</span>
      </button>
    );
  };

  const PaymentStatus = ({ paymentStatus, order }) => {
    const isPaid = paymentStatus === 'Paid';
    return (
      <div 
        onClick={() => handlePaymentStatusClick(order)}
        className={`flex items-center gap-2 px-3 py-1 rounded-full ${isPaid ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800 cursor-pointer hover:opacity-80'}`}
      >
        <span className="text-sm font-medium">{isPaid ? 'Đã thanh toán' : 'Chưa thanh toán'}</span>
      </div>
    );
  };

  const normalizeStatus = (status) => {
    console.log('orderStatus value:', status); // Log để kiểm tra giá trị thực tế
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Thanh toán
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Chi tiết
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
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
                          <OrderStatus 
                            status={normalizeStatus(order.orderStatus || order.status || order.orderstatusupdates?.[0]?.orderStatus)} 
                            onStatusChange={(newStatus) => handleStatusChange(order.orderId, newStatus)}
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <PaymentStatus paymentStatus={order.paymentStatus} order={order} />
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

          {/* Order Details Modal */}
          <DetailModal
            open={!!selectedOrder}
            onClose={handleCloseDetails}
            orderDetails={orderDetails}
            isLoadingDetails={isLoadingDetails}
            selectedOrder={selectedOrder}
          />

          {/* Payment Method Modal */}
          <PaymentMethodModal
            open={showPaymentModal}
            onClose={() => {
              setShowPaymentModal(false);
              setSelectedOrderForPayment(null);
            }}
            selectedOrder={selectedOrderForPayment}
            onPaymentSuccess={handlePaymentSuccess}
          />
        </div>
      </Container>
    </div>
  );
};

export default OrderList; 