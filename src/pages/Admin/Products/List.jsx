import React from "react";
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
import mockProducts from "./mockProducts";

export default function ProductList() {
  const navigate = useNavigate();

  const handleToggleStatus = (id) => {
    console.log("Toggle product status ID:", id);
  };

  return (
    <Box sx={{ padding: 3 }}>
      <Typography variant="h5" fontWeight="bold" gutterBottom>
        Quản lý sản phẩm
      </Typography>

      <Paper sx={{ padding: 2 }}>
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={2}
        >
          <Typography variant="h6">Danh sách sản phẩm</Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate("/admin/products/new")}
            sx={{ backgroundColor: "#8B5E3C" }}
          >
            + THÊM SẢN PHẨM
          </Button>
        </Box>

        <Table>
          <TableHead>
            <TableRow>
              <TableCell>STT</TableCell>
              <TableCell>ID</TableCell>
              <TableCell>Tên sản phẩm</TableCell>
              <TableCell>Danh mục</TableCell>
              <TableCell>Giá (VND)</TableCell>
              <TableCell>Trạng thái</TableCell>
              <TableCell>Hành động</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {mockProducts.map((product, index) => (
              <TableRow key={product.id}>
                <TableCell>{index + 1}</TableCell>
                <TableCell>{product.id}</TableCell>
                <TableCell>{product.productName}</TableCell>
                <TableCell>{product.categoryName}</TableCell>
                <TableCell>{product.price.toLocaleString()}</TableCell>
                <TableCell>
                  <Switch
                    checked={product.status}
                    onChange={() => handleToggleStatus(product.id)}
                    color="primary"
                  />
                </TableCell>
                <TableCell>
                  <IconButton
                    onClick={() =>
                      navigate(`/admin/products/${product.id}/edit`)
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
