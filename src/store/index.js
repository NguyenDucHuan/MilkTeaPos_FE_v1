import { configureStore } from "@reduxjs/toolkit";
import itemSlice from "./slices/itemSlice";
import categorySlice from "./slices/categorySlice";
import authReducer from "./slices/authSlice"; // Import default export
import paymentSlice from "./slices/paymentSlice";
import orderSlice from "./slices/orderSlice";
import statisticSlice from "./slices/statisticSlice";
import comboSlice from "./slices/comboSlice";
import profileReducer from "./slices/profileSlice";
import voucherSlice from "./slices/voucherSlice";

export const store = configureStore({
  reducer: {
    item: itemSlice,
    category: categorySlice,
    auth: authReducer,
    payment: paymentSlice,
    order: orderSlice,
    statistic: statisticSlice,
    combo: comboSlice,
    profile: profileReducer,
    voucher: voucherSlice,
  },
});

export default store;
