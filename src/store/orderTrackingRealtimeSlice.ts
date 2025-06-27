import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { OrderTrackingBase } from "@/src/types/Orders";
import { Enum_OrderStatus, Enum_OrderTrackingInfo } from "@/src/types/Orders";
import { debounce } from "lodash";
import { OrderTracking as OrderTrackingType } from "@/src/types/screens/Order";

// src/store/orderTrackingRealtimeSlice.ts
export type OrderTracking = OrderTrackingType & {
  // Explicitly define customer_note to ensure it's preserved
  customer_note?: string;
  restaurant_note?: string;
};

export interface OrderTrackingRealtimeState {
  orders: OrderTracking[];
}

const STORAGE_KEY = "@order_tracking_v1";

const initialState: OrderTrackingRealtimeState = {
  orders: [],
};

// Helper function to map order to log format
const mapOrderToLog = (order: OrderTracking) => ({
  id: order.orderId || order.id,
  status: order.status,
  tracking: order.tracking_info,
  // Add customer_note to the log
  customerNote: order.customer_note || "(empty)",
  // Add sub_total and discount_amount to the log
  subTotal: order.sub_total || 0,
  discountAmount: order.discount_amount || 0,
});

// Debounced function to save to AsyncStorage
const debouncedSaveToStorage = debounce(async (orders: OrderTracking[]) => {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
    console.log("✅ Successfully saved orders to AsyncStorage:", {
      count: orders.length,
      orderIds: orders.map((o) => o.orderId || o.id),
      statuses: orders.map((o) => o.status),
      // Log customer notes to verify they're being saved
      customerNotes: orders.map((o) => o.customer_note || "(empty)"),
      // Log sub_total and discount_amount to verify they're being saved
      subTotals: orders.map((o) => o.sub_total || 0),
      discountAmounts: orders.map((o) => o.discount_amount || 0),
    });
  } catch (error) {
    console.error("❌ Error saving to AsyncStorage:", error);
  }
}, 500); // Reduced debounce time for faster saves

// NON-BLOCKING save function - don't await to avoid blocking event listeners
const saveToStorageNonBlocking = (orders: OrderTracking[]) => {
  AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(orders))
    .then(() => {
      console.log("🚀 Saved orders to AsyncStorage:", {
        count: orders.length,
        orderIds: orders.map((o) => o.orderId || o.id),
        statuses: orders.map((o) => o.status),
        // Log customer notes to verify they're being saved
        customerNotes: orders.map((o) => o.customer_note || "(empty)"),
        // Log sub_total and discount_amount to verify they're being saved
        subTotals: orders.map((o) => o.sub_total || 0),
        discountAmounts: orders.map((o) => o.discount_amount || 0),
      });
    })
    .catch((error) => {
      console.error("❌ Error saving to AsyncStorage:", error);
    });
};

