import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import fetcher from "../../apis/fetcher";

export const getAllVouchers = createAsyncThunk(
  "voucher/getAllVouchers",
  async ({ Page, PageSize }, { rejectWithValue }) => {
    try {
      console.log("Fetching vouchers with Page:", Page, "PageSize:", PageSize);
      const response = await fetcher.get(
        `/vouchers?Page=${Page}&PageSize=${PageSize}&Status=true`
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

export const getVouchers = createAsyncThunk(
  "voucher/getVouchers",
  async (_, { rejectWithValue }) => {
    try {
      console.log("Fetching all vouchers with Page=1&PageSize=100");
      const response = await fetcher.get(
        "/vouchers?Page=1&PageSize=100&Status=true"
      );
      console.log("Fetched vouchers:", response.data);
      // Xử lý dữ liệu trả về để đảm bảo là mảng
      const vouchers = Array.isArray(response.data)
        ? response.data
        : response.data?.items || response.data?.data || [];
      return vouchers;
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
          Page: pagination.page || 1,
          PageSize: pagination.size || 10,
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
          Page: pagination.page || 1,
          PageSize: pagination.size || 10,
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
    selectedVoucher: null,
    isLoading: false,
    error: null,
    pagination: {
      page: 1,
      size: 10,
      total: 0,
      totalPages: 0,
    },
  },
  reducers: {
    setSelectedVoucher: (state, action) => {
      state.selectedVoucher = action.payload;
    },
    clearSelectedVoucher: (state) => {
      state.selectedVoucher = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getAllVouchers.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getAllVouchers.fulfilled, (state, { payload }) => {
        console.log("Cập nhật pagination:", {
          currentPage: payload.currentPage,
          pageSize: payload.pageSize,
        });
        state.isLoading = false;
        state.vouchers = payload.items;
        state.pagination = {
          page: payload.currentPage || 1,
          size: payload.pageSize || 10,
          total: payload.total || 0,
          totalPages: payload.totalPages || 0,
        };
      })
      .addCase(getAllVouchers.rejected, (state, { payload }) => {
        state.isLoading = false;
        state.error = payload;
      })
      .addCase(getVouchers.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getVouchers.fulfilled, (state, { payload }) => {
        state.isLoading = false;
        state.vouchers = payload;
      })
      .addCase(getVouchers.rejected, (state, { payload }) => {
        state.isLoading = false;
        state.error = payload;
      })
      .addCase(deleteVouchers.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteVouchers.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(deleteVouchers.rejected, (state, { payload }) => {
        state.isLoading = false;
        state.error = payload;
      })
      .addCase(createVoucher.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createVoucher.fulfilled, (state) => {
        state.isLoading = false;
        state.error = null;
      })
      .addCase(createVoucher.rejected, (state, { payload }) => {
        state.isLoading = false;
        state.error = payload;
      })
      .addCase(updateVoucher.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateVoucher.fulfilled, (state, { payload }) => {
        state.isLoading = false;
        state.error = null;
        const index = state.vouchers.findIndex(
          (v) => v.voucherId === payload.voucherId
        );
        if (index !== -1) {
          state.vouchers[index] = payload;
        }
      })
      .addCase(updateVoucher.rejected, (state, { payload }) => {
        state.isLoading = false;
        state.error = payload;
      });
  },
});

export const { setSelectedVoucher, clearSelectedVoucher } =
  voucherSlice.actions;
export default voucherSlice.reducer;
