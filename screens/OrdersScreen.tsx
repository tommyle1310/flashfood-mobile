import { View } from "react-native";
import React, { useEffect, useState } from "react";
import FFSafeAreaView from "@/src/components/FFSafeAreaView";
import FFText from "@/src/components/FFText";
import { RootState } from "@/src/store/store";
import { useSelector } from "@/src/store/types";
import axiosInstance from "@/src/utils/axiosConfig";
import { OrderTracking } from "@/src/types/screens/Order";

const OrdersScreen = () => {
  const { id } = useSelector((state: RootState) => state.auth);
  const [orders, setOrders] = useState<OrderTracking[]>([]);
  useEffect(() => {
    axiosInstance.get(`/customers/orders/${id}`).then((res) => {
      setOrders(res.data.data);
    });
  }, [id]);
  console.log(
    "check orders finsish",
    orders.filter((order) => order.status === "DELIVERED")
  );
  console.log(
    "check orders in progress",
    orders.filter(
      (order) => order.status !== "DELIVERED" && order.status !== "CANCELLED"
    )
  );
  return (
    <FFSafeAreaView>
      <View className="flex flex-row gap-4 p-4 flex-1">
        <FFText>orders</FFText>
      </View>
    </FFSafeAreaView>
  );
};

export default OrdersScreen;
