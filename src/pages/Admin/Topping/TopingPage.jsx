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
  Modal,
  TextField,
  Switch,
  FormControlLabel,
  Avatar,
  Pagination,
} from "@mui/material";
import {
  Edit as EditIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";
import { useDispatch, useSelector } from "react-redux";
import {
  listItemApi,
  createExtraProduct,
  setPage,
} from "../../../store/slices/itemSlice";
import { listCategory } from "../../../store/slices/categorySlice";

export default function ToppingPage() {
  const dispatch = useDispatch();
  const { items, totalItems, currentPage, pageSize, totalPages, isLoading, error } =
    useSelector((state) => state.item);
  const categoryState = useSelector((state) => state.category);
  const category = categoryState?.category || [];
  const categoryLoading = categoryState?.isLoading || false;
  const categoryError = categoryState?.error || null;

  const [openModal, setOpenModal] = useState(false);
  const [hasLoadedCategories, setHasLoadedCategories] = useState(false);

  const stableCategory = useMemo(() => category, [category]);
  const toppingCategory = useMemo(
    () => stableCategory.find((cat) => cat.categoryName === "Topping"),
    [stableCategory]
  );

  // Reset currentPage to 1 when the component mounts
  useEffect(() => {
    dispatch(setPage(1));
  }, [dispatch]);

  // Load categories only once when component mounts
  useEffect(() => {
    if (!hasLoadedCategories) {
      console.log("Gọi listCategory khi component mount");
      dispatch(listCategory());
      setHasLoadedCategories(true);
    }
  }, [dispatch, hasLoadedCategories]);

  // Fetch toppings when currentPage, pageSize, or toppingCategory changes
  useEffect(() => {
    if (toppingCategory) {
      console.log(
        "Fetching toppings - CategoryId:",
        toppingCategory.categoryId,
        "Page:",
        currentPage,
        "PageSize:",
        pageSize
      );
      dispatch(
        listItemApi({
          CategoryId: toppingCategory.categoryId,
          Page: currentPage,
          PageSize: pageSize,
        })
      ).then((result) => {
        if (result.meta.requestStatus === "fulfilled") {
          console.log("Toppings fetched successfully:", result.payload);
        } else {
          console.error("Error fetching toppings:", result.error);
        }
      });
    }
  }, [dispatch, currentPage, pageSize, toppingCategory]);

  const handleOpenModal = () => {
    if (categoryLoading) {
      alert("Vui lòng đợi danh mục được tải!");
      return;
    }
    if (!toppingCategory) {
      alert("Danh mục Topping không tồn tại!");
      return;
    }
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
  };

  const handlePageChange = (event, newPage) => {
    console.log("Navigating to page:", newPage);
    dispatch(setPage(newPage));
  };

  if (isLoading) return <Typography>Loading...</Typography>;
  if (error)
    return <Typography color="error">Error: {error.message || error}</Typography>;
  if (categoryError)
    return (
      <Typography color="error">
        Error loading categories: {categoryError}
      </Typography>
    );
  if (!toppingCategory)
    return <Typography color="error">Danh mục Topping không tồn tại!</Typography>;

  return (
    <Box sx={{ padding: 3 }}>
      <Typography variant="h5" fontWeight="bold" gutterBottom>
        Quản lý Topping
      </Typography>
      <Paper sx={{ padding: 2 }}>
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={2}
        >
          <Typography variant="h6">Danh sách Topping</Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleOpenModal}
            sx={{
              backgroundColor: "#8B5E3C",
              "&:hover": {
                backgroundColor: "#6B4E2C",
              },
            }}
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
            {items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  Không có topping nào
                </TableCell>
              </TableRow>
            ) : (
              items.map((topping) => (
                <TableRow key={topping.productId}>
                  <TableCell>
                    {topping.imageUrl ? (
                      <Avatar
                        src={topping.imageUrl}
                        alt={topping.productName}
                        sx={{ width: 50, height: 50 }}
                      />
                    ) : (
                      "N/A"
                    )}
                  </TableCell>
                  <TableCell>{topping.productName}</TableCell>
                  <TableCell>{topping.description || "N/A"}</TableCell>
                  <TableCell>
                    {topping.price
                      ? topping.price.toLocaleString("vi-VN", {
                          style: "currency",
                          currency: "VND",
                        })
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
        {totalPages > 1 && (
          <Box display="flex" justifyContent="center" mt={3}>
            <Typography variant="body2" sx={{ mr: 2 }}>
              Total Pages: {totalPages}, Current Page: {currentPage}
            </Typography>
            <Pagination
              count={totalPages}
              page={currentPage}
              onChange={handlePageChange}
              color="primary"
            />
          </Box>
        )}
      </Paper>

      {/* FormTopping Modal */}
      <Modal open={openModal} onClose={handleCloseModal}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 500,
            bgcolor: "background.paper",
            boxShadow: 24,
            p: 4,
            borderRadius: 2,
          }}
        >
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            Thêm Topping mới
          </Typography>
          <form
            onSubmit={async (e) => {
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
              formDataToSend.append("CategoryId", toppingCategory.categoryId);
              if (formData.image.files[0]) {
                formDataToSend.append("Image", formData.image.files[0]);
              }

              try {
                const resultAction = await dispatch(createExtraProduct(formDataToSend));
                if (createExtraProduct.fulfilled.match(resultAction)) {
                  alert("Thêm topping thành công!");
                  dispatch(
                    listItemApi({
                      CategoryId: toppingCategory.categoryId,
                      Page: currentPage,
                      PageSize: pageSize,
                    })
                  );
                  handleCloseModal();
                } else {
                  throw new Error(
                    resultAction.payload?.message || "Không thể thêm topping"
                  );
                }
              } catch (error) {
                console.error("Error creating topping:", error);
                alert(error.message || "Có lỗi xảy ra khi thêm topping!");
              }
            }}
          >
            <TextField
              fullWidth
              label="Tên topping"
              name="productName"
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Mô tả"
              name="description"
              margin="normal"
              multiline
              rows={3}
            />
            <TextField
              fullWidth
              label="Giá (VND)"
              name="price"
              type="number"
              margin="normal"
              required
              inputProps={{ min: 0 }}
            />
            <TextField
              fullWidth
              type="file"
              label="Hình ảnh"
              name="image"
              margin="normal"
              InputLabelProps={{ shrink: true }}
              inputProps={{ accept: "image/*" }}
            />
            <FormControlLabel
              control={<Switch name="status" defaultChecked color="primary" />}
              label="Trạng thái kích hoạt"
              sx={{ mt: 2 }}
            />
            <Box mt={3} display="flex" gap={2}>
              <Button
                variant="contained"
                type="submit"
                sx={{ backgroundColor: "#8B5E3C" }}
              >
                Thêm mới
              </Button>
              <Button variant="outlined" onClick={handleCloseModal}>
                Hủy
              </Button>
            </Box>
          </form>
        </Box>
      </Modal>
    </Box>
  );
}