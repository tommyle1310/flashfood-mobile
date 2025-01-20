import { View,  } from "react-native";
import React from "react";
import FFSafeAreaView from "@/components/FFSafeAreaView";
import FFText from "@/components/FFText";
import FFToggle from "@/components/FFToggle";
import FFButton from "@/components/FFButton";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "@/navigation/AppNavigator";

type LogoutSreenNavigationProp = StackNavigationProp<RootStackParamList, "Home">;


const ProfileScreen = () => {
    const navigation = useNavigation<LogoutSreenNavigationProp>();
  
  return (
    <FFSafeAreaView>
      <View className="flex-col gap-4 p-4 flex-1 ">
        <FFText>profile</FFText>
          <FFToggle label="Switch Theme" initialChecked />
          <FFButton isLinear onPress={() => {navigation.navigate('Login')}}>Log Out</FFButton>

      </View>
    </FFSafeAreaView>
)
};

export default ProfileScreen;
