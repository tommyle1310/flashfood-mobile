import { View, TouchableOpacity, ScrollView } from "react-native";
import React, { useCallback, useEffect, useState } from "react";
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
import moment from "moment";

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
  const { orderItem } = route.params; // Initial order data from navigation params

  // Modal visibility states
  const [isShowModalStatusCheckout, setIsShowModalStatusCheckout] = useState<boolean>(false);
  const [modalContentType, setModalContentType] = useState<
    "SUCCESS" | "ERROR" | "WARNING" | "INSUFFICIENT_BALANCE"
  >("ERROR");
  const [isOrderSummaryModalVisible, setIsOrderSummaryModalVisible] = useState(false);
  const [isPaymentModalVisible, setIsPaymentModalVisible] = useState(false);
  const [isConfirmationModalVisible, setIsConfirmationModalVisible] = useState(false);

  const navigation = useNavigation<CheckoutScreenNavigationProp>();
  const globalState = useSelector((state: RootState) => state.auth);
  const { theme } = useTheme();
  const realtimeOrders = useSelector((state: RootState) => state.orderTrackingRealtime.orders);

  // Core state for calculations
  const [subTotal, setSubTotal] = useState<number>(0);
  const [deliveryFee, setDeliveryFee] = useState<number>(DELIVERY_FEE); // Initialize with a default
  const [serviceFee, setServiceFee] = useState<number>(0);
  const [voucherDiscount, setVoucherDiscount] = useState<number>(0);
  const [totalAmountActual, setTotalAmountActual] = useState<number>(0); // Final calculated total

  // Data fetched from APIs
  const [financeRules, setFinanceRules] = useState<FinanceRules | null>(null);
  const [voucherList, setVoucherList] = useState<Voucher[]>([]);
  const [promotionList, setPromotionList] = useState<Promotion[]>([]); // Assuming promotions are restaurant-specific

  // User selections
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>("");
  const [selectedVoucher, setSelectedVoucher] = useState<string>("");
  const [selectedAddress, setSelectedAddress] = useState<string>("");
  const [customerNote, setCustomerNote] = useState<string>("");

  // UI state
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [toastDetails, setToastDetails] = useState<{
    status: "SUCCESS" | "DANGER" | "INFO" | "WARNING" | "HIDDEN";
    title: string;
    desc: string;
  }>({ status: "HIDDEN", title: "", desc: "" });

  // --- Data Fetching ---
  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [restaurantResponse, financeRulesResponse, voucherResponse] = await Promise.all([
        axiosInstance.get(`/restaurants/${orderItem.restaurant_id}`),
        axiosInstance.get("/finance-rules"),
        axiosInstance.get("/vouchers/valid-at-time"),
      ]);

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
        // Use the finance rule delivery fee if available, otherwise keep default
        const deliveryFeeValue = data[0].delivery_fee ?? deliveryFee;
        setDeliveryFee(deliveryFeeValue);
      } else {
        console.error("Finance rules API error:", EM, "Data:", data);
        setFinanceRules(null);
        setDeliveryFee(deliveryFee); // Fallback to default
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      setFinanceRules(null);
      setDeliveryFee(deliveryFee);
      setVoucherList([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (orderItem.restaurant_id) {
      fetchData();
    }
  }, [orderItem]); // Depend on orderItem to re-fetch if order changes (e.g., from navigation)

  // --- Core Calculation Logic ---
  // 1. Calculate Subtotal (only depends on orderItem)
  useEffect(() => {
    const calculatedSubTotal = orderItem.order_items.reduce((total, item) => {
      return total + ((item?.price_at_time_of_order as number) ?? 0) * (item?.quantity ?? 1);
    }, 0);
    setSubTotal(calculatedSubTotal);
  }, [orderItem]);

  // 2. Calculate Service Fee, Voucher Discount, and Total Amount
  // This useEffect runs whenever subTotal, financeRules, deliveryFee, selectedVoucher, or voucherList changes.
  useEffect(() => {
    let currentCalculatedServiceFee = 0;
    if (financeRules && subTotal > 0) {
      currentCalculatedServiceFee = Number(
        (financeRules.app_service_fee * subTotal).toFixed(2)
      );
    }
    setServiceFee(currentCalculatedServiceFee);

    let currentCalculatedVoucherDiscount = 0;
    const selectedVoucherData = voucherList.find(v => v.id === selectedVoucher);

    if (selectedVoucher && selectedVoucherData) {
      // Check voucher validity again here for calculation, in case conditions changed since dropdown render
      const currentTime = moment();
      const startDate = moment.unix(parseInt(selectedVoucherData.start_date));
      const endDate = moment.unix(parseInt(selectedVoucherData.end_date));
      const currentDay = currentTime.day(); // 0 for Sunday, 1 for Monday...

      const isDateValid = currentTime.isBetween(startDate, endDate, null, '[]');

      let isDayValid = true;
      if (selectedVoucherData.applicable_days && selectedVoucherData.applicable_days.length > 0) {
          isDayValid = selectedVoucherData.applicable_days.includes(currentDay);
      }

      let isTimeValid = true;
      if (selectedVoucherData.applicable_time_ranges && selectedVoucherData.applicable_time_ranges.length > 0) {
          isTimeValid = selectedVoucherData.applicable_time_ranges.some(range => {
              const [startHour, startMinute] = range.start_time.split(":").map(Number);
              const [endHour, endMinute] = range.end_time.split(":").map(Number);
              let startTime = currentTime.clone().hour(startHour).minute(startMinute).second(0).millisecond(0);
              let endTime = currentTime.clone().hour(endHour).minute(endMinute).second(0).millisecond(0);
              if (endTime.isBefore(startTime)) { endTime.add(1, 'day'); }
              return currentTime.isBetween(startTime, endTime, null, '[]');
          });
      }

      const isMinOrderValueMet = !selectedVoucherData.minimum_order_value || subTotal >= parseFloat(selectedVoucherData.minimum_order_value);

      if (isDateValid && isDayValid && isTimeValid && isMinOrderValueMet) {
        switch (selectedVoucherData.voucher_type) {
          case 'FIXED':
            currentCalculatedVoucherDiscount = parseFloat(selectedVoucherData.discount_value);
            break;
          case 'PERCENTAGE':
            let percentageDiscount = (subTotal * parseFloat(selectedVoucherData.discount_value)) / 100;
            if (selectedVoucherData.maximum_discount_amount && percentageDiscount > parseFloat(selectedVoucherData.maximum_discount_amount)) {
              percentageDiscount = parseFloat(selectedVoucherData.maximum_discount_amount);
            }
            currentCalculatedVoucherDiscount = percentageDiscount;
            break;
          case 'FREESHIP':
            currentCalculatedVoucherDiscount = deliveryFee; // Discount equals the delivery fee
            break;
          default:
            currentCalculatedVoucherDiscount = 0;
        }
      } else {
        // If the selected voucher is no longer valid for any reason, reset it
        // This is important to prevent applying an invalid voucher if conditions change
        // while the user is on the checkout screen.
        setSelectedVoucher("");
        currentCalculatedVoucherDiscount = 0;
        setToastDetails({
          status: "WARNING",
          title: "Voucher Invalidated",
          desc: "The selected voucher is no longer applicable due to updated conditions.",
        });
      }
    }
    setVoucherDiscount(Number(currentCalculatedVoucherDiscount.toFixed(2))); // Ensure discount is rounded

    let currentTotalAmountActual = subTotal + currentCalculatedServiceFee;
    let actualDeliveryFee = deliveryFee;

    // Apply free delivery discount
    if (selectedVoucherData?.voucher_type === "FREESHIP" && voucherDiscount > 0) {
      actualDeliveryFee = 0; // If free delivery is applied, the actual delivery fee for total calculation is 0
    }
    
    currentTotalAmountActual = (subTotal + actualDeliveryFee + currentCalculatedServiceFee - currentCalculatedVoucherDiscount);
    
    setTotalAmountActual(Number(Math.max(0, currentTotalAmountActual).toFixed(2))); // Total can't be negative
  }, [subTotal, financeRules, deliveryFee, selectedVoucher, voucherList]); // Re-run when these dependencies change

  // --- Handlers for User Interactions ---
  const handleSelectPaymentMethod = useCallback((option: string) => {
    setSelectedPaymentMethod(option);
  }, []);

  const handleSelectAddress = useCallback((option: string) => {
    setSelectedAddress(option);
  }, []);

  // Pass this handler to OrderSummary to update selectedVoucher state
  const handleSelectVoucher = useCallback((option: string) => {
    setSelectedVoucher(option);
  }, []);

  // --- Place Order Logic ---
  const handlePlaceOrder = async () => {
    setIsLoading(true);

    if (realtimeOrders && realtimeOrders?.[0]?.orderId) {
      setToastDetails({
        status: "DANGER",
        title: "Action Denied",
        desc: "You currently have an active order. Please try again when that order is completed.",
      });
      setIsLoading(false);
      return;
    }

    if (!selectedPaymentMethod || !selectedAddress || selectedAddress === "Add Address") {
      setIsShowModalStatusCheckout(true);
      setModalContentType("ERROR");
      setIsLoading(false);
      return;
    }

    const customerAddress = globalState?.address?.find(
      (item) => item.title === selectedAddress
    );

    if (!customerAddress) {
      setToastDetails({
        status: "DANGER",
        title: "Address Error",
        desc: "Selected address not found or invalid.",
      });
      setIsLoading(false);
      return;
    }

    const requestData = {
      ...orderItem,
      restaurant_location:
        orderItem.order_items?.[0]?.item?.restaurantDetails?.address_id ||
        orderItem?.restaurant_location,
      payment_method: selectedPaymentMethod,
      customer_note: customerNote,
      customer_location: customerAddress.id,
      total_amount: totalAmountActual,
      service_fee: serviceFee,
      sub_total: subTotal,
      delivery_fee: (selectedVoucher && voucherList.find(v => v.id === selectedVoucher)?.voucher_type === "FREESHIP") ? 0 : deliveryFee, // Send actual delivery fee to backend, 0 if free ship applied
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

    console.log('Sending order request data:', JSON.stringify(requestData, null, 2));

    try {
      const response = await axiosInstance.post(`/orders`, requestData, {
        validateStatus: () => true, // Allows us to handle non-2xx responses in catch block
      });

      const { EC, data, EM } = response.data;
      if (EC === 0) {
        dispatch(subtractItemFromCart(data.order_items));
        dispatch(removeCartItemFromAsyncStorage(data.order_items));
        setIsShowModalStatusCheckout(true);
        setModalContentType("SUCCESS");
        setTimeout(() => {
          setIsShowModalStatusCheckout(false);
          navigation.navigate("BottomTabs", { screenIndex: 1 }); // Navigate to Orders screen
        }, 5000);
      } else if (EC === -8) {
        setIsShowModalStatusCheckout(true);
        setModalContentType("INSUFFICIENT_BALANCE");
      } else if (EC === -15) {
        setToastDetails({
          status: "WARNING",
          title: "Voucher Error",
          desc: "This voucher could not be used today. Please try again tomorrow.",
        });
      } else if (EC === -17) {
        setToastDetails({
          status: "WARNING",
          title: "Voucher Error",
          desc: "You have already used this voucher today. Please try again tomorrow.",
        });
      } else {
        setIsShowModalStatusCheckout(true);
        setModalContentType("ERROR");
        console.error("Order API error:", EM);
      }
    } catch (error) {
      console.error("Error placing order:", error);
      setIsShowModalStatusCheckout(true);
      setModalContentType("ERROR");
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to get completion status for each section
  const getSectionStatus = useCallback(
    (section: "summary" | "payment" | "confirmation") => {
      switch (section) {
        case "summary":
          return subTotal > 0 && orderItem && orderItem.order_items.length > 0;
        case "payment":
          return selectedPaymentMethod !== "";
        case "confirmation":
          return selectedAddress !== "" && selectedAddress !== "Add Address";
        default:
          return false;
      }
    },
    [subTotal, orderItem, selectedPaymentMethod, selectedAddress]
  );

  // Helper function to render section card
  const renderSectionCard = useCallback(
    (
      title: string,
      subtitle: string,
      isCompleted: boolean,
      onPress: () => void,
      stepNumber: number
    ) => {
      const backgroundColor = theme === "light" ? "#fff" : "#333";
      const borderColor = isCompleted
        ? colors.primary
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
              backgroundColor: isCompleted ? colors.primary : borderColor,
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
    },
    [theme, colors.primary]
  ); // Dependencies for renderSectionCard

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
          orderItem && orderItem.order_items.length > 0
            ? `${orderItem.order_items.length} items • $${totalAmountActual.toFixed(2)}`
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
              <FFButton
                style={{ width: "100%" }}
                className="w-full"
                onPress={isDisabled ? () => {} : handlePlaceOrder}
                disabled={isDisabled} // Explicitly disable button
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
        variant={toastDetails.status === "SUCCESS" ? "SUCCESS" : toastDetails.status === "INFO" ? "INFO" : toastDetails.status === "WARNING" ? "WARNING" : "DANGER"}
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
          // The setTotalAmountParent prop is now removed from OrderSummary component,
          // as subTotal, serviceFee, deliveryFee, and totalAmountActual are
          // calculated and managed by the parent CheckoutScreen.
          // OrderSummary now just *displays* these calculated values.
          selectedVoucher={selectedVoucher}
          voucherList={voucherList}
          handleSelectVoucher={handleSelectVoucher} // This passes the handler to update selectedVoucher state
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
