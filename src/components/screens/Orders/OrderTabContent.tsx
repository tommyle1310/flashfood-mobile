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
      const response = await axiosInstance.post("/orders/tip", {
        orderId: firstActiveOrder?.orderId || activeOrderDetails?.id,
        tip: tipAmount,
      });
      console.log("tip to driver response", response.data);
      const { EC, EM, data } = response.data;
      if (EC === 0) {
        setIsTippedSuccessful(true);
      }
    } catch (error) {
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
    if (orders?.[0]?.driver_id) {
      setDriverDetails(orders[0].driver);
    }
    setActiveOrderDetails(orders[0]);
  }, [orders]);

  return (
    <ScrollView className="gap-4 p-4">
      <View className="gap-4">
        {type !== "ACTIVE" &&
          detailedOrder === null &&
          orders.map((item, i) => (
            <View
              key={item.id || i}
              style={{ marginBottom: i === orders.length - 1 ? 200 : 0 }}
            >
              <OrderCard
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
