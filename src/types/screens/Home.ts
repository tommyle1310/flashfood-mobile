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
export type AvailablePromotionWithRestaurants = {
  id: string;
  name: string;
  description: string;
  start_date: string; // Giả sử đây là timestamp dạng chuỗi, nếu muốn dùng number thì đổi thành number
  end_date: string; // Tương tự như trên
  discount_type: "PERCENTAGE" | "FIXED"; // Giả sử có thể có các loại khác, thêm nếu cần
  discount_value: string; // Chuỗi vì có số thập phân "20.00"
  promotion_cost_price: string; // Chuỗi vì có số thập phân "100.00"
  minimum_order_value: string; // Chuỗi vì có số thập phân "500.00"
  avatar: {
    key: string;
    url: string;
  } | null; // Có thể null nếu không có avatar
  status: "ACTIVE" | "INACTIVE"; // Giả sử có các trạng thái khác, thêm nếu cần
  bogo_details: null | {
    // Có thể mở rộng nếu có chi tiết BOGO trong tương lai
    [key: string]: any;
  };
  created_at: string; // Định dạng ISO 8601
  updated_at: string; // Định dạng ISO 8601
  restaurants: Array<{
    id: string;
    restaurant_name: string;
    avatar: {
      key: string;
      url: string;
    } | null; // Có thể null như trong dữ liệu
    ratings: null | number; // Giả sử ratings có thể là số, thay đổi nếu cần
  }>;
};
