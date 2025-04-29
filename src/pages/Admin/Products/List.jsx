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
  Switch,
  FormControlLabel,
  Avatar,
  Grid,
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
  createProduct,
  updateProduct,
  setPage,
} from "../../../store/slices/itemSlice";
import { getallCategory } from "../../../store/slices/categorySlice";

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
  const [editProductId, setEditProductId] = useState(null);
  const [formData, setFormData] = useState({
    productName: "",
    categoryId: null,
    description: "",
    sizes: [{ size: "Small", price: "0" }],
    status: true,
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [hasLoadedCategories, setHasLoadedCategories] = useState(false);
  const [openVariantModal, setOpenVariantModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

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
      console.log("Fetching categories...");
      dispatch(getallCategory());
      setHasLoadedCategories(true);
    }
  }, [dispatch, hasLoadedCategories, categoryLoading]);

  // Set default categoryId for formData when filteredCategories changes
  useEffect(() => {
    if (
      filteredCategories.length > 0 &&
      formData.categoryId === null &&
      !isEditMode
    ) {
      console.log(
        "Setting default categoryId:",
        Number(filteredCategories[0].categoryId)
      );
      setFormData((prev) => ({
        ...prev,
        categoryId: Number(filteredCategories[0].categoryId),
      }));
    }
  }, [filteredCategories, formData.categoryId, isEditMode]);

  // Fetch products when dependencies change
  useEffect(() => {
    console.log(
      "Fetching products with params:",
      JSON.stringify({
        CategoryId: selectedCategoryId,
        Search: searchTerm.trim() || null,
        Page: currentPage,
        PageSize: pageSize,
      })
    );
    dispatch(
      listItemApi({
        CategoryId: selectedCategoryId,
        Search: searchTerm.trim() || null,
        Page: currentPage,
        PageSize: pageSize,
      })
    ).then((result) => {
      if (result.meta.requestStatus === "fulfilled") {
        console.log("Products fetched successfully:", result.payload);
      } else {
        console.error("Error fetching products:", result.error);
      }
    });
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

    if (product) {
      setIsEditMode(true);
      setEditProductId(product.productId);
      const sizes =
        product.variants?.length > 0
          ? product.variants.map((variant) => ({
              size: variant.sizeId || "Small",
              price:
                variant.price !== null && variant.price !== undefined
                  ? variant.price.toString()
                  : "0",
            }))
          : [{ size: "Small", price: "0" }];
      const newFormData = {
        productName: product.productName,
        categoryId: Number(product.categoryId),
        description: product.description || "",
        sizes,
        status: product.status,
      };
      console.log("Opening modal (edit mode) with formData:", newFormData);
      setFormData(newFormData);
      setImagePreview(product.imageUrl || null);
      setImageFile(null);
    } else {
      setIsEditMode(false);
      setEditProductId(null);
      const newFormData = {
        productName: "",
        categoryId:
          filteredCategories.length > 0
            ? Number(filteredCategories[0].categoryId)
            : null,
        description: "",
        sizes: [{ size: "Small", price: "0" }],
        status: true,
      };
      console.log("Opening modal (add mode) with formData:", newFormData);
      setFormData(newFormData);
      setImageFile(null);
      setImagePreview(null);
    }
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setImageFile(null);
    setImagePreview(null);
  };

  const handleOpenVariantModal = (product) => {
    setSelectedProduct(product);
    setOpenVariantModal(true);
  };

  const handleCloseVariantModal = () => {
    setOpenVariantModal(false);
    setSelectedProduct(null);
  };

  const handleChange = (e, index = null) => {
    const { name, value } = e.target;
    if (index !== null) {
      setFormData((prev) => {
        const newSizes = [...prev.sizes];
        newSizes[index] = { ...newSizes[index], [name]: value };
        return { ...prev, sizes: newSizes };
      });
    } else {
      const newFormData = {
        ...formData,
        [name]: name === "categoryId" ? Number(value) : value,
      };
      console.log(`Updated formData (${name}):`, newFormData);
      setFormData(newFormData);
    }
  };

  const handleAddSize = () => {
    setFormData((prev) => ({
      ...prev,
      sizes: [...prev.sizes, { size: "Small", price: "0" }],
    }));
  };

  const handleRemoveSize = (index) => {
    setFormData((prev) => {
      const newSizes = prev.sizes.filter((_, i) => i !== index);
      return {
        ...prev,
        sizes: newSizes.length > 0 ? newSizes : [{ size: "Small", price: "0" }],
      };
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      setImageFile(null);
      setImagePreview(null);
    }
  };

  const handleToggleStatus = () => {
    setFormData((prev) => ({
      ...prev,
      status: !prev.status,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const selectedCategory = filteredCategories.find(
      (cat) => cat.categoryId === formData.categoryId
    );
    if (!selectedCategory) {
      alert("Please select a valid category!");
      return;
    }

    if (formData.sizes.length === 0) {
      alert("Please add at least one size!");
      return;
    }

    for (let i = 0; i < formData.sizes.length; i++) {
      const price = parseFloat(formData.sizes[i].price);
      if (isNaN(price) || price < 0) {
        alert(`Price for size ${formData.sizes[i].size} is invalid!`);
        return;
      }
    }

    const formDataToSend = new FormData();
    if (isEditMode) {
      formDataToSend.append("productId", editProductId);
      console.log("Preparing update with productId:", editProductId);
    }
    formDataToSend.append("productName", formData.productName);
    formDataToSend.append("categoryId", formData.categoryId);
    formDataToSend.append("description", formData.description || "");
    formData.sizes.forEach((sizeObj, index) => {
      formDataToSend.append(`sizes[${index}][size]`, sizeObj.size);
      formDataToSend.append(
        `sizes[${index}][price]`,
        parseFloat(sizeObj.price)
      );
    });
    formDataToSend.append("status", formData.status);
    if (imageFile) {
      formDataToSend.append("parentImage", imageFile);
    }

    try {
      if (isEditMode) {
        console.log("Submitting update with formData:", formDataToSend);
        const resultAction = await dispatch(
          updateProduct(formDataToSend)
        ).unwrap();
        console.log("Update product successful:", resultAction);
      } else {
        console.log("Submitting create with formData:", formDataToSend);
        const resultAction = await dispatch(
          createProduct(formDataToSend)
        ).unwrap();
        console.log("Create product successful:", resultAction);
      }
      await dispatch(
        listItemApi({
          CategoryId: selectedCategoryId,
          Search: searchTerm.trim() || null,
          Page: currentPage,
          PageSize: pageSize,
        })
      );
      handleCloseModal();
    } catch (error) {
      console.error("Error processing product:", error);
      alert(error.message || "An error occurred while processing the product!");
    }
  };

  const handlePageChange = (event, newPage) => {
    dispatch(setPage(newPage));
  };

  const handleCategoryChange = (e) => {
    const value = e.target.value === "all" ? null : Number(e.target.value);
    console.log("Selected filter category ID:", value);
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

  console.log("Rendering with formData:", formData);
  console.log(
    "Pagination state - Total Pages:",
    totalPages,
    "Current Page:",
    currentPage
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
            {isEditMode ? "Update Product" : "Add New Product"}
          </Typography>
          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Product Name"
              name="productName"
              value={formData.productName}
              onChange={handleChange}
              margin="normal"
              required
            />
        <TextField
              select
              fullWidth
              label="Danh mục"
              name="categoryId"
              value={
                formData.categoryId !== ""
                  ? formData.categoryId
                  : filteredCategories.length > 0
                  ? filteredCategories[0].categoryId
                  : ""
              }
              onChange={(e) => {
                console.log(
                  "TextField onChange triggered, selected value:",
                  e.target.value
                );
                handleChange(e);
              }}
              margin="normal"
              required
              disabled={categoryLoading}
            >
              {categoryLoading ? (
                <MenuItem value="" disabled>
                  Đang tải danh mục...
                </MenuItem>
              ) : categoryError ? (
                <MenuItem value="" disabled>
                  Lỗi: {categoryError}
                </MenuItem>
              ) : filteredCategories.length === 0 ? (
                <MenuItem value="" disabled>
                  Không có danh mục
                </MenuItem>
              ) : (
                filteredCategories.map((cat) => (
                  <MenuItem key={cat.categoryId} value={Number(cat.categoryId)}>
                    {cat.categoryName}
                  </MenuItem>
                ))
              )}
            </TextField>
            <Typography variant="subtitle1" sx={{ mt: 2, mb: 1 }}>
              Sizes and Prices
            </Typography>
            {formData.sizes.map((sizeObj, index) => (
              <Grid container spacing={2} key={index} sx={{ mb: 2 }}>
                <Grid item xs={5}>
                  <TextField
                    select
                    fullWidth
                    label="Size"
                    name="size"
                    value={sizeObj.size}
                    onChange={(e) => handleChange(e, index)}
                    required
                  >
                    <MenuItem value="Small">Small</MenuItem>
                    <MenuItem value="Medium">Medium</MenuItem>
                    <MenuItem value="Large">Large</MenuItem>
                  </TextField>
                </Grid>
                <Grid item xs={5}>
                  <TextField
                    fullWidth
                    label="Price (VND)"
                    name="price"
                    type="number"
                    value={sizeObj.price}
                    onChange={(e) => handleChange(e, index)}
                    required
                    inputProps={{ min: 0 }}
                  />
                </Grid>
                <Grid item xs={2}>
                  <IconButton
                    onClick={() => handleRemoveSize(index)}
                    disabled={formData.sizes.length === 1}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Grid>
              </Grid>
            ))}
            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={handleAddSize}
              sx={{ mb: 2 }}
            >
              Add Size
            </Button>
            <TextField
              fullWidth
              type="file"
              label="Product Image"
              name="parentImage"
              onChange={handleImageChange}
              margin="normal"
              InputLabelProps={{ shrink: true }}
              inputProps={{ accept: "image/*" }}
            />
            {imagePreview && (
              <Box mt={2} display="flex" justifyContent="center">
                <Avatar
                  src={imagePreview}
                  alt="Image Preview"
                  sx={{ width: 100, height: 100 }}
                />
              </Box>
            )}
            <TextField
              fullWidth
              label="Description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              margin="normal"
              multiline
              rows={3}
            />
            <FormControlLabel
              control={
                <Switch
                  checked={formData.status}
                  onChange={handleToggleStatus}
                  color="primary"
                />
              }
              label="Active Status"
              sx={{ mt: 2 }}
            />
            <Box mt={3} display="flex" gap={2}>
              <Button
                variant="contained"
                type="submit"
                sx={{ backgroundColor: "#8B5E3C" }}
              >
                {isEditMode ? "Save Changes" : "Add Product"}
              </Button>
              <Button variant="outlined" onClick={handleCloseModal}>
                Cancel
              </Button>
            </Box>
          </form>
        </Box>
      </Modal>

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