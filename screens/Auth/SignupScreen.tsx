// screens/Signup.tsx
import React from "react";
import FFSafeAreaView from "@/components/FFSafeAreaView";
import { useNavigation } from "@react-navigation/native";
import FFAuthForm from "./FFAuthForm";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "@/app/_layout"; // Make sure you have this path correct
import { LinearGradient } from "expo-linear-gradient";

type SignupScreenNavigationProp = StackNavigationProp<RootStackParamList, "Signup">;

const Signup = () => {
  const navigation = useNavigation<SignupScreenNavigationProp>();

  const handleSignupSubmit = (email: string, password: string) => {
    // Your signup logic here
    console.log("Signing up with", email, password);
    // After signup, navigate to login or home
    navigation.navigate("Login");
  };

  return (
    <FFSafeAreaView>
      <LinearGradient
        colors={["#8fa3d9", "#b5b3a1", "#b5e1a1"]}
        start={[1, 0]}
        end={[0, 1]}
        className="flex-1 items-center justify-center"
      >
        <FFAuthForm isSignUp={true} onSubmit={handleSignupSubmit} navigation={navigation} />
      </LinearGradient>
    </FFSafeAreaView>
  );
};

export default Signup;
