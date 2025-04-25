import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import fetcher from "../../apis/fetcher";

export const listCategory = createAsyncThunk(
  "category/listCategory",
  async ({ page = 1, pageSize = 6 } = {}, { rejectWithValue }) => {
    try {
      console.log(
        "Fetching categories with Page:",
        page,
        "PageSize:",
        pageSize
      );
      const response = await fetcher.get(
        `/categories?Page=${page}&PageSize=${pageSize}`
      );
      console.log("Categories API response:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error fetching categories:", error);
      return rejectWithValue(
        error.response ? error.response.data.message : error.message
      );
    }
  }
);

export const getallCategory = createAsyncThunk(
  "category/getallCategory",
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetcher.get("/categories");
      console.log("Get all categories response:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error fetching all categories:", error);
      return rejectWithValue(
        error.response ? error.response.data.message : error.message
      );
    }
  }
);

export const createCategory = createAsyncThunk(
  "category/createCategory",
  async (formData, { rejectWithValue }) => {
    try {
      const response = await fetcher.post(
        "/categories/create-category",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      console.log("Create category response:", response.data);
      return response.data;
    } catch (error) {
      console.error("Create category error:", error);
      return rejectWithValue({
        message: error.message || "Không thể tạo danh mục",
        status: error.response?.status,
        data: error.response?.data,
      });
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
    totalPages: 0,
    pageSize: 1,
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
        state.currentPage = payload.currentPage;
        state.pageSize = payload.size;
        console.log("Categories updated:", payload.items);
      })
      .addCase(listCategory.rejected, (state, { error }) => {
        state.isLoading = false;
        state.error = error.message;
      })
      .addCase(createCategory.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createCategory.fulfilled, (state, { payload }) => {
        state.isLoading = false;
        state.error = null;
        state.category.push(payload);
        state.totalItems += 1;
      })
      .addCase(createCategory.rejected, (state, { error }) => {
        state.isLoading = false;
        state.error = error.message;
      })
      .addCase(getallCategory.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getallCategory.fulfilled, (state, { payload }) => {
        state.isLoading = false;
        state.error = null;
        state.category = payload;
      })
      .addCase(getallCategory.rejected, (state, { error }) => {
        state.isLoading = false;
        state.error = error.message;
      });
  },
});

export const { setCurrentPage } = categorySlice.actions;
export default categorySlice.reducer;
