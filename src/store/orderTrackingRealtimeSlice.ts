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
    console.log("Successfully saved orders to AsyncStorage:", orders.length);
  } catch (error) {
    console.error("Error saving to AsyncStorage:", error);
  }
}, 1000);

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

      // Filter out completed/cancelled orders and sort by updated_at
      const validOrders = orders
        .filter(
          (order: OrderTracking) =>
            order.status !== Enum_OrderStatus.DELIVERED &&
            order.status !== Enum_OrderStatus.CANCELLED &&
            // Also check if the order is in a valid ongoing state
            [
              Enum_OrderStatus.PENDING,
              Enum_OrderStatus.PREPARING,
              Enum_OrderStatus.READY_FOR_PICKUP,
              Enum_OrderStatus.RESTAURANT_PICKUP,
              Enum_OrderStatus.DISPATCHED,
              Enum_OrderStatus.EN_ROUTE,
            ].includes(order.status)
        )
        .sort(
          (a: OrderTracking, b: OrderTracking) => b.updated_at - a.updated_at
        );

      console.log(
        "Loaded and filtered orders from AsyncStorage:",
        validOrders.length,
        validOrders.map(mapOrderToLog)
      );
      return validOrders;
    } catch (error) {
      console.error("Error loading from AsyncStorage:", error);
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
      console.log("Removing order:", orderId);
      state.orders = state.orders.filter((order) => order.orderId !== orderId);
      debouncedSaveToStorage(state.orders);
      console.log("Orders after removal:", state.orders.length);
    },
    clearOrderTracking: (state) => {
      console.log("Clearing all orders");
      state.orders = [];
      AsyncStorage.removeItem(STORAGE_KEY);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadOrderTrackingFromAsyncStorage.fulfilled, (state, action) => {
        state.orders = action.payload;
      })
      .addCase(updateAndSaveOrderTracking.fulfilled, (state, action) => {
        if (action.payload) {
          state.orders = action.payload;
        }
      });
  },
});

export const { removeOrderTracking, clearOrderTracking } =
  orderTrackingRealtimeSlice.actions;
export default orderTrackingRealtimeSlice.reducer;
