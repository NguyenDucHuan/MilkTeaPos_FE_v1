import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

export const getAllVouchers = createAsyncThunk(
  "voucher/getAllVouchers",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        "https://67dabbe235c87309f52dc7a7.mockapi.io/vouchers"
      );
      console.log("Fetched vouchers:", response.data);
      return response.data;
    } catch (error) {
      console.error("Get vouchers error:", error.response || error.message);
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const deleteVouchers = createAsyncThunk(
  "voucher/deleteVouchers",
  async (id, { rejectWithValue, dispatch }) => {
    try {
      console.log("Sending DELETE request for ID:", id);
      const response = await axios.delete(
        `https://67dabbe235c87309f52dc7a7.mockapi.io/vouchers/${id}`
      );
      console.log("DELETE response:", response.data);
      dispatch(getAllVouchers());
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
      const response = await axios.post(
        "https://67dabbe235c87309f52dc7a7.mockapi.io/vouchers",
        data
      );
      console.log("Created voucher:", response.data);
      dispatch(getAllVouchers());
      return response.data;
    } catch (error) {
      console.error("Create voucher error:", error.response || error.message);
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const updateVoucher = createAsyncThunk(
  "voucher/updateVoucher",
  async ({ id, data }, { rejectWithValue, dispatch }) => {
    try {
      const response = await axios.put(
        `https://67dabbe235c87309f52dc7a7.mockapi.io/vouchers/${id}`,
        data
      );
      console.log("Updated voucher:", response.data);
      dispatch(getAllVouchers());
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
    voucher: [],
    isLoading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(getAllVouchers.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(getAllVouchers.fulfilled, (state, { payload }) => {
      state.isLoading = false;
      state.voucher = payload;
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
      state.voucher = [...state.voucher, payload];
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
      const index = state.voucher.findIndex((v) => v.id === payload.id);
      if (index !== -1) {
        state.voucher[index] = payload;
      }
    });
    builder.addCase(updateVoucher.rejected, (state, { payload }) => {
      state.isLoading = false;
      state.error = payload;
    });
  },
});

export default voucherSlice.reducer;
