import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import fetcher from "../../apis/fetcher";

export const listItemApi = createAsyncThunk(
  "item/listItemApi",
  async ({ CategoryId, Page = 1, PageSize = 6 }, { rejectWithValue }) => {
    try {
      console.log(
        "Calling API with CategoryId:",
        CategoryId,
        "Page:",
        Page,
        "PageSize:",
        PageSize
      );
      const response = await fetcher.get(
        `/products?CategoryId=${CategoryId}&Page=${Page}&PageSize=${PageSize}`
      );
      console.log("Full API Response:", response.data);
      console.log("Response data:", response.data.data);

      if (response.data?.data) {
        const { items, totalCount, totalPages } = response.data.data;
        console.log(
          "Items with prices:",
          items.map((item) => ({
            id: item.productId,
            name: item.productName,
            price: item.price,
            variants: item.variants,
          }))
        );
        return { items, totalItems: totalCount, currentPage: Page, pageSize: PageSize, totalPages };
      } else {
        console.error("Invalid response format:", response.data);
        throw new Error("Invalid response format");
      }
    } catch (error) {
      console.error("API Error:", error);
      return rejectWithValue(
        error.response?.data?.message || "Có lỗi xảy ra. Vui lòng thử lại."
      );
    }
  }
);

export const createProduct = createAsyncThunk(
  "item/createProduct",
  async (formData, { rejectWithValue }) => {
    try {
      const response = await fetcher.post(
        "/products/create-product",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      console.log("Create product response:", response.data);
      return response.data;
    } catch (error) {
      console.error("Create product error:", error);
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
  async ({ id, formData }, { rejectWithValue }) => {
    try {
      const response = await fetcher.put(
        `/api/products/update-product/${id}`,
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
        console.log("listItemApi pending");
      })
      .addCase(listItemApi.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;
        state.items = action.payload.items || [];
        state.totalItems = action.payload.totalItems || 0;
        state.currentPage = action.payload.currentPage || 1;
        state.pageSize = action.payload.pageSize || 6;
        state.totalPages = action.payload.totalPages || 1; // Use the API's totalPages
        console.log(
          "listItemApi fulfilled, updated state:",
          {
            items: state.items,
            totalItems: state.totalItems,
            currentPage: state.currentPage,
            pageSize: state.pageSize,
            totalPages: state.totalPages,
          }
        );
      })
      .addCase(listItemApi.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.items = [];
        state.totalItems = 0;
        state.totalPages = 0;
        console.log("listItemApi rejected, error:", action.payload);
      })
      .addCase(createProduct.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createProduct.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;
        state.items.push(action.payload);
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
      });
  },
});

export const { setPage } = itemSlice.actions;
export default itemSlice.reducer;