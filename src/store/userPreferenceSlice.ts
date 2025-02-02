import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Define the types of state we will use in this slice
export interface Variant {
  variant_id: string;
  variant_name: string;
  quantity: number;
  item: { _id: string; avatar: { url: string; key: string }; name: string };
  _id: string;
  variant_price_at_time_of_addition: number; // Price for each variant
}

export interface CartItem {
  _id: string;
  customer_id: string;
  variants: Variant[];
  created_at: number;
  updated_at: number;
  __v: number;
  item: {
    avatar: { url: string; key: string };
    _id: string;
    item_id: string;
    restaurant_id: string;
    restaurantDetails: {
      _id: string;
      restaurant_name: string;
      avatar: { url: string; key: string };
      address: string;
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

// Initialize the state
interface UserPreferenceState {
  favorite_restaurants: string[];
  cart_items: CartItem[];
}

const initialState: UserPreferenceState = {
  favorite_restaurants: [],
  cart_items: [],
};

// Async thunk to save the updated favorite restaurants list to AsyncStorage
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

// Async thunk to load favorite restaurants from AsyncStorage
export const loadFavoriteRestaurantsFromAsyncStorage = createAsyncThunk(
  "userPreference/loadFavoriteRestaurants",
  async () => {
    const favorite_restaurants = await AsyncStorage.getItem(
      "favorite_restaurants"
    );
    return favorite_restaurants ? JSON.parse(favorite_restaurants) : [];
  }
);

// Async thunk to save the updated cart items list to AsyncStorage
export const saveCartItemsToAsyncStorage = createAsyncThunk(
  "userPreference/saveCartItems",
  async (cart_items: CartItem[]) => {
    await AsyncStorage.setItem("cart_items", JSON.stringify(cart_items));
    return cart_items;
  }
);

// Async thunk to load cart items from AsyncStorage
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
        // Add the restaurant to favorites if it's not already in the list
        state.favorite_restaurants.push(restaurantId);
      } else {
        // Remove the restaurant from favorites if it's already in the list
        state.favorite_restaurants = state.favorite_restaurants.filter(
          (id) => id !== restaurantId
        );
      }
    },

    addItemToCart: (state, action) => {
      const newItem = action.payload;

      // Check if the item already exists in the cart by comparing the item's unique identifier (_id)
      const existingItem = state.cart_items.find(
        (item) => item._id === newItem._id
      );

      if (existingItem) {
        // Loop over the variants to find the existing variant and update the quantity and price accordingly
        newItem.variants.forEach((newVariant: Variant) => {
          const existingVariant = existingItem.variants.find(
            (variant) => variant.variant_id === newVariant.variant_id
          );

          if (existingVariant) {
            console.log("check fall hrere", newVariant);

            // If the variant exists, update its quantity
            existingVariant.quantity += newVariant.quantity;
          } else {
            // If the variant doesn't exist in the existing item, add it to the variants array
            existingItem.variants.push(newVariant);
          }
        });
      } else {
        // If the item doesn't exist in the cart, add it as a new item
        state.cart_items.push(newItem);
      }
    },

    removeItemFromCart: (state, action) => {
      const itemId = action.payload;
      // Remove the item from cart based on its unique identifier (_id)
      state.cart_items = state.cart_items.filter((item) => item._id !== itemId);
    },

    updateItemQuantity: (state, action) => {
      const { itemId, variantId, quantity } = action.payload;

      const item = state.cart_items.find((item) => item._id === itemId);
      if (item) {
        const variant = item.variants.find(
          (variant) => variant.variant_id === variantId
        );
        if (variant) {
          // Update the variant quantity
          variant.quantity = quantity;
        }
      }
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
} = userPreferenceSlice.actions;

export default userPreferenceSlice.reducer;
