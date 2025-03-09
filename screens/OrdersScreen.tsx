import {
  View,
  Image,
  ScrollView,
  TouchableOpacity,
  Text,
  Pressable,
} from "react-native";
import React, { useEffect, useState } from "react";
import FFSafeAreaView from "@/src/components/FFSafeAreaView";
import FFText from "@/src/components/FFText";
import { RootState } from "@/src/store/store";
import { useSelector } from "@/src/store/types";
import axiosInstance from "@/src/utils/axiosConfig";
import { OrderTracking } from "@/src/types/screens/Order";
import FFProgressStage from "@/src/components/FFProgressStage";
import FFView from "@/src/components/FFView";
import FFInputControl from "@/src/components/FFInputControl";
import FFAvatar from "@/src/components/FFAvatar";
import IconFeather from "react-native-vector-icons/Feather";
import IconIonicons from "react-native-vector-icons/Ionicons";
import FFBadge from "@/src/components/FFBadge";
import FFSeperator from "@/src/components/FFSeperator";
import FFTab from "@/src/components/FFTab.conventional";
import FFButton from "@/src/components/FFButton";
import { formatTimestampToDate } from "@/src/utils/dateConverter";
import Spinner from "@/src/components/FFSpinner";
import { IMAGE_LINKS } from "@/src/assets/imageLinks";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { BottomTabParamList } from "@/src/navigation/AppNavigator";
import { OrderTracking as OrderTrackingRealtime } from "@/src/store/orderTrackingRealtimeSlice";
import { Enum_TrackingInfo } from "@/src/types/Orders";

