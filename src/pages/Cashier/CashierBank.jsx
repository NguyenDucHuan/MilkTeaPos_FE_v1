import React, { useState, useEffect } from 'react';
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
  IconButton,
  CircularProgress,
} from '@mui/material';
import {
  Print as PrintIcon,
  History as HistoryIcon,
  AttachMoney as MoneyIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

// Dữ liệu mẫu
const mockTransactions = [
  {
    id: 1,
    orderId: "ORD001",
    type: 'cash_payment',
    amount: 150000,
    description: 'Thanh toán đơn hàng #ORD001',
    date: new Date('2024-03-15T10:30:00'),
    staffName: 'Nguyễn Văn A',
    customerPayment: 200000,
    change: 50000,
  },
  {
    id: 2,
    orderId: "ORD002",
    type: 'cash_payment',
    amount: 250000,
    description: 'Thanh toán đơn hàng #ORD002',
    date: new Date('2024-03-15T14:20:00'),
    staffName: 'Nguyễn Văn B',
    customerPayment: 300000,
    change: 50000,
  },
];

const CashierBank = () => {
  const [initialBalance, setInitialBalance] = useState(5000000); // Số dư đầu ngày
  const [transactions, setTransactions] = useState(mockTransactions);
  const [loading, setLoading] = useState(false);

  // Tính toán các chỉ số
  const calculateTodayStats = () => {
    const today = format(new Date(), 'yyyy-MM-dd');
    const todayTransactions = transactions.filter(t => 
      format(t.date, 'yyyy-MM-dd') === today
    );

    const totalCashReceived = todayTransactions.reduce((sum, t) => sum + t.customerPayment, 0);
    const totalCashChange = todayTransactions.reduce((sum, t) => sum + t.change, 0);
    const totalCashSales = todayTransactions.reduce((sum, t) => sum + t.amount, 0);
    const currentBalance = initialBalance + totalCashSales;

    return {
      totalCashReceived,
      totalCashChange,
      totalCashSales,
      currentBalance,
    };
  };

  const stats = calculateTodayStats();

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3, color: '#895a2a', fontWeight: 'bold' }}>
        Két Thu Ngân
      </Typography>

      {/* Thông tin tổng quan */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={3}>
          <Card sx={{ bgcolor: '#f9f5f1' }}>
            <CardContent>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Số dư đầu ngày
              </Typography>
              <Typography variant="h4" sx={{ color: '#895a2a', fontWeight: 'bold' }}>
                {initialBalance.toLocaleString('vi-VN')} VNĐ
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card sx={{ bgcolor: '#f9f5f1' }}>
            <CardContent>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Tổng tiền nhận
              </Typography>
              <Typography variant="h4" sx={{ color: '#895a2a', fontWeight: 'bold' }}>
                {stats.totalCashReceived.toLocaleString('vi-VN')} VNĐ
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card sx={{ bgcolor: '#f9f5f1' }}>
            <CardContent>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Tổng tiền trả lại
              </Typography>
              <Typography variant="h4" sx={{ color: '#895a2a', fontWeight: 'bold' }}>
                {stats.totalCashChange.toLocaleString('vi-VN')} VNĐ
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card sx={{ bgcolor: '#f9f5f1' }}>
            <CardContent>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Số dư hiện tại
              </Typography>
              <Typography variant="h4" sx={{ color: '#895a2a', fontWeight: 'bold' }}>
                {stats.currentBalance.toLocaleString('vi-VN')} VNĐ
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Nút thao tác */}
      <Box sx={{ mb: 3, display: 'flex', gap: 2 }}>
        <Button
          variant="outlined"
          startIcon={<PrintIcon />}
          sx={{ color: '#895a2a', borderColor: '#895a2a', '&:hover': { borderColor: '#6b4423' } }}
        >
          In báo cáo
        </Button>
        <Button
          variant="outlined"
          startIcon={<HistoryIcon />}
          sx={{ color: '#895a2a', borderColor: '#895a2a', '&:hover': { borderColor: '#6b4423' } }}
        >
          Lịch sử
        </Button>
      </Box>

      {/* Bảng giao dịch */}
      <TableContainer component={Paper} sx={{ bgcolor: '#fff' }}>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: '#f9f5f1' }}>
              <TableCell>Thời gian</TableCell>
              <TableCell>Mã đơn hàng</TableCell>
              <TableCell>Số tiền thanh toán</TableCell>
              <TableCell>Tiền khách đưa</TableCell>
              <TableCell>Tiền trả lại</TableCell>
              <TableCell>Nhân viên</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {transactions.map((transaction) => (
              <TableRow key={transaction.id}>
                <TableCell>
                  {format(transaction.date, 'HH:mm dd/MM/yyyy', { locale: vi })}
                </TableCell>
                <TableCell>{transaction.orderId}</TableCell>
                <TableCell>
                  <Typography sx={{ color: '#895a2a', fontWeight: 'bold' }}>
                    {transaction.amount.toLocaleString('vi-VN')} VNĐ
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography sx={{ color: 'success.main', fontWeight: 'bold' }}>
                    {transaction.customerPayment.toLocaleString('vi-VN')} VNĐ
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography sx={{ color: 'error.main', fontWeight: 'bold' }}>
                    {transaction.change.toLocaleString('vi-VN')} VNĐ
                  </Typography>
                </TableCell>
                <TableCell>{transaction.staffName}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default CashierBank;
