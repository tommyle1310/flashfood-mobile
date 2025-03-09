import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import { useDispatch, useSelector } from "@/src/store/types";
import { RootState } from "@/src/store/store";
import { BACKEND_URL } from "../utils/constants";
import { Enum_OrderStatus, Enum_TrackingInfo } from "../types/Orders";
import {
  removeOrderTracking,
  saveOrderTrackingToAsyncStorage,
  updateOrderTracking,
} from "@/src/store/orderTrackingRealtimeSlice"; // Import action

type OrderTrackingSocket = {
  orderId: string;
  status: Enum_OrderStatus;
  tracking_info: Enum_TrackingInfo;
  updated_at: number;
  customer_id: string;
  driver_id: string;
  restaurant_id: string;
};

export const useActiveOrderTrackingSocket = () => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const { accessToken, id } = useSelector((state: RootState) => state.auth);
  const orders = useSelector(
    (state: RootState) => state.orderTrackingRealtime.orders
  ); // Lấy toàn bộ orders
  const dispatch = useDispatch();

  useEffect(() => {
    if (!accessToken) {
      console.log("No access token available");
      return;
    }

    const socketInstance = io(`${BACKEND_URL}customer`, {
      transports: ["websocket"],
      extraHeaders: {
        auth: `Bearer ${accessToken}`,
      },
    });

    socketInstance.on("connect", () => {
      console.log("Connected to order tracking server");
      setSocket(socketInstance);
    });

    if (id) {
      socketInstance.emit("joinRoomCustomer", id);
    } else {
      console.log("Please provide a customer ID");
    }

    socketInstance.on("disconnect", (reason) => {
      console.log("Disconnected from order tracking server:", reason);
      setSocket(null);
    });

    socketInstance.on("connect_error", (error) => {
      console.error("Connection error:", error);
      setSocket(null);
    });

    const handleOrderUpdate = (data: OrderTrackingSocket) => {
      console.log("Event received:", data);
      if (data.status === Enum_OrderStatus.DELIVERED) {
        dispatch(removeOrderTracking(data.orderId));
      } else {
        dispatch(updateOrderTracking(data));
      }
      // Lưu toàn bộ danh sách orders vào AsyncStorage
      dispatch(saveOrderTrackingToAsyncStorage(orders));
    };

    socketInstance.on(
      "orderTrackingUpdate",
      (data: { data: OrderTrackingSocket }) => {
        handleOrderUpdate(data.data);
      }
    );

    socketInstance.on(
      "restaurantPreparingOrder",
      (data: { data: OrderTrackingSocket }) => {
        handleOrderUpdate(data.data);
      }
    );

    socketInstance.on("customerPlaceOrder", (data: OrderTrackingSocket) => {
      handleOrderUpdate(data);
    });

    setSocket(socketInstance);

    return () => {
      if (socketInstance) socketInstance.disconnect();
    };
  }, [accessToken, id, dispatch, orders]); // Thêm orders vào dependency

  return {
    socket,
  };
};
