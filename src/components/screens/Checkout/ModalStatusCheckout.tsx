import { View, Text } from "react-native";
import React from "react";
import FFText from "../../FFText";
import FFButton from "../../FFButton";
import { spacing } from "@/src/theme";
import { StackNavigationProp } from "@react-navigation/stack";
import { MainStackParamList } from "@/src/navigation/AppNavigator";
import { useNavigation } from "@react-navigation/native";

export type CheckoutSreenNavigationProp = StackNavigationProp<
  MainStackParamList,
  "Checkout"
>;

const ModalStatusCheckout = ({
  modalContentType,
}: {
  modalContentType: "SUCCESS" | "ERROR" | "WARNING" | "INSUFFICIENT_BALANCE";
}) => {
  const navigation = useNavigation<CheckoutSreenNavigationProp>()
  switch (modalContentType) {
    case "SUCCESS":
      return <FFText>Success! Your order was completed.</FFText>;
    case "ERROR":
      return (
        <FFText fontSize="md" fontWeight="400" style={{ color: "#aaa" }}>
          Please fill all the required fields.☝️🤓
        </FFText>
      );
    case "WARNING":
      return <FFText>Warning! Please check the information.</FFText>;
    case "INSUFFICIENT_BALANCE":
      return (
      <View>
          <FFText fontSize="md" fontWeight="400" style={{ color: "#aaa" }}>
          Insufficient Balance. Please check your payment method.
        </FFText>
        <FFButton onPress={() => navigation.navigate('PaymentMethod')} style={{width: '100%', marginTop: spacing.md}}>Check My Wallet</FFButton>
      </View>
      );
    default:
      return <FFText>Loading...</FFText>;
  }
};

export default ModalStatusCheckout;