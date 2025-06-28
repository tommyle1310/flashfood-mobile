import { View, TouchableOpacity, ScrollView } from "react-native";
import React, { useEffect, useState } from "react";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
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
import { Promotion, Voucher } from "@/src/types/Promotion";
import { DELIVERY_FEE } from "@/src/utils/constants";
import FFText from "@/src/components/FFText";
import FFButton from "@/src/components/FFButton";
import { colors, spacing } from "@/src/theme";
import { useTheme } from "@/src/hooks/useTheme";
import IconIonicons from "react-native-vector-icons/Ionicons";
import FFToast from "@/src/components/FFToast";

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

  // New modal states for the improved UX
  const [isOrderSummaryModalVisible, setIsOrderSummaryModalVisible] =
    useState(false);
  const [isPaymentModalVisible, setIsPaymentModalVisible] = useState(false);
  const [isConfirmationModalVisible, setIsConfirmationModalVisible] =
    useState(false);
  const navigation = useNavigation<CheckoutScreenNavigationProp>();
  const [deliveryFee, setDeliveryFee] = useState<number>(0);
  const [serviceFee, setServiceFee] = useState<number>(0);
  const [subTotal, setSubTotal] = useState<number>(0);
  const [totalAmountActual, setTotalAmountActual] = useState<number>(0);
  const globalState = useSelector((state: RootState) => state.auth);
  const { theme } = useTheme();
  const [selectedPaymentMethod, setSelectedPaymentMethod] =
    useState<string>("");
  const [selectedVoucher, setSelectedVoucher] = useState<string>("");
  const [selectedAddress, setSelectedAddress] = useState<string>("");
  const [customerNote, setCustomerNote] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [promotionList, setPromotionList] = useState<Promotion[]>([]);
  const [voucherList, setVoucherList] = useState<Voucher[]>([]);
  const [voucherDiscount, setVoucherDiscount] = useState<number>(0);
  const [toastDetails, setToastDetails] = useState<{
    status: "SUCCESS" | "DANGER" | "INFO" | "WARNING" | "HIDDEN";
    title: string;
    desc: string;
  }>({ status: "HIDDEN", title: "", desc: "" });
  const [financeRules, setFinanceRules] = useState<FinanceRules | null>(null);
  const realtimeOrders = useSelector(
    (state: RootState) => state.orderTrackingRealtime.orders
  );
  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [restaurantResponse, financeRulesResponse, voucherResponse] = await Promise.all([
        axiosInstance.get(`/restaurants/${orderItem.restaurant_id}`),
        axiosInstance.get("/finance-rules"),
        axiosInstance.get("/vouchers/valid-at-time"),
      ]);
      console.log('check voucher response', voucherResponse.data)
      // Log API responses for debugging

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

      // Process voucher response
      const voucherData = voucherResponse.data;
      if (voucherData.EC === 0) {
        setVoucherList(voucherData.data || []);
      } else {
        console.error("Voucher API error:", voucherData.EM);
        setVoucherList([]);
      }

      // Process finance rules response
      const { EC, EM, data } = financeRulesResponse.data;
      if (EC === 0 && data && data[0]) {
        setFinanceRules(data[0]);
        const deliveryFeeValue = data[0].delivery_fee ?? DELIVERY_FEE ?? 0;
        setDeliveryFee(deliveryFeeValue);
      } else {
        console.error("Finance rules API error:", EM, "Data:", data);
        setFinanceRules(null);
        setDeliveryFee(0);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      setFinanceRules(null);
      setDeliveryFee(0);
      setVoucherList([]);
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
      
      // Calculate voucher discount
      let calculatedVoucherDiscount = 0;
      if (selectedVoucher && voucherList.length > 0) {
        const selectedVoucherData = voucherList.find(v => v.id === selectedVoucher);
        if (selectedVoucherData) {
          switch (selectedVoucherData.voucher_type) {
            case 'FIXED':
              calculatedVoucherDiscount = parseFloat(selectedVoucherData.discount_value);
              break;
            case 'PERCENTAGE':
              calculatedVoucherDiscount = (subTotal * parseFloat(selectedVoucherData.discount_value)) / 100;
              break;
            case 'FREESHIP':
              calculatedVoucherDiscount = deliveryFee;
              break;
            default:
              calculatedVoucherDiscount = 0;
          }
        }
      }
      
      setVoucherDiscount(calculatedVoucherDiscount);
      
      const calculatedTotal = Number(
        (subTotal + calculatedServiceFee + deliveryFee - calculatedVoucherDiscount).toFixed(2)
      );
      setServiceFee(calculatedServiceFee);
      setTotalAmountActual(calculatedTotal);
    } else {
      setServiceFee(0);
      setTotalAmountActual(0);
      setVoucherDiscount(0);
    }
  }, [subTotal, financeRules, deliveryFee, selectedVoucher, voucherList]);

  const handleSelectPaymentMethod = (option: string) => {
    setSelectedPaymentMethod(option);
  };

  const handleSelectAddress = (option: string) => {
    setSelectedAddress(option);
  };

  const handleSelectVoucher = (option: string) => {
    setSelectedVoucher(option);
  };

  const handlePlaceOrder = async () => {
    setIsLoading(true);
    if (realtimeOrders && realtimeOrders?.[0]?.orderId) {

      setToastDetails({
        status: "DANGER",
        title: "Action Denied",
        desc: "You are currently have 1 active order, please try again when that order is completed.",
      });
      setIsLoading(false);
      return;
    }

    if (!selectedPaymentMethod || !selectedAddress) {
      setIsShowModalStatusCheckout(true);
      setModalContentType("ERROR");
      setIsLoading(false);
      return;
    }
    console.log("cehck subttoal", subTotal);

    const requestData = {
      ...orderItem,
      restaurant_location:
        orderItem.order_items?.[0]?.item?.restaurantDetails?.address_id ||
        orderItem?.restaurant_location,
      payment_method: selectedPaymentMethod,
      customer_note: customerNote,
      customer_location: globalState?.address?.find(
        (item) => item.title === selectedAddress
      )?.id,
      total_amount: totalAmountActual,
      service_fee: serviceFee,
      sub_total: subTotal,
      delivery_fee: deliveryFee,
      order_items: orderItem.order_items.map((item) => ({
        item_id: item?.item?.id,
        variant_id: item.variant_id,
        name: item.name,
        price_at_time_of_order: item.price_at_time_of_order,
        quantity: item.quantity,
      })),
      restaurant_id:
        orderItem.order_items?.[0]?.item?.restaurantDetails?.id ||
        orderItem?.restaurant_id,
      status: "PENDING",
      payment_status: "PENDING",
      delivery_time: new Date().getTime(),
      vouchers_applied: selectedVoucher ? [selectedVoucher] : [],
    };

    console.log('check request data', requestData)

    try {
      const response = await axiosInstance.post(`/orders`, requestData, {
        validateStatus: () => true,
      });
      console.log(
        "================================check whar req data",
        requestData
      );

      console.log("Order response:", JSON.stringify(response.data));
      const { EC, data } = response.data;
      if (EC === 0) {
        dispatch(subtractItemFromCart(data.order_items));
        dispatch(removeCartItemFromAsyncStorage(data.order_items));
        setIsShowModalStatusCheckout(true);
        setModalContentType("SUCCESS");
        setTimeout(() => {
        setIsShowModalStatusCheckout(false);
          
          navigation.navigate("BottomTabs", { screenIndex: 1 });
        }, 5000);
      } else if (EC === -8) {
        setIsShowModalStatusCheckout(true);
        setModalContentType("INSUFFICIENT_BALANCE");
        // console.error("Order API error: Insufficient Balance");
      }
      else if (EC === -15) {
        setToastDetails({
          status: "WARNING",
          title: "Action Denied",
          desc: "This voucher could not be used today, please try again tomorrow",
        });
        setIsLoading(false);
      }
      else {
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

  console.log("cehck curen active", realtimeOrders);

  // Helper function to get completion status for each section
  const getSectionStatus = (
    section: "summary" | "payment" | "confirmation"
  ) => {
    switch (section) {
      case "summary":
        return orderItem && orderItem.order_items.length > 0;
      case "payment":
        return selectedPaymentMethod !== "";
      case "confirmation":
        return selectedAddress !== "" && selectedAddress !== "Add Address";
      default:
        return false;
    }
  };

  // Helper function to render section card
  const renderSectionCard = (
    title: string,
    subtitle: string,
    isCompleted: boolean,
    onPress: () => void,
    stepNumber: number
  ) => {
    const backgroundColor = theme === "light" ? "#fff" : "#333";
    const borderColor = isCompleted
      ? "#10B981"
      : theme === "light"
      ? "#E5E7EB"
      : "#4B5563";
    const textColor = theme === "light" ? "#111827" : "#F9FAFB";
    const subtitleColor = theme === "light" ? "#6B7280" : "#9CA3AF";

    return (
      <TouchableOpacity
        onPress={onPress}
        style={{
          backgroundColor,
          borderWidth: 2,
          borderColor,
          borderRadius: 12,
          padding: spacing.lg,
          marginBottom: spacing.md,
          flexDirection: "row",
          alignItems: "center",
          elevation: 2,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
        }}
      >
        {/* Step number circle */}
        <View
          style={{
            width: 32,
            height: 32,
            borderRadius: 16,
            backgroundColor: isCompleted ? "#10B981" : borderColor,
            justifyContent: "center",
            alignItems: "center",
            marginRight: spacing.md,
          }}
        >
          {isCompleted ? (
            <IconIonicons name="checkmark" size={18} color="white" />
          ) : (
            <FFText style={{ color: "white", fontWeight: "bold" }}>
              {stepNumber}
            </FFText>
          )}
        </View>

        {/* Content */}
        <View style={{ flex: 1 }}>
          <FFText
            fontWeight="600"
            style={{ color: textColor, marginBottom: 4 }}
          >
            {title}
          </FFText>
          <FFText fontSize="sm" style={{ color: subtitleColor }}>
            {subtitle}
          </FFText>
        </View>

        {/* Arrow icon */}
        <IconIonicons name="chevron-forward" size={20} color={subtitleColor} />
      </TouchableOpacity>
    );
  };

  if (isLoading) {
    return <Spinner isVisible isOverlay />;
  }

  return (
    <FFSafeAreaView>
      <FFScreenTopSection title="Check Out" navigation={navigation} />
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: spacing.lg }}
      >
        {/* Progress Header */}
        <View style={{ marginBottom: spacing.xl }}>
          <FFText
            fontWeight="600"
            fontSize="lg"
            style={{ marginBottom: spacing.sm }}
          >
            Complete Your Order
          </FFText>
          <FFText
            fontSize="sm"
            style={{ color: theme === "light" ? "#6B7280" : "#9CA3AF" }}
          >
            Follow these steps to place your order
          </FFText>
        </View>

        {/* Section Cards */}
        {renderSectionCard(
          "Order Summary",
          orderItem
            ? `${
                orderItem.order_items.length
              } items • $${totalAmountActual.toFixed(2)}`
            : "Review your order",
          getSectionStatus("summary"),
          () => setIsOrderSummaryModalVisible(true),
          1
        )}

        {renderSectionCard(
          "Payment Information",
          selectedPaymentMethod || "Select payment method",
          getSectionStatus("payment"),
          () => setIsPaymentModalVisible(true),
          2
        )}

        {renderSectionCard(
          "Order Confirmation",
          selectedAddress && selectedAddress !== "Add Address"
            ? selectedAddress
            : "Select delivery address",
          getSectionStatus("confirmation"),
          () => setIsConfirmationModalVisible(true),
          3
        )}

        {/* Place Order Button */}
        <View style={{ marginTop: spacing.xl }}>
          {(() => {
            const isDisabled =
              !getSectionStatus("summary") ||
              !getSectionStatus("payment") ||
              !getSectionStatus("confirmation");

            return (
              // <></>
              <FFButton
                style={{ width: "100%" }}
                className="w-full"
                onPress={isDisabled ? () => {} : handlePlaceOrder}
              >
                <FFText colorLight={colors.white} fontWeight="500">
                  Place Order • ${totalAmountActual.toFixed(2)}
                </FFText>
              </FFButton>
            );
          })()}
        </View>
      </ScrollView>
      <FFToast
        onClose={() =>
          setToastDetails({ status: "HIDDEN", title: "", desc: "" })
        }
        visible={toastDetails.status !== "HIDDEN"}
        variant={"DANGER"}
        title={toastDetails.title}
      >
        <FFText
          fontWeight="400"
          style={{ color: colors.textSecondary, fontSize: 14 }}
        >
          {" "}
          {toastDetails.desc}
        </FFText>
      </FFToast>
      {/* Modals */}
      <FFModal
        visible={isOrderSummaryModalVisible}
        onClose={() => setIsOrderSummaryModalVisible(false)}
      >
        <OrderSummary
          orderItem={orderItem}
          deliveryFee={deliveryFee}
          serviceFee={serviceFee}
          setTotalAmountParent={setSubTotal}
          selectedVoucher={selectedVoucher}
          voucherList={voucherList}
          handleSelectVoucher={handleSelectVoucher}
          totalAmountActual={totalAmountActual}
          voucherDiscount={voucherDiscount}
        />
      </FFModal>

      <FFModal
        visible={isPaymentModalVisible}
        onClose={() => setIsPaymentModalVisible(false)}
      >
        <PaymentInformation
          selected={selectedPaymentMethod}
          handleSelect={handleSelectPaymentMethod}
        />
      </FFModal>

      <FFModal
        visible={isConfirmationModalVisible}
        onClose={() => setIsConfirmationModalVisible(false)}
      >
        <OrderConfirmation
          handlePlaceOrder={() => {
            setIsConfirmationModalVisible(false);
            handlePlaceOrder();
          }}
          handleSelect={handleSelectAddress}
          customerNote={customerNote}
          setCustomerNote={setCustomerNote}
          selected={selectedAddress}
        />
      </FFModal>

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
