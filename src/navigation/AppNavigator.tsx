import React, { useEffect, useState } from "react";
import { createStackNavigator } from "@react-navigation/stack";
import {
  BottomTabNavigationProp,
  createBottomTabNavigator,
} from "@react-navigation/bottom-tabs"; // Import BottomTabNavigator
import { useSelector } from "react-redux";
import { RootState } from "@/src/store/store";
import { useDispatch } from "../store/types";
import { loadTokenFromAsyncStorage } from "../store/authSlice";

import CartScreen from "@/screens/CartScreen";
import HomeScreen from "@/screens/HomeScreen";
import OrdersScreen from "@/screens/OrdersScreen";
import LoginScreen from "@/screens/Auth/LoginScreen";
import SignupScreen from "@/screens/Auth/SignupScreen";
import SettingsScreen from "@/screens/SettingsScreen";
import RestaurantDetail from "@/screens/RestaurantDetailScreen";
import CheckoutScreen from "@/screens/CheckoutScreen"; // Import CheckoutScreen
import { Order } from "../types/Orders";

// Import your custom FFBottomTab
import FFBottomTab from "../components/FFBottomTab";
import { useNavigation } from "@react-navigation/native";
import ProfileScreen from "@/screens/ProfileScreen";
import AddressListScreen from "@/screens/AddressListScreen";

// Root stack param list for Login and Signup
export type RootStackParamList = {
  Login: undefined;
  Signup: undefined;
  MainStack: undefined;
};

// Define the BottomTabParamList for the BottomTabNavigator
export type BottomTabParamList = {
  Home: undefined;
  Orders: undefined;
  Cart: undefined;
  Settings: undefined;
};

// Define the MainStackParamList for BottomTabs and ContentStacks
export type MainStackParamList = {
  BottomTabs: BottomTabParamList;
  RestaurantDetail: { restaurantId: string }; // Param for RestaurantDetail
  Checkout: { orderItem: Order }; // Add Checkout screen to stack
  Profile: undefined; // Add Checkout screen to stack
  AddressList: undefined; // Add Checkout screen to stack
};

// Create the root stack and bottom tab stack
const RootStack = createStackNavigator<RootStackParamList>(); // Root stack for Login, Signup, and MainStack
const MainStack = createStackNavigator<MainStackParamList>(); // Create MainStack with MainStackParamList
const BottomTab = createBottomTabNavigator(); // Create a BottomTabNavigator

// MainStack to include BottomTabs and ContentStacks (RestaurantDetail, Checkout)
const MainStackScreen = () => {
  return (
    <MainStack.Navigator>
      <MainStack.Screen
        options={{ headerShown: false }}
        name="BottomTabs"
        component={BottomTabs} // The BottomTabs navigator
      />
      <MainStack.Screen
        options={{ headerShown: false }}
        name="RestaurantDetail"
        component={RestaurantDetail} // For handling restaurant details
      />
      <MainStack.Screen
        options={{ headerShown: false }}
        name="Checkout"
        component={CheckoutScreen} // For handling checkout screen
      />
      <MainStack.Screen
        options={{ headerShown: false }}
        name="Profile"
        component={ProfileScreen} // For handling checkout screen
      />
      <MainStack.Screen
        options={{ headerShown: false }}
        name="AddressList"
        component={AddressListScreen} // For handling checkout screen
      />
    </MainStack.Navigator>
  );
};

type BottomNavigationProp = BottomTabNavigationProp<BottomTabParamList>;

// BottomTabs with FFBottomTab
const BottomTabs = () => {
  const [currentScreen, setCurrentScreen] = useState(0); // Track the current tab index

  // Use useNavigation with the correct type for BottomTab navigation
  const navigation = useNavigation<BottomNavigationProp>();

  const renderedScreen = () => {
    switch (currentScreen) {
      case 0:
        return <HomeScreen />;
      case 1:
        return <OrdersScreen />;
      case 2:
        return <CartScreen />;
      case 3:
        return <SettingsScreen />;
      default:
        return <HomeScreen />;
    }
  };

  return (
    <>
      {renderedScreen()}
      <FFBottomTab
        currentScreen={currentScreen}
        setCurrentScreen={setCurrentScreen}
      />
    </>
  );
};

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
    return null; // Loading state, can show a loading spinner if needed
  }

  return (
    <RootStack.Navigator initialRouteName={token ? "MainStack" : "Login"}>
      <RootStack.Screen
        name="Login"
        options={{ headerShown: false }}
        component={LoginScreen}
      />
      <RootStack.Screen
        name="Signup"
        options={{ headerShown: false }}
        component={SignupScreen}
      />
      <RootStack.Screen
        name="MainStack"
        options={{ headerShown: false }}
        component={MainStackScreen} // Now the MainRootStack contains BottomTabs and ContentRootStacks
      />
    </RootStack.Navigator>
  );
};

export default AppNavigator;
