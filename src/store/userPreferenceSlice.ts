import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Define the types of state we will use in this slice
export interface CartItem {
  _id: string;
  customer_id: string;
  item: {
    _id: string; // Unique identifier for the item
    avatar: { url: string; key: string };
    availability: boolean;
    category: string[];
    name: string;
    purchase_count: number;
    price: number;
    variants: { variant: string; price: string; _id: string }[];
  };
  quantity: number;
  price_at_time_of_addition: number;
  created_at: number;
  updated_at: number;
  avatar: { url: string; key: string };
  restaurant: {
    avatar: { url: string; key: string };
    _id: string;
    owner_id: string;
    restaurant_name: string;
  };
  __v: number;
}

interface UserPreferenceState {
  favorite_restaurants: string[];
  cart_items: CartItem[];
}

// Initialize the state
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
        const pricePerItem =
          newItem.price_at_time_of_addition / newItem.quantity;

        // Update the quantity (final quantity will be existing quantity + the quantity from the payload)
        existingItem.quantity += newItem.quantity;

        // Calculate the final price based on the final quantity
        existingItem.price_at_time_of_addition =
          pricePerItem * existingItem.quantity;
      } else {
        // Calculate the price per item (price_at_time_of_addition / quantity from payload)
        const pricePerItem =
          newItem.price_at_time_of_addition / newItem.quantity;

        // Add the item to the cart with the final price based on the final quantity
        state.cart_items.push({
          ...newItem,
          price_at_time_of_addition: pricePerItem * newItem.quantity, // Calculate the total price based on the quantity
        });
      }
    },

    removeItemFromCart: (state, action) => {
      const itemId = action.payload;
      // Remove the item from cart based on its unique identifier (_id)
      state.cart_items = state.cart_items.filter((item) => item._id !== itemId);
    },

    updateItemQuantity: (state, action) => {
      const { itemId, quantity } = action.payload;
      const item = state.cart_items.find((item) => item._id === itemId);
      if (item) {
        item.quantity = quantity;
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
