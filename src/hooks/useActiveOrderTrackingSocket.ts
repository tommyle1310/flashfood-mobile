import { useEffect, useState, useCallback } from "react";
import { io, Socket } from "socket.io-client";
import { useDispatch, useSelector } from "@/src/store/types";
import store, { RootState } from "@/src/store/store";
import { BACKEND_URL } from "../utils/constants";
import {
  Enum_OrderStatus,
  Enum_OrderTrackingInfo,
  OrderTrackingBase,
} from "../types/Orders";
import {
  removeOrderTracking,
  updateAndSaveOrderTracking,
  clearOrderTracking,
} from "@/src/store/orderTrackingRealtimeSlice";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { MainStackParamList } from "../navigation/AppNavigator";
import axiosInstance from "@/src/utils/axiosConfig";
import { OrderTracking } from "@/src/types/screens/Order";
import { Avatar } from "@/src/types/common";

interface AddressBook {
  id: string;
  street: string;
  city: string;
  nationality: string;
  is_default: boolean;
  created_at: number;
  updated_at: number;
  postal_code: number;
  location: { lat: number; lng: number };
  title: string;
}

interface OrderTrackingSocket {
  orderId: string;
  status: Enum_OrderStatus;
  tracking_info: Enum_OrderTrackingInfo;
  updated_at: number;
  customer_id: string;
  driver_id: string | null;
  restaurant_id: string;
  restaurant_avatar: { key: string; url: string } | null;
  driver_avatar: { key: string; url: string } | null;
  restaurantAddress: AddressBook | null;
  customerAddress: AddressBook | null;
  driverDetails: {
    id: string;
    first_name: string;
    last_name: string;
    avatar: { key: string; url: string } | null;
    rating: { average_rating: string };
    vehicle: {
      color: string;
      model: string;
      license_plate: string;
    };
  } | null;
  customerFullAddress: string;
  restaurantFullAddress: string;
}

interface OrderTrackingState {
  orders: OrderTracking[];
}

interface DriverRatingInfo {
  id: string;
  avatar: Avatar | null;
}

interface RestaurantRatingInfo {
  id: string;
  avatar: Avatar | null;
}

type OrderScreenNavigationProp = StackNavigationProp<
  MainStackParamList,
  "BottomTabs"
>;

