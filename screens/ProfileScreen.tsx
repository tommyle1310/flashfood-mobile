import { View,  } from "react-native";
import React from "react";
import FFSafeAreaView from "@/components/FFSafeAreaView";
import FFText from "@/components/FFText";

const ProfileScreen = () => {
  return (
    <FFSafeAreaView>
      <View className="flex flex-row gap-4 p-4 flex-1">
        <FFText>profile</FFText>
      </View>
    </FFSafeAreaView>
)
};

export default ProfileScreen;
