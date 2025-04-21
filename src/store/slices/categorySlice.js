import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import fetcher from "../../apis/fetcher";

export const listCategory = createAsyncThunk(
  "category/listCategory",
  async ({ page = 1, pageSize = 12 } = {}) => {
    try {
      const response = await fetcher.get(`/categories?Page=${page}&PageSize=${pageSize}`);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data.message : error.message;
    }
  }
);

const categorySlice = createSlice({
  name: "category",
  initialState: {
    category: [],
    isLoading: false,
    error: null,
    currentPage: 1,
    totalItems: 0,
    totalPages: 1,
    pageSize: 12,
  },
  reducers: {
    setCurrentPage: (state, action) => {
      state.currentPage = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(listCategory.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(listCategory.fulfilled, (state, { payload }) => {
        state.isLoading = false;
        state.error = null;
        state.category = payload.items; 
        state.totalItems = payload.total; 
        state.totalPages = payload.totalPages; 
        state.pageSize = payload.size; 
      })
      .addCase(listCategory.rejected, (state, { error }) => {
        state.isLoading = false;
        state.error = error.message;
      });
  },
});

export const { setCurrentPage } = categorySlice.actions;
export default categorySlice.reducer;