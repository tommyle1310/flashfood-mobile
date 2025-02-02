import { View, Text, Pressable, TouchableOpacity } from "react-native";
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
import FFButton from "@/src/components/FFButton";
import OrderConfirmation from "@/src/components/screens/Checkout/OrderConfirmation";
import PaymentInformation from "@/src/components/screens/Checkout/PaymentInformation";
import { useSelector } from "@/src/store/types";
import { RootState } from "@/src/store/store";
import { DELIVERY_FEE, SERVICE_FEE } from "@/src/utils/constants";
import FFModal from "@/src/components/FFModal";
import axiosInstance from "@/src/utils/axiosConfig";
import ModalStatusCheckout from "@/src/components/screens/Checkout/ModalStatusCheckout";

type CheckoutRouteProps = RouteProp<HomeStackParamList, "Checkout">;

const CheckoutScreen = () => {
  const route = useRoute<CheckoutRouteProps>();
  const { orderItem } = route.params;
  const [isShowModalStatusCheckout, setIsShowModalStatusCheckout] =
    useState<boolean>(false);
  const [modalContentType, setModalContentType] = useState<
    "SUCCESS" | "ERROR" | "WARNING"
  >("ERROR"); // Default can be "SUCCESS"

  const [deliveryFee, setDeliveryFee] = useState<number>(DELIVERY_FEE);
  const [serviceFee, setServiceFee] = useState<number>(SERVICE_FEE);
  const [totalAmount, setTotalAmount] = useState<number>(0);
  const globalState = useSelector((state: RootState) => state.auth);
  const [selectedPaymentMethod, setSelectedPaymentMethod] =
    useState<string>("");
  const [selectedAddress, setSelectedAddress] = useState<string>("");

  const handleSelectPaymentMethod = (option: string) => {
    setSelectedPaymentMethod(option);
  };

  const handleSelectAddress = (option: string) => {
    setSelectedAddress(option);
  };

  const handlePlaceOrder = async () => {
    if (!selectedPaymentMethod || !globalState?.address?.[0]._id) {
      setIsShowModalStatusCheckout(true);
      setModalContentType("ERROR");
      return;
    }
    const requestData = {
      ...orderItem,
      payment_method: selectedPaymentMethod,
      customer_location: globalState?.address?.[0]._id,
      total_amount: totalAmount,
      service_fee: serviceFee,
      delivery_fee: deliveryFee,
      order_items: orderItem.order_items.map((item) => ({
        item_id: item.item._id,
        variant_id: item.variant_id,
        name: item.name,
        price_at_time_of_order: item.price_at_time_of_order,
        quantity: item.quantity,
      })),
      payment_status: "PENDING",
      delivery_time: new Date().getTime(),
    };
    const response = await axiosInstance.post(`/orders`, requestData, {
      // This will ensure axios does NOT reject on non-2xx status codes
      validateStatus: () => true, // Always return true so axios doesn't throw on errors
    });
    console.log("cehck", response.data);

    const { EC, EM, data } = response.data;
    if (EC === 0) {
      setIsShowModalStatusCheckout(true);
      setModalContentType("SUCCESS");
    }
  };

  const tabContent = [
    <OrderSummary
      orderItem={orderItem}
      deliveryFee={deliveryFee}
      serviceFee={serviceFee}
      setTotalAmountParent={setTotalAmount}
    />,
    <PaymentInformation
      selected={selectedPaymentMethod}
      handleSelect={handleSelectPaymentMethod}
    />,
    <OrderConfirmation
      handlePlaceOrder={handlePlaceOrder}
      handleSelect={handleSelectAddress}
      selected={selectedAddress}
    />,
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
      <FFModal
        visible={isShowModalStatusCheckout}
        onClose={() => setIsShowModalStatusCheckout(false)}
      >
        <ModalStatusCheckout modalContentType={modalContentType} />
      </FFModal>
    </FFSafeAreaView>
  );
};

export default CheckoutScreen;
