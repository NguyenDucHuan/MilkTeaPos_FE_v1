import React, { useState, useEffect } from "react";
import {
  Container,
  Typography,
  IconButton,
  InputAdornment,
  TextField,
  CircularProgress,
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
} from "@mui/material";
import {
  Search as SearchIcon,
  Visibility as VisibilityIcon,
  LocalShipping as ShippingIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  AccessTime as PendingIcon,
} from "@mui/icons-material";
import { useDispatch, useSelector } from "react-redux";
import { fetchOrders } from "../../store/slices/orderSlice";
import fetcher from "../../apis/fetcher";
import { toast } from "react-hot-toast";
import PaymentMethodModal from "./PaymentMethodModal";
import DetailModal from "./DetailModal";
import axios from "axios";

const statusColors = {
  Pending: {
    color: "bg-yellow-100 text-yellow-800",
    icon: PendingIcon,
    label: "Đang xử lý",
    statusId: 1,
  },
  Preparing: {
    color: "bg-indigo-100 text-indigo-800",
    icon: ShippingIcon,
    label: "Đang chuẩn bị",
    statusId: 2,
  },
  Success: {
    color: "bg-green-100 text-green-800",
    icon: CheckCircleIcon,
    label: "Thành công",
    statusId: 3,
  },
  Cancelled: {
    color: "bg-red-100 text-red-800",
    icon: CancelIcon,
    label: "Đã hủy",
    statusId: 4,
  },
};

