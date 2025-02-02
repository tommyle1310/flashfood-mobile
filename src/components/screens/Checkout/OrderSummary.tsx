import { View, Text, Pressable } from "react-native";
import React from "react";
import FFAvatar from "../../FFAvatar";
import FFText from "../../FFText";
import IconAntDesign from "react-native-vector-icons/AntDesign";
import { Order } from "@/src/types/Orders";

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
            <FFAvatar size={50} />
            <View className="flex-1">
              <FFText fontWeight="400" style={{ color: "#888" }}>
                {item.name}
              </FFText>
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center gap-2">
                  <FFText
                    fontWeight="400"
                    style={{ color: "#4d9c39", marginTop: 1 }}
                  >
                    ${item.price_at_time_of_order}
                  </FFText>
                  <IconAntDesign name="close" className="mt-1" />
                  <FFText
                    fontWeight="400"
                    style={{ color: "#4d9c39", marginTop: 1 }}
                  >
                    {item.quantity}
                  </FFText>
                </View>
                <FFText style={{ color: "#4d9c39", marginTop: 1 }}>
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
