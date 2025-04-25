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
} from "@mui/material";
import { Edit as EditIcon, Add as AddIcon } from "@mui/icons-material";
import { useDispatch, useSelector } from "react-redux";
import { listCategory } from "../../../store/slices/categorySlice";
import CategoryForm from "./CategoryForm";

export default function CategoryList() {
  const dispatch = useDispatch();
  const { category, totalPages, currentPage } = useSelector(
    (state) => state.category
  );
  const [openAddModal, setOpenAddModal] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [currentPageState, setCurrentPageState] = useState(currentPage);

  useEffect(() => {
    dispatch(listCategory({ page: currentPageState }));
  }, [dispatch, currentPageState]);

  const handleToggleStatus = (id) => {
    console.log("Toggle status for ID:", id);
  };

  const handleOpenAddModal = () => {
    setOpenAddModal(true);
  };

  const handleCloseAddModal = () => {
    setOpenAddModal(false);
  };

  const handleOpenEditModal = (id) => {
    setSelectedCategoryId(id);
    setOpenEditModal(true);
  };

  const handleCloseEditModal = () => {
    setOpenEditModal(false);
    setSelectedCategoryId(null);
  };

  const handleNextPage = () => {
    if (currentPageState < totalPages) {
      setCurrentPageState((prev) => prev + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPageState > 1) {
      setCurrentPageState((prev) => prev - 1);
    }
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
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleOpenAddModal}
            sx={{ backgroundColor: "#8B5E3C" }}
          >
            THÊM DANH MỤC
          </Button>
        </Box>

        <Table>
          <TableHead>
            <TableRow>
              <TableCell>No.</TableCell>
              <TableCell>Tên danh mục</TableCell>
              <TableCell>Trạng thái</TableCell>
              <TableCell>Hành động</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {category.map((cat, index) => (
              <TableRow key={cat.id}>
                <TableCell>{index + 1}</TableCell>
                <TableCell>{cat.categoryName}</TableCell>
                <TableCell>
                  <Switch
                    checked={cat.status}
                    onChange={() => handleToggleStatus(cat.id)}
                    color="primary"
                  />
                </TableCell>
                <TableCell>
                  <IconButton onClick={() => handleOpenEditModal(cat.id)}>
                    <EditIcon color="action" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mt={2}
        >
          <Button
            onClick={handlePreviousPage}
            disabled={currentPageState === 1}
          >
            Trang trước
          </Button>
          <Typography variant="body1">
            Trang {currentPageState} / {totalPages}
          </Typography>
          <Button
            onClick={handleNextPage}
            disabled={currentPageState === totalPages}
          >
            Trang tiếp theo
          </Button>
        </Box>
      </Paper>

      {/* Add Category Modal */}
      <Modal
        open={openAddModal}
        onClose={handleCloseAddModal}
        closeAfterTransition
        BackdropComponent={Backdrop}
        BackdropProps={{
          timeout: 500,
        }}
      >
        <Fade in={openAddModal}>
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
            <CategoryForm isModal={true} onClose={handleCloseAddModal} />
          </Box>
        </Fade>
      </Modal>

      {/* Edit Category Modal */}
      <Modal
        open={openEditModal}
        onClose={handleCloseEditModal}
        closeAfterTransition
        BackdropComponent={Backdrop}
        BackdropProps={{
          timeout: 500,
        }}
      >
        <Fade in={openEditModal}>
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
              onClose={handleCloseEditModal}
              id={selectedCategoryId}
            />
          </Box>
        </Fade>
      </Modal>
    </Box>
  );
}
