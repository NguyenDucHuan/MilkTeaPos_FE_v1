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
  Grid,
  Pagination,
} from "@mui/material";
import {
  Edit as EditIcon,
  Add as AddIcon,
} from "@mui/icons-material";
import { useDispatch, useSelector } from "react-redux";
import {
  listItemApi,
  setPage,
} from "../../../store/slices/itemSlice";
import { getallCategory } from "../../../store/slices/categorySlice";
import ProductModal from "./ProductModal";

export default function ProductList() {
  const dispatch = useDispatch();
  const {
    items,
    currentPage,
    pageSize,
    totalPages,
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

  const stableCategory = useMemo(() => category, [category]);

  const filteredCategories = useMemo(
    () =>
      stableCategory.filter((cat) => !/combo|topping/i.test(cat.categoryName)),
    [stableCategory]
  );

  // Filter items to show only MasterProduct
  const masterProducts = useMemo(
    () => items.filter((product) => product.productType === "MaterProduct"),
    [items]
  );

  // Reset currentPage to 1 when the component mounts
  useEffect(() => {
    dispatch(setPage(1));
  }, [dispatch]);

  // Load categories only once when component mounts
  useEffect(() => {
    if (!hasLoadedCategories && !categoryLoading) {
      dispatch(getallCategory());
      setHasLoadedCategories(true);
    }
  }, [dispatch, hasLoadedCategories, categoryLoading]);

  // Fetch products when dependencies change
  useEffect(() => {
    dispatch(
      listItemApi({
        CategoryId: selectedCategoryId,
        Search: searchTerm.trim() || null,
        Page: currentPage,
        PageSize: pageSize,
      })
    );
  }, [dispatch, currentPage, pageSize, selectedCategoryId, searchTerm]);

  const handleOpenModal = (product = null) => {
    if (categoryLoading) {
      alert("Please wait for categories to load!");
      return;
    }
    if (!filteredCategories.length) {
      alert("No categories available to select!");
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
        Page: currentPage,
        PageSize: pageSize,
      })
    );
  };

  const handlePageChange = (event, newPage) => {
    dispatch(setPage(newPage));
  };

  const handleCategoryChange = (e) => {
    const value = e.target.value === "all" ? null : Number(e.target.value);
    setSelectedCategoryId(value);
    dispatch(setPage(1));
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

  return (
    <Box sx={{ padding: 3 }}>
      <Paper sx={{ padding: 2 }}>
        <Grid container spacing={2} alignItems="center" mb={2}>
          <Grid item xs={12} sm={4}>
            <TextField
              select
              fullWidth
              label="Category"
              value={selectedCategoryId ?? "all"}
              onChange={handleCategoryChange}
              disabled={categoryLoading || filteredCategories.length === 0}
            >
              <MenuItem value="all">All Categories</MenuItem>
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
              ADD PRODUCT
            </Button>
          </Grid>
        </Grid>

        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: "bold" }}>Image</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Product Name</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Category</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Details</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {masterProducts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  No products found
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
                    ? "View details"
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
        {totalPages > 1 && (
          <Box display="flex" justifyContent="center" mt={3}>
            <Pagination
              count={totalPages}
              page={currentPage}
              onChange={handlePageChange}
              color="primary"
            />
          </Box>
        )}
      </Paper>

      {/* Add/Edit Product Modal */}
      <ProductModal
        open={openModal}
        onClose={handleCloseModal}
        isEditMode={isEditMode}
        product={editProduct}
        filteredCategories={filteredCategories}
        categoryLoading={categoryLoading}
        onSubmitSuccess={handleSubmitSuccess}
      />

      {/* Variant Details Modal */}
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
            Variant Details: {selectedProduct?.productName}
          </Typography>
          {selectedProduct?.variants.length === 0 ? (
            <Typography>No variants available for this product.</Typography>
          ) : (
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Size</TableCell>
                  <TableCell>Price (VND)</TableCell>
                  <TableCell>Description</TableCell>
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
              Close
            </Button>
          </Box>
        </Box>
      </Modal>
    </Box>
  );
}