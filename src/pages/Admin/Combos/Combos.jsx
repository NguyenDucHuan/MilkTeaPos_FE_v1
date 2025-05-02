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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  Divider,
} from "@mui/material";
import {
  Edit as EditIcon,
  Add as AddIcon,
  Visibility as VisibilityIcon,
} from "@mui/icons-material";
import { useDispatch, useSelector } from "react-redux";
import { listItemApi, setPage } from "../../../store/slices/itemSlice";
import toast from "react-hot-toast";
import ComboModal from "./ComboModal";

export default function Combos() {
  const dispatch = useDispatch();
  const {
    items: allItems,
    currentPage,
    pageSize,
    totalPages,
    isLoading: productsLoading,
    error: productsError,
  } = useSelector((state) => state.item);
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
  const [allProducts, setAllProducts] = useState([]);
  const [openDetailsModal, setOpenDetailsModal] = useState(false);
  const [selectedCombo, setSelectedCombo] = useState(null);

  // Filter only combo products based on productType
  const combos = useMemo(() => {
    return allItems.filter((item) => item.productType === "Combo");
  }, [allItems]);

  // Reset currentPage to 1 when the component mounts
  useEffect(() => {
    dispatch(setPage(1));
  }, [dispatch]);

  // Fetch products with pagination
  useEffect(() => {
    dispatch(
      listItemApi({
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
  }, [dispatch, currentPage, pageSize]);

  // Fetch all products for the modal (without pagination)
  useEffect(() => {
    dispatch(
      listItemApi({
        Page: 1,
        PageSize: 1000,
      })
    ).then((result) => {
      if (result.meta.requestStatus === "fulfilled") {
        const filteredProducts = (result.payload.items || []).filter(
          (product) => product.productType === "MaterProduct"
        );
        setAllProducts(filteredProducts);
        console.log("All products fetched for modal:", filteredProducts);
      } else {
        console.error("Error fetching all products for modal:", result.error);
      }
    });
  }, [dispatch]);

  const handleOpenModal = (combo = null) => {
    if (allProducts.length === 0) {
      toast.error("No products available to create a combo!");
      return;
    }
    if (combo) {
      setIsEditMode(true);
      setEditComboId(combo.productId);
      const newFormData = {
        ComboName: combo.productName || "",
        Description: combo.description || "",
        Image: null,
        Price: combo.price ? combo.price.toString() : "0",
        Status: combo.status !== undefined ? combo.status : true,
        ComboItems: combo.comboItems || [],
        categoryId: 5,
      };
      setFormData(newFormData);
      setImagePreview(combo.imageUrl || null);
    } else {
      const newFormData = {
        ComboName: "",
        Description: "",
        Image: null,
        Price: "0",
        Status: true,
        ComboItems: [],
        categoryId: 5,
      };
      setIsEditMode(false);
      setEditComboId(null);
      setFormData(newFormData);
      setImagePreview(null);
    }
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setImagePreview(null);
    // Reset formData để tránh giữ dữ liệu cũ
    setFormData({
      ComboName: "",
      Description: "",
      Image: null,
      Price: "0",
      Status: true,
      ComboItems: [],
      categoryId: 5,
    });
  };

  const handlePageChange = (event, newPage) => {
    dispatch(setPage(newPage));
  };

  const handleOpenDetails = (combo) => {
    setSelectedCombo(combo);
    setOpenDetailsModal(true);
  };

  const handleCloseDetails = () => {
    setOpenDetailsModal(false);
    setSelectedCombo(null);
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
                <TableCell colSpan={5} align="center" sx={{ color: "#888" }}>
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
                    <Box sx={{ display: "flex", gap: 1 }}>
                      <IconButton
                        onClick={() => handleOpenDetails(combo)}
                        sx={{
                          color: "#8B5E3C",
                          "&:hover": { color: "#70482F" },
                        }}
                      >
                        <VisibilityIcon />
                      </IconButton>
                      <IconButton
                        onClick={() => handleOpenModal(combo)}
                        sx={{
                          color: "#8B5E3C",
                          "&:hover": { color: "#70482F" },
                        }}
                      >
                        <EditIcon />
                      </IconButton>
                    </Box>
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

      {/* Modal chi tiết combo */}
      <Dialog
        open={openDetailsModal}
        onClose={handleCloseDetails}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ borderBottom: "2px solid #8B5E3C", pb: 1 }}>
          Chi tiết Combo: {selectedCombo?.productName}
        </DialogTitle>
        <DialogContent>
          {selectedCombo && (
            <Box sx={{ mt: 2 }}>
              <Box
                sx={{
                  width: "100%",
                  height: 300,
                  mb: 3,
                  overflow: "hidden",
                  borderRadius: 2,
                  boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                }}
              >
                <img
                  src={selectedCombo.imageUrl || "/placeholder-image.jpg"}
                  alt={selectedCombo.productName || "Combo"}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                />
              </Box>
              <Typography variant="h6" gutterBottom>
                Thông tin cơ bản
              </Typography>
              <List>
                <ListItem>
                  <ListItemText
                    primary="Mô tả"
                    secondary={selectedCombo.description || "Không có mô tả"}
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="Giá"
                    secondary={parseFloat(selectedCombo.price).toLocaleString(
                      "vi-VN",
                      {
                        style: "currency",
                        currency: "VND",
                      }
                    )}
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="Trạng thái"
                    secondary={selectedCombo.status ? "Kích hoạt" : "Tắt"}
                  />
                </ListItem>
              </List>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" gutterBottom>
                Danh sách sản phẩm có trong combo
              </Typography>
              <List>
                {selectedCombo.comboItems && selectedCombo.comboItems.length > 0 ? (
                  selectedCombo.comboItems.map((item) => {
                    const product = allProducts.find(
                      (p) => p.productId === item.productId
                    );
                    if (!product) return null;
                    const sizeInfo = product.variants?.find(
                      (v) => v.sizeId === item.size
                    );
                    const sizeText = sizeInfo ? ` (Size: ${item.size})` : "";
                    return (
                      <ListItem key={item.productId}>
                        <ListItemText
                          primary={`${product.productName}${sizeText}`}
                          secondary={`Số lượng: ${item.quantity}, Giảm giá: ${item.discount}%`}
                        />
                      </ListItem>
                    );
                  })
                ) : (
                  <ListItem>
                    <ListItemText primary="Chưa có sản phẩm" />
                  </ListItem>
                )}
              </List>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleCloseDetails}
            sx={{
              color: "#8B5E3C",
              "&:hover": { color: "#70482F" },
            }}
          >
            Đóng
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal thêm/cập nhật combo */}
      <ComboModal
        open={openModal}
        onClose={handleCloseModal}
        isEditMode={isEditMode}
        editComboId={editComboId}
        initialFormData={formData}
        imagePreview={imagePreview}
        setImagePreview={setImagePreview}
        allProducts={allProducts}
        currentPage={currentPage}
        pageSize={pageSize}
      />
    </Box>
  );
}