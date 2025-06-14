import { View } from "react-native";
import React, { useEffect, useState } from "react";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import FFTab from "@/src/components/FFTab";
import FFSafeAreaView from "@/src/components/FFSafeAreaView";
import OrderSummary from "@/src/components/screens/Checkout/OrderSummary";
import OrderConfirmation from "@/src/components/screens/Checkout/OrderConfirmation";
import PaymentInformation from "@/src/components/screens/Checkout/PaymentInformation";
import { useDispatch, useSelector } from "@/src/store/types";
import { RootState } from "@/src/store/store";
import FFModal from "@/src/components/FFModal";
import axiosInstance from "@/src/utils/axiosConfig";
import ModalStatusCheckout from "@/src/components/screens/Checkout/ModalStatusCheckout";
import { MainStackParamList } from "@/src/navigation/AppNavigator";
import FFScreenTopSection from "@/src/components/FFScreenTopSection";
import { StackNavigationProp } from "@react-navigation/stack";
import {
  removeCartItemFromAsyncStorage,
  subtractItemFromCart,
} from "@/src/store/userPreferenceSlice";
import Spinner from "@/src/components/FFSpinner";
import { Promotion } from "@/src/types/Promotion";
import { DELIVERY_FEE } from "@/src/utils/constants";

type CheckoutRouteProps = RouteProp<MainStackParamList, "Checkout">;
type CheckoutScreenNavigationProp = StackNavigationProp<
  MainStackParamList,
  "Checkout"
>;

interface FinanceRules {
  app_service_fee: number;
  delivery_fee?: number;
}

