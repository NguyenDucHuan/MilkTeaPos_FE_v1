import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import fetcher from "../../apis/fetcher";

// call api category
export const listCategory = createAsyncThunk(
  "category/listCategory",
  async () => {
    try {
      const response = await fetcher.get("/category");
      return response;
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
  },
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(listCategory.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(listCategory.fulfilled, (state, { payload }) => {
      state.isLoading = false;
      state.error = null;
      state.category = payload;
    });
    builder.addCase(listCategory.rejected, (state, { payload }) => {
      state.isLoading = false;
      state.error = payload;
    });
  },
});

export default categorySlice.reducer;
