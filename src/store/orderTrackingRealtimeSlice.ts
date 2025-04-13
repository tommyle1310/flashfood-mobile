import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { OrderTracking as OrderTrackingScreen } from "@/src/types/screens/Order";
import { Enum_OrderStatus, Enum_OrderTrackingInfo } from "@/src/types/Orders";

// src/store/orderTrackingRealtimeSlice.ts
export interface OrderTracking {
  orderId: string;
  status: Enum_OrderStatus;
  tracking_info: Enum_OrderTrackingInfo;
  updated_at: number;
  customer_id: string;
  driver_id: string;
  restaurant_id: string;
  restaurant_avatar: { key: string; url: string } | null;
  driver_avatar: { key: string; url: string } | null;
  restaurantAddress: {
    id: string;
    street: string;
    city: string;
    nationality: string;
    is_default: boolean;
    created_at: number;
    updated_at: number;
    postal_code: number;
    location: { lat: number; lon: number };
    title: string;
  } | null;
  customerAddress: {
    id: string;
    street: string;
    city: string;
    nationality: string;
    is_default: boolean;
    created_at: number;
    updated_at: number;
    postal_code: number;
    location: { lat: number; lon: number };
    title: string;
  } | null;
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
  distance?: string; // Optional, as it’s not always present in WebSocket payload
}

interface OrderTrackingRealtimeState {
  orders: OrderTracking[];
}

const initialState: OrderTrackingRealtimeState = {
  orders: [],
};

// Thunk để cập nhật và lưu orders cùng lúc
export const updateAndSaveOrderTracking = createAsyncThunk(
  "orderTrackingRealtime/updateAndSaveOrderTracking",
  async (newOrder: OrderTracking, { dispatch, getState }) => {
    const state = getState() as {
      orderTrackingRealtime: OrderTrackingRealtimeState;
    };
    const existingOrderIndex = state.orderTrackingRealtime.orders.findIndex(
      (order) => order.orderId === newOrder.orderId
    );

    let updatedOrders: OrderTracking[];
    if (existingOrderIndex !== -1) {
      const existingOrder =
        state.orderTrackingRealtime.orders[existingOrderIndex];
      if (newOrder.updated_at > existingOrder.updated_at) {
        updatedOrders = [...state.orderTrackingRealtime.orders];
        updatedOrders[existingOrderIndex] = newOrder;
        console.log(`Updated order ${newOrder.orderId} with new tracking info`);
      } else {
        console.log(
          `Skipped updating order ${newOrder.orderId} as the update is older`
        );
        return state.orderTrackingRealtime.orders; // Không thay đổi
      }
    } else {
      updatedOrders = [...state.orderTrackingRealtime.orders, newOrder];
      console.log(`Added new order ${newOrder.orderId} to tracking`);
    }

    // Lưu vào AsyncStorage
    await dispatch(saveOrderTrackingToAsyncStorage(updatedOrders)).unwrap();
    return updatedOrders;
  }
);

// Thunk để lưu orders vào AsyncStorage
export const saveOrderTrackingToAsyncStorage = createAsyncThunk(
  "orderTrackingRealtime/saveOrderTracking",
  async (orders: OrderTracking[], { rejectWithValue }) => {
    try {
      const serializedOrders = JSON.stringify(orders);
      await AsyncStorage.setItem("orderTracking", serializedOrders);
      console.log("Saved order tracking to AsyncStorage:", orders);
      const savedData = await AsyncStorage.getItem("orderTracking");
      console.log(
        "Data in AsyncStorage after save:",
        JSON.parse(savedData ?? "[]")
      );
      return orders;
    } catch (error) {
      console.error("Error saving order tracking to AsyncStorage:", error);
      return rejectWithValue(error);
    }
  }
);

// Thunk để load orders từ AsyncStorage
export const loadOrderTrackingFromAsyncStorage = createAsyncThunk(
  "orderTrackingRealtime/loadOrderTracking",
  async () => {
    try {
      const orderTracking = await AsyncStorage.getItem("orderTracking");
      const parsedOrders = orderTracking ? JSON.parse(orderTracking) : [];
      console.log("Loaded order tracking from AsyncStorage:", parsedOrders);
      return parsedOrders;
    } catch (error) {
      console.error("Error loading order tracking from AsyncStorage:", error);
      return [];
    }
  }
);

// Thunk để xóa orders từ AsyncStorage
export const clearOrderTrackingFromAsyncStorage = createAsyncThunk(
  "orderTrackingRealtime/clearOrderTracking",
  async () => {
    try {
      await AsyncStorage.removeItem("orderTracking");
      console.log("Cleared order tracking from AsyncStorage");
      return true;
    } catch (error) {
      console.error("Error clearing order tracking from AsyncStorage:", error);
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
      state.orders = state.orders.filter((order) => order.orderId !== orderId);
      console.log(`Removed order ${orderId} from tracking`);
    },
    clearOrderTracking: (state) => {
      state.orders = [];
      console.log("Cleared all order tracking data");
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadOrderTrackingFromAsyncStorage.fulfilled, (state, action) => {
        state.orders = action.payload;
      })
      .addCase(updateAndSaveOrderTracking.fulfilled, (state, action) => {
        state.orders = action.payload;
      });
  },
});

export const { removeOrderTracking, clearOrderTracking } =
  orderTrackingRealtimeSlice.actions;
export default orderTrackingRealtimeSlice.reducer;