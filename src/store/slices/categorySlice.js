import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import fetcher from "../../apis/fetcher";

export const getallCategory = createAsyncThunk(
  "category/getallCategory",
  async ({ sortAscending = false, page = 1, pageSize = 10 } = {}, { rejectWithValue }) => {
    try {
      const response = await fetcher.get("/categories", {
        params: {
          SortAscending: sortAscending,
          Page: page,
          PageSize: pageSize,
        },
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching all categories:", error);
      return rejectWithValue(
        error.response ? error.response.data.message : error.message
      );
    }
  }
);

export const getAllCategoriesForHomepage = createAsyncThunk(
  "category/getAllCategoriesForHomepage",
  async (_, { rejectWithValue }) => {
    try {
      let allCategories = [];
      let page = 1;
      const pageSize = 10;
      let hasMore = true;

      while (hasMore) {
        const response = await fetcher.get("/categories", {
          params: {
            SortAscending: false,
            Page: page,
            PageSize: pageSize,
          },
        });

        const { items, totalPages } = response.data;
        allCategories = [...allCategories, ...items];

        if (page >= totalPages) {
          hasMore = false;
        } else {
          page += 1;
        }
      }

      console.log("All categories fetched:", allCategories);
      return allCategories;
    } catch (error) {
      console.error("Error fetching all categories for homepage:", error);
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

export const updateCategory = createAsyncThunk(
  "category/updateCategory",
  async ({ categoryId, formData }, { rejectWithValue }) => {
    try {
      if (!categoryId) {
        throw new Error("Category ID is required for update");
      }
      const response = await fetcher.put(
        `/categories/update-category/id?id=${categoryId}`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      console.log("Update category response:", response.data);
      return response.data;
    } catch (error) {
      console.error("Update category error:", {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
      });
      return rejectWithValue({
        message: error.message || "Không thể cập nhật danh mục",
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
    pagination: {
      currentPage: 1,
      pageSize: 10,
      totalPages: 1,
      totalItems: 0,
    },
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
        state.category = Array.isArray(payload.items) ? payload.items : payload.data || [];
        state.pagination = {
          currentPage: payload.page || 1,
          pageSize: payload.pageSize || 10,
          totalPages: payload.totalPages || 1,
          totalItems: payload.totalItems || state.category.length,
        };
      })
      .addCase(getallCategory.rejected, (state, { error }) => {
        state.isLoading = false;
        state.error = error.message;
      })
      .addCase(getAllCategoriesForHomepage.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getAllCategoriesForHomepage.fulfilled, (state, { payload }) => {
        state.isLoading = false;
        state.error = null;
        state.category = Array.isArray(payload) ? payload : [];
        state.pagination = {
          currentPage: 1,
          pageSize: state.category.length,
          totalPages: 1,
          totalItems: state.category.length,
        };
      })
      .addCase(getAllCategoriesForHomepage.rejected, (state, { error }) => {
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
        state.pagination.totalItems += 1;
      })
      .addCase(createCategory.rejected, (state, { error }) => {
        state.isLoading = false;
        state.error = error.message;
      })
      .addCase(updateCategory.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateCategory.fulfilled, (state, { payload }) => {
        state.isLoading = false;
        state.error = null;
        const index = state.category.findIndex((cat) => cat.categoryId === payload.categoryId);
        if (index !== -1) {
          state.category[index] = payload;
        } else {
          console.warn("Category not found in state for update:", payload);
        }
      })
      .addCase(updateCategory.rejected, (state, { error }) => {
        state.isLoading = false;
        state.error = error.message;
      });
  },
});

export default categorySlice.reducer;