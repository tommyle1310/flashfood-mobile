import React, { useEffect } from "react";
import { Provider, useDispatch } from "react-redux";
import store, { AppDispatch } from "@/store/store";
import { loadTokenFromAsyncStorage } from "@/store/authSlice";
import { ThemeProvider } from "@/hooks/useTheme";
import AppNavigator from "@/navigation/AppNavigator";
import FFSafeAreaView from "@/components/FFSafeAreaView";

const RootLayout = () => {
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    const loadToken = async () => {
      dispatch(loadTokenFromAsyncStorage());
    };

    loadToken();
  }, [dispatch]);

  return (
    <ThemeProvider>
      <AppNavigator />
    </ThemeProvider>
  );
};

export default RootLayout;
