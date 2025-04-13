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
  restaurant_avatar: string | null;
  driver_avatar: string | null;
  restaurantAddress: AddressBook;
  customerAddress: AddressBook;
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
      
      // Chuẩn hóa dữ liệu trước khi dispatch
      const normalizedData = {
        ...data,
        driver_id: data.driver_id || null,
        restaurantAddress: undefined, // Xóa đối tượng AddressBook
        customerAddress: undefined,  // Xóa đối tượng AddressBook
        restaurantFullAddress: data.restaurantAddress
          ? `${data.restaurantAddress.street}, ${data.restaurantAddress.city}, ${data.restaurantAddress.nationality}`
          : "N/A",
        customerFullAddress: data.customerAddress
          ? `${data.customerAddress.street}, ${data.customerAddress.city}, ${data.customerAddress.nationality}`
          : "N/A",
      };

      if (data.status === Enum_OrderStatus.DELIVERED) {
        navigation.navigate("Rating", {
          driver: {
            id: data.driver_id || "unknown",
            avatar: data.driver_avatar ? { url: data.driver_avatar, key: "" } : null,
          },
          restaurant: {
            id: data.restaurant_id,
            avatar: data.restaurant_avatar ? { url: data.restaurant_avatar, key: "" } : null,
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