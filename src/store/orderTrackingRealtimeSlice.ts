import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Định nghĩa interface cho dữ liệu đơn hàng thời gian thực
export interface OrderTracking {
  orderId: string;
  status: string;
  tracking_info: string;
  updated_at: number;
  customer_id: string;
  driver_id: string;
  restaurant_id: string;
}

interface OrderTrackingRealtimeState {
  orders: OrderTracking[];
}

const initialState: OrderTrackingRealtimeState = {
  orders: [],
};

// Async thunk để lưu orders vào AsyncStorage
export const saveOrderTrackingToAsyncStorage = createAsyncThunk(
  "orderTrackingRealtime/saveOrderTracking",
  async (orders: OrderTracking[]) => {
    try {
      await AsyncStorage.setItem("orderTracking", JSON.stringify(orders));
      console.log("Saved order tracking to AsyncStorage:", orders);
      return orders;
    } catch (error) {
      console.error("Error saving order tracking to AsyncStorage:", error);
      throw error;
    }
  }
);

// Async thunk để tải orders từ AsyncStorage
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

// Async thunk để xóa dữ liệu trong AsyncStorage
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

// Tạo slice
const orderTrackingRealtimeSlice = createSlice({
  name: "orderTrackingRealtime",
  initialState,
  reducers: {
    // Action để cập nhật trạng thái đơn hàng khi nhận sự kiện từ WebSocket
    updateOrderTracking: (state, action) => {
      console.log("updateOrderTracking", action.payload);
      const newOrder: OrderTracking = action.payload;
      const existingOrderIndex = state.orders.findIndex(
        (order) => order.orderId === newOrder.orderId
      );

      if (existingOrderIndex !== -1) {
        // Nếu đơn hàng đã tồn tại, kiểm tra updated_at trước khi cập nhật
        const existingOrder = state.orders[existingOrderIndex];
        if (newOrder.updated_at > existingOrder.updated_at) {
          state.orders[existingOrderIndex] = newOrder;
          console.log(
            `Updated order ${newOrder.orderId} with new tracking info`
          );
        } else {
          console.log(
            `Skipped updating order ${newOrder.orderId} as the update is older`
          );
        }
      } else {
        // Nếu đơn hàng chưa tồn tại, thêm mới vào danh sách
        state.orders.push(newOrder);
        console.log(`Added new order ${newOrder.orderId} to tracking`);
      }
    },

    // Action để xóa đơn hàng khỏi danh sách theo dõi
    removeOrderTracking: (state, action) => {
      const orderId = action.payload;
      state.orders = state.orders.filter((order) => order.orderId !== orderId);
      console.log(`Removed order ${orderId} from tracking`);
    },

    // Action để xóa toàn bộ danh sách theo dõi (dùng khi logout hoặc reset)
    clearOrderTracking: (state) => {
      state.orders = [];
      console.log("Cleared all order tracking data");
    },
  },
  extraReducers: (builder) => {
    // Tải dữ liệu từ AsyncStorage khi ứng dụng khởi động
    builder.addCase(
      loadOrderTrackingFromAsyncStorage.fulfilled,
      (state, action) => {
        state.orders = action.payload;
      }
    );
  },
});

// Export actions
export const { updateOrderTracking, removeOrderTracking, clearOrderTracking } =
  orderTrackingRealtimeSlice.actions;

// Export reducer
export default orderTrackingRealtimeSlice.reducer;
