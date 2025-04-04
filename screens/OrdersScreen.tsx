import React, { useEffect, useState } from "react";
import { useSelector } from "@/src/store/types";
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

export type OrderScreenNavigationProp = StackNavigationProp<
  MainStackParamList,
  "BottomTabs"
>;

const OrdersScreen: React.FC = () => {
  const { id } = useSelector((state: RootState) => state.auth);
  const [orders, setOrders] = useState<OrderTracking[]>([]);
  const [activeOrders, setActiveOrders] = useState<OrderTracking[]>([]);
  const [completedOrders, setCompletedOrders] = useState<OrderTracking[]>([]);
  const [cancelledOrders, setCancelledOrders] = useState<OrderTracking[]>([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation<OrderScreenNavigationProp>();
  const orderStatusStages: Enum_OrderStatus[] = [
    Enum_OrderStatus["PENDING"],
    Enum_OrderStatus["PREPARING"],
    Enum_OrderStatus["READY_FOR_PICKUP"],
    Enum_OrderStatus["RESTAURANT_PICKUP"],
    Enum_OrderStatus["DISPATCHED"],
    Enum_OrderStatus["EN_ROUTE"],
    Enum_OrderStatus["DELIVERED"],
  ];

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get(`/customers/orders/${id}`);
      setOrders(res.data.data);
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [id]);

  useEffect(() => {
    setActiveOrders(
      orders.filter(
        (order) =>
          order?.status !== "DELIVERED" && order?.status !== "CANCELLED"
      )
    );
    setCompletedOrders(orders.filter((order) => order?.status === "DELIVERED"));
    setCancelledOrders(orders.filter((order) => order?.status === "CANCELLED"));
  }, [orders]);

  const handleReOrder = (data: OrderTracking) => {
    const mappedData = mapOrderTrackingToOrder(data);
    console.log("check data map ", mappedData);
    navigation.navigate("Checkout", { orderItem: mappedData });
  };

  const tabContent = [
    <OrderTabContent
      orderStatusStages={orderStatusStages}
      navigation={navigation}
      refetchOrders={fetchOrders}
      isLoading={loading}
      key="active"
      setIsLoading={setLoading}
      type="ACTIVE"
      orders={activeOrders}
    />,
    <OrderTabContent
      isLoading={loading}
      key="completed"
      navigation={navigation}
      type="COMPLETED"
      orders={completedOrders}
      onReOrder={handleReOrder}
    />,
    <OrderTabContent
      key="cancelled"
      type="CANCELLED"
      orders={cancelledOrders}
    />,
  ];

  return (
    <FFSafeAreaView>
      <FFTab
        tabTitles={["Ongoing", "Completed", "Cancelled"]}
        tabContent={tabContent}
        activeTabIndex={0}
        onTabChange={(index) => console.log("Tab changed to:", index)}
      />
    </FFSafeAreaView>
  );
};

export default OrdersScreen;
