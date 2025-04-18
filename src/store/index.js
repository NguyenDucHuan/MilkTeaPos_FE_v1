import { configureStore } from "@reduxjs/toolkit";
import itemSlice from "./slices/itemSlice";
import categorySlice from "./slices/categorySlice";
export const store = configureStore({
  reducer: {
    item: itemSlice,
    category: categorySlice,
  },
});
export default store;
