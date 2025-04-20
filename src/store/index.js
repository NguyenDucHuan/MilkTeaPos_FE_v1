import { configureStore } from "@reduxjs/toolkit";
import itemSlice from "./slices/itemSlice";
import categorySlice from "./slices/categorySlice";
import authReducer from "./slices/authSlice"; // Import default export

export const store = configureStore({
  reducer: {
    item: itemSlice,
    category: categorySlice,
    auth: authReducer, // Sử dụng reducer từ authSlice
  },
});

export default store;