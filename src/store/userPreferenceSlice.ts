import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { RootState } from "./store";
import { IMAGE_LINKS } from "../assets/imageLinks";

export interface FavoriteRestaurant {
  id: string;
  restaurant_name: string;
  avatar: { url: string; key: string };
  address_id: string;
}

export interface Variant {
  variant_id: string;
  variant_name: string;
  quantity: number;
  item?: { id: string; avatar: { url: string; key: string }; name: string };
  id?: string;
  variant_price_at_time_of_addition: number;
}

export interface CartItem {
  id: string;
  customer_id: string;
  variants: Variant[];
  created_at?: number;
  updated_at?: number;
  __v?: number;
  restaurant?: {
    id: string;
    restaurant_name: string;
    avatar: { url: string; key: string };
    address_id: string;
  };
  item: {
    avatar: { url: string; key: string };
    id: string;
    item_id?: string;
    restaurant_id: string;
    restaurantDetails: {
      id: string;
      restaurant_name: string;
      avatar: { url: string; key: string };
      address_id: string;
    };
    name: string;
    description?: string;
    category: string[];
    availability: boolean;
    suggest_notes: string[];
    created_at?: number;
    updated_at?: number;
    purchase_count: number;
    discount?: {
      discount_type: "FIXED" | "PERCENTAGE";
      discount_value: number;
      start_date: number;
      end_date: number;
    } | null;
  };
}

interface UserPreferenceState {
  favorite_restaurants: FavoriteRestaurant[];
  cart_items: CartItem[];
}

const initialState: UserPreferenceState = {
  favorite_restaurants: [],
  cart_items: [],
};

export const saveFavoriteRestaurantsToAsyncStorage = createAsyncThunk(
  "userPreference/saveFavoriteRestaurants",
  async (_: void, { getState }) => {
    const state = getState() as RootState;
    const favorite_restaurants = state.userPreference.favorite_restaurants;
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
    console.log(
      "Saving cart_items to AsyncStorage:",
      JSON.stringify(cart_items, null, 2)
    );
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

const userPreferenceSlice = createSlice({
  name: "userPreference",
  initialState,
  reducers: {
    toggleFavoriteRestaurant: (state, action) => {
      const restaurant = action.payload;
      const index = state.favorite_restaurants.findIndex(
        (fav) => fav.id === restaurant.id
      );

      if (index === -1) {
        state.favorite_restaurants.push(restaurant);
      } else {
        state.favorite_restaurants = state.favorite_restaurants.filter(
          (fav) => fav.id !== restaurant.id
        );
      }
    },

    addItemToCart: (state, action) => {
      const newItem = action.payload;
      console.log("Adding item to cart:", JSON.stringify(newItem, null, 2));

      const existingItem = state.cart_items.find(
        (item) => item.id === newItem.id
      );

      if (existingItem) {
        console.log("Existing cart item found:", existingItem.id);
        newItem.variants.forEach((newVariant: Variant) => {
          console.log("Processing new variant:", newVariant.variant_id);
          const existingVariant = existingItem.variants.find(
            (variant) => variant.variant_id === newVariant.variant_id
          );

          if (existingVariant) {
            console.log(
              `Updating existing variant ${
                newVariant.variant_id
              }: increasing quantity from ${existingVariant.quantity} to ${
                existingVariant.quantity + newVariant.quantity
              }`
            );
            existingVariant.quantity += newVariant.quantity;
            existingVariant.variant_price_at_time_of_addition =
              newVariant.variant_price_at_time_of_addition;
          } else {
            console.log(
              `Adding new variant ${newVariant.variant_id} to item ${existingItem.id}`
            );
            existingItem.variants.push({
              ...newVariant,
              variant_price_at_time_of_addition:
                newVariant.variant_price_at_time_of_addition || 0,
            });
          }
        });
      } else {
        console.log("Adding new cart item:", newItem.id);
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
      console.log(
        "Updated cart items:",
        JSON.stringify(state.cart_items, null, 2)
      );
    },

    removeItemFromCart: (state, action) => {
      const itemId = action.payload;
      state.cart_items = state.cart_items.filter((item) => item.id !== itemId);
    },

    updateItemQuantity: (state, action) => {
      const { itemId, variantId, quantity } = action.payload;
      const item = state.cart_items.find((item) => item.id === itemId);
      if (item) {
        const variantIndex = item.variants.findIndex(
          (variant) => variant.variant_id === variantId
        );
        if (variantIndex !== -1) {
          if (quantity <= 0) {
            item.variants.splice(variantIndex, 1);
            console.log(`Removed variant ${variantId} from item ${itemId}`);
            if (item.variants.length === 0) {
              state.cart_items = state.cart_items.filter(
                (i) => i.id !== itemId
              );
              console.log(`Removed item ${itemId} as no variants remain`);
            }
          } else {
            item.variants[variantIndex].quantity = quantity;
            console.log(
              `Updated quantity of variant ${variantId} in item ${itemId} to ${quantity}`
            );
          }
        }
        // Save updated cart_items to AsyncStorage
        AsyncStorage.setItem(
          "cart_items",
          JSON.stringify(state.cart_items)
        ).then(() => {
          console.log(
            "Saved updated cart_items to AsyncStorage:",
            JSON.stringify(state.cart_items, null, 2)
          );
        });
      }
    },

    subtractItemFromCart: (state, action) => {
      const orderItems = action.payload;
      console.log("check orderitem", orderItems);
      console.log("check current cart_items", state.cart_items);

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
      // Save updated cart_items to AsyncStorage
      AsyncStorage.setItem("cart_items", JSON.stringify(state.cart_items)).then(
        () => {
          console.log(
            "Saved updated cart_items to AsyncStorage:",
            JSON.stringify(state.cart_items, null, 2)
          );
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
  subtractItemFromCart,
} = userPreferenceSlice.actions;

export default userPreferenceSlice.reducer;
