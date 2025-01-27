import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Define the types of state we will use in this slice
interface UserPreferenceState {
  favorite_restaurants: string[];
}

// Initialize the state
const initialState: UserPreferenceState = {
  favorite_restaurants: [],
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
        (state, action) => {
          // Ensure we're saving the correct list
          console.log("Favorites saved to AsyncStorage:", action.payload);
        }
      );
  },
});

export const { toggleFavoriteRestaurant } = userPreferenceSlice.actions;

export default userPreferenceSlice.reducer;
