import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface AuthState {
  accessToken: string | null;
  isAuthenticated: boolean;
  email: string | null;
  app_preferences: object | null;
  preferred_category: string[];
  favorite_items: string[];
  avatar: {
    url: string;
    key: string;
  } | null;
  support_tickets: any[];
  user_id: string | null;
  user_type: string[] | null;
  address: Array<{
    location: { lng: number; lat: number };
    _id: string;
    street: string;
    city: string;
    nationality: string;
    is_default: boolean;
    created_at: number;
    updated_at: number;
    postal_code: number;
    title: string;
  }> | null;
}

// Initialize the state
const initialState: AuthState = {
  accessToken: null,
  isAuthenticated: false,
  email: null,
  address: null,
  app_preferences: {},
  preferred_category: [],
  favorite_items: [],
  avatar: null,
  support_tickets: [],
  user_id: null,
  user_type: null,
};

export const loadTokenFromAsyncStorage = createAsyncThunk(
  "auth/loadToken",
  async () => {
    const accessToken = await AsyncStorage.getItem("accessToken");
    const app_preferences = await AsyncStorage.getItem("app_preferences");
    const email = await AsyncStorage.getItem("email");
    const preferred_category = await AsyncStorage.getItem("preferred_category");
    const favorite_items = await AsyncStorage.getItem("favorite_items");
    const avatar = await AsyncStorage.getItem("avatar");
    const support_tickets = await AsyncStorage.getItem("support_tickets");
    const user_id = await AsyncStorage.getItem("user_id");
    const user_type = await AsyncStorage.getItem("user_type");
    const address = await AsyncStorage.getItem("address");

    return {
      accessToken,
      app_preferences: app_preferences ? JSON.parse(app_preferences) : {},
      email,
      preferred_category: preferred_category
        ? JSON.parse(preferred_category)
        : [],
      favorite_items: favorite_items ? JSON.parse(favorite_items) : [],
      avatar: avatar ? JSON.parse(avatar) : null,
      support_tickets: support_tickets ? JSON.parse(support_tickets) : [],
      user_id,
      user_type: user_type ? JSON.parse(user_type) : [],
      address: address ? JSON.parse(address) : [],
    };
  }
);

// Async thunk to save the data to AsyncStorage
export const saveTokenToAsyncStorage = createAsyncThunk(
  "auth/saveToken",
  async (data: {
    accessToken: string;
    app_preferences: object;
    email: string;
    preferred_category: string[];
    favorite_items: string[];
    avatar: { url: string; key: string };
    support_tickets: any[];
    user_id: string;
    user_type: string[];
    address: Array<{
      location: { lng: number; lat: number };
      _id: string;
      street: string;
      city: string;
      nationality: string;
      is_default: boolean;
      created_at: number;
      updated_at: number;
      postal_code: number;
      title: string;
    }> | null;
  }) => {
    await AsyncStorage.setItem("accessToken", data.accessToken);
    await AsyncStorage.setItem(
      "app_preferences",
      JSON.stringify(data.app_preferences)
    );
    await AsyncStorage.setItem("email", data.email);
    await AsyncStorage.setItem(
      "preferred_category",
      JSON.stringify(data.preferred_category)
    );
    await AsyncStorage.setItem(
      "favorite_items",
      JSON.stringify(data.favorite_items)
    );
    await AsyncStorage.setItem("avatar", JSON.stringify(data.avatar));
    await AsyncStorage.setItem(
      "support_tickets",
      JSON.stringify(data.support_tickets)
    );
    await AsyncStorage.setItem("user_id", data.user_id);
    await AsyncStorage.setItem("user_type", JSON.stringify(data.user_type));
    await AsyncStorage.setItem("address", JSON.stringify(data.address)); // Save address to AsyncStorage

    return data;
  }
);

export const setAvatarInAsyncStorage = createAsyncThunk(
  "auth/setAvatarInAsyncStorage",
  async (avatar: { url: string; key: string }) => {
    await AsyncStorage.setItem("avatar", JSON.stringify(avatar));
    return avatar;
  }
);

// Set default address in AsyncStorage
export const setDefaultAddressInStorage = createAsyncThunk(
  "auth/setDefaultAddressInStorage",
  async (
    address: {
      location: { lng: number; lat: number };
      _id: string;
      street: string;
      city: string;
      nationality: string;
      is_default: boolean;
      created_at: number;
      updated_at: number;
      postal_code: number;
      title: string;
    },
    { dispatch }
  ) => {
    try {
      // Save the address to AsyncStorage
      await AsyncStorage.setItem("@defaultAddress", JSON.stringify(address));

      // Dispatch action to update the Redux store with the new address
      dispatch(setDefaultAddress(address)); // You can dispatch the existing setDefaultAddress action here
      return address; // Returning the address to be used in the extraReducers if necessary
    } catch (error) {
      console.error("Error saving default address to AsyncStorage:", error);
      throw error; // Throw error to be caught in the extraReducer if needed
    }
  }
);

// Define the AsyncThunk for logging out
export const logout = createAsyncThunk(
  "auth/logout",
  async (_, { dispatch }) => {
    // Clear all user-related data from AsyncStorage
    await AsyncStorage.removeItem("accessToken");
    await AsyncStorage.removeItem("app_preferences");
    await AsyncStorage.removeItem("email");
    await AsyncStorage.removeItem("preferred_category");
    await AsyncStorage.removeItem("favorite_items");
    await AsyncStorage.removeItem("avatar");
    await AsyncStorage.removeItem("support_tickets");
    await AsyncStorage.removeItem("user_id");
    await AsyncStorage.removeItem("user_type");

    // Dispatch the clearAuthState action to update the Redux store
    dispatch(clearAuthState());
  }
);

