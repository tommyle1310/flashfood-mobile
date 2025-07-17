// screens/Login.tsx
import React, { useEffect, useState } from "react";
import FFSafeAreaView from "@/src/components/FFSafeAreaView";
import { useNavigation } from "@react-navigation/native";
import FFAuthForm from "./FFAuthForm";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "@/src/navigation/AppNavigator";
import { LinearGradient } from "expo-linear-gradient";
import { useDispatch, useSelector } from "@/src/store/types";
import {
  loadTokenFromAsyncStorage,
  saveTokenToAsyncStorage,
  setAuthState,
} from "@/src/store/authSlice";
import axiosInstance from "@/src/utils/axiosConfig";
import { RootState } from "@/src/store/store";
import { decodeJWT } from "@/src/utils/functions";
import {
  saveCartItemsToAsyncStorage,
  saveFavoriteRestaurantsToAsyncStorage,
} from "@/src/store/userPreferenceSlice";
import Spinner from "@/src/components/FFSpinner";
import { useTheme } from "@/src/hooks/useTheme";

type LoginScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  "Login"
>;

const Login = () => {
  const navigation = useNavigation<LoginScreenNavigationProp>();
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(false);
  // Change error state to an object to hold field-specific errors
  const [formErrors, setFormErrors] = useState<{
    general?: string;
    email?: string;
    password?: string;
    firstName?: string;
    lastName?: string;
  }>({});

  const handleLoginSubmit = async (
    email: string,
    password: string,
    firstName: string,
    lastName: string
  ) => {
    // Clear previous errors
    setFormErrors({});

    // Simple client-side validation for missing fields
    // This is a basic example; you might want more robust validation.
    const newErrors: typeof formErrors = {};
    if (!email) newErrors.email = "Email is required.";
    if (!password) newErrors.password = "Password is required.";

    if (Object.keys(newErrors).length > 0) {
      setFormErrors(newErrors);
      return; // Stop submission if client-side validation fails
    }

    const requestBody = {
      email: email,
      password: password,
    };
    console.log("check req body", requestBody);
    setIsLoading(true);

    try {
      const response = await axiosInstance.post(
        "/auth/login-customer",
        requestBody,
        {
          validateStatus: () => true,
        }
      );

      const { EC, EM, data } = response.data;
      console.log("response.data", response.data);

      if (EC === 0) {
        // Success
        const userData = decodeJWT(data.access_token);
        console.log("🔐 Login success - saving user data:", userData);

        const responseCartItem = await axiosInstance.get(
          `/customers/cart-items/${userData.id}`,
          {
            validateStatus: () => true,
          }
        );

        await dispatch(
          saveTokenToAsyncStorage({
            accessToken: data.access_token,
            app_preferences: userData.app_preferences || {},
            email: userData.email || "",
            first_name: userData.first_name || "",
            last_name: userData.last_name || "",
            phone: userData.phone || "",
            preferred_category: userData.preferred_category || [],
            favorite_items: userData.favorite_items || [],
            avatar: userData.avatar || null,
            support_tickets: userData.support_tickets || [],
            user_id: userData.user_id || "",
            user_type: userData.user_type || [],
            address: userData.address || [],
            is_verified: userData.is_verified || false,
            id: userData.id || "",
            fWallet_id: userData.fWallet_id || "",
            fWallet_balance: parseFloat(userData.fWallet_balance) || 0,
          })
        );

        await dispatch(saveFavoriteRestaurantsToAsyncStorage());
        await dispatch(saveCartItemsToAsyncStorage(responseCartItem.data.data));

        console.log("💾 All user data saved successfully, navigating...", {
          accessToken: data.access_token,
          app_preferences: userData.app_preferences || {},
          email: userData.email || "",
          first_name: userData.first_name || "",
          last_name: userData.last_name || "",
          phone: userData.phone || "",
          preferred_category: userData.preferred_category || [],
          favorite_items: userData.favorite_items || [],
          avatar: userData.avatar || null,
          support_tickets: userData.support_tickets || [],
          user_id: userData.user_id || "",
          user_type: userData.user_type || [],
          address: userData.address || [],
          is_verified: userData.is_verified || false,
          id: userData.id || "",
          fWallet_id: userData.fWallet_id || "",
          fWallet_balance: parseFloat(userData.fWallet_balance) || 0,
        });

        navigation.reset({
          index: 0,
          routes: [{ name: "MainStack" }],
        });
      } else if (EC === 3) {
        // Invalid credentials
        setFormErrors({ general: EM || "Invalid email or password. Please try again." });
      } else if (EC === 1) {
        // Missing required fields (server-side validation)
        // Assuming EM might contain details about missing fields, or you map generic EC=1 to specific fields.
        // For now, we'll just show a general message or infer from EM if possible.
        setFormErrors({ general: EM || "Please fill in all required fields." });
        // If EM gives specific field names, you could parse it:
        // if (EM.includes("email")) newErrors.email = "Email is missing.";
        // if (EM.includes("password")) newErrors.password = "Password is missing.";
        // setFormErrors(newErrors);
      } else {
        // Other errors
        setFormErrors({ general: EM || "An unexpected error occurred. Please try again later." });
      }
    } catch (error) {
      console.error("Login failed:", error);
      setFormErrors({ general: "Network error or unexpected issue. Please check your connection." });
    } finally {
      setIsLoading(false);
    }
  };

  const { theme } = useTheme();

  const accessToken = useSelector((state: RootState) => state.auth.accessToken);
  const isAuthenticated = useSelector(
    (state: RootState) => state.auth.isAuthenticated
  );

  if (isAuthenticated) {
    // console.log("User is authenticated with token:", accessToken);
  } else {
    console.log("User is not authenticated");
  }

  if (isLoading) {
    return <Spinner isVisible isOverlay />;
  }

  return (
    <FFSafeAreaView>
      <LinearGradient
        colors={
          theme === "light"
            ? ["#8fa3d9", "#b5b3a1", "#b5e1a1"]
            : ["#51d522", "#144a06", "#5c5d85"]
        }
        start={[1, 0]}
        end={[0, 1]}
        className="flex-1 items-center justify-center"
      >
        <FFAuthForm
          formErrors={formErrors} // Pass the formErrors object
          isSignUp={false}
          onSubmit={handleLoginSubmit}
          navigation={navigation}
        />
      </LinearGradient>
    </FFSafeAreaView>
  );
};

export default Login;