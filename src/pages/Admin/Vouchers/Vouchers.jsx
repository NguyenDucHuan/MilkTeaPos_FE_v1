// src/pages/admin/Vouchers.jsx
import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import {
  getAllVouchers,
  deleteVouchers,
  createVoucher,
  updateVoucher,
} from "../../../store/slices/voucherSlice";
import toast from "react-hot-toast";
import VoucherModal from "./VoucherModal";

export default function Vouchers() {
  const dispatch = useDispatch();
  const { voucher, isLoading, error } = useSelector((state) => state.voucher);

  const [openConfirm, setOpenConfirm] = useState(false);
  const [selectedVoucherId, setSelectedVoucherId] = useState(null);

  const [openModal, setOpenModal] = useState(false);
  const [editVoucher, setEditVoucher] = useState(null);

  useEffect(() => {
    dispatch(getAllVouchers());
  }, [dispatch]);

  const handleOpenAddModal = () => {
    setEditVoucher(null);
    setOpenModal(true);
  };

  const handleOpenEditModal = (voucher) => {
    setEditVoucher(voucher);
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setEditVoucher(null);
  };

  const handleModalSubmit = async (formData) => {
    try {
      if (editVoucher) {
        await dispatch(
          updateVoucher({ id: editVoucher.id, data: formData })
        ).unwrap();
        toast.success("Cập nhật voucher thành công!");
      } else {
        await dispatch(createVoucher(formData)).unwrap();
        toast.success("Thêm voucher thành công!");
      }
      dispatch(getAllVouchers());
      handleCloseModal();
    } catch (err) {
      toast.error("Thao tác thất bại!");
    }
  };

  const handleOpenConfirm = (id) => {
    setSelectedVoucherId(id);
    setOpenConfirm(true);
  };

  const handleCloseConfirm = () => {
    setOpenConfirm(false);
    setSelectedVoucherId(null);
  };

  const handleConfirmDelete = async () => {
    try {
      await dispatch(deleteVouchers(selectedVoucherId)).unwrap();
      toast.success("Xoá voucher thành công!");
    } catch {
      toast.error("Xoá voucher thất bại!");
    } finally {
      handleCloseConfirm();
    }
  };

  if (isLoading) return <Typography sx={{ p: 2 }}>Loading...</Typography>;
  if (error)
    return (
      <Typography sx={{ p: 2 }} color="error">
        Error: {error}
      </Typography>
    );

  return (
    <Box sx={{ p: 2 }}>
      <Box sx={{ mb: 2 }}>
        <Button variant="contained" onClick={handleOpenAddModal}>
          Add Voucher
        </Button>
      </Box>

      {!voucher || voucher.length === 0 ? (
        <Typography>No vouchers available.</Typography>
      ) : (
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Voucher Code</TableCell>
              <TableCell>Discount Amount</TableCell>
              <TableCell>Discount Type</TableCell>
              <TableCell>Expiration Date</TableCell>
              <TableCell>Min Order Amount</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Created At</TableCell>
              <TableCell>Updated At</TableCell>
              <TableCell>Voucher ID</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {voucher.map((item) => (
              <TableRow key={item.VoucherId}>
                <TableCell>{item.VoucherCode}</TableCell>
                <TableCell>{item.DiscountAmount}</TableCell>
                <TableCell>{item.DiscountType}</TableCell>
                <TableCell>
                  {new Date(item.ExpirationDate).toLocaleDateString()}
                </TableCell>
                <TableCell>{item.MinimumOrderAmount}</TableCell>
                <TableCell>{item.Status ? "Active" : "Inactive"}</TableCell>
                <TableCell>
                  {new Date(item.Created_at).toLocaleString()}
                </TableCell>
                <TableCell>
                  {new Date(item.Updated_at).toLocaleString()}
                </TableCell>
                <TableCell>{item.VoucherId}</TableCell>
                <TableCell>
                  <Button
                    variant="contained"
                    color="warning"
                    sx={{ mr: 1 }}
                    onClick={() => handleOpenEditModal(item)}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="contained"
                    color="error"
                    onClick={() => handleOpenConfirm(item.id)}
                  >
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {/* Modal xác nhận xoá */}
      <Dialog open={openConfirm} onClose={handleCloseConfirm}>
        <DialogTitle>Xác nhận xoá</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Bạn có chắc chắn muốn xoá voucher này không?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseConfirm}>Huỷ</Button>
          <Button color="error" onClick={handleConfirmDelete}>
            Xoá
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal tạo/sửa */}
      <VoucherModal
        open={openModal}
        onClose={handleCloseModal}
        onSubmit={handleModalSubmit}
        initialData={editVoucher}
      />
    </Box>
  );
}
