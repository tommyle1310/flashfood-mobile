import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import { useSelector, useDispatch } from "@/src/store/types";
import { RootState } from "@/src/store/store";
import { BACKEND_URL } from "../utils/constants";
import {
  setConnectionState,
  startSupportRequest,
  supportRequestSuccess,
  supportRequestError,
  setChatSession,
  addMessage,
  setMessages,
  setLoadingHistory,
  loadChatDataFromStorage,
  saveChatSessionToStorage,
  saveMessagesToStorage,
} from "@/src/store/chatSlice";

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

export const useFChatSocket = () => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const dispatch = useDispatch();

  // Get state from Redux
  const { accessToken } = useSelector((state: RootState) => state.auth);
  const {
    currentSession,
    messages,
    isRequestingSupport,
    requestError,
    isConnected,
  } = useSelector((state: RootState) => state.chat);

  // Get roomId from current session
  const roomId = currentSession?.dbRoomId || null;

  // Load chat data on mount
  useEffect(() => {
    dispatch(loadChatDataFromStorage());
  }, [dispatch]);

  useEffect(() => {
    if (!accessToken) {
      console.log("No access token available");
      return;
    }

    // Initialize socket connection specifically for chat
    const socketInstance = io(`${BACKEND_URL}/chat`, {
      transports: ["websocket"],
      extraHeaders: {
        auth: `Bearer ${accessToken}`,
      },
    });

    socketInstance.on("connect", () => {
      console.log("Connected to chat server");
      setSocket(socketInstance);
      dispatch(setConnectionState(true));
    });

    socketInstance.on("disconnect", (reason) => {
      console.log("Disconnected from chat server:", reason);
      setSocket(null);
      dispatch(setConnectionState(false));
    });

    socketInstance.on("connect_error", (error) => {
      console.error("Connection error:", error);
      setSocket(null);
      dispatch(setConnectionState(false));
    });

    socketInstance.on("newMessage", (message: any) => {
      console.log("New message received:", message);

      // Format message to match our interface
      const formattedMessage: ChatMessage = {
        messageId: message.id || message.messageId || "",
        id: message.id,
        senderId: message.senderId,
        from: message.senderId || "",
        content: message.content,
        type: message.messageType || message.type || "TEXT",
        messageType: message.messageType || message.type || "TEXT",
        timestamp: message.timestamp,
        roomId: message.roomId,
        readBy: message.readBy,
        senderDetails: message.senderDetails,
        senderType: message.senderType,
      };

      dispatch(addMessage(formattedMessage));
      // Save messages to storage
      dispatch(saveMessagesToStorage([...messages, formattedMessage]));
    });
    socketInstance.on(
      "chatHistory",
      (data: { chatId: string; messages: any[]; id: string }) => {
        if (data.messages && Array.isArray(data.messages)) {
          const formattedMessages = data.messages.map((msg) => ({
            ...msg,
            messageId: msg.id ?? "",
            from: msg.senderId ?? "",
            content: msg.content,
            type: msg.messageType ?? "TEXT",
            messageType: msg.messageType ?? "TEXT",
            timestamp: msg.timestamp,
            roomId: msg.roomId,
            readBy: msg.readBy,
            senderDetails: msg.senderDetails,
            senderType: msg.senderType,
          }));
          dispatch(setMessages(formattedMessages));
          dispatch(saveMessagesToStorage(formattedMessages));
        } else {
          console.log("Unexpected message format:", data);
        }
      }
    );

    // Updated chatStarted handler to match expected data structure
    socketInstance.on(
      "chatStarted",
      (data: {
        chatId: string;
        withUser: string;
        type: "SUPPORT" | "ORDER";
        dbRoomId: string;
        orderId?: string;
      }) => {
        console.log("Chat started:", data);

        // Create and save chat session with serializable dates
        const session = {
          chatId: data.chatId,
          dbRoomId: data.dbRoomId,
          withUser: data.withUser,
          type: data.type,
          orderId: data.orderId,
          isActive: true,
          createdAt: new Date().toISOString(), // Convert to ISO string
          lastMessageAt: new Date().toISOString(), // Convert to ISO string
        };

        dispatch(setChatSession(session));
        dispatch(saveChatSessionToStorage(session));
        dispatch(supportRequestSuccess());
      }
    );

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, [accessToken]);

  // Request customer care chat
  const requestCustomerCare = () => {
    if (!socket) {
      console.log("Socket is not initialized");
      dispatch(supportRequestError("Connection not available"));
      return;
    }

    dispatch(startSupportRequest());
    socket.emit("requestCustomerCare");
  };

  const startChat = (
    withUserId: string,
    type: "SUPPORT" | "ORDER",
    orderId?: string
  ) => {
    if (!socket) {
      console.log("Socket is not initialized");
      return;
    }
    socket.emit("startChat", { withUserId, type, orderId });
  };

  const sendMessage = (
    content: string,
    type: "TEXT" | "IMAGE" | "VIDEO" | "ORDER_INFO" = "TEXT"
  ) => {
    if (!socket || !roomId) {
      console.log("Socket or roomId is not available");
      return;
    }
    console.log("sending message", roomId, content, type);
    socket.emit("sendMessage", {
      roomId,
      content,
      type,
    });
  };

  const getChatHistory = () => {
    if (!socket || !roomId) {
      console.log("Socket or roomId is not available for getting chat history");
      return;
    }
    dispatch(setLoadingHistory(true));
    socket.emit("getChatHistory", { roomId });
  };

  // Auto-load chat history when roomId changes
  useEffect(() => {
    if (socket && roomId) {
      getChatHistory();
    }
  }, [socket, roomId]);

  return {
    socket,
    messages,
    roomId,
    currentSession,
    isRequestingSupport,
    requestError,
    isConnected,
    requestCustomerCare,
    startChat,
    sendMessage,
    getChatHistory,
  };
};
