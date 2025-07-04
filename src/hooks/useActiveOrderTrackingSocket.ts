import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import { useDispatch, useSelector } from "@/src/store/types";
import store, { RootState } from "@/src/store/store";
import { BACKEND_URL } from "../utils/constants";
import {
  Enum_OrderStatus,
  Enum_OrderTrackingInfo,
  OrderTrackingBase,
  OrderItem,
} from "../types/Orders";
import {
  removeOrderTracking,
  updateAndSaveOrderTracking,
} from "@/src/store/orderTrackingRealtimeSlice";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { MainStackParamList } from "../navigation/AppNavigator";
import axiosInstance from "@/src/utils/axiosConfig";
import { OrderTracking } from "@/src/types/screens/Order";
import { Avatar } from "@/src/types/common";

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
  restaurant_avatar: { key: string; url: string } | null;
  driver_avatar: { key: string; url: string } | null;
  restaurantAddress: AddressBook | null;
  customerAddress: AddressBook | null;
  driverDetails: {
    id: string;
    first_name: string;
    last_name: string;
    avatar: { key: string; url: string } | null;
    rating: { average_rating: string };
    vehicle: {
      color: string;
      model: string;
      license_plate: string;
    };
  } | null;
  customerFullAddress: string;
  restaurantFullAddress: string;
  // NEW: order_items field that sometimes comes with menu_item_variant data
  order_items?: OrderItem[] | null;
  // NEW: Additional fields that sometimes come with notifyOrderStatus
  total_amount?: number | string;
  delivery_fee?: number | string;
  service_fee?: number | string;
  distance?: number | string;
  total_restaurant_earn?: number | string;
  promotions_applied?: any[];
  // Add customer_note to the socket interface
  customer_note?: string;
  restaurant_note?: string;
  // Add the new fields
  sub_total?: number | string;
  discount_amount?: number | string;
}

interface OrderTrackingState {
  orders: OrderTracking[];
}

interface DriverRatingInfo {
  id: string;
  avatar: Avatar | null;
}

interface RestaurantRatingInfo {
  id: string;
  avatar: Avatar | null;
}

type OrderScreenNavigationProp = StackNavigationProp<
  MainStackParamList,
  "BottomTabs"
>;

