import React, { useEffect, useState, useMemo } from "react";
import { ScrollView, View } from "react-native";
import { useSelector } from "@/src/store/types";
import { RootState } from "@/src/store/store";
import axiosInstance from "@/src/utils/axiosConfig";
import { OrderTracking as OrderTrackingScreen } from "@/src/types/screens/Order";
import { Enum_OrderStatus, Enum_OrderTrackingInfo } from "@/src/types/Orders";
import { OrderScreenNavigationProp } from "@/screens/OrdersScreen";
import { OrderCard } from "@/src/components/screens/Orders/OrderCard";
import { DetailedOrder } from "@/src/components/screens/Orders/DetailedOrder";
import FFSkeleton from "../../FFSkeleton";
import Spinner from "../../FFSpinner";
import { spacing } from "@/src/theme";

interface OrderTabContentProps {
  type: "ACTIVE" | "COMPLETED" | "CANCELLED";
  orders: OrderTrackingScreen[];
  setOrders?: React.Dispatch<React.SetStateAction<OrderTrackingScreen[]>>; // Add setOrders to props
  refetchOrders?: () => void;
  setIsLoading?: React.Dispatch<React.SetStateAction<boolean>>;
  navigation?: OrderScreenNavigationProp;
  orderStatusStages?: Enum_OrderStatus[];
  isLoading?: boolean;
  onReOrder?: (data: OrderTrackingScreen) => void;
}