const skeletonTabContent = ({
  type,
  data,
}: {
  type: "ACTIVE" | "COMPLETED" | "CANCELLED";
  data: OrderTracking[];
}) => {
  const { orders: orderTrackingRealtimeOrders } = useSelector(
    (state: RootState) => state.orderTrackingRealtime
  );

  const [isExpandedOrderItem, setIsExpandedOrderItem] = useState(false);
  const [firstActiveOrder, setFirstActiveOrder] =
    useState<OrderTrackingRealtime | null>(null);
  const [detailedOrder, setDetailedOrder] = useState<OrderTracking | null>(
    null
  );
  useEffect(() => {
    if (orderTrackingRealtimeOrders.length > 0) {
      setFirstActiveOrder(orderTrackingRealtimeOrders[0]);
    }
  }, [orderTrackingRealtimeOrders]);
  console.log("check orderTrackingRealtimeOrders", orderTrackingRealtimeOrders);

  return (
    <ScrollView className="gap-4 p-4">
      <View className="gap-4 ">
        {type !== "ACTIVE" &&
          detailedOrder === null &&
          data?.map((item) => (
            <Pressable
              key={item.id}
              onPress={() => setDetailedOrder(item)}
              style={{ elevation: 3 }}
              className="flex flex-col gap-4 p-4 flex-1 bg-white rounded-lg items-center"
            >
              <View className="flex flex-row justify-between gap-2 items-center">
                <FFText fontSize="sm">
                  {item?.restaurant.specialize_in[0] ?? "Japanese"}
                </FFText>
                <FFText style={{ flex: 1, color: "#7dbf72" }} fontSize="sm">
                  Completed
                </FFText>
                <FFText style={{ color: "#aaa" }} fontSize="sm">
                  {formatTimestampToDate(+item?.delivery_time)}
                </FFText>
              </View>
              <FFSeperator />
              <View className="flex flex-row gap-2">
                <FFAvatar
                  size={70}
                  rounded="md"
                  avatar={
                    item?.restaurant?.avatar?.url ??
                    IMAGE_LINKS.DEFAULT_AVATAR_FOOD
                  }
                />
                <View className="flex-1">
                  <FFText>{item?.restaurant.restaurant_name}</FFText>
                  <FFText fontSize="sm" style={{ color: "#aaa" }}>
                    {item?.restaurantAddress?.street},{" "}
                    {item?.restaurantAddress?.city},{" "}
                    {item?.restaurantAddress?.nationality}
                  </FFText>
                  <View className="flex flex-row gap-2 items-center mt-1">
                    <FFText fontSize="sm" style={{ color: "#7dbf72" }}>
                      ${item?.total_amount}
                    </FFText>
                    <FFText fontSize="sm" style={{ color: "#aaa" }}>
                      {item?.order_items?.length} items
                    </FFText>
                  </View>
                </View>
              </View>
              <View className="flex flex-row gap-2 flex-1">
                <FFButton
                  variant="outline"
                  className="w-full"
                  style={{ flex: 1 }}
                >
                  Rate
                </FFButton>
                <FFButton className="w-full" style={{ flex: 1 }}>
                  Re-Order
                </FFButton>
              </View>
            </Pressable>
          ))}
      </View>
      {detailedOrder !== null && (
        <TouchableOpacity
          className="flex-row items-center gap-1 mb-4"
          onPress={() => setDetailedOrder(null)}
        >
          <IconIonicons name="chevron-back" style={{ fontSize: 20 }} />
          <FFText fontWeight="400">Go back</FFText>
        </TouchableOpacity>
      )}
      <View
        style={{ marginBottom: 200 }}
        className="flex flex-col gap-4 flex-1 w-full items-center"
      >
        {type === "ACTIVE" &&
          (detailedOrder || orderTrackingRealtimeOrders?.length > 0) && (
            <>
              <View className="w-full p-4">
                <FFProgressStage
                  stageText="Arriving at 10:15"
                  completedSegments={3}
                  totalSegments={5}
                />
              </View>
              <Image
                source={{
                  uri:
                    firstActiveOrder?.tracking_info ===
                    Enum_TrackingInfo.PREPARING
                      ? IMAGE_LINKS.RESTAURANT_PREPARING
                      : firstActiveOrder?.tracking_info ===
                        Enum_TrackingInfo.OUT_FOR_DELIVERY
                      ? IMAGE_LINKS.DELIVERING_TO_CUSTOMER
                      : firstActiveOrder?.tracking_info ===
                        Enum_TrackingInfo.ORDER_PLACED
                      ? IMAGE_LINKS.ORDER_PLACED
                      : firstActiveOrder?.tracking_info ===
                        Enum_TrackingInfo.RESTAURANT_PICKUP
                      ? IMAGE_LINKS.RESTAURANT_PICKUP
                      : IMAGE_LINKS.DEFAULT_AVATAR_FOOD,
                }}
                style={{
                  width: "100%",
                  height: 200,
                  borderRadius: 12,
                  resizeMode: "cover",
                }}
              />
              <FFView
                style={{
                  width: "100%",
                  padding: 12,
                  borderRadius: 12,
                  gap: 20,
                  elevation: 3,
                }}
              >
                <View className="flex flex-row gap-2 items-center">
                  <View className="relative">
                    <FFAvatar size={50} />
                    <View className="absolute -bottom-2 left-3 p-1 rounded-lg bg-[#56a943]">
                      <FFText
                        fontSize="sm"
                        fontWeight="400"
                        style={{ color: "#fff" }}
                      >
                        4.8
                      </FFText>
                    </View>
                  </View>
                  <View>
                    <View className="flex-row items-center gap-2">
                      <FFText style={{ color: "#4c9f3a" }}>
                        {detailedOrder?.driver?.first_name ?? "df"},{" "}
                        {detailedOrder?.driver?.last_name ?? "dl"}
                      </FFText>
                      <FFText fontSize="sm" style={{ marginTop: 2 }}>
                        59D2 - 99421
                      </FFText>
                    </View>
                    <FFText fontWeight="400" fontSize="sm">
                      White Winner X
                    </FFText>
                  </View>
                </View>
                <View className="flex flex-row gap-2 items-center">
                  <TouchableOpacity
                    style={{
                      width: 50,
                      height: 50,
                      backgroundColor: "#ddd",
                      borderRadius: 9999,
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <IconFeather name="phone" size={20} color="#222" />
                  </TouchableOpacity>
                  <TouchableOpacity className="flex flex-row bg-gray-200 p-4 rounded-full flex-1">
                    <Text>Send a Message</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={{
                      paddingHorizontal: 12,
                      height: 50,
                      backgroundColor: "#ddd",
                      borderRadius: 24,
                      alignItems: "center",
                      justifyContent: "center",
                      flexDirection: "row",
                      gap: 4,
                    }}
                  >
                    <IconFeather name="plus" size={20} color="#222" />
                    <Text>Tips</Text>
                  </TouchableOpacity>
                </View>
              </FFView>
            </>
          )}
        {(type === "ACTIVE" || detailedOrder !== null) &&
          (detailedOrder === null &&
          (orderTrackingRealtimeOrders?.length === 0 ||
            firstActiveOrder?.tracking_info === Enum_TrackingInfo.DELIVERED) ? (
            <View className="w-full gap-4">
              <Image
                source={{
                  uri: IMAGE_LINKS.EMPTY_ORDERS,
                }}
                style={{
                  width: "100%",
                  height: 200,
                  borderRadius: 12,
                  resizeMode: "cover",
                }}
              />
              <FFText
                fontWeight="400"
                style={{ textAlign: "center", color: "#777" }}
              >
                You have no active orders...
              </FFText>
              <FFButton variant="link">Browse some food</FFButton>
            </View>
          ) : (
            <>
              <FFView
                style={{
                  width: "100%",
                  padding: 12,
                  borderRadius: 12,
                  gap: 4,
                  elevation: 3,
                }}
              >
                <FFText fontSize="lg">Delivery details</FFText>
                <FFInputControl
                  label="My address"
                  value={`${detailedOrder?.restaurantAddress?.street}, ${detailedOrder?.customerAddress?.city}, ${detailedOrder?.customerAddress?.nationality}`}
                  readonly
                />
                <FFInputControl
                  label="Restaurant address"
                  value={`${detailedOrder?.restaurantAddress?.street}, ${detailedOrder?.restaurantAddress?.city}, ${detailedOrder?.restaurantAddress?.nationality}`}
                  readonly
                />
                <FFInputControl
                  label="Total distance"
                  value={
                    detailedOrder?.distance
                      ? `${parseFloat(detailedOrder?.distance).toFixed(2)}km`
                      : "0km"
                  }
                  readonly
                />
                <FFInputControl
                  label="Order time"
                  value={
                    (detailedOrder?.order_time &&
                      formatTimestampToDate(+detailedOrder?.order_time)) ??
                    "undefined sth??"
                  }
                  readonly
                />
                <FFSeperator />
                <FFInputControl
                  label="My Note"
                  value={detailedOrder?.customer_note ?? "undefined sth??"}
                  readonly
                />
              </FFView>
              <FFView
                style={{
                  width: "100%",
                  padding: 12,
                  borderRadius: 12,
                  gap: 4,
                  elevation: 3,
                }}
              >
                <View className="flex flex-row justify-between items-center">
                  <FFText fontSize="lg">Order summary</FFText>
                  <TouchableOpacity onPress={() => {}}>
                    <FFText style={{ color: "#7dbf72" }} fontSize="sm">
                      View Receipt
                    </FFText>
                  </TouchableOpacity>
                </View>
                <FFText fontWeight="400" style={{ color: "#aaa" }}>
                  Tommyummy, 102 PVH...
                </FFText>
                {detailedOrder?.order_items?.map((item, i) => (
                  <View key={i} className="flex-row gap-2 my-4">
                    <FFAvatar
                      rounded="sm"
                      size={40}
                      avatar={
                        detailedOrder?.order_items[0]?.menu_item?.avatar?.url ??
                        IMAGE_LINKS.DEFAULT_AVATAR_FOOD
                      }
                    />
                    <View className="flex-1">
                      <FFText style={{ color: "#aaa" }}>{item?.name}</FFText>
                      <FFText
                        fontWeight="400"
                        fontSize="sm"
                        style={{ color: "#aaa" }}
                      >
                        x{item?.quantity}
                      </FFText>
                    </View>
                    <TouchableOpacity
                      onPress={() => {}}
                      className="flex-row items-center justify-between"
                    >
                      <FFText fontWeight="400" fontSize="sm">
                        Show More
                      </FFText>
                      <IconFeather
                        size={20}
                        name={
                          isExpandedOrderItem ? "chevron-up" : "chevron-down"
                        }
                      />
                    </TouchableOpacity>
                  </View>
                ))}
                <FFSeperator />
                <View className="flex flex-row justify-between items-center">
                  <FFText fontWeight="400" style={{ color: "#aaa" }}>
                    Total
                  </FFText>
                  <FFText style={{ color: "#4c9f3a" }}>$100</FFText>
                </View>
              </FFView>
            </>
          ))}
      </View>
    </ScrollView>
  );
};

const OrdersScreen = () => {
  const { id } = useSelector((state: RootState) => state.auth);
  const [orders, setOrders] = useState<OrderTracking[]>([]);
  const [activeOrders, setActiveOrders] = useState<OrderTracking[]>([]);
  const [completedOrders, setCompletedOrders] = useState<OrderTracking[]>([]);
  const [cancelledOrders, setCancelledOrders] = useState<OrderTracking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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
    fetchOrders();
  }, [id]);

  useEffect(() => {
    setActiveOrders(
      orders.filter(
        (order) => order.status !== "DELIVERED" && order.status !== "CANCELLED"
      )
    );
    setCompletedOrders(orders.filter((order) => order.status === "DELIVERED"));
    setCancelledOrders(orders.filter((order) => order.status === "CANCELLED"));
  }, [orders]);
  const activeTabContent = skeletonTabContent({
    type: "ACTIVE",
    data: activeOrders,
  });
  const completedTabContent = skeletonTabContent({
    type: "COMPLETED",
    data: completedOrders,
  });
  const cancelledTabContent = skeletonTabContent({
    type: "CANCELLED",
    data: cancelledOrders,
  });
  return (
    <FFSafeAreaView>
      <FFTab
        tabTitles={["Ongoing", "Completed", "Cancelled"]}
        tabContent={[
          activeTabContent,
          completedTabContent,
          cancelledTabContent,
        ]}
        activeTabIndex={0} // Tab đầu tiên active
        onTabChange={(index) => console.log("Tab changed to:", index)}
      />
    </FFSafeAreaView>
  );
};

export default OrdersScreen;
