export type FoodCategory = { id: string; name: string; description: string };
export type Promotion = {
  id: string;
  name: string;
  start_date: number;
  end_date: number;
  status: string;
};
export type Restaurant = {
  id: string;
  restaurant_name: string;
  address: {
    id: string;
    street: string;
    city: string;
    nationality: string;
    title: string;
  };
  specialize_in: FoodCategory[];
  avatar: { url: string; key: string; promotions: string[] };
  promotions: Promotion[];
};
