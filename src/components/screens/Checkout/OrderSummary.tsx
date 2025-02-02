import { View, Text, Pressable } from "react-native";
import React from "react";
import FFAvatar from "../../FFAvatar";
import FFText from "../../FFText";
import IconAntDesign from "react-native-vector-icons/AntDesign";
import { Order } from "@/src/types/Orders";
import FFBadge from "../../FFBadge";

const OrderSummary = ({ orderItem }: { orderItem: Order }) => {
  return (
    <View className="flex-1">
      {orderItem.order_items.map((item, index) => {
        return (
          <Pressable
            className="flex-row items-center gap-2 mb-2"
            onPress={() => {}}
            key={item.variant_id}
          >
            <View className="relative bg-red-300">
              <FFAvatar rounded="sm" size={50} avatar={item.item.avatar.url} />
              <FFText
                style={{
                  position: "absolute",
                  top: -4,
                  right: -6,
                  paddingHorizontal: 4,
                  borderRadius: 9999,
                  backgroundColor: "red",
                  color: "#fff",
                  justifyContent: "center",
                  alignItems: "center",
                }}
                fontSize="sm"
              >
                {item.quantity}
              </FFText>
            </View>
            <View className="flex-1">
              <FFText style={{ color: "#4d9c39", marginTop: 1 }}>
                {item.item.name}
              </FFText>
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center gap-1">
                  <FFText fontWeight="400" fontSize="sm">
                    {item.name}
                  </FFText>
                </View>
                <FFText style={{ color: "#111", marginTop: 1 }}>
                  ${item.price_at_time_of_order}
                </FFText>
              </View>
            </View>
          </Pressable>
        );
      })}
    </View>
  );
};

export default OrderSummary;
