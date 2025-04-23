import React, { useState } from "react";
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
import EditIcon from "@mui/icons-material/Edit";
import mockAccounts from "./mockAccounts";

export default function AccountList() {
  const navigate = useNavigate();
  const [accounts, setAccounts] = useState(mockAccounts);

  const handleToggleStatus = (id) => {
    const updated = accounts.map((acc) =>
      acc.id === id ? { ...acc, status: !acc.status } : acc
    );
    setAccounts(updated);
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
        <Typography variant="h5" fontWeight="bold"> </Typography>
        <Button variant="contained" onClick={() => navigate("/admin/accounts/new")}>
          ADD ACCOUNT
        </Button>
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
              <TableRow key={account.id}>
                <TableCell>{index + 1}</TableCell>
                <TableCell>{account.id}</TableCell>
                <TableCell>
                  <Avatar src={account.imageUrl} alt={account.fullName} />
                </TableCell>
                <TableCell>{account.fullName}</TableCell>
                <TableCell>{account.username}</TableCell>
                <TableCell>{account.email}</TableCell>
                <TableCell>{account.phone}</TableCell>
                <TableCell>{account.role}</TableCell>
                <TableCell>{formatDateTime(account.created_at)}</TableCell>
                <TableCell>{formatDateTime(account.updated_at)}</TableCell>
                <TableCell>
                  <Switch
                    checked={account.status}
                    onChange={() => handleToggleStatus(account.id)}
                  />
                </TableCell>
                <TableCell>
                  <Tooltip title="Edit">
                    <IconButton
                      size="small"
                      onClick={() => navigate(`/admin/accounts/${account.id}/edit`)}
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
