// src/components/OrderCard.tsx
import React from "react";
import { Pressable, View } from "react-native";
import { OrderTracking } from "@/src/types/screens/Order";
import FFText from "@/src/components/FFText";
import FFSeperator from "@/src/components/FFSeperator";
import FFAvatar from "@/src/components/FFAvatar";
import FFButton from "@/src/components/FFButton";
import { formatTimestampToDate2 } from "@/src/utils/dateConverter";
import { IMAGE_LINKS } from "@/src/assets/imageLinks";
import FFView from "../../FFView";
import { colors, spacing } from "@/src/theme";

interface OrderCardProps {
  order: OrderTracking;
  onPress: () => void;
  onReOrder?: (order: OrderTracking) => void;
  isLoading?: boolean;
  type: "ACTIVE" | "COMPLETED" | "CANCELLED";
}

export const OrderCard: React.FC<OrderCardProps> = ({
  order,
  onPress,
  isLoading,
  type,
  onReOrder,
}) => {
  return (
    <FFView
      onPress={onPress}
      style={{ elevation: 3, padding: spacing.md, borderRadius: 12, gap: 12 }}
    >
      <View className="flex-row justify-between gap-2 items-center">
        <FFText fontSize="sm">
          {
          type === "CANCELLED" &&
          (order?.restaurant?.specialize_in?.[0] ?? "Japanese")}
        </FFText>
        <FFText
          style={{
            flex: 1,
            color: type === "COMPLETED" ? "#7dbf72" : colors.error,
          }}
          fontSize="sm"
        >
          {type === "COMPLETED" ? "Completed" : "Cancelled"}
        </FFText>
        <FFText style={{ color: "#aaa" }} fontSize="sm">
          {formatTimestampToDate2(Number(order.updated_at))}
        </FFText>
      </View>
      <FFSeperator />
      <View className="flex-row gap-2">
        <FFAvatar
          size={70}
          rounded="md"
          avatar={
            order.restaurant?.avatar?.url ?? IMAGE_LINKS.DEFAULT_AVATAR_FOOD
          }
        />
        <View className="flex-1">
          <FFText>{order.restaurant.restaurant_name}</FFText>
          <FFText fontSize="sm" style={{ color: "#aaa" }}>
            {`${order.restaurantAddress?.street}, ${order.restaurantAddress?.city}, ${order.restaurantAddress?.nationality}`}
          </FFText>
          <View className="flex-row gap-2 items-center mt-1">
            <FFText fontSize="sm" style={{ color: "#7dbf72" }}>
              ${Number(order.total_amount).toFixed(2)}
            </FFText>
            <FFText fontSize="sm" style={{ color: "#aaa" }}>
              {order.order_items?.length} items
            </FFText>
          </View>
        </View>
      </View>
      <View className="flex-row gap-2 flex-1">
        <FFButton variant="outline" className="w-full" style={{ flex: 1 }}>
          Rate
        </FFButton>
        <FFButton
          onPress={() => onReOrder && onReOrder(order)}
          className="w-full"
          style={{ flex: 1 }}
        >
          Re-Order
        </FFButton>
      </View>
    </FFView>
  );
};
