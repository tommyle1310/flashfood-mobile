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
      
      // CRITICAL FIX: Preserve customer_note if the incoming order doesn't have one
      const preservedCustomerNote = order.customer_note === undefined && existingOrder.customer_note 
        ? existingOrder.customer_note 
        : order.customer_note;
      
      // CRITICAL FIX: Preserve restaurant_note if the incoming order doesn't have one
      const preservedRestaurantNote = order.restaurant_note === undefined && existingOrder.restaurant_note
        ? existingOrder.restaurant_note
        : order.restaurant_note;
      
      updatedOrders = [...currentOrders];
      updatedOrders[existingIndex] = {
        ...order,
        customer_note: preservedCustomerNote,
        restaurant_note: preservedRestaurantNote
      };
      
      console.log("Updated existing order:", {
        orderId: order.orderId,
        oldStatus: currentOrders[existingIndex].status,
        newStatus: order.status,
        oldCustomerNote: currentOrders[existingIndex].customer_note || "(empty)",
        newCustomerNote: preservedCustomerNote || "(empty)",
        finalCustomerNote: updatedOrders[existingIndex].customer_note || "(empty)",
      });
    } else {
      // Add new order
      updatedOrders = [...currentOrders, order];
      console.log("Added new order:", {
        orderId: order.orderId,
        status: order.status,
        customerNote: order.customer_note || "(empty)",
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