export const OrderTabContent: React.FC<OrderTabContentProps> = ({
  type,
  orders,
  isLoading,
  setOrders,
  setIsLoading,
  navigation,
  refetchOrders,
  orderStatusStages,
  onReOrder,
}) => {
  const { orders: realtimeOrders } = useSelector(
    (state: RootState) => state.orderTrackingRealtime
  );

  // UI state management - simplified and cleaner
  const [isExpandedOrderItem, setIsExpandedOrderItem] = useState(false);
  const [detailedOrder, setDetailedOrder] =
    useState<OrderTrackingScreen | null>(null);
  const [tipAmount, setTipAmount] = useState<string | number>(0);
  const [isShowTipToDriverModal, setShowTipToDriverModal] = useState(false);
  const [isTippedSuccessful, setIsTippedSuccessful] = useState(false);
  const [currentOrderStage, setCurrentOrderStage] = useState<number>(0);

  // SIMPLIFIED DATA SOURCE: Create a single computed active order instead of multiple state variables
  // This eliminates the confusing fallback pattern and provides a single source of truth
  const activeOrder = useMemo(() => {
    if (type !== "ACTIVE" || !realtimeOrders.length) {
      return null;
    }

    const realtimeOrder = realtimeOrders[0];
    const fullOrderDetails = orders.find((o) => o.id === realtimeOrder.orderId);

    // Merge real-time data with full order details for a complete picture
    const mergedOrder: OrderTrackingScreen = {
      // Use real-time data for tracking information
      ...realtimeOrder,
      id: realtimeOrder.orderId,
      status: realtimeOrder.status as Enum_OrderStatus,
      tracking_info: realtimeOrder.tracking_info as Enum_OrderTrackingInfo,

      // Compute addresses consistently
      customerFullAddress: realtimeOrder.customerAddress
        ? `${realtimeOrder.customerAddress.street}, ${realtimeOrder.customerAddress.city}, ${realtimeOrder.customerAddress.nationality}`
        : realtimeOrder.customerFullAddress || "N/A",
      restaurantFullAddress: realtimeOrder.restaurantAddress
        ? `${realtimeOrder.restaurantAddress.street}, ${realtimeOrder.restaurantAddress.city}, ${realtimeOrder.restaurantAddress.nationality}`
        : realtimeOrder.restaurantFullAddress || "N/A",

      // Use full order details for comprehensive data, fallback to real-time data
      customer: fullOrderDetails?.customer ?? {
        id: realtimeOrder.customer_id,
        first_name: "",
        last_name: "",
        avatar: null,
        favorite_items: null,
      },
      customerAddress: realtimeOrder.customerAddress ?? {
        id: "",
        street: "",
        city: "",
        nationality: "",
        is_default: false,
        created_at: 0,
        updated_at: 0,
        postal_code: 0,
        location: { lat: 0, lon: 0 },
        title: "",
      },
      restaurantAddress: realtimeOrder.restaurantAddress ?? {
        id: "",
        street: "",
        city: "",
        nationality: "",
        is_default: false,
        created_at: 0,
        updated_at: 0,
        postal_code: 0,
        location: { lat: 0, lon: 0 },
        title: "",
      },
      customer_location: fullOrderDetails?.customer_location ?? "",
      customer_note: fullOrderDetails?.customer_note ?? "",
      distance: String(
        realtimeOrder.distance || fullOrderDetails?.distance || ""
      ),
      delivery_time: fullOrderDetails?.delivery_time ?? "",
      driver: realtimeOrder.driver_id
        ? {
            id: realtimeOrder.driver_id,
            avatar: realtimeOrder.driver_avatar,
          }
        : null,
      order_items:
        realtimeOrder.order_items || fullOrderDetails?.order_items || [],
      order_time: fullOrderDetails?.order_time ?? "",
      payment_method: fullOrderDetails?.payment_method ?? "",
      payment_status: fullOrderDetails?.payment_status ?? "PENDING",
      restaurant: fullOrderDetails?.restaurant ?? {
        id: realtimeOrder.restaurant_id,
        restaurant_name: "",
        address_id: "",
        avatar: realtimeOrder.restaurant_avatar,
        contact_email: [],
        contact_phone: [],
        created_at: 0,
        specialize_in: [],
        description: null,
        images_gallery: null,
        opening_hours: null,
        owner_id: "",
        owner_name: "",
        promotions: null,
        ratings: null,
        status: null,
        updated_at: 0,
      },
      restaurant_location: fullOrderDetails?.restaurant_location ?? "",
      restaurant_note: fullOrderDetails?.restaurant_note ?? "",
      total_amount: String(
        realtimeOrder.total_amount || fullOrderDetails?.total_amount || "0"
      ),
    };

    console.log("🔄 ACTIVE ORDER COMPUTATION:", {
      type,
      realtimeOrdersCount: realtimeOrders.length,
      realtimeOrderId: realtimeOrder?.orderId,
      realtimeOrderItems: realtimeOrder?.order_items?.length || 0,
      realtimeOrderItemsDetails: realtimeOrder?.order_items?.map((item) => ({
        name: item.name,
        hasMenuItemVariant: !!item.menu_item_variant,
      })),
      fullOrderDetailsFound: !!fullOrderDetails,
      mergedOrderItemsCount: mergedOrder.order_items.length,
      mergedOrderTotalAmount: mergedOrder.total_amount,
      mergedOrderDistance: mergedOrder.distance,
    });

    return mergedOrder;
  }, [realtimeOrders, orders, type]);

  const handleTipToDriver = async () => {
    if (!setIsLoading) return;
    setIsLoading(true);
    try {
      console.log("check tip amount", parseFloat(String(tipAmount)));
      const tipValue = parseFloat(String(tipAmount)) || 0;
      const response = await axiosInstance.post("/orders/tip", {
        orderId: activeOrder?.orderId || activeOrder?.id,
        tipAmount: tipValue,
      });
      console.log("tip to driver response", response.data);
      const { EC, EM, data } = response.data;
      if (EC === 0) {
        setIsTippedSuccessful(true);
      }
    } catch (error) {
      console.error("Error tipping driver:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // SIMPLIFIED EFFECTS: Much cleaner and easier to understand
  useEffect(() => {
    // Update current order stage based on active order status
    if (activeOrder?.status) {
      const stageMap = {
        [Enum_OrderStatus.PENDING]: 1,
        [Enum_OrderStatus.PREPARING]: 2,
        [Enum_OrderStatus.DISPATCHED]: 3,
        [Enum_OrderStatus.READY_FOR_PICKUP]: 4,
        [Enum_OrderStatus.RESTAURANT_PICKUP]: 5,
        [Enum_OrderStatus.EN_ROUTE]: 6,
      };
      setCurrentOrderStage(stageMap[activeOrder.status] || 0);

      // Trigger refetch when order is dispatched
      if (refetchOrders && activeOrder.status === Enum_OrderStatus.DISPATCHED) {
        refetchOrders();
      }
    } else {
      setCurrentOrderStage(0);
    }
  }, [activeOrder?.status, refetchOrders]);

  // Clear detailed order when switching away from ACTIVE tab
  useEffect(() => {
    if (type !== "ACTIVE") {
      setDetailedOrder(null);
    }
  }, [type]);

  return (
    <ScrollView className="gap-4 p-4 ">
      <View className="gap-4">
        {type !== "ACTIVE" &&
          detailedOrder === null &&
          orders
            .sort((a, b) => Number(b.order_time) - Number(a.order_time))
            .map((item, i) => (
              <View
                key={item.id || i}
                style={{ marginBottom: i === orders.length - 1 ? 200 : 0 }}
              >
                <OrderCard
                  type={type}
                  order={item}
                  onPress={() => setDetailedOrder(item)}
                  onReOrder={onReOrder}
                />
              </View>
            ))}
        {isLoading && type === "COMPLETED" && (
          <>
            <FFSkeleton height={180} />
            <FFSkeleton height={180} />
            <FFSkeleton height={180} />
          </>
        )}
      </View>
      {(detailedOrder !== null || type === "ACTIVE") && (
        <DetailedOrder
          isLoading={isLoading}
          type={type}
          detailedOrder={detailedOrder}
          setDetailedOrder={setDetailedOrder}
          // SIMPLIFIED: Use single activeOrder instead of multiple confusing props
          firstActiveOrder={activeOrder}
          activeOrderDetails={activeOrder}
          currentOrderStage={currentOrderStage}
          orderStatusStages={orderStatusStages}
          navigation={navigation}
          isExpandedOrderItem={isExpandedOrderItem}
          setIsExpandedOrderItem={setIsExpandedOrderItem}
          isShowTipToDriverModal={isShowTipToDriverModal}
          setShowTipToDriverModal={setShowTipToDriverModal}
          tipAmount={tipAmount}
          setTipAmount={setTipAmount}
          isTippedSuccessful={isTippedSuccessful}
          setIsTippedSuccessful={setIsTippedSuccessful}
          handleTipToDriver={handleTipToDriver}
        />
      )}
    </ScrollView>
  );
};
