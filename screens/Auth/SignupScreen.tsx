// screens/Signup.tsx
import React, { useState } from "react";
import FFSafeAreaView from "@/src/components/FFSafeAreaView";
import { useNavigation } from "@react-navigation/native";
import FFAuthForm from "./FFAuthForm";
import { StackNavigationProp } from "@react-navigation/stack";
import { LinearGradient } from "expo-linear-gradient";
import { RootStackParamList } from "@/src/navigation/AppNavigator";
import axiosInstance from "@/src/utils/axiosConfig";
import { useDispatch } from "@/src/store/types";
import { setAuthState } from "@/src/store/authSlice";

type SignupScreenNavigationProp = StackNavigationProp<RootStackParamList, "Signup">;

const Signup = () => {
  const navigation = useNavigation<SignupScreenNavigationProp>();
  const dispatch = useDispatch()
    const [error, setError] = useState('')
  

  const handleSignupSubmit = async (email: string, password: string) => {
    // Request body
    const requestBody = {
      email: email,
      password: password,
    };

    // Make the POST request
    const response = await axiosInstance.post("/auth/register-customer", requestBody, {
      // This will ensure axios does NOT reject on non-2xx status codes
      validateStatus: () => true, // Always return true so axios doesn't throw on errors
    });

    // Now you can safely access the EC field
    const { EC, EM } = response.data; // Access EC directly

    console.log("Response from API:", EC, response.data);

    if (EC === 0) {
      // Success
      const fakeAccessToken = "fake-token-123"; // Replace with real token from response
      dispatch(setAuthState({ accessToken: fakeAccessToken }));

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
        <FFAuthForm isSignUp={true} onSubmit={handleSignupSubmit} navigation={navigation} error={error}/>
      </LinearGradient>
    </FFSafeAreaView>
  );
};

export default Signup;
