import React, { useEffect } from "react";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
  TextField,
  MenuItem,
  Box,
} from "@mui/material";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useDispatch } from "react-redux";
import {
  createVoucher,
  updateVoucher,
} from "../../../store/slices/voucherSlice";

const schema = yup.object().shape({
  VoucherCode: yup.string().required("Voucher code is required"),
  DiscountAmount: yup
    .number()
    .required("Discount amount is required")
    .positive("Discount amount must be positive"),
  DiscountType: yup
    .string()
    .required("Discount type is required")
    .oneOf(["percentage", "fixed"], "Invalid discount type"),
  ExpirationDate: yup
    .date()
    .required("Expiration date is required")
    .nullable()
    .typeError("Invalid date format"),
  MinimumOrderAmount: yup
    .number()
    .required("Minimum order amount is required")
    .min(0, "Minimum order amount cannot be negative"),
  Status: yup.boolean().required("Status is required"),
});

const VoucherModal = ({ open, onClose, initialData }) => {
  const dispatch = useDispatch();
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: initialData || {
      VoucherCode: "",
      DiscountAmount: "",
      DiscountType: "percentage",
      ExpirationDate: "",
      MinimumOrderAmount: "",
      Status: true,
    },
  });

  useEffect(() => {
    reset(
      initialData || {
        VoucherCode: "",
        DiscountAmount: "",
        DiscountType: "percentage",
        ExpirationDate: "",
        MinimumOrderAmount: "",
        Status: true,
      }
    );
  }, [initialData, reset]);

  const onSubmit = (data) => {
    if (initialData?.id) {
      dispatch(updateVoucher({ id: initialData.id, data }));
    } else {
      dispatch(createVoucher(data));
    }
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      sx={{
        "& .MuiDialog-paper": {
          borderRadius: "12px",
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
          maxWidth: "600px",
        },
      }}
    >
      <DialogTitle
        sx={{
          fontWeight: "bold",
          fontSize: "1.5rem",
          color: "#1976d2",
          borderBottom: "1px solid #e0e0e0",
          padding: "16px 24px",
          textAlign: "center",
        }}
      >
        {initialData ? "Edit Voucher" : "Add Voucher"}
      </DialogTitle>
      <Box sx={{ padding: "0 24px" }}>
        <DialogContent
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: "20px",
            padding: "24px 0",
          }}
        >
          <form id="voucher-form" onSubmit={handleSubmit(onSubmit)}>
            <Box sx={{ marginBottom: "16px" }}>
              <TextField
                label="Voucher Code"
                fullWidth
                {...register("VoucherCode")}
                error={!!errors.VoucherCode}
                helperText={errors.VoucherCode?.message}
                variant="outlined"
                InputLabelProps={{ style: { fontWeight: "500" } }}
              />
            </Box>
            <Box sx={{ marginBottom: "16px" }}>
              <TextField
                label="Discount Amount"
                type="number"
                fullWidth
                {...register("DiscountAmount")}
                error={!!errors.DiscountAmount}
                helperText={errors.DiscountAmount?.message}
                variant="outlined"
                InputLabelProps={{ style: { fontWeight: "500" } }}
              />
            </Box>
            <Box sx={{ marginBottom: "16px" }}>
              <TextField
                select
                label="Discount Type"
                fullWidth
                {...register("DiscountType")}
                error={!!errors.DiscountType}
                helperText={errors.DiscountType?.message}
                variant="outlined"
                InputLabelProps={{ style: { fontWeight: "500" } }}
              >
                <MenuItem value="percentage">Percentage</MenuItem>
                <MenuItem value="fixed">Fixed</MenuItem>
              </TextField>
            </Box>
            <Box sx={{ marginBottom: "16px" }}>
              <TextField
                label="Expiration Date"
                type="date"
                fullWidth
                InputLabelProps={{ shrink: true, style: { fontWeight: "500" } }}
                {...register("ExpirationDate")}
                error={!!errors.ExpirationDate}
                helperText={errors.ExpirationDate?.message}
                variant="outlined"
              />
            </Box>
            <Box sx={{ marginBottom: "16px" }}>
              <TextField
                label="Minimum Order Amount"
                type="number"
                fullWidth
                {...register("MinimumOrderAmount")}
                error={!!errors.MinimumOrderAmount}
                helperText={errors.MinimumOrderAmount?.message}
                variant="outlined"
                InputLabelProps={{ style: { fontWeight: "500" } }}
              />
            </Box>
            <Box sx={{ marginBottom: "16px" }}>
              <TextField
                select
                label="Status"
                fullWidth
                {...register("Status")}
                error={!!errors.Status}
                helperText={errors.Status?.message}
                variant="outlined"
                InputLabelProps={{ style: { fontWeight: "500" } }}
              >
                <MenuItem value={true}>Active</MenuItem>
                <MenuItem value={false}>Inactive</MenuItem>
              </TextField>
            </Box>
          </form>
        </DialogContent>
      </Box>
      <DialogActions
        sx={{
          padding: "16px 24px",
          borderTop: "1px solid #e0e0e0",
          justifyContent: "flex-end",
          gap: "12px",
        }}
      >
        <Button
          onClick={onClose}
          sx={{
            textTransform: "none",
            color: "#757575",
            fontWeight: "500",
            padding: "8px 16px",
            "&:hover": {
              backgroundColor: "#f5f5f5",
            },
          }}
        >
          Huỷ
        </Button>
        <Button
          variant="contained"
          type="submit"
          form="voucher-form"
          sx={{
            textTransform: "none",
            fontWeight: "500",
            padding: "8px 16px",
            backgroundColor: "#1976d2",
            "&:hover": {
              backgroundColor: "#1565c0",
            },
          }}
        >
          {initialData ? "Cập nhật" : "Thêm"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default VoucherModal;
