import React, { useEffect } from "react";
import { Provider } from "react-redux";
import store, { AppDispatch } from "@/src/store/store";
import { loadTokenFromAsyncStorage } from "@/src/store/authSlice";
import { ThemeProvider } from "@/src/hooks/useTheme";
import AppNavigator from "@/src/navigation/AppNavigator";
import FFSafeAreaView from "@/src/components/FFSafeAreaView";
import { useDispatch, useSelector } from "@/src/store/types";
import { useActiveOrderTrackingSocket } from "@/src/hooks/useActiveOrderTrackingSocket";
import {
  loadOrderTrackingFromAsyncStorage,
  saveOrderTrackingToAsyncStorage,
} from "@/src/store/orderTrackingRealtimeSlice";

const RootLayout = () => {
  const dispatch = useDispatch();
  const orders = useSelector((state) => state.orderTrackingRealtime.orders);

  useEffect(() => {
    const loadInitialData = async () => {
      await dispatch(loadTokenFromAsyncStorage());
      await dispatch(loadOrderTrackingFromAsyncStorage()); // Tải dữ liệu từ AsyncStorage
    };

    loadInitialData();
  }, [dispatch]);

  useActiveOrderTrackingSocket();

  // Lưu orders vào AsyncStorage mỗi khi orders thay đổi
  useEffect(() => {
    dispatch(saveOrderTrackingToAsyncStorage(orders));
  }, [dispatch, orders]);

  console.log("check orders in RootLayout", orders);

  return (
    <ThemeProvider>
      <AppNavigator />
    </ThemeProvider>
  );
};

export default RootLayout;
