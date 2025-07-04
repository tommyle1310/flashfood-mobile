import { Avatar } from "../common";

type WeekDay = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun';
type OpeningHours = {
  [key in WeekDay]: { from: number; to: number };
};

export interface Props_RestaurantDetails {
  address_id: string;
  address: {
    id: string;
    postal_code: number;
    street: string;
    city?: string;
    nationality?: string;
    state?: string;
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
    food_category_ids: string[];
    name: string;
    description: string;
    promotion_cost_price: string;
    minimum_order_value: string;
    avatar: Avatar | null;
    status: string;
    bogo_details: any | null;
    created_at: string;
    updated_at: string;
  }[];
  restaurant_name: string;
  ratings: null | { average_rating: number; review_count: number };
  specialize_in: { id: string; description: string; name: string; avatar?: Avatar }[];
  status: {
    is_open: boolean;
    is_active: boolean;
    is_accepted_orders: boolean;
  };
  opening_hours: OpeningHours;
  rating_stats: {
    avg_rating: number;
    avg_food_rating: number;
    avg_delivery_rating: number;
    total_reviews: number;
    reviews: {
      id: string;
      reviewer_type: string;
      reviewer: {
        id: string;
        name: string;
        avatar: Avatar | null;
      };
      food_rating: number;
      delivery_rating: number;
      food_review: string;
      delivery_review: string;
      images: Array<{
        key: string;
        url: string;
      }>;
      created_at: number;
      order_id: string;
    }[];
  };
}

export interface Props_MenuItem {
  id: string;
  restaurant_id: string;
  avatar: { url: string; key: string };
  name: string;
  category: { id: string; name: string; description: string } | { id: string; name: string; description: string }[];
  categoryDetails?: { id: string; name: string; description: string } | { id: string; name: string; description: string }[];
  availability: boolean;
  suggested_notes: string[];
  price: number;
  price_after_applied_promotion: number;
  purchased_count: number;
  variants: {
    id: string;
    menu_id: string;
    variant: string;
    price: number;
    price_after_applied_promotion: number;
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
  default_restaurant_notes: string[];
  menu_id: string;
  price: number;
  price_after_applied_promotion: number;
  updated_at: number;
  variant: string;
}

export interface MenuItem {
  __v: number;
  id: string;
  availability: boolean;
  avatar: Avatar;
  category: string[];
  created_at: number;
  name: string;
  price: number;
  purchase_count: number;
  restaurant_id: string;
  suggest_notes: string[];
  updated_at: number;
  variants: string[];
}

export interface MenuItemProps {
  menuItem: MenuItem;
  variants: MenuItemVariant[];
}
