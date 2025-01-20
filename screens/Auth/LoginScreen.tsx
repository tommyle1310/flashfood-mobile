// screens/Login.tsx
import React, { useEffect, useState } from "react";
import FFSafeAreaView from "@/src/components/FFSafeAreaView";
import { useNavigation } from "@react-navigation/native";
import FFAuthForm from "./FFAuthForm";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "@/src/navigation/AppNavigator"; // Make sure you have this path correct
import { LinearGradient } from "expo-linear-gradient";
import { useDispatch, useSelector } from "@/src/store/types";
import { loadTokenFromAsyncStorage, setAuthState } from "@/src/store/authSlice";
import axiosInstance from "@/src/utils/axiosConfig";
import { RootState } from "@/src/store/store";

type LoginScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  "Login"
>;

const Login = () => {
  const navigation = useNavigation<LoginScreenNavigationProp>();
  const dispatch = useDispatch();
  const [error, setError] = useState('')
  const handleLoginSubmit = async (email: string, password: string) => {
    // Request body
    const requestBody = {
      email: email,
      password: password,
    };

    // Make the POST request
    const response = await axiosInstance.post("/auth/login", requestBody, {
      // This will ensure axios does NOT reject on non-2xx status codes
      validateStatus: () => true, // Always return true so axios doesn't throw on errors
    });

    // Now you can safely access the EC field
    const { EC, EM } = response.data; // Access EC directly


    if (EC === 0) {
      // Success
      console.log('check', response.data.data.access_token)
      dispatch(setAuthState({ accessToken: response.data.data.access_token }));

      // Navigate to home or another screen
      navigation.navigate("Home");
    } else {
      // Handle error based on EC (optional)
      setError(EM)
    }
  };


  

  return (
    <FFSafeAreaView>
      <LinearGradient
        colors={["#8fa3d9", "#b5b3a1", "#b5e1a1"]}
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
