import { Avatar } from "../common";

export interface Restaurant {
  id: string;
  restaurant_name: string;
  avatar: { url: string; key: string } | null;
  address: {
    street: string;
    location: {
      lat: number;
      lng: number;
    };
  };
  specialize_in?: FoodCategory[];
}

export interface FoodCategory {
  id: string;
  name: string;
}

export interface AvailablePromotionWithRestaurants {
  id: string;
  name: string;
  description: string;
  avatar: Avatar;
  discount_type: "PERCENTAGE" | "FIXED";
  discount_value: number;
  restaurants: Restaurant[];
}

export interface FavoriteRestaurant {
  id: string;
  restaurant_name: string;
  avatar: { url: string; key: string } | null;
  address_id: string;
}
