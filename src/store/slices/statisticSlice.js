import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
// Giả sử fetcher là axios instance đã được cấu hình
import fetcher from "../../apis/fetcher"; // Đảm bảo đường dẫn đúng

// --- Thunks cho thống kê chính ---
export const getStatisticByDateApi = createAsyncThunk(
  "statistic/getStatisticByDateApi",
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetcher.get(`/statistic/by-date`);
      console.log("API Response (Daily):", response.data);
      return response.data; // Trả về { orderChart, revenueChart, totalOrder, totalRevenue }
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Failed to fetch daily statistics.";
      console.error("API Error (Daily):", errorMessage, error);
      return rejectWithValue(errorMessage);
    }
  }
);

export const getStatisticByMonthApi = createAsyncThunk(
  "statistic/getStatisticByMonthApi",
  async ({ month, year }, { rejectWithValue }) => {
    try {
      const response = await fetcher.get(`/statistic/by-month?month=${month}&year=${year}`);
      console.log("API Response (Monthly):", response.data);
      return response.data; // Trả về { orderChart, revenueChart, totalOrder, totalRevenue }
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Failed to fetch monthly statistics.";
      console.error("API Error (Monthly):", errorMessage, error);
      return rejectWithValue(errorMessage);
    }
  }
);

export const getStatisticByYearApi = createAsyncThunk(
  "statistic/getStatisticByYearApi",
  async ({ year }, { rejectWithValue }) => {
    try {
      const response = await fetcher.get(`/statistic/by-year?year=${year}`);
      console.log("API Response (Yearly):", response.data);
      return response.data; // Trả về { orderChart, revenueChart, totalOrder, totalRevenue }
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Failed to fetch yearly statistics.";
      console.error("API Error (Yearly):", errorMessage, error);
      return rejectWithValue(errorMessage);
    }
  }
);

// --- Thunk cho Custom Range (sử dụng /statistic/by-week) ---
export const getStatisticByRangeApi = createAsyncThunk(
  "statistic/getStatisticByRangeApi",
  async ({ fromDate, toDate }, { rejectWithValue }) => {
    try {
      const response = await fetcher.get(`/statistic/by-week?fromDate=${fromDate}&toDate=${toDate}`);
      console.log("API Response (Range):", response.data);
      return response.data; // Trả về { orderChart, revenueChart, totalOrder, totalRevenue }
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Failed to fetch statistics for date range.";
      console.error("API Error (Range):", errorMessage, error);
      return rejectWithValue(errorMessage);
    }
  }
);
// -----------------------------------------

// --- Xóa Thunk getBestSellerApi ---

// --- Cấu trúc State được cải thiện ---
const initialState = {
  // Dữ liệu chính cho các thẻ và biểu đồ Revenue/Order
  statisticOverview: {
    totalRevenue: 0,
    totalOrder: 0,
    // popularCategory: null, // Không cần nữa
    revenueChart: [],
    orderChart: [],
  },
  // --- Xóa topSellingProducts và salesByCategory ---
  isLoading: false,
  error: null,
};

const statisticSlice = createSlice({
  name: "statistic",
  initialState,
  reducers: {
    resetError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    // --- Hàm helper ---
    const handlePending = (state) => {
      state.isLoading = true;
      state.error = null;
    };
    const handleRejected = (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    };
    const handleOverviewFulfilled = (state, action) => {
      state.isLoading = false;
      // Chỉ cập nhật statisticOverview
      state.statisticOverview = {
        totalRevenue: action.payload?.totalRevenue || 0,
        totalOrder: action.payload?.totalOrder || 0,
        revenueChart: action.payload?.revenueChart || [],
        orderChart: action.payload?.orderChart || [],
      };
    };

    // Xử lý getStatisticByDateApi
    builder.addCase(getStatisticByDateApi.pending, handlePending);
    builder.addCase(getStatisticByDateApi.fulfilled, handleOverviewFulfilled);
    builder.addCase(getStatisticByDateApi.rejected, handleRejected);

    // Xử lý getStatisticByMonthApi
    builder.addCase(getStatisticByMonthApi.pending, handlePending);
    builder.addCase(getStatisticByMonthApi.fulfilled, handleOverviewFulfilled);
    builder.addCase(getStatisticByMonthApi.rejected, handleRejected);

    // Xử lý getStatisticByYearApi
    builder.addCase(getStatisticByYearApi.pending, handlePending);
    builder.addCase(getStatisticByYearApi.fulfilled, handleOverviewFulfilled);
    builder.addCase(getStatisticByYearApi.rejected, handleRejected);

    // Xử lý getStatisticByRangeApi (MỚI)
    builder.addCase(getStatisticByRangeApi.pending, handlePending);
    builder.addCase(getStatisticByRangeApi.fulfilled, handleOverviewFulfilled);
    builder.addCase(getStatisticByRangeApi.rejected, handleRejected);

    // --- Xóa extraReducers cho getBestSellerApi ---
  },
});

export const { resetError } = statisticSlice.actions;
export default statisticSlice.reducer;