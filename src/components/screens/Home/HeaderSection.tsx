import React from "react";
import { View, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { MainStackParamList } from "@/src/navigation/AppNavigator";
import IconAntDesign from "react-native-vector-icons/AntDesign";
import IconFeather from "react-native-vector-icons/Feather";
import FFAvatar from "@/src/components/FFAvatar";
import FFText from "@/src/components/FFText";
import { useSelector } from "@/src/store/types";
import { RootState } from "@/src/store/store";

type HomeRestaurantSreenNavigationProp = StackNavigationProp<
  MainStackParamList,
  "BottomTabs"
>;

export const HeaderSection = () => {
  const navigation = useNavigation<HomeRestaurantSreenNavigationProp>();
  const globalState = useSelector((state: RootState) => state.auth);

  return (
    <View className="flex-row justify-between items-center">
      <View className="flex-row items-center gap-2">
        <FFAvatar
          onPress={() => navigation.navigate("Profile")}
          avatar={globalState?.avatar?.url ?? ""}
          size={50}
        />
        <View>
          <FFText>{globalState?.email}</FFText>
          <FFText style={{ fontWeight: "400", fontSize: 12, color: "#bbb" }}>
            {globalState?.address?.find((item) => item.is_default)?.title}
          </FFText>
        </View>
      </View>
      <View className="flex-row items-center gap-2">
        <TouchableOpacity onPress={() => navigation.navigate("SupportCenter")}>
          <IconAntDesign size={20} name="questioncircleo" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate("Notifications")}>
          <IconFeather size={20} name="bell" />
        </TouchableOpacity>
      </View>
    </View>
  );
};
