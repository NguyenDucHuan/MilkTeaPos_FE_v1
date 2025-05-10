import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  TextField,
} from "@mui/material";
import {
  Print as PrintIcon,
  History as HistoryIcon,
} from "@mui/icons-material";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { useDispatch, useSelector } from "react-redux";
import { getCash, resetCash } from "../../store/slices/cashSlice";

const CashierBank = () => {
  const dispatch = useDispatch();
  const { cash, loading, error } = useSelector((state) => state.cash);
  const [initialBalance, setInitialBalance] = useState(0);
  const [closingBalance, setClosingBalance] = useState(0);
  const [cashInTotal, setCashInTotal] = useState(0);
  const [cashOutTotal, setCashOutTotal] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [startDate, setStartDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [endDate, setEndDate] = useState(format(new Date(), "yyyy-MM-dd"));

  // Gọi API khi startDate hoặc endDate thay đổi
  useEffect(() => {
    if (startDate && endDate) {
      dispatch(getCash({ startDate, endDate }));
    }
  }, [dispatch, startDate, endDate]);

  // Cập nhật state khi dữ liệu hoặc lỗi từ API thay đổi
  useEffect(() => {
    if (cash) {
      setInitialBalance(cash.openingBalance || 0);
      setClosingBalance(cash.closingBalance || 0);
      setCashInTotal(cash.cashInTotal || 0);
      setCashOutTotal(cash.cashOutTotal || 0);
      setTotalAmount(cash.amount || 0);
      setTransactions(cash.transactions || []);
    } else {
      setInitialBalance(0);
      setClosingBalance(0);
      setCashInTotal(0);
      setCashOutTotal(0);
      setTotalAmount(0);
      setTransactions([]);
    }
  }, [cash]);

  // Reset state khi component unmount
  useEffect(() => {
    return () => {
      dispatch(resetCash());
    };
  }, [dispatch]);

  // Lọc giao dịch admin (CashIn, CashOut)
  const adminTransactions = transactions.filter(
    (t) => t.transactionType === "CashIn" || t.transactionType === "CashOut"
  );

  // Lọc giao dịch khách (Pay)
  const customerTransactions = transactions.filter(
    (t) => t.transactionType === "Pay"
  );

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography
        variant="h4"
        sx={{ mb: 3, color: "#895a2a", fontWeight: "bold" }}
      >
        Két Thu Ngân
      </Typography>

      {/* Input chọn ngày */}
      <Box sx={{ mb: 3, display: "flex", gap: 2 }}>
        <TextField
          label="Từ ngày"
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          InputLabelProps={{ shrink: true }}
          sx={{ maxWidth: 200 }}
        />
        <TextField
          label="Đến ngày"
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          InputLabelProps={{ shrink: true }}
          sx={{ maxWidth: 200 }}
        />
      </Box>

      {/* Hiển thị lỗi hoặc thông báo không có dữ liệu */}
      {error && (
        <Box sx={{ mb: 3 }}>
          <Typography color="error">
            {error.detail || "Không có giao dịch cho ngày được chọn"}
          </Typography>
        </Box>
      )}

      {!error && transactions.length === 0 && (
        <Box sx={{ mb: 3 }}>
          <Typography>Không có giao dịch trong khoảng thời gian này</Typography>
        </Box>
      )}

      {/* Thông tin tổng quan */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={3}>
          <Card sx={{ bgcolor: "#f9f5f1" }}>
            <CardContent>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Số dư đầu ngày
              </Typography>
              <Typography
                variant="h4"
                sx={{ color: "#895a2a", fontWeight: "bold" }}
              >
                {initialBalance.toLocaleString("vi-VN")} VNĐ
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card sx={{ bgcolor: "#f9f5f1" }}>
            <CardContent>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Dòng tiền vào
              </Typography>
              <Typography
                variant="h4"
                sx={{ color: "#895a2a", fontWeight: "bold" }}
              >
                {cashInTotal.toLocaleString("vi-VN")} VNĐ
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card sx={{ bgcolor: "#f9f5f1" }}>
            <CardContent>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Dòng tiền ra
              </Typography>
              <Typography
                variant="h4"
                sx={{ color: "#895a2a", fontWeight: "bold" }}
              >
                {cashOutTotal ? cashOutTotal.toLocaleString("vi-VN") : 0} VNĐ
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        {/* <Grid item xs={12} md={3}>
          <Card sx={{ bgcolor: "#f9f5f1" }}>
            <CardContent>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Số dư cuối ngày
              </Typography>
              <Typography
                variant="h4"
                sx={{ color: "#895a2a", fontWeight: "bold" }}
              >
                {closingBalance.toLocaleString("vi-VN")} VNĐ
              </Typography>
            </CardContent>
          </Card>
        </Grid> */}
        <Grid item xs={12} md={3}>
          <Card sx={{ bgcolor: "#f9f5f1" }}>
            <CardContent>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Tổng tiền hiện tại
              </Typography>
              <Typography
                variant="h4"
                sx={{ color: "#895a2a", fontWeight: "bold" }}
              >
                {totalAmount.toLocaleString("vi-VN")} VNĐ
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Nút thao tác */}
      <Box sx={{ mb: 3, display: "flex", gap: 2 }}>
        <Button
          variant="outlined"
          startIcon={<PrintIcon />}
          sx={{
            color: "#895a2a",
            borderColor: "#895a2a",
            "&:hover": { borderColor: "#6b4423" },
          }}
        >
          In báo cáo
        </Button>
        <Button
          variant="outlined"
          startIcon={<HistoryIcon />}
          sx={{
            color: "#895a2a",
            borderColor: "#895a2a",
            "&:hover": { borderColor: "#6b4423" },
          }}
        >
          Lịch sử
        </Button>
      </Box>

      {/* Bảng giao dịch Admin (Nạp/Rút) */}
      {adminTransactions.length > 0 && (
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" sx={{ mb: 2, color: "#895a2a" }}>
            Giao dịch Admin (Nạp/Rút)
          </Typography>
          <TableContainer component={Paper} sx={{ bgcolor: "#fff" }}>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: "#f9f5f1" }}>
                  <TableCell>Thời gian</TableCell>
                  <TableCell>Loại giao dịch</TableCell>
                  <TableCell>Số tiền</TableCell>
                  <TableCell>Mô tả</TableCell>
                  <TableCell>Nhân viên</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {adminTransactions.map((transaction) => (
                  <TableRow key={transaction.transactionId}>
                    <TableCell>
                      {format(
                        new Date(transaction.transactionDate),
                        "HH:mm dd/MM/yyyy",
                        { locale: vi }
                      )}
                    </TableCell>
                    <TableCell>
                      {transaction.transactionType === "CashIn"
                        ? "Nạp tiền"
                        : "Rút tiền"}
                    </TableCell>
                    <TableCell>
                      <Typography sx={{ color: "#895a2a", fontWeight: "bold" }}>
                        {transaction.amount.toLocaleString("vi-VN")} VNĐ
                      </Typography>
                    </TableCell>
                    <TableCell>{transaction.description || "-"}</TableCell>
                    <TableCell>{transaction.staffId || "-"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}

      {/* Bảng giao dịch khách (Pay) */}
      {customerTransactions.length > 0 && (
        <Box>
          <Typography variant="h5" sx={{ mb: 2, color: "#895a2a" }}>
            Giao dịch Khách
          </Typography>
          <TableContainer component={Paper} sx={{ bgcolor: "#fff" }}>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: "#f9f5f1" }}>
                  <TableCell>Thời gian</TableCell>
                  <TableCell>Mã đơn hàng</TableCell>
                  <TableCell>Số tiền thanh toán</TableCell>
                  <TableCell>Tiền khách đưa</TableCell>
                  <TableCell>Tiền trả lại</TableCell>
                  <TableCell>Nhân viên</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {customerTransactions.map((transaction) => (
                  <TableRow key={transaction.transactionId}>
                    <TableCell>
                      {format(
                        new Date(transaction.transactionDate),
                        "HH:mm dd/MM/yyyy",
                        { locale: vi }
                      )}
                    </TableCell>
                    <TableCell>{transaction.orderId || "-"}</TableCell>
                    <TableCell>
                      <Typography sx={{ color: "#895a2a", fontWeight: "bold" }}>
                        {transaction.amount.toLocaleString("vi-VN")} VNĐ
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography
                        sx={{ color: "success.main", fontWeight: "bold" }}
                      >
                        {transaction.amountPaid
                          ? transaction.amountPaid.toLocaleString("vi-VN") +
                            " VNĐ"
                          : "-"}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography
                        sx={{ color: "error.main", fontWeight: "bold" }}
                      >
                        {transaction.changeGiven
                          ? transaction.changeGiven.toLocaleString("vi-VN") +
                            " VNĐ"
                          : "-"}
                      </Typography>
                    </TableCell>
                    <TableCell>{transaction.staffId || "-"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}
    </Box>
  );
};

export default CashierBank;
