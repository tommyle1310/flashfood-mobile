import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import { useSelector } from "@/src/store/types";
import { RootState } from "@/src/store/store";

interface ChatMessage {
  messageId: string;
  id?: string;
  senderId?: string;
  from: string;
  content: string;
  type: "TEXT" | "IMAGE" | "VIDEO" | "ORDER_INFO";
  timestamp: Date;
  chatId: string;
}

export const useFChatSocket = () => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [chatId, setChatId] = useState<string | null>(
    "chat_FF_CC_6cc2406a-3e83-4ff1-8816-ccfae8794a91_FF_CUS_9d650c2b-815d-417b-91c3-be89d2a74bda_SUPPORT"
  );
  const { accessToken } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    if (!accessToken) {
      console.log("No access token available");
      return;
    }

    // Initialize socket connection specifically for chat
    const socketInstance = io(
      "https://1e81-2001-ee0-50c6-6480-8901-9c4b-fb36-c822.ngrok-free.app/chat",
      {
        transports: ["websocket"],
        extraHeaders: {
          auth: `Bearer ${accessToken}`,
        },
      }
    );

    socketInstance.on("connect", () => {
      console.log("Connected to chat server");
      setSocket(socketInstance);
    });

    socketInstance.on("disconnect", (reason) => {
      console.log("Disconnected from chat server:", reason);
      setSocket(null); // Reset socket on disconnect
    });

    socketInstance.on("connect_error", (error) => {
      console.error("Connection error:", error);
      setSocket(null); // Reset socket on error
    });

    socketInstance.on("newMessage", (message: ChatMessage) => {
      console.log("New message received:", message);
      setMessages((prev) => [...prev, message]);
    });
    socketInstance.on(
      "getChatHistory",
      (data: { chatId: string; messages: ChatMessage[]; id: string }) => {
        if (data.messages && Array.isArray(data.messages)) {
          setMessages(
            data.messages.map((msg) => ({
              ...msg,
              messageId: msg.id ?? "",
              from: msg.senderId ?? "",
              content: msg.content,
              type: msg.type,
              timestamp: msg.timestamp,
              chatId: msg.chatId,
            }))
          );
        } else {
          console.log("Unexpected message format:", data);
        }
      }
    );

    socketInstance.on("chatStarted", (data: { chatId: string }) => {
      console.log("Chat started:", data);
      setChatId(data.chatId);
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, [accessToken]);

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
    if (!socket || !chatId) {
      console.log("Socket or chatId is not available");
      return;
    }
    console.log("sending message", chatId, content, type);
    socket.emit("sendMessage", {
      chatId,
      content,
      type,
    });
  };

  useEffect(() => {
    if (socket) {
      getChatHistory();
    }
  }, [socket]);
  const getChatHistory = () => {
    // console.log("check socket", socket, "chatId", chatId);
    if (!socket || !chatId) {
      console.log("Socket or chatId is not available for getting chat history");
      return;
    }
    socket.emit("getChatHistory", { chatId });
    // console.log("check chatHistory", chatHistory);
  };

  return {
    socket,
    messages,
    chatId,
    startChat,
    sendMessage,
    getChatHistory,
  };
};
