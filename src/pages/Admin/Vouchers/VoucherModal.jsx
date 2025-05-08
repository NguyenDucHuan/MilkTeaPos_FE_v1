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
import { useForm, useWatch } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useSelector } from "react-redux";
import { format, startOfDay, isBefore } from "date-fns";

// Tạo schema xác thực
const createSchema = (isEdit) =>
  yup.object().shape({
    VoucherCode: isEdit
      ? yup.string().notRequired()
      : yup
          .string()
          .required("Mã voucher là bắt buộc")
          .test(
            "unique-voucher-code",
            "Mã voucher đã tồn tại",
            function (value) {
              if (!value) return true;
              const vouchers = this.options.context?.vouchers || [];
              return !vouchers.some(
                (v) => v.voucherCode.toLowerCase() === value.toLowerCase()
              );
            }
          ),
    DiscountAmount: yup
      .number()
      .required("Số tiền giảm là bắt buộc")
      .when("DiscountType", {
        is: "Percentage",
        then: (schema) =>
          schema
            .max(100, "Phần trăm giảm không được vượt quá 100%")
            .min(0.01, "Phần trăm giảm phải lớn hơn 0"),
        otherwise: (schema) => schema.min(0.01, "Số tiền giảm phải lớn hơn 0"),
      }),
    DiscountType: yup
      .string()
      .required("Loại giảm giá là bắt buộc")
      .oneOf(["Percentage", "Amount"], "Loại giảm giá không hợp lệ"),
    ExpirationDate: yup
      .date()
      .required("Ngày hết hạn là bắt buộc")
      .nullable()
      .typeError("Định dạng ngày không hợp lệ")
      .min(
        new Date(new Date().setHours(0, 0, 0, 0)).toISOString().split("T")[0],
        "Ngày hết hạn phải từ hôm nay trở đi"
      ),
    MinimumOrderAmount: yup
      .number()
      .required("Đơn hàng tối thiểu là bắt buộc")
      .min(0, "Đơn hàng tối thiểu không được âm"),
  });

const VoucherModal = ({ open, onClose, onSubmit, initialData }) => {
  const { vouchers } = useSelector((state) => state.voucher);
  const isEdit = !!initialData;

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    control,
    setError,
  } = useForm({
    resolver: yupResolver(createSchema(isEdit)),
    defaultValues: {
      VoucherCode: "",
      DiscountAmount: "",
      DiscountType: "Percentage",
      ExpirationDate: "",
      MinimumOrderAmount: "",
    },
    context: { vouchers },
  });
  const watchDiscountType = useWatch({ control, name: "DiscountType" });

  useEffect(() => {
    if (initialData) {
      reset({
        VoucherCode: initialData.VoucherCode,
        DiscountAmount: initialData.DiscountAmount,
        DiscountType: initialData.DiscountType,
        ExpirationDate: initialData.ExpirationDate,
        MinimumOrderAmount: initialData.MinimumOrderAmount,
      });
    } else {
      reset({
        VoucherCode: "",
        DiscountAmount: "",
        DiscountType: "Percentage",
        ExpirationDate: "",
        MinimumOrderAmount: "",
      });
    }
  }, [initialData, reset]);

  const handleFormSubmit = (data) => {
    // Chuyển ExpirationDate thành đối tượng Date và kiểm tra
    const expirationDate = new Date(data.ExpirationDate);
    const today = startOfDay(new Date()); // Ngày hiện tại, bỏ giờ/phút/giây

    // Kiểm tra nếu ngày hết hạn nhỏ hơn ngày hiện tại
    if (isBefore(expirationDate, today)) {
      setError("ExpirationDate", {
        type: "manual",
        message: "Ngày hết hạn không được là quá khứ",
      });
      return;
    }

    // Định dạng ExpirationDate thành chuỗi ISO ở UTC
    const formattedData = {
      ...data,
      ExpirationDate: format(expirationDate, "yyyy-MM-dd'T'00:00:00'Z'"),
      DiscountAmount:
        data.DiscountType === "Percentage"
          ? data.DiscountAmount / 100
          : data.DiscountAmount,
    };
    onSubmit(formattedData);
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
        {initialData ? "Sửa Voucher" : "Thêm Voucher"}
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
          <form id="voucher-form" onSubmit={handleSubmit(handleFormSubmit)}>
            <Box sx={{ marginBottom: "16px" }}>
              <TextField
                label="Mã Voucher"
                fullWidth
                {...register("VoucherCode")}
                error={!!errors.VoucherCode}
                helperText={errors.VoucherCode?.message}
                variant="outlined"
                InputLabelProps={{ style: { fontWeight: "500" } }}
                disabled={isEdit}
              />
            </Box>
            <Box sx={{ marginBottom: "16px" }}>
              <TextField
                label="Số tiền giảm"
                type="number"
                fullWidth
                {...register("DiscountAmount")}
                error={!!errors.DiscountAmount}
                helperText={
                  errors.DiscountAmount?.message ||
                  (watchDiscountType === "Percentage"
                    ? "Nhập theo phần trăm (0.01-100)"
                    : "Nhập số tiền cố định (lớn hơn 0)")
                }
                variant="outlined"
                InputLabelProps={{ style: { fontWeight: "500" } }}
                inputProps={{ min: 0.01, step: "0.01" }}
              />
            </Box>
            <Box sx={{ marginBottom: "16px" }}>
              <TextField
                select
                label="Loại giảm giá"
                fullWidth
                {...register("DiscountType")}
                error={!!errors.DiscountType}
                helperText={errors.DiscountType?.message}
                variant="outlined"
                InputLabelProps={{ style: { fontWeight: "500" } }}
              >
                <MenuItem value="Percentage">Phần trăm</MenuItem>
                <MenuItem value="Amount">Số tiền</MenuItem>
              </TextField>
            </Box>
            <Box sx={{ marginBottom: "16px" }}>
              <TextField
                label="Ngày hết hạn"
                type="date"
                fullWidth
                InputLabelProps={{ shrink: true, style: { fontWeight: "500" } }}
                {...register("ExpirationDate")}
                error={!!errors.ExpirationDate}
                helperText={errors.ExpirationDate?.message}
                variant="outlined"
                inputProps={{
                  min: new Date(new Date().setHours(0, 0, 0, 0))
                    .toISOString()
                    .split("T")[0],
                }}
              />
            </Box>
            <Box sx={{ marginBottom: "16px" }}>
              <TextField
                label="Đơn hàng tối thiểu"
                type="number"
                fullWidth
                {...register("MinimumOrderAmount")}
                error={!!errors.MinimumOrderAmount}
                helperText={errors.MinimumOrderAmount?.message}
                variant="outlined"
                InputLabelProps={{ style: { fontWeight: "500" } }}
                inputProps={{ min: 0, step: "1" }}
              />
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
          Hủy
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
