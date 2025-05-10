import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  MenuItem,
  CircularProgress,
  Modal,
  Backdrop,
  Fade,
  styled,
} from "@mui/material";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { useDispatch, useSelector } from "react-redux";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import { getCash } from "../../../store/slices/cashSlice";
import fetcher from "../../../apis/fetcher";

// Styled components
const StyledCard = styled(Card)(({ theme }) => ({
  backgroundColor: "#f9f5f1",
  borderRadius: theme.spacing(1),
  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
}));

const StyledButton = styled(Button)(({ theme }) => ({
  backgroundColor: "#895a2a",
  color: "#fff",
  "&:hover": {
    backgroundColor: "#6b4423",
  },
}));

const ModalBox = styled(Box)(({ theme }) => ({
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  backgroundColor: "#fff",
  borderRadius: theme.spacing(1),
  boxShadow: "0 8px 24px rgba(0,0,0,0.2)",
  padding: theme.spacing(3),
}));

// Validation schema
const validationSchema = Yup.object({
  amount: Yup.number()
    .typeError("Số tiền phải là một số")
    .positive("Số tiền phải là số dương")
    .required("Số tiền là bắt buộc"),
  type: Yup.string()
    .oneOf(["CashIn", "CashOut"], "Loại giao dịch không hợp lệ")
    .required("Loại giao dịch là bắt buộc"),
  description: Yup.string().required("Mô tả là bắt buộc"),
});

// Sub-component: Form for adding cash transactions
const CashForm = ({ onSubmit, control, errors }) => (
  <Box
    component={Paper}
    sx={{
      p: 3,
      mb: 4,
      borderRadius: 2,
      boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
    }}
  >
    <Typography variant="h6" sx={{ mb: 2, color: "#895a2a" }}>
      Thêm Giao Dịch
    </Typography>
    <Box
      component="form"
      onSubmit={onSubmit}
      sx={{
        display: "grid",
        gap: 2,
        gridTemplateColumns: { xs: "1fr", md: "1fr 1fr 1fr auto" },
      }}
    >
      <Controller
        name="amount"
        control={control}
        render={({ field }) => (
          <TextField
            {...field}
            label="Số tiền"
            type="number"
            size="small"
            error={!!errors.amount}
            helperText={errors.amount?.message}
            fullWidth
          />
        )}
      />
      <Controller
        name="type"
        control={control}
        render={({ field }) => (
          <TextField
            {...field}
            label="Loại giao dịch"
            select
            size="small"
            error={!!errors.type}
            helperText={errors.type?.message}
            fullWidth
          >
            <MenuItem value="CashIn">Nạp tiền</MenuItem>
            <MenuItem value="CashOut">Rút tiền</MenuItem>
          </TextField>
        )}
      />
      <Controller
        name="description"
        control={control}
        render={({ field }) => (
          <TextField
            {...field}
            label="Mô tả"
            size="small"
            error={!!errors.description}
            helperText={errors.description?.message}
            fullWidth
          />
        )}
      />
      <StyledButton type="submit" variant="contained" size="small">
        Thêm
      </StyledButton>
    </Box>
  </Box>
);

// Sub-component: Stats cards
const CashStats = ({ cash }) => (
  <Grid container spacing={2} sx={{ mb: 4 }}>
    {[
      { label: "Số dư đầu ngày", value: cash?.openingBalance || 0 },
      { label: "Dòng tiền vào", value: cash?.cashInTotal || 0 },
      { label: "Dòng tiền ra", value: cash?.cashOutTotal || 0 },
      { label: "Số dư cuối ngày", value: cash?.closingBalance || 0 },
      { label: "Tổng tiền hiện tại", value: cash?.amount || 0 },
    ].map((stat, index) => (
      <Grid item xs={12} sm={6} md={2.4} key={index}>
        <StyledCard>
          <CardContent>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {stat.label}
            </Typography>
            <Typography
              variant="h6"
              sx={{ color: "#895a2a", fontWeight: "bold" }}
            >
              {stat.value.toLocaleString("vi-VN")} VNĐ
            </Typography>
          </CardContent>
        </StyledCard>
      </Grid>
    ))}
  </Grid>
);

