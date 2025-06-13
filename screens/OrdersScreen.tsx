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

// Helper function to convert OrderTracking to StoreOrderTracking
const mapToStoreOrder = (order: OrderTracking): Partial<StoreOrderTracking> => {
  const now = Math.floor(Date.now() / 1000);
  const orderStatus = order.status || order.tracking_info;

  if (!isValidOrderStatus(orderStatus)) {
    console.log(
      "Warning: Invalid order status in mapToStoreOrder",
      orderStatus
    );
    // Return a minimal valid object instead of null
    return {
      orderId: order.id,
      status: Enum_OrderStatus.PENDING, // Default to PENDING if invalid
      updated_at: now,
      customer_id: order.customer_id,
      restaurant_id: order.restaurant_id,
    };
  }

  return {
    orderId: order.id,
    status: orderStatus,
    tracking_info: order.tracking_info,
    updated_at: now,
    customer_id: order.customer_id,
    driver_id: order.driver_id || "",
    restaurant_id: order.restaurant_id,
    restaurant_avatar: order.restaurant?.avatar || null,
    driver_avatar: null,
    restaurantAddress: order.restaurantAddress || null,
    customerAddress: order.customerAddress || null,
    driverDetails: null,
    customerFullAddress: order.customerFullAddress || "",
    restaurantFullAddress: order.restaurantFullAddress || "",
    distance: order.distance,
  };
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
      const newOrders = (res.data.data as OrderTracking[]).map((order) => ({
        ...order,
        customerFullAddress: order.customerAddress
          ? `${order.customerAddress.street}, ${order.customerAddress.city}, ${order.customerAddress.nationality}`
          : order.customerFullAddress || "N/A",
        restaurantFullAddress: order.restaurantAddress
          ? `${order.restaurantAddress.street}, ${order.restaurantAddress.city}, ${order.restaurantAddress.nationality}`
          : order.restaurantFullAddress || "N/A",
      }));
      setOrders(newOrders || []);
    } catch (error) {
      console.error("Error fetching orders:", error);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, [id]);

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

    console.log("Order counts:", {
      active: active.length,
      completed: completed.length,
      cancelled: cancelled.length,
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
  useEffect(() => {
    console.log("Order state check:", {
      localActive: activeOrders.length,
      realtimeOrders: realtimeOrders.length,
      activeStatuses: activeOrders.map((o) => o.status),
      realtimeStatuses: realtimeOrders.map((o) => o.status),
    });
  }, [activeOrders, realtimeOrders]);

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
