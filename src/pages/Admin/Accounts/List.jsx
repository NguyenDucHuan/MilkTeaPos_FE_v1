import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Switch,
  Avatar,
  Tooltip,
  IconButton,
} from "@mui/material";
import { Edit as EditIcon, Add as AddIcon } from '@mui/icons-material';
import fetcher from "../../../apis/fetcher";

export default function AccountList() {
  const navigate = useNavigate();
  const [accounts, setAccounts] = useState([]);

  useEffect(() => {
    fetcher.get("/user/all-users")
      .then(res => setAccounts(res.data.items))
      .catch(err => console.error("Failed to fetch users:", err.message));
  }, []);

  // ----- SỬA LẠI HÀM NÀY CHO ĐÚNG VỚI SWAGGER -----
  const handleToggleStatus = (accountId) => { // Đổi tên tham số cho rõ ràng
    console.log("Attempting to toggle status for accountId:", accountId);

    // Gọi API với đường dẫn cố định và ID trong query params
    fetcher.put(`/user/update-user-status/id`, null, { params: { id: accountId } })
      .then(() => {
        console.log("Status updated successfully on server for:", accountId);
        // Cập nhật state cục bộ - Dùng đúng 'accountId' để so sánh
        setAccounts(prevAccounts =>
          prevAccounts.map(acc => {
            if (acc.accountId === accountId) { // So sánh acc.accountId
              console.log("Updating local state for:", acc.accountId, "New status:", !acc.status);
              return { ...acc, status: !acc.status };
            }
            return acc;
          })
        );
      })
      .catch(err => {
        const errorMessage = err?.message || "Failed to update status.";
        console.error(`Failed to update status for ${accountId}:`, errorMessage, err);
        alert(`Failed to update status: ${errorMessage}`);
      });
  };

  const formatDateTime = (isoString) => {
    const date = new Date(isoString);
    const hours = date.getHours().toString().padStart(2, "0");
    const mins = date.getMinutes().toString().padStart(2, "0");
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear();
    return `${hours}:${mins} ${day}/${month}/${year}`;
  };

  return (
    <Box p={3}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" fontWeight="bold"></Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => navigate("/admin/accounts/new")}>ADD ACCOUNT</Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead sx={{ backgroundColor: "#f4f1e9" }}>
            <TableRow>
              <TableCell><b>No.</b></TableCell>
              <TableCell><b>ID</b></TableCell>
              <TableCell><b>Avatar</b></TableCell>
              <TableCell><b>Full Name</b></TableCell>
              <TableCell><b>Username</b></TableCell>
              <TableCell><b>Email</b></TableCell>
              <TableCell><b>Phone</b></TableCell>
              <TableCell><b>Role</b></TableCell>
              <TableCell><b>Created At</b></TableCell>
              <TableCell><b>Updated At</b></TableCell>
              <TableCell><b>Status</b></TableCell>
              <TableCell><b>Action</b></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {accounts.map((account, index) => (
              <TableRow key={account.accountId}>
                <TableCell>{index + 1}</TableCell>
                <TableCell>{account.accountId}</TableCell>
                <TableCell><Avatar src={account.imageUrl} alt={account.fullName} /></TableCell>
                <TableCell>{account.fullName}</TableCell>
                <TableCell>{account.username}</TableCell>
                <TableCell>{account.email}</TableCell>
                <TableCell>{account.phone}</TableCell>
                <TableCell>{account.role}</TableCell>
                <TableCell>{formatDateTime(account.createdAt)}</TableCell>
                <TableCell>{formatDateTime(account.updatedAt)}</TableCell>
                <TableCell>
                  <Switch
                    checked={account.status}
                    onChange={() => handleToggleStatus(account.accountId)}
                  />
                </TableCell>
                <TableCell>
                  <Tooltip title="Edit">
                    <IconButton
                      size="small"
                      onClick={() => navigate(`/admin/accounts/${account.accountId}/edit`)}
                    >
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
} 
