import { View,  } from "react-native";
import React from "react";
import FFSafeAreaView from "@/src/components/FFSafeAreaView";
import FFText from "@/src/components/FFText";
import FFToggle from "@/src/components/FFToggle";
import FFButton from "@/src/components/FFButton";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "@/src/navigation/AppNavigator";

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
