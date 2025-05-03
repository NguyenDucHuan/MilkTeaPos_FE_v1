import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import fetcher from "../../apis/fetcher";

export const listItemApi = createAsyncThunk(
  "item/listItemApi",
  async (
    { CategoryId, Search, Page = 1, PageSize = 10, ProductType },
    { rejectWithValue }
  ) => {
    try {
      const queryParams = new URLSearchParams({
        Page,
        PageSize,
        ...(ProductType && { ProductType }),
        ...(Search && { Search }),
        ...(CategoryId && { CategoryId }),
      }).toString();

      console.log("Calling API with URL:", `/products?${queryParams}`);
      const response = await fetcher.get(`/products?${queryParams}`);
      if (!response.data?.data) {
        throw new Error("Dữ liệu API không hợp lệ hoặc thiếu trường data");
      }

      const { items, totalCount, totalPages } = response.data.data;
      if (!Array.isArray(items)) {
        console.warn("API trả về items không phải mảng:", items);
        return {
          items: [],
          totalItems: 0,
          currentPage: Page,
          pageSize: PageSize,
          totalPages: 1,
          productType: ProductType,
        };
      }

      console.log("API response:", { items, totalCount, totalPages });
      return {
        items,
        totalItems: totalCount ?? 0,
        currentPage: Page,
        pageSize: PageSize,
        totalPages: totalPages ?? 1,
        productType: ProductType,
      };
    } catch (error) {
      console.error("Lỗi khi gọi API listItemApi:", error);
      return rejectWithValue(
        error.response?.data?.message || "Đã xảy ra lỗi khi lấy danh sách sản phẩm."
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
  async ({ productId, formData }, { rejectWithValue }) => {
    try {
      formData.append("ProductId", productId.toString());
      const response = await fetcher.put(
        "/products/update-product/id",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      console.log("updateProduct API response:", response.data);
      return response.data;
    } catch (error) {
      console.error("updateProduct error:", error);
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

export const updateImageProduct = createAsyncThunk(
  "item/updateImageProduct",
  async ({ productId, formData }, { rejectWithValue }) => {
    try {
      formData.append("ProductId", productId.toString());
      const response = await fetcher.put(
        `/products/update-image?productID=${productId}`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      console.log("updateImageProduct API response:", response.data);
      return response.data;
    } catch (error) {
      console.error("updateImageProduct error:", error);
      return rejectWithValue({
        message: error.message || "Không thể cập nhật hình ảnh sản phẩm",
        status: error.response?.status,
        data: error.response?.data,
      });
    }
  }
);

const itemSlice = createSlice({
  name: "item",
  initialState: {
    materProducts: {
      items: [],
      pagination: {
        currentPage: 1,
        pageSize: 10,
        totalPages: 1,
        totalItems: 0,
      },
    },
    combos: {
      items: [],
      pagination: {
        currentPage: 1,
        pageSize: 10,
        totalPages: 1,
        totalItems: 0,
      },
    },
    extras: {
      items: [],
      pagination: {
        currentPage: 1,
        pageSize: 10,
        totalPages: 1,
        totalItems: 0,
      },
    },
    isLoading: false,
    error: null,
  },
  reducers: {
    resetPage(state, action) {
      const productType = action.payload;
      if (productType === "MaterProduct") {
        state.materProducts.pagination.currentPage = 1;
      } else if (productType === "Combo") {
        state.combos.pagination.currentPage = 1;
      } else if (productType === "Extra") {
        state.extras.pagination.currentPage = 1;
      }
    },
    resetState(state, action) {
      const productType = action.payload;
      if (productType === "MaterProduct") {
        state.materProducts = {
          items: [],
          pagination: {
            currentPage: 1,
            pageSize: 10,
            totalPages: 1,
            totalItems: 0,
          },
        };
      } else if (productType === "Combo") {
        state.combos = {
          items: [],
          pagination: {
            currentPage: 1,
            pageSize: 10,
            totalPages: 1,
            totalItems: 0,
          },
        };
      } else if (productType === "Extra") {
        state.extras = {
          items: [],
          pagination: {
            currentPage: 1,
            pageSize: 10,
            totalPages: 1,
            totalItems: 0,
          },
        };
      }
      state.isLoading = false;
      state.error = null;
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
        const { productType, items, currentPage, pageSize, totalPages, totalItems } = action.payload;
        if (productType === "MaterProduct") {
          state.materProducts.items = items || [];
          state.materProducts.pagination = {
            currentPage: currentPage || 1,
            pageSize,
            totalPages: totalPages || 1,
            totalItems: totalItems || 0,
          };
        } else if (productType === "Combo") {
          state.combos.items = items || [];
          state.combos.pagination = {
            currentPage: currentPage || 1,
            pageSize,
            totalPages: totalPages || 1,
            totalItems: totalItems || 0,
          };
        } else if (productType === "Extra") {
          state.extras.items = items || [];
          state.extras.pagination = {
            currentPage: currentPage || 1,
            pageSize,
            totalPages: totalPages || 1,
            totalItems: totalItems || 0,
          };
        }
        console.log("listItemApi fulfilled, updated state:", state);
      })
      .addCase(listItemApi.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        const productType = action.meta.arg.ProductType;
        if (productType === "MaterProduct") {
          state.materProducts.items = [];
          state.materProducts.pagination = {
            currentPage: 1,
            pageSize: state.materProducts.pagination.pageSize,
            totalPages: 1,
            totalItems: 0,
          };
        } else if (productType === "Combo") {
          state.combos.items = [];
          state.combos.pagination = {
            currentPage: 1,
            pageSize: state.combos.pagination.pageSize,
            totalPages: 1,
            totalItems: 0,
          };
        } else if (productType === "Extra") {
          state.extras.items = [];
          state.extras.pagination = {
            currentPage: 1,
            pageSize: state.extras.pagination.pageSize,
            totalPages: 1,
            totalItems: 0,
          };
        }
        console.error("listItemApi rejected, error:", action.payload);
      })
      .addCase(createProduct.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createProduct.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;
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
      })
      .addCase(createExtraProduct.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(updateImageProduct.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateImageProduct.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;
      })
      .addCase(updateImageProduct.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { resetPage, resetState } = itemSlice.actions;
export default itemSlice.reducer;