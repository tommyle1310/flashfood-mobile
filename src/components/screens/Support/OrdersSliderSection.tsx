import React from "react";
import { View, ScrollView, Image, Dimensions, Pressable } from "react-native";
import FFText from "@/src/components/FFText";
import { colors, spacing } from "@/src/theme";
import { OrderTracking } from "@/src/types/screens/Order";
import { IMAGE_LINKS } from "@/src/assets/imageLinks";
import FFAvatar from "../../FFAvatar";
import { formatTimestampToDate2 } from "@/src/utils/dateConverter";

const { width } = Dimensions.get("window");

export const OrdersSliderSection = ({
  orders,
  onSelectOrder,
  selectedOrderId,
}: {
  orders?: OrderTracking[];
  onSelectOrder: (orderId: string) => void;
  selectedOrderId?: string;
}) => {
  return (
    <View style={{ marginBottom: spacing.sm }}>
      <FFText style={{ marginBottom: spacing.sm, fontSize: 14 }}>
        Select an Order
        <FFText fontSize="sm" style={{ color: colors.info }}>
          {" "}
          (We only support the last 3 orders)
        </FFText>
      </FFText>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ width, paddingBottom: spacing.md }}
      >
        {orders?.slice(0, 3).map((order) => (
          <Pressable
            key={order.id}
            onPress={() => onSelectOrder(order.id)}
            style={{
              width: width - spacing.xxl * 2,
              marginRight: spacing.lg,
              backgroundColor:
                selectedOrderId === order.id ? colors.white : colors.lightGrey,
              borderRadius: 20,
              overflow: "hidden",
              elevation: 4,
              padding: spacing.md,
              borderWidth: selectedOrderId === order.id ? 2 : 0,
              borderColor: colors.primary,
            }}
          >
            <View style={{ flexDirection: "row", marginBottom: spacing.sm }}>
              <Image
                source={{
                  uri:
                    order.restaurant?.avatar?.url ??
                    IMAGE_LINKS?.DEFAULT_AVATAR_FOOD,
                }}
                style={{
                  width: 50,
                  height: 50,
                  borderRadius: 25,
                  marginRight: spacing.sm,
                }}
              />
              <View style={{ flex: 1 }}>
                <FFText style={{ fontWeight: "bold", fontSize: 16 }}>
                  {order.restaurant?.restaurant_name || "Restaurant"}
                </FFText>
                <FFText fontSize="sm" style={{ color: colors.grey }}>
                  Order placed at {formatTimestampToDate2(+order.order_time)}
                </FFText>
              </View>
            </View>

            <View
              style={{
                flexDirection: "row",
                marginBottom: spacing.sm,
                alignItems: "center",
              }}
            >
              {order.order_items?.slice(0, 2).map((item, index) => (
                <FFAvatar
                  key={index}
                  avatar={
                    item.menu_item?.avatar?.url ??
                    IMAGE_LINKS?.DEFAULT_AVATAR_FOOD
                  }
                  size={40}
                  style={{
                    borderRadius: 10,
                    marginRight: spacing.sm,
                  }}
                />
              ))}
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  gap: spacing.lg,
                }}
              >
                <FFText style={{ fontWeight: "bold" }}>
                  x{order.order_items?.length}
                </FFText>
                <FFText
                  colorDark={colors.primary}
                  colorLight={colors.primary}
                  style={{ fontWeight: "bold" }}
                >
                  ${parseFloat(order.total_amount).toFixed(2)}
                </FFText>
              </View>
              {order.order_items?.length > 2 && (
                <View
                  style={{
                    width: 60,
                    height: 60,
                    borderRadius: 10,
                    backgroundColor: "#f0f0f0",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <FFText>+{order.order_items.length - 2}</FFText>
                </View>
              )}
            </View>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
};

export default OrdersSliderSection;
