// Define the enum for Payment Methods
export enum Enum_PaymentMethod {
  COD = "COD",
  FWallet = "FWALLET",
}

// Define the enum for Payment Status
export enum Enum_PaymentStatus {
  PENDING = "PENDING",
  PAID = "PAID",
  FAILED = "FAILED",
  CANCELLED = "CANCELLED",
}

export enum Enum_OrderTrackingInfo {
  ORDER_PLACED = "ORDER_PLACED",
  ORDER_RECEIVED = "ORDER_RECEIVED",
  PREPARING = "PREPARING",
  RESTAURANT_PICKUP = "RESTAURANT_PICKUP",
  DISPATCHED = "DISPATCHED",
  EN_ROUTE = "EN_ROUTE",
  DELIVERY_FAILED = "DELIVERY_FAILED",
  DELIVERED = "DELIVERED",
  CANCELLED = "CANCELLED",
  RETURNED = "RETURNED",
}

export enum Enum_OrderStatus {
  PENDING = "PENDING",
  PREPARING = "PREPARING",
  READY_FOR_PICKUP = "READY_FOR_PICKUP",
  RESTAURANT_PICKUP = "RESTAURANT_PICKUP",
  DISPATCHED = "DISPATCHED",
  EN_ROUTE = "EN_ROUTE",
  DELIVERED = "DELIVERED",
  CANCELLED = "CANCELLED",
  RETURNED = "RETURNED",
  DELIVERY_FAILED = "DELIVERY_FAILED",
}

// Define the item structure in the order
export type OrderItem = {
  item_id: string | null;
  name: string | null;
  quantity: number | null;
  menu_item: any;
  price_at_time_of_order: number | null;
  variant_id: string | null;
  item: {
    id: string;
    name: string;
    avatar: { url: string; key: string };
  };
};

// Define the main order type
export type Order = {
  customer_id: string | null;
  restaurant_id: string;
  customer_location: string | undefined; // Assuming it's a string  ID from an address
  restaurant_location: string; // Assuming it's the restaurant's address
  status: Enum_PaymentStatus;
  payment_method: Enum_PaymentMethod;
  total_amount: number;
  order_items: OrderItem[];
  tracking_info: Enum_OrderTrackingInfo;
  customer_note: string;
  restaurant_note: string;
  order_time: number; // Unix timestamp
};
