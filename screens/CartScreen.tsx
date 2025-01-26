import { Text, View } from "react-native";
import React from "react";
import FFSafeAreaView from "@/src/components/FFSafeAreaView";
import FFText from "@/src/components/FFText";
import FFBadge from "@/src/components/FFBadge";
import { useSelector } from "@/src/store/types";
import { RootState } from "@/src/store/store";

const CartScreen = () => {
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated); // Get authentication state from Redux
  console.log('cehck authneciate', isAuthenticated);
  return (
    <FFSafeAreaView>
      <View className="flex gap-4 p-4 flex-1 ">
        <FFText>cart</FFText>
        {/* <View className="self-start"> */}

        <FFBadge
          title="In progress"
          backgroundColor="#e36abf"
          textColor="#fff"
          />
          {/* </View> */}
      </View>
    </FFSafeAreaView>
  );
};

export default CartScreen;
