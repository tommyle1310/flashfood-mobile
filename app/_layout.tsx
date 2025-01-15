import "../global.css";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import "react-native-reanimated";
import { useState } from "react";
import { ThemeProvider } from "@/hooks/useTheme";
import { View } from "react-native";
import CartScreen from "@/screens/CartScreen";
import HomeScreen from "@/screens/HomeScreen";
import OrdersScreen from "@/screens/OrdersScreen";
import ProfileScreen from "@/screens/ProfileScreen";
import FFBottomTab from "@/components/FFBottomTab";

// Prevent the splash screen from auto-hiding before asset loading is complete.

export default function RootLayout() {
const [currentScreen, setCurrentScreen] = useState(0); // Manage the current screen

  // Render screen based on selected tab
  const renderScreen = () => {
    switch (currentScreen) {
      case 0:
        return <HomeScreen />;
      case 1:
        return <OrdersScreen />;
      case 2:
        return <CartScreen />;
      case 3:
        return <ProfileScreen />;
      default:
        return <HomeScreen />;
    }
  };

  return (
    <ThemeProvider>
        {renderScreen()}
            <FFBottomTab currentScreen={currentScreen} setCurrentScreen={setCurrentScreen} />
    </ThemeProvider>
  );
}
