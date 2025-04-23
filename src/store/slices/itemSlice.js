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
        console.log("Items with prices:", items.map(item => ({
          id: item.productId,
          name: item.productName,
          price: item.price,
          prize: item.prize
        })));
        return items;
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
    });
  },
});

export default itemSlice.reducer;
