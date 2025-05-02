import React, { useEffect, useState } from "react";
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
  Modal,
  Backdrop,
  Fade,
  Pagination,
} from "@mui/material";
import { Edit as EditIcon, Add as AddIcon } from "@mui/icons-material";
import { useDispatch, useSelector } from "react-redux";
import { getallCategory } from "../../../store/slices/categorySlice";
import CategoryForm from "./CategoryForm";

export default function CategoryList() {
  const dispatch = useDispatch();
  const { category, isLoading, pagination } = useSelector((state) => state.category);
  const [openModal, setOpenModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [page, setPage] = useState(1);

  useEffect(() => {
    dispatch(getallCategory({ sortAscending: false, page, pageSize: 10 }));
  }, [dispatch, page]);

  useEffect(() => {
    console.log('CategoryList - category array:', category);
  }, [category]);

  // const handleToggleStatus = async (category) => {
  //   alert('Chức năng cập nhật trạng thái chưa được hỗ trợ bởi backend. Vui lòng liên hệ đội ngũ backend để thêm endpoint mới.');
  //   return;
  // };

  const handleOpenModal = (category = null) => {
    console.log('Opening modal with category:', category);
    setSelectedCategory(category);
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setSelectedCategory(null);
  };

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  return (
    <Box sx={{ padding: 3 }}>
      <Typography variant="h5" fontWeight="bold" gutterBottom>
        Danh sách danh mục
      </Typography>

      <Paper sx={{ padding: 2 }}>
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={2}
        >
          <Typography variant="h6">Danh mục</Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenModal()}
            sx={{ backgroundColor: "#8B5E3C" }}
          >
            Thêm danh mục
          </Button>
        </Box>

        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Image</TableCell>
              <TableCell>Tên danh mục</TableCell>
              {/* <TableCell>Trạng thái</TableCell> */}
              <TableCell>Hành động</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {category.map((cat, index) => (
              <TableRow key={cat.categoryId}>
                <TableCell>
                  <img
                    src={cat.imageUrl}
                    alt={cat.categoryName}
                    style={{ width: 50, height: 50, borderRadius: "50%" }}
                  />
                </TableCell>
                <TableCell>{cat.categoryName}</TableCell>
                {/* <TableCell>
                  <Switch
                    checked={cat.status ?? false}
                    onChange={() => handleToggleStatus(cat)}
                    color="primary"
                    disabled={isLoading}
                  />
                </TableCell> */}
                <TableCell>
                  <IconButton onClick={() => handleOpenModal(cat)}>
                    <EditIcon color="action" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {pagination.totalPages > 1 && (
          <Box display="flex" justifyContent="center" mt={3}>
            <Pagination
              count={pagination.totalPages}
              page={page}
              onChange={handlePageChange}
              color="primary"
              disabled={isLoading}
            />
          </Box>
        )}
      </Paper>

      <Modal
        open={openModal}
        onClose={handleCloseModal}
        closeAfterTransition
        BackdropComponent={Backdrop}
        BackdropProps={{
          timeout: 500,
        }}
      >
        <Fade in={openModal}>
          <Box
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: 600,
              bgcolor: "background.paper",
              boxShadow: 24,
              p: 4,
              borderRadius: 2,
            }}
          >
            <CategoryForm
              isModal={true}
              onClose={handleCloseModal}
              categoryData={selectedCategory}
            />
          </Box>
        </Fade>
      </Modal>
    </Box>
  );
}