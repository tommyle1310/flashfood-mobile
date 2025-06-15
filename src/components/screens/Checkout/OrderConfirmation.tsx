import { View, Text, TouchableOpacity } from "react-native";
import React from "react";
import FFText from "../../FFText";
import FFButton from "../../FFButton";
import { Order } from "@/src/types/Orders";
import { useSelector } from "@/src/store/types";
import { RootState } from "@/src/store/store";
import FFDropdown from "../../FFDropdown";
import { spacing } from "@/src/theme";
import FFInputControl from "../../FFInputControl";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { MainStackParamList } from "@/src/navigation/AppNavigator";

export type CheckoutSreenNavigationProp = StackNavigationProp<
  MainStackParamList,
  "Checkout"
>;

const OrderConfirmation = ({
  handlePlaceOrder,
  selected,
  handleSelect,
  customerNote,
  setCustomerNote,
}: {
  handlePlaceOrder: () => void;
  selected: string;
  handleSelect: (option: string) => void;
  customerNote: string;
  setCustomerNote: React.Dispatch<React.SetStateAction<string>>;
}) => {
  const globalState = useSelector((state: RootState) => state.auth);
  const navigation = useNavigation<CheckoutSreenNavigationProp>();

  return (
    <View className="flex-1 gap-4">
      <View className="flex-1" style={{ gap: spacing.md }}>
        <View style={{ gap: spacing.sm }}>
          <FFText fontWeight="500">Deliver to</FFText>
          <FFDropdown
            onSelect={handleSelect}
            navigation={navigation}
            options={[
              "Add Address",
              ...(globalState.address?.map((item) => item.title) || []),
            ]}
            placeholder="Select delivery destination"
            selectedOption={selected}
          />
        </View>
        <View style={{ gap: spacing.sm }}>
          <FFInputControl
            label="Note to restaurant"
            value={customerNote}
            setValue={setCustomerNote}
            placeholder="No Cheese please"
          />
        </View>
      </View>
      <FFButton onPress={handlePlaceOrder} className="w-full">
        Place Order
      </FFButton>
    </View>
  );
};

export default OrderConfirmation;
