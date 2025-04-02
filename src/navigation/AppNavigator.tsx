import React, { useEffect, useState } from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { useSelector } from "react-redux";
import { RootState } from "@/src/store/store";
import { useDispatch } from "../store/types";
import { loadTokenFromAsyncStorage } from "../store/authSlice";
import { useNavigation } from "@react-navigation/native"; // Giữ useNavigation từ đây
import { StackScreenProps } from "@react-navigation/stack"; // Import StackScreenProps từ @react-navigation/stack

import CartScreen from "@/screens/CartScreen";
import HomeScreen from "@/screens/HomeScreen";
import OrdersScreen from "@/screens/OrdersScreen";
import LoginScreen from "@/screens/Auth/LoginScreen";
import SignupScreen from "@/screens/Auth/SignupScreen";
import SettingsScreen from "@/screens/SettingsScreen";
import RestaurantDetail from "@/screens/RestaurantDetailScreen";
import CheckoutScreen from "@/screens/CheckoutScreen";
import { Order } from "../types/Orders";
import FFBottomTab from "../components/FFBottomTab";
import ProfileScreen from "@/screens/ProfileScreen";
import AddressListScreen from "@/screens/AddressListScreen";
import AddressDetailsScreen from "@/screens/AddressDetailsScreen";
import { Type_Address } from "../types/Address";
import SupportCenterScreen from "@/screens/SupportCenterScreen";
import FChatScreen from "@/screens/FChatScreen";
import NearYouScreen from "@/screens/NearYouScreen";
import { Restaurant } from "../types/screens/Home";
import RouteToRestaurantScreen from "@/screens/RouteToRestaurantScreen";
import RatingScreen from "@/screens/RatingScreen";
import { Avatar } from "../types/common";
import PaymentMethodScreen from "@/screens/PaymentMethodScreen";
import ChangePasswordScreen from "@/screens/ChangePasswordScreen";
import SearchScreen from "@/screens/SearchScreen";

export type RootStackParamList = {
  Login: undefined;
  Signup: undefined;
  MainStack: undefined;
};

export type MainStackParamList = {
  FChat: { withUserId?: string; type?: "SUPPORT" | "ORDER"; orderId?: string };
  RestaurantDetail: { restaurantId: string };
  Rating: {
    driver: {
      id: string;
      avatar: Avatar;
    };
    restaurant: {
      id: string;
      avatar: Avatar;
    };
    orderId?: string;
  };
  BottomTabs: { screenIndex?: number }; // Thêm tham số screenIndex
  SupportCenter: undefined;
  Checkout: { orderItem: Order };
  Profile: undefined;
  PaymentMethod: undefined;
  ChangePassword: undefined;
  Search: undefined;
  NearYou: Restaurant[];
  RouteToRestaurant: { lng: number; lat: number };
  AddressList: undefined;
  AddressDetails?: { addressDetail?: Type_Address; is_create_type?: boolean };
};

const RootStack = createStackNavigator<RootStackParamList>();
const MainStack = createStackNavigator<MainStackParamList>();

// MainStackScreen
const MainStackScreen = () => {
  return (
    <MainStack.Navigator>
      <MainStack.Screen
        options={{ headerShown: false }}
        name="BottomTabs"
        component={BottomTabs}
      />
      <MainStack.Screen
        options={{ headerShown: false }}
        name="RestaurantDetail"
        component={RestaurantDetail}
      />
      <MainStack.Screen
        options={{ headerShown: false }}
        name="Checkout"
        component={CheckoutScreen}
      />
      <MainStack.Screen
        options={{ headerShown: false }}
        name="Search"
        component={SearchScreen}
      />
      <MainStack.Screen
        options={{ headerShown: false }}
        name="PaymentMethod"
        component={PaymentMethodScreen}
      />
      <MainStack.Screen
        options={{ headerShown: false }}
        name="ChangePassword"
        component={ChangePasswordScreen}
      />
      <MainStack.Screen
        options={{ headerShown: false }}
        name="Profile"
        component={ProfileScreen}
      />
      <MainStack.Screen
        options={{ headerShown: false }}
        name="NearYou"
        component={NearYouScreen}
      />
      <MainStack.Screen
        options={{ headerShown: false }}
        name="Rating"
        component={RatingScreen}
      />
      <MainStack.Screen
        options={{ headerShown: false }}
        name="RouteToRestaurant"
        component={RouteToRestaurantScreen}
      />
      <MainStack.Screen
        options={{ headerShown: false }}
        name="AddressList"
        component={AddressListScreen}
      />
      <MainStack.Screen
        options={{ headerShown: false }}
        name="AddressDetails"
        component={AddressDetailsScreen}
      />
      <MainStack.Screen
        options={{ headerShown: false }}
        name="SupportCenter"
        component={SupportCenterScreen}
      />
      <MainStack.Screen
        options={{ headerShown: false }}
        name="FChat"
        component={FChatScreen}
      />
    </MainStack.Navigator>
  );
};

// Props cho BottomTabs
type BottomTabsProps = StackScreenProps<MainStackParamList, "BottomTabs">;

// BottomTabs component
const BottomTabs = ({ route }: BottomTabsProps) => {
  const [currentScreen, setCurrentScreen] = useState(
    route.params?.screenIndex ?? 0 // Lấy screenIndex từ params, mặc định là 0
  );

  // Cập nhật currentScreen khi route.params thay đổi
  useEffect(() => {
    if (route.params?.screenIndex !== undefined) {
      setCurrentScreen(route.params.screenIndex);
    }
  }, [route.params?.screenIndex]);

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
    return null;
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
        component={MainStackScreen}
      />
    </RootStack.Navigator>
  );
};

export default AppNavigator;
