import { Avatar } from "../common";
import {
  Enum_OrderStatus,
  Enum_OrderTrackingInfo,
  OrderItem,
  OrderTrackingBase,
} from "../Orders";

export interface OrderTracking extends OrderTrackingBase {
  customer: {
    avatar: Avatar | null;
    favorite_items: any | null; // you can adjust the type based on the structure of favorite_items
    first_name: string;
    id: string;
    last_name: string;
  };
  restaurantFullAddress?: string;
  customerFullAddress?: string;
  customerAddress: {
    id: string;
    street: string;
    city: string;
    nationality: string;
    is_default: boolean;
    created_at: number;
    updated_at: number;
    postal_code: number;
    location: {
      lat: number;
      lon: number;
    };
    title: string;
  };
  restaurantAddress: {
    id: string;
    street: string;
    city: string;
    nationality: string;
    is_default: boolean;
    created_at: number;
    updated_at: number;
    postal_code: number;
    location: {
      lat: number;
      lon: number;
    };
    title: string;
  };
  cancellation_title?: string;
  cancellation_reason?: string;
  cancellation_description?: string;
  customer_id: string;
  customer_location: string;
  customer_note: string;
  distance: string;
  delivery_time: string; // You may want to convert this to Date in your application if necessary
  driver: {
    id: string;
    avatar: Avatar | null;
  } | null;
  driver_id: string | null;
  id: string;
  orderId?: string;
  order_items: OrderItem[]; // You can adjust the type based on the actual structure of order_items
  order_time: string; // You may want to convert this to Date in your application if necessary
  payment_method: string;
  payment_status: "PENDING" | "COMPLETED" | "FAILED"; // Adjust if there are more statuses
  restaurant: {
    id: string;
    specialize_in?: string[];
    restaurant_name?: string;
    avatar: Avatar | null;
  };
  restaurant_id: string;
  restaurant_location: string;
  restaurant_note: string;
  status: Enum_OrderStatus; // Adjust based on actual statuses
  total_amount: string; // You may want to convert this to number or decimal
  tracking_info: Enum_OrderTrackingInfo;
}

export interface Driver {
  active_points: number;
  available_for_work: boolean;
  avatar: { url: string; key: string } | null; // Adjust based on the actual structure
  contact_email: string[];
  contact_phone: string[];
  created_at: number;
  current_location: any; // You can adjust this type based on the structure of current_location
  first_name: string;
  id: string;
  is_on_delivery: boolean;
  last_login: number | null;
  last_name: string;
  rating: { review_count: number; average_rating: number }; // Adjust based on the structure of rating
  updated_at: number;
  user_id: string;
  vehicle: {
    license_plate: string;
    color: string;
    model: string;
  }; // Adjust based on the structure of vehicle
}

export interface Restaurant {
  address_id: string;
  avatar: Avatar | null; // Adjust based on actual structure
  contact_email: string[];
  contact_phone: string[];
  created_at: number;
  specialize_in: string[];
  description: string | null;
  id: string;
  images_gallery: any | null; // Adjust based on actual structure
  opening_hours: any; // Adjust based on the structure of opening_hours
  owner_id: string;
  owner_name: string;
  promotions: any | null; // Adjust based on structure of promotions
  ratings: any | null; // Adjust based on structure of ratings
  restaurant_name: string;
  status: any; // Adjust based on the structure of status
  updated_at: number;
}

export interface MenuItemVariant {
  __v: number;
  id: string;
  availability: boolean;
  created_at: number;
  default_restaurant_notes: string[]; // You can adjust this type if you need specific structure for notes
  menu_id: string;
  price: number;
  updated_at: number;
  variant: string;
}

export interface MenuItem {
  __v: number;
  id: string;
  availability: boolean;
  avatar: Avatar;
  category: string[]; // Category IDs for this menu item
  restaurant?: {
    id: string;
    restaurant_name: string;
    address_id: string;
    avatar: Avatar;
  };
  created_at: number;
  name: string;
  price: number;
  purchase_count: number;
  restaurant_id: string;
  suggest_notes: string[]; // Notes for the menu item (adjust as needed)
  updated_at: number;
  variants: {
    id: string;
    menu_id: string;
    variant: string;
    price: number;
    default_restaurant_notes: string[];
    purchase_count: number;
  }[]; // List of variant IDs
}

export interface OderItem {
  id: string;
  item_id: string;
  quantity: number;
  name: string;
  variant_id: string;
  price_at_time_of_order: number;
  menu_item: MenuItem;
}
