import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
// Giả sử fetcher được cấu hình đúng để gọi API
import fetcher from '../../apis/fetcher';
import { jwtDecode } from 'jwt-decode'; // <-- Đã import jwt-decode

// Định nghĩa loginApi thunk (Giữ nguyên)
export const loginApi = createAsyncThunk(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await fetcher.post('/authen/login', credentials);
      // Kiểm tra kỹ hơn cấu trúc response data trước khi trả về
      if (!response.data?.accessToken?.token) { // Kiểm tra sự tồn tại của token
        throw new Error('Phản hồi đăng nhập không hợp lệ.');
      }
      return response.data; // Trả về toàn bộ data { accessToken: {...}, refreshToken: {...} }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Đăng nhập thất bại.';
      return rejectWithValue(errorMessage);
    }
  }
);

// --- Sửa Initial State ---
const initialState = {
  // Khởi tạo user là null, isAuthenticated là false
  // Sẽ cập nhật khi đăng nhập hoặc khi khôi phục từ localStorage
  user: null,
  isAuthenticated: false,
  loading: false, // Thêm trạng thái loading
  error: null,
};
// ------------------------

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout(state) {
      state.isAuthenticated = false;
      state.user = null;
      state.loading = false;
      state.error = null;
      localStorage.removeItem('accessToken');
      console.log("[authSlice] User logged out.");
    },
    // Action để cập nhật user từ token đã lưu (ví dụ khi tải lại trang)
    setUserFromToken: (state, action) => {
      const token = action.payload;
      console.log("[authSlice] setUserFromToken called with token:", !!token);
      if (token) {
        try {
          const decodedToken = jwtDecode(token);
          console.log("[authSlice] Decoded token for setUser:", decodedToken);
          // Tạo đối tượng user từ decoded token
          state.user = {
            id: decodedToken['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/sid'],
            email: decodedToken['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'],
            name: decodedToken['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'],
            role: decodedToken['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'],
            // Thêm các trường khác nếu cần
          };
          state.isAuthenticated = true;
          state.loading = false;
          state.error = null;
          console.log("[authSlice] User restored from token:", state.user);
        } catch (error) {
          console.error("[authSlice] Failed to decode token for setUserFromToken:", error);
          // Nếu token lỗi, đảm bảo state là đã logout
          state.user = null;
          state.isAuthenticated = false;
           state.loading = false;
           state.error = "Phiên đăng nhập không hợp lệ.";
           localStorage.removeItem('accessToken'); // Xóa token lỗi
        }
      } else {
         // Nếu không có token được truyền vào
         state.user = null;
         state.isAuthenticated = false;
         state.loading = false;
         state.error = null;
      }
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginApi.pending, (state) => {
        console.log("[authSlice] loginApi pending...");
        state.loading = true;
        state.error = null;
        state.isAuthenticated = false; // Đảm bảo false khi bắt đầu login
        state.user = null;           // Xóa user cũ nếu có
      })
      .addCase(loginApi.fulfilled, (state, action) => {
        console.log("[authSlice] loginApi fulfilled. Payload:", action.payload);
        state.loading = false;
        state.error = null;

        // Lấy token từ payload
        const token = action.payload?.accessToken?.token;

        if (token && typeof token === 'string') {
           console.log("[authSlice] Token found in payload:", !!token);
          // Lưu token vào localStorage trước
          localStorage.setItem('accessToken', token);
          console.log("[authSlice] Token saved to localStorage.");

          // Giải mã token và cập nhật state.user
          try {
            const decodedToken = jwtDecode(token);
            console.log("[authSlice] Decoding token in fulfilled:", decodedToken);

            // Tạo đối tượng user từ payload đã giải mã
            // !! SỬ DỤNG ĐÚNG KEY TRONG JWT PAYLOAD CỦA BẠN !!
            state.user = {
              id: decodedToken['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/sid'],
              email: decodedToken['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'],
              name: decodedToken['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'],
              role: decodedToken['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'],
              // Thêm các trường khác nếu cần từ decodedToken
            };
            state.isAuthenticated = true; // Đặt isAuthenticated là true SAU KHI giải mã thành công
            console.log("[authSlice] User state updated:", state.user);

          } catch (error) {
            console.error("[authSlice] Lỗi giải mã JWT khi login:", error);
            // Xử lý lỗi giải mã: đặt lại state về trạng thái chưa đăng nhập
            state.user = null;
            state.isAuthenticated = false;
            state.error = "Lỗi xử lý thông tin người dùng.";
            localStorage.removeItem('accessToken'); // Xóa token lỗi khỏi localStorage
          }
        } else {
          // Xử lý trường hợp không có token hợp lệ trong payload
          console.error("[authSlice] Không tìm thấy token hợp lệ trong payload fulfilled.");
          state.user = null;
          state.isAuthenticated = false;
          state.error = "Phản hồi đăng nhập không hợp lệ (thiếu token).";
        }
      })
      .addCase(loginApi.rejected, (state, action) => {
        console.error("[authSlice] loginApi rejected. Payload:", action.payload);
        state.loading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.error = action.payload || 'Đăng nhập thất bại.'; // Lấy lỗi từ rejectWithValue
      });
  },
});

// Export cả setUserFromToken
export const { logout, setUserFromToken } = authSlice.actions;
export default authSlice.reducer;