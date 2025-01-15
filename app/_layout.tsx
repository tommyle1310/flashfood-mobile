import "../global.css";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import "react-native-reanimated";
import { useState } from "react";
import { ThemeProvider } from "@/hooks/useTheme";

// Prevent the splash screen from auto-hiding before asset loading is complete.

export default function RootLayout() {

  return (
    <ThemeProvider>
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" />
      </Stack>
    </ThemeProvider>
  );
}
