import React, { useMemo, useState } from "react";
import { View, TouchableOpacity, Image, Text, StyleSheet } from "react-native";
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
import FFSpinner from "@/src/components/FFSpinner"; // Import FFSpinner
import {
  borderRadius,
  colors,
  shadows,
  spacing,
  typography,
} from "@/src/theme";
import FFJBRowItem from "../../FFJBRowItems";
import { useDriverLocationSocket } from "@/src/hooks/useDriverLocationSocket";
import OrderTrackingMap from "../../Maps/OrderTrackingMap";

interface DetailedOrderProps {
  type: "ACTIVE" | "COMPLETED" | "CANCELLED";
  detailedOrder: OrderTracking | null;
  setDetailedOrder: (order: OrderTracking | null) => void;
  firstActiveOrder: OrderTracking | null;
  activeOrderDetails: OrderTracking | null;
  // Removed driverDetails - now accessed through currentOrder.driverDetails
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
  // SIMPLIFIED DATA SOURCE: Single source of truth for order data
  // This eliminates the confusing fallback pattern and makes the code much more readable
  const currentOrder = useMemo(() => {
    let selectedOrder = null;
    if (type === "ACTIVE") {
      // For active orders, prioritize activeOrderDetails (which is now the computed activeOrder from OrderTabContent)
      selectedOrder = activeOrderDetails || firstActiveOrder;
      console.log('check active order', selectedOrder)
    } else {
      // For completed/cancelled orders, use detailedOrder
      selectedOrder = detailedOrder;
    }
    

    return selectedOrder;
  }, [type, activeOrderDetails, firstActiveOrder, detailedOrder]);

  // Driver location tracking hook - only connect when there's a driver ID
  const driverId = currentOrder?.driver_id || null;
  console.log('check driver id', driverId)
  const { eta, isConnected, driverLocation } = useDriverLocationSocket(driverId);
  console.log('check eta', eta, driverLocation)

  // Extract locations for map with defensive checks
  const restaurantLocation = currentOrder?.restaurantAddress?.location && 
    typeof currentOrder.restaurantAddress.location.lat === 'number' &&
    typeof currentOrder.restaurantAddress.location.lon === 'number' ? {
    lat: currentOrder.restaurantAddress.location.lat,
    lon: currentOrder.restaurantAddress.location.lon,
  } : null;

  const customerLocation = currentOrder?.customerAddress?.location && 
    typeof currentOrder.customerAddress.location.lat === 'number' &&
    typeof currentOrder.customerAddress.location.lon === 'number' ? {
    lat: currentOrder.customerAddress.location.lat,
    lon: currentOrder.customerAddress.location.lon,
  } : null;
  const [modalReceiptDetails, setModalReceiptDetails] = useState<{
    status: "SUCCESS" | "ERROR" | "HIDDEN" | "INFO" | "YESNO";
    sub_total: number;
    service_fee: number;
    delivery_fee: number;
    total_amount: number;
    discount_amount: number;
  }>({ status: "HIDDEN", sub_total: 0, service_fee: 0, delivery_fee: 0, total_amount: 0, discount_amount: 0 });
  // CLEAN HELPER FUNCTIONS: Much simpler and easier to understand
  const getOrderItems = () => {
    const items = currentOrder?.order_items ?? [];
  
    return items;
  };

  const getTotalAmount = () => {
    return Number(currentOrder?.total_amount ?? 0).toFixed(2);
  };

  const getRestaurantInfo = () => {
    if (!currentOrder) return "N/A";
    const name = currentOrder.restaurant?.restaurant_name ?? "";
    const address = currentOrder.restaurantFullAddress || "N/A";
    return name ? `${name}, ${address}` : address;
  };

  const getCustomerAddress = () => {
    return currentOrder?.customerFullAddress || "N/A";
  };

  const getRestaurantAddress = () => {
    return currentOrder?.restaurantFullAddress || "N/A";
  };

  const getTotalDistance = () => {
    if (!currentOrder?.distance) return "0km";
    return `${parseFloat(currentOrder.distance).toFixed(2)}km`;
  };

  const getOrderTime = () => {
    const timestamp = Number(currentOrder?.updated_at ?? 0);
    if (!timestamp || isNaN(timestamp)) {
      return "N/A";
    }
    return formatTimestampToDate2(timestamp);
  };

  const getCustomerNote = () => {
    return currentOrder?.customer_note ?? "N/A";
  };

