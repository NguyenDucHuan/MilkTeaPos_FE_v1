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
  IconButton,
  Button,
  Modal,
  TextField,
  Switch,
  FormControlLabel,
  Pagination,
  Checkbox,
  Grid,
  InputAdornment,
  Collapse,
} from "@mui/material";
import {
  Edit as EditIcon,
  Add as AddIcon,
  ExpandMore as ExpandMoreIcon,
} from "@mui/icons-material";
import { useDispatch, useSelector } from "react-redux";
import { listItemApi, setPage } from "../../../store/slices/itemSlice";
import { createCombo } from "../../../store/slices/comboSlice";

const hardcodedToppings = {
  1: [
    { toppingId: "t1", toppingName: "Extra Cheese", price: 15000 },
    { toppingId: "t2", toppingName: "Pepperoni", price: 20000 },
    { toppingId: "t3", toppingName: "Mushrooms", price: 10000 },
  ],
  2: [
    { toppingId: "t4", toppingName: "Bacon", price: 25000 },
    { toppingId: "t5", toppingName: "Lettuce", price: 5000 },
    { toppingId: "t6", toppingName: "Tomato", price: 5000 },
  ],
  3: [
    { toppingId: "t7", toppingName: "Croutons", price: 8000 },
    { toppingId: "t8", toppingName: "Grilled Chicken", price: 30000 },
  ],
};

