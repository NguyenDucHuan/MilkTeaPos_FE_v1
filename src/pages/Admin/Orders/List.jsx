import React from "react";
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
    CircularProgress,
    TextField,
    InputAdornment,
    IconButton,
    TablePagination,
    Collapse,
    Grid,
    Alert // Để hiển thị lỗi
} from "@mui/material";
import { mockOrders } from "./mockOrders";

export default function OrderList() {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" fontWeight="bold" mb={2}>
        Danh sách đơn hàng
      </Typography>
      <Paper sx={{ p: 2 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>STT</TableCell>
              <TableCell>ID</TableCell>
              <TableCell>Ngày tạo</TableCell>
              <TableCell>Tổng tiền</TableCell>
              <TableCell>Ghi chú</TableCell>
              <TableCell>Nhân viên</TableCell>
              <TableCell>Thanh toán</TableCell>
              <TableCell>Trạng thái</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {mockOrders.map((order, index) => (
              <TableRow key={order.id}>
                <TableCell>{index + 1}</TableCell>
                <TableCell>{order.id}</TableCell>
                <TableCell>{new Date(order.date).toLocaleString()}</TableCell>
                <TableCell>{order.totalAmount.toLocaleString()} VND</TableCell>
                <TableCell>{order.note}</TableCell>
                <TableCell>{order.staffName}</TableCell>
                <TableCell>{order.paymentMethod}</TableCell>
                <TableCell>{order.status}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
    </Box>
  );
}