export const updateAndSaveOrderTracking = createAsyncThunk(
  "orderTrackingRealtime/updateAndSaveOrderTracking",
  async (order: OrderTracking, { getState }) => {
    const state = getState() as {
      orderTrackingRealtime: OrderTrackingRealtimeState;
    };
    const currentOrders = state.orderTrackingRealtime.orders;

    // Log current state
    console.log("Current orders before update:", {
      count: currentOrders.length,
      orders: currentOrders.map(mapOrderToLog),
    });

    // Keep all orders, including completed and cancelled
    // CRITICAL FIX: Handle both orderId and id fields for proper matching
    const existingIndex = currentOrders.findIndex(
      (o) => (o.orderId || o.id) === (order.orderId || order.id)
    );

    let updatedOrders: OrderTracking[];
    if (existingIndex !== -1) {
      // Update existing order
      const existingOrder = currentOrders[existingIndex];
      
      // CRITICAL: Start with the existing order as base to preserve ALL fields
      // Then only update fields that are explicitly provided in the incoming order
      updatedOrders = [...currentOrders];
      updatedOrders[existingIndex] = {
        ...existingOrder,  // Preserve ALL existing fields
        ...order,          // Apply updates from incoming order
        
        // CRITICAL: Special handling for fields that should never be overwritten with null/undefined
        
        // Preserve customer_note if the incoming order doesn't have one
        customer_note: order.customer_note !== undefined 
          ? order.customer_note 
          : existingOrder.customer_note,
        
        // Preserve restaurant_note if the incoming order doesn't have one
        restaurant_note: order.restaurant_note !== undefined 
          ? order.restaurant_note 
          : existingOrder.restaurant_note,
        
        // Preserve sub_total if the incoming order doesn't have it
        sub_total: order.sub_total !== undefined 
          ? order.sub_total 
          : existingOrder.sub_total,
          
        // Preserve discount_amount if the incoming order doesn't have it
        discount_amount: order.discount_amount !== undefined 
          ? order.discount_amount 
          : existingOrder.discount_amount,
        
        // Preserve service_fee if the incoming order doesn't have it
        service_fee: order.service_fee !== undefined 
          ? order.service_fee 
          : existingOrder.service_fee,
          
        // Preserve delivery_fee if the incoming order doesn't have it
        delivery_fee: order.delivery_fee !== undefined 
          ? order.delivery_fee 
          : existingOrder.delivery_fee,
          
        // Preserve driver details if the incoming order doesn't have it
        driverDetails: order.driverDetails || existingOrder.driverDetails,
        
        // CRITICAL: Preserve order_items with their avatars and menu_item_variant data
        // Use a special merge function to ensure we don't lose any data
        order_items: order.order_items?.map(newItem => {
          // Find matching item in existing order
          const existingItem = existingOrder.order_items?.find(
            item => item.item_id === newItem.item_id && item.variant_id === newItem.variant_id
          );
          
          if (existingItem) {
            return {
              ...newItem,
              // Preserve avatar if the incoming item doesn't have one
              avatar: newItem.avatar || existingItem.avatar,
              // Preserve menu_item if the incoming item doesn't have one
              menu_item: newItem.menu_item 
                ? {
                    ...newItem.menu_item,
                    // If incoming menu_item exists but doesn't have avatar, use existing avatar
                    avatar: (newItem.menu_item.avatar && newItem.menu_item.avatar.url)
                      ? newItem.menu_item.avatar
                      : existingItem.menu_item?.avatar
                  }
                : existingItem.menu_item,
              // Preserve menu_item_variant if the incoming item doesn't have one
              menu_item_variant: newItem.menu_item_variant || existingItem.menu_item_variant
            };
          }
          
          return newItem;
        }) || existingOrder.order_items
      };
      
      console.log("Updated existing order:", {
        orderId: order.orderId,
        oldStatus: currentOrders[existingIndex].status,
        newStatus: order.status,
        // Log customer_note preservation
        oldCustomerNote: currentOrders[existingIndex].customer_note || "(empty)",
        newCustomerNote: order.customer_note || "(empty)",
        finalCustomerNote: updatedOrders[existingIndex].customer_note || "(empty)",
        // Log sub_total and discount_amount preservation
        oldSubTotal: currentOrders[existingIndex].sub_total,
        newSubTotal: order.sub_total,
        finalSubTotal: updatedOrders[existingIndex].sub_total,
        oldDiscountAmount: currentOrders[existingIndex].discount_amount,
        newDiscountAmount: order.discount_amount,
        finalDiscountAmount: updatedOrders[existingIndex].discount_amount,
        // Log service_fee and delivery_fee preservation
        oldServiceFee: currentOrders[existingIndex].service_fee,
        newServiceFee: order.service_fee,
        finalServiceFee: updatedOrders[existingIndex].service_fee,
        oldDeliveryFee: currentOrders[existingIndex].delivery_fee,
        newDeliveryFee: order.delivery_fee,
        finalDeliveryFee: updatedOrders[existingIndex].delivery_fee,
        // Log driver details preservation
        hasOldDriverDetails: !!currentOrders[existingIndex].driverDetails,
        hasNewDriverDetails: !!order.driverDetails,
        hasFinalDriverDetails: !!updatedOrders[existingIndex].driverDetails,
        // Log avatar preservation
        orderItemsWithAvatars: (updatedOrders[existingIndex].order_items || [])
          .filter(item => item.avatar || (item.menu_item && item.menu_item.avatar)).length,
        // Log menu item variant preservation
        orderItemsWithVariants: (updatedOrders[existingIndex].order_items || [])
          .filter(item => item.menu_item_variant).length
      });
    } else {
      // Add new order
      updatedOrders = [...currentOrders, order];
      console.log("Added new order:", {
        orderId: order.orderId,
        status: order.status,
        customerNote: order.customer_note || "(empty)",
        subTotal: order.sub_total,
        discountAmount: order.discount_amount,
        serviceFee: order.service_fee,
        deliveryFee: order.delivery_fee,
        hasDriverDetails: !!order.driverDetails,
        orderItemsWithAvatars: (order.order_items || [])
          .filter(item => item.avatar || (item.menu_item && item.menu_item.avatar)).length,
        orderItemsWithVariants: (order.order_items || [])
          .filter(item => item.menu_item_variant).length
      });
    }

    // Sort orders by updated_at timestamp (most recent first)
    updatedOrders.sort((a, b) => b.updated_at - a.updated_at);

    // Log final state
    console.log("Updated orders:", {
      count: updatedOrders.length,
      orders: updatedOrders.map(mapOrderToLog),
    });

    // Save to AsyncStorage - NON-BLOCKING to avoid interfering with event listeners
    debouncedSaveToStorage(updatedOrders);

    return updatedOrders;
  }
);

