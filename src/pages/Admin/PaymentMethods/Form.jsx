import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  FormControlLabel,
  Switch,
} from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import mockPayments from "./mockPayments";

export default function PaymentForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = Boolean(id);

  const [formData, setFormData] = useState({
    methodName: "",
    description: "",
    status: true,
  });

  useEffect(() => {
    if (isEditMode) {
      const method = mockPayments.find((item) => String(item.id) === id);
      if (method) {
        setFormData({
          methodName: method.methodName,
          description: method.description,
          status: method.status,
        });
      }
    }
  }, [id, isEditMode]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleToggleStatus = () => {
    setFormData((prev) => ({
      ...prev,
      status: !prev.status,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isEditMode) {
      console.log("Cập nhật phương thức:", formData);
    } else {
      console.log("Thêm mới phương thức:", formData);
    }
    navigate("/admin/payments");
  };

  return (
    <Box sx={{ padding: 3 }}>
      <Typography variant="h5" fontWeight="bold" gutterBottom>
        {isEditMode ? "Chỉnh sửa phương thức" : "Thêm phương thức thanh toán"}
      </Typography>

      <Paper sx={{ padding: 3 }}>
        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Tên phương thức"
            name="methodName"
            value={formData.methodName}
            onChange={handleChange}
            margin="normal"
            required
          />

          <TextField
            fullWidth
            label="Mô tả"
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
            label="Trạng thái kích hoạt"
            sx={{ mt: 2 }}
          />

          <Box mt={3} display="flex" gap={2}>
            <Button
              variant="contained"
              type="submit"
              sx={{ backgroundColor: "#8B5E3C" }}
            >
              {isEditMode ? "Cập nhật" : "Thêm mới"}
            </Button>
            <Button variant="outlined" onClick={() => navigate("/admin/payments")}>
              Hủy
            </Button>
          </Box>
        </form>
      </Paper>
    </Box>
  );
}
