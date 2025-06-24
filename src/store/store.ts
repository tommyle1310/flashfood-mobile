// store/store.ts
import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authSlice"; // Replace with the correct path to your auth slice
import userPreferenceReducer from "./userPreferenceSlice"; // Replace with the correct path to your auth slice
import orderTrackingRealtimeReducer from "./orderTrackingRealtimeSlice";
import chatReducer from "./chatSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    userPreference: userPreferenceReducer,
    orderTrackingRealtime: orderTrackingRealtimeReducer,
    chat: chatReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
