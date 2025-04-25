import React, { useEffect, useState } from "react";
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
  setIsLoading,
  navigation,
  refetchOrders,
  orderStatusStages,
  onReOrder,
}) => {
  console.log("check type", type);

  const { orders: realtimeOrders } = useSelector(
    (state: RootState) => state.orderTrackingRealtime
  );
  const [isExpandedOrderItem, setIsExpandedOrderItem] = useState(false);
  const [detailedOrder, setDetailedOrder] =
    useState<OrderTrackingScreen | null>(null);
  const [tipAmount, setTipAmount] = useState<string | number>(0);
  const [driverDetails, setDriverDetails] = useState<any | null>(null);
  const [isShowTipToDriverModal, setShowTipToDriverModal] = useState(false);
  const [activeOrderDetails, setActiveOrderDetails] =
    useState<OrderTrackingScreen | null>(null);
  const firstActiveOrder =
    (realtimeOrders[0] as unknown as OrderTrackingScreen) || null;
  const [isTippedSuccessful, setIsTippedSuccessful] = useState(false);
  const [currentOrderStage, setCurrentOrderStage] = useState<number>(0);

  const handleTipToDriver = async () => {
    if (!setIsLoading) return;
    setIsLoading(true);
    try {
      console.log("check tip amount", parseFloat(String(tipAmount)));
      const tipValue = parseFloat(String(tipAmount)) || 0;
      const response = await axiosInstance.post("/orders/tip", {
        orderId: firstActiveOrder?.orderId || activeOrderDetails?.id,
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

  useEffect(() => {
    setCurrentOrderStage(() => {
      switch (firstActiveOrder?.status) {
        case Enum_OrderStatus.PENDING:
          return 1;
        case Enum_OrderStatus.PREPARING:
          return 2;
        case Enum_OrderStatus.DISPATCHED:
          return 3;
        case Enum_OrderStatus.READY_FOR_PICKUP:
          return 4;
        case Enum_OrderStatus.RESTAURANT_PICKUP:
          return 5;
        case Enum_OrderStatus.EN_ROUTE:
          return 6;
        default:
          return 0;
      }
    });
    if (
      refetchOrders &&
      firstActiveOrder?.status === Enum_OrderStatus.DISPATCHED
    ) {
      refetchOrders();
    }
  }, [firstActiveOrder, refetchOrders]);

  useEffect(() => {
    console.log("realtimeOrders:", realtimeOrders);
    if (realtimeOrders?.length > 0) {
      const order = realtimeOrders[0];
      // Find full order from orders prop
      const fullOrder = orders.find((o) => o.id === order.orderId) || null;
      console.log("check order here", order);

      // Compute customerFullAddress and restaurantFullAddress
      const computedCustomerFullAddress = order.customerAddress
        ? `${order.customerAddress.street}, ${order.customerAddress.city}, ${order.customerAddress.nationality}`
        : order.customerFullAddress || "N/A";
      const computedRestaurantFullAddress = order.restaurantAddress
        ? `${order.restaurantAddress.street}, ${order.restaurantAddress.city}, ${order.restaurantAddress.nationality}`
        : order.restaurantFullAddress || "N/A";

      // Use driverDetails from WebSocket payload if available
      setDriverDetails(order.driverDetails || null);
      setActiveOrderDetails({
        ...order,
        id: order.orderId,
        customer: fullOrder?.customer ?? {
          id: "",
          first_name: "",
          last_name: "",
          avatar: null,
          favorite_items: null,
        },
        customerAddress: order.customerAddress ?? {
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
        restaurantAddress: order.restaurantAddress ?? {
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
        customer_id: order.customer_id,
        customer_location: fullOrder?.customer_location ?? "",
        customer_note: fullOrder?.customer_note ?? "",
        distance: fullOrder?.distance ?? order.distance ?? "",
        delivery_time: fullOrder?.delivery_time ?? "",
        driver: null,
        driver_id: order.driver_id,
        order_items: fullOrder?.order_items ?? [],
        order_time: fullOrder?.order_time ?? "",
        payment_method: fullOrder?.payment_method ?? "",
        payment_status: fullOrder?.payment_status ?? "PENDING",
        restaurant: fullOrder?.restaurant ?? {
          id: order.restaurant_id,
          restaurant_name: "",
          address_id: "",
          avatar: null,
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
        restaurant_id: order.restaurant_id,
        restaurant_location: fullOrder?.restaurant_location ?? "",
        restaurant_note: fullOrder?.restaurant_note ?? "",
        status: order.status as Enum_OrderStatus,
        total_amount: fullOrder?.total_amount ?? "0",
        tracking_info: order.tracking_info as Enum_OrderTrackingInfo,
        customerFullAddress: computedCustomerFullAddress,
        restaurantFullAddress: computedRestaurantFullAddress,
      });
    } else {
      setDriverDetails(null);
      setActiveOrderDetails(null);
    }
  }, [realtimeOrders, orders]);

  useEffect(() => {
    if (type !== "ACTIVE") {
      setActiveOrderDetails(null);
      setDetailedOrder(null);
      setDriverDetails(null);
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
          firstActiveOrder={firstActiveOrder}
          activeOrderDetails={activeOrderDetails}
          driverDetails={driverDetails}
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
