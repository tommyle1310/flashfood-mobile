import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Define the types of state we will use in this slice
interface AuthState {
  accessToken: string | null;
  isAuthenticated: boolean;
}

// Initialize the state
const initialState: AuthState = {
  accessToken: null,
  isAuthenticated: false,
};

// Define the AsyncThunk for loading token from AsyncStorage
export const loadTokenFromAsyncStorage = createAsyncThunk<string | null>(
  'auth/loadToken',
  async () => {
    const token = await AsyncStorage.getItem('accessToken');
    return token;
  }
);

// Define the AsyncThunk for saving token to AsyncStorage
export const saveTokenToAsyncStorage = createAsyncThunk<string, string>(
  'auth/saveToken',
  async (token: string) => {
    await AsyncStorage.setItem('accessToken', token);
    return token;
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setAuthState: (state, action) => {
      state.accessToken = action.payload.accessToken;
      state.isAuthenticated = true;
    },
    clearAuthState: (state) => {
      state.accessToken = null;
      state.isAuthenticated = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadTokenFromAsyncStorage.fulfilled, (state, action) => {
        if (action.payload) {
          state.accessToken = action.payload;
          state.isAuthenticated = true;
        } else {
          state.isAuthenticated = false;
        }
      })
      .addCase(saveTokenToAsyncStorage.fulfilled, (state, action) => {
        state.accessToken = action.payload;
        state.isAuthenticated = true;
      });
  },
});

export const { setAuthState, clearAuthState } = authSlice.actions;
export default authSlice.reducer;
