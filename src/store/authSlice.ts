import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface AuthState {
  accessToken: string | null;
  isAuthenticated: boolean;
  email: string | null;
  id: string | null;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  fWallet_id: string | null;
  app_preferences: object | null;
  preferred_category: string[];
  favorite_items: string[];
  avatar: {
    url: string;
    key: string;
  } | null;
  support_tickets: any[];
  user_id: string | null;
  fWallet_balance: number | null;
  user_type: string[] | null;
  address: Array<{
    location: { lng: number; lat: number };
    id: string;
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
  id: null,
  first_name: null,
  last_name: null,
  phone: null,
  fWallet_id: null,
  fWallet_balance: null,
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
    console.log("📱 loadTokenFromAsyncStorage: Loading data from AsyncStorage");
    
    const accessToken = await AsyncStorage.getItem("accessToken");
    const id = await AsyncStorage.getItem("id");
    const fWallet_balance = await AsyncStorage.getItem("fWallet_balance");
    const app_preferences = await AsyncStorage.getItem("app_preferences");
    const email = await AsyncStorage.getItem("email");
    const first_name = await AsyncStorage.getItem("first_name");
    const last_name = await AsyncStorage.getItem("last_name");
    const phone = await AsyncStorage.getItem("phone");
    const preferred_category = await AsyncStorage.getItem("preferred_category");
    const favorite_items = await AsyncStorage.getItem("favorite_items");
    const avatar = await AsyncStorage.getItem("avatar");
    const support_tickets = await AsyncStorage.getItem("support_tickets");
    const user_id = await AsyncStorage.getItem("user_id");
    const fWallet_id = await AsyncStorage.getItem("fWallet_id");
    const user_type = await AsyncStorage.getItem("user_type");
    const address = await AsyncStorage.getItem("address");

    // Log what we actually retrieved
    console.log("📱 Raw AsyncStorage values:");
    console.log("  email:", email);
    console.log("  avatar:", avatar);
    console.log("  address:", address);
    console.log("  phone:", phone);
    console.log("  fWallet_id:", fWallet_id);

    const result = {
      accessToken,
      id,
      fWallet_balance,
      fWallet_id,
      first_name,
      last_name,
      phone,
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
    
    console.log("📱 loadTokenFromAsyncStorage: Loaded data:", result);
    return result;
  }
);

// Async thunk to save the data to AsyncStorage
export const saveTokenToAsyncStorage = createAsyncThunk(
  "auth/saveToken",
  async (data: {
    accessToken: string;
    id: string;
    fWallet_balance: number;
    fWallet_id: string;
    app_preferences: object;
    email: string;
    first_name: string;
    last_name: string;
    phone: string;
    preferred_category: string[];
    favorite_items: string[];
    avatar: { url: string; key: string };
    support_tickets: any[];
    user_id: string;
    user_type: string[];
    address: Array<{
      location: { lng: number; lat: number };
      id: string;
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
    console.log("💾 saveTokenToAsyncStorage: Saving data to AsyncStorage", data);
    
    // Save each item and log what we're saving
    console.log("📧 Saving email:", data.email);
    await AsyncStorage.setItem("accessToken", data.accessToken);
    await AsyncStorage.setItem("id", data.id);
    await AsyncStorage.setItem("first_name", data.first_name);
    await AsyncStorage.setItem("last_name", data.last_name);
    await AsyncStorage.setItem("phone", data.phone);
    await AsyncStorage.setItem("fWallet_balance", `${data.fWallet_balance}`);
    await AsyncStorage.setItem("fWallet_id", data.fWallet_id);
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
    
    console.log("👤 Saving avatar:", data.avatar);
    await AsyncStorage.setItem("avatar", JSON.stringify(data.avatar));
    await AsyncStorage.setItem(
      "support_tickets",
      JSON.stringify(data.support_tickets)
    );
    await AsyncStorage.setItem("user_id", data.user_id);
    await AsyncStorage.setItem("user_type", JSON.stringify(data.user_type));
    
    console.log("🏠 Saving address:", data.address);
    await AsyncStorage.setItem("address", JSON.stringify(data.address)); // Save address to AsyncStorage

    console.log("✅ saveTokenToAsyncStorage: Data saved successfully");
    
    // Immediately verify what was saved by reading it back
    const testEmail = await AsyncStorage.getItem("email");
    const testAvatar = await AsyncStorage.getItem("avatar");
    const testAddress = await AsyncStorage.getItem("address");
    console.log("🧪 Verification - what was actually saved:");
    console.log("  email:", testEmail);
    console.log("  avatar:", testAvatar);
    console.log("  address:", testAddress);
    
    return data;
  }
);
export const saveProfileDataToAsyncStorage = createAsyncThunk(
  "auth/saveToken",
  async (data: {
    email: string;
    avatar: { url: string; key: string };
    first_name: string;
    last_name: string;
    phone: string;
  }) => {
    await AsyncStorage.setItem("email", data.email);
    await AsyncStorage.setItem("avatar", JSON.stringify(data.avatar));
    await AsyncStorage.setItem("first_name", JSON.stringify(data.avatar));
    await AsyncStorage.setItem("last_name", JSON.stringify(data.avatar));
    await AsyncStorage.setItem("phone", data.phone);

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
      id: string;
      fWallet_balance: number;
      fWallet_id: string;
      first_name: string;
      last_name: string;
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

// Add address to AsyncStorage
export const addAddressInAsyncStorage = createAsyncThunk(
  "auth/addAddressInAsyncStorage",
  async (
    address: {
      location: { lng: number; lat: number };
      id: string;
      fWallet_balance: number;
      fWallet_id: string;
      first_name: string;
      last_name: string;
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
      const state: any = getState();
      const currentAddresses = state.auth.address || [];

      // Add new address to array
      const updatedAddresses = [...currentAddresses, address];
      console.log("check updated address", updatedAddresses);
      // Save to AsyncStorage
      await AsyncStorage.setItem("address", JSON.stringify(updatedAddresses));

      return address;
    } catch (error) {
      console.error("Error adding address to AsyncStorage:", error);
      throw error;
    }
  }
);

// Define the AsyncThunk for logging out
export const logout = createAsyncThunk(
  "auth/logout",
  async (_, { dispatch }) => {
    // Clear all user-related data from AsyncStorage
    await AsyncStorage.removeItem("accessToken");
    await AsyncStorage.removeItem("id");
    await AsyncStorage.removeItem("first_name");
    await AsyncStorage.removeItem("last_name");
    await AsyncStorage.removeItem("phone");
    await AsyncStorage.removeItem("fWallet_id");
    await AsyncStorage.removeItem("fWallet_balance");
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
      id: string;
      first_name: string;
      last_name: string;
      fWallet_id: string;
      fWallet_balance: number;
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
        addr.id === updatedAddress.id ? updatedAddress : addr
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

export const addAddress = createAsyncThunk(
  "auth/addAddress",
  async (
    newAddress: {
      location: { lng: number; lat: number };
      id: string;
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
      const state: any = getState();
      const currentAddresses = state.auth.address || [];

      // Add new address to array
      const updatedAddresses = [...currentAddresses, newAddress];

      // Save to AsyncStorage
      await AsyncStorage.setItem("address", JSON.stringify(updatedAddresses));

      return newAddress;
    } catch (error) {
      console.error("Error adding address:", error);
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
        id,
        fWallet_id,
        first_name,
        last_name,
        phone,
        fWallet_balance,
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
      state.first_name = first_name;
      state.last_name = last_name;
      state.phone = phone;
      state.fWallet_balance = fWallet_balance;
      state.email = email;
      state.id = id;
      state.fWallet_id = fWallet_id;
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
      state.first_name = null;
      state.last_name = null;
      state.phone = null;
      state.isAuthenticated = false;
      state.app_preferences = {};
      state.email = null;
      state.fWallet_balance = null;
      state.fWallet_id = null;
      state.id = null;
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

      if (state.address) {
        // First, set all existing addresses with `is_default` to false
        state.address = state.address.map((address) => {
          if (address.is_default) {
            return { ...address, is_default: false };
          }
          return address;
        });

        // Now, find the address from the payload and set `is_default: true`
        state.address = state.address.map((address) => {
          if (address.id === updatedAddress.id) {
            return { ...address, is_default: true };
          }
          return address;
        });
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadTokenFromAsyncStorage.fulfilled, (state, action) => {
        console.log("🔄 loadTokenFromAsyncStorage.fulfilled: Updating Redux state", action.payload);
        
        const {
          id,
          fWallet_id,
          first_name,
          last_name,
          phone,
          fWallet_balance,
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
          console.log("🔑 Found accessToken, setting authenticated state");
          state.accessToken = accessToken;
          state.isAuthenticated = true;
          state.app_preferences = app_preferences;
          state.first_name = first_name;
          state.last_name = last_name;
          state.phone = phone;
          state.email = email;
          state.fWallet_id = fWallet_id;
          state.fWallet_balance = +(fWallet_balance || 0);
          state.id = id;
          state.preferred_category = preferred_category;
          state.favorite_items = favorite_items;
          state.avatar = avatar;
          state.support_tickets = support_tickets;
          state.user_id = user_id;
          state.user_type = user_type;
          state.address = address; // Set the address if available
          
          console.log("✅ loadTokenFromAsyncStorage.fulfilled: Authenticated state set", state);
        } else {
          console.log("❌ No accessToken found, setting unauthenticated state");
          state.isAuthenticated = false;
        }
      })
      .addCase(saveTokenToAsyncStorage.fulfilled, (state, action) => {
        console.log("🔄 saveTokenToAsyncStorage.fulfilled: Updating Redux state", action.payload);
        
        const {
          id,
          first_name,
          last_name,
          phone,
          fWallet_id,
          fWallet_balance,
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
        state.first_name = first_name;
        state.last_name = last_name;
        state.phone = phone;
        state.email = email;
        state.fWallet_balance = fWallet_balance;
        state.id = id;
        state.fWallet_id = fWallet_id;
        state.preferred_category = preferred_category;
        state.favorite_items = favorite_items;
        state.avatar = avatar;
        state.support_tickets = support_tickets;
        state.user_id = user_id;
        state.user_type = user_type;
        state.address = address; // Set the address in the state
        
        console.log("✅ saveTokenToAsyncStorage.fulfilled: Redux state updated", state);
      })
      .addCase(logout.fulfilled, (state) => {
        state.accessToken = null;
        state.first_name = null;
        state.last_name = null;
        state.phone = null;
        state.isAuthenticated = false;
        state.app_preferences = {};
        state.email = null;
        state.fWallet_balance = null;
        state.fWallet_id = null;
        state.id = null;
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

        state.address = (state.address || []).map((address) => {
          if (address.id === updatedAddress.id) {
            return { ...address, is_default: true };
          }
          return { ...address, is_default: false };
        });
      })
      .addCase(updateSingleAddress.fulfilled, (state, action) => {
        const updatedAddress = action.payload;
        if (state.address) {
          state.address = state.address.map((address) =>
            address.id === updatedAddress.id ? updatedAddress : address
          );
        }
      })
      .addCase(addAddress.fulfilled, (state, action) => {
        const newAddress = action.payload;
        if (!state.address) {
          state.address = [];
        }
        state.address.push(newAddress);
      })
      .addCase(addAddressInAsyncStorage.fulfilled, (state, action) => {
        const newAddress = action.payload;
        if (!state.address) {
          state.address = [];
        }
        // state.address.push(newAddress);
      });
  },
});

export const { setAuthState, clearAuthState, setAvatar, setDefaultAddress } =
  authSlice.actions;

export default authSlice.reducer;
