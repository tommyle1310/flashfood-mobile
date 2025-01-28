import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Define the types of state we will use in this slice
interface CartItem {
  _id: string;
  customer_id: string;
  item_id: string;
  quantity: number;
  price_at_time_of_addition: number;
  created_at: number;
  updated_at: number;
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

      // Check if the item already exists in the cart by comparing _id
      const existingItem = state.cart_items.find(
        (item) => item.item_id === newItem
      );

      if (existingItem) {
        // If the item already exists, do nothing (or you can update the quantity or other properties if needed)
        return;
      } else {
        // If the item doesn't exist, add it to the cart
        state.cart_items.push(newItem);
      }
    },

    removeItemFromCart: (state, action) => {
      const itemId = action.payload;
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
          // Ensure favorite restaurants are correctly loaded into state
          state.favorite_restaurants = action.payload;
        }
      )
      .addCase(
        saveFavoriteRestaurantsToAsyncStorage.fulfilled,
        (state, action) => {}
      )
      .addCase(loadCartItemsFromAsyncStorage.fulfilled, (state, action) => {
        // Ensure cart items are correctly loaded into state
        state.cart_items = action.payload;
      })
      .addCase(saveCartItemsToAsyncStorage.fulfilled, (state, action) => {
        // Ensure we're saving the correct list
        console.log("Cart items saved to AsyncStorage:", action.payload);
      });
  },
});

export const {
  toggleFavoriteRestaurant,
  addItemToCart,
  removeItemFromCart,
  updateItemQuantity,
} = userPreferenceSlice.actions;

export default userPreferenceSlice.reducer;
