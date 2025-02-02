import { View, Text, Pressable } from "react-native";
import React, { useState } from "react";
import { RouteProp, useRoute } from "@react-navigation/native";
import { HomeStackParamList } from "@/src/navigation/AppNavigator";
import FFTab from "@/src/components/FFTab";
import FFText from "@/src/components/FFText";
import FFSafeAreaView from "@/src/components/FFSafeAreaView";
import FFAvatar from "@/src/components/FFAvatar";
import IconAntDesign from "react-native-vector-icons/AntDesign";
import OrderSummary from "@/src/components/screens/Checkout/OrderSummary";
import FFDropdown from "@/src/components/FFDropdown";

type CheckoutRouteProps = RouteProp<HomeStackParamList, "Checkout">;

const CheckoutScreen = () => {
  const [selected, setSelected] = useState<string>("");

  const handleSelect = (option: string) => {
    setSelected(option);
  };

  const route = useRoute<CheckoutRouteProps>();

  const { orderItem } = route.params;
  console.log("cehck haha ", orderItem.order_items[0].item.avatar.url);
  const tabContent = [
    <OrderSummary orderItem={orderItem} />,
    <View className="flex-1 gap-4">
      <View>
        <FFText fontSize="sm">Payment Method</FFText>
        <FFDropdown
          options={["Option 1", "Option 2", "Option 3"]}
          selectedOption={selected}
          onSelect={handleSelect}
          placeholder="Select an option"
        />
      </View>
    </View>,
    <FFText>c</FFText>,
  ];

  return (
    <FFSafeAreaView>
      <View className="flex-1 p-4">
        <View className="flex-1 ">
          <FFTab
            tabTitles={[
              "Order Summary",
              "Payment Information",
              "Order Confirmation",
            ]}
            tabContent={tabContent}
          />
        </View>
      </View>
    </FFSafeAreaView>
  );
};

export default CheckoutScreen;