export const loadOrderTrackingFromAsyncStorage = createAsyncThunk(
  "orderTrackingRealtime/loadOrderTracking",
  async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      const orders = stored ? JSON.parse(stored) : [];

      // CRITICAL FIX: Load ALL orders, don't filter out completed/cancelled
      // User wants to persist all order data across app restarts
      const allOrders = orders
        .filter((order: OrderTracking) => {
          // Only filter out invalid/corrupted data
          // CRITICAL FIX: Handle both orderId and id fields
          return (
            order &&
            (order.orderId || order.id) &&
            order.status &&
            order.tracking_info
          );
        })
        .sort(
          (a: OrderTracking, b: OrderTracking) => b.updated_at - a.updated_at
        );

      // Log breakdown by status
      const statusBreakdown = allOrders.reduce(
        (acc: any, order: OrderTracking) => {
          acc[order.status] = (acc[order.status] || 0) + 1;
          return acc;
        },
        {}
      );

      return allOrders;
    } catch (error) {
      console.error("❌ Error loading from AsyncStorage:", error);
      return [];
    }
  }
);

const orderTrackingRealtimeSlice = createSlice({
  name: "orderTrackingRealtime",
  initialState,
  reducers: {
    removeOrderTracking: (state, action) => {
      const orderId = action.payload;
      console.log("🗑️ Removing order:", orderId);
      // CRITICAL FIX: Handle both orderId and id fields for proper matching
      state.orders = state.orders.filter(
        (order) => (order.orderId || order.id) !== orderId
      );
      // NON-BLOCKING save to avoid interfering with event listeners
      saveToStorageNonBlocking(state.orders);
      console.log("📊 Orders after removal:", state.orders.length);
    },
    clearOrderTracking: (state) => {
      console.log("🧹 Clearing all orders");
      state.orders = [];
      // NON-BLOCKING save to avoid interfering with event listeners
      saveToStorageNonBlocking([]);
    },
    // NEW: Direct state update with non-blocking save
    updateOrderTrackingState: (state, action) => {
      const orders = action.payload;
      console.log("🔄 Direct state update with orders:", orders.length);
      state.orders = orders;
      // NON-BLOCKING save to avoid interfering with event listeners
      saveToStorageNonBlocking(orders);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadOrderTrackingFromAsyncStorage.fulfilled, (state, action) => {


        // CRITICAL FIX: Don't overwrite existing realtime orders with empty persisted data
        // Merge persisted data with existing state to preserve realtime updates
        const persistedOrders = action.payload;
        const currentOrders = state.orders;

        if (persistedOrders.length === 0 && currentOrders.length > 0) {
          console.log(
            "🚫 Skipping empty AsyncStorage load - preserving realtime orders:",
            currentOrders.length
          );
          // Don't overwrite existing realtime orders with empty persisted data
          return;
        }

        // Merge persisted orders with current orders
        const mergedOrders = [...currentOrders];

        persistedOrders.forEach((persistedOrder: OrderTracking) => {
          const existingIndex = mergedOrders.findIndex(
            (o) =>
              (o.orderId || o.id) ===
              (persistedOrder.orderId || persistedOrder.id)
          );

          if (existingIndex !== -1) {
            // Update existing order only if persisted data is newer
            if (
              persistedOrder.updated_at > mergedOrders[existingIndex].updated_at
            ) {
              mergedOrders[existingIndex] = persistedOrder;
              console.log(
                "🔄 Updated order from persisted data:",
                persistedOrder.orderId || persistedOrder.id
              );
            }
          } else {
            // Add new persisted order
            mergedOrders.push(persistedOrder);
            console.log(
              "➕ Added persisted order:",
              persistedOrder.orderId || persistedOrder.id
            );
          }
        });

        // Sort by updated_at
        mergedOrders.sort((a, b) => b.updated_at - a.updated_at);

        state.orders = mergedOrders;
      })
      .addCase(updateAndSaveOrderTracking.fulfilled, (state, action) => {
        if (action.payload) {
         
          state.orders = action.payload;
          // The async thunk already handles saving, no need to save again here
        }
      })
      .addCase(loadOrderTrackingFromAsyncStorage.rejected, (state, action) => {
        console.error(
          "❌ Failed to load orders from AsyncStorage:",
          action.error
        );
        state.orders = [];
      })
      .addCase(updateAndSaveOrderTracking.rejected, (state, action) => {
        console.error("❌ Failed to update and save orders:", action.error);
      });
  },
});

export const {
  removeOrderTracking,
  clearOrderTracking,
  updateOrderTrackingState,
} = orderTrackingRealtimeSlice.actions;
export default orderTrackingRealtimeSlice.reducer;
