import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import { useDispatch, useSelector } from "@/src/store/types";
import { RootState } from "@/src/store/store";
import { BACKEND_URL } from "../utils/constants";
import { Enum_OrderStatus, Enum_OrderTrackingInfo } from "../types/Orders";
import {
  removeOrderTracking,
  updateAndSaveOrderTracking,
} from "@/src/store/orderTrackingRealtimeSlice";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { MainStackParamList } from "../navigation/AppNavigator";

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

type OrderScreenNavigationProp = StackNavigationProp<
  MainStackParamList,
  "BottomTabs"
>;

export const useActiveOrderTrackingSocket = () => {
  const navigation = useNavigation<OrderScreenNavigationProp>();
  const [socket, setSocket] = useState<Socket | null>(null);
  const { accessToken, id } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();

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
    });

    socketInstance.on("connect", () => {
      console.log("Connected to order tracking server");
      setSocket(socketInstance);
    });

    socketInstance.on("disconnect", (reason) => {
      console.log("Disconnected from order tracking server:", reason);
      setSocket(null);
    });

    socketInstance.on("connect_error", (error) => {
      console.error("Connection error:", error.name, error.cause);
      setSocket(null);
    });

    const handleOrderUpdate = (data: OrderTrackingSocket) => {
      console.log("Event received:", JSON.stringify(data, null, 2));

      // Normalize data before dispatching
      const normalizedData = {
        orderId: data.orderId,
        status: data.status,
        tracking_info: data.tracking_info,
        updated_at: data.updated_at,
        customer_id: data.customer_id,
        driver_id: data.driver_id || null,
        restaurant_id: data.restaurant_id,
        restaurant_avatar: data.restaurant_avatar || null,
        driver_avatar: data.driver_avatar || null,
        restaurantAddress: data.restaurantAddress || null,
        customerAddress: data.customerAddress || null,
        driverDetails: data.driverDetails || null,
        restaurantFullAddress: data.restaurantFullAddress || "N/A",
        customerFullAddress: data.customerFullAddress || "N/A",
      };

      if (data.status === Enum_OrderStatus.DELIVERED) {
        navigation.navigate("Rating", {
          driver: {
            id: data.driver_id || "unknown",
            avatar: data.driver_avatar || null,
            // Include driverDetails for Rating screen if needed
            first_name: data.driverDetails?.first_name || "Unknown",
            last_name: data.driverDetails?.last_name || "",
          },
          restaurant: {
            id: data.restaurant_id,
            avatar: data.restaurant_avatar || null,
          },
          orderId: data.orderId,
        });
        dispatch(removeOrderTracking(data.orderId));
      } else {
        dispatch(updateAndSaveOrderTracking(normalizedData));
      }
    };

    socketInstance.on("notifyOrderStatus", (data: OrderTrackingSocket) => {
      console.log("check data:", JSON.stringify(data, null, 2));
      handleOrderUpdate(data);
    });

    setSocket(socketInstance);

    return () => {
      if (socketInstance) socketInstance.disconnect();
    };
  }, [accessToken, id, dispatch, navigation]);

  return {
    socket,
  };
};