import { createStackNavigator } from "@react-navigation/stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { View } from "react-native";
import { useState } from "react";

import CartScreen from "@/screens/CartScreen";
import HomeScreen from "@/screens/HomeScreen";
import OrdersScreen from "@/screens/OrdersScreen";
import LoginScreen from "@/screens/Auth/LoginScreen";
import SignupScreen from "@/screens/Auth/SignupScreen";
import ProfileScreen from "@/screens/ProfileScreen";
import FFBottomTab from "@/src/components/FFBottomTab";

// Define the param list for the stack navigator
export type RootStackParamList = {
  Login: undefined;
  Signup: undefined;
  Home: undefined;
};

// Define the param list for the bottom tab navigator
export type RootTabParamList = {
  Home: undefined;
  Orders: undefined;
  Cart: undefined;
  Profile: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<RootTabParamList>();

// Tab Navigator for the Home screen
const HomeTabs = () => {
  const [currentScreen, setCurrentScreen] = useState(0); // Track the selected screen

  let content;
  switch (currentScreen) {
    case 0:
      content = <HomeScreen />;
      break;
    case 1:
      content = <OrdersScreen />;
      break;
    case 2:
      content = <CartScreen />;
      break;
    case 3:
      content = <ProfileScreen />;
      break;
    default:
      content = <HomeScreen />;
  }

  return (
    <View style={{ flex: 1 }}>
      {/* Render the screen content */}
      {content}

      {/* Render the custom bottom tab */}
      <FFBottomTab currentScreen={currentScreen} setCurrentScreen={setCurrentScreen} />
    </View>
  );
};




// Stack Navigator for Login, Signup, and Home screens
const AppNavigator = () => {
  return (
    <Stack.Navigator initialRouteName="Login">
      <Stack.Screen
        name="Login"
        options={{ headerShown: false }} // Disable header for Login screen
        component={LoginScreen}
      />
      <Stack.Screen
        name="Signup"
        options={{ headerShown: false }} // Disable header for Signup screen
        component={SignupScreen}
      />
      {/* Home screen as part of the stack, with HomeTabs as its component */}
      <Stack.Screen
        name="Home"
        options={{ headerShown: false }} // Disable header for Home screen
        component={HomeTabs}
      />
    </Stack.Navigator>
  );
};

export default AppNavigator;
