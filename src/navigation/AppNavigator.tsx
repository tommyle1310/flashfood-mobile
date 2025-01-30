import { createStackNavigator } from "@react-navigation/stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { View, Text } from "react-native";
import { useSelector } from "react-redux"; // Import useSelector
import { RootState } from "@/src/store/store"; // Import RootState from your store
import { useEffect, useState } from "react";
import { useDispatch } from "../store/types";
import { loadTokenFromAsyncStorage } from "../store/authSlice";

import CartScreen from "@/screens/CartScreen";
import HomeScreen from "@/screens/HomeScreen";
import OrdersScreen from "@/screens/OrdersScreen";
import LoginScreen from "@/screens/Auth/LoginScreen";
import SignupScreen from "@/screens/Auth/SignupScreen";
import ProfileScreen from "@/screens/ProfileScreen";
import RestaurantDetail from "@/screens/RestaurantDetailScreen"; // Import RestaurantDetail

// Root stack param list for Login, Signup, and Home
export type RootStackParamList = {
  Login: undefined;
  Signup: undefined;
  Home: undefined;
};

// Define HomeStackParamList clearly with the screen and params
export type HomeStackParamList = {
  Home: undefined;
  RestaurantDetail: { restaurantId: string }; // Param for RestaurantDetail
};

// Update HomeTabsParamList to accept navigation to a screen in HomeStack
export type HomeTabsParamList = {
  HomeStack: { screen: keyof HomeStackParamList; params: any } | undefined;
  Orders: undefined;
  Cart: undefined;
  Profile: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<HomeTabsParamList>(); // Now includes HomeStack only

const HomeStack = createStackNavigator<HomeStackParamList>();

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

const HomeTabs = () => (
  <Tab.Navigator>
    <Tab.Screen
      options={{ headerShown: false }}
      name="HomeStack"
      component={HomeStackScreen}
    />
    <Tab.Screen
      options={{ headerShown: false }}
      name="Orders"
      component={OrdersScreen}
    />
    <Tab.Screen
      options={{ headerShown: false }}
      name="Cart"
      component={CartScreen}
    />
    <Tab.Screen
      options={{ headerShown: false }}
      name="Profile"
      component={ProfileScreen}
    />
  </Tab.Navigator>
);

const AppNavigator = () => {
  const token = useSelector((state: RootState) => state.auth.accessToken);
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadToken = async () => {
      await dispatch(loadTokenFromAsyncStorage());
      setLoading(false);
    };
    loadToken();
  }, [dispatch]);

  if (loading) {
    return null;
  }

  return (
    <Stack.Navigator initialRouteName={token ? "Home" : "Login"}>
      <Stack.Screen
        name="Login"
        options={{ headerShown: false }}
        component={LoginScreen}
      />
      <Stack.Screen
        name="Signup"
        options={{ headerShown: false }}
        component={SignupScreen}
      />
      <Stack.Screen
        name="Home"
        options={{ headerShown: false }}
        component={HomeTabs}
      />
    </Stack.Navigator>
  );
};

export default AppNavigator;
