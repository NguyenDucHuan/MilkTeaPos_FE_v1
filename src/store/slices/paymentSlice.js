import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import fetcher from "../../apis/fetcher";

export const listPaymentApi = createAsyncThunk(
  "payment/listPaymentApi",
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetcher.get("/payment-methods");
      console.log("Dữ liệu phản hồi API:", response.data);
      return response.data;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        "Lỗi khi lấy danh sách phương thức thanh toán. Vui lòng thử lại.";
      console.error("Lỗi API:", errorMessage, error);
      return rejectWithValue(errorMessage);
    }
  }
);

const paymentSlice = createSlice({
  name: "payment",
  initialState: {
    payment: [],
    isLoading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(listPaymentApi.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        console.log("Đang lấy danh sách phương thức thanh toán...");
      })
      .addCase(listPaymentApi.fulfilled, (state, { payload }) => {
        state.isLoading = false;
        state.error = null;
        state.payment = payload;
        console.log("Danh sách phương thức thanh toán đã cập nhật:", payload);
      })
      .addCase(listPaymentApi.rejected, (state, { payload }) => {
        state.isLoading = false;
        state.error = payload;
        console.log("Lấy danh sách phương thức thanh toán thất bại:", payload);
      });
  },
});

export default paymentSlice.reducer;