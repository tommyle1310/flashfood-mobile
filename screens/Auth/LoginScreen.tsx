// screens/Login.tsx
import React, { useEffect, useState } from "react";
import FFSafeAreaView from "@/src/components/FFSafeAreaView";
import { useNavigation } from "@react-navigation/native";
import FFAuthForm from "./FFAuthForm";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "@/src/navigation/AppNavigator"; // Make sure you have this path correct
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
  const [error, setError] = useState("");
  const handleLoginSubmit = async (email: string, password: string) => {
    // Request body
    const requestBody = {
      email: email,
      password: password,
    };
    console.log("check req body", requestBody);
    setIsLoading(true);

    try {
      // Make the POST request
      const response = await axiosInstance.post(
        "/auth/login-customer",
        requestBody,
        {
          // This will ensure axios does NOT reject on non-2xx status codes
          validateStatus: () => true, // Always return true so axios doesn't throw on errors
        }
      );

      // Now you can safely access the EC field
      const { EC, EM, data } = response.data; // Access EC, EM, and data
      console.log("response.data", response.data);
      if (EC === 0) {
        // Success, decode the JWT token (assuming 'data.access_token' contains the JWT)
        const userData = decodeJWT(data.access_token); // Decode JWT to get user data

        // Dispatch the action to save the user data to AsyncStorage and Redux store
        console.log("🔐 Login success - saving user data:", userData);
        const responseCartItem =     await axiosInstance.get(
          `/customers/cart-items/${userData.id}`,
         
          {
            // This will ensure axios does NOT reject on non-2xx status codes
            validateStatus: () => true, // Always return true so axios doesn't throw on errors
          }
        );
        try {
          // Wait for the save operations to complete before navigating
          await dispatch(
            saveTokenToAsyncStorage({
              accessToken: data.access_token, // Saving the actual access token
              app_preferences: userData.app_preferences || {}, // Fallback to empty object if not present
              email: userData.email || "", // Default to empty string if email is missing
              first_name: userData.first_name || "", // Default to empty string if email is missing
              last_name: userData.last_name || "", // Default to empty string if email is missing
              phone: userData.phone || "", // Add the missing phone property
              preferred_category: userData.preferred_category || [], // Ensure this is an array
              favorite_items: userData.favorite_items || [], // Ensure this is an array
              avatar: userData.avatar || null, // Use null if no avatar data is available
              support_tickets: userData.support_tickets || [], // Ensure this is an array
              user_id: userData.user_id || "", // Default to empty string if not present
              user_type: userData.user_type || [], // Ensure this is an array
              address: userData.address || [],
              id: userData.id || "",
              fWallet_id: userData.fWallet_id || "",
              fWallet_balance: parseFloat(userData.fWallet_balance) || 0,
              // cart_items: userData.cart_items || [],
            })
          );
          
          await dispatch(saveFavoriteRestaurantsToAsyncStorage());
          await dispatch(saveCartItemsToAsyncStorage(responseCartItem.data.data));

          console.log("💾 All user data saved successfully, navigating...");
          
          navigation.reset({
            index: 0,
            routes: [{ name: "MainStack" }],
          });
        } catch (error) {
          console.error("❌ Error saving user data:", error);
        }
        
        setIsLoading(false);
      } else {
        setIsLoading(false);
        // Handle error based on EC (optional)
        setError(EM); // Show error message if EC is non-zero
      }
    } catch (error) {
      setIsLoading(false);
      console.error("Login failed:", error);

      setError("An unexpected error occurred during login."); // Provide a generic error message if the request fails
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
          error={error}
          isSignUp={false}
          onSubmit={handleLoginSubmit}
          navigation={navigation}
        />
      </LinearGradient>
    </FFSafeAreaView>
  );
};

export default Login;
