import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import fetcher from "../../apis/fetcher";

export const getCash = createAsyncThunk(
  "cash/getCash",
  async ({ startDate, endDate }, { rejectWithValue }) => {
    try {
      const response = await fetcher.get(
        `/cash-balance/get-cash-balance?startDate=${encodeURIComponent(
          startDate
        )}&endDate=${encodeURIComponent(endDate)}`
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching cash balance:", error);
      return rejectWithValue(
        error.response ? error.response.data : { message: error.message }
      );
    }
  }
);

// add cash
export const addCash = createAsyncThunk(
  "cash/addCash",
  async (data, { rejectWithValue }) => {
    try {
      const response = await fetcher.post(
        "/cash-balance/add-cash-balance",
        data
      );
      return response.data;
    } catch (error) {
      console.error("Error adding cash balance:", error);
      return rejectWithValue(
        error.response ? error.response.data : { message: error.message }
      );
    }
  }
);

export const cashSlice = createSlice({
  name: "cash",
  initialState: {
    cash: null,
    loading: false,
    error: null,
  },
  reducers: {
    resetCash: (state) => {
      state.cash = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getCash.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getCash.fulfilled, (state, action) => {
        state.loading = false;
        state.cash = action.payload;
      })
      .addCase(getCash.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.cash = null;
      });
    builder
      .addCase(addCash.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addCash.fulfilled, (state, action) => {
        state.loading = false;
        state.cash = action.payload;
      })
      .addCase(addCash.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.cash = null;
      });
  },
});

export const { resetCash } = cashSlice.actions;
export default cashSlice.reducer;
