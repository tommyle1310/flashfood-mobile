// src/utils/orderUtils.ts
import { OrderTracking } from "@/src/types/screens/Order";
import {
  Enum_OrderStatus,
  Enum_OrderTrackingInfo,
  Enum_PaymentMethod,
  Enum_PaymentStatus,
  Order,
  OrderItem,
} from "@/src/types/Orders";
import { IMAGE_LINKS } from "@/src/assets/imageLinks";

export const mapOrderTrackingToOrder = (
  orderTracking: OrderTracking
): Order => {
  const mapStatus = (status: string): Enum_PaymentStatus => {
    switch (status) {
      case "PENDING":
        return Enum_PaymentStatus.PENDING;
      case "DELIVERED":
        return Enum_PaymentStatus.PAID;
      case "CANCELLED":
        return Enum_PaymentStatus.CANCELLED;
      case "DELIVERY_FAILED":
        return Enum_PaymentStatus.FAILED;
      default:
        return Enum_PaymentStatus.PENDING;
    }
  };

  const mapPaymentMethod = (method: string): Enum_PaymentMethod => {
    switch (method.toUpperCase()) {
      case "COD":
        return Enum_PaymentMethod.COD;
      case "FWALLET":
        return Enum_PaymentMethod.FWallet;
      default:
        return Enum_PaymentMethod.COD;
    }
  };

  const mapOrderItems = (items: OrderTracking["order_items"]): OrderItem[] => {
    console.log("check itesm here", items);
    return items.map((item) => ({
      item_id: item.item_id,
      name: item.name,
      menu_item: item.item,
      quantity: item.quantity,
      price_at_time_of_order: item.menu_item.price,
      variant_id: item.variant_id,
      item: {
        id: item.menu_item.id || "",
        name: item.menu_item?.name || "",
        avatar: item.menu_item?.avatar || { url: "", key: "" },
      },
    }));
  };

  return {
    customer_id: orderTracking.customer_id,
    restaurant_id: orderTracking.restaurant_id,
    customer_location: orderTracking.customer_location,
    restaurant_location: orderTracking.restaurant_location,
    status: mapStatus(orderTracking?.status),
    payment_method: mapPaymentMethod(orderTracking.payment_method),
    total_amount: parseFloat(orderTracking.total_amount) || 0,
    order_items: mapOrderItems(orderTracking.order_items),
    tracking_info: orderTracking.tracking_info,
    customer_note: orderTracking.customer_note,
    restaurant_note: orderTracking.restaurant_note,
    order_time: parseInt(orderTracking.order_time) || 0,
  };
};

export const getTrackingImage = (
  status?: Enum_OrderStatus,
  tracking_info?: Enum_OrderTrackingInfo
): string => {
  switch (status) {
    case Enum_OrderStatus.PREPARING:
      return IMAGE_LINKS.RESTAURANT_PREPARING;
    case Enum_OrderStatus.DISPATCHED:
      return IMAGE_LINKS.DRIVER_DISPATCH;
    case Enum_OrderStatus.EN_ROUTE:
      return IMAGE_LINKS.EN_ROUTE;
    case Enum_OrderStatus.READY_FOR_PICKUP:
      return IMAGE_LINKS.FOOD_PACKED;
    case Enum_OrderStatus.PENDING:
      if (tracking_info === Enum_OrderTrackingInfo.ORDER_PLACED) {
        return IMAGE_LINKS.ORDER_PLACED;
      }
      break;
    case Enum_OrderStatus.RESTAURANT_PICKUP:
      return IMAGE_LINKS.RESTAURANT_PICKUP;
    default:
      return IMAGE_LINKS.DEFAULT_AVATAR_FOOD;
  }
  return IMAGE_LINKS.DEFAULT_AVATAR_FOOD;
};

export const getTrackingText = (
  status?: Enum_OrderStatus,
  tracking_info?: Enum_OrderTrackingInfo
): string => {
  switch (status) {
    case Enum_OrderStatus.PENDING:
      if (tracking_info === Enum_OrderTrackingInfo.ORDER_PLACED) {
        return "Order placed successfully! Waiting for restaurant confirmation... ⌛";
      }
      return "Processing your order... ⌛";
    case Enum_OrderStatus.PREPARING:
      return "Chefs are cooking your meal! 🍳";
    case Enum_OrderStatus.READY_FOR_PICKUP:
      return "Your order is ready for pickup! 📦";
    case Enum_OrderStatus.DISPATCHED:
      return "Driver is heading to the restaurant! 🚚";
    case Enum_OrderStatus.RESTAURANT_PICKUP:
      return "Driver is picking up your order! 🛒";
    case Enum_OrderStatus.EN_ROUTE:
      return "On the way to you! 🚀";
    case Enum_OrderStatus.DELIVERED:
      return "Enjoy your meal! 🎉";
    default:
      return "Something’s cooking... stay tuned! ❓";
  }
};
