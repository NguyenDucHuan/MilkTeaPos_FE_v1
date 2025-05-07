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
  Pagination,
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
  const { vouchers, isLoading, error, pagination } = useSelector(
    (state) => state.voucher
  );
  console.log("Danh sách voucher:", vouchers);

  const [openConfirm, setOpenConfirm] = useState(false);
  const [selectedVoucherId, setSelectedVoucherId] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [editVoucher, setEditVoucher] = useState(null);

  useEffect(() => {
    dispatch(
      getAllVouchers({
        Page: pagination.currentPage,
        PageSize: pagination.pageSize,
      })
    );
  }, [dispatch, pagination.currentPage, pagination.pageSize]);

  const handleOpenAddModal = () => {
    setEditVoucher(null);
    setOpenModal(true);
  };

  const handleOpenEditModal = (voucher) => {
    setEditVoucher({
      id: voucher.voucherId,
      VoucherCode: voucher.voucherCode,
      DiscountAmount:
        voucher.discountType === "Percentage"
          ? voucher.discountAmount * 100
          : voucher.discountAmount,
      DiscountType: voucher.discountType,
      ExpirationDate: new Date(voucher.expirationDate)
        .toISOString()
        .split("T")[0],
      MinimumOrderAmount: voucher.minimumOrderAmount,
    });
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
      dispatch(
        getAllVouchers({
          Page: pagination.currentPage,
          PageSize: pagination.pageSize,
        })
      );
      handleCloseModal();
    } catch (err) {
      toast.error("Thao tác thất bại! " + (err.message || err.detail || ""));
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
      dispatch(
        getAllVouchers({
          Page: pagination.currentPage,
          PageSize: pagination.pageSize,
        })
      );
    } catch {
      toast.error("Xoá voucher thất bại!");
    } finally {
      handleCloseConfirm();
    }
  };

  const handlePageChange = (event, newPage) => {
    dispatch(getAllVouchers({ Page: newPage, PageSize: pagination.pageSize }));
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

      {!vouchers || vouchers.length === 0 ? (
        <Typography>Không có voucher nào.</Typography>
      ) : (
        <>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Mã Voucher</TableCell>
                <TableCell>Số tiền giảm</TableCell>
                <TableCell>Loại giảm giá</TableCell>
                <TableCell>Ngày hết hạn</TableCell>
                <TableCell>Đơn hàng tối thiểu</TableCell>
                <TableCell>Trạng thái</TableCell>
                <TableCell>Hành động</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {vouchers.map((item) => (
                <TableRow key={item.voucherId}>
                  <TableCell>{item.voucherCode}</TableCell>
                  <TableCell>
                    {item.discountType === "Percentage"
                      ? `${(item.discountAmount * 100).toFixed(0)}%`
                      : item.discountAmount}
                  </TableCell>
                  <TableCell>{item.discountType}</TableCell>
                  <TableCell>
                    {new Date(item.expirationDate).toLocaleDateString("vi-VN")}
                  </TableCell>
                  <TableCell>{item.minimumOrderAmount}</TableCell>
                  <TableCell>
                    {item.status ? "Hoạt động" : "Ngưng hoạt động"}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="contained"
                      color="warning"
                      sx={{ mr: 1 }}
                      onClick={() => handleOpenEditModal(item)}
                    >
                      Sửa
                    </Button>
                    <Button
                      variant="contained"
                      color="error"
                      onClick={() => handleOpenConfirm(item.voucherId)}
                    >
                      Xóa
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
            <Pagination
              count={pagination.totalPages}
              page={pagination.currentPage}
              onChange={handlePageChange}
              color="primary"
              sx={{ "& .MuiPagination-ul": { justifyContent: "center" } }}
            />
          </Box>
        </>
      )}

      {/* Modal xác nhận xóa */}
      <Dialog open={openConfirm} onClose={handleCloseConfirm}>
        <DialogTitle>Xác nhận xóa</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Bạn có chắc chắn muốn xóa voucher này không?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseConfirm}>Hủy</Button>
          <Button color="error" onClick={handleConfirmDelete}>
            Xóa
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
