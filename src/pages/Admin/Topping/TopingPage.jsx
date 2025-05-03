import React, { useEffect, useState, useMemo } from "react";
import {
  Box,
  Typography,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  IconButton,
  Button,
  Pagination,
  Avatar,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
} from "@mui/icons-material";
import { useDispatch, useSelector } from "react-redux";
import {
  listItemApi,
  createExtraProduct,
} from "../../../store/slices/itemSlice";
import { getallCategory } from "../../../store/slices/categorySlice";
import FormTopping from "./FormTopping";

export default function ToppingPage() {
  const dispatch = useDispatch();
  const { extras: { items: toppings, pagination }, isLoading, error } = useSelector((state) => state.item);
  const { category, isLoading: categoryLoading, error: categoryError } = useSelector((state) => state.category);

  const [openModal, setOpenModal] = useState(false);
  const [hasLoadedCategories, setHasLoadedCategories] = useState(false);

  const PAGE_SIZE = 10;

  const stableCategory = useMemo(() => category, [category]);
  const toppingCategory = useMemo(
    () => stableCategory.find((cat) => cat.categoryName === "Topping"),
    [stableCategory]
  );

  useEffect(() => {
    if (!hasLoadedCategories) {
      dispatch(getallCategory());
      setHasLoadedCategories(true);
    }
  }, [dispatch, hasLoadedCategories]);

  useEffect(() => {
    if (toppingCategory) {
      dispatch(
        listItemApi({
          CategoryId: toppingCategory.categoryId,
          Page: pagination.currentPage,
          PageSize: PAGE_SIZE,
          ProductType: "Extra",
        })
      );
    }
  }, [dispatch, pagination.currentPage, toppingCategory]);

  const handleOpenModal = () => {
    if (categoryLoading) {
      alert("Vui lòng đợi danh mục được tải!");
      return;
    }
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    if (toppingCategory) {
      dispatch(
        listItemApi({
          CategoryId: toppingCategory.categoryId,
          Page: pagination.currentPage,
          PageSize: PAGE_SIZE,
          ProductType: "Extra",
        })
      );
    }
  };

  const handlePageChange = (event, newPage) => {
    dispatch(
      listItemApi({
        CategoryId: toppingCategory?.categoryId,
        Page: newPage,
        PageSize: PAGE_SIZE,
        ProductType: "Extra",
      })
    );
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    const formData = e.target.elements;
    if (!formData.productName.value.trim()) {
      alert("Vui lòng nhập tên topping!");
      return;
    }
    if (isNaN(formData.price.value) || formData.price.value <= 0) {
      alert("Vui lòng nhập giá hợp lệ!");
      return;
    }

    const formDataToSend = new FormData();
    formDataToSend.append("ProductName", formData.productName.value);
    formDataToSend.append("Description", formData.description.value || "");
    formDataToSend.append("Price", parseFloat(formData.price.value));
    formDataToSend.append("Status", formData.status.checked);
    formDataToSend.append("CategoryId", toppingCategory?.categoryId || "");
    if (formData.image.files[0]) {
      formDataToSend.append("Image", formData.image.files[0]);
    }

    try {
      const resultAction = await dispatch(createExtraProduct(formDataToSend));
      if (createExtraProduct.fulfilled.match(resultAction)) {
        alert("Thêm topping thành công!");
        handleCloseModal();
      } else {
        throw new Error(
          resultAction.payload?.message || "Không thể thêm topping"
        );
      }
    } catch (error) {
      alert(error.message || "Có lỗi xảy ra khi thêm topping!");
    }
  };

  if (isLoading) return <Typography>Đang tải...</Typography>;
  if (error) return <Typography color="error">Lỗi: {error}</Typography>;
  if (categoryError) return <Typography color="error">Lỗi khi tải danh mục: {categoryError}</Typography>;

  if (!toppingCategory) {
    return (
      <Box sx={{ padding: 3 }}>
        <Typography variant="h5" fontWeight="bold" gutterBottom>
          Quản lý Topping
        </Typography>
        <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" sx={{ mt: 4 }}>
          <Typography variant="h6" color="textSecondary" gutterBottom>
            Chưa có danh mục Topping!
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleOpenModal}
            sx={{ backgroundColor: "#8B5E3C", "&:hover": { backgroundColor: "#6B4E2C" } }}
          >
            THÊM TOPPING
          </Button>
        </Box>
        <FormTopping
          open={openModal}
          handleClose={handleCloseModal}
          onSubmit={handleFormSubmit}
          toppingCategoryId={toppingCategory?.categoryId || ""}
        />
      </Box>
    );
  }

  return (
    <Box sx={{ padding: 3 }}>
      <Typography variant="h5" fontWeight="bold" gutterBottom>
        Quản lý Topping
      </Typography>
      <Paper sx={{ padding: 2 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6">Danh sách Topping</Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleOpenModal}
            sx={{ backgroundColor: "#8B5E3C", "&:hover": { backgroundColor: "#6B4E2C" } }}
          >
            THÊM TOPPING
          </Button>
        </Box>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Hình ảnh</TableCell>
              <TableCell>Tên Topping</TableCell>
              <TableCell>Mô tả</TableCell>
              <TableCell>Giá (VND)</TableCell>
              <TableCell>Hành động</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {toppings.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  Không có topping nào
                </TableCell>
              </TableRow>
            ) : (
              toppings.map((topping) => (
                <TableRow key={topping.productId}>
                  <TableCell>
                    {topping.imageUrl ? (
                      <Avatar src={topping.imageUrl} alt={topping.productName} sx={{ width: 50, height: 50 }} />
                    ) : (
                      "N/A"
                    )}
                  </TableCell>
                  <TableCell>{topping.productName}</TableCell>
                  <TableCell>{topping.description || "N/A"}</TableCell>
                  <TableCell>
                    {topping.price
                      ? topping.price.toLocaleString("vi-VN", { style: "currency", currency: "VND" })
                      : "N/A"}
                  </TableCell>
                  <TableCell>
                    <IconButton disabled>
                      <EditIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        {pagination.totalPages >= 1 && (
          <Box display="flex" justifyContent="center" mt={3}>
            {/* <Typography variant="body2" sx={{ mr: 2 }}>
              Tổng số trang: {pagination.totalPages}, Trang hiện tại: {pagination.currentPage}
            </Typography> */}
            <Pagination
              count={pagination.totalPages}
              page={pagination.currentPage}
              onChange={handlePageChange}
              color="primary"
              disabled={isLoading}
            />
          </Box>
        )}
      </Paper>
      <FormTopping
        open={openModal}
        handleClose={handleCloseModal}
        onSubmit={handleFormSubmit}
        toppingCategoryId={toppingCategory.categoryId}
      />
    </Box>
  );
}