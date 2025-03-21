export interface Promotion {
  avatar: {
    key: string;
    url: string;
  };
  bogo_details: null;
  created_at: Date;
  description: string;
  discount_type: "PERCENTAGE" | "FIXED" | "BOGO";
  discount_value: number;
  end_date: number;
  id: string;
  minimum_order_value: number;
  name: string;
  promotion_cost_price: number;
  start_date: number;
  status: "ACTIVE";
  updated_at: Date;
}
