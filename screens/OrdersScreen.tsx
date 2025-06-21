import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useSelector, useDispatch } from "@/src/store/types";
import { RootState } from "@/src/store/store";
import axiosInstance from "@/src/utils/axiosConfig";
import FFSafeAreaView from "@/src/components/FFSafeAreaView";
import FFTab from "@/src/components/FFTab.conventional";
import { OrderTabContent } from "@/src/components/screens/Orders/OrderTabContent";
import { OrderTracking } from "@/src/types/screens/Order";
import { Enum_OrderStatus } from "@/src/types/Orders";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { MainStackParamList } from "@/src/navigation/AppNavigator";
import { mapOrderTrackingToOrder } from "@/src/utils/orderUtils";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  updateAndSaveOrderTracking,
  clearOrderTracking,
  OrderTracking as StoreOrderTracking,
} from "@/src/store/orderTrackingRealtimeSlice";

export type OrderScreenNavigationProp = StackNavigationProp<
  MainStackParamList,
  "BottomTabs"
>;

// Add type guard to validate order status
const isValidOrderStatus = (status: string): status is Enum_OrderStatus => {
  return Object.values(Enum_OrderStatus).includes(status as Enum_OrderStatus);
};

// Helper function to convert StoreOrderTracking to OrderTracking
const convertRealtimeToOrderTracking = (
  realtimeOrders: StoreOrderTracking[]
): OrderTracking[] => {
  return realtimeOrders.map((order) => ({
    id: order.orderId || "",
    orderId: order.orderId,
    status: order.status,
    tracking_info: order.tracking_info,
    customer_id: order.customer_id,
    driver_id: order.driver_id || "",
    restaurant_id: order.restaurant_id,
    updated_at: order.updated_at,
    // Required fields with defaults
    customer: {
      avatar: null,
      favorite_items: null,
      first_name: "",
      id: order.customer_id,
      last_name: "",
    },
    restaurant: order.restaurant_avatar
      ? {
          id: order.restaurant_id,
          avatar: order.restaurant_avatar,
          specialize_in: [],
          restaurant_name: "",
        }
      : {
          id: order.restaurant_id,
          avatar: null,
          specialize_in: [],
          restaurant_name: "",
        },
    driver: order.driverDetails
      ? {
          id: order.driverDetails.id,
          avatar: order.driverDetails.avatar,
        }
      : null,
    restaurantAddress: order.restaurantAddress || {
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
    customerAddress: order.customerAddress || {
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
    customerFullAddress: order.customerFullAddress || "",
    restaurantFullAddress: order.restaurantFullAddress || "",
    distance: order.distance || "0",
    customer_location: "",
    customer_note: "",
    delivery_time: "",
    order_items: order.order_items || [],
    order_time: order.updated_at.toString(),
    payment_method: "COD",
    payment_status: "PENDING" as const,
    restaurant_location: "",
    restaurant_note: "",
    total_amount: order.total_amount?.toString() || "0",
    created_at: order.updated_at,
    // Add missing fields from OrderTrackingBase
    restaurant_avatar: order.restaurant_avatar,
    driver_avatar: order.driver_avatar,
    driverDetails: order.driverDetails,
  })) as OrderTracking[];
};

// Helper function to merge API orders with realtime persisted data
const mergeOrdersWithRealtimeData = (
  apiOrders: OrderTracking[],
  realtimeOrders: StoreOrderTracking[]
): OrderTracking[] => {
  const mergedOrders = [...apiOrders];

  // Add or update orders from realtime data that have more recent updates
  realtimeOrders.forEach((realtimeOrder) => {
    const apiOrderIndex = mergedOrders.findIndex(
      (order) => order.id === realtimeOrder.orderId
    );

    if (apiOrderIndex !== -1) {
      // Order exists in API data - check if realtime data is more recent
      const apiOrder = mergedOrders[apiOrderIndex];
      const apiUpdatedAt = apiOrder.updated_at || 0;
      const realtimeUpdatedAt = realtimeOrder.updated_at || 0;

      if (realtimeUpdatedAt > apiUpdatedAt) {
        // Realtime data is more recent - merge it with API data
        mergedOrders[apiOrderIndex] = {
          ...apiOrder,
          status: realtimeOrder.status,
          tracking_info: realtimeOrder.tracking_info,
          updated_at: realtimeOrder.updated_at,
          // Preserve realtime-specific data that API might not have
          ...(realtimeOrder.driverDetails && {
            driverDetails: realtimeOrder.driverDetails,
          }),
          ...(realtimeOrder.order_items && {
            order_items: realtimeOrder.order_items,
          }),
          // CRITICAL FIX: Preserve customer_note from realtime data if it exists
          ...(realtimeOrder.customer_note && {
            customer_note: realtimeOrder.customer_note,
          }),
          // CRITICAL FIX: Preserve restaurant_note from realtime data if it exists
          ...(realtimeOrder.restaurant_note && {
            restaurant_note: realtimeOrder.restaurant_note,
          }),
        };
        console.log(
          `🔄 Updated order ${realtimeOrder.orderId} with realtime data`,
          {
            customerNote: realtimeOrder.customer_note || "none in realtime",
            apiCustomerNote: apiOrder.customer_note || "none in API",
            finalCustomerNote: mergedOrders[apiOrderIndex].customer_note || "none in final",
          }
        );
      }
    } else {
      // Order doesn't exist in API data - add it from realtime data
      const convertedOrder = convertRealtimeToOrderTracking([realtimeOrder])[0];
      mergedOrders.push(convertedOrder);
      console.log(`➕ Added order ${realtimeOrder.orderId} from realtime data`, {
        customerNote: convertedOrder.customer_note || "none",
      });
    }
  });

  return mergedOrders;
};

const OrdersScreen: React.FC = () => {
  const { id } = useSelector((state: RootState) => state.auth);
  const realtimeOrders = useSelector(
    (state: RootState) => state.orderTrackingRealtime.orders
  );
  const dispatch = useDispatch();
  const [orders, setOrders] = useState<OrderTracking[]>([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation<OrderScreenNavigationProp>();

  const orderStatusStages: Enum_OrderStatus[] = useMemo(
    () => [
      Enum_OrderStatus["PENDING"],
      Enum_OrderStatus["PREPARING"],
      Enum_OrderStatus["READY_FOR_PICKUP"],
      Enum_OrderStatus["RESTAURANT_PICKUP"],
      Enum_OrderStatus["DISPATCHED"],
      Enum_OrderStatus["EN_ROUTE"],
      Enum_OrderStatus["DELIVERED"],
    ],
    []
  );
  console.log("realtimeOrders", realtimeOrders?.[0]?.order_items);

  // Clear all order-related data from AsyncStorage
  const clearAllOrderData = useCallback(async () => {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const orderKeys = keys.filter(
        (key) => key.includes("order") || key.includes("tracking")
      );
      if (orderKeys.length > 0) {
        await AsyncStorage.multiRemove(orderKeys);
      }
      dispatch(clearOrderTracking());
      setOrders([]);
      console.log("Cleared all order data from AsyncStorage");
    } catch (error) {
      console.error("Error clearing order data:", error);
    }
  }, [dispatch]);

  const isValidOrder = useCallback(
    (order: OrderTracking | null) => {
      if (!order) {
        console.log("Invalid order: null order");
        return false;
      }

      // Required fields check
      if (
        !order.id ||
        (!order.status && !order.tracking_info) || // Allow either status or tracking_info
        !order.customer_id ||
        !order.restaurant_id
      ) {
        console.log("Invalid order: missing required fields", {
          id: order.id,
          status: order.status,
          tracking: order.tracking_info,
          customerId: order.customer_id,
          restaurantId: order.restaurant_id,
        });
        return false;
      }

      // Check if order belongs to current user
      if (order.customer_id !== id) {
        console.log("Invalid order: wrong customer", order.customer_id, id);
        return false;
      }

      // Use tracking_info if status is undefined
      const orderStatus = order.status || order.tracking_info;

      // Check if order status is valid
      if (!isValidOrderStatus(orderStatus)) {
        console.log("Invalid order: invalid status", orderStatus);
        return false;
      }

      return true;
    },
    [id]
  );

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get(`/customers/orders/${id}`);
      const apiOrders = (res.data.data as OrderTracking[]).map((order) => ({
        ...order,
        customerFullAddress: order.customerAddress
          ? `${order.customerAddress.street}, ${order.customerAddress.city}, ${order.customerAddress.nationality}`
          : order.customerFullAddress || "N/A",
        restaurantFullAddress: order.restaurantAddress
          ? `${order.restaurantAddress.street}, ${order.restaurantAddress.city}, ${order.restaurantAddress.nationality}`
          : order.restaurantFullAddress || "N/A",
      }));

      // CRITICAL FIX: Merge API data with persisted Redux state
      // This ensures we don't lose real-time updates when fetching fresh data
      const mergedOrders = mergeOrdersWithRealtimeData(
        apiOrders,
        realtimeOrders
      );
      setOrders(mergedOrders || []);

      console.log("📊 Orders merged:", {
        apiCount: apiOrders.length,
        realtimeCount: realtimeOrders.length,
        mergedCount: mergedOrders.length,
      });
    } catch (error) {
      console.error("Error fetching orders:", error);
      // CRITICAL FIX: If API fails, still use persisted data
      const fallbackOrders = convertRealtimeToOrderTracking(realtimeOrders);
      setOrders(fallbackOrders);
      console.log("📊 Using fallback persisted data:", fallbackOrders.length);
    } finally {
      setLoading(false);
    }
  }, [id, realtimeOrders]);

  // REMOVED: Duplicate loading - RootLayout already loads persisted data
  // The issue was that OrdersScreen was loading persisted data AFTER socket events
  // Now RootLayout loads it first, then socket connects, then OrdersScreen uses the data

  // CRITICAL FIX: React to changes in realtime orders and merge with local state
  useEffect(() => {
    if (realtimeOrders.length > 0) {
      console.log(
        "🔄 Realtime orders changed, updating local state:",
        realtimeOrders.length
      );
      // Merge realtime orders with existing orders
      const mergedOrders = mergeOrdersWithRealtimeData(orders, realtimeOrders);

      // Only update if there are actual changes
      if (
        mergedOrders.length !== orders.length ||
        mergedOrders.some(
          (order, index) =>
            !orders[index] || order.updated_at !== orders[index].updated_at
        )
      ) {
        setOrders(mergedOrders);
        console.log(
          "📊 Updated orders from realtime data:",
          mergedOrders.length
        );
      }
    } else if (realtimeOrders.length === 0 && orders.length > 0) {
      // CRITICAL FIX: Don't clear orders when realtime becomes empty
      // This prevents the race condition where AsyncStorage load clears realtime orders
      console.log(
        "🚫 Preventing order clearing - realtime orders became empty but local orders exist"
      );
    }
  }, [realtimeOrders]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const { activeOrders, completedOrders, cancelledOrders } = useMemo(() => {
    // Filter orders with additional validation
    const validOrders = orders.filter(isValidOrder);

    console.log("Filtering orders:", {
      total: validOrders.length,
      statuses: validOrders.map((o) => o.status || o.tracking_info),
    });

    const active = validOrders.filter((order) => {
      const orderStatus = order.status || order.tracking_info;
      return (
        orderStatus !== Enum_OrderStatus.DELIVERED &&
        orderStatus !== Enum_OrderStatus.CANCELLED &&
        orderStatusStages.includes(orderStatus)
      );
    });

    const completed = validOrders.filter((order) => {
      const orderStatus = order.status || order.tracking_info;
      return orderStatus === Enum_OrderStatus.DELIVERED;
    });

    const cancelled = validOrders.filter((order) => {
      const orderStatus = order.status || order.tracking_info;
      return orderStatus === Enum_OrderStatus.CANCELLED;
    });

    return {
      activeOrders: active,
      completedOrders: completed,
      cancelledOrders: cancelled,
    };
  }, [orders, orderStatusStages]);

  const handleReOrder = useCallback(
    (data: OrderTracking) => {
      const mappedData = mapOrderTrackingToOrder(data);
      navigation.navigate("Checkout", { orderItem: mappedData });
    },
    [navigation]
  );

  // Add an effect to monitor active orders
  useEffect(() => {}, [activeOrders, realtimeOrders]);

  const tabContent = useMemo(
    () => [
      <OrderTabContent
        orderStatusStages={orderStatusStages}
        navigation={navigation}
        refetchOrders={fetchOrders}
        isLoading={loading}
        key="active"
        setIsLoading={setLoading}
        type="ACTIVE"
        setOrders={setOrders}
        orders={activeOrders}
      />,
      <OrderTabContent
        isLoading={loading}
        setOrders={setOrders}
        key="completed"
        navigation={navigation}
        type="COMPLETED"
        orders={completedOrders}
        onReOrder={handleReOrder}
      />,
      <OrderTabContent
        key="cancelled"
        setOrders={setOrders}
        type="CANCELLED"
        orders={cancelledOrders}
      />,
    ],
    [
      activeOrders,
      completedOrders,
      cancelledOrders,
      loading,
      navigation,
      fetchOrders,
      handleReOrder,
      orderStatusStages,
    ]
  );

  return (
    <FFSafeAreaView>
      <FFTab
        tabTitles={["Ongoing", "Completed", "Cancelled"]}
        tabContent={tabContent}
        activeTabIndex={0}
      />
    </FFSafeAreaView>
  );
};

export default React.memo(OrdersScreen);
