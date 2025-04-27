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
    async ({ id, formData }, { rejectWithValue }) => {
        try {
            const response = await fetcher.put(`/products/update-combo-product/${id}`, formData, {
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
        combo:[],
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
                state.combo.push(action.payload);
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
                const index = state.combo.findIndex(item => item.productId === action.payload.data.productId);
                if (index !== -1) {
                    state.combo[index] = action.payload.data;
                }
            })
            .addCase(updateCombo.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            });
    }
   
})

export default comboSlice.reducer;