const CheckoutScreen = () => {
  const dispatch = useDispatch();
  const route = useRoute<CheckoutRouteProps>();
  const { orderItem } = route.params;
  const [isShowModalStatusCheckout, setIsShowModalStatusCheckout] =
    useState<boolean>(false);
  const [modalContentType, setModalContentType] = useState<
    "SUCCESS" | "ERROR" | "WARNING" | "INSUFFICIENT_BALANCE"
  >("ERROR");
  const navigation = useNavigation<CheckoutScreenNavigationProp>();
  const [deliveryFee, setDeliveryFee] = useState<number>(0);
  const [serviceFee, setServiceFee] = useState<number>(0);
  const [subTotal, setSubTotal] = useState<number>(0);
  const [totalAmountActual, setTotalAmountActual] = useState<number>(0);
  const globalState = useSelector((state: RootState) => state.auth);
  const [selectedPaymentMethod, setSelectedPaymentMethod] =
    useState<string>("");
  const [selectedPromotion, setSelectedPromotion] = useState<string>("");
  const [selectedAddress, setSelectedAddress] = useState<string>("");
  const [customerNote, setCustomerNote] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [promotionList, setPromotionList] = useState<Promotion[]>([]);
  const [financeRules, setFinanceRules] = useState<FinanceRules | null>(null);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [restaurantResponse, financeRulesResponse] = await Promise.all([
        axiosInstance.get(`/restaurants/${orderItem.restaurant_id}`),
        axiosInstance.get("/finance-rules"),
      ]);

      // Log API responses for debugging
      console.log(
        "Finance rules response:",
        JSON.stringify(financeRulesResponse.data)
      );

      // Process restaurant response
      const restaurantData = restaurantResponse.data;
      if (restaurantData.EC === 0) {
        setPromotionList(
          restaurantData?.data?.promotions?.filter(
            (item: any) => !(item.food_categories?.length > 0)
          ) || []
        );
      } else {
        console.error("Restaurant API error:", restaurantData.EM);
      }

      // Process finance rules response
      const { EC, EM, data } = financeRulesResponse.data;
      if (EC === 0 && data && data[0]) {
        setFinanceRules(data[0]);
        const deliveryFeeValue = data[0].delivery_fee ?? DELIVERY_FEE ?? 0;
        setDeliveryFee(deliveryFeeValue);
        console.log(
          "Set financeRules:",
          data[0],
          "Delivery fee:",
          deliveryFeeValue
        );
      } else {
        console.error("Finance rules API error:", EM, "Data:", data);
        setFinanceRules(null);
        setDeliveryFee(0);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      setFinanceRules(null);
      setDeliveryFee(0);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (orderItem.restaurant_id) {
      fetchData();
    }
  }, [orderItem]);

  // Calculate serviceFee and totalAmountActual
  useEffect(() => {
    if (financeRules && subTotal > 0) {
      const calculatedServiceFee = Number(
        (financeRules.app_service_fee * subTotal).toFixed(2)
      );
      const calculatedTotal = Number(
        (subTotal + calculatedServiceFee + deliveryFee).toFixed(2)
      );
      setServiceFee(calculatedServiceFee);
      setTotalAmountActual(calculatedTotal);
    } else {
      setServiceFee(0);
      setTotalAmountActual(0);
    }
  }, [subTotal, financeRules, deliveryFee]);

  const handleSelectPaymentMethod = (option: string) => {
    setSelectedPaymentMethod(option);
  };

  const handleSelectAddress = (option: string) => {
    setSelectedAddress(option);
  };

  const handleSelectPromotion = (option: string) => {
    setSelectedPromotion(option);
  };

  const handlePlaceOrder = async () => {
    setIsLoading(true);
    if (!selectedPaymentMethod || !selectedAddress) {
      setIsShowModalStatusCheckout(true);
      setModalContentType("ERROR");
      setIsLoading(false);
      return;
    }

    const requestData = {
      ...orderItem,
      restaurant_location:
        orderItem.order_items?.[0]?.item?.restaurantDetails?.address_id,
      payment_method: selectedPaymentMethod,
      customer_note: customerNote,
      customer_location: globalState?.address?.find(
        (item) => item.title === selectedAddress
      )?.id,
      total_amount: totalAmountActual,
      service_fee: serviceFee,
      delivery_fee: deliveryFee,
      order_items: orderItem.order_items.map((item) => ({
        item_id: item?.item?.id,
        variant_id: item.variant_id,
        name: item.name,
        price_at_time_of_order: item.price_at_time_of_order,
        quantity: item.quantity,
      })),
      restaurant_id: orderItem.order_items?.[0]?.item?.restaurantDetails?.id,
      status: "PENDING",
      payment_status: "PENDING",
      delivery_time: new Date().getTime(),
      promotion_applied: selectedPromotion,
    };

    try {
      const response = await axiosInstance.post(`/orders`, requestData, {
        validateStatus: () => true,
      });
      console.log("check whar req data", requestData);

      console.log("Order response:", JSON.stringify(response.data));
      const { EC, data } = response.data;
      if (EC === 0) {
        dispatch(subtractItemFromCart(data.order_items));
        dispatch(removeCartItemFromAsyncStorage(data.order_items));
        setIsShowModalStatusCheckout(true);
        setModalContentType("SUCCESS");
        navigation.navigate("BottomTabs", { screenIndex: 1 });
      } else if (EC === -8) {
        setIsShowModalStatusCheckout(true);
        setModalContentType("INSUFFICIENT_BALANCE");
        // console.error("Order API error: Insufficient Balance");
      } else {
        setIsShowModalStatusCheckout(true);
        setModalContentType("ERROR");
        console.error("Order API error:", response.data.EM);
      }
    } catch (error) {
      console.error("Error placing order:", error);
      setIsShowModalStatusCheckout(true);
      setModalContentType("ERROR");
    } finally {
      setIsLoading(false);
    }
  };

  const tabContent = [
    <OrderSummary
      key="orderSummary"
      orderItem={orderItem}
      deliveryFee={deliveryFee}
      serviceFee={serviceFee}
      setTotalAmountParent={setSubTotal}
      selectedPromotion={selectedPromotion}
      promotionList={promotionList}
      handleSelectPromotion={handleSelectPromotion}
      totalAmountActual={totalAmountActual}
    />,
    <PaymentInformation
      key="paymentInfo"
      selected={selectedPaymentMethod}
      handleSelect={handleSelectPaymentMethod}
    />,
    <OrderConfirmation
      key="orderConfirmation"
      handlePlaceOrder={handlePlaceOrder}
      handleSelect={handleSelectAddress}
      customerNote={customerNote}
      setCustomerNote={setCustomerNote}
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
