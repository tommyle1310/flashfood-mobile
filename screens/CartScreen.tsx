import { Text, View } from "react-native";
import React from "react";
import FFSafeAreaView from "@/components/FFSafeAreaView";
import FFText from "@/components/FFText";
import FFBadge from "@/components/FFBadge";

const CartScreen = () => {
  return (
    <FFSafeAreaView>
      <View className="flex gap-4 p-4 flex-1">
        <FFText>cart</FFText>
    <FFBadge title="In progress" backgroundColor="#e36abf" textColor="#fff"/>
      </View>
    </FFSafeAreaView>
  );
};

export default CartScreen;