// Sub-component: Transactions table
const CashTable = ({ transactions }) => (
  <TableContainer
    component={Paper}
    sx={{
      bgcolor: "#fff",
      borderRadius: 2,
      boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
    }}
  >
    <Table>
      <TableHead>
        <TableRow sx={{ bgcolor: "#f9f5f1" }}>
          <TableCell>Thời gian</TableCell>
          <TableCell>Loại</TableCell>
          <TableCell>Số tiền</TableCell>
          <TableCell>Mô tả</TableCell>
          <TableCell>Nhân viên</TableCell>
          <TableCell>Số dư trước</TableCell>
          <TableCell>Số dư sau</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {transactions.map((transaction) => (
          <TableRow key={transaction.transactionId}>
            <TableCell>
              {format(
                new Date(transaction.transactionDate),
                "HH:mm dd/MM/yyyy",
                { locale: vi }
              )}
            </TableCell>
            <TableCell>
              <Typography
                sx={{
                  fontWeight: "bold",
                  color:
                    transaction.transactionType === "CashIn"
                      ? "success.main"
                      : "error.main",
                }}
              >
                {transaction.transactionType === "CashIn"
                  ? "Nạp tiền"
                  : "Rút tiền"}
              </Typography>
            </TableCell>
            <TableCell>
              <Typography sx={{ fontWeight: "bold" }}>
                {transaction.amount.toLocaleString("vi-VN")} VNĐ
              </Typography>
            </TableCell>
            <TableCell>{transaction.description || "-"}</TableCell>
            <TableCell>{transaction.staffId || "-"}</TableCell>
            <TableCell>
              {transaction.beforeCashBalance.toLocaleString("vi-VN")} VNĐ
            </TableCell>
            <TableCell>
              {transaction.afterCashBalance.toLocaleString("vi-VN")} VNĐ
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </TableContainer>
);

// Sub-component: Confirmation modal
const ConfirmationModal = ({ open, onClose, onConfirm, formData }) => (
  <Modal
    open={open}
    onClose={onClose}
    closeAfterTransition
    BackdropComponent={Backdrop}
    BackdropProps={{ timeout: 500 }}
  >
    <Fade in={open}>
      <ModalBox>
        <Typography variant="h6" sx={{ mb: 2, color: "#895a2a" }}>
          Xác nhận giao dịch
        </Typography>
        <Typography sx={{ mb: 2 }}>
          Bạn có chắc chắn muốn thực hiện giao dịch{" "}
          <strong>
            {formData?.type === "CashIn" ? "Nạp tiền" : "Rút tiền"}
          </strong>{" "}
          với số tiền{" "}
          <strong>{formData?.amount?.toLocaleString("vi-VN")} VNĐ</strong>?
        </Typography>
        <Typography sx={{ mb: 3 }}>
          Mô tả: <strong>{formData?.description}</strong>
        </Typography>
        <Box sx={{ display: "flex", gap: 2, justifyContent: "flex-end" }}>
          <Button
            variant="outlined"
            onClick={onClose}
            sx={{
              color: "#895a2a",
              borderColor: "#895a2a",
              "&:hover": { borderColor: "#6bระดับ3" },
            }}
          >
            Hủy
          </Button>
          <StyledButton onClick={onConfirm} variant="contained">
            Xác nhận
          </StyledButton>
        </Box>
      </ModalBox>
    </Fade>
  </Modal>
);

// Main component
export default function Cash() {
  const dispatch = useDispatch();
  const { cash, loading, error } = useSelector((state) => state.cash);
  const [transactions, setTransactions] = useState([]);
  const [startDate, setStartDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [endDate, setEndDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [openModal, setOpenModal] = useState(false);
  const [formData, setFormData] = useState(null);

  // Form setup
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(validationSchema),
    defaultValues: { amount: "", type: "CashIn", description: "" },
  });

  // Fetch transactions
  useEffect(() => {
    if (startDate && endDate) {
      dispatch(getCash({ startDate, endDate }));
    }
  }, [dispatch, startDate, endDate]);

  // Update transactions
  useEffect(() => {
    setTransactions(cash?.transactions || []);
  }, [cash]);

  // Handle form submission
  const onSubmit = (data) => {
    setFormData(data);
    setOpenModal(true);
  };

  // Handle transaction confirmation
  const handleConfirm = async () => {
    try {
      const formDataToSend = new FormData();
      formDataToSend.append("amount", Number(formData.amount));
      formDataToSend.append("type", formData.type);
      formDataToSend.append("description", formData.description);

      await fetcher.post("/cash-balance/update-cash-balance", formDataToSend, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      reset();
      dispatch(getCash({ startDate, endDate }));
      alert("Thêm giao dịch thành công!");
      setOpenModal(false);
    } catch (error) {
      alert(
        error.response?.data?.message || "Có lỗi xảy ra khi thêm giao dịch"
      );
      setOpenModal(false);
    }
  };

  // Close modal
  const handleCloseModal = () => {
    setOpenModal(false);
    setFormData(null);
  };

  return (
    <Box sx={{ p: 3, maxWidth: 1400, mx: "auto" }}>
      <Typography
        variant="h4"
        sx={{ mb: 3, color: "#895a2a", fontWeight: "bold" }}
      >
        Quản Lý Dòng Tiền
      </Typography>

      <CashStats cash={cash} />

      <CashForm
        onSubmit={handleSubmit(onSubmit)}
        control={control}
        errors={errors}
      />

      <Box sx={{ mb: 3, display: "flex", gap: 2, flexWrap: "wrap" }}>
        <TextField
          label="Từ ngày"
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          InputLabelProps={{ shrink: true }}
          size="small"
          sx={{ width: 180 }}
        />
        <TextField
          label="Đến ngày"
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          InputLabelProps={{ shrink: true }}
          size="small"
          sx={{ width: 180 }}
        />
      </Box>

      {loading && (
        <Box sx={{ display: "flex", justifyContent: "center", py: 3 }}>
          <CircularProgress />
        </Box>
      )}
      {error && (
        <Typography color="error" sx={{ mb: 2 }}>
          {error.detail || "Không có giao dịch cho ngày được chọn"}
        </Typography>
      )}
      {!error && transactions.length === 0 && !loading && (
        <Typography sx={{ mb: 2 }}>
          Không có giao dịch trong khoảng thời gian này
        </Typography>
      )}

      {transactions.length > 0 && !loading && (
        <CashTable transactions={transactions} />
      )}

      <ConfirmationModal
        open={openModal}
        onClose={handleCloseModal}
        onConfirm={handleConfirm}
        formData={formData}
      />
    </Box>
  );
}
