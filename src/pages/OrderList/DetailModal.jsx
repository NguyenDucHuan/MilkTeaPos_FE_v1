import React, { useEffect } from "react";
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
  IconButton,
  CircularProgress,
  Divider,
  Paper,
} from "@mui/material";
import { Close as CloseIcon } from "@mui/icons-material";
import OrderStatus from "./OrderStatus";

const DetailModal = ({
  open,
  onClose,
  orderDetails,
  isLoadingDetails,
  selectedOrder,
}) => {
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

  const getLatestStatus = (orderStatusUpdates) => {
    console.log("Raw orderStatusUpdates:", orderStatusUpdates);
    if (
      !orderStatusUpdates ||
      !Array.isArray(orderStatusUpdates) ||
      orderStatusUpdates.length === 0
    ) {
      console.log("No valid order status updates found, defaulting to Pending");
      return "Pending";
    }

    const validUpdates = orderStatusUpdates
      .filter((update) => update && update.orderStatus !== null)
      .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

    console.log("Filtered and sorted updates:", validUpdates);
    const latestUpdate = validUpdates[0];
    const status = latestUpdate ? latestUpdate.orderStatus : "Pending";
    console.log("Selected latest status:", status);
    return status;
  };

  const PaymentStatus = ({ paymentStatus }) => {
    const isPaid = paymentStatus === "Paid";
    return (
      <div
        className={`flex items-center gap-2 px-3 py-1 rounded-full ${
          isPaid ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
        }`}
      >
        <span className="text-sm font-medium">
          {isPaid ? "Đã thanh toán" : "Chưa thanh toán"}
        </span>
      </div>
    );
  };

  console.log("orderDetails:", orderDetails);
  console.log("selectedOrder:", selectedOrder);

  const latestStatus = normalizeStatus(
    selectedOrder?.orderStatus ||
      getLatestStatus(orderDetails?.orderstatusupdates)
  );
  console.log("Latest normalized status:", latestStatus);

  useEffect(() => {
    console.log("Effect triggered, latestStatus:", latestStatus);
  }, [latestStatus]);

  return (
    <Modal open={open} onClose={onClose} aria-labelledby="order-detail-modal">
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "90%",
          maxWidth: 1000,
          bgcolor: "background.paper",
          boxShadow: 24,
          p: 4,
          borderRadius: 2,
          maxHeight: "90vh",
          overflowY: "auto",
        }}
      >
        {isLoadingDetails || !orderDetails ? (
          <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
            <CircularProgress />
          </Box>
        ) : (
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
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: "repeat(2, 1fr)",
                  gap: 2,
                }}
              >
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Ngày tạo: {formatDate(orderDetails.createAt)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Trạng thái: <OrderStatus status={latestStatus} />
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Thanh toán:{" "}
                    <PaymentStatus
                      paymentStatus={selectedOrder?.paymentStatus || "Unpaid"}
                    />
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Nhân viên: {orderDetails.staff?.fullName || "N/A"}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Ghi chú: {orderDetails.note || "Không có"}
                  </Typography>
                </Box>
              </Box>
            </Box>

            <Divider sx={{ my: 2 }} />

            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" gutterBottom>
                Thông tin thanh toán
              </Typography>
              <Box
                sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}
              >
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Tổng tiền sản phẩm:{" "}
                    {formatCurrency(orderDetails.totalAmount)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Số tiền phải trả:{" "}
                    {formatCurrency(
                      orderDetails.transactions?.[0]?.amount ||
                        orderDetails.totalAmount
                    )}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Số tiền khách đưa:{" "}
                    {formatCurrency(
                      orderDetails.transactions?.[0]?.amountPaid || 0
                    )}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Tiền thừa:{" "}
                    {formatCurrency(
                      orderDetails.transactions?.[0]?.changeGiven || 0
                    )}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Phương thức thanh toán:{" "}
                    {orderDetails.transactions?.[0]?.paymentMethod
                      ?.methodName || "Chưa thanh toán"}
                  </Typography>
                </Box>
              </Box>
            </Box>

            <Divider sx={{ my: 2 }} />

            <Typography variant="subtitle1" gutterBottom>
              Danh sách sản phẩm
            </Typography>
            <TableContainer component={Paper} sx={{ maxHeight: 400 }}>
              <Table sx={{ minWidth: 900 }}>
                <TableHead>
                  <TableRow>
                    <TableCell>Sản phẩm</TableCell>
                    <TableCell>Size</TableCell>
                    <TableCell>Toppings</TableCell>
                    <TableCell align="right" sx={{ width: 100 }}>
                      Số lượng
                    </TableCell>
                    <TableCell align="right" sx={{ width: 140 }}>
                      Đơn giá
                    </TableCell>
                    <TableCell align="right" sx={{ width: 160 }}>
                      Thành tiền
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {orderDetails.orderitems
                    ?.filter((item) => !item.masterId)
                    .map((item) => {
                      const toppings =
                        item.product?.productType !== "Extra"
                          ? orderDetails.orderitems.filter(
                              (topping) => topping.masterId === item.orderItemId
                            )
                          : [];
                      const itemPrice = item.product?.prize || 0;
                      const toppingsPrice = toppings.reduce(
                        (total, topping) =>
                          total + (topping.product?.prize || 0),
                        0
                      );
                      const totalPrice = item.price || 0;

                      return (
                        <TableRow key={item.orderItemId}>
                          <TableCell>
                            <div
                              style={{
                                fontWeight: 600,
                                color: "#8a5a2a",
                                fontSize: 15,
                              }}
                            >
                              {item.product?.productName}
                              {item.product?.sizeId && (
                                <span
                                  style={{
                                    color: "#70482f",
                                    fontWeight: 400,
                                    fontSize: 13,
                                  }}
                                >
                                  {" "}
                                  ({item.product.sizeId})
                                </span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            {item.product?.sizeId || "Mặc định"}
                          </TableCell>
                          <TableCell>
                            {toppings.length > 0 ? (
                              <ul style={{ margin: 0, paddingLeft: 20 }}>
                                {toppings.map((topping) => (
                                  <li
                                    key={topping.orderItemId}
                                    style={{ color: "#b0855b" }}
                                  >
                                    {topping.product?.productName} (
                                    {formatCurrency(
                                      topping.product?.prize || 0
                                    )}
                                    )
                                  </li>
                                ))}
                              </ul>
                            ) : (
                              <span style={{ color: "#b0855b" }}>Không có</span>
                            )}
                          </TableCell>
                          <TableCell align="right">{item.quantity}</TableCell>
                          <TableCell align="right">
                            {formatCurrency(itemPrice + toppingsPrice)}
                          </TableCell>
                          <TableCell align="right">
                            {formatCurrency(orderDetails.totalAmount)}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                </TableBody>
              </Table>
            </TableContainer>

            <Box sx={{ mt: 3, display: "flex", justifyContent: "flex-end" }}>
              <IconButton onClick={onClose}>
                <CloseIcon />
              </IconButton>
            </Box>
          </>
        )}
      </Box>
    </Modal>
  );
};

export default DetailModal;