// New async thunk for updating address in state
export const updateAddressInState = createAsyncThunk(
  "auth/updateAddressInState",
  async (address: any, { dispatch }) => {
    await AsyncStorage.setItem("address", JSON.stringify(address));
    dispatch(setDefaultAddress(address));
    return address;
  }
);

export const updateSingleAddress = createAsyncThunk(
  "auth/updateSingleAddress",
  async (
    updatedAddress: {
      location: { lng: number; lat: number };
      _id: string;
      street: string;
      city: string;
      nationality: string;
      is_default: boolean;
      created_at: number;
      updated_at: number;
      postal_code: number;
      title: string;
    },
    { getState }
  ) => {
    try {
      // Get current state
      const state: any = getState();
      const currentAddresses = state.auth.address || [];

      // Update the specific address in the array
      console.log("check addres apyload", updatedAddress);

      const updatedAddresses = currentAddresses.map((addr: any) =>
        addr._id === updatedAddress._id ? updatedAddress : addr
      );

      // Save to AsyncStorage
      await AsyncStorage.setItem("address", JSON.stringify(updatedAddresses));

      return updatedAddress;
    } catch (error) {
      console.error("Error updating address:", error);
      throw error;
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setAuthState: (state, action) => {
      const {
        accessToken,
        app_preferences,
        email,
        preferred_category,
        favorite_items,
        avatar,
        support_tickets,
        user_id,
        user_type,
        address,
      } = action.payload;
      state.accessToken = accessToken;
      state.isAuthenticated = true;
      state.app_preferences = app_preferences;
      state.email = email;
      state.preferred_category = preferred_category;
      state.favorite_items = favorite_items;
      state.avatar = avatar;
      state.support_tickets = support_tickets;
      state.user_id = user_id;
      state.user_type = user_type;
      state.address = address; // Set the address
    },

    clearAuthState: (state) => {
      state.accessToken = null;
      state.isAuthenticated = false;
      state.app_preferences = {};
      state.email = null;
      state.preferred_category = [];
      state.favorite_items = [];
      state.avatar = null;
      state.support_tickets = [];
      state.user_id = null;
      state.user_type = [];
      state.address = []; // Clear address on logout
    },
    setAvatar: (state, action) => {
      const { url, key } = action.payload;
      state.avatar = { url, key }; // Update avatar state
    },
    setDefaultAddress: (state, action) => {
      const updatedAddress = action.payload;

      // If the address array exists
      if (state.address) {
        // First, set all existing addresses with `is_default` to false
        state.address = state.address.map((address) => {
          if (address.is_default) {
            return { ...address, is_default: false }; // Set existing default to false
          }
          return address;
        });

        // Now, find the address from the payload and set `is_default: true`
        state.address = state.address.map((address) => {
          if (address._id === updatedAddress._id) {
            return { ...address, is_default: true }; // Set selected address as default
          }
          return address;
        });
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadTokenFromAsyncStorage.fulfilled, (state, action) => {
        const {
          accessToken,
          app_preferences,
          email,
          preferred_category,
          favorite_items,
          avatar,
          support_tickets,
          user_id,
          user_type,
          address,
        } = action.payload;

        if (accessToken) {
          state.accessToken = accessToken;
          state.isAuthenticated = true;
          state.app_preferences = app_preferences;
          state.email = email;
          state.preferred_category = preferred_category;
          state.favorite_items = favorite_items;
          state.avatar = avatar;
          state.support_tickets = support_tickets;
          state.user_id = user_id;
          state.user_type = user_type;
          state.address = address; // Set the address if available
        } else {
          state.isAuthenticated = false;
        }
      })
      .addCase(saveTokenToAsyncStorage.fulfilled, (state, action) => {
        const {
          accessToken,
          app_preferences,
          email,
          preferred_category,
          favorite_items,
          avatar,
          support_tickets,
          user_id,
          user_type,
          address,
        } = action.payload;

        state.accessToken = accessToken;
        state.isAuthenticated = true;
        state.app_preferences = app_preferences;
        state.email = email;
        state.preferred_category = preferred_category;
        state.favorite_items = favorite_items;
        state.avatar = avatar;
        state.support_tickets = support_tickets;
        state.user_id = user_id;
        state.user_type = user_type;
        state.address = address; // Set the address in the state
      })
      .addCase(logout.fulfilled, (state) => {
        state.accessToken = null;
        state.isAuthenticated = false;
        state.app_preferences = {};
        state.email = null;
        state.preferred_category = [];
        state.favorite_items = [];
        state.avatar = null;
        state.support_tickets = [];
        state.user_id = null;
        state.user_type = [];
        state.address = []; // Clear address on logout
      })
      .addCase(updateAddressInState.fulfilled, (state, action) => {
        const updatedAddress = action.payload;

        // Ensure state.address is always an array, even if it was null
        state.address = (state.address || []).map((address) => {
          if (address._id === updatedAddress._id) {
            return { ...address, is_default: true };
          }
          return { ...address, is_default: false };
        });
      })
      .addCase(updateSingleAddress.fulfilled, (state, action) => {
        const updatedAddress = action.payload;
        if (state.address) {
          state.address = state.address.map((address) =>
            address._id === updatedAddress._id ? updatedAddress : address
          );
        }
      });
  },
});

export const { setAuthState, clearAuthState, setAvatar, setDefaultAddress } =
  authSlice.actions;

export default authSlice.reducer;