  // Handle navigation to order chat
  const handleNavigateToOrderChat = () => {
    if (!currentOrder || !navigation) return;
    
    // Determine who to chat with based on the order status
    let withUserId;
    
    if (currentOrder.driver_id) {
      // If there's a driver, chat with the driver
      withUserId = currentOrder.driver_id;
    } else if (currentOrder.restaurant?.id) {
      // If no driver but there's a restaurant, chat with the restaurant
      withUserId = currentOrder.restaurant.id;
    } else {
      // Fallback to customer care if neither is available
      console.log("No driver or restaurant ID available for chat");
      return;
    }
    
    // Navigate to FChat screen with order-specific parameters
    navigation.navigate("FChat", {
      withUserId,
      type: "ORDER",
      orderId: currentOrder.id
    });
  };

  // Render active order content
  const renderActiveOrderContent = () => {
    if (!currentOrder) {
      return (
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
      );
    }

    return (
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
            value={getCustomerAddress()}
            readonly
          />
          <FFInputControl
            label="Restaurant address"
            value={getRestaurantAddress()}
            readonly
          />
          <FFInputControl
            label="Total distance"
            value={getTotalDistance()}
            readonly
          />
          <FFInputControl label="Order time" value={getOrderTime()} readonly />
          <FFSeperator />
          <FFInputControl label="My Note" value={getCustomerNote()} readonly />
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
            <TouchableOpacity onPress={() => {
              setModalReceiptDetails({
                status: "INFO",
                sub_total: Number(currentOrder?.sub_total ?? 0),
                service_fee: Number(currentOrder?.service_fee ?? 0),
                delivery_fee: Number(currentOrder?.delivery_fee ?? 0),
                total_amount: Number(currentOrder?.total_amount ?? 0),
                discount_amount: Number(currentOrder?.discount_amount ?? 0),
              })
            }}>
              <FFText style={{ color: colors.primary }} fontSize="sm">
                View Receipt
              </FFText>
            </TouchableOpacity>
          </View>
          <FFText fontWeight="400" fontSize="sm" style={{ color: "#aaa" }}>
            {getRestaurantInfo()}
          </FFText>
          {getOrderItems().length > 0 ? (
            getOrderItems().map((item, i) => (
              <View key={i} className="flex-row gap-2 my-4">
                <FFAvatar
                  rounded="sm"
                  size={40}
                  avatar={
                    item.menu_item?.avatar?.url ?? item?.avatar?.url ??
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
                      {/* Show menu_item_variant info if available, fallback to variant_name */}
                      {item.menu_item_variant?.variant ||
                        item.variant_name ||
                        "N/A"}
                    </FFText>
                    {item.menu_item_variant?.price && (
                      <FFText
                        fontWeight="400"
                        fontSize="sm"
                        style={{ color: "#4c9f3a" }}
                      >
                        ${item.menu_item_variant.price}
                      </FFText>
                    )}
                  </View>
                </View>
                <TouchableOpacity
                  onPress={() => setIsExpandedOrderItem(!isExpandedOrderItem)}
                  className="flex-row items-center justify-between"
                >
                  <IconFeather
                    size={20}
                    name={isExpandedOrderItem ? "chevron-up" : "chevron-down"}
                  />
                </TouchableOpacity>
              </View>
            ))
          ) : (
            <FFText style={{ color: "#aaa" }}>Order items not available</FFText>
          )}
          <FFSeperator />
          <View className="flex-row justify-between items-center">
            <FFText fontWeight="400" style={{ color: "#aaa" }}>
              Total
            </FFText>
            <FFText style={{ color: "#4c9f3a" }}>${getTotalAmount()}</FFText>
          </View>
        </FFView>
      </>
    );
  };

  // Render completed or cancelled order content
  const renderNonActiveOrderContent = () => {
    if (!detailedOrder) return null;
    console.log("check detailed order", detailedOrder?.cancellation_title);

    return (
      <>
        {(detailedOrder?.cancellation_title ||
          detailedOrder?.cancellation_reason ||
          detailedOrder?.cancellation_description) && (
          <FFView
            style={{
              ...styles.cancellationContainer,
              width: "100%",
              padding: spacing.md,
              borderRadius: 12,
              gap: 4,
              elevation: 3,
            }}
          >
            {(detailedOrder?.cancellation_title ||
              detailedOrder?.cancellation_reason ||
              detailedOrder?.cancellation_description) && (
              <>
                <View style={styles.cancellationHeader}>
                  <FFText style={styles.cancellationHeaderText}>
                    Cancellation Details
                  </FFText>
                </View>

                {detailedOrder?.cancellation_title && (
                  <View style={styles.cancellationItem}>
                    <FFText style={styles.cancellationLabel}>Title:</FFText>
                    <FFText style={styles.cancellationText}>
                      {detailedOrder?.cancellation_title}
                    </FFText>
                  </View>
                )}

                {detailedOrder?.cancellation_reason && (
                  <View style={styles.cancellationItem}>
                    <FFText style={styles.cancellationLabel}>Reason:</FFText>
                    <FFText style={styles.cancellationText}>
                      {detailedOrder?.cancellation_reason}
                    </FFText>
                  </View>
                )}

                {detailedOrder?.cancellation_description && (
                  <View style={styles.cancellationItem}>
                    <FFText style={styles.cancellationLabel}>
                      Description:
                    </FFText>
                    <FFText style={styles.cancellationText}>
                      {detailedOrder?.cancellation_description}
                    </FFText>
                  </View>
                )}
              </>
            )}
          </FFView>
        )}
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
                ? formatTimestampToDate2(Number(detailedOrder.order_time))
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
            <TouchableOpacity onPress={() => {
              setModalReceiptDetails({
                status: "INFO",
                sub_total: Number(currentOrder?.sub_total ?? 0),
                service_fee: Number(currentOrder?.service_fee ?? 0),
                delivery_fee: Number(currentOrder?.delivery_fee ?? 0),
                total_amount: Number(currentOrder?.total_amount ?? 0),
                discount_amount: Number(currentOrder?.discount_amount ?? 0),
              })
            }}>
              <FFText style={{ color: colors.primary }} fontSize="sm">
                View Receipt
              </FFText>
            </TouchableOpacity>
          </View>
          <FFText fontWeight="400" fontSize="sm" style={{ color: "#aaa" }}>
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
                  <View className="flex-row gap-2">
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
                      {/* Show menu_item_variant info if available, fallback to variant_name */}
                      {item.menu_item_variant?.variant ||
                        item.variant_name ||
                        "N/A"}
                    </FFText>
                    {item.menu_item_variant?.price && (
                      <FFText
                        fontWeight="400"
                        fontSize="sm"
                        style={{ color: "#4c9f3a" }}
                      >
                        ${item.menu_item_variant.price}
                      </FFText>
                    )}
                  </View>
                </View>
                <TouchableOpacity
                  onPress={() => setIsExpandedOrderItem(!isExpandedOrderItem)}
                  className="flex-row items-center justify-between"
                >
                  <FFText fontWeight="400" fontSize="sm">
                    Show More
                  </FFText>
                  <IconFeather
                    size={20}
                    name={isExpandedOrderItem ? "chevron-up" : "chevron-down"}
                  />
                </TouchableOpacity>
              </View>
            ))
          ) : (
            <FFText style={{ color: "#aaa" }}>Order items not available</FFText>
          )}
          <FFSeperator />
          <View className="flex-row justify-between items-center">
            <FFText fontWeight="400" style={{ color: "#aaa" }}>
              Total
            </FFText>
            <FFText style={{ color: "#4c9f3a" }}>${getTotalAmount()}</FFText>
          </View>
        </FFView>
      </>
    );
  };
  console.log('cehck current order', currentOrder?.sub_total)

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
        {type === "ACTIVE" && currentOrder?.tracking_info && (
          <>
            <View style={{ paddingHorizontal: spacing.lg }} className="w-full">
              <FFProgressStage
                stageText={eta ? `Arriving in ${eta} minutes` : ''}
                completedSegments={currentOrderStage}
                totalSegments={orderStatusStages?.length ?? 0}
                eta={eta}
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
                  currentOrder.status as Enum_OrderStatus,
                  currentOrder.tracking_info as Enum_OrderTrackingInfo
                )}
              </FFText>
              <Image
                source={{
                  uri: getTrackingImage(
                    currentOrder.status as Enum_OrderStatus,
                    currentOrder.tracking_info as Enum_OrderTrackingInfo
                  ),
                }}
                style={{ width: "100%", height: 200, resizeMode: "cover" }}
              />
            </View>
            
            {/* Real-time Order Tracking Map */}
            {(restaurantLocation || customerLocation || driverLocation ) && currentOrder?.status === Enum_OrderStatus.EN_ROUTE && (
              <FFView
                style={{
                  width: "100%",
                  padding: spacing.md,
                  borderRadius: 12,
                  elevation: 3,
                  marginVertical: spacing.sm,
                }}
              >
                <View className="flex-row justify-between items-center mb-2">
                  <FFText fontSize="lg">
                    Live Tracking
                  </FFText>
                  {currentOrder?.updated_at && (
                    <View style={{
                      backgroundColor: colors.white,
                      paddingHorizontal: spacing.sm,
                      paddingVertical: spacing.xs,
                      borderRadius: 8,
                      elevation: 1,
                      borderWidth: 1,
                      borderColor: '#e0e0e0'
                    }}>
                      <FFText fontSize="sm" style={{ color: colors.textSecondary }}>
                        {formatTimestampToDate2(currentOrder.updated_at)}
                      </FFText>
                    </View>
                  )}
                </View>
            
                  <OrderTrackingMap
                  restaurantLocation={restaurantLocation}
                  customerLocation={customerLocation}
                  driverLocation={driverLocation}
                  style={{
                    borderRadius: 8,
                    elevation: 2,
                  }}
                />
              </FFView>
            )}

            {currentOrder.driver_id && (
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
                      avatar={
                        currentOrder?.driverDetails?.avatar?.url ?? undefined
                      }
                    />
                    <View className="absolute -bottom-2 left-3 p-1 rounded-lg bg-[#56a943]">
                      <FFText
                        fontSize="sm"
                        fontWeight="400"
                        style={{ color: "#fff" }}
                      >
                        {currentOrder?.driverDetails?.rating?.average_rating ??
                          "4.8"}
                      </FFText>
                    </View>
                  </View>
                  <View>
                    <View className="flex-row items-center gap-2">
                      <FFText style={{ color: "#4c9f3a" }}>
                        {currentOrder?.driverDetails?.first_name ?? "N/A"},{" "}
                        {currentOrder?.driverDetails?.last_name ?? "N/A"}
                      </FFText>
                      <FFText fontSize="sm" style={{ marginTop: 2 }}>
                        {currentOrder?.driverDetails?.vehicle?.license_plate ??
                          "N/A"}
                      </FFText>
                    </View>
                    <FFText fontWeight="400" fontSize="sm">
                      {currentOrder?.driverDetails?.vehicle?.color ?? "N/A"}{" "}
                      {currentOrder?.driverDetails?.vehicle?.model ?? "N/A"}
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
                  <TouchableOpacity 
                    className="flex-row bg-gray-200 p-4 rounded-full flex-1"
                    onPress={handleNavigateToOrderChat}
                  >
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
        {type === "ACTIVE"
          ? renderActiveOrderContent()
          : renderNonActiveOrderContent()}
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
        {isLoading ? (
          <FFSpinner isVisible isOverlay /> // Show FFSpinner while loading
        ) : isTippedSuccessful ? (
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
      <FFModal 
        visible={modalReceiptDetails.status !== 'HIDDEN'}
        onClose={() => setModalReceiptDetails({ status: "HIDDEN", sub_total: 0, service_fee: 0, delivery_fee: 0, total_amount: 0, discount_amount: 0 })}
      >
        <View style={styles.receiptContainer}>
          {/* Receipt Header */}
          <View style={styles.receiptHeader}>
            <FFText style={styles.receiptTitle}> ORDER RECEIPT</FFText>
            <FFText style={styles.receiptSubtitle}>{currentOrder?.restaurant?.restaurant_name}'s Delivery</FFText>
                         <FFSeperator />
          </View>

          {/* Order Information */}
          <View style={styles.receiptSection}>
            <View style={styles.receiptRow}>
              <FFText style={styles.receiptLabel}>Order ID:</FFText>
              <FFText style={styles.receiptValue}>#{currentOrder?.id?.slice(-8) || 'N/A'}</FFText>
            </View>
                         <View style={styles.receiptRow}>
               <FFText style={styles.receiptLabel}>Date & Time:</FFText>
               <FFText style={styles.receiptValue}>
                 {currentOrder?.updated_at 
                   ? formatTimestampToDate2(Number(currentOrder.updated_at))
                   : 'N/A'
                 }
               </FFText>
             </View>
             <View style={styles.receiptRow}>
               <FFText style={styles.receiptLabel}>Status:</FFText>
               <FFText style={styles.receiptValueGreen}>
                 {currentOrder?.status || 'N/A'}
               </FFText>
             </View>
          </View>

                     <FFSeperator />

           {/* Restaurant Information */}
           <View style={styles.receiptSection}>
             <FFText style={styles.receiptSectionTitle}>Restaurant</FFText>
             <FFText style={styles.receiptRestaurantName}>
               {currentOrder?.restaurant?.restaurant_name || 'N/A'}
             </FFText>
             <FFText style={styles.receiptAddress}>
               {getRestaurantAddress()}
             </FFText>
           </View>

           <FFSeperator />

           {/* Financial Breakdown */}
           <View style={styles.receiptSection}>
             <FFText style={styles.receiptSectionTitle}>Order Summary</FFText>
             
             <View style={styles.receiptRow}>
               <FFText style={styles.receiptLabel}>Subtotal</FFText>
               <FFText style={styles.receiptValue}>${modalReceiptDetails.sub_total.toFixed(2)}</FFText>
             </View>
             
             <View style={styles.receiptRow}>
               <FFText style={styles.receiptLabel}>Service Fee</FFText>
               <FFText style={styles.receiptValue}>${modalReceiptDetails.service_fee.toFixed(2)}</FFText>
             </View>
             
             <View style={styles.receiptRow}>
               <FFText style={styles.receiptLabel}>Delivery Fee</FFText>
               <FFText style={styles.receiptValue}>${modalReceiptDetails.delivery_fee.toFixed(2)}</FFText>
             </View>
             
             {modalReceiptDetails.discount_amount > 0 && (
               <View style={styles.receiptRow}>
                 <FFText style={styles.receiptLabelGreen}>Discount</FFText>
                 <FFText style={styles.receiptValueGreen}>-${modalReceiptDetails.discount_amount.toFixed(2)}</FFText>
               </View>
             )}
           </View>


          {/* Total */}
          <View style={styles.receiptTotalSection}>
            <View style={styles.receiptTotalRow}>
              <FFText style={styles.receiptTotalLabel}>TOTAL AMOUNT</FFText>
              <FFText style={styles.receiptTotalValue}>${modalReceiptDetails.total_amount.toFixed(2)}</FFText>
            </View>
          </View>

          {/* Footer */}
          <View style={styles.receiptFooter}>
            <FFText style={styles.receiptFooterText}>Thank you for your order!</FFText>
            <FFText style={styles.receiptFooterSubtext}>Visit us again soon</FFText>
          </View>
        </View>
      </FFModal>
    </>
  );
};

const styles = StyleSheet.create({
  cancellationContainer: {
    marginTop: spacing.md,
    backgroundColor: "#FFF5F5", // Light red background
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: "#FED7D7", // Light red border
    padding: spacing.md,
    ...shadows.xs,
  },
  cancellationHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.sm,
    paddingBottom: spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: "#FED7D7",
  },
  cancellationHeaderText: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.bold,
    color: colors.error,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  cancellationItem: {
    marginBottom: spacing.sm,
  },
  cancellationLabel: {
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.medium,
    color: colors.error,
    marginBottom: spacing.xs,
    textTransform: "uppercase",
    letterSpacing: 0.3,
  },
  cancellationText: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.regular,
    color: colors.text,
    lineHeight: typography.lineHeight.sm,
    backgroundColor: colors.white,
    padding: spacing.sm,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: "#FED7D7",
  },
  receiptContainer: {
    padding: spacing.md,
  },
  receiptHeader: {
    alignItems: "center",
  },
  receiptTitle: {
    fontSize: typography.fontSize.lg,
    fontFamily: typography.fontFamily.bold,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  receiptSubtitle: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.regular,
    color: colors.textSecondary,
  },
  receiptSection: {
    marginBottom: spacing.md,
  },
  receiptSectionTitle: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.bold,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  receiptRestaurantName: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.bold,
    color: colors.text,
  },
  receiptAddress: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.regular,
    color: colors.textSecondary,
  },
  receiptRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: spacing.sm,
  },
  receiptLabel: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.regular,
    color: colors.textSecondary,
  },
     receiptValue: {
     fontSize: typography.fontSize.sm,
     fontFamily: typography.fontFamily.regular,
     color: colors.text,
   },
   receiptValueGreen: {
     fontSize: typography.fontSize.sm,
     fontFamily: typography.fontFamily.regular,
     color: '#16a34a',
     fontWeight: '600',
   },
   receiptLabelGreen: {
     fontSize: typography.fontSize.sm,
     fontFamily: typography.fontFamily.regular,
     color: '#16a34a',
   },
  receiptTotalSection: {
    marginTop: spacing.md,
    borderTopWidth: 2,
    borderTopColor: "#000",
  },
  receiptTotalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: spacing.sm,
  },
  receiptTotalLabel: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.bold,
    color: colors.textSecondary,
  },
  receiptTotalValue: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.bold,
    color: colors.text,
  },
  receiptFooter: {
    alignItems: "center",
    marginTop: spacing.md,
  },
  receiptFooterText: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.bold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  receiptFooterSubtext: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.regular,
    color: colors.textSecondary,
  },
});
