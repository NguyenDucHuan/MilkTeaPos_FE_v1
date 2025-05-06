import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import fetcher from "../../apis/fetcher";

const API_BASE_URL = "https://localhost:7186/api";

export const getStatisticByDateApi = createAsyncThunk(
  "statistic/getStatisticByDateApi",
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetcher.get(`${API_BASE_URL}/statistic/by-date`);
      return response.data;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Error fetching daily statistics.";
      console.error("API Error:", errorMessage, error);
      return rejectWithValue(errorMessage);
    }
  }
);

export const getStatisticByMonthApi = createAsyncThunk(
  "statistic/getStatisticByMonthApi",
  async ({ month, year }, { rejectWithValue }) => {
    try {
      const response = await fetcher.get(`${API_BASE_URL}/statistic/by-month`, {
        params: { month, year },
      });
      return response.data;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Error fetching monthly statistics.";
      console.error("API Error:", errorMessage, error);
      return rejectWithValue(errorMessage);
    }
  }
);

export const getStatisticByYearApi = createAsyncThunk(
  "statistic/getStatisticByYearApi",
  async ({ year }, { rejectWithValue }) => {
    try {
      const response = await fetcher.get(`${API_BASE_URL}/statistic/by-year`, {
        params: { year },
      });
      return response.data;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Error fetching yearly statistics.";
      console.error("API Error:", errorMessage, error);
      return rejectWithValue(errorMessage);
    }
  }
);

export const getStatisticByWeekApi = createAsyncThunk(
  "statistic/getStatisticByWeekApi",
  async ({ fromDate, toDate }, { rejectWithValue }) => {
    try {
      const response = await fetcher.get(`${API_BASE_URL}/statistic/by-week`, {
        params: { fromDate, toDate },
      });
      return response.data;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Error fetching weekly statistics.";
      console.error("API Error:", errorMessage, error);
      return rejectWithValue(errorMessage);
    }
  }
);

export const getBestSellerApi = createAsyncThunk(
  "statistic/getBestSellerApi",
  async (
    { month, year, fromDate, toDate, number = 5 } = {},
    { rejectWithValue }
  ) => {
    try {
      const params = { number };
      if (fromDate && toDate) {
        params.fromDate = fromDate;
        params.toDate = toDate;
      } else if (month && year) {
        params.month = month;
        params.year = year;
      } else if (year) {
        params.year = year;
      }
      const response = await fetcher.get(
        `${API_BASE_URL}/statistic/best-seller`,
        { params }
      );
      return response.data;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        "Error fetching best-selling products.";
      console.error("API Error:", errorMessage, error);
      return rejectWithValue(errorMessage);
    }
  }
);

const statisticSlice = createSlice({
  name: "statistic",
  initialState: {
    statistic: {
      orderChart: [],
      revenueChart: [],
      totalOrder: 0,
      totalRevenue: 0,
      bestSellers: [],
    },
    isLoading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getStatisticByDateApi.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getStatisticByDateApi.fulfilled, (state, { payload }) => {
        state.isLoading = false;
        state.error = null;
        state.statistic = { ...state.statistic, ...payload };
      })
      .addCase(getStatisticByDateApi.rejected, (state, { payload }) => {
        state.isLoading = false;
        state.error = payload;
      })
      .addCase(getStatisticByMonthApi.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getStatisticByMonthApi.fulfilled, (state, { payload }) => {
        state.isLoading = false;
        state.error = null;
        state.statistic = { ...state.statistic, ...payload };
      })
      .addCase(getStatisticByMonthApi.rejected, (state, { payload }) => {
        state.isLoading = false;
        state.error = payload;
      })
      .addCase(getStatisticByYearApi.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getStatisticByYearApi.fulfilled, (state, { payload }) => {
        state.isLoading = false;
        state.error = null;
        state.statistic = { ...state.statistic, ...payload };
      })
      .addCase(getStatisticByYearApi.rejected, (state, { payload }) => {
        state.isLoading = false;
        state.error = payload;
      })
      .addCase(getStatisticByWeekApi.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getStatisticByWeekApi.fulfilled, (state, { payload }) => {
        state.isLoading = false;
        state.error = null;
        state.statistic = { ...state.statistic, ...payload };
      })
      .addCase(getStatisticByWeekApi.rejected, (state, { payload }) => {
        state.isLoading = false;
        state.error = payload;
      })
      .addCase(getBestSellerApi.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getBestSellerApi.fulfilled, (state, { payload }) => {
        state.isLoading = false;
        state.error = null;
        state.statistic.bestSellers = payload || [];
      })
      .addCase(getBestSellerApi.rejected, (state, { payload }) => {
        state.isLoading = false;
        state.error = payload;
      });
  },
});

export default statisticSlice.reducer;