export const useActiveOrderTrackingSocket = () => {
  const navigation = useNavigation<OrderScreenNavigationProp>();
  const [socket, setSocket] = useState<Socket | null>(null);
  const { accessToken, id } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();
  const [reconnectAttempts, setReconnectAttempts] = useState(0);
  const MAX_RECONNECT_ATTEMPTS = 5;

  const cleanupStaleOrders = useCallback(async () => {
    try {
      const response = await axiosInstance.get(`/customers/orders/${id}`);
      const serverOrders = response.data.data || [];
      const serverOrderIds = new Set(
        serverOrders.map((o: OrderTracking) => o.id)
      );

      // Get current orders from Redux
      const state = store.getState() as {
        orderTrackingRealtime: OrderTrackingState;
      };
      const currentOrders = state.orderTrackingRealtime.orders;

      // Remove any orders that don't exist on the server
      currentOrders.forEach((order: OrderTracking) => {
        if (!serverOrderIds.has(order.orderId || order.id)) {
          console.log(
            `Removing stale order ${
              order.orderId || order.id
            } - not found on server`
          );
          dispatch(removeOrderTracking(order.orderId || order.id));
        }
      });
    } catch (error) {
      console.error("Error cleaning up stale orders:", error);
    }
  }, [id, dispatch]);

  useEffect(() => {
    if (!accessToken) {
      console.log("No access token available");
      return;
    }

    const socketInstance = io(`${BACKEND_URL}/customer`, {
      transports: ["websocket"],
      extraHeaders: {
        auth: `Bearer ${accessToken}`,
      },
      reconnectionAttempts: MAX_RECONNECT_ATTEMPTS,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
    });

    socketInstance.on("connect", () => {
      console.log("Connected to order tracking server");
      setSocket(socketInstance);
      setReconnectAttempts(0);
      // Clean up stale orders on successful connection
      cleanupStaleOrders();
    });

    socketInstance.on("disconnect", (reason) => {
      console.log("Disconnected from order tracking server:", reason);
      setSocket(null);

      if (
        reason === "io server disconnect" ||
        reason === "io client disconnect"
      ) {
        // Server/client initiated the disconnect, don't attempt to reconnect
        return;
      }

      setReconnectAttempts((prev) => {
        const newAttempts = prev + 1;
        if (newAttempts >= MAX_RECONNECT_ATTEMPTS) {
          console.log(
            "Max reconnection attempts reached, clearing order tracking"
          );
          dispatch(clearOrderTracking());
        }
        return newAttempts;
      });
    });

    socketInstance.on("connect_error", (error) => {
      console.error("Connection error:", error.name, error.cause);
      setSocket(null);
    });

    const handleOrderUpdate = async (data: OrderTrackingSocket) => {
      console.log("Socket event received:", {
        orderId: data.orderId,
        status: data.status,
        tracking: data.tracking_info,
      });

      try {
        // Validate that this order exists on the server
        const response = await axiosInstance.get(
          `/orders/${data.orderId}/status`
        );

        if (!response.data) {
          console.log(
            "Order not found on server, removing from tracking:",
            data.orderId
          );
          dispatch(removeOrderTracking(data.orderId));
          return;
        }

        // Use socket status if server status is not available
        const orderStatus = response.data.status || data.status;
        const trackingInfo = data.tracking_info;

        // Log status changes
        console.log("Order status update:", {
          orderId: data.orderId,
          previousStatus: data.status,
          newStatus: orderStatus,
          tracking: trackingInfo,
          serverStatus: response.data.status,
        });

        // For delivered orders, show rating screen but keep the order
        if (orderStatus === Enum_OrderStatus.DELIVERED) {
          const driverInfo: DriverRatingInfo = {
            id: data.driver_id || "unknown",
            avatar: data.driver_avatar,
          };

          const restaurantInfo: RestaurantRatingInfo = {
            id: data.restaurant_id,
            avatar: data.restaurant_avatar,
          };

          navigation.navigate("Rating", {
            driver: driverInfo,
            restaurant: restaurantInfo,
            orderId: data.orderId,
          });
        }

        // For active orders, verify all required fields are present
        if (
          !data.orderId ||
          !data.customer_id ||
          !data.restaurant_id ||
          !orderStatus
        ) {
          console.log("Invalid order data received:", {
            orderId: data.orderId,
            customerId: data.customer_id,
            restaurantId: data.restaurant_id,
            status: orderStatus,
            data: data,
          });
          return;
        }

        // Convert address types
        const convertAddress = (address: AddressBook | null) => {
          if (!address) {
            // Return default address object when null
            return {
              id: "default",
              street: "",
              city: "",
              nationality: "",
              is_default: false,
              created_at: Math.floor(Date.now() / 1000),
              updated_at: Math.floor(Date.now() / 1000),
              postal_code: 0,
              location: {
                lat: 0,
                lon: 0,
              },
              title: "",
            };
          }
          return {
            id: address.id,
            street: address.street,
            city: address.city,
            nationality: address.nationality,
            is_default: address.is_default,
            created_at: address.created_at,
            updated_at: address.updated_at,
            postal_code: address.postal_code,
            location: {
              lat: address.location.lat,
              lon: address.location.lng,
            },
            title: address.title,
          };
        };

        // Normalize data before dispatching
        const normalizedData: OrderTracking = {
          id: data.orderId,
          orderId: data.orderId,
          status: orderStatus,
          tracking_info: trackingInfo,
          updated_at: data.updated_at,
          customer_id: data.customer_id,
          driver_id: data.driver_id || "",
          restaurant_id: data.restaurant_id,
          restaurant_avatar: data.restaurant_avatar || null,
          driver_avatar: data.driver_avatar || null,
          restaurantAddress: convertAddress(data.restaurantAddress),
          customerAddress: convertAddress(data.customerAddress),
          driverDetails: data.driverDetails || null,
          restaurantFullAddress: data.restaurantFullAddress || "",
          customerFullAddress: data.customerFullAddress || "",
          // Add required fields for OrderTracking type
          customer: {
            avatar: null,
            favorite_items: null,
            first_name: "",
            id: data.customer_id,
            last_name: "",
          },
          customer_location: "",
          customer_note: "",
          delivery_time: "0",
          distance: "0",
          driver: data.driver_id
            ? {
                id: data.driver_id,
                avatar: data.driver_avatar,
              }
            : null,
          order_items: [],
          order_time: "0",
          payment_method: "",
          payment_status: "PENDING",
          restaurant: {
            id: data.restaurant_id,
            avatar: data.restaurant_avatar,
          },
          restaurant_location: "",
          restaurant_note: "",
          total_amount: "0",
        };

        console.log("Updating order tracking:", {
          orderId: normalizedData.orderId,
          status: normalizedData.status,
          tracking_info: normalizedData.tracking_info,
        });

        dispatch(updateAndSaveOrderTracking(normalizedData));
      } catch (error) {
        console.error("Error handling order update:", error);
        // If we can't verify the order with the server, remove it from tracking
        dispatch(removeOrderTracking(data.orderId));
      }
    };

    socketInstance.on("notifyOrderStatus", (data: OrderTrackingSocket) => {
      console.log("check data:", JSON.stringify(data, null, 2));
      handleOrderUpdate(data);
    });

    setSocket(socketInstance);

    return () => {
      if (socketInstance) {
        socketInstance.disconnect();
        // Clean up orders when unmounting
        dispatch(clearOrderTracking());
      }
    };
  }, [accessToken, id, dispatch, navigation, cleanupStaleOrders]);

  return {
    socket,
    reconnectAttempts,
  };
};
