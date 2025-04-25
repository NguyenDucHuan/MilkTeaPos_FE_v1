import React, { useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Switch,
  IconButton,
  Button,
} from "@mui/material";
import { Edit as EditIcon, Add as AddIcon } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import mockPayments from "./mockPayments";

export default function PaymentMethodList() {
  const navigate = useNavigate();
  const [methods, setMethods] = useState(mockPayments);

  const handleToggleStatus = (id) => {
    const updated = methods.map((item) =>
      item.id === id ? { ...item, status: !item.status } : item
    );
    setMethods(updated);
  };

  return (
    <Box sx={{ padding: 3 }}>
      <Typography variant="h5" fontWeight="bold" gutterBottom></Typography>

      <Paper sx={{ padding: 2 }}>
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={2}
        >
          <Typography variant="h6"></Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate("/admin/payments/new")}
            sx={{ backgroundColor: "#8B5E3C" }}
          >
            ADD METHOD
          </Button>
        </Box>

        <Table>
          <TableHead>
            <TableRow>
              <TableCell>STT</TableCell>
              <TableCell>ID</TableCell>
              <TableCell>Tên phương thức</TableCell>
              <TableCell>Mô tả</TableCell>
              <TableCell>Trạng thái</TableCell>
              <TableCell>Hành động</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {methods.map((method, index) => (
              <TableRow key={method.id}>
                <TableCell>{index + 1}</TableCell>
                <TableCell>{method.id}</TableCell>
                <TableCell>{method.methodName}</TableCell>
                <TableCell>{method.description}</TableCell>
                <TableCell>
                  <Switch
                    checked={method.status}
                    onChange={() => handleToggleStatus(method.id)}
                    color="primary"
                  />
                </TableCell>
                <TableCell>
                  <IconButton
                    onClick={() =>
                      navigate(`/admin/payments/${method.id}/edit`)
                    }
                  >
                    <EditIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
    </Box>
  );
}
