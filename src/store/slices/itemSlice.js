import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import fetcher from "../../apis/fetcher";

export const listItemApi = createAsyncThunk(
  "item/listItemApi",
  async ({ CategoryId, Search, Page = 1, PageSize = 6 }, { rejectWithValue }) => {
    try {
      const queryParams = new URLSearchParams({
        Page,
        PageSize,
        ...(Search && { Search }),
        ...(CategoryId && { CategoryId }),
      }).toString();

      const response = await fetcher.get(`/products?${queryParams}`);
      if (response.data?.data) {
        const { items, totalCount, totalPages } = response.data.data;
        return {
          items,
          totalItems: totalCount,
          currentPage: Page,
          pageSize: PageSize,
          totalPages,
        };
      } else {
        throw new Error("Định dạng phản hồi không hợp lệ");
      }
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Đã xảy ra lỗi. Vui lòng thử lại."
      );
    }
  }
);

export const createProduct = createAsyncThunk(
  "item/createProduct",
  async (formData, { rejectWithValue }) => {
    try {
      const response = await fetcher.post("/products/create-product", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue({
        message: error.message || "Không thể tạo sản phẩm",
        status: error.response?.status,
        data: error.response?.data,
      });
    }
  }
);

export const updateProduct = createAsyncThunk(
  "item/updateProduct",
  async (formData, { rejectWithValue }) => {
    try {
      const response = await fetcher.put(
        "/products/update-product/id", // Giữ endpoint cố định, không thêm productId vào URL
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      console.log("Update product response:", response.data);
      return response.data;
    } catch (error) {
      console.error("Update product error:", error);
      return rejectWithValue({
        message: error.message || "Không thể cập nhật sản phẩm",
        status: error.response?.status,
        data: error.response?.data,
      });
    }
  }
);

export const createExtraProduct = createAsyncThunk(
  "item/createExtraProduct",
  async (formData, { rejectWithValue }) => {
    try {
      const response = await fetcher.post(
        "/products/create-extra-product",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue({
        message: error.message || "Không thể tạo topping",
        status: error.response?.status,
        data: error.response?.data,
      });
    }
  }
);

const itemSlice = createSlice({
  name: "item",
  initialState: {
    items: [],
    isLoading: false,
    error: null,
    currentPage: 1,
    totalPages: 0,
    pageSize: 6,
    totalItems: 0,
  },
  reducers: {
    setPage: (state, action) => {
      state.currentPage = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(listItemApi.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(listItemApi.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;
        state.items = action.payload.items || [];
        state.totalItems = action.payload.totalItems || 0;
        state.currentPage = action.payload.currentPage || 1;
        state.pageSize = action.payload.pageSize || 6;
        state.totalPages = action.payload.totalPages || 1;
      })
      .addCase(listItemApi.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.items = [];
        state.totalItems = 0;
        state.totalPages = 0;
      })
      .addCase(createProduct.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createProduct.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;
        state.items.push(action.payload.data);
        state.totalItems += 1;
        state.totalPages = Math.ceil(state.totalItems / state.pageSize);
      })
      .addCase(createProduct.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(updateProduct.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateProduct.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;
        const index = state.items.findIndex(
          (item) => item.productId === action.payload.data.productId
        );
        if (index !== -1) {
          state.items[index] = action.payload.data;
        }
      })
      .addCase(updateProduct.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(createExtraProduct.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createExtraProduct.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;
        state.items.push(action.payload.data);
        state.totalItems += 1;
      })
      .addCase(createExtraProduct.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { setPage } = itemSlice.actions;
export default itemSlice.reducer;