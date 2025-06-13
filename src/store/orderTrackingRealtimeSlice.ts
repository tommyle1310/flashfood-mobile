import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { OrderTrackingBase } from "@/src/types/Orders";
import { Enum_OrderStatus, Enum_OrderTrackingInfo } from "@/src/types/Orders";
import { debounce } from "lodash";
import { OrderTracking as OrderTrackingType } from "@/src/types/screens/Order";

// src/store/orderTrackingRealtimeSlice.ts
export type OrderTracking = OrderTrackingType;

export interface OrderTrackingRealtimeState {
  orders: OrderTracking[];
}

const STORAGE_KEY = "@order_tracking_v1";

const initialState: OrderTrackingRealtimeState = {
  orders: [],
};

// Helper function to map order to log format
const mapOrderToLog = (order: OrderTracking) => ({
  id: order.orderId,
  status: order.status,
  tracking: order.tracking_info,
});

// Debounced function to save to AsyncStorage
const debouncedSaveToStorage = debounce(async (orders: OrderTracking[]) => {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
    console.log("✅ Successfully saved orders to AsyncStorage:", orders.length);
  } catch (error) {
    console.error("❌ Error saving to AsyncStorage:", error);
  }
}, 500); // Reduced debounce time for faster saves

// Immediate save function for critical updates
const saveToStorageImmediate = async (orders: OrderTracking[]) => {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
    console.log("🚀 Immediately saved orders to AsyncStorage:", orders.length);
  } catch (error) {
    console.error("❌ Error immediately saving to AsyncStorage:", error);
  }
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
    const existingIndex = currentOrders.findIndex(
      (o) => o.orderId === order.orderId
    );

    let updatedOrders: OrderTracking[];
    if (existingIndex !== -1) {
      // Update existing order
      updatedOrders = [...currentOrders];
      updatedOrders[existingIndex] = order;
      console.log("Updated existing order:", {
        orderId: order.orderId,
        oldStatus: currentOrders[existingIndex].status,
        newStatus: order.status,
      });
    } else {
      // Add new order
      updatedOrders = [...currentOrders, order];
      console.log("Added new order:", {
        orderId: order.orderId,
        status: order.status,
      });
    }

    // Sort orders by updated_at timestamp (most recent first)
    updatedOrders.sort((a, b) => b.updated_at - a.updated_at);

    // Log final state
    console.log("Updated orders:", {
      count: updatedOrders.length,
      orders: updatedOrders.map(mapOrderToLog),
    });

    // Save to AsyncStorage
    await debouncedSaveToStorage(updatedOrders);

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
          return order && order.orderId && order.status && order.tracking_info;
        })
        .sort(
          (a: OrderTracking, b: OrderTracking) => b.updated_at - a.updated_at
        );

      console.log(
        "📱 Loaded ALL orders from AsyncStorage (including completed/cancelled):",
        allOrders.length,
        allOrders.map(mapOrderToLog)
      );

      // Log breakdown by status
      const statusBreakdown = allOrders.reduce(
        (acc: any, order: OrderTracking) => {
          acc[order.status] = (acc[order.status] || 0) + 1;
          return acc;
        },
        {}
      );
      console.log("📊 Order status breakdown:", statusBreakdown);

      return allOrders;
    } catch (error) {
      console.error("❌ Error loading from AsyncStorage:", error);
      return [];
    }
  }
);

// NEW: Manual save function for immediate persistence
export const saveOrderTrackingToAsyncStorage = createAsyncThunk(
  "orderTrackingRealtime/saveOrderTracking",
  async (_: void, { getState }) => {
    const state = getState() as {
      orderTrackingRealtime: OrderTrackingRealtimeState;
    };
    const orders = state.orderTrackingRealtime.orders;

    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
      console.log("💾 Manually saved orders to AsyncStorage:", orders.length);
      return orders;
    } catch (error) {
      console.error("❌ Error manually saving to AsyncStorage:", error);
      throw error;
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
      state.orders = state.orders.filter((order) => order.orderId !== orderId);
      // CRITICAL FIX: Immediate save for important state changes
      saveToStorageImmediate(state.orders);
      console.log("📊 Orders after removal:", state.orders.length);
    },
    clearOrderTracking: (state) => {
      console.log("🧹 Clearing all orders");
      state.orders = [];
      // CRITICAL FIX: Immediate save for clearing
      saveToStorageImmediate([]);
    },
    // NEW: Direct state update with immediate save
    updateOrderTrackingState: (state, action) => {
      const orders = action.payload;
      console.log("🔄 Direct state update with orders:", orders.length);
      state.orders = orders;
      // CRITICAL FIX: Immediate save for state updates
      saveToStorageImmediate(orders);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadOrderTrackingFromAsyncStorage.fulfilled, (state, action) => {
        console.log(
          "📥 Loading orders from AsyncStorage:",
          action.payload.length
        );
        state.orders = action.payload;
      })
      .addCase(updateAndSaveOrderTracking.fulfilled, (state, action) => {
        if (action.payload) {
          console.log(
            "💾 Updating state with saved orders:",
            action.payload.length
          );
          state.orders = action.payload;
          // CRITICAL FIX: Ensure immediate save after async thunk
          saveToStorageImmediate(action.payload);
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
      })
      .addCase(saveOrderTrackingToAsyncStorage.fulfilled, (state, action) => {
        console.log("✅ Manual save completed successfully");
      })
      .addCase(saveOrderTrackingToAsyncStorage.rejected, (state, action) => {
        console.error("❌ Manual save failed:", action.error);
      });
  },
});

export const {
  removeOrderTracking,
  clearOrderTracking,
  updateOrderTrackingState,
} = orderTrackingRealtimeSlice.actions;
export default orderTrackingRealtimeSlice.reducer;
