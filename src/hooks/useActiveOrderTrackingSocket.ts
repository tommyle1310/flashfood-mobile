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
import { Avatar } from "../types/common";

type OrderTrackingSocket = {
  orderId: string;
  status: Enum_OrderStatus;
  tracking_info: Enum_OrderTrackingInfo;
  updated_at: number;
  customer_id: string;
  driver_avatar: Avatar;
  restaurant_avatar: Avatar;
  driver_id: string;
  restaurant_id: string;
};

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
      console.log("Event received:", data);
      if (data.status === Enum_OrderStatus.DELIVERED) {
        navigation.navigate("Rating", {
          driver: {
            id: data.driver_id,
            avatar: data.driver_avatar,
          },
          restaurant: {
            id: data.restaurant_id,
            avatar: data.restaurant_avatar,
          },
          orderId: data.orderId,
        });
        dispatch(removeOrderTracking(data.orderId));
      } else {
        dispatch(updateAndSaveOrderTracking(data));
      }
    };

    socketInstance.on("notifyOrderStatus", (data: OrderTrackingSocket) => {
      console.log("check datât", data);
      handleOrderUpdate(data);
    });

    setSocket(socketInstance);

    return () => {
      if (socketInstance) socketInstance.disconnect();
    };
  }, [accessToken, id, dispatch]);

  return {
    socket,
  };
};
