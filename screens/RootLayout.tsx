import React, { useEffect } from "react";
import { Provider } from "react-redux";
import store from "@/src/store/store";
import { useDispatch } from "@/src/store/types";
import { ThemeProvider } from "@/src/hooks/useTheme";
import AppNavigator from "@/src/navigation/AppNavigator";
import FFSafeAreaView from "@/src/components/FFSafeAreaView";
import { useActiveOrderTrackingSocket } from "@/src/hooks/useActiveOrderTrackingSocket";
import { loadOrderTrackingFromAsyncStorage } from "@/src/store/orderTrackingRealtimeSlice";
import { loadTokenFromAsyncStorage } from "@/src/store/authSlice";
import { loadChatDataFromStorage } from "@/src/store/chatSlice";

const AppContent = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    const loadInitialData = async () => {
      console.log("🔄 RootLayout: Loading initial data...");
      await dispatch(loadTokenFromAsyncStorage());
      await dispatch(loadOrderTrackingFromAsyncStorage());
      await dispatch(loadChatDataFromStorage());
      console.log("✅ RootLayout: Initial data loaded");
    };

    loadInitialData();
  }, [dispatch]);

  useActiveOrderTrackingSocket();

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
