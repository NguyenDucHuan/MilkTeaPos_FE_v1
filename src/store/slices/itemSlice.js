import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import fetcher from "../../apis/fetcher";

export const createProduct = createAsyncThunk(
  "item/createProduct",
  async (productData, { rejectWithValue }) => {
    try {
      const response = await fetcher.post("/products", productData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Có lỗi xảy ra khi tạo sản phẩm.");
    }
  }
);
export const listItemApi = createAsyncThunk(
  "item/listItemApi",
  async ({ CategoryId, page = 1, pageSize = 10 }, { rejectWithValue }) => {
    try {
      console.log("Calling API with CategoryId:", CategoryId);
      const response = await fetcher.get(`/products?CategoryId=${CategoryId}&page=${page}&pageSize=${pageSize}`);
      console.log("Full API Response:", response);
      console.log("Response data:", response.data);
      
      if (response.data?.data?.items) {
        const items = response.data.data.items;
        const totalPages = Math.ceil(response.data.data.total / pageSize);
        console.log("Items with prices:", items.map(item => ({
          id: item.productId,
          name: item.productName,
          price: item.price,
          prize: item.prize
        })));
        return { items, totalPages, currentPage: page };
      } else {
        console.error("Invalid response format:", response.data);
        throw new Error("Invalid response format");
      }
    } catch (error) {
      console.error("API Error:", error);
      return rejectWithValue(error.response?.data?.message || "Có lỗi xảy ra. Vui lòng thử lại.");
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
    totalPages: 1,
    pageSize: 10
  },
  reducers: {
    setPage: (state, action) => {
      state.currentPage = action.payload;
    },
    setPageSize: (state, action) => {
      state.pageSize = action.payload;
    }
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
        state.items = action.payload.items;
        state.totalPages = action.payload.totalPages;
        state.currentPage = action.payload.currentPage;
      })
      .addCase(listItemApi.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { setPage, setPageSize } = itemSlice.actions;
export default itemSlice.reducer;
