import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';

export const fetchCartItems = createAsyncThunk(
  'order/fetchCartItems',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get('https://localhost:7186/api/order-item/get-cart');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data); 
    }
  }
);

const orderSlice = createSlice({
  name: 'order',
  initialState: {
    items: [],
    offers: [],
    loading: false,
    error: null,
    paymentMethod: 'cash',
  },
  reducers: {
    // ... existing reducers ...
  },
  extraReducers: (builder) => {
    builder
      // ... existing cases ...
      .addCase(fetchCartItems.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCartItems.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.cart.map(item => ({
          id: item.orderItemId,
          productId: item.productId,
          name: item.product.productName,
          price: item.price,
          quantity: item.quantity,
          imageUrl: item.product.imageUrl
        }));
        state.offers = action.payload.offers.map(offer => ({
          id: offer.productId,
          name: offer.productName,
          price: offer.prize,
          imageUrl: offer.imageUrl
        }));
      })
      .addCase(fetchCartItems.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default orderSlice.reducer; 