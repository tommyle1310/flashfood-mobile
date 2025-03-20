import { View } from "react-native";
import React, { useState } from "react";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import FFTab from "@/src/components/FFTab";
import FFSafeAreaView from "@/src/components/FFSafeAreaView";
import OrderSummary from "@/src/components/screens/Checkout/OrderSummary";
import OrderConfirmation from "@/src/components/screens/Checkout/OrderConfirmation";
import PaymentInformation from "@/src/components/screens/Checkout/PaymentInformation";
import { useDispatch, useSelector } from "@/src/store/types";
import { RootState } from "@/src/store/store";
import { DELIVERY_FEE, SERVICE_FEE } from "@/src/utils/constants";
import FFModal from "@/src/components/FFModal";
import axiosInstance from "@/src/utils/axiosConfig";
import ModalStatusCheckout from "@/src/components/screens/Checkout/ModalStatusCheckout";
import { MainStackParamList } from "@/src/navigation/AppNavigator";
import FFScreenTopSection from "@/src/components/FFScreenTopSection";
import { StackNavigationProp } from "@react-navigation/stack";
import {
  removeCartItemFromAsyncStorage,
  saveCartItemsToAsyncStorage,
  subtractItemFromCart,
} from "@/src/store/userPreferenceSlice";
import Spinner from "@/src/components/FFSpinner";

type CheckoutRouteProps = RouteProp<MainStackParamList, "Checkout">;
type CheckoutScreenNavigationProp = StackNavigationProp<
  MainStackParamList,
  "Checkout"
>;
const CheckoutScreen = () => {
  const dispatch = useDispatch();
  const route = useRoute<CheckoutRouteProps>();
  const { orderItem } = route.params;
  const [isShowModalStatusCheckout, setIsShowModalStatusCheckout] =
    useState<boolean>(false);
  const [modalContentType, setModalContentType] = useState<
    "SUCCESS" | "ERROR" | "WARNING"
  >("ERROR"); // Default can be "SUCCESS"
  const navigation = useNavigation<CheckoutScreenNavigationProp>();
  const [deliveryFee, setDeliveryFee] = useState<number>(DELIVERY_FEE);
  const [serviceFee, setServiceFee] = useState<number>(SERVICE_FEE);
  const [totalAmount, setTotalAmount] = useState<number>(0);
  const globalState = useSelector((state: RootState) => state.auth);
  const [selectedPaymentMethod, setSelectedPaymentMethod] =
    useState<string>("");
  const [selectedAddress, setSelectedAddress] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleSelectPaymentMethod = (option: string) => {
    setSelectedPaymentMethod(option);
  };

  const handleSelectAddress = (option: string) => {
    setSelectedAddress(option);
  };

  const handlePlaceOrder = async () => {
    if (!selectedPaymentMethod || !selectedAddress) {
      setIsShowModalStatusCheckout(true);
      setModalContentType("ERROR");
      return;
    }
    console.log("check res location", orderItem?.restaurant_location);
    const requestData = {
      ...orderItem,
      restaurant_location: orderItem?.restaurant_location,
      payment_method: selectedPaymentMethod,
      customer_location: globalState?.address?.find(
        (item) => item.title === selectedAddress
      )?.id,
      total_amount: totalAmount,
      service_fee: serviceFee,
      delivery_fee: deliveryFee,
      order_items: orderItem.order_items.map((item) => ({
        item_id: item.item.id,
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
    const { EC, EM, data } = response.data;
    if (EC === 0) {
      setIsLoading(true);
      dispatch(subtractItemFromCart(response.data.data.order_items));
      dispatch(removeCartItemFromAsyncStorage(response.data.data.order_items));
      setIsLoading(false);
      setIsShowModalStatusCheckout(true);
      setModalContentType("SUCCESS");
      navigation.navigate("BottomTabs", { screenIndex: 1 });
    } else {
      setIsShowModalStatusCheckout(true);
      setModalContentType("ERROR");
      console.log("cehck", response.data);
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
  if (isLoading) {
    return <Spinner isVisible isOverlay />;
  }
  return (
    <FFSafeAreaView>
      <FFScreenTopSection title="Check Out" navigation={navigation} />
      <View className="flex-1 p-4">
        <FFTab
          tabTitles={[
            "Order Summary",
            "Payment Information",
            "Order Confirmation",
          ]}
          tabContent={tabContent}
        />
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
