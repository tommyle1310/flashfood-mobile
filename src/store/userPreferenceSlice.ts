import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { RootState } from "./store";
import { IMAGE_LINKS } from "../assets/imageLinks";

// Define the types of state we will use in this slice
export interface Variant {
  variant_id: string;
  variant_name: string;
  quantity: number;
  item: { id: string; avatar: { url: string; key: string }; name: string };
  id: string;
  variant_price_at_time_of_addition: number;
}

export interface CartItem {
  id: string;
  customer_id: string;
  variants: Variant[];
  created_at: number;
  updated_at: number;
  __v: number;
  restaurant: {
    id: string;
    restaurant_name: string;
    avatar: { url: string; key: string };
    address_id: string;
  },
  item: {
    avatar: { url: string; key: string };
    id: string;
    item_id: string;
    restaurant_id: string;
    restaurantDetails: {
      id: string;
      restaurant_name: string;
      avatar: { url: string; key: string };
      address_id: string;
    };
   
    name: string;
    description: string;
    category: string[];
    availability: boolean;
    suggest_notes: string[];
    created_at: number;
    updated_at: number;
    purchase_count: number;
    discount: {
      discount_type: "FIXED" | "PERCENTAGE";
      discount_value: number;
      start_date: number;
      end_date: number;
    } | null;
  };
}

interface UserPreferenceState {
  favorite_restaurants: string[];
  cart_items: CartItem[];
}

const initialState: UserPreferenceState = {
  favorite_restaurants: [],
  cart_items: [],
};

// Async thunks (giữ nguyên)
export const saveFavoriteRestaurantsToAsyncStorage = createAsyncThunk(
  "userPreference/saveFavoriteRestaurants",
  async (favorite_restaurants: string[]) => {
    await AsyncStorage.setItem(
      "favorite_restaurants",
      JSON.stringify(favorite_restaurants)
    );
    return favorite_restaurants;
  }
);

export const loadFavoriteRestaurantsFromAsyncStorage = createAsyncThunk(
  "userPreference/loadFavoriteRestaurants",
  async () => {
    const favorite_restaurants = await AsyncStorage.getItem(
      "favorite_restaurants"
    );
    return favorite_restaurants ? JSON.parse(favorite_restaurants) : [];
  }
);

export const saveCartItemsToAsyncStorage = createAsyncThunk(
  "userPreference/saveCartItems",
  async (cart_items: CartItem[]) => {
    await AsyncStorage.setItem("cart_items", JSON.stringify(cart_items));
    return cart_items;
  }
);
export const removeCartItemFromAsyncStorage = createAsyncThunk(
  "userPreference/removeCartItems",
  async (itemsToRemove: { id: string }[], thunkAPI) => {
    const state = thunkAPI.getState() as RootState;
    const updatedCartItems = state.userPreference.cart_items.filter(
      (item) => !itemsToRemove.some((removeItem) => removeItem.id === item.id)
    );
    await AsyncStorage.setItem("cart_items", JSON.stringify(updatedCartItems));
    return itemsToRemove;
  }
);

export const loadCartItemsFromAsyncStorage = createAsyncThunk(
  "userPreference/loadCartItems",
  async () => {
    const cart_items = await AsyncStorage.getItem("cart_items");
    return cart_items ? JSON.parse(cart_items) : [];
  }
);

