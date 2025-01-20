import "../global.css";
import "react-native-reanimated";
import { ThemeProvider } from "@/hooks/useTheme";
import AppNavigator from "@/navigation/AppNavigator";



export default function RootLayout() {

  // Render screen based on the current tab selection
 

  return (
    <ThemeProvider>
<AppNavigator />
    </ThemeProvider>
  );
}
