import { Avatar } from "../common";

export interface FoodCategory {
  id: string;
  name: string;
  description?: string;
  avatar?: Avatar;
  created_at?: string;
  updated_at?: string;
}

export interface Restaurant {
  id: string;
  owner_id?: string;
  owner_name?: string;
  address_id?: string;
  last_login?: string | null;
  restaurant_name: string;
  description?: string | null;
  contact_email?: {
    email: string;
    title: string;
    is_default: boolean;
  }[];
  contact_phone?: {
    title: string;
    number: string;
    is_default: boolean;
  }[];
  avatar: Avatar | null;
  images_gallery?: any[] | null;
  status?: {
    is_open: boolean;
    is_active: boolean;
    is_accepted_orders: boolean;
  };
  ratings?: any | null;
  opening_hours?: {
    [key: string]: {
      from: number;
      to: number;
    };
  };
  created_at?: number;
  updated_at?: number;
  address?: {
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
      lng: number;
    };
    title: string;
  };
  specialize_in: FoodCategory[];
  is_banned?: boolean;
  // New fields from API response
  distance?: number;
  estimated_time?: number;
  avg_rating?: number;
  priorityScore?: number;
}

export interface FavoriteRestaurant {
  id: string;
  restaurant_id: string;
  customer_id: string;
  created_at: number;
  updated_at: number;
}

export interface AvailablePromotionWithRestaurants {
  id: string;
  title: string;
  description: string;
  code: string;
  discount_type: string;
  discount_value: number;
  min_order_value: number;
  max_discount_amount: number;
  usage_limit: number;
  usage_count: number;
  start_date: string;
  end_date: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  restaurants: Restaurant[];
}