export default function Combos() {
  const dispatch = useDispatch();
  const { items: combos, currentPage, pageSize, totalPages, totalItems, isLoading: productsLoading, error: productsError } =
    useSelector((state) => state.item);
  const [openModal, setOpenModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editComboId, setEditComboId] = useState(null);
  const [formData, setFormData] = useState({
    ComboName: "",
    Description: "",
    Image: null,
    Price: "0",
    Status: true,
    ComboItems: [],
    categoryId: 5,
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [expandedProduct, setExpandedProduct] = useState(null);
  const [allProducts, setAllProducts] = useState([]); // To store all products for the modal

  // Reset currentPage to 1 when the component mounts
  useEffect(() => {
    dispatch(setPage(1));
  }, [dispatch]);

  // Fetch combos (categoryId: 5) with pagination
  useEffect(() => {
    console.log(
      "Fetching combos for Combos - CategoryId: 5, Page:",
      currentPage,
      "PageSize:",
      pageSize
    );
    dispatch(
      listItemApi({ CategoryId: 5, Page: currentPage, PageSize: pageSize })
    ).then((result) => {
      if (result.meta.requestStatus === "fulfilled") {
        console.log("Combos fetched successfully:", result.payload);
      } else {
        console.error("Error fetching combos:", result.error);
      }
    });
  }, [dispatch, currentPage, pageSize]);

  // Fetch all products for the modal (without pagination)
  useEffect(() => {
    console.log("Fetching all products for modal...");
    dispatch(listItemApi({ CategoryId: null, Page: 1, PageSize: 1000 })).then((result) => {
      if (result.meta.requestStatus === "fulfilled") {
        setAllProducts(result.payload.items || []);
        console.log("All products fetched for modal:", result.payload.items);
      } else {
        console.error("Error fetching all products for modal:", result.error);
      }
    });
  }, [dispatch]);

  const handleOpenModal = (combo = null) => {
    if (allProducts.length === 0) {
      alert("No products available to create a combo!");
      return;
    }

    if (combo) {
      setIsEditMode(true);
      setEditComboId(combo.productId);
      setFormData({
        ComboName: combo.productName,
        Description: combo.description || "",
        Image: null,
        Price: combo.price.toString(),
        Status: combo.status,
        ComboItems: combo.comboItems || [],
        categoryId: 5,
      });
      setImagePreview(combo.imageUrl || null);
    } else {
      setIsEditMode(false);
      setEditComboId(null);
      setFormData({
        ComboName: "",
        Description: "",
        Image: null,
        Price: "0",
        Status: true,
        ComboItems: [],
        categoryId: 5,
      });
      setImagePreview(null);
    }
    setOpenModal(true);
    setExpandedProduct(null);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setImagePreview(null);
    setExpandedProduct(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleProductToggle = (productId) => {
    setFormData((prev) => {
      const existingItem = prev.ComboItems.find(
        (item) => item.productId === productId
      );
      if (existingItem) {
        return {
          ...prev,
          ComboItems: prev.ComboItems.filter(
            (item) => item.productId !== productId
          ),
        };
      } else {
        return {
          ...prev,
          ComboItems: [
            ...prev.ComboItems,
            { productId, quantity: 1, toppings: [], discount: 0 },
          ],
        };
      }
    });
  };

  const handleProductFieldChange = (productId, field, value) => {
    const parsedValue = parseInt(value) || 0;
    if (parsedValue < 0) return;
    setFormData((prev) => ({
      ...prev,
      ComboItems: prev.ComboItems.map((item) =>
        item.productId === productId ? { ...item, [field]: parsedValue } : item
      ),
    }));
  };

  const handleToppingChange = (productId, toppingId, quantity) => {
    const parsedQuantity = parseInt(quantity) || 0;
    if (parsedQuantity < 0) return;
    setFormData((prev) => ({
      ...prev,
      ComboItems: prev.ComboItems.map((item) => {
        if (item.productId !== productId) return item;
        const existingTopping = item.toppings.find(
          (t) => t.toppingId === toppingId
        );
        let newToppings;
        if (existingTopping) {
          if (parsedQuantity === 0) {
            newToppings = item.toppings.filter(
              (t) => t.toppingId !== toppingId
            );
          } else {
            newToppings = item.toppings.map((t) =>
              t.toppingId === toppingId ? { ...t, quantity: parsedQuantity } : t
            );
          }
        } else if (parsedQuantity > 0) {
          newToppings = [
            ...item.toppings,
            { toppingId, quantity: parsedQuantity },
          ];
        } else {
          newToppings = item.toppings;
        }
        return { ...item, toppings: newToppings };
      }),
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
        setFormData((prev) => ({ ...prev, Image: file }));
      };
      reader.readAsDataURL(file);
    } else {
      setImagePreview(null);
      setFormData((prev) => ({ ...prev, Image: null }));
    }
  };

  const handleToggleStatus = () => {
    setFormData((prev) => ({
      ...prev,
      Status: !prev.Status,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.ComboItems.length === 0) {
      alert("Please select at least one product for the combo!");
      return;
    }

    const price = parseFloat(formData.Price);
    if (isNaN(price) || price < 0) {
      alert("Invalid price!");
      return;
    }

    const formDataToSend = new FormData();
    formDataToSend.append("ComboName", formData.ComboName);
    formDataToSend.append("Description", formData.Description || "");
    formDataToSend.append("Price", formData.Price);
    formDataToSend.append("Status", formData.Status);
    formDataToSend.append("categoryId", formData.categoryId);
    formData.ComboItems.forEach((item, index) => {
      formDataToSend.append(`ComboItems[${index}][productId]`, item.productId);
      formDataToSend.append(`ComboItems[${index}][quantity]`, item.quantity);
      formDataToSend.append(`ComboItems[${index}][discount]`, item.discount);
      item.toppings.forEach((topping, tIndex) => {
        formDataToSend.append(
          `ComboItems[${index}][toppings][${tIndex}][toppingId]`,
          topping.toppingId
        );
        formDataToSend.append(
          `ComboItems[${index}][toppings][${tIndex}][quantity]`,
          topping.quantity
        );
      });
    });
    if (formData.Image) {
      formDataToSend.append("Image", formData.Image);
    }

    try {
      if (isEditMode) {
        console.log("Update combo (TODO):", formDataToSend);
        alert("Update functionality not implemented yet.");
      } else {
        await dispatch(createCombo(formDataToSend)).unwrap();
        // Refresh the combos list after creating a new combo
        await dispatch(
          listItemApi({ CategoryId: 5, Page: currentPage, PageSize: pageSize })
        );
      }
      handleCloseModal();
    } catch (error) {
      console.error("Error submitting combo:", error);
      alert("An error occurred while submitting the combo: " + error);
    }
  };

  const handlePageChange = (event, newPage) => {
    console.log("Navigating to page:", newPage);
    dispatch(setPage(newPage));
  };

  if (productsLoading) return <Typography>Loading...</Typography>;
  if (productsError) return <Typography color="error">Error: {productsError}</Typography>;

  return (
    <Box sx={{ padding: 3, bgcolor: "#fffbf2", minHeight: "100vh" }}>
      <Typography variant="h4" fontWeight="bold" color="#333" gutterBottom>
        Quản lý Combo
      </Typography>
      <Paper
        sx={{
          padding: 3,
          borderRadius: 2,
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        }}
      >
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={3}
          sx={{ color: "#fffbf2" }}
        >
          <Typography variant="h6" color="#555">
            Danh sách Combo
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenModal()}
            sx={{
              bgcolor: "#8B5E3C",
              "&:hover": { bgcolor: "#70482F" },
              borderRadius: 1,
              textTransform: "none",
              fontWeight: "bold",
            }}
          >
            Thêm Combo Mới
          </Button>
        </Box>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: "bold", color: "#333" }}>
                Tên combo
              </TableCell>
              <TableCell sx={{ fontWeight: "bold", color: "#333" }}>
                Mô tả
              </TableCell>
              <TableCell sx={{ fontWeight: "bold", color: "#333" }}>
                Sản phẩm
              </TableCell>
              <TableCell sx={{ fontWeight: "bold", color: "#333" }}>
                Giá (VND)
              </TableCell>
              <TableCell sx={{ fontWeight: "bold", color: "#333" }}>
                Trạng thái
              </TableCell>
              <TableCell sx={{ fontWeight: "bold", color: "#333" }}>
                Hành động
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {combos.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ color: "#888" }}>
                  Không có combo nào
                </TableCell>
              </TableRow>
            ) : (
              combos.map((combo) => (
                <TableRow
                  key={combo.productId}
                  sx={{ "&:hover": { bgcolor: "#f9f9f9" } }}
                >
                  <TableCell>{combo.productName}</TableCell>
                  <TableCell>{combo.description || "N/A"}</TableCell>
                  <TableCell>
                    {combo.comboItems && combo.comboItems.length > 0
                      ? combo.comboItems
                          .map((item) => {
                            const toppingsForProduct =
                              hardcodedToppings[item.productId] || [];
                            const toppingDetails = item.toppings
                              ? item.toppings
                                  .map((t) => {
                                    const topping = toppingsForProduct.find(
                                      (top) => top.toppingId === t.toppingId
                                    );
                                    return topping
                                      ? `${topping.toppingName} (x${t.quantity})`
                                      : "";
                                  })
                                  .filter(Boolean)
                                  .join(", ")
                              : "None";
                            return `${item.productName} (Qty: ${
                              item.quantity
                            }, Toppings: ${
                              toppingDetails || "None"
                            }, Discount: ${item.discount}%)`;
                          })
                          .join("; ")
                      : "No items"}
                  </TableCell>
                  <TableCell>
                    {parseFloat(combo.price).toLocaleString("vi-VN", {
                      style: "currency",
                      currency: "VND",
                    })}
                  </TableCell>
                  <TableCell>
                    <Box
                      sx={{
                        bgcolor: combo.status ? "#e8f5e9" : "#ffebee",
                        color: combo.status ? "#2e7d32" : "#d32f2f",
                        borderRadius: 1,
                        textAlign: "center",
                        padding: "2px 8px",
                        fontSize: "0.8rem",
                      }}
                    >
                      {combo.status ? "Kích hoạt" : "Tắt"}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <IconButton
                      onClick={() => handleOpenModal(combo)}
                      sx={{
                        color: "#8B5E3C",
                        "&:hover": { color: "#70482F" },
                      }}
                    >
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
              sx={{ "& .Mui-selected": { bgcolor: "#8B5E3C !important" } }}
            />
          </Box>
        )}
      </Paper>
      <Modal open={openModal} onClose={handleCloseModal}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: { xs: "90%", md: 900 },
            bgcolor: "white",
            boxShadow: 24,
            p: 4,
            borderRadius: 2,
            maxHeight: "90vh",
            overflowY: "auto",
          }}
        >
          <Typography
            variant="h5"
            fontWeight="bold"
            color="#333"
            gutterBottom
            sx={{ borderBottom: "2px solid #8B5E3C", pb: 1 }}
          >
            {isEditMode ? "Cập nhật Combo" : "Thêm Combo Mới"}
          </Typography>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={5}>
                <TextField
                  fullWidth
                  label="Tên Combo"
                  name="ComboName"
                  value={formData.ComboName}
                  onChange={handleChange}
                  margin="normal"
                  required
                  variant="outlined"
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 1,
                      "&:hover fieldset": { borderColor: "#8B5E3C" },
                      "&.Mui-focused fieldset": { borderColor: "#8B5E3C" },
                    },
                  }}
                />
                <TextField
                  fullWidth
                  label="Mô tả"
                  name="Description"
                  value={formData.Description}
                  onChange={handleChange}
                  margin="normal"
                  multiline
                  rows={3}
                  variant="outlined"
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 1,
                      "&:hover fieldset": { borderColor: "#8B5E3C" },
                      "&.Mui-focused fieldset": { borderColor: "#8B5E3C" },
                    },
                  }}
                />
                <TextField
                  fullWidth
                  type="file"
                  label="Hình ảnh Combo"
                  name="Image"
                  onChange={handleImageChange}
                  margin="normal"
                  InputLabelProps={{ shrink: true }}
                  inputProps={{ accept: "image/*" }}
                  variant="outlined"
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 1,
                      "&:hover fieldset": { borderColor: "#8B5E3C" },
                      "&.Mui-focused fieldset": { borderColor: "#8B5E3C" },
                    },
                  }}
                />
                {imagePreview && (
                  <Box mt={2} display="flex" justifyContent="center">
                    <img
                      src={imagePreview}
                      alt="Xem trước hình ảnh"
                      style={{
                        width: 100,
                        height: 100,
                        objectFit: "cover",
                        borderRadius: 4,
                        border: "1px solid #ddd",
                      }}
                    />
                  </Box>
                )}
                <TextField
                  fullWidth
                  label="Giá (VND)"
                  name="Price"
                  type="number"
                  value={formData.Price}
                  onChange={handleChange}
                  margin="normal"
                  required
                  inputProps={{ min: 0 }}
                  variant="outlined"
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 1,
                      "&:hover fieldset": { borderColor: "#8B5E3C" },
                      "&.Mui-focused fieldset": { borderColor: "#8B5E3C" },
                    },
                  }}
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.Status}
                      onChange={handleToggleStatus}
                      color="primary"
                      sx={{
                        "& .MuiSwitch-switchBase.Mui-checked": {
                          color: "#8B5E3C",
                        },
                        "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
                          bgcolor: "#8B5E3C",
                        },
                      }}
                    />
                  }
                  label="Trạng thái Kích hoạt"
                  sx={{ mt: 2, color: "#555" }}
                />
              </Grid>
              <Grid item xs={12} md={7}>
                <Typography
                  variant="subtitle1"
                  fontWeight="bold"
                  color="#333"
                  mb={2}
                >
                  Chọn Sản phẩm và Topping
                </Typography>
                <Box
                  sx={{
                    maxHeight: 400,
                    overflowY: "auto",
                    border: "1px solid #e0e0e0",
                    borderRadius: 1,
                    p: 2,
                    bgcolor: "#fafafa",
                  }}
                >
                  <Grid container spacing={2}>
                    {allProducts.map((product) => {
                      const comboItem = formData.ComboItems.find(
                        (item) => item.productId === product.productId
                      );
                      const toppingsForProduct =
                        hardcodedToppings[product.productId] || [];
                      const isExpanded = expandedProduct === product.productId;
                      return (
                        <Grid item xs={12} sm={4} key={product.productId}>
                          <Box
                            sx={{
                              p: 2,
                              borderRadius: 2,
                              bgcolor: comboItem ? "#f5f0e8" : "white",
                              boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                              "&:hover": {
                                bgcolor: comboItem ? "#ede7df" : "#f9f9f9",
                              },
                              position: "relative",
                            }}
                          >
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 1,
                                mb: 1,
                              }}
                            >
                              <Checkbox
                                checked={!!comboItem}
                                onChange={() =>
                                  handleProductToggle(product.productId)
                                }
                                size="small"
                                sx={{
                                  color: "#8B5E3C",
                                  "&.Mui-checked": { color: "#8B5E3C" },
                                }}
                              />
                              {product.imageUrl ? (
                                <img
                                  src={product.imageUrl}
                                  alt={product.productName}
                                  style={{
                                    width: 40,
                                    height: 40,
                                    objectFit: "cover",
                                    borderRadius: 4,
                                  }}
                                />
                              ) : (
                                <Box
                                  sx={{
                                    width: 40,
                                    height: 40,
                                    bgcolor: "#f0f0f0",
                                    borderRadius: 4,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    fontSize: "0.8rem",
                                    color: "#888",
                                  }}
                                >
                                  N/A
                                </Box>
                              )}
                            </Box>
                            <Typography
                              sx={{
                                fontSize: "0.85rem",
                                color: "#333",
                                fontWeight: "medium",
                                mb: 1,
                                textAlign: "center",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                              }}
                            >
                              {product.productName}
                            </Typography>
                            {comboItem && (
                              <IconButton
                                onClick={() =>
                                  setExpandedProduct(


                                    isExpanded ? null : product.productId
                                  )
                                }
                                sx={{
                                  position: "absolute",
                                  top: 8,
                                  right: 8,
                                  color: "#8B5E3C",
                                  transform: isExpanded
                                    ? "rotate(180deg)"
                                    : "rotate(0deg)",
                                  transition: "transform 0.2s",
                                }}
                              >
                                <ExpandMoreIcon />
                              </IconButton>
                            )}
                            <Collapse in={isExpanded}>
                              {comboItem && (
                                <Box sx={{ mt: 2 }}>
                                  <Box
                                    sx={{
                                      display: "flex",
                                      gap: 1,
                                      mb: 2,
                                      flexWrap: "wrap",
                                    }}
                                  >
                                    <TextField
                                      label="Số lượng"
                                      type="number"
                                      value={comboItem.quantity}
                                      onChange={(e) =>
                                        handleProductFieldChange(
                                          product.productId,
                                          "quantity",
                                          e.target.value
                                        )
                                      }
                                      size="small"
                                      sx={{ width: 100 }}
                                      inputProps={{ min: 1 }}
                                      variant="outlined"
                                    />
                                    <TextField
                                      label="Giảm giá"
                                      type="number"
                                      value={comboItem.discount}
                                      onChange={(e) =>
                                        handleProductFieldChange(
                                          product.productId,
                                          "discount",
                                          e.target.value
                                        )
                                      }
                                      size="small"
                                      sx={{ width: 100 }}
                                      InputProps={{
                                        endAdornment: (
                                          <InputAdornment position="end">
                                            %
                                          </InputAdornment>
                                        ),
                                      }}
                                      inputProps={{ min: 0, max: 100 }}
                                      variant="outlined"
                                    />
                                  </Box>
                                  <Typography
                                    variant="subtitle2"
                                    color="#555"
                                    mb={1}
                                  >
                                    Topping
                                  </Typography>
                                  {toppingsForProduct.length > 0 ? (
                                    <Box
                                      sx={{ maxHeight: 150, overflowY: "auto" }}
                                    >
                                      {toppingsForProduct.map((topping) => {
                                        const selectedTopping =
                                          comboItem.toppings.find(
                                            (t) =>
                                              t.toppingId === topping.toppingId
                                          );
                                        return (
                                          <Box
                                            key={topping.toppingId}
                                            sx={{
                                              display: "flex",
                                              alignItems: "center",
                                              gap: 1,
                                              mb: 1,
                                            }}
                                          >
                                            <Typography
                                              sx={{
                                                fontSize: "0.8rem",
                                                flex: 1,
                                                color: "#444",
                                              }}
                                            >
                                              {topping.toppingName} (
                                              {topping.price.toLocaleString(
                                                "vi-VN",
                                                {
                                                  style: "currency",
                                                  currency: "VND",
                                                }
                                              )}
                                              )
                                            </Typography>
                                            <TextField
                                              type="number"
                                              value={
                                                selectedTopping
                                                  ? selectedTopping.quantity
                                                  : 0
                                              }
                                              onChange={(e) =>
                                                handleToppingChange(
                                                  product.productId,
                                                  topping.toppingId,
                                                  e.target.value
                                                )
                                              }
                                              size="small"
                                              sx={{ width: 70 }}
                                              inputProps={{ min: 0 }}
                                              variant="outlined"
                                            />
                                          </Box>
                                        );
                                      })}
                                    </Box>
                                  ) : (
                                    <Typography
                                      sx={{ fontSize: "0.8rem", color: "#888" }}
                                    >
                                      Không có topping nào
                                    </Typography>
                                  )}
                                </Box>
                              )}
                            </Collapse>
                          </Box>
                        </Grid>
                      );
                    })}
                  </Grid>
                </Box>
              </Grid>
            </Grid>
            <Box mt={3} display="flex" gap={2} justifyContent="flex-end">
              <Button
                variant="contained"
                type="submit"
                sx={{
                  bgcolor: "#8B5E3C",
                  "&:hover": { bgcolor: "#70482F" },
                  borderRadius: 1,
                  textTransform: "none",
                  fontWeight: "bold",
                  px: 3,
                }}
              >
                {isEditMode ? "Lưu Thay Đổi" : "Thêm Combo"}
              </Button>
              <Button
                variant="outlined"
                onClick={handleCloseModal}
                sx={{
                  borderColor: "#8B5E3C",
                  color: "#8B5E3C",
                  "&:hover": { borderColor: "#70482F", color: "#70482F" },
                  borderRadius: 1,
                  textTransform: "none",
                  px: 3,
                }}
              >
                Hủy
              </Button>
            </Box>
          </form>
        </Box>
      </Modal>
    </Box>
  );
}