import { View, Pressable, ScrollView } from "react-native";
import React, { useEffect, useState } from "react";
import FFAvatar from "../../FFAvatar";
import FFText from "../../FFText";
import { Order } from "@/src/types/Orders";
import IconIonicons from "react-native-vector-icons/Ionicons";
import { Voucher } from "@/src/types/Promotion";
import FFDropdown from "../../FFDropdown";
import { spacing } from "@/src/theme";

const OrderSummary = ({
  orderItem,
  setTotalAmountParent,
  serviceFee,
  deliveryFee,
  voucherList,
  handleSelectVoucher,
  selectedVoucher,
  totalAmountActual,
  voucherDiscount,
}: {
  orderItem: Order;
  setTotalAmountParent: React.Dispatch<React.SetStateAction<number>>;
  deliveryFee: number;
  serviceFee: number;
  selectedVoucher: string;
  voucherList?: Voucher[];
  handleSelectVoucher: (option: string) => void;
  totalAmountActual: number;
  voucherDiscount: number;
}) => {
  const [subTotal, setSubTotal] = useState<number>(0);

  // Get selected voucher data
  const getSelectedVoucherData = () => {
    if (!selectedVoucher || !voucherList) return null;
    return voucherList.find(v => v.id === selectedVoucher) || null;
  };

  useEffect(() => {
    const calculatedSubTotal = orderItem.order_items.reduce((total, item) => {
      return (
        total +
        ((item?.price_at_time_of_order as number) ?? 0) * (item?.quantity ?? 1)
      );
    }, 0);
    setSubTotal(calculatedSubTotal);
    setTotalAmountParent(calculatedSubTotal);
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
          onSelect={handleSelectVoucher}
          options={
            voucherList?.map((item) => ({
              label: item.name,
              value: item.id,
              description: item.description,
              imageUrl: item?.avatar?.url || undefined,
            })) ?? []
          }
          placeholder="Select a voucher"
          fallbackText="No vouchers available"
          selectedOption={selectedVoucher}
        />
        <View className="flex-row justify-between items-center">
          <FFText style={{ color: "#aaa" }} fontWeight="400">
            Subtotal
          </FFText>
          <FFText fontWeight="500">${subTotal.toFixed(2)}</FFText>
        </View>
        <View className="flex-row justify-between items-center">
          <FFText style={{ color: "#aaa" }} fontWeight="400">
            Delivery Fee
          </FFText>
          <FFText 
            fontWeight="500"
            style={{
              textDecorationLine: getSelectedVoucherData()?.voucher_type === 'FREESHIP' ? 'line-through' : 'none',
              color: getSelectedVoucherData()?.voucher_type === 'FREESHIP' ? '#aaa' : '#000'
            }}
          >
            ${deliveryFee.toFixed(2)}
          </FFText>
        </View>
        <View className="flex-row justify-between items-center">
          <FFText style={{ color: "#aaa" }} fontWeight="400">
            Service Fee
          </FFText>
          <FFText fontWeight="500">${serviceFee.toFixed(2)}</FFText>
        </View>
        
        {/* Display voucher discount row based on voucher type */}
        {selectedVoucher && getSelectedVoucherData() && (
          <View className="flex-row justify-between items-center">
            <FFText style={{ color: "#16a34a" }} fontWeight="400">
              {getSelectedVoucherData()?.voucher_type === 'FREESHIP' 
                ? 'Free Delivery Discount'
                : getSelectedVoucherData()?.voucher_type === 'PERCENTAGE'
                ? `${getSelectedVoucherData()?.name} (${getSelectedVoucherData()?.discount_value}%)`
                : `${getSelectedVoucherData()?.name}`
              }
            </FFText>
                         <FFText fontWeight="500" style={{ color: "#16a34a" }}>
               -${voucherDiscount.toFixed(2)}
             </FFText>
          </View>
        )}

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