export const useActiveOrderTrackingSocket = () => {
  const navigation = useNavigation<OrderScreenNavigationProp>();
  const [socket, setSocket] = useState<Socket | null>(null);
  const { accessToken, id , } = useSelector((state: RootState) => state.auth);
  const { orders } = useSelector((state: RootState) => state.orderTrackingRealtime);
  // Store driverAvatar in state to ensure it persists across renders
  const [persistedDriverAvatar, setPersistedDriverAvatar] = useState<Avatar | null>(null);
  const driverAvatar = orders?.[0]?.driver?.avatar || orders?.[0]?.driverDetails?.avatar || orders?.[0]?.driver_avatar
  const dispatch = useDispatch();

  // Update persisted driver avatar whenever it changes in orders
  useEffect(() => {
    if (driverAvatar) {
      setPersistedDriverAvatar(driverAvatar);
      console.log('Updated persistedDriverAvatar:', driverAvatar);
    }
  }, [driverAvatar]);

  useEffect(() => {
    if (!accessToken || !id) {
      return;
    }

    const socketInstance = io(`${BACKEND_URL}/customer`, {
      transports: ["websocket"],
      extraHeaders: {
        auth: `Bearer ${accessToken}`,
      },
    });

    socketInstance.on("connect", () => {
      console.log("🟢 Connected to order tracking server");
      setSocket(socketInstance);

      // CRITICAL FIX: Intelligent cleanup - only remove truly stale orders
      // Don't remove recent orders that might not be on server yet
      axiosInstance
        .get(`/customers/orders/${id}`)
        .then((response) => {
          const serverOrders = response.data.data || [];
          const serverOrderIds = new Set(
            serverOrders.map((o: OrderTracking) => o.id)
          );

          // Get current orders from Redux
          const state = store.getState() as {
            orderTrackingRealtime: OrderTrackingState;
          };
          const currentOrders = state.orderTrackingRealtime.orders;

          // Only remove orders that are:
          // 1. Not found on server AND
          // 2. Older than 5 minutes (to allow for server processing delay)
          const fiveMinutesAgo = Math.floor(Date.now() / 1000) - 5 * 60;

          currentOrders.forEach((order: OrderTracking) => {
            const orderId = order.orderId || order.id;
            const isOnServer = serverOrderIds.has(orderId);
            const isOld = order.updated_at < fiveMinutesAgo;

            if (!isOnServer && isOld) {
              console.log(
                `Removing stale order ${orderId} - not found on server and older than 5 minutes`
              );
              dispatch(removeOrderTracking(orderId));
            } else if (!isOnServer && !isOld) {
              console.log(
                `Keeping recent order ${orderId} - not on server yet but less than 5 minutes old`
              );
            }
          });
        })
        .catch((error) => {
          console.error("Error cleaning up stale orders:", error);
        });
    });

    socketInstance.on("disconnect", (reason) => {
      console.log("🔴 Disconnected:", reason);
      setSocket(null);
    });

    socketInstance.on("connect_error", (error) => {
      console.error("Connection error:", error.name, error.cause);
      setSocket(null);
    });

    const handleOrderUpdate = async (data: OrderTrackingSocket) => {
      console.log("Socket event received:", {
        orderId: data.orderId,
        status: data.status,
        tracking: data.tracking_info,
      });

      try {
        // CRITICAL FIX: Don't block event listener with server verification
        // Use socket data directly and verify in background
        const orderStatus = data.status;
        const trackingInfo = data.tracking_info;

        // CRITICAL FIX: Disable aggressive background verification
        // The socket event itself is the source of truth, don't second-guess it
        // Background server verification was removing valid orders too quickly
        console.log(
          "📡 Socket event is source of truth, skipping background verification for:",
          data.orderId
        );

        // Log status changes
        console.log("Order status update:", {
          orderId: data.orderId,
          previousStatus: data.status,
          newStatus: orderStatus,
          tracking: trackingInfo,
        });
        console.log('check driver avt',data.driverDetails?.avatar ?? data.driver_avatar ?? persistedDriverAvatar ?? driverAvatar )
        // For delivered orders, show rating screen but keep the order
        if (orderStatus === Enum_OrderStatus.DELIVERED) {
          const driverInfo: DriverRatingInfo = {
            id: data.driver_id || "unknown",
            avatar: data.driverDetails?.avatar ?? data.driver_avatar ?? persistedDriverAvatar ?? driverAvatar,
          };

          const restaurantInfo: RestaurantRatingInfo = {
            id: data.restaurant_id,
            avatar: data.restaurant_avatar,
          };

          console.log('Driver info for Rating screen:', {
            driverId: driverInfo.id,
            hasAvatar: !!driverInfo.avatar,
            avatarSource: data.driverDetails?.avatar ? 'driverDetails.avatar' : 
                         data.driver_avatar ? 'driver_avatar' : 
                         persistedDriverAvatar ? 'persistedDriverAvatar' : 
                         driverAvatar ? 'driverAvatar from orders' : 'none'
          });

          navigation.navigate("Rating", {
            driver: driverInfo,
            restaurant: restaurantInfo,
            orderId: data.orderId,
          });
        }

        // For active orders, verify all required fields are present
        if (
          !data.orderId ||
          !data.customer_id ||
          !data.restaurant_id ||
          !orderStatus
        ) {
          console.log("Invalid order data received:", {
            orderId: data.orderId,
            customerId: data.customer_id,
            restaurantId: data.restaurant_id,
            status: orderStatus,
            data: data,
          });
          return;
        }

        // Convert address types
        const convertAddress = (address: AddressBook | null) => {
          if (!address) {
            // Return default address object when null
            return {
              id: "default",
              street: "",
              city: "",
              nationality: "",
              is_default: false,
              created_at: Math.floor(Date.now() / 1000),
              updated_at: Math.floor(Date.now() / 1000),
              postal_code: 0,
              location: {
                lat: 0,
                lon: 0,
              },
              title: "",
            };
          }
          return {
            id: address.id,
            street: address.street,
            city: address.city,
            nationality: address.nationality,
            is_default: address.is_default,
            created_at: address.created_at,
            updated_at: address.updated_at,
            postal_code: address.postal_code,
            location: {
              lat: address.location.lat,
              lon: address.location.lng,
            },
            title: address.title,
          };
        };

        // Get existing order from store to preserve data not included in the update
        const currentState = store.getState();
        const existingOrder = currentState.orderTrackingRealtime.orders.find(
          (order) => order.orderId === data.orderId
        );

        // ENHANCED ORDER_ITEMS MERGE: Preserve menu_item_variant data and avatar when it exists
        const mergeOrderItems = (
          incomingItems: OrderItem[] | null | undefined,
          existingItems: OrderItem[] | undefined
        ): OrderItem[] => {
          // If no incoming items, keep existing
          if (!incomingItems || incomingItems.length === 0) {
            return existingItems || [];
          }

          // If no existing items, use incoming
          if (!existingItems || existingItems.length === 0) {
            return incomingItems;
          }

          // Merge items intelligently - preserve menu_item_variant and avatar when they exist
          return incomingItems.map((incomingItem) => {
            const existingItem = existingItems.find(
              (existing) =>
                existing.item_id === incomingItem.item_id &&
                existing.variant_id === incomingItem.variant_id
            );

            if (!existingItem) {
              return incomingItem;
            }

            // Log avatar preservation for debugging
            const hasIncomingAvatar = !!(incomingItem.avatar && incomingItem.avatar.url);
            const hasExistingAvatar = !!(existingItem.avatar && existingItem.avatar.url);
            const hasIncomingMenuItemAvatar = !!(incomingItem.menu_item && incomingItem.menu_item.avatar && incomingItem.menu_item.avatar.url);
            const hasExistingMenuItemAvatar = !!(existingItem.menu_item && existingItem.menu_item.avatar && existingItem.menu_item.avatar.url);
            
            console.log(`Avatar preservation for item ${incomingItem.name}:`, {
              hasIncomingAvatar,
              hasExistingAvatar,
              hasIncomingMenuItemAvatar,
              hasExistingMenuItemAvatar,
              willPreserveAvatar: !hasIncomingAvatar && hasExistingAvatar,
              willPreserveMenuItemAvatar: !hasIncomingMenuItemAvatar && hasExistingMenuItemAvatar
            });

            // Merge the items, preserving important data
            return {
              ...incomingItem,
              // Preserve avatar if the incoming item doesn't have one
              avatar: (incomingItem.avatar && incomingItem.avatar.url) 
                ? incomingItem.avatar 
                : existingItem.avatar,
              
              // Preserve menu_item with its avatar if the incoming doesn't have one
              menu_item: incomingItem.menu_item 
                ? {
                    ...incomingItem.menu_item,
                    // If incoming menu_item exists but doesn't have avatar, use existing avatar
                    avatar: (incomingItem.menu_item.avatar && incomingItem.menu_item.avatar.url)
                      ? incomingItem.menu_item.avatar
                      : existingItem.menu_item?.avatar || null
                  }
                : existingItem.menu_item,
              
              // Preserve menu_item_variant if the incoming item doesn't have one
              menu_item_variant: incomingItem.menu_item_variant || existingItem.menu_item_variant,
              
              // Preserve variant_name if needed
              variant_name: incomingItem.variant_name || existingItem.variant_name
            };
          });
        };

        console.log("🔍 DETAILED notifyOrderStatus DATA:", {
          orderId: data.orderId,
          status: data.status,
          tracking_info: data.tracking_info,
          hasOrderItems: !!data.order_items,
          orderItemsCount: data.order_items?.length || 0,
          // Add sub_total and discount_amount to logging
          sub_total: data.sub_total,
          discount_amount: data.discount_amount,
          orderItemsDetails: data.order_items?.map((item) => ({
            name: item.name,
            quantity: item.quantity,
            price_at_time_of_order: item.price_at_time_of_order,
            hasMenuItemVariant: !!item.menu_item_variant,
            menuItemVariant: item.menu_item_variant,
            // Log avatar info for debugging
            hasAvatar: !!(item.avatar && item.avatar.url),
            hasMenuItemAvatar: !!(item.menu_item && item.menu_item.avatar && item.menu_item.avatar.url)
          })),
          totalAmount: (data as any).total_amount,
          deliveryFee: (data as any).delivery_fee,
          serviceFee: (data as any).service_fee,
          distance: (data as any).distance,
          allIncomingFields: Object.keys(data),
          // Add customer_note debugging
          customerNote: data.customer_note,
          hasCustomerNote: data.customer_note !== undefined,
        });

        console.log("📊 MERGE INFO:", {
          orderId: data.orderId,
          existingOrderFound: !!existingOrder,
          incomingDriverDetails: !!data.driverDetails,
          incomingDriverDetailsValid: !!(
            data.driverDetails && Object.keys(data.driverDetails).length > 0
          ),
          existingDriverDetails: !!existingOrder?.driverDetails,
          willPreserveExistingDriverDetails: !!(
            existingOrder?.driverDetails &&
            (!data.driverDetails ||
              Object.keys(data.driverDetails).length === 0)
          ),
          incomingOrderItems: !!data.order_items,
          incomingOrderItemsCount: data.order_items?.length || 0,
          existingOrderItemsCount: existingOrder?.order_items?.length || 0,
          hasMenuItemVariant:
            data.order_items?.some((item) => !!item.menu_item_variant) || false,
          // Add avatar debugging
          hasAvatarInIncomingItems: data.order_items?.some(item => item.avatar && item.avatar.url) || false,
          hasAvatarInExistingItems: existingOrder?.order_items?.some(item => item.avatar && item.avatar.url) || false,
          hasMenuItemAvatarInIncomingItems: data.order_items?.some(item => item.menu_item && item.menu_item.avatar && item.menu_item.avatar.url) || false,
          hasMenuItemAvatarInExistingItems: existingOrder?.order_items?.some(item => item.menu_item && item.menu_item.avatar && item.menu_item.avatar.url) || false,
          // Add customer_note debugging
          incomingCustomerNote: data.customer_note,
          existingCustomerNote: existingOrder?.customer_note,
          willPreserveExistingCustomerNote: data.customer_note === undefined && !!existingOrder?.customer_note,
        });

        // Create base order with required fields
        const baseOrder: OrderTracking = {
          id: data.orderId,
          orderId: data.orderId,
          status: orderStatus,
          tracking_info: trackingInfo,
          updated_at: data.updated_at,
          customer_id: data.customer_id,
          restaurant_id: data.restaurant_id,
          customer: {
            avatar: null,
            favorite_items: null,
            first_name: "",
            id: data.customer_id,
            last_name: "",
          },
          customerAddress: convertAddress(null),
          restaurantAddress: convertAddress(null),
          customer_location: "",
          customer_note: "",
          delivery_time: "0",
          distance: "0",
          driver: null,
          driver_id: null,
          order_items: [],
          order_time: "0",
          payment_method: "",
          payment_status: "PENDING",
          restaurant: {
            id: data.restaurant_id,
            avatar: null,
          },
          restaurant_location: "",
          restaurant_note: "",
          total_amount: "0",
          service_fee: 0,
          delivery_fee: 0,
          sub_total: 0,
          discount_amount: 0,
          // Add missing properties
          restaurant_avatar: null,
          driver_avatar: null,
          driverDetails: null,
          restaurantFullAddress: "",
          customerFullAddress: "",
        };

        // Create a merged base by combining existing order with base order
        // This ensures all required fields exist
        const mergedBase = existingOrder ? { ...baseOrder, ...existingOrder } : baseOrder;

        // Now apply specific updates from the incoming data
        const mergedData: OrderTracking = {
          ...mergedBase,
          
          // Always update these core tracking fields
          status: orderStatus,
          tracking_info: trackingInfo,
          updated_at: data.updated_at,

          // Only update these fields if they're explicitly provided
          driver_id: data.driver_id !== undefined ? data.driver_id : mergedBase.driver_id,
          restaurant_avatar: data.restaurant_avatar || mergedBase.restaurant_avatar,
          driver_avatar: data.driver_avatar || mergedBase.driver_avatar || persistedDriverAvatar,
          
          // Handle address data
          restaurantAddress: data.restaurantAddress 
              ? convertAddress(data.restaurantAddress) 
              : mergedBase.restaurantAddress,
              
          customerAddress: data.customerAddress 
              ? convertAddress(data.customerAddress) 
              : mergedBase.customerAddress,

          // CRITICAL: Never overwrite driverDetails with null/undefined
          driverDetails: data.driverDetails && Object.keys(data.driverDetails).length > 0
              ? data.driverDetails
              : mergedBase.driverDetails,

          // Handle full addresses
          restaurantFullAddress: data.restaurantFullAddress !== undefined
              ? data.restaurantFullAddress
              : data.restaurantAddress
                ? `${data.restaurantAddress.street}, ${data.restaurantAddress.city}, ${data.restaurantAddress.nationality}`
                : mergedBase.restaurantFullAddress,
                
          customerFullAddress: data.customerFullAddress !== undefined
              ? data.customerFullAddress
              : data.customerAddress
                ? `${data.customerAddress.street}, ${data.customerAddress.city}, ${data.customerAddress.nationality}`
                : mergedBase.customerFullAddress,

          // Handle driver data
          driver: data.driver_id
              ? {
                  id: data.driver_id,
                  avatar: data.driver_avatar || mergedBase.driver?.avatar || persistedDriverAvatar,
                }
              : mergedBase.driver,
              
          // CRITICAL: Use the intelligent order_items merge function
          order_items: mergeOrderItems(
            data.order_items,
            mergedBase.order_items
          ),
          
          // Handle financial data
          sub_total: data.sub_total !== undefined
              ? typeof data.sub_total === 'string' ? parseFloat(data.sub_total) : data.sub_total
              : mergedBase.sub_total,
              
          discount_amount: data.discount_amount !== undefined
              ? typeof data.discount_amount === 'string' ? parseFloat(data.discount_amount) : data.discount_amount
              : mergedBase.discount_amount,
              
          service_fee: data.service_fee !== undefined
              ? typeof data.service_fee === 'string' ? parseFloat(data.service_fee) : data.service_fee
              : mergedBase.service_fee,
              
          delivery_fee: data.delivery_fee !== undefined
              ? typeof data.delivery_fee === 'string' ? parseFloat(data.delivery_fee) : data.delivery_fee
              : mergedBase.delivery_fee,
          
          // Handle notes
          customer_note: data.customer_note !== undefined 
              ? data.customer_note 
              : mergedBase.customer_note,
              
          restaurant_note: data.restaurant_note !== undefined
              ? data.restaurant_note
              : mergedBase.restaurant_note,
          
          // Handle total amount
          total_amount: data.total_amount !== undefined
              ? String(data.total_amount)
              : mergedBase.total_amount,
          
          // Handle distance
          distance: data.distance !== undefined
              ? String(data.distance)
              : mergedBase.distance,
        };

        console.log("🚀 FINAL MERGED DATA:", {
          orderId: mergedData.orderId,
          status: mergedData.status,
          tracking_info: mergedData.tracking_info,
          // Log all critical fields to verify preservation
          driverDetailsPreserved: !!mergedData.driverDetails,
          wasExistingOrder: !!existingOrder,
          // Financial data
          totalAmount: mergedData.total_amount,
          subTotal: mergedData.sub_total,
          discountAmount: mergedData.discount_amount,
          serviceFee: mergedData.service_fee,
          deliveryFee: mergedData.delivery_fee,
          // Address data
          distance: mergedData.distance,
          customerFullAddress: mergedData.customerFullAddress,
          restaurantFullAddress: mergedData.restaurantFullAddress,
          // Notes
          customerNote: mergedData.customer_note,
          restaurantNote: mergedData.restaurant_note,
          // Critical data preservation
          hasDriverDetails: !!mergedData.driverDetails,
          hasMenuItemVariantData: mergedData.order_items?.some(
            (item) => !!item.menu_item_variant
          ) || false,
          // Avatar preservation
          orderItemsCount: mergedData.order_items?.length || 0,
          orderItemsWithAvatars: mergedData.order_items?.filter(
            (item) => item.avatar && item.avatar.url
          ).length || 0,
          orderItemsWithMenuItemAvatars: mergedData.order_items?.filter(
            (item) => item.menu_item && item.menu_item.avatar && item.menu_item.avatar.url
          ).length || 0,
          // Menu item variant data
          menuItemVariantItems: mergedData.order_items
            ?.filter((item) => !!item.menu_item_variant)
            .map((item) => ({
              name: item.name,
              variant: item.menu_item_variant?.variant,
              price: item.menu_item_variant?.price,
            })) || [],
          // Data source
          dataFromExisting: existingOrder ? Object.keys(existingOrder) : [],
          dataFromIncoming: Object.keys(data),
        });

        dispatch(updateAndSaveOrderTracking(mergedData));
      } catch (error) {
        console.error("Error handling order update:", error);
        // If we can't verify the order with the server, remove it from tracking
        dispatch(removeOrderTracking(data.orderId));
      }
    };

    // Test if socket can receive any events
    socketInstance.onAny((eventName) => {
      console.log("🎯 Socket received ANY event:", eventName);
    });

    socketInstance.on("notifyOrderStatus", (data: OrderTrackingSocket) => {
      console.log("🚨 NOTIFYORDERSTATUS EVENT RECEIVED!");
      console.log("check data:", JSON.stringify(data, null, 2));
      handleOrderUpdate(data);
    });

    setSocket(socketInstance);

    return () => {
      if (socketInstance) {
        socketInstance.disconnect();
      }
    };
  }, [accessToken, id]); // CRITICAL: Only depend on auth data to prevent re-renders

  return {
    socket,
  };
};
