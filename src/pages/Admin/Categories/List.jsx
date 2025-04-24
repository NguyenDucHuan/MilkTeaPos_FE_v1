import React, { useEffect, useState } from 'react';
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
} from '@mui/material';
import { Edit as EditIcon, Add as AddIcon } from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { listCategory } from '../../../store/slices/categorySlice';
import CategoryForm from './CategoryForm';

export default function CategoryList() {
  const dispatch = useDispatch();
  const { category } = useSelector((state) => state.category);
  const [openAddModal, setOpenAddModal] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);

  useEffect(() => {
    dispatch(listCategory());
  }, [dispatch]);

  const handleToggleStatus = (id) => {
    console.log('Toggle status for ID:', id);
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
            sx={{ backgroundColor: '#8B5E3C' }}
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
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: 600,
              bgcolor: 'background.paper',
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
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: 600,
              bgcolor: 'background.paper',
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