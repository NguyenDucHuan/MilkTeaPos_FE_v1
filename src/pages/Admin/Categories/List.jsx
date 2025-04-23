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
import mockCategories from "./mockCategories";
export default function CategoryList() {


  const navigate = useNavigate();

  const handleToggleStatus = (id) => {
    console.log("Toggle status for ID:", id);
  };

  return (
    <Box sx={{ padding: 3 }}>
      <Typography variant="h5" fontWeight="bold" gutterBottom>
        Danh mục sản phẩm
      </Typography>

      <Paper sx={{ padding: 2 }}>
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={2}
        >
          <Typography variant="h6" fontWeight="medium">
            Danh sách danh mục
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate("/admin/categories/new")}
            sx={{ backgroundColor: "#8B5E3C" }}
          >
            THÊM DANH MỤC
          </Button>
        </Box>

        <Table>
          <TableHead>
            <TableRow>
              <TableCell>No.</TableCell>
              <TableCell>ID</TableCell>
              <TableCell>Tên danh mục</TableCell>
              <TableCell>Mô tả</TableCell>
              <TableCell>Trạng thái</TableCell>
              <TableCell>Hành động</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {mockCategories.map((cat, index) => (
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
                  <IconButton
                    onClick={() => navigate(`/admin/categories/${cat.id}/edit`)}
                  >
                    <EditIcon color="action" />
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
