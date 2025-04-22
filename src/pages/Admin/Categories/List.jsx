import React, { useState } from "react";
import {
  Box,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Switch,
  IconButton,
  Tooltip,
  Button,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import EditIcon from "@mui/icons-material/Edit";
import AddIcon from "@mui/icons-material/Add";
import mockCategories from "./mockCategories";

export default function CategoryList() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState(mockCategories);

  const handleToggleStatus = (id) => {
    const updated = categories.map((cat) =>
      cat.id === id ? { ...cat, status: !cat.status } : cat
    );
    setCategories(updated);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          mb: 2,
        }}
      >
        <Typography variant="h6" fontWeight="bold">
          Danh mục sản phẩm
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => navigate("/admin/categories/new")}
        >
          Thêm danh mục
        </Button>
      </Box>

      <Table>
        <TableHead>
          <TableRow>
            <TableCell>STT</TableCell>
            <TableCell>ID</TableCell>
            <TableCell>Tên danh mục</TableCell>
            <TableCell>Mô tả</TableCell>
            <TableCell>Trạng thái</TableCell>
            <TableCell>Hành động</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {categories.map((cat, index) => (
            <TableRow key={cat.id}>
              <TableCell>{index + 1}</TableCell>
              <TableCell>{cat.id}</TableCell>
              <TableCell>{cat.categoryName}</TableCell>
              <TableCell>{cat.description}</TableCell>
              <TableCell>
                <Switch
                  checked={cat.status}
                  onChange={() => handleToggleStatus(cat.id)}
                  color="primary"
                />
              </TableCell>
              <TableCell>
                <Tooltip title="Chỉnh sửa">
                  <IconButton
                    color="primary"
                    onClick={() => navigate(`/admin/categories/${cat.id}/edit`)}
                  >
                    <EditIcon />
                  </IconButton>
                </Tooltip>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Box>
  );
}
