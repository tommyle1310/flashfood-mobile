import { View,  } from "react-native";
import React from "react";
import FFSafeAreaView from "@/components/FFSafeAreaView";
import FFText from "@/components/FFText";
import FFToggle from "@/components/FFToggle";

const ProfileScreen = () => {
  return (
    <FFSafeAreaView>
      <View className="flex-col gap-4 p-4 flex-1">
        <FFText>profile</FFText>
          <FFToggle label="Switch Theme" initialChecked />

      </View>
    </FFSafeAreaView>
)
};

export default ProfileScreen;
