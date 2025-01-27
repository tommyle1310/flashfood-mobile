export interface Props_RestaurantDetails {
  address: {
    _id: string;
    postal_code: number;
    street: string;
    title: string;
    location: { lat: number; lon: number };
  };
  description: string;
  avatar: { url: string; key: string };
  contact_email: { email: string; is_default: boolean; title: string }[];
  contact_phone: { number: string; is_default: boolean; title: string }[];
  owner_id: string;
  promotions: {
    _id: string;
    discount_type: "PERCENTAGE" | "FIXED";
    discount_value: number;
    end_date: number;
    start_date: number;
    food_category: string[];
    name: string;
  };
  restaurant_name: string;
  specialize_in: { _id: string; description: string; name: string }[];
}

export interface Props_MenuItem {
  _id: string;
  restaurant_id: string;
  avatar: { url: string; key: string };
  name: string;
  category: { _id: string; name: string; description: string };
  availability: boolean;
  suggested_notes: string[];
  price: number;
  purchased_count: number;
  variants: {
    _id: string;
    menu_id: string;
    variant: string;
    price: number;
    default_restaurant_notes: string[];
    purchase_count: number;
    created_at: number;
    updated_at: number;
  }[];
}