// Create the slice
const userPreferenceSlice = createSlice({
  name: "userPreference",
  initialState,
  reducers: {
    toggleFavoriteRestaurant: (state, action) => {
      const restaurantId = action.payload;
      const index = state.favorite_restaurants.indexOf(restaurantId);

      if (index === -1) {
        state.favorite_restaurants.push(restaurantId);
      } else {
        state.favorite_restaurants = state.favorite_restaurants.filter(
          (id) => id !== restaurantId
        );
      }
    },

    addItemToCart: (state, action) => {
      const newItem = action.payload;
      const existingItem = state.cart_items.find(
        (item) => item.id === newItem.id
      );
    
      if (existingItem) {
        console.log("Updating existing cart item:", newItem, existingItem);
        newItem.variants.forEach((newVariant: Variant) => {
          const existingVariant = existingItem.variants.find(
            (variant) => variant.variant_id === newVariant.variant_id
          );
    
          if (existingVariant) {
            existingVariant.quantity += newVariant.quantity;
            existingVariant.variant_price_at_time_of_addition =
              newVariant.variant_price_at_time_of_addition;
          } else {
            existingItem.variants.push({
              ...newVariant,
              variant_price_at_time_of_addition:
                newVariant.variant_price_at_time_of_addition || 0,
            });
          }
        });
      } else {
        state.cart_items.push({
          ...newItem,
          item: {
            ...newItem.item,
            avatar: {
              url: newItem.item.avatar?.url || IMAGE_LINKS.DEFAULT_AVATAR_FOOD,
              key: newItem.item.avatar?.key || "",
            },
            restaurantDetails: {
              ...newItem.item.restaurantDetails,
              avatar: {
                url:
                  newItem.item.restaurantDetails.avatar?.url ||
                  IMAGE_LINKS.DEFAULT_AVATAR_FOOD,
                key: newItem.item.restaurantDetails.avatar?.key || "",
              },
            },
          },
          variants: newItem.variants.map((variant: any) => ({
            ...variant,
            variant_price_at_time_of_addition:
              variant.variant_price_at_time_of_addition || 0,
          })),
        });
      }
    },

    removeItemFromCart: (state, action) => {
      const itemId = action.payload;
      state.cart_items = state.cart_items.filter((item) => item.id !== itemId);
    },

    updateItemQuantity: (state, action) => {
      const { itemId, variantId, quantity } = action.payload;
      const item = state.cart_items.find((item) => item.id === itemId);
      if (item) {
        const variant = item.variants.find(
          (variant) => variant.variant_id === variantId
        );
        if (variant) {
          variant.quantity = quantity;
        }
      }
    },

    // Thêm action mới: subtractItemFromCart

    subtractItemFromCart: (state, action) => {
      const orderItems = action.payload;
      console.log("check orderitem", orderItems);
      console.log("check current cart_items", state.cart_items); // Thêm log để xem state.cart_items

      orderItems.forEach(
        (orderItem: {
          item_id: string;
          variant_id: string;
          quantity: number;
        }) => {
          const cartItemIndex = state.cart_items.findIndex(
            (item) => item.item.id === orderItem.item_id
          );
          console.log("check cartitemindex", cartItemIndex);

          if (cartItemIndex !== -1) {
            const cartItem = state.cart_items[cartItemIndex];
            const variantIndex = cartItem.variants.findIndex(
              (variant) => variant.variant_id === orderItem.variant_id
            );
            console.log("check variantindex", variantIndex);

            if (variantIndex !== -1) {
              const variant = cartItem.variants[variantIndex];
              const newQuantity = variant.quantity - orderItem.quantity;

              if (newQuantity <= 0) {
                cartItem.variants.splice(variantIndex, 1);
                console.log(
                  `Removed variant ${orderItem.variant_id} from cart item ${cartItem.id}`
                );

                if (cartItem.variants.length === 0) {
                  state.cart_items.splice(cartItemIndex, 1);
                  console.log(
                    `Removed cart item ${cartItem.id} as no variants remain`
                  );
                }
              } else {
                variant.quantity = newQuantity;
                console.log(
                  `Updated quantity of variant ${orderItem.variant_id} in cart item ${cartItem.id} to ${newQuantity}`
                );
              }
            }
          } else {
            console.log(
              `Cart item with item_id ${orderItem.item_id} not found in state.cart_items`
            );
          }
        }
      );
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(
        loadFavoriteRestaurantsFromAsyncStorage.fulfilled,
        (state, action) => {
          state.favorite_restaurants = action.payload;
        }
      )
      .addCase(loadCartItemsFromAsyncStorage.fulfilled, (state, action) => {
        state.cart_items = action.payload;
      })
      .addCase(saveCartItemsToAsyncStorage.fulfilled, (state, action) => {});
  },
});

export const {
  toggleFavoriteRestaurant,
  addItemToCart,
  removeItemFromCart,
  updateItemQuantity,
  subtractItemFromCart, // Export action mới
} = userPreferenceSlice.actions;

export default userPreferenceSlice.reducer;
