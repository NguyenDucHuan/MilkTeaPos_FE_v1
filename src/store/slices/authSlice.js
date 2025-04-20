import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import fetcher from "../../apis/fetcher";

// Định nghĩa action loginApi với createAsyncThunk
export const loginApi = createAsyncThunk(
  "auth/login",
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await fetcher.post("/authen/login", credentials); // Gọi API login
      return response.data; // Trả về dữ liệu người dùng và token
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message); // Trả về lỗi nếu có
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState: {
    isAuthenticated: !!localStorage.getItem("accessToken"), // Kiểm tra token trong localStorage
    user: null,
    error: null,
  },
  reducers: {
    logout(state) {
      state.isAuthenticated = false;
      state.user = null;
      localStorage.removeItem("accessToken"); // Xóa token khi đăng xuất
    },
  },
  extraReducers: (builder) => {
    builder.addCase(loginApi.fulfilled, (state, action) => {
      state.isAuthenticated = true;
      state.user = action.payload;
      localStorage.setItem("accessToken", action.payload.accessToken); // Lưu token vào localStorage
    });
    builder.addCase(loginApi.rejected, (state, action) => {
      state.error = action.payload;
    });
  },
});

export const { logout } = authSlice.actions; // Xuất action logout để sử dụng
export default authSlice.reducer;
