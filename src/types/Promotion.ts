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
  voucher_type: string;
  discount_value: string;
  maximum_discount_amount: string | null;
  minimum_order_value: string | null;
  avatar: string | null;
  status: string;
  scope: string;
  current_usage: number;
  maximum_usage: number;
  usage_limit_per_customer: number;
  applicable_days: number[] | null;
  applicable_time_ranges: { end_time: string; start_time: string }[] | null;
  applicable_food_category_ids: any[];
  applicable_restaurant_ids: any[];
  excluded_food_category_ids: any[];
  excluded_restaurant_ids: any[];
  specific_customer_ids: any[];
  minimum_orders_required: number | null;
  minimum_total_spent: number | null;
  created_at: string;
  updated_at: string;
}

// Updated DropdownOption interface from FFDropdown.tsx
export interface DropdownOption {
  value: string;
  label: string;
  imageUrl?: string;
  description?: string;
  voucherCode?: string;
  startDateFormatted?: string;
  endDateFormatted?: string;
  discountDetails?: string;
  minimumOrderValueFormatted?: string;
  applicableDaysFormatted?: string;
  applicableTimeRangesFormatted?: string;
  usageInfo?: string;
  scope?: string;
  additionalConditions?: string;
}

