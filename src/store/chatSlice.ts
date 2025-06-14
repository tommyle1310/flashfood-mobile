import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface ChatMessage {
  messageId: string;
  id?: string;
  senderId?: string;
  from: string;
  content: string;
  type: "TEXT" | "IMAGE" | "VIDEO" | "ORDER_INFO";
  messageType?: "TEXT" | "IMAGE" | "VIDEO" | "ORDER_INFO";
  timestamp: Date | string; // Allow both for compatibility
  roomId: string;
  // Additional fields from server response
  readBy?: string[];
  senderDetails?: {
    avatar?: any;
    first_name?: string;
    last_name?: string;
    id?: string;
    phone?: string;
  };
  senderType?:
    | "CUSTOMER"
    | "CUSTOMER_CARE_REPRESENTATIVE"
    | "RESTAURANT"
    | "DRIVER";
}

interface ChatSession {
  chatId: string;
  dbRoomId: string;
  withUser: string;
  type: "SUPPORT" | "ORDER";
  orderId?: string;
  isActive: boolean;
  createdAt: string; // ISO string for serialization
  lastMessageAt?: string; // ISO string for serialization
}

interface ChatState {
  // Current active chat session
  currentSession: ChatSession | null;

  // All chat sessions (for history)
  sessions: ChatSession[];

  // Messages for current session
  messages: ChatMessage[];

  // Chat request state
  isRequestingSupport: boolean;
  requestError: string | null;

  // Connection state
  isConnected: boolean;

  // Loading states
  isLoadingHistory: boolean;
  isLoadingSessions: boolean;
}

const initialState: ChatState = {
  currentSession: null,
  sessions: [],
  messages: [],
  isRequestingSupport: false,
  requestError: null,
  isConnected: false,
  isLoadingHistory: false,
  isLoadingSessions: false,
};

// AsyncStorage keys
const CHAT_SESSIONS_KEY = "@chat_sessions";
const CHAT_MESSAGES_KEY = "@chat_messages";
const CURRENT_SESSION_KEY = "@current_chat_session";

// Async thunks for persistence
export const loadChatDataFromStorage = createAsyncThunk(
  "chat/loadChatDataFromStorage",
  async () => {
    try {
      const [sessionsData, messagesData, currentSessionData] =
        await Promise.all([
          AsyncStorage.getItem(CHAT_SESSIONS_KEY),
          AsyncStorage.getItem(CHAT_MESSAGES_KEY),
          AsyncStorage.getItem(CURRENT_SESSION_KEY),
        ]);

      return {
        sessions: sessionsData ? JSON.parse(sessionsData) : [],
        messages: messagesData ? JSON.parse(messagesData) : [],
        currentSession: currentSessionData
          ? JSON.parse(currentSessionData)
          : null,
      };
    } catch (error) {
      console.error("Error loading chat data from storage:", error);
      return {
        sessions: [],
        messages: [],
        currentSession: null,
      };
    }
  }
);

export const saveChatSessionToStorage = createAsyncThunk(
  "chat/saveChatSessionToStorage",
  async (session: ChatSession) => {
    try {
      // Save current session
      await AsyncStorage.setItem(CURRENT_SESSION_KEY, JSON.stringify(session));

      // Update sessions list
      const existingSessions = await AsyncStorage.getItem(CHAT_SESSIONS_KEY);
      const sessions: ChatSession[] = existingSessions
        ? JSON.parse(existingSessions)
        : [];

      // Update or add session
      const sessionIndex = sessions.findIndex(
        (s) => s.chatId === session.chatId
      );
      if (sessionIndex >= 0) {
        sessions[sessionIndex] = session;
      } else {
        sessions.push(session);
      }

      await AsyncStorage.setItem(CHAT_SESSIONS_KEY, JSON.stringify(sessions));

      return session;
    } catch (error) {
      console.error("Error saving chat session to storage:", error);
      throw error;
    }
  }
);

export const saveMessagesToStorage = createAsyncThunk(
  "chat/saveMessagesToStorage",
  async (messages: ChatMessage[]) => {
    try {
      await AsyncStorage.setItem(CHAT_MESSAGES_KEY, JSON.stringify(messages));
      return messages;
    } catch (error) {
      console.error("Error saving messages to storage:", error);
      throw error;
    }
  }
);

export const clearChatSession = createAsyncThunk(
  "chat/clearChatSession",
  async () => {
    try {
      await Promise.all([
        AsyncStorage.removeItem(CURRENT_SESSION_KEY),
        AsyncStorage.removeItem(CHAT_MESSAGES_KEY),
      ]);
    } catch (error) {
      console.error("Error clearing chat session:", error);
    }
  }
);

const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    // Connection state
    setConnectionState: (state, action) => {
      state.isConnected = action.payload;
    },

    // Support request state
    startSupportRequest: (state) => {
      state.isRequestingSupport = true;
      state.requestError = null;
    },

    supportRequestSuccess: (state) => {
      state.isRequestingSupport = false;
      state.requestError = null;
    },

    supportRequestError: (state, action) => {
      state.isRequestingSupport = false;
      state.requestError = action.payload;
    },

    // Chat session management
    setChatSession: (state, action) => {
      // Accept either a full session object or individual properties
      if (action.payload.chatId && action.payload.createdAt) {
        // Full session object
        state.currentSession = action.payload;
      } else {
        // Individual properties (legacy support)
        const { chatId, dbRoomId, withUser, type, orderId } = action.payload;
        state.currentSession = {
          chatId,
          dbRoomId,
          withUser,
          type,
          orderId,
          isActive: true,
          createdAt: new Date().toISOString(),
          lastMessageAt: new Date().toISOString(),
        };
      }
    },

    endChatSession: (state) => {
      if (state.currentSession) {
        state.currentSession.isActive = false;
      }
    },

    // Message management
    addMessage: (state, action) => {
      const message = action.payload;
      state.messages.push(message);

      // Update last message time in current session
      if (state.currentSession) {
        state.currentSession.lastMessageAt = new Date().toISOString();
      }
    },

    setMessages: (state, action) => {
      state.messages = action.payload;
    },

    clearMessages: (state) => {
      state.messages = [];
    },

    // Loading states
    setLoadingHistory: (state, action) => {
      state.isLoadingHistory = action.payload;
    },

    setLoadingSessions: (state, action) => {
      state.isLoadingSessions = action.payload;
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(loadChatDataFromStorage.fulfilled, (state, action) => {
        const { sessions, messages, currentSession } = action.payload;
        state.sessions = sessions;
        state.messages = messages;
        state.currentSession = currentSession;
      })
      .addCase(saveChatSessionToStorage.fulfilled, (state, action) => {
        // Update sessions list in state
        const session = action.payload;
        const sessionIndex = state.sessions.findIndex(
          (s) => s.chatId === session.chatId
        );
        if (sessionIndex >= 0) {
          state.sessions[sessionIndex] = session;
        } else {
          state.sessions.push(session);
        }
      })
      .addCase(saveMessagesToStorage.fulfilled, () => {
        // Messages are already updated in state, this is just for persistence confirmation
      })
      .addCase(clearChatSession.fulfilled, (state) => {
        state.currentSession = null;
        state.messages = [];
      });
  },
});

export const {
  setConnectionState,
  startSupportRequest,
  supportRequestSuccess,
  supportRequestError,
  setChatSession,
  endChatSession,
  addMessage,
  setMessages,
  clearMessages,
  setLoadingHistory,
  setLoadingSessions,
} = chatSlice.actions;

export default chatSlice.reducer;
