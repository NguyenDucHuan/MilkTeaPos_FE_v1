import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import fetcher from "../../apis/fetcher";

export const getAllVouchers = createAsyncThunk(
  "voucher/getAllVouchers",
  async ({ Page, PageSize }, { rejectWithValue }) => {
    try {
      const response = await fetcher.get(
        `/vouchers?Page=${Page}&PageSize=${PageSize}`
      );
      console.log("Fetched vouchers:", response.data);
      return {
        items: response.data.items,
        total: response.data.total,
        totalPages: response.data.totalPages,
        currentPage: response.data.page,
        pageSize: response.data.size,
      };
    } catch (error) {
      console.error("Get vouchers error:", error.response || error.message);
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const deleteVouchers = createAsyncThunk(
  "voucher/deleteVouchers",
  async (id, { rejectWithValue, dispatch, getState }) => {
    try {
      console.log("Sending DELETE request for ID:", id);
      const response = await fetcher.delete(`/vouchers?id=${id}`);
      console.log("DELETE response:", response.data);
      const { pagination } = getState().voucher;
      dispatch(
        getAllVouchers({
          Page: pagination.currentPage,
          PageSize: pagination.pageSize,
        })
      );
      return id;
    } catch (error) {
      console.error("DELETE error:", {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
      });
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const createVoucher = createAsyncThunk(
  "voucher/createVoucher",
  async (data, { rejectWithValue, dispatch }) => {
    try {
      const formData = new FormData();
      formData.append("VoucherCode", data.VoucherCode);
      formData.append("DiscountAmount", data.DiscountAmount);
      formData.append("DiscountType", data.DiscountType);
      formData.append("ExpirationDate", data.ExpirationDate);
      formData.append("MinimumOrderAmount", data.MinimumOrderAmount);

      console.log("Dữ liệu gửi lên API:", {
        VoucherCode: data.VoucherCode,
        DiscountAmount: data.DiscountAmount,
        DiscountType: data.DiscountType,
        ExpirationDate: data.ExpirationDate,
        MinimumOrderAmount: data.MinimumOrderAmount,
      });

      const response = await fetcher.post("/vouchers", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      console.log("Voucher đã tạo:", response.data);
      dispatch(getAllVouchers({ Page: 1, PageSize: 10 }));
      return response.data;
    } catch (error) {
      console.error("Lỗi tạo voucher:", {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
      });
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const updateVoucher = createAsyncThunk(
  "voucher/updateVoucher",
  async ({ id, data }, { rejectWithValue, dispatch, getState }) => {
    try {
      const formData = new FormData();
      formData.append("VoucherCode", data.VoucherCode);
      formData.append("DiscountAmount", data.DiscountAmount);
      formData.append("DiscountType", data.DiscountType);
      formData.append("ExpirationDate", data.ExpirationDate);
      formData.append("MinimumOrderAmount", data.MinimumOrderAmount);

      const response = await fetcher.put(`/vouchers?id=${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      console.log("Updated voucher:", response.data);
      const { pagination } = getState().voucher;
      dispatch(
        getAllVouchers({
          Page: pagination.currentPage,
          PageSize: pagination.pageSize,
        })
      );
      return response.data;
    } catch (error) {
      console.error("Update voucher error:", error.response || error.message);
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const voucherSlice = createSlice({
  name: "voucher",
  initialState: {
    vouchers: [],
    isLoading: false,
    error: null,
    pagination: {
      total: 0,
      totalPages: 1,
      currentPage: 1,
      pageSize: 10,
    },
  },
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(getAllVouchers.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(getAllVouchers.fulfilled, (state, { payload }) => {
      state.isLoading = false;
      state.vouchers = payload.items;
      state.pagination = {
        total: payload.total,
        totalPages: payload.totalPages,
        currentPage: payload.currentPage,
        pageSize: payload.pageSize,
      };
    });
    builder.addCase(getAllVouchers.rejected, (state, { payload }) => {
      state.isLoading = false;
      state.error = payload;
    });
    builder.addCase(deleteVouchers.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(deleteVouchers.fulfilled, (state) => {
      state.isLoading = false;
    });
    builder.addCase(deleteVouchers.rejected, (state, { payload }) => {
      state.isLoading = false;
      state.error = payload;
    });
    builder.addCase(createVoucher.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(createVoucher.fulfilled, (state, { payload }) => {
      state.isLoading = false;
      state.error = null;
      state.vouchers = [...state.vouchers, payload];
    });
    builder.addCase(createVoucher.rejected, (state, { payload }) => {
      state.isLoading = false;
      state.error = payload;
    });
    builder.addCase(updateVoucher.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(updateVoucher.fulfilled, (state, { payload }) => {
      state.isLoading = false;
      state.error = null;
      const index = state.vouchers.findIndex(
        (v) => v.voucherId === payload.voucherId
      );
      if (index !== -1) {
        state.vouchers[index] = payload;
      }
    });
    builder.addCase(updateVoucher.rejected, (state, { payload }) => {
      state.isLoading = false;
      state.error = payload;
    });
  },
});

export default voucherSlice.reducer;
