import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import fetcher from "../../apis/fetcher";

export const listItemApi = createAsyncThunk(
  "item/listItemApi",
  async ({ CategoryId }, { rejectWithValue }) => {
    try {
      console.log("Calling API with CategoryId:", CategoryId);
      const response = await fetcher.get(`/products?CategoryId=${CategoryId}`);
      console.log("Full API Response:", response);
      console.log("Response data:", response.data);

      if (response.data?.data?.items) {
        const items = response.data.data.items;
        console.log(
          "Items with prices:",
          items.map((item) => ({
            id: item.productId,
            name: item.productName,
            price: item.price,
            prize: item.prize,
          }))
        );
        return items;
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

export const getAllProducts = createAsyncThunk(
  "item/getAllProducts",
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetcher.get("/products");
      console.log("Get all products response:", response.data);
      return response.data.data.items || []; 
    } catch (error) {
      console.error("getAllProducts error:", error);
      return rejectWithValue(
        error.response ? error.response.data.message : error.message
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

const itemSlice = createSlice({
  name: "item",
  initialState: {
    item: [],
    isLoading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(listItemApi.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(listItemApi.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;
        state.item = action.payload;
      })
      .addCase(listItemApi.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(getAllProducts.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getAllProducts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;
        state.item = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(getAllProducts.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(createProduct.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createProduct.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;
        state.item.push(action.payload); 
      })
      .addCase(createProduct.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export default itemSlice.reducer;
