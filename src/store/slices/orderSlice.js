import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import fetcher from "../../apis/fetcher";

export const listOrderApi = createAsyncThunk(
  "order/listOrderApi",
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetcher.get("/order-item/get-cart");
      console.log("Dữ liệu phản hồi API:", response.data);
      return response.data;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        "Lỗi khi lấy danh sách đơn hàng. Vui lòng thử lại.";
      console.error("Lỗi API:", errorMessage, error);
      return rejectWithValue(errorMessage);
    }
  }
);

export const createOrderApi = createAsyncThunk(
  "order/createOrderApi",
  async (orderData, { rejectWithValue }) => {
    try {
      const response = await fetcher.post(
        "/order-item/create-order",
        orderData
      );
      console.log("Dữ liệu phản hồi API:", response.data);
      return response.data;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        "Lỗi khi tạo đơn hàng. Vui lòng thử lại.";
      console.error("Lỗi API:", errorMessage, error);
      return rejectWithValue(errorMessage);
    }
  }
);

const orderSlice = createSlice({
  name: "order",
  initialState: {
    order: [],
    isLoading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(listOrderApi.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(listOrderApi.fulfilled, (state, { payload }) => {
        state.isLoading = false;
        state.error = null;
        state.order = payload;
      })
      .addCase(listOrderApi.rejected, (state, { payload }) => {
        state.isLoading = false;
        state.error = payload;
      })
      .addCase(createOrderApi.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createOrderApi.fulfilled, (state, { payload }) => {
        state.isLoading = false;
        state.error = null;
        state.order = payload;
      })
      .addCase(createOrderApi.rejected, (state, { payload }) => {
        state.isLoading = false;
        state.error = payload;
      });
  },
});

export default orderSlice.reducer;
