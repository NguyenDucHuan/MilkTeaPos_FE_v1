import React, { useEffect, useState } from "react";
import { Modal, Box, Typography, Button, IconButton, CircularProgress, MenuItem, Select, FormControl, InputLabel, TextField } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import fetcher from "../../apis/fetcher";
import { useDispatch } from "react-redux";
import { getCartApi } from "../../store/slices/orderSlice";

export default function ModalUpdateCart({ open, onClose, orderItemId }) {
  const [itemData, setItemData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [size, setSize] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [toppings, setToppings] = useState([]);
  const [allToppings, setAllToppings] = useState([]);
  const [saving, setSaving] = useState(false);
  const dispatch = useDispatch();

  useEffect(() => {
    if (open && orderItemId) {
      setLoading(true);
      fetcher.get(`/order-item/get-by-id/${orderItemId}`)
        .then(res => {
          setItemData(res.data);
          const currentVariant = res.data.productParent?.variants?.find(v => v.productId === res.data.productId);
          const newSize = currentVariant ? currentVariant.sizeId : (res.data.sizeId || res.data.product?.sizeId || "");
          setSize(newSize);
          setQuantity(res.data.quantity || 1);
          setToppings(res.data.toppings?.map(t => t.toppingId) || []);
        })
        .finally(() => setLoading(false));
      // Lấy danh sách topping để chọn
      fetcher.get("/products", { params: { ProductType: "extra" } })
        .then(res => {
          setAllToppings((res.data?.data?.items || []));
        });
    }
  }, [open, orderItemId]);

  if (!open) return null;

  const handleSave = async () => {
    setSaving(true);
    try {
      const selectedVariant = itemData.productParent?.variants?.find(v => v.sizeId === size);
      const productId = selectedVariant ? selectedVariant.productId : itemData.productId;
      const sizeId = selectedVariant ? selectedVariant.sizeId : itemData.sizeId;
      console.log('Update with productId:', productId, 'sizeId:', sizeId, 'quantity:', quantity, 'toppingIds:', toppings);

      await fetcher.put(`/order-item/edit-order-item/${orderItemId}`, {
        productId,
        quantity,
        toppingIds: toppings,
        sizeId
      });

      // Lấy lại thông tin order item vừa cập nhật để lấy giá đúng
      const res = await fetcher.get(`/order-item/get-by-id/${orderItemId}`);
      const updatedVariant = res.data.productParent?.variants?.find(v => v.productId === productId);
      const updatedPrice = updatedVariant ? updatedVariant.price : res.data.price;

      await dispatch(getCartApi());
      onClose();
    } catch (e) {
      alert("Có lỗi khi cập nhật sản phẩm");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={{
        position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)",
        bgcolor: "white", p: 3, borderRadius: 2, minWidth: 350, maxWidth: 400
      }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Typography variant="h6">Chỉnh sửa sản phẩm</Typography>
          <IconButton onClick={onClose}><CloseIcon /></IconButton>
        </Box>
        {loading || !itemData ? <Box sx={{ textAlign: "center", p: 3 }}><CircularProgress /></Box> : (
          <>
            <Typography variant="subtitle1" sx={{ mt: 2 }}>{itemData.productName}</Typography>
            <Box sx={{ mt: 2 }}>
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Size</InputLabel>
                <Select value={size} label="Size" onChange={e => setSize(e.target.value)}>
                  {itemData.productParent?.variants?.map(variant => (
                    <MenuItem key={variant.sizeId} value={variant.sizeId}>{variant.sizeId} ({variant.price} VNĐ)</MenuItem>
                  ))}
                </Select>
              </FormControl>
            
              <FormControl fullWidth>
                <InputLabel>Topping</InputLabel>
                <Select
                  multiple
                  value={toppings}
                  onChange={e => setToppings(e.target.value)}
                  renderValue={selected =>
                    allToppings.filter(t => selected.includes(t.productId)).map(t => t.productName).join(", ")
                  }
                >
                  {allToppings.map(topping => (
                    <MenuItem key={topping.productId} value={topping.productId}>
                      {topping.productName} ({topping.price} VNĐ)
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
            <Box sx={{ mt: 3, display: "flex", justifyContent: "flex-end" }}>
              <Button onClick={onClose} sx={{ mr: 2 }}>Hủy</Button>
              <Button variant="contained" onClick={handleSave} disabled={saving}>{saving ? <CircularProgress size={20} /> : "Lưu"}</Button>
            </Box>
          </>
        )}
      </Box>
    </Modal>
  );
}
