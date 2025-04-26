import React from "react";
import {
  Box,
  Button,
  TextField,
  FormControlLabel,
  Switch,
  Typography,
  Modal,
} from "@mui/material";

export default function FormTopping({ open, handleClose, onSubmit, toppingCategoryId }) {
  return (
    <Modal
      open={open}
      onClose={handleClose}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
    >
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
        <form onSubmit={onSubmit}>
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
            <Button variant="outlined" onClick={handleClose}>
              Hủy
            </Button>
          </Box>
        </form>
      </Box>
    </Modal>
  );
}