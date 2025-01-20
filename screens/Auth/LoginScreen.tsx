// screens/Login.tsx
import React from "react";
import FFSafeAreaView from "@/components/FFSafeAreaView";
import { useNavigation } from "@react-navigation/native";
import FFAuthForm from "./FFAuthForm";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "@/navigation/AppNavigator"; // Make sure you have this path correct
import { LinearGradient } from "expo-linear-gradient";

type LoginScreenNavigationProp = StackNavigationProp<RootStackParamList, "Login">;

const Login = () => {
  const navigation = useNavigation<LoginScreenNavigationProp>();

  const handleLoginSubmit = (email: string, password: string) => {
    // Your login logic here
    console.log("Logging in with", email, password);
    // Navigate to home or other screen after successful login
    navigation.navigate("Home");
  };

  return (
    <FFSafeAreaView>
      <LinearGradient
        colors={["#8fa3d9", "#b5b3a1", "#b5e1a1"]}
        start={[1, 0]}
        end={[0, 1]}
        className="flex-1 items-center justify-center"
      >
        <FFAuthForm isSignUp={false} onSubmit={handleLoginSubmit} navigation={navigation} />
      </LinearGradient>
    </FFSafeAreaView>
  );
};

export default Login;
