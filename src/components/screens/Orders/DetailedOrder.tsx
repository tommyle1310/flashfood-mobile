import React from "react";
import { View, TouchableOpacity, Image, Text } from "react-native";
import FFText from "@/src/components/FFText";
import FFProgressStage from "@/src/components/FFProgressStage";
import FFView from "@/src/components/FFView";
import FFInputControl from "@/src/components/FFInputControl";
import FFAvatar from "@/src/components/FFAvatar";
import FFSeperator from "@/src/components/FFSeperator";
import FFButton from "@/src/components/FFButton";
import FFModal from "@/src/components/FFModal";
import IconFeather from "react-native-vector-icons/Feather";
import IconIonicons from "react-native-vector-icons/Ionicons";
import IconFontAwesome5 from "react-native-vector-icons/FontAwesome5";
import { OrderTracking } from "@/src/types/screens/Order";
import { Enum_OrderStatus, Enum_OrderTrackingInfo } from "@/src/types/Orders";
import {
  formatTimestampToDate,
  formatTimestampToDate2,
} from "@/src/utils/dateConverter";
import { IMAGE_LINKS } from "@/src/assets/imageLinks";
import { getTrackingImage, getTrackingText } from "@/src/utils/orderUtils";
import { OrderScreenNavigationProp } from "@/screens/OrdersScreen";
import FFSkeleton from "../../FFSkeleton";
import { spacing } from "@/src/theme";

interface DetailedOrderProps {
  type: "ACTIVE" | "COMPLETED" | "CANCELLED";
  detailedOrder: OrderTracking | null;
  setDetailedOrder: (order: OrderTracking | null) => void;
  firstActiveOrder: OrderTracking | null;
  activeOrderDetails: OrderTracking | null;
  driverDetails: any | null;
  currentOrderStage: number;
  isLoading?: boolean;
  orderStatusStages?: Enum_OrderStatus[];
  navigation?: OrderScreenNavigationProp;
  isExpandedOrderItem: boolean;
  setIsExpandedOrderItem: (value: boolean) => void;
  isShowTipToDriverModal: boolean;
  setShowTipToDriverModal: (value: boolean) => void;
  tipAmount: string | number;
  setTipAmount: React.Dispatch<React.SetStateAction<string | number>>;
  isTippedSuccessful: boolean;
  setIsTippedSuccessful: (value: boolean) => void;
  handleTipToDriver: () => void;
}

