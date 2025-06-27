import { View, Pressable, ScrollView } from "react-native";
import React, { useEffect, useState } from "react";
import FFAvatar from "../../FFAvatar";
import FFText from "../../FFText";
import { Order } from "@/src/types/Orders";
import IconIonicons from "react-native-vector-icons/Ionicons";
import { Promotion } from "@/src/types/Promotion";
import FFDropdown from "../../FFDropdown";
import { spacing } from "@/src/theme";

const OrderSummary = ({
  orderItem,
  setTotalAmountParent,
  serviceFee,
  deliveryFee,
  promotionList,
  handleSelectPromotion,
  selectedPromotion,
  totalAmountActual,
}: {
  orderItem: Order;
  setTotalAmountParent: React.Dispatch<React.SetStateAction<number>>;
  deliveryFee: number;
  serviceFee: number;
  selectedPromotion: string;
  promotionList?: Promotion[];
  handleSelectPromotion: (option: string) => void;
  totalAmountActual: number; // Prop mới
}) => {
  const [subTotal, setSubTotal] = useState<number>(0);
  const [promotionSubtractValue, setPromotionSubtractValue] =
    useState<number>(0);
  const [voucherSubtractValue, setVoucherSubtractValue] = useState<number>(0);

  useEffect(() => {
    const calculatedSubTotal = orderItem.order_items.reduce((total, item) => {
      return (
        total +
        ((item?.price_at_time_of_order as number) ?? 0) * (item?.quantity ?? 1)
      );
    }, 0);
    setSubTotal(calculatedSubTotal);
    setTotalAmountParent(calculatedSubTotal); // Chỉ set subTotal
  }, [orderItem, setTotalAmountParent]);
  return (
    <View className="flex-1">
      <View
        style={{
          // height: "60%",
          padding: spacing.md,
          borderRadius: 8,
        }}
      >
        <ScrollView>
          {orderItem.order_items.map((item, index) => {
            return (
              <Pressable
                className="flex-row items-center gap-2 mb-2"
                onPress={() => {}}
                key={item.variant_id}
              >
                <View className="relative rounded-full">
                  <FFAvatar
                    rounded="sm"
                    size={50}
                    avatar={item?.item?.avatar?.url}
                  />
                  <FFText
                    style={{
                      position: "absolute",
                      top: 0,
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
                    {item?.item?.name}
                  </FFText>
                  <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center gap-1">
                      <FFText fontWeight="400" fontSize="sm">
                        {item.variant_name}
                      </FFText>
                    </View>
                    <FFText colorLight="#111" style={{ marginTop: 1 }}>
                      ${item.price_at_time_of_order}
                    </FFText>
                  </View>
                </View>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>
      <View
        style={{
          borderTopWidth: 1,
          gap: 8,
          borderTopColor: "#ccc",
          paddingVertical: 8,
        }}
      >
        <FFDropdown
          onSelect={handleSelectPromotion}
          options={
            promotionList?.map((item) => ({
              label: item.name,
              value: item.id,
              description: item.description,
              imageUrl: item?.avatar?.url,
            })) ?? []
          }
          placeholder="Select a promotion"
          fallbackText="No promotions available"
          selectedOption={selectedPromotion}
        />
        <View className="flex-row justify-between items-center">
          <FFText style={{ color: "#aaa" }} fontWeight="400">
            Subtotal
          </FFText>
          <FFText fontWeight="500">${subTotal.toFixed(2)}</FFText>
        </View>
        {/* <View className="flex-row justify-between items-center">
          <FFText style={{ color: "#aaa" }} fontWeight="400">
            Promotion
          </FFText>
          <FFText fontWeight="500">
            -${promotionSubtractValue.toFixed(2)}
          </FFText>
        </View> */}
        <View className="flex-row justify-between items-center">
          <FFText style={{ color: "#aaa" }} fontWeight="400">
            Voucher Discount
          </FFText>
          <FFText fontWeight="500">-${voucherSubtractValue.toFixed(2)}</FFText>
        </View>
        <View className="flex-row justify-between items-center">
          <FFText style={{ color: "#aaa" }} fontWeight="400">
            Delivery Fee
          </FFText>
          <FFText fontWeight="500">${deliveryFee.toFixed(2)}</FFText>
        </View>
        <View className="flex-row justify-between items-center">
          <FFText style={{ color: "#aaa" }} fontWeight="400">
            Service Fee
          </FFText>
          <FFText fontWeight="500">${serviceFee.toFixed(2)}</FFText>
        </View>
        <View className="flex-row justify-between items-center my-2">
          <FFText style={{ color: "#aaa" }} fontSize="lg" fontWeight="400">
            Total Amount
          </FFText>
          <FFText fontSize="lg" colorLight="#4d9c39" colorDark="#4c9f3a">
            ${totalAmountActual.toFixed(2)}
          </FFText>
        </View>
      </View>
    </View>
  );
};

export default OrderSummary;
