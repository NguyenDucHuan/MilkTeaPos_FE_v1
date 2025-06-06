import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import fetcher from "../../apis/fetcher";

export const createCombo = createAsyncThunk(
  "combo/createCombo",
  async (formData, { rejectWithValue }) => {
    try {
      const response = await fetcher.post("/products/create-combo-product", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Có lỗi xảy ra. Vui lòng thử lại."
      );
    }
  }
);

export const updateCombo = createAsyncThunk(
  "combo/updateCombo",
  async (formData, { rejectWithValue }) => {
    try {
      const response = await fetcher.put("/products/update-combo/id", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Có lỗi xảy ra khi cập nhật combo."
      );
    }
  }
);

const comboSlice = createSlice({
  name: "combo",
  initialState: {
    combo: [],
    isLoading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(createCombo.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createCombo.fulfilled, (state, action) => {
        state.isLoading = false;
        const newCombo = action.payload.data || action.payload;
        console.log("Create combo response:", newCombo);
        state.combo.push(newCombo);
      })
      .addCase(createCombo.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(updateCombo.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateCombo.fulfilled, (state, action) => {
        state.isLoading = false;
        const updatedCombo = action.payload.data || action.payload;
        console.log("Update combo response:", updatedCombo);
        const index = state.combo.findIndex(item => item.productId === updatedCombo.productId);
        if (index !== -1) {
          state.combo[index] = updatedCombo;
        }
      })
      .addCase(updateCombo.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  }
});

export default comboSlice.reducer;