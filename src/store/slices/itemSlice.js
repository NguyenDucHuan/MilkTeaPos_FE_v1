import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import fetcher from "../../apis/fetcher";

export const listItemApi = createAsyncThunk("item/listItemApi", async () => {
  try {
    const response = await fetcher.get("/milktea");
    console.log("Item response:", response);
    return response;
  } catch (error) {
    throw error.response ? error.response.data.message : error.message;
  }
});

const itemSlice = createSlice({
  name: "item",
  initialState: {
    item: [],
    isLoading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(listItemApi.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(listItemApi.fulfilled, (state, { payload }) => {
      state.isLoading = false;
      state.error = null;
      state.item = payload;
    });
    builder.addCase(listItemApi.rejected, (state, { payload }) => {
      state.isLoading = false;
      state.error = payload;
    });
  },
});

export default itemSlice.reducer;
