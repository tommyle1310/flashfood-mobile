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

export interface Voucher {
  id: string;
  code: string;
  name: string;
  description: string;
  start_date: string;
  end_date: string;
  voucher_type: "PERCENTAGE" | "FIXED" | "FREESHIP";
  discount_value: string;
  maximum_discount_amount: string | null;
  minimum_order_value: string;
  avatar: any | null;
  status: "ACTIVE" | "INACTIVE";
  scope: "NEW_CUSTOMERS" | "ALL_CUSTOMERS";
  current_usage: number;
  maximum_usage: number;
  usage_limit_per_customer: number;
  applicable_days: number[] | null;
  applicable_time_ranges: Array<{
    start_time: string;
    end_time: string;
  }> | null;
  applicable_food_category_ids: string[];
  applicable_restaurant_ids: string[];
  excluded_food_category_ids: string[];
  excluded_restaurant_ids: string[];
  specific_customer_ids: string[];
  minimum_orders_required: number | null;
  minimum_total_spent: string | null;
  created_at: string;
  updated_at: string;
}
