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
  async ({ orderItemId, quantity = 1 }, { rejectWithValue }) => {
    try {
      const response = await fetcher.delete(
        `/order-item/remove-from-cart?orderItemId=${orderItemId}&quantity=${quantity}`
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
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

export const getCart = createAsyncThunk(
  "order/getCart",
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetcher.get("/order-item/get-cart");
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const clearCartApi = createAsyncThunk(
  "order/clearCartApi",
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetcher.delete("/order-item/clear-cart");
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
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
        (item) => item.productId === productId
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
      const { orderItemId, productId, quantity, price, product, toppings } = action.payload;
      
      // Kiểm tra xem sản phẩm đã tồn tại trong giỏ hàng chưa
      const existingItemIndex = state.cart.findIndex(
        (item) => item.productId === productId
      );

      if (existingItemIndex !== -1) {
        // Nếu sản phẩm đã tồn tại, cập nhật số lượng
        state.cart[existingItemIndex].quantity += quantity;
      } else {
        // Nếu sản phẩm chưa tồn tại, thêm mới
        state.cart.push({
          orderItemId,
          productId,
          quantity,
          price,
          product,
          toppings
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
      .addCase(removeFromCartApi.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;
        state.cart = action.payload.cart || [];
        state.offers = action.payload.offers || [];
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
      })
      .addCase(getCart.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getCart.fulfilled, (state, action) => {
        state.isLoading = false;
        state.cart = action.payload;
      })
      .addCase(getCart.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(clearCartApi.fulfilled, (state, action) => {
        state.cart = [];
        state.offers = [];
      });
  },
});

export const { updateCartItemQuantity, addToCart } = orderSlice.actions;
export default orderSlice.reducer;
