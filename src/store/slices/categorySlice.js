import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import fetcher from "../../apis/fetcher";

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
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getallCategory.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getallCategory.fulfilled, (state, { payload }) => {
        state.isLoading = false;
        state.error = null;
        state.category = Array.isArray(payload) ? payload : payload.items || [];
      })
      .addCase(getallCategory.rejected, (state, { error }) => {
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
      })
      .addCase(createCategory.rejected, (state, { error }) => {
        state.isLoading = false;
        state.error = error.message;
      });
  },
});

export default categorySlice.reducer;