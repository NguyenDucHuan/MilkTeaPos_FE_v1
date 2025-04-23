import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import fetcher from "../../apis/fetcher";

// Định nghĩa action loginApi với createAsyncThunk
export const loginApi = createAsyncThunk(
  "auth/login",
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await fetcher.post("/authen/login", credentials); // Gọi API login
      // Kiểm tra dữ liệu trả về từ API
      if (!response.data || !response.data.accessToken || !response.data.accessToken.token) {
        throw new Error("Không tìm thấy token hợp lệ trong phản hồi từ API.");
      }
      return response.data; // Trả về dữ liệu người dùng và token
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Đăng nhập thất bại. Vui lòng thử lại.";
      return rejectWithValue(errorMessage);
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
      state.user = action.payload.user || null; // Lưu thông tin người dùng (nếu có)
      // Truy cập trường token bên trong accessToken
      const accessToken = action.payload.accessToken.token;
      if (typeof accessToken !== "string") {
        console.error("accessToken.token không phải là chuỗi:", accessToken);
        state.error = "Token không hợp lệ.";
        return;
      }
      localStorage.setItem("accessToken", accessToken); // Lưu token vào localStorage
    });
    builder.addCase(loginApi.rejected, (state, action) => {
      state.error = action.payload;
    });
  },
});

export const { logout } = authSlice.actions; // Xuất action logout để sử dụng
export default authSlice.reducer;