import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Image,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import FFSafeAreaView from "@/src/components/FFSafeAreaView";
import FFScreenTopSection from "@/src/components/FFScreenTopSection";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { MainStackParamList } from "@/src/navigation/AppNavigator";
import { StackNavigationProp } from "@react-navigation/stack";
import { useFChatSocket } from "@/src/hooks/useFChatSocket";
import { useSelector } from "@/src/store/types";
import { RootState } from "@/src/store/store";

type FChatNavigationProp = StackNavigationProp<MainStackParamList, "FChat">;
type FChatRouteProp = RouteProp<MainStackParamList, "FChat">;

const FChatScreen = () => {
  const navigation = useNavigation<FChatNavigationProp>();
  const route = useRoute<FChatRouteProp>();
  const [message, setMessage] = useState("");

  const {
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
  } = useFChatSocket();

  const { user_id, id, accessToken } = useSelector(
    (state: RootState) => state.auth
  );

  // Initial state logic - check if we have essential chat data
  const hasEssentialChatData = roomId && currentSession && messages;

  // Start chat when component mounts (for existing chat flow)
  useEffect(() => {
    if (socket && route.params?.withUserId) {
      startChat(
        route.params.withUserId,
        route.params.type || "SUPPORT",
        route.params.orderId
      );
    }
  }, [socket, route.params]);

  const handleSendMessage = () => {
    if (message.trim()) {
      sendMessage(message.trim());
      setMessage("");
    }
  };

  const handleRequestCustomerCare = () => {
    requestCustomerCare();
  };

  // Render customer care request UI if no essential chat data
  const renderCustomerCareRequest = () => (
    <View className="flex-1 justify-center items-center px-6 bg-gray-50">
      <View className="bg-white rounded-3xl p-8 shadow-lg w-full max-w-sm">
        {/* Icon */}
        <View className="items-center mb-6">
          <View className="bg-[#63c550] rounded-full p-4 mb-4">
            <Ionicons name="headset" size={32} color="white" />
          </View>
          <Text className="text-2xl font-bold text-gray-800 text-center mb-2">
            Customer Support
          </Text>
          <Text className="text-gray-600 text-center leading-6">
            Need help? Our customer care team is here to assist you with any
            questions or concerns.
          </Text>
        </View>

        {/* Request Button */}
        <TouchableOpacity
          className={`bg-[#63c550] rounded-2xl py-4 px-6 items-center mb-4 ${
            isRequestingSupport ? "opacity-70" : ""
          }`}
          onPress={handleRequestCustomerCare}
          disabled={isRequestingSupport || !isConnected}
        >
          {isRequestingSupport ? (
            <View className="flex-row items-center">
              <ActivityIndicator size="small" color="white" />
              <Text className="text-white font-semibold ml-2">
                Connecting...
              </Text>
            </View>
          ) : (
            <View className="flex-row items-center">
              <Ionicons name="chatbubbles" size={20} color="white" />
              <Text className="text-white font-semibold ml-2">
                Request Customer Care Chat
              </Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Connection Status */}
        <View className="flex-row items-center justify-center">
          <View
            className={`w-2 h-2 rounded-full mr-2 ${
              isConnected ? "bg-green-500" : "bg-red-500"
            }`}
          />
          <Text
            className={`text-sm ${
              isConnected ? "text-green-600" : "text-red-600"
            }`}
          >
            {isConnected ? "Connected" : "Connecting..."}
          </Text>
        </View>

        {/* Error Message */}
        {requestError && (
          <View className="mt-4 p-3 bg-red-50 rounded-xl">
            <Text className="text-red-600 text-center text-sm">
              {requestError}
            </Text>
          </View>
        )}
      </View>
    </View>
  );

  // If no essential chat data and we have access token, show customer care request
  if (!hasEssentialChatData && accessToken) {
    return (
      <FFSafeAreaView>
        <FFScreenTopSection
          title="Support Chat"
          titlePosition="left"
          navigation={navigation}
        />
        {renderCustomerCareRequest()}
      </FFSafeAreaView>
    );
  }

  return (
    <FFSafeAreaView>
      {/* Chat Header */}
      <View className="flex-row items-center p-4 border-b border-gray-200">
        <FFScreenTopSection
          title="Support Chat"
          titlePosition="left"
          navigation={navigation}
        />
        <View className="flex-row ml-auto gap-4 mt-2">
          <TouchableOpacity>
            <Ionicons name="call" size={24} color="#63c550" />
          </TouchableOpacity>
          <TouchableOpacity>
            <Ionicons name="videocam" size={24} color="#63c550" />
          </TouchableOpacity>
          <TouchableOpacity>
            <Ionicons name="ellipsis-vertical" size={24} color="#63c550" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Chat Messages */}
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
      >
        <ScrollView
          className="flex-1 px-4"
          contentContainerStyle={{ paddingVertical: 20 }}
        >
          {messages.map((msg) => (
            <View
              key={msg.messageId}
              className={`flex-row ${
                msg.from === id ? "justify-end" : "justify-start"
              } mb-4`}
            >
              <View
                className={`max-w-[80%] rounded-2xl p-3 ${
                  msg.from === id
                    ? "bg-[#63c550] rounded-tr-none"
                    : "bg-gray-200 rounded-tl-none"
                }`}
              >
                {msg.type === "IMAGE" ? (
                  <Image
                    source={{ uri: msg.content }}
                    style={{
                      width: 120,
                      height: 120,
                      borderRadius: 10,
                    }}
                    resizeMode="cover"
                  />
                ) : (
                  <Text
                    className={`${
                      msg.from === user_id ? "text-white" : "text-black"
                    } text-base`}
                  >
                    {msg.content}
                  </Text>
                )}
                <Text
                  className={`text-xs mt-1 ${
                    msg.from === user_id ? "text-gray-200" : "text-gray-500"
                  }`}
                >
                  {new Date(msg.timestamp).toLocaleTimeString()}
                </Text>
              </View>
            </View>
          ))}
        </ScrollView>

        {/* Message Input */}
        <View className="p-4 border-t border-gray-200 bg-white flex-row items-center space-x-2">
          <TouchableOpacity>
            <Ionicons name="attach" size={24} color="gray" />
          </TouchableOpacity>
          <View className="flex-1 flex-row items-center bg-gray-100 rounded-full px-4 py-2">
            <TextInput
              className="flex-1 text-base"
              placeholder="Type your message here..."
              value={message}
              onChangeText={setMessage}
              multiline
            />
            <TouchableOpacity>
              <Ionicons name="happy" size={24} color="gray" />
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            className="bg-[#4c9f3a] w-10 h-10 ml-2 rounded-full items-center justify-center"
            onPress={handleSendMessage}
          >
            <Ionicons name="send" size={20} color="white" className="ml-1" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </FFSafeAreaView>
  );
};

export default FChatScreen;
