import { createStackNavigator } from "@react-navigation/stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { View, Text } from "react-native";
import { useSelector } from "react-redux"; // Import useSelector
import { RootState } from "@/src/store/store"; // Import RootState from your store

import CartScreen from "@/screens/CartScreen";
import HomeScreen from "@/screens/HomeScreen";
import OrdersScreen from "@/screens/OrdersScreen";
import LoginScreen from "@/screens/Auth/LoginScreen";
import SignupScreen from "@/screens/Auth/SignupScreen";
import ProfileScreen from "@/screens/ProfileScreen";
import RestaurantDetail from "@/screens/RestaurantDetailScreen"; // Import RestaurantDetail
import FFBottomTab from "@/src/components/FFBottomTab"; // Import FFBottomTab
import { useEffect, useState } from "react";
import { useDispatch } from "../store/types";
import { loadTokenFromAsyncStorage } from "../store/authSlice";

// Root stack param list for Login, Signup, and Home
export type RootStackParamList = {
  Login: undefined;
  Signup: undefined;
  Home: undefined;
};

// HomeTabs param list (HomeStack, Orders, Cart, Profile)
export type HomeTabsParamList = {
  HomeStack: undefined; // HomeStack should be the only screen in HomeTabs
  Orders: undefined;
  Cart: undefined;
  Profile: undefined;
};

// HomeStack param list (HomeScreen, RestaurantDetail)
export type HomeStackParamList = {
  Home: undefined;
  RestaurantDetail: { restaurantId: string }; // Param to pass to RestaurantDetail
};

const Stack = createStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<HomeTabsParamList>(); // Now includes HomeStack only
const HomeStack = createStackNavigator<HomeStackParamList>(); // Stack for Home and RestaurantDetail

// Stack Navigator for Home, including RestaurantDetail
const HomeStackScreen = () => {
  return (
    <HomeStack.Navigator>
      <HomeStack.Screen
        options={{ headerShown: false }}
        name="Home"
        component={HomeScreen}
      />
      <HomeStack.Screen
        options={{ headerShown: false }}
        name="RestaurantDetail"
        component={RestaurantDetail}
      />
    </HomeStack.Navigator>
  );
};

// Tab Navigator for the Home screen with FFBottomTab
const HomeTabs = () => {
  const [currentScreen, setCurrentScreen] = useState(0); // Track the selected screen

  let content;
  switch (currentScreen) {
    case 0:
      content = <HomeStackScreen />;
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
      content = <HomeStackScreen />;
  }

  return (
    <View style={{ flex: 1 }}>
      {/* Render the screen content */}
      {content}

      {/* Render the custom bottom tab */}
      <FFBottomTab
        currentScreen={currentScreen}
        setCurrentScreen={setCurrentScreen}
      />
    </View>
  );
};

// Stack Navigator for Login, Signup, and Home screens
const AppNavigator = () => {
  const token = useSelector((state: RootState) => state.auth.accessToken); // Get token from Redux
  const dispatch = useDispatch();

  const [loading, setLoading] = useState(true); // Loading state to wait for token loading

  // Load token from AsyncStorage when the app starts
  useEffect(() => {
    const loadToken = async () => {
      await dispatch(loadTokenFromAsyncStorage());
      setLoading(false); // Set loading to false after token is loaded
    };
    loadToken();
  }, [dispatch]);

  // If the token is still loading, show a blank screen or a loading spinner
  if (loading) {
    return null; // Or return a loading spinner here, e.g. <ActivityIndicator />
  }

  return (
    <Stack.Navigator initialRouteName={token ? "Home" : "Login"}>
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
      <Stack.Screen
        name="Home"
        options={{ headerShown: false }} // Disable header for Home screen
        component={HomeTabs} // HomeTabs now contains the HomeStack with RestaurantDetail
      />
    </Stack.Navigator>
  );
};

export default AppNavigator;