export const DetailedOrder: React.FC<DetailedOrderProps> = ({
  type,
  detailedOrder,
  setDetailedOrder,
  firstActiveOrder,
  activeOrderDetails,
  driverDetails,
  currentOrderStage,
  isLoading,
  orderStatusStages,
  navigation,
  isExpandedOrderItem,
  setIsExpandedOrderItem,
  isShowTipToDriverModal,
  setShowTipToDriverModal,
  tipAmount,
  setTipAmount,
  isTippedSuccessful,
  setIsTippedSuccessful,
  handleTipToDriver,
}) => {
  console.log(
    "check detailed order",
    activeOrderDetails?.order_time,
    firstActiveOrder?.order_time
  );

  // Hàm helper để lấy order items
  const getOrderItems = () => {
    if (type === "ACTIVE" && activeOrderDetails) {
      return activeOrderDetails.order_items ?? [];
    }
    return detailedOrder?.order_items ?? firstActiveOrder?.order_items ?? [];
  };

  // Hàm helper để lấy total amount
  const getTotalAmount = () => {
    if (type === "ACTIVE" && activeOrderDetails) {
      return Number(activeOrderDetails.total_amount ?? 0).toFixed(2);
    }
    return Number(
      detailedOrder?.total_amount ?? firstActiveOrder?.total_amount ?? 0
    ).toFixed(2);
  };

  // Hàm helper để lấy restaurant info
  const getRestaurantInfo = () => {
    const order =
      type === "ACTIVE"
        ? activeOrderDetails
        : detailedOrder ?? firstActiveOrder;
    if (!order) return "N/A";
    const name = order.restaurant?.restaurant_name ?? "";
    const address = order.restaurantFullAddress ?? "N/A";
    return name ? `${name}, ${address}` : address;
  };

  return (
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
        style={{ marginBottom: spacing.veryLarge }}
      >
        {type === "ACTIVE" && firstActiveOrder?.tracking_info && (
          <>
            <View style={{ paddingHorizontal: spacing.lg }} className="w-full">
              <FFProgressStage
                stageText="Arriving at 10:15"
                completedSegments={currentOrderStage}
                totalSegments={orderStatusStages?.length ?? 0}
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
                style={{
                  padding: spacing.md,
                  textAlign: "center",
                  color: "#4a9e3e",
                }}
              >
                {getTrackingText(
                  firstActiveOrder.status as Enum_OrderStatus,
                  firstActiveOrder.tracking_info as Enum_OrderTrackingInfo
                )}
              </FFText>
              <Image
                source={{
                  uri: getTrackingImage(
                    firstActiveOrder.status as Enum_OrderStatus,
                    firstActiveOrder.tracking_info as Enum_OrderTrackingInfo
                  ),
                }}
                style={{ width: "100%", height: 200, resizeMode: "cover" }}
              />
            </View>
            {firstActiveOrder.driver_id && (
              <FFView
                style={{
                  width: "100%",
                  padding: spacing.sm,
                  borderRadius: 12,
                  gap: 20,
                  elevation: 3,
                }}
              >
                <View className="flex-row gap-2 items-center">
                  <View className="relative">
                    <FFAvatar
                      size={50}
                      avatar={driverDetails?.avatar?.url ?? null}
                    />
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
                        {driverDetails?.first_name ?? "N/A"},{" "}
                        {driverDetails?.last_name ?? "N/A"}
                      </FFText>
                      <FFText fontSize="sm" style={{ marginTop: 2 }}>
                        {driverDetails?.vehicle?.license_plate ?? "N/A"}
                      </FFText>
                    </View>
                    <FFText fontWeight="400" fontSize="sm">
                      {driverDetails?.vehicle?.color ?? "N/A"}{" "}
                      {driverDetails?.vehicle?.model ?? "N/A"}
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
                    onPress={() => setShowTipToDriverModal(true)}
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
        {type === "ACTIVE" ? (
          !detailedOrder && !firstActiveOrder && !activeOrderDetails ? (
            <View className="w-full gap-4">
              {isLoading ? (
                <>
                  <FFSkeleton height={160} />
                  <FFSkeleton width={120} style={{ alignSelf: "center" }} />
                  <FFSkeleton width={160} style={{ alignSelf: "center" }} />
                </>
              ) : (
                <>
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
                </>
              )}
            </View>
          ) : (
            <>
              <FFView
                style={{
                  width: "100%",
                  padding: spacing.md,
                  borderRadius: 12,
                  gap: 4,
                  elevation: 3,
                }}
              >
                <FFText fontSize="lg">Delivery details</FFText>
                <FFInputControl
                  label="My address"
                  value={
                    type === "ACTIVE" && activeOrderDetails
                      ? activeOrderDetails.customerFullAddress ?? "N/A"
                      : detailedOrder?.customerFullAddress ??
                        firstActiveOrder?.customerFullAddress ??
                        "N/A"
                  }
                  readonly
                />
                <FFInputControl
                  label="Restaurant address"
                  value={
                    type === "ACTIVE" && activeOrderDetails
                      ? activeOrderDetails.restaurantFullAddress ?? "N/A"
                      : detailedOrder?.restaurantFullAddress ??
                        firstActiveOrder?.restaurantFullAddress ??
                        "N/A"
                  }
                  readonly
                />
                <FFInputControl
                  label="Total distance"
                  value={
                    type === "ACTIVE" && activeOrderDetails
                      ? activeOrderDetails.distance
                        ? `${parseFloat(activeOrderDetails.distance).toFixed(
                            2
                          )}km`
                        : "0km"
                      : detailedOrder?.distance
                      ? `${parseFloat(detailedOrder.distance).toFixed(2)}km`
                      : firstActiveOrder?.distance
                      ? `${parseFloat(firstActiveOrder.distance).toFixed(2)}km`
                      : "0km"
                  }
                  readonly
                />
                <FFInputControl
                  label="Order time"
                  value={
                    type === "ACTIVE" && activeOrderDetails
                      ? activeOrderDetails.order_time
                        ? formatTimestampToDate2(
                            Number(activeOrderDetails.order_time)
                          )
                        : "N/A"
                      : detailedOrder?.order_time
                      ? formatTimestampToDate2(Number(detailedOrder.order_time))
                      : firstActiveOrder?.order_time
                      ? formatTimestampToDate2(
                          Number(firstActiveOrder.order_time)
                        )
                      : "N/A"
                  }
                  readonly
                />
                <FFSeperator />
                <FFInputControl
                  label="My Note"
                  value={
                    type === "ACTIVE" && activeOrderDetails
                      ? activeOrderDetails.customer_note ?? "N/A"
                      : detailedOrder?.customer_note ??
                        firstActiveOrder?.customer_note ??
                        "N/A"
                  }
                  readonly
                />
              </FFView>
              <FFView
                style={{
                  width: "100%",
                  padding: spacing.md,
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
                <FFText
                  fontWeight="400"
                  fontSize="sm"
                  style={{ color: "#aaa" }}
                >
                  {getRestaurantInfo()}
                </FFText>
                {getOrderItems().length > 0 ? (
                  getOrderItems().map((item, i) => (
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
                        <FFText style={{ color: "#aaa" }}>
                          {item.name ?? "N/A"}
                        </FFText>
                        <View className="flex-row gap-2 ">
                          <FFText
                            fontWeight="400"
                            fontSize="sm"
                            style={{ color: "#aaa" }}
                          >
                            x{item.quantity ?? 0}
                          </FFText>
                          <FFText
                            fontWeight="400"
                            fontSize="sm"
                            style={{ color: "#aaa" }}
                          >
                            {item.variant_id ?? 0}
                          </FFText>
                        </View>
                      </View>
                      <TouchableOpacity
                        onPress={() =>
                          setIsExpandedOrderItem(!isExpandedOrderItem)
                        }
                        className="flex-row items-center justify-between"
                      >
                        <IconFeather
                          size={20}
                          name={
                            isExpandedOrderItem ? "chevron-up" : "chevron-down"
                          }
                        />
                      </TouchableOpacity>
                    </View>
                  ))
                ) : (
                  <FFText style={{ color: "#aaa" }}>
                    Order items not available
                  </FFText>
                )}
                <FFSeperator />
                <View className="flex-row justify-between items-center">
                  <FFText fontWeight="400" style={{ color: "#aaa" }}>
                    Total
                  </FFText>
                  <FFText style={{ color: "#4c9f3a" }}>
                    ${getTotalAmount()}
                  </FFText>
                </View>
              </FFView>
            </>
          )
        ) : (
          detailedOrder && (
            <>
              <FFView
                style={{
                  width: "100%",
                  padding: spacing.xl,
                  borderRadius: 12,
                  gap: 4,
                  elevation: 3,
                }}
              >
                <FFText fontSize="lg">Delivery details</FFText>
                <FFInputControl
                  label="My address"
                  value={detailedOrder.customerFullAddress ?? "N/A"}
                  readonly
                />
                <FFInputControl
                  label="Restaurant address"
                  value={detailedOrder.restaurantFullAddress ?? "N/A"}
                  readonly
                />
                <FFInputControl
                  label="Total distance"
                  value={
                    detailedOrder.distance
                      ? `${parseFloat(detailedOrder.distance).toFixed(2)}km`
                      : "0km"
                  }
                  readonly
                />
                <FFInputControl
                  label="Order time"
                  value={
                    detailedOrder.order_time
                      ? formatTimestampToDate(Number(detailedOrder.order_time))
                      : "N/A"
                  }
                  readonly
                />
                <FFSeperator />
                <FFInputControl
                  label="My Note"
                  value={detailedOrder.customer_note ?? "N/A"}
                  readonly
                />
              </FFView>
              <FFView
                style={{
                  width: "100%",
                  padding: spacing.xl,
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
                <FFText
                  fontWeight="400"
                  fontSize="sm"
                  style={{ color: "#aaa" }}
                >
                  {getRestaurantInfo()}
                </FFText>
                {getOrderItems().length > 0 ? (
                  getOrderItems().map((item, i) => (
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
                        <FFText style={{ color: "#aaa" }}>
                          {item.name ?? "N/A"}
                        </FFText>
                        <FFText
                          fontWeight="400"
                          fontSize="sm"
                          style={{ color: "#aaa" }}
                        >
                          x{item.quantity ?? 0}
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
                  ))
                ) : (
                  <FFText style={{ color: "#aaa" }}>
                    Order items not available
                  </FFText>
                )}
                <FFSeperator />
                <View className="flex-row justify-between items-center">
                  <FFText fontWeight="400" style={{ color: "#aaa" }}>
                    Total
                  </FFText>
                  <FFText style={{ color: "#4c9f3a" }}>
                    ${getTotalAmount()}
                  </FFText>
                </View>
              </FFView>
            </>
          )
        )}
      </View>
      <FFModal
        onClose={() => {
          setShowTipToDriverModal(false);
          setIsTippedSuccessful(false);
          setTipAmount(0);
          setIsTippedSuccessful(false);
        }}
        visible={isShowTipToDriverModal}
      >
        {isTippedSuccessful ? (
          <View style={{ alignItems: "center" }}>
            <View
              style={{
                backgroundColor: "#63c550",
                width: 40,
                height: 40,
                borderRadius: 9999,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <IconFontAwesome5 name="check" color={"#fff"} size={20} />
            </View>
            <FFText>
              You have tipped your driver
              <FFText style={{ color: "#4c9f3a" }}> ${tipAmount}</FFText>!
            </FFText>
          </View>
        ) : (
          <>
            <FFText style={{ textAlign: "center" }}>Tip to driver</FFText>
            <FFText
              fontSize="sm"
              fontWeight="400"
              style={{ textAlign: "center", color: "#aaa" }}
            >
              Your driver will receive 100% tips. 😇
            </FFText>
            <FFInputControl
              value={tipAmount}
              isNumeric={true}
              setValue={setTipAmount}
              label=""
            />
            <FFButton
              style={{ marginTop: spacing.lg }}
              className="w-full"
              onPress={handleTipToDriver}
            >
              Confirm
            </FFButton>
          </>
        )}
      </FFModal>
    </>
  );
};
