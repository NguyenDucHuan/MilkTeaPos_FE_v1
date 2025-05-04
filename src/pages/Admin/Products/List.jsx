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
  MenuItem,
  Avatar,
  Pagination,
  Grid,
} from "@mui/material";
import {
  Edit as EditIcon,
  Add as AddIcon,
} from "@mui/icons-material";
import { useDispatch, useSelector } from "react-redux";
import { listItemApi, resetPage } from "../../../store/slices/itemSlice";
import { getallCategory } from "../../../store/slices/categorySlice";
import { debounce } from "lodash";
import ProductModal from "./ProductModal";

export default function ProductList() {
  const dispatch = useDispatch();
  const {
    materProducts: { items: masterProducts, pagination },
    isLoading,
    error,
  } = useSelector((state) => state.item);
  const { category, isLoading: categoryLoading, error: categoryError } =
    useSelector((state) => state.category);

  const [openModal, setOpenModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [openVariantModal, setOpenVariantModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [hasLoadedCategories, setHasLoadedCategories] = useState(false);

  const PAGE_SIZE = 10;

  const stableCategory = useMemo(() => category, [category]);

  const filteredCategories = useMemo(
    () =>
      stableCategory.filter((cat) => !/combo|topping/i.test(cat.categoryName)),
    [stableCategory]
  );

  useEffect(() => {
    if (!hasLoadedCategories && !categoryLoading) {
      dispatch(getallCategory());
      setHasLoadedCategories(true);
    }
  }, [dispatch, hasLoadedCategories, categoryLoading]);

  const debouncedSearch = useMemo(
    () =>
      debounce((value) => {
        console.log("Dispatching search with term:", value);
        dispatch(resetPage("MaterProduct"));
        dispatch(
          listItemApi({
            CategoryId: selectedCategoryId,
            Search: value.trim() || null,
            Page: 1,
            PageSize: PAGE_SIZE,
            ProductType: "MaterProduct",
          })
        );
      }, 500),
    [dispatch, selectedCategoryId]
  );

  useEffect(() => {
    console.log("Fetching products with params:", {
      CategoryId: selectedCategoryId,
      Search: searchTerm.trim() || null,
      Page: pagination.currentPage,
      PageSize: PAGE_SIZE,
      ProductType: "MaterProduct",
    });
    dispatch(
      listItemApi({
        CategoryId: selectedCategoryId,
        Search: searchTerm.trim() || null,
        Page: pagination.currentPage,
        PageSize: PAGE_SIZE,
        ProductType: "MaterProduct",
      })
    );
  }, [dispatch, pagination.currentPage, selectedCategoryId]);

  useEffect(() => {
    debouncedSearch(searchTerm);
    return () => debouncedSearch.cancel();
  }, [searchTerm, debouncedSearch]);

  useEffect(() => {
    console.log("Pagination state:", pagination);
    console.log("Master products:", masterProducts);
  }, [pagination, masterProducts]);

  const handleOpenModal = (product = null) => {
    if (categoryLoading) {
      alert("Vui lòng chờ danh mục tải xong!");
      return;
    }
    if (!filteredCategories.length) {
      alert("Không có danh mục nào để chọn!");
      return;
    }
    setIsEditMode(!!product);
    setEditProduct(product);
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setEditProduct(null);
  };

  const handleOpenVariantModal = (product) => {
    setSelectedProduct(product);
    setOpenVariantModal(true);
  };

  const handleCloseVariantModal = () => {
    setOpenVariantModal(false);
    setSelectedProduct(null);
  };

  const handleSubmitSuccess = () => {
    dispatch(
      listItemApi({
        CategoryId: selectedCategoryId,
        Search: searchTerm.trim() || null,
        Page: pagination.currentPage,
        PageSize: PAGE_SIZE,
        ProductType: "MaterProduct",
      })
    );
  };

  const handlePageChange = (event, newPage) => {
    console.log("Changing to page:", newPage);
    dispatch(
      listItemApi({
        CategoryId: selectedCategoryId,
        Search: searchTerm.trim() || null,
        Page: newPage,
        PageSize: PAGE_SIZE,
        ProductType: "MaterProduct",
      })
    );
  };

  const handleCategoryChange = (e) => {
    const value = e.target.value === "all" ? null : Number(e.target.value);
    console.log("Changing category to:", value);
    setSelectedCategoryId(value);
    dispatch(resetPage("MaterProduct"));
    dispatch(
      listItemApi({
        CategoryId: value,
        Search: searchTerm.trim() || null,
        Page: 1,
        PageSize: PAGE_SIZE,
        ProductType: "MaterProduct",
      })
    );
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  if (isLoading) return <Typography>Đang tải...</Typography>;
  if (error)
    return <Typography color="error">Lỗi: {error}</Typography>;
  if (categoryError)
    return (
      <Typography color="error">
        Lỗi khi tải danh mục: {categoryError}
      </Typography>
    );

  return (
    <Box sx={{ padding: 3 }}>
      <Paper sx={{ padding: 2 }}>
        <Grid container spacing={2} alignItems="center" mb={2}>
          <Grid item xs={12} sm={4}>
            <TextField
              select
              fullWidth
              label="Danh mục"
              value={selectedCategoryId ?? "all"}
              onChange={handleCategoryChange}
              disabled={categoryLoading || filteredCategories.length === 0}
            >
              <MenuItem value="all">Tất cả danh mục</MenuItem>
              {filteredCategories.map((cat) => (
                <MenuItem key={cat.categoryId} value={Number(cat.categoryId)}>
                  {cat.categoryName}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid
            item
            xs={12}
            sm={4}
            sx={{ display: "flex", justifyContent: "flex-end" }}
          >
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => handleOpenModal()}
              sx={{
                backgroundColor: "#8B5E3C",
                "&:hover": { backgroundColor: "#6B4E2C" },
              }}
            >
              THÊM SẢN PHẨM
            </Button>
          </Grid>
        </Grid>

        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: "bold" }}>Hình ảnh</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Tên sản phẩm</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Danh mục</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Chi tiết</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Hành động</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {masterProducts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  Không tìm thấy sản phẩm
                </TableCell>
              </TableRow>
            ) : (
              masterProducts.map((product) => {
                const priceDisplay =
                  product.price !== null && product.price !== undefined
                    ? product.price.toLocaleString("vi-VN", {
                        style: "currency",
                        currency: "VND",
                      })
                    : product.variants.length > 0
                    ? "Xem chi tiết"
                    : "N/A";

                return (
                  <TableRow
                    key={product.productId}
                    onClick={() => handleOpenVariantModal(product)}
                    sx={{
                      cursor: "pointer",
                      "&:hover": { backgroundColor: "#f5f5f5" },
                    }}
                  >
                    <TableCell>
                      {product.imageUrl ? (
                        <Avatar
                          src={product.imageUrl}
                          alt={product.productName}
                          sx={{ width: 50, height: 50 }}
                        />
                      ) : (
                        "N/A"
                      )}
                    </TableCell>
                    <TableCell>{product.productName}</TableCell>
                    <TableCell>{product.categoryName || "N/A"}</TableCell>
                    <TableCell>{priceDisplay}</TableCell>
                    <TableCell>
                      <IconButton
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenModal(product);
                        }}
                      >
                        <EditIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                );
              })
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

      <ProductModal
        open={openModal}
        onClose={handleCloseModal}
        isEditMode={isEditMode}
        product={editProduct}
        filteredCategories={filteredCategories}
        categoryLoading={categoryLoading}
        onSubmitSuccess={handleSubmitSuccess}
      />

      <Modal open={openVariantModal} onClose={handleCloseVariantModal}>
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
            maxHeight: "80vh",
            overflowY: "auto",
          }}
        >
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            Chi tiết biến thể: {selectedProduct?.productName}
          </Typography>
          {selectedProduct?.variants.length === 0 ? (
            <Typography>Không có biến thể nào cho sản phẩm này.</Typography>
          ) : (
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Kích thước</TableCell>
                  <TableCell>Giá (VND)</TableCell>
                  <TableCell>Mô tả</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {selectedProduct?.variants.map((variant) => (
                  <TableRow key={variant.productId}>
                    <TableCell>{variant.sizeId}</TableCell>
                    <TableCell>
                      {variant.price !== null && variant.price !== undefined
                        ? variant.price.toLocaleString("vi-VN", {
                            style: "currency",
                            currency: "VND",
                          })
                        : "N/A"}
                    </TableCell>
                    <TableCell>{variant.description || "N/A"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
          <Box mt={3} display="flex" justifyContent="flex-end">
            <Button
              variant="outlined"
              onClick={handleCloseVariantModal}
              sx={{
                backgroundColor: "#8B5E3C",
                color: "white",
                "&:hover": { backgroundColor: "#6B4E2C" },
              }}
            >
              Đóng
            </Button>
          </Box>
        </Box>
      </Modal>
    </Box>
  );
}