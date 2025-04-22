import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import fetcher from "../../apis/fetcher";
import axios from "axios";

// API endpoints
const API_URL = 'https://localhost:7186/api';

// Fetch cart items
export const fetchCartItems = createAsyncThunk(
  'order/fetchCartItems',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/order-item/get-cart`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

// Add to cart
export const addToCartApi = createAsyncThunk(
  "order/addToCartApi",
  async (cartData, { rejectWithValue, getState }) => {
    try {
      const response = await fetcher.post("/order-item/add-to-cart", cartData);
      console.log("Dữ liệu phản hồi API:", response.data);
      return response.data;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        "Lỗi khi thêm vào giỏ hàng. Vui lòng thử lại.";
      console.error("Lỗi API:", errorMessage, error);
      return rejectWithValue(errorMessage);
    }
  }
);

// Get cart items
export const getCartApi = createAsyncThunk(
  "order/getCartApi",
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetcher.get("/order-item/get-cart");
      console.log("Dữ liệu phản hồi API:", response.data);
      return response.data;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        "Lỗi khi lấy giỏ hàng. Vui lòng thử lại.";
      console.error("Lỗi API:", errorMessage, error);
      return rejectWithValue(errorMessage);
    }
  }
);

// Update cart item quantity
export const updateCartQuantityApi = createAsyncThunk(
  "order/updateCartQuantityApi",
  async ({ productId, quantity }, { rejectWithValue }) => {
    try {
      console.log("Sending update request:", { productId, quantity });
      const response = await fetcher.put("/order-item/update", {
        productId,
        quantity
      });
      console.log("API Response:", response);
      return response.data;
    } catch (error) {
      console.error("Full error object:", error);
      console.error("Error response:", error.response);
      console.error("Error message:", error.message);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Lỗi khi cập nhật số lượng sản phẩm. Vui lòng thử lại.";
      return rejectWithValue(errorMessage);
    }
  }
);

// Remove from cart
export const removeFromCartApi = createAsyncThunk(
  "order/removeFromCartApi",
  async ({ productId, quantity }, { rejectWithValue }) => {
    try {
      console.log("Removing from cart:", { productId, quantity });
      const response = await fetcher.delete(
        `/order-item/remove-from-cart?productId=${productId}&quantity=${quantity}`
      );
      console.log("Remove from cart response:", response.data);
      return response.data;
    } catch (error) {
      console.error("Remove from cart error:", error.response?.data || error);
      const errorMessage = error.response?.data?.detail || 
                          error.response?.data?.message || 
                          "Lỗi khi xóa sản phẩm khỏi giỏ hàng. Vui lòng thử lại.";
      return rejectWithValue(errorMessage);
    }
  }
);

// Thêm action để lấy danh sách đơn hàng
export const fetchOrders = createAsyncThunk(
  "order/fetchOrders",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/order`);
      console.log("Orders response:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error fetching orders:", error);
      return rejectWithValue(error.response?.data?.message || "Có lỗi xảy ra khi tải danh sách đơn hàng");
    }
  }
);

const orderSlice = createSlice({
  name: "order",
  initialState: {
    cart: [],
    offers: [],
    orders: {
      items: [],
      size: 10,
      page: 1,
      total: 0,
      totalPages: 0
    },
    isLoading: false,
    error: null,
  },
  reducers: {
    updateCartItemQuantity: (state, action) => {
      const { productId, quantity } = action.payload;
      const itemIndex = state.cart.findIndex(
        (item) => item.product.productId === productId
      );
      if (itemIndex !== -1) {
        if (quantity === 0) {
          state.cart.splice(itemIndex, 1);
        } else {
          state.cart[itemIndex].quantity = quantity;
        }
      }
    },
    addToCart: (state, action) => {
      const { product, quantity } = action.payload;
      const existingItem = state.cart.find(
        (item) => item.product.productId === product.productId
      );
      if (existingItem) {
        existingItem.quantity += quantity;
      } else {
        state.cart.push({
          orderItemId: Date.now(), // Temporary ID
          product,
          quantity
        });
      }
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(addToCartApi.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(addToCartApi.fulfilled, (state, { payload }) => {
        state.isLoading = false;
        state.error = null;
        // Refresh cart after adding item
        state.cart = payload.cart || [];
        state.offers = payload.offers || [];
      })
      .addCase(addToCartApi.rejected, (state, { payload }) => {
        state.isLoading = false;
        state.error = payload;
      })
      .addCase(getCartApi.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getCartApi.fulfilled, (state, { payload }) => {
        state.isLoading = false;
        state.error = null;
        state.cart = payload.cart || [];
        state.offers = payload.offers || [];
      })
      .addCase(getCartApi.rejected, (state, { payload }) => {
        state.isLoading = false;
        state.error = payload;
      })
      .addCase(removeFromCartApi.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(removeFromCartApi.fulfilled, (state, { payload }) => {
        state.isLoading = false;
        state.error = null;
        state.cart = payload.cart || [];
        state.offers = payload.offers || [];
      })
      .addCase(removeFromCartApi.rejected, (state, { payload }) => {
        state.isLoading = false;
        state.error = payload;
      })
      .addCase(updateCartQuantityApi.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateCartQuantityApi.fulfilled, (state, { payload }) => {
        state.isLoading = false;
        state.error = null;
        state.cart = payload.cart || [];
        state.offers = payload.offers || [];
      })
      .addCase(updateCartQuantityApi.rejected, (state, { payload }) => {
        state.isLoading = false;
        state.error = payload;
      })
      .addCase(fetchOrders.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.isLoading = false;
        state.orders = {
          items: action.payload.items || [],
          size: action.payload.size || 10,
          page: action.payload.page || 1,
          total: action.payload.total || 0,
          totalPages: action.payload.totalPages || 0
        };
      })
      .addCase(fetchOrders.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.orders = {
          items: [],
          size: 10,
          page: 1,
          total: 0,
          totalPages: 0
        };
      });
  },
});

export const { updateCartItemQuantity, addToCart } = orderSlice.actions;
export default orderSlice.reducer;
