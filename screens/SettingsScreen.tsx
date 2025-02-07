import { Pressable, View } from "react-native";
import React from "react";
import FFSafeAreaView from "@/src/components/FFSafeAreaView";
import FFText from "@/src/components/FFText";
import FFToggle from "@/src/components/FFToggle";
import FFButton from "@/src/components/FFButton";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "@/src/navigation/AppNavigator";
import { useDispatch, useSelector } from "@/src/store/types";
import { logout } from "@/src/store/authSlice";
import IconIonicons from "react-native-vector-icons/Ionicons";
import { LinearGradient } from "expo-linear-gradient";
import FFAvatar from "@/src/components/FFAvatar";
import { Data_screen_Setting } from "@/src/data/screens/Settings";
import { RootState } from "@/src/store/store";

type LogoutSreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  "MainStack"
>;

const SettingsScreen = () => {
  const navigation = useNavigation<LogoutSreenNavigationProp>();
  const dispatch = useDispatch();
  const { user_id, address, avatar } = useSelector(
    (state: RootState) => state.auth
  );

  return (
    <FFSafeAreaView>
      <LinearGradient
        colors={["#63c550", "#a3d98f"]} // Always use a gradient
        start={[0, 0]}
        end={[1, 0]}
        style={{
          paddingHorizontal: 12,
          paddingVertical: 24,
          borderBottomLeftRadius: 16, // Apply borderRadius directly on the LinearGradient
          borderBottomRightRadius: 16, // Apply borderRadius directly on the LinearGradient
          height: 160,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 3,
          elevation: 5,
        }}
      >
        <View className="flex-row items-center gap-1">
          <IconIonicons name="settings" color={"#fff"} size={24} />
          <FFText style={{ color: "#fff", fontSize: 24 }}>Settings</FFText>
        </View>
      </LinearGradient>
      <View className="relative w-full flex-1 -mb-20">
        <View
          className="absolute h-full rounded-t-2xl shadow-md flex-1 bg-white w-11/12 -top-20"
          style={{ left: "50%", transform: [{ translateX: "-50%" }] }}
        >
          <View className="flex-row items-center gap-4 p-4 border-b border-b-gray-200">
            <FFAvatar size={40} avatar={avatar?.url} />
            <FFText>Tommy Bua</FFText>
          </View>
          <View className="gap-4 p-4 border-b border-b-gray-200">
            <FFText fontWeight="400" style={{ color: "#aaa" }}>
              Account Settings
            </FFText>
            {Data_screen_Setting["Account Settings"].map((item) => (
              <Pressable
                key={item.title}
                className="flex-row items-center justify-between py-2"
              >
                <FFText>{item.title}</FFText>
                {item.rightIcon}
              </Pressable>
            ))}
          </View>
          <View className="gap-4 p-4 border-b-gray-200">
            <FFText fontWeight="400" style={{ color: "#aaa" }}>
              Account Settings
            </FFText>
            {Data_screen_Setting["More"].map((item) => (
              <Pressable
                key={item.title}
                className="flex-row items-center justify-between py-2"
              >
                <FFText>{item.title}</FFText>
                {item.rightIcon}
              </Pressable>
            ))}
            <FFButton
              onPress={() => {
                dispatch(logout());
                navigation.navigate("Login");
              }}
              className="w-full"
              variant="danger"
            >
              Log Out
            </FFButton>
          </View>
        </View>
      </View>
    </FFSafeAreaView>
  );
};

export default SettingsScreen;
