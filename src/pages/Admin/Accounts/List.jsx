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
} from "@mui/material";
import mockAccounts from "./mockAccounts";

import EditIcon from "@mui/icons-material/Edit";
import { IconButton, Tooltip } from "@mui/material";

export default function AccountList() {
    const navigate = useNavigate();

    // Tạo state riêng từ mock data
    const [accounts, setAccounts] = useState(mockAccounts);

    const handleToggleStatus = (id) => {
        const updatedAccounts = accounts.map((acc) =>
            acc.id === id ? { ...acc, status: !acc.status } : acc
        );
        setAccounts(updatedAccounts);
    };

    return (
        <Box p={3}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h5">Account Management</Typography>
                <Button variant="contained" onClick={() => navigate("/admin/accounts/new")}>
                    Add Account
                </Button>
            </Box>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Full Name</TableCell>
                            <TableCell>Username</TableCell>
                            <TableCell>Email</TableCell>
                            <TableCell>Phone</TableCell>
                            <TableCell>Role</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell>Action</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {accounts.map((account) => (
                            <TableRow key={account.id}>
                                <TableCell>{account.fullName}</TableCell>
                                <TableCell>{account.username}</TableCell>
                                <TableCell>{account.email}</TableCell>
                                <TableCell>{account.phone}</TableCell>
                                <TableCell>{account.role}</TableCell>
                                <TableCell>
                                    <Switch
                                        checked={account.status}
                                        onChange={() => handleToggleStatus(account.id)}
                                        color="primary"
                                    />
                                </TableCell>
                                <TableCell>
                                    <Tooltip title="Edit">
                                        <IconButton
                                            size="small"
                                            color="primary"
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
