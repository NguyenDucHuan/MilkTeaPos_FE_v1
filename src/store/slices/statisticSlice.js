import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import fetcher from "../../apis/fetcher";

export const getStatisticByDateApi = createAsyncThunk(
  "statistic/getStatisticByDateApi",
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetcher.get(`/statistic/by-date`);
      console.log("Dữ liệu phản hồi API:", response.data);
      return response.data;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        "Lỗi khi lấy thống kê theo ngày. Vui lòng thử lại.";
      console.error("Lỗi API:", errorMessage, error);
      return rejectWithValue(errorMessage);
    }
  }
);

export const getStatisticByMonthApi = createAsyncThunk(
  "statistic/getStatisticByMonthApi",
  async ({ month, year }, { rejectWithValue }) => {
    try {
      const response = await fetcher.get(
        `/statistic/by-month?month=${month}&year=${year}`
      );
      console.log("Dữ liệu phản hồi API:", response.data);
      return response.data;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        "Lỗi khi lấy thống kê theo tháng. Vui lòng thử lại.";
      console.error("Lỗi API:", errorMessage, error);
      return rejectWithValue(errorMessage);
    }
  }
);

export const getStatisticByYearApi = createAsyncThunk(
  "statistic/getStatisticByYearApi",
  async ({ year }, { rejectWithValue }) => {
    try {
      const response = await fetcher.get(`/statistic/by-year?year=${year}`);
      console.log("Dữ liệu phản hồi API:", response.data);
      return response.data;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        "Lỗi khi lấy thống kê theo năm. Vui lòng thử lại.";
      console.error("Lỗi API:", errorMessage, error);
      return rejectWithValue(errorMessage);
    }
  }
);

export const getBestSellerApi = createAsyncThunk(
  "statistic/getBestSellerApi",
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetcher.get(`/statistic/best-seller`);
      console.log("Dữ liệu phản hồi API:", response.data);
      return response.data;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        "Lỗi khi lấy thống kê theo năm. Vui lòng thử lại.";
      console.error("Lỗi API:", errorMessage, error);
      return rejectWithValue(errorMessage);
    }
  }
);

const statisticSlice = createSlice({
  name: "statistic",
  initialState: {
    statistic: [],
    isLoading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(getStatisticByDateApi.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(getStatisticByDateApi.fulfilled, (state, { payload }) => {
      state.isLoading = false;
      state.error = null;
      state.statistic = payload;
    });
    builder.addCase(getStatisticByDateApi.rejected, (state, { payload }) => {
      state.isLoading = false;
      state.error = payload;
    });
    builder.addCase(getStatisticByMonthApi.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(getStatisticByMonthApi.fulfilled, (state, { payload }) => {
      state.isLoading = false;
      state.error = null;
      state.statistic = payload;
    });
    builder.addCase(getStatisticByMonthApi.rejected, (state, { payload }) => {
      state.isLoading = false;
      state.error = payload;
    });
    builder.addCase(getStatisticByYearApi.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(getStatisticByYearApi.fulfilled, (state, { payload }) => {
      state.isLoading = false;
      state.error = null;
      state.statistic = payload;
    });
    builder.addCase(getStatisticByYearApi.rejected, (state, { payload }) => {
      state.isLoading = false;
      state.error = payload;
    });
    builder.addCase(getBestSellerApi.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(getBestSellerApi.fulfilled, (state, { payload }) => {
      state.isLoading = false;
      state.error = null;
      state.statistic = payload;
    });
    builder.addCase(getBestSellerApi.rejected, (state, { payload }) => {
      state.isLoading = false;
      state.error = payload;
    });
  },
});

export default statisticSlice.reducer;
