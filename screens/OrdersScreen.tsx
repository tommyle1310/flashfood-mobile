import React, { useEffect, useState } from "react";
import {
  View,
  Image,
  ScrollView,
  TouchableOpacity,
  Text,
  Pressable,
} from "react-native";
import { useSelector } from "@/src/store/types";
import { RootState } from "@/src/store/store";
import axiosInstance from "@/src/utils/axiosConfig";
import {
  formatTimestampToDate,
  formatTimestampToDate2,
} from "@/src/utils/dateConverter";
import { Driver, OrderTracking } from "@/src/types/screens/Order";
import { OrderTracking as OrderTrackingRealtime } from "@/src/store/orderTrackingRealtimeSlice";
import { IMAGE_LINKS } from "@/src/assets/imageLinks";

// Components
import FFSafeAreaView from "@/src/components/FFSafeAreaView";
import FFText from "@/src/components/FFText";
import FFProgressStage from "@/src/components/FFProgressStage";
import FFView from "@/src/components/FFView";
import FFInputControl from "@/src/components/FFInputControl";
import FFAvatar from "@/src/components/FFAvatar";
import FFBadge from "@/src/components/FFBadge";
import FFSeperator from "@/src/components/FFSeperator";
import FFTab from "@/src/components/FFTab.conventional";
import FFButton from "@/src/components/FFButton";

// Icons
import IconFeather from "react-native-vector-icons/Feather";
import IconIonicons from "react-native-vector-icons/Ionicons";
import {
  Enum_OrderStatus,
  Enum_OrderTrackingInfo,
  Enum_PaymentMethod,
  Enum_PaymentStatus,
  Order,
  OrderItem,
} from "@/src/types/Orders";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { MainStackParamList } from "@/src/navigation/AppNavigator";
import Spinner from "@/src/components/FFSpinner";

interface OrderTabContentProps {
  type: "ACTIVE" | "COMPLETED" | "CANCELLED";
  orders: OrderTracking[];
  refetchOrders?: () => void;
  navigation?: OrderScreenNavigationProp;
  isLoading?: boolean;
}

const mapOrderTrackingToOrder = (orderTracking: OrderTracking): Order => {
  // Map status từ Enum_OrderStatus sang Enum_PaymentStatus
  const mapStatus = (status: string): Enum_PaymentStatus => {
    switch (status) {
      case "PENDING":
        return Enum_PaymentStatus.PENDING;
      case "DELIVERED":
        return Enum_PaymentStatus.PAID; // Giả sử delivered = paid
      case "CANCELLED":
        return Enum_PaymentStatus.CANCELLED;
      case "DELIVERY_FAILED":
        return Enum_PaymentStatus.FAILED;
      default:
        return Enum_PaymentStatus.PENDING; // Default fallback
    }
  };

  // Map payment_method từ string sang Enum_PaymentMethod
  const mapPaymentMethod = (method: string): Enum_PaymentMethod => {
    switch (method.toUpperCase()) {
      case "COD":
        return Enum_PaymentMethod.COD;
      case "FWALLET":
        return Enum_PaymentMethod.FWallet;
      default:
        return Enum_PaymentMethod.COD; // Default fallback
    }
  };

  // Map order_items từ OrderTracking sang Order
  const mapOrderItems = (items: OrderTracking["order_items"]): OrderItem[] => {
    console.log("check itesm here", items);

    return items.map((item) => {
      console.log("check item.item", item.menu_item);

      return {
        item_id: item.item_id,
        name: item.name,
        menu_item: item.item,
        quantity: item.quantity,
        price_at_time_of_order: item.menu_item.price,
        variant_id: item.variant_id,
        item: {
          id: item.menu_item.id || "",
          name: item.menu_item?.name || "",
          avatar: item.menu_item?.avatar || { url: "", key: "" },
        },
      };
    });
  };

  return {
    customer_id: orderTracking.customer_id,
    restaurant_id: orderTracking.restaurant_id,
    customer_location: orderTracking.customer_location,
    restaurant_location: orderTracking.restaurant_location,
    status: mapStatus(orderTracking.status),
    payment_method: mapPaymentMethod(orderTracking.payment_method),
    total_amount: parseFloat(orderTracking.total_amount) || 0, // Chuyển string sang number
    order_items: mapOrderItems(orderTracking.order_items),
    tracking_info: orderTracking.tracking_info,
    customer_note: orderTracking.customer_note,
    restaurant_note: orderTracking.restaurant_note,
    order_time: parseInt(orderTracking.order_time) || 0, // Chuyển string sang number (Unix timestamp)
  };
};

