import { Avatar } from "../common";

export interface Props_RestaurantDetails {
  address_id: string;
  address: {
    id: string;
    postal_code: number;
    street: string;
    title: string;
    location: { lat: number; lng: number };
  };
  total_orders: number;
  description: string;
  avatar: { url: string; key: string };
  contact_email: { email: string; is_default: boolean; title: string }[];
  contact_phone: { number: string; is_default: boolean; title: string }[];
  owner_id: string;
  promotions: {
    id: string;
    discount_type: "PERCENTAGE" | "FIXED";
    discount_value: number;
    end_date: number;
    start_date: number;
    food_category: string[];
    name: string;
  };
  restaurant_name: string;
  ratings: null | { average_rating: number; review_count: number };
  specialize_in: { id: string; description: string; name: string }[];
}

export interface Props_MenuItem {
  id: string;
  restaurant_id: string;
  avatar: { url: string; key: string };
  name: string;
  category: { id: string; name: string; description: string };
  availability: boolean;
  suggested_notes: string[];
  price: number;
  purchased_count: number;
  variants: {
    id: string;
    menu_id: string;
    variant: string;
    price: number;
    default_restaurant_notes: string[];
    purchase_count: number;
    created_at: number;
    updated_at: number;
  }[];
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
  created_at: number;
  name: string;
  price: number;
  purchase_count: number;
  restaurant_id: string;
  suggest_notes: string[]; // Notes for the menu item (adjust as needed)
  updated_at: number;
  variants: string[]; // List of variant IDs
}

export interface MenuItemProps {
  menuItem: MenuItem;
  variants: MenuItemVariant[];
}
