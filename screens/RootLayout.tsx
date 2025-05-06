import React, { useEffect } from "react";
import { Provider } from "react-redux";
import store from "@/src/store/store";
import { useDispatch, useSelector } from "@/src/store/types";
import { ThemeProvider } from "@/src/hooks/useTheme";
import AppNavigator from "@/src/navigation/AppNavigator";
import FFSafeAreaView from "@/src/components/FFSafeAreaView";
import { useActiveOrderTrackingSocket } from "@/src/hooks/useActiveOrderTrackingSocket";
import { loadOrderTrackingFromAsyncStorage } from "@/src/store/orderTrackingRealtimeSlice";
import { loadTokenFromAsyncStorage } from "@/src/store/authSlice";

const AppContent = () => {
  const dispatch = useDispatch();
  const orders = useSelector((state) => state.orderTrackingRealtime.orders);

  useEffect(() => {
    const loadInitialData = async () => {
      await dispatch(loadTokenFromAsyncStorage());
      await dispatch(loadOrderTrackingFromAsyncStorage());
    };

    loadInitialData();
  }, [dispatch]);

  useActiveOrderTrackingSocket();

  console.log("check orders in RootLayout", orders);

  return (
    <ThemeProvider>
      <FFSafeAreaView>
        <AppNavigator />
      </FFSafeAreaView>
    </ThemeProvider>
  );
};

const RootLayout = () => {
  return (
    <Provider store={store}>
      <AppContent />
    </Provider>
  );
};

export default RootLayout;