// Hàm render nội dung cho từng tab
const OrderTabContent: React.FC<OrderTabContentProps> = ({
  type,
  orders,
  isLoading,
  navigation,
  refetchOrders,
}) => {
  const { orders: realtimeOrders } = useSelector(
    (state: RootState) => state.orderTrackingRealtime
  );
  const [isExpandedOrderItem, setIsExpandedOrderItem] = useState(false);
  const [detailedOrder, setDetailedOrder] = useState<OrderTracking | null>(
    null
  );
  const [driverDetails, setDriverDetails] = useState<Driver | null>(null);
  const [activeOrderDetails, setActiveOrderDetails] =
    useState<OrderTracking | null>(null);
  const firstActiveOrder = realtimeOrders[0] || null;

  useEffect(() => {
    if (
      firstActiveOrder?.status === Enum_OrderStatus.CANCELLED &&
      firstActiveOrder?.tracking_info === Enum_OrderTrackingInfo.DELIVERED &&
      refetchOrders
    ) {
      refetchOrders();
    }
  }, [firstActiveOrder]);

  useEffect(() => {
    if (orders?.[0]?.driver_id) {
      setDriverDetails(orders[0].driver);
    }
    setActiveOrderDetails(orders[0]);
  }, [orders]);

  const getTrackingImage = (
    status?: Enum_OrderStatus,
    tracking_info?: Enum_OrderTrackingInfo
  ) => {
    switch (status) {
      case Enum_OrderStatus.PREPARING:
        return IMAGE_LINKS.RESTAURANT_PREPARING;
      case Enum_OrderStatus.DISPATCHED:
        return IMAGE_LINKS.DRIVER_DISPATCH;
      case Enum_OrderStatus.EN_ROUTE:
        return IMAGE_LINKS.EN_ROUTE;
      case Enum_OrderStatus.READY_FOR_PICKUP:
        return IMAGE_LINKS.FOOD_PACKED;
      case Enum_OrderStatus.PENDING:
        if (tracking_info === Enum_OrderTrackingInfo.ORDER_PLACED) {
          return IMAGE_LINKS.ORDER_PLACED;
        }
        break;
      case Enum_OrderStatus.RESTAURANT_PICKUP:
        return IMAGE_LINKS.RESTAURANT_PICKUP;
      default:
        return IMAGE_LINKS.DEFAULT_AVATAR_FOOD;
    }
  };

  console.log("cehck driverd etials", driverDetails);

  // Hàm mới để lấy text và emoji tương ứng với status
  const getTrackingText = (
    status?: Enum_OrderStatus,
    tracking_info?: Enum_OrderTrackingInfo
  ) => {
    switch (status) {
      case Enum_OrderStatus.PENDING:
        if (tracking_info === Enum_OrderTrackingInfo.ORDER_PLACED) {
          return "Order placed successfully! Waiting for restaurant confirmation... ⌛";
        }
        return "Processing your order... ⌛";
      case Enum_OrderStatus.PREPARING:
        return "Chefs are cooking your meal! 🍳";
      case Enum_OrderStatus.READY_FOR_PICKUP:
        return "Your order is ready for pickup! 📦";
      case Enum_OrderStatus.DISPATCHED:
        return "Driver is heading to the restaurant! 🚚";
      case Enum_OrderStatus.RESTAURANT_PICKUP:
        return "Driver is picking up your order! 🛒";
      case Enum_OrderStatus.EN_ROUTE:
        return "On the way to you! 🚀";
      case Enum_OrderStatus.DELIVERED:
        return "Enjoy your meal! 🎉";
      default:
        return "Something’s cooking... stay tuned! ❓";
    }
  };

  const handleReOrder = (data: OrderTracking) => {
    const mappedData = mapOrderTrackingToOrder(data);
    console.log("check dât map ", mappedData);
    navigation?.navigate("Checkout", { orderItem: mappedData });
  };

  const renderOrderCard = (order: OrderTracking) => (
    <Pressable
      key={order.id}
      onPress={() => setDetailedOrder(order)}
      style={{ elevation: 3 }}
      className="flex-col gap-4 p-4 bg-white rounded-lg items-center"
    >
      <View className="flex-row justify-between gap-2 items-center">
        <FFText fontSize="sm">
          {order.restaurant.specialize_in[0] ?? "Japanese"}
        </FFText>
        <FFText style={{ flex: 1, color: "#7dbf72" }} fontSize="sm">
          Completed
        </FFText>
        <FFText style={{ color: "#aaa" }} fontSize="sm">
          {formatTimestampToDate2(Number(order.delivery_time))}
        </FFText>
      </View>
      <FFSeperator />
      <View className="flex-row gap-2">
        <FFAvatar
          size={70}
          rounded="md"
          avatar={
            order.restaurant?.avatar?.url ?? IMAGE_LINKS.DEFAULT_AVATAR_FOOD
          }
        />
        <View className="flex-1">
          <FFText>{order.restaurant.restaurant_name}</FFText>
          <FFText fontSize="sm" style={{ color: "#aaa" }}>
            {`${order.restaurantAddress?.street}, ${order.restaurantAddress?.city}, ${order.restaurantAddress?.nationality}`}
          </FFText>
          <View className="flex-row gap-2 items-center mt-1">
            <FFText fontSize="sm" style={{ color: "#7dbf72" }}>
              ${Number(order.total_amount).toFixed(2)}
            </FFText>
            <FFText fontSize="sm" style={{ color: "#aaa" }}>
              {order.order_items?.length} items
            </FFText>
          </View>
        </View>
      </View>
      <View className="flex-row gap-2 flex-1">
        <FFButton variant="outline" className="w-full" style={{ flex: 1 }}>
          Rate
        </FFButton>
        <FFButton
          onPress={() => handleReOrder(order)}
          className="w-full"
          style={{ flex: 1 }}
        >
          Re-Order
        </FFButton>
      </View>
    </Pressable>
  );

  const renderDetailedOrder = () => (
    <>
      {type !== "ACTIVE" && (
        <TouchableOpacity
          className="flex-row items-center gap-1 mb-4"
          onPress={() => setDetailedOrder(null)}
        >
          <IconIonicons name="chevron-back" style={{ fontSize: 20 }} />
          <FFText fontWeight="400">Go back</FFText>
        </TouchableOpacity>
      )}
      <View
        className="flex-col gap-4 w-full items-center"
        style={{ marginBottom: 200 }}
      >
        {type === "ACTIVE" && firstActiveOrder?.tracking_info && (
          <>
            <View className="w-full p-4">
              <FFProgressStage
                stageText="Arriving at 10:15"
                completedSegments={3}
                totalSegments={5}
              />
            </View>
            <View
              style={{
                width: "100%",
                backgroundColor: "#fff",
                elevation: 3,
                borderRadius: 12,
                overflow: "hidden",
              }}
            >
              <FFText
                fontSize="sm"
                style={{ padding: 8, textAlign: "center", color: "#4a9e3e" }}
              >
                {getTrackingText(
                  firstActiveOrder?.status as Enum_OrderStatus,
                  firstActiveOrder?.tracking_info as Enum_OrderTrackingInfo
                )}
              </FFText>
              <Image
                source={{
                  uri: getTrackingImage(
                    firstActiveOrder?.status as Enum_OrderStatus,
                    firstActiveOrder?.tracking_info as Enum_OrderTrackingInfo
                  ),
                }}
                style={{
                  width: "100%",
                  height: 200,
                  resizeMode: "cover",
                }}
              />
            </View>
            {firstActiveOrder.driver_id && (
              <FFView
                style={{
                  width: "100%",
                  padding: 12,
                  borderRadius: 12,
                  gap: 20,
                  elevation: 3,
                }}
              >
                <View className="flex-row gap-2 items-center">
                  <View className="relative">
                    <FFAvatar size={50} avatar={driverDetails?.avatar?.url} />
                    <View className="absolute -bottom-2 left-3 p-1 rounded-lg bg-[#56a943]">
                      <FFText
                        fontSize="sm"
                        fontWeight="400"
                        style={{ color: "#fff" }}
                      >
                        {driverDetails?.rating?.average_rating ?? "4.8"}
                      </FFText>
                    </View>
                  </View>
                  <View>
                    <View className="flex-row items-center gap-2">
                      <FFText style={{ color: "#4c9f3a" }}>
                        {driverDetails?.first_name ?? "df"},{" "}
                        {driverDetails?.last_name ?? "dl"}
                      </FFText>
                      <FFText fontSize="sm" style={{ marginTop: 2 }}>
                        {driverDetails?.vehicle?.license_plate}
                      </FFText>
                    </View>
                    <FFText fontWeight="400" fontSize="sm">
                      {driverDetails?.vehicle?.color}{" "}
                      {driverDetails?.vehicle?.model}
                    </FFText>
                  </View>
                </View>
                <View className="flex-row gap-2 items-center">
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
                  <TouchableOpacity className="flex-row bg-gray-200 p-4 rounded-full flex-1">
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
            )}
          </>
        )}
        {(detailedOrder || type === "ACTIVE") &&
          (detailedOrder === null &&
          (realtimeOrders.length === 0 ||
            firstActiveOrder?.tracking_info === Enum_OrderStatus.DELIVERED) ? (
            <View className="w-full gap-4">
              <Image
                source={{ uri: IMAGE_LINKS.EMPTY_ORDERS }}
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
              <FFButton
                variant="link"
                onPress={() =>
                  navigation?.navigate("BottomTabs", { screenIndex: 0 })
                }
              >
                Browse some food
              </FFButton>
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
                  value={
                    detailedOrder
                      ? `${detailedOrder?.restaurantAddress?.street}, ${detailedOrder?.customerAddress?.city}, ${detailedOrder?.customerAddress?.nationality}`
                      : `${activeOrderDetails?.customerAddress?.street}, ${activeOrderDetails?.customerAddress?.city}, ${activeOrderDetails?.customerAddress?.nationality}`
                  }
                  readonly
                />
                <FFInputControl
                  label="Restaurant address"
                  value={
                    detailedOrder
                      ? `${detailedOrder?.restaurantAddress?.street}, ${detailedOrder?.restaurantAddress?.city}, ${detailedOrder?.restaurantAddress?.nationality}`
                      : `${activeOrderDetails?.restaurantAddress?.street}, ${activeOrderDetails?.restaurantAddress?.city}, ${activeOrderDetails?.restaurantAddress?.nationality}`
                  }
                  readonly
                />
                <FFInputControl
                  label="Total distance"
                  value={
                    detailedOrder
                      ? detailedOrder.distance
                        ? `${parseFloat(detailedOrder.distance).toFixed(2)}km`
                        : "0km"
                      : activeOrderDetails?.distance
                      ? `${parseFloat(activeOrderDetails.distance).toFixed(
                          2
                        )}km`
                      : "0km"
                  }
                  readonly
                />
                <FFInputControl
                  label="Order time"
                  value={
                    detailedOrder
                      ? detailedOrder.order_time
                        ? formatTimestampToDate(
                            Number(detailedOrder.order_time)
                          )
                        : "undefined sth??"
                      : activeOrderDetails?.order_time
                      ? formatTimestampToDate(
                          Number(activeOrderDetails.order_time)
                        )
                      : "undefined sth??"
                  }
                  readonly
                />
                <FFSeperator />
                <FFInputControl
                  label="My Note"
                  value={
                    detailedOrder
                      ? detailedOrder.customer_note ?? "undefined sth??"
                      : activeOrderDetails?.customer_note ?? "undefined sth??"
                  }
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
                <View className="flex-row justify-between items-center">
                  <FFText fontSize="lg">Order summary</FFText>
                  <TouchableOpacity onPress={() => {}}>
                    <FFText style={{ color: "#7dbf72" }} fontSize="sm">
                      View Receipt
                    </FFText>
                  </TouchableOpacity>
                </View>
                <FFText fontWeight="400" style={{ color: "#aaa" }}>
                  {detailedOrder
                    ? `${detailedOrder?.restaurant?.restaurant_name}, ${detailedOrder?.restaurantAddress?.street}, ${detailedOrder?.restaurantAddress?.city}, ${detailedOrder?.restaurantAddress?.nationality}`
                    : `${activeOrderDetails?.restaurant?.restaurant_name}, ${activeOrderDetails?.restaurantAddress?.street}, ${activeOrderDetails?.restaurantAddress?.city}, ${activeOrderDetails?.restaurantAddress?.nationality}`}
                </FFText>
                {detailedOrder?.order_items?.map((item, i) => (
                  <View key={i} className="flex-row gap-2 my-4">
                    <FFAvatar
                      rounded="sm"
                      size={40}
                      avatar={
                        item?.menu_item?.avatar?.url ??
                        IMAGE_LINKS.DEFAULT_AVATAR_FOOD
                      }
                    />
                    <View className="flex-1">
                      <FFText style={{ color: "#aaa" }}>{item.name}</FFText>
                      <FFText
                        fontWeight="400"
                        fontSize="sm"
                        style={{ color: "#aaa" }}
                      >
                        x{item.quantity}
                      </FFText>
                    </View>
                    <TouchableOpacity
                      onPress={() =>
                        setIsExpandedOrderItem(!isExpandedOrderItem)
                      }
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
                {activeOrderDetails?.order_items?.map((item, i) => (
                  <View key={i} className="flex-row gap-2 my-4">
                    <FFAvatar
                      rounded="sm"
                      size={40}
                      avatar={
                        item.menu_item?.avatar?.url ??
                        IMAGE_LINKS.DEFAULT_AVATAR_FOOD
                      }
                    />
                    <View className="flex-1">
                      <FFText style={{ color: "#aaa" }}>{item.name}</FFText>
                      <FFText
                        fontWeight="400"
                        fontSize="sm"
                        style={{ color: "#aaa" }}
                      >
                        x{item.quantity}
                      </FFText>
                    </View>
                    <TouchableOpacity
                      onPress={() =>
                        setIsExpandedOrderItem(!isExpandedOrderItem)
                      }
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
                <View className="flex-row justify-between items-center">
                  <FFText fontWeight="400" style={{ color: "#aaa" }}>
                    Total
                  </FFText>
                  <FFText style={{ color: "#4c9f3a" }}>
                    ${Number(activeOrderDetails?.total_amount).toFixed(2)}
                  </FFText>
                </View>
              </FFView>
            </>
          ))}
      </View>
    </>
  );
  console.log("check detailed order", detailedOrder);

  if (isLoading) {
    return <Spinner isVisible isOverlay />;
  }

  return (
    <ScrollView className="gap-4 p-4">
      <View className="gap-4">
        {type !== "ACTIVE" &&
          detailedOrder === null &&
          orders.map((item, i) => {
            if (i === orders.length - 1) {
              return (
                <View key={item.id || i} style={{ marginBottom: 200 }}>
                  {renderOrderCard(item)}
                </View>
              );
            }
            return (
              <React.Fragment key={item.id || i}>
                {renderOrderCard(item)}
              </React.Fragment>
            );
          })}
      </View>
      {(detailedOrder !== null || type === "ACTIVE") && renderDetailedOrder()}
    </ScrollView>
  );
};

type OrderScreenNavigationProp = StackNavigationProp<
  MainStackParamList,
  "BottomTabs"
>;

// Main OrdersScreen component
const OrdersScreen: React.FC = () => {
  const { id } = useSelector((state: RootState) => state.auth);
  const [orders, setOrders] = useState<OrderTracking[]>([]);
  const [activeOrders, setActiveOrders] = useState<OrderTracking[]>([]);
  const [completedOrders, setCompletedOrders] = useState<OrderTracking[]>([]);
  const [cancelledOrders, setCancelledOrders] = useState<OrderTracking[]>([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation<OrderScreenNavigationProp>();

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get(`/customers/orders/${id}`);
      setOrders(res.data.data);
    } catch (error) {
      setLoading(false);
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
        (order) => order.status !== "DELIVERED" && order.status !== "CANCELLED"
      )
    );
    setCompletedOrders(orders.filter((order) => order.status === "DELIVERED"));
    setCancelledOrders(orders.filter((order) => order.status === "CANCELLED"));
  }, [orders]);

  const tabContent = [
    <OrderTabContent
      navigation={navigation}
      refetchOrders={fetchOrders}
      key="active"
      type="ACTIVE"
      orders={activeOrders}
    />,
    <OrderTabContent
      isLoading={loading}
      key="completed"
      navigation={navigation}
      type="COMPLETED"
      orders={completedOrders}
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