const OrderList = () => {
  const dispatch = useDispatch();
  const { orders, isLoading, error } = useSelector((state) => state.order);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderDetails, setOrderDetails] = useState(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedOrderForPayment, setSelectedOrderForPayment] = useState(null);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("");
  const [isLoadingPaymentMethods, setIsLoadingPaymentMethods] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [statusToUpdate, setStatusToUpdate] = useState(null);
  const [orderIdToUpdate, setOrderIdToUpdate] = useState(null);

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
      console.error("Error fetching order details:", error);
      toast.error("Không thể tải chi tiết đơn hàng");
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
      const statusId = statusColors[newStatus]?.statusId;
      if (!statusId) {
        throw new Error(`Không tìm thấy statusId cho trạng thái ${newStatus}`);
      }
      const order = orders.items.find((o) => o.orderId === orderId);
      if (order.paymentStatus === "Unpaid") {
        toast.error("Vui lòng thanh toán trước khi thay đổi trạng thái");
        return;
      }
      console.log(
        "Updating status for order:",
        orderId,
        "to",
        newStatus,
        "statusId:",
        statusId
      );
      setOrderIdToUpdate(orderId);
      setStatusToUpdate(newStatus);
      setConfirmOpen(true);
    } catch (error) {
      console.error("Error preparing status update:", error);
      toast.error("Không thể chuẩn bị cập nhật trạng thái đơn hàng");
    }
  };

  const handleConfirmStatusChange = async () => {
    if (orderIdToUpdate && statusToUpdate) {
      try {
        console.log("Sending PUT request with:", {
          orderId: orderIdToUpdate,
          statusId: statusColors[statusToUpdate].statusId,
        });
        const response = await axios.put(
          `https://localhost:7186/api/order/change-status/${orderIdToUpdate}`,
          { statusId: statusColors[statusToUpdate].statusId },
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
            },
          }
        );
        dispatch(fetchOrders());
        toast.success("Cập nhật trạng thái thành công");
      } catch (error) {
        console.error("Error updating order status:", {
          status: error.response?.status,
          data: error.response?.data,
          headers: error.response?.headers,
        });
        console.error("Error details:", error.response?.data);
        if (error.response?.status === 400) {
          toast.error(
            error.response?.data?.message ||
              "Yêu cầu không hợp lệ. Vui lòng kiểm tra dữ liệu."
          );
        } else if (error.response?.status === 404) {
          toast.error("Không tìm thấy đơn hàng hoặc endpoint không tồn tại");
        } else if (error.response?.status === 401) {
          toast.error("Không có quyền truy cập, vui lòng đăng nhập lại");
        } else {
          toast.error(
            error.response?.data?.message ||
              "Không thể cập nhật trạng thái đơn hàng"
          );
        }
      } finally {
        setConfirmOpen(false);
        setOrderIdToUpdate(null);
        setStatusToUpdate(null);
      }
    }
  };

  const handleCancelStatusChange = () => {
    setConfirmOpen(false);
    setOrderIdToUpdate(null);
    setStatusToUpdate(null);
  };

  const fetchPaymentMethods = async () => {
    try {
      setIsLoadingPaymentMethods(true);
      const response = await fetcher.get("/payment-methods");
      setPaymentMethods(response.data);
    } catch (error) {
      console.error("Error fetching payment methods:", error);
      toast.error("Không thể tải danh sách phương thức thanh toán");
    } finally {
      setIsLoadingPaymentMethods(false);
    }
  };

  const handlePaymentStatusClick = async (order) => {
    if (order.paymentStatus === "Unpaid") {
      setSelectedOrderForPayment(order);
      setShowPaymentModal(true);
    }
  };

  const handlePaymentSuccess = () => {
    dispatch(fetchOrders());
  };

  const filteredOrders = orders?.items
    ? orders.items.filter(
        (order) =>
          order.orderId.toString().includes(searchTerm.toLowerCase()) ||
          order.note?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const options = {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    };
    return new Date(dateString).toLocaleString("vi-VN", options);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount || 0);
  };

  const OrderStatus = ({ status, onStatusChange, paymentStatus }) => {
    const [open, setOpen] = useState(false);

    const statusInfo = statusColors[status] || statusColors.Pending;
    const StatusIcon = statusInfo.icon;

    const isStatusLocked =
      status === "Success" ||
      status === "Cancelled" ||
      paymentStatus === "Unpaid";

    const handleOpen = () => {
      if (!isStatusLocked) {
        setOpen(true);
      } else if (paymentStatus === "Unpaid") {
        toast.error("Vui lòng thanh toán trước khi thay đổi trạng thái");
      }
    };

    const handleClose = () => {
      setOpen(false);
    };

    const handleStatusSelect = (event) => {
      const newStatus = event.target.value;
      onStatusChange(newStatus);
      setOpen(false);
    };

    return (
      <div className="relative">
        {open ? (
          <FormControl variant="outlined" size="small">
            <Select
              open={open}
              onClose={handleClose}
              onChange={handleStatusSelect}
              value={status}
              className="w-36"
              sx={{ height: "32px", fontSize: "0.875rem" }}
            >
              {Object.keys(statusColors).map((key) => (
                <MenuItem key={key} value={key}>
                  {statusColors[key].label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        ) : (
          <button
            onClick={isStatusLocked ? undefined : handleOpen}
            className={`flex items-center gap-2 px-3 py-1 rounded-full ${
              statusInfo.color
            } ${
              !isStatusLocked
                ? "hover:opacity-80 transition-opacity cursor-pointer"
                : "cursor-default"
            }`}
          >
            <StatusIcon className="w-4 h-4" />
            <span className="text-sm font-medium">{statusInfo.label}</span>
          </button>
        )}
      </div>
    );
  };

  const PaymentStatus = ({ paymentStatus, order }) => {
    const isPaid = paymentStatus === "Paid";
    const orderStatus = normalizeStatus(order.orderStatus || order.status || order.orderstatusupdates?.[0]?.orderStatus);
    const isCancelled = orderStatus === "Cancelled";
    
    return (
      <div
        onClick={() => !isCancelled && handlePaymentStatusClick(order)}
        className={`flex items-center gap-2 px-3 py-1 rounded-full ${
          isPaid
            ? "bg-green-100 text-green-800"
            : isCancelled 
              ? "bg-red-100 text-red-800 cursor-not-allowed"
              : "bg-red-100 text-red-800 cursor-pointer hover:opacity-80"
        }`}
      >
        <span className="text-sm font-medium">
          {isPaid ? "Đã thanh toán" : "Chưa thanh toán"}
        </span>
      </div>
    );
  };

  const normalizeStatus = (status) => {
    console.log("orderStatus value:", status);
    if (!status) return "Pending";
    const normalizedStatus = status.toUpperCase();
    if (normalizedStatus === "PENDING") return "Pending";
    if (normalizedStatus === "PREPARING") return "Preparing";
    if (normalizedStatus === "SUCCESS") return "Success";
    if (normalizedStatus === "CANCELLED" || normalizedStatus === "CANCEL")
      return "Cancelled";
    console.warn(`Unknown status: ${status}, defaulting to Pending`);
    return "Pending";
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
                    <td
                      colSpan="6"
                      className="px-6 py-4 text-center text-gray-500"
                    >
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
                            status={normalizeStatus(
                              order.orderStatus ||
                                order.status ||
                                order.orderstatusupdates?.[0]?.orderStatus
                            )}
                            onStatusChange={(newStatus) =>
                              handleStatusChange(order.orderId, newStatus)
                            }
                            paymentStatus={order.paymentStatus}
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <PaymentStatus
                            paymentStatus={order.paymentStatus}
                            order={order}
                          />
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

          <div className="flex items-center justify-between px-4 py-3 bg-white border-t border-gray-200 sm:px-6">
            <div className="flex items-center">
              <span className="text-sm text-gray-700">
                Hiển thị{" "}
                {filteredOrders.length > 0 ? page * rowsPerPage + 1 : 0} đến{" "}
                {Math.min((page + 1) * rowsPerPage, filteredOrders.length)}{" "}
                trong {filteredOrders.length} kết quả
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

          <DetailModal
            open={!!selectedOrder}
            onClose={handleCloseDetails}
            orderDetails={orderDetails}
            isLoadingDetails={isLoadingDetails}
            selectedOrder={selectedOrder}
          />

          <PaymentMethodModal
            open={showPaymentModal}
            onClose={() => {
              setShowPaymentModal(false);
              setSelectedOrderForPayment(null);
            }}
            selectedOrder={selectedOrderForPayment}
            onPaymentSuccess={handlePaymentSuccess}
          />

          <Dialog
            open={confirmOpen}
            onClose={handleCancelStatusChange}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
          >
            <DialogTitle
              id="alert-dialog-title"
              className="text-lg font-semibold"
            >
              Xác nhận thay đổi trạng thái
            </DialogTitle>
            <DialogContent>
              <DialogContentText id="alert-dialog-description">
                Bạn có chắc chắn muốn cập nhật trạng thái đơn hàng thành{" "}
                {statusToUpdate && statusColors[statusToUpdate].label}?
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCancelStatusChange} color="primary">
                Hủy
              </Button>
              <Button
                onClick={handleConfirmStatusChange}
                color="primary"
                autoFocus
                variant="contained"
              >
                Xác nhận
              </Button>
            </DialogActions>
          </Dialog>
        </div>
      </Container>
    </div>
  );
};

export default OrderList;
