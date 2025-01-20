import "../../global.css";
import "react-native-reanimated";
import { ThemeProvider } from "@/src/hooks/useTheme";
import AppNavigator from "@/src/navigation/AppNavigator";
import { Provider } from "react-redux";
import store from "@/src/store/store";


export default function RootLayout() {
  // Render screen based on the current tab selection
  

  return (
    <Provider store={store}>
      <ThemeProvider>
        <AppNavigator />
      </ThemeProvider>
    </Provider>
  );
}


