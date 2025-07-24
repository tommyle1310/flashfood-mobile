import React, { useState, useEffect, useRef, useCallback } from "react";
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
  StyleSheet,
  FlatList,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import FFSafeAreaView from "@/src/components/FFSafeAreaView";
import FFScreenTopSection from "@/src/components/FFScreenTopSection";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { MainStackParamList } from "@/src/navigation/AppNavigator";
import { StackNavigationProp } from "@react-navigation/stack";
import { useFChatSocket, ChatbotMessage, ChatbotFormField } from "@/src/hooks/useFChatSocket";
import { useSelector, useDispatch } from "@/src/store/types";
import { RootState } from "@/src/store/store";
import { truncateString } from "@/src/utils/functions";
import { colors, spacing } from "@/src/theme";
import FFText from "@/src/components/FFText";
import FFView from "@/src/components/FFView";
import { ChatMessage } from "@/src/store/chatSlice";
import FFButton from "@/src/components/FFButton";
import * as ImagePicker from "expo-image-picker";
import axiosInstance from "@/src/utils/axiosConfig";
import FFSpinner from "@/src/components/FFSpinner";

type FChatNavigationProp = StackNavigationProp<MainStackParamList, "FChat">;
type FChatRouteProp = RouteProp<
  MainStackParamList & {
    FChat: {
      withUserId?: string;
      type?: "SUPPORT" | "ORDER" | "CHATBOT";
      orderId?: string;
      title?: string;
    };
  },
  "FChat"
>;

// Add this function to detect and render order details
const renderOrderDetails = (content: string) => {
  // Check if this is an order details message
  if (content.includes("Order #") && content.includes("Status:")) {
    try {
      // Extract order ID
      const orderIdMatch = content.match(/Order #([a-f0-9-]+)/);
      const orderId = orderIdMatch ? orderIdMatch[1] : "";
      
      // Extract status
      const statusMatch = content.match(/Status: ([^\n]+)/);
      const status = statusMatch ? statusMatch[1] : "";
      
      // Extract order total
      const totalMatch = content.match(/Order total: ([^\n]+)/);
      const total = totalMatch ? totalMatch[1] : "";
      
      // Extract customer name
      const customerMatch = content.match(/Customer: ([^\n]+)/);
      const customer = customerMatch ? customerMatch[1] : "";
      
      // Extract restaurant name
      const restaurantMatch = content.match(/Restaurant: ([^\n]+)/);
      const restaurant = restaurantMatch ? restaurantMatch[1] : "";
      
      // Return styled order details
      return (
        <View style={styles.orderDetailsCard}>
          <View style={styles.orderHeaderRow}>
            <View style={styles.orderIdContainer}>
              <FFText style={styles.orderIdLabel}>Order ID</FFText>
              <FFText style={styles.orderId}>{truncateString(orderId, 8)}</FFText>
            </View>
            <View style={[
              styles.statusBadge, 
              status === "In Transit" ? styles.inTransitBadge : 
              status === "Delivered" ? styles.deliveredBadge : 
              status === "Preparing" ? styles.preparingBadge : 
              styles.defaultBadge
            ]}>
              <FFText style={styles.statusText}>{status}</FFText>
            </View>
          </View>
          
          <View style={styles.orderDetailRow}>
            <Ionicons name="restaurant-outline" size={16} color="#666" />
            <FFText style={styles.orderDetailLabel}>Restaurant:</FFText>
            <FFText style={styles.orderDetailValue}>{restaurant}</FFText>
          </View>
          
          <View style={styles.orderDetailRow}>
            <Ionicons name="person-outline" size={16} color="#666" />
            <FFText style={styles.orderDetailLabel}>Customer:</FFText>
            <FFText style={styles.orderDetailValue}>{customer}</FFText>
          </View>
          
          <View style={styles.orderTotalRow}>
            <FFText style={styles.orderTotalLabel}>Total:</FFText>
            <FFText style={styles.orderTotalValue}>${total}</FFText>
          </View>
        </View>
      );
    } catch (error) {
      console.log("Error parsing order details:", error);
      return <FFText>{content}</FFText>;
    }
  }
  
  // If not an order details message, return the content as is
  return <FFText>{content}</FFText>;
};

// Separate component for message content to handle state properly
const MessageContent = ({ message, userId, onOptionSelect }: { 
  message: ChatMessage, 
  userId: string | null,
  onOptionSelect: (value: string) => void
}) => {
  const [imageError, setImageError] = useState(false);
  const [formValues, setFormValues] = useState<Record<string, string>>({});
  const chatbotData = message.metadata?.chatbotMessage as ChatbotMessage | undefined;
  const agentData = message.metadata?.agentMessage as any;
  console.log('check agent data', agentData);
  
  // Helper function to format timestamp
  const formatTime = (timestamp: Date | string | number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  // Function to detect and render order details
  const renderOrderDetails = (content: string) => {
    // Check if this is an order details message
    if (content.includes("Order #") && content.includes("Status:")) {
      try {
        // Extract order ID
        const orderIdMatch = content.match(/Order #([a-f0-9-]+)/);
        const orderId = orderIdMatch ? orderIdMatch[1] : "";
        
        // Extract status
        const statusMatch = content.match(/Status: ([^\n]+)/);
        const status = statusMatch ? statusMatch[1] : "";
        
        // Extract order total
        const totalMatch = content.match(/Order total: ([^\n]+)/);
        const total = totalMatch ? totalMatch[1] : "";
        
        // Extract customer name
        const customerMatch = content.match(/Customer: ([^\n]+)/);
        const customer = customerMatch ? customerMatch[1] : "";
        
        // Extract restaurant name
        const restaurantMatch = content.match(/Restaurant: ([^\n]+)/);
        const restaurant = restaurantMatch ? restaurantMatch[1] : "";
        
        // Return styled order details
        return (
          <View style={styles.orderDetailsCard}>
            <View style={styles.orderHeaderRow}>
              <View style={styles.orderIdContainer}>
                <FFText style={styles.orderIdLabel}>Order ID</FFText>
                <FFText style={styles.orderId}>{truncateString(orderId, 8)}</FFText>
              </View>
              <View style={[
                styles.statusBadge, 
                status === "In Transit" ? styles.inTransitBadge : 
                status === "Delivered" ? styles.deliveredBadge : 
                status === "Preparing" ? styles.preparingBadge : 
                styles.defaultBadge
              ]}>
                <FFText style={styles.statusText}>{status}</FFText>
              </View>
            </View>
            
            <View style={styles.orderDetailRow}>
              <Ionicons name="restaurant-outline" size={16} color="#666" />
              <FFText style={styles.orderDetailLabel}>Restaurant:</FFText>
              <FFText style={styles.orderDetailValue}>{restaurant}</FFText>
            </View>
            
            <View style={styles.orderDetailRow}>
              <Ionicons name="person-outline" size={16} color="#666" />
              <FFText style={styles.orderDetailLabel}>Customer:</FFText>
              <FFText style={styles.orderDetailValue}>{customer}</FFText>
            </View>
            
            <View style={styles.orderTotalRow}>
              <FFText style={styles.orderTotalLabel}>Total:</FFText>
              <FFText style={styles.orderTotalValue}>${total}</FFText>
            </View>
          </View>
        );
      } catch (error) {
        console.log("Error parsing order details:", error);
        return <FFText>{content}</FFText>;
      }
    }
    
    // If not an order details message, return null
    return null;
  };
  
  // Render chatbot options
  const renderChatbotOptions = (options: any[], messageId: string) => {
    console.log("Rendering options:", options.length, "for message:", messageId);
    
    return (
      <View style={styles.optionsContainer}>
        {options.map((option, index) => (
          <TouchableOpacity
            key={`${messageId}_option_${index}`}
            style={styles.optionButton}
            onPress={() => onOptionSelect(option.value)}
          >
            <FFText style={styles.optionText}>{option.text}</FFText>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  // Render quick replies
  const renderQuickReplies = (quickReplies: any[], messageId: string) => {
    return (
      <View style={styles.quickRepliesContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {quickReplies.map((reply, index) => (
            <TouchableOpacity
              key={`${messageId}_reply_${index}`}
              style={styles.quickReplyButton}
              onPress={() => onOptionSelect(reply.value)}
            >
              <FFText style={styles.quickReplyText}>{reply.text}</FFText>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    );
  };
  
  // Render form fields - fix parameter order (required params first)
  const renderFormFields = (formFields: ChatbotFormField[], messageId: string, followUpPrompt?: string) => {
    console.log("Rendering form fields:", formFields.length, "for message:", messageId);
    
    const handleSubmit = () => {
      // Check if we have any values to submit
      if (Object.keys(formValues).length === 0) {
        alert("Please fill at least one field");
        return;
      }
      
      // Format the response as JSON string
      const response = JSON.stringify(formValues);
      console.log("Submitting form values:", response);
      
      // Send the form data
      onOptionSelect(response);
      
      // Reset form values
      setFormValues({});
    };
    
    return (
      <View style={styles.formContainer}>
        {followUpPrompt && (
          <FFText style={styles.followUpPrompt}>{followUpPrompt}</FFText>
        )}
        
        {/* {formFields.map((field, index) => {
          // Handle text, number, and phone inputs
          if (field.type === 'text' || field.type === 'number' || field.type === 'phone') {
            return (
              <View key={`${messageId}_field_${index}`} style={styles.formField}>
                <FFText style={styles.formLabel}>
                  {field.label} {field.required && <FFText style={styles.requiredStar}>*</FFText>}
                </FFText>
                <TextInput
                  style={styles.formInput}
                  placeholder={`Enter ${field.label.toLowerCase()}`}
                  value={formValues[field.key] || 'FF_ORDER_fe5d838f-19d9-4944-9c78-47d6dedbae64'}
                  onChangeText={(text) => setFormValues({
                    ...formValues,
                    [field.key]: text
                  })}
                  keyboardType={field.type === 'number' || field.type === 'phone' ? 'phone-pad' : 'default'}
                />
              </View>
            );
          } 
          // Handle select inputs
          else if (field.type === 'select' && field.options) {
            return (
              <View key={`${messageId}_field_${index}`} style={styles.formField}>
                <FFText style={styles.formLabel}>
                  {field.label} {field.required && <FFText style={styles.requiredStar}>*</FFText>}
                </FFText>
                <View style={styles.selectOptionsContainer}>
                  {field.options.map((option, optIndex) => (
                    <TouchableOpacity
                      key={`${messageId}_field_${index}_option_${optIndex}`}
                      style={[
                        styles.selectOption,
                        formValues[field.key] === option.value && styles.selectedOption
                      ]}
                      onPress={() => setFormValues({
                        ...formValues,
                        [field.key]: option.value
                      })}
                    >
                      <FFText style={formValues[field.key] === option.value ? 
                        styles.selectedOptionText : styles.selectOptionText}>
                        {option.text}
                      </FFText>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            );
          } 
          // Handle date inputs
          else if (field.type === 'date') {
            return (
              <View key={`${messageId}_field_${index}`} style={styles.formField}>
                <FFText style={styles.formLabel}>
                  {field.label} {field.required && <FFText style={styles.requiredStar}>*</FFText>}
                </FFText>
                <TextInput
                  style={styles.formInput}
                  placeholder="YYYY-MM-DD"
                  value={formValues[field.key] || ''}
                  onChangeText={(text) => setFormValues({
                    ...formValues,
                    [field.key]: text
                  })}
                />
              </View>
            );
          }
          return null;
        })} */}
        
        {/* <TouchableOpacity
          style={styles.formSubmitButton}
          onPress={handleSubmit}
        >
          <FFText style={styles.formSubmitButtonText}>Submit</FFText>
        </TouchableOpacity> */}
      </View>
    );
  };
  
  // Update the condition to check for order details messages
  console.log("Rendering message content:", message.messageId, "type:", message.type, 
    "has chatbot data:", !!chatbotData,
    "has agent data:", !!agentData);

  // Force image type for agent messages with image messageType
  const isImageMessage = message.type === "IMAGE" || 
    (agentData && agentData.messageType === "image");

  // Check if this is an order details message that should be styled
  const isOrderDetailsMessage = 
    (chatbotData && 
     message.content.includes("Order #") && 
     message.content.includes("Status:") &&
     message.content.includes("Order total:")) ||
    message.metadata?.isOrderDetails === true;

  if (isOrderDetailsMessage) {
    console.log("Rendering order details message");
    const orderDetails = renderOrderDetails(message.content);
    if (orderDetails) {
      return orderDetails;
    }
  }
  
  if (isImageMessage) {
    console.log("Rendering image message:", message.content);
    
    // Create image component with error handling
    const imageComponent = (
      <View>
        {imageError ? (
          <View style={[styles.messageImage, styles.imageFallback]}>
            <Ionicons name="image-outline" size={40} color={colors.textSecondary} />
            <FFText style={styles.imageFallbackText}>Image failed to load</FFText>
          </View>
        ) : (
          <Image
            source={{ uri: message.content }}
            style={styles.messageImage}
            resizeMode="cover"
            onError={() => {
              console.log("Image failed to load:", message.content);
              setImageError(true);
            }}
          />
        )}
      </View>
    );
    
    // For agent messages with images, show agent name above the image
    if (agentData?.agentName) {
      return (
        <View>
          <FFText
            style={{
              fontSize: 12,
              fontWeight: '600',
              color: colors.primary,
              marginBottom: 4,
            }}
          >
            {agentData.agentName}
          </FFText>
          {imageComponent}
        </View>
      );
    }
    
    // Regular image message
    return imageComponent;
  } else if (message.type === "OPTIONS" && chatbotData?.options) {
    console.log("Rendering options message with options:", chatbotData.options);
    return (
      <View>
        <FFText
          style={{
            ...styles.messageText,
            ...(message.senderId === userId || message.from === userId
               ? styles.sentMessageText
               : styles.receivedMessageText),
          }}
        >
          {message.content}
        </FFText>
        {renderChatbotOptions(chatbotData.options, message.messageId)}
      </View>
    );
  } else if (chatbotData?.quickReplies && chatbotData.quickReplies.length > 0) {
    return (
      <View>
        <FFText
          style={{
            ...styles.messageText,
            ...(message.senderId === userId || message.from === userId
               ? styles.sentMessageText
               : styles.receivedMessageText),
          }}
        >
          {message.content}
        </FFText>
        {renderQuickReplies(chatbotData.quickReplies, message.messageId)}
      </View>
    );
  } else if ((chatbotData?.type === 'form' || message.type === "FORM") && chatbotData?.formFields) {
    console.log("Rendering form message with fields:", chatbotData.formFields);
    return (
      <View>
        <FFText
          style={{
            ...styles.messageText,
            ...(message.senderId === userId || message.from === userId
               ? styles.sentMessageText
               : styles.receivedMessageText),
          }}
        >
          {message.content}
        </FFText>
        {renderFormFields(
          chatbotData.formFields, 
          message.messageId,
          chatbotData.followUpPrompt
        )}
      </View>
    );
  } else if (agentData) {
    // Special styling for human agent messages
    return (
      <View>
        {/* Agent name if available */}
        {agentData.agentName && (
          <FFText
            style={{
              fontSize: 12,
              fontWeight: '600',
              color: colors.primary,
              marginBottom: 4,
            }}
          >
            {agentData.agentName}
          </FFText>
        )}
        <FFText
          style={{
            ...styles.messageText,
            ...(message.senderId === userId || message.from === userId
               ? styles.sentMessageText
               : styles.receivedMessageText),
          }}
        >
          {message.content}
        </FFText>
      </View>
    );
  } else {
    // Add this function to detect and render order details
    if (chatbotData) {
      // Check if this is an order details message
      if (chatbotData.message && chatbotData.message.includes("Order #") && chatbotData.message.includes("Status:")) {
        return (
          <View>
            {renderOrderDetails(message.content)}
          </View>
        );
      }
      
      // Regular chatbot message
      return (
        <FFText
          style={{
            ...styles.messageText,
            ...(message.senderId === userId || message.from === userId
               ? styles.sentMessageText
               : styles.receivedMessageText),
          }}
        >
          {message.content}
        </FFText>
      );
    } else {
      return (
        <FFText
          style={{
            ...styles.messageText,
            ...(message.senderId === userId || message.from === userId
               ? styles.sentMessageText
               : styles.receivedMessageText),
          }}
        >
          {message.content}
        </FFText>
      );
    }
  }
};

// Add a function to filter out duplicate messages
const filterDuplicateMessages = (messages: ChatMessage[]): ChatMessage[] => {
  if (!messages || messages.length === 0) return [];
  
  const uniqueMessages: ChatMessage[] = [];
  const seenMessages = new Map<string, boolean>();
  
  messages.forEach(msg => {
    // Create a unique key for agent messages based on content, sender and approximate timestamp
    // For non-agent messages, use the messageId as the key
    const isAgentMessage = msg.metadata?.agentMessage;
    const key = isAgentMessage 
      ? `${msg.senderId}_${msg.content}_${Math.floor(new Date(msg.timestamp).getTime() / 1000)}`
      : msg.messageId;
    
    if (!seenMessages.has(key)) {
      seenMessages.set(key, true);
      uniqueMessages.push(msg);
    } else {
      console.log("Filtered duplicate message:", msg.messageId, msg.content);
    }
  });
  
  return uniqueMessages;
};

const FChatScreen = () => {
  const navigation = useNavigation<FChatNavigationProp>();
  const route = useRoute<FChatRouteProp>();
  const [message, setMessage] = useState("");
  const scrollViewRef = useRef<ScrollView>(null);
  const dispatch = useDispatch();
  const flatListRef = useRef<FlatList>(null);
  
  // Keep track of whether we've had a valid session with dbRoomId
  const [hasHadValidSession, setHasHadValidSession] = useState(false);
  
  // Keep track of whether we've initiated the chat to prevent multiple calls
  const [hasInitiatedChat, setHasInitiatedChat] = useState(false);
  
  // Image queue state
  const [queuedImage, setQueuedImage] = useState<{
    uri: string;
    type: string;
    name: string;
    cloudUrl?: string;
  } | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const {
    socket,
    messages,
    roomId,
    currentSession,
    isRequestingSupport,
    requestError,
    isConnected,
    requestCustomerCare,
    startChatbotSession,
    startChat,
    sendMessage,
    getChatHistory,
    chatType,
    selectOption,
  } = useFChatSocket();

  const { user_id, id, accessToken } = useSelector(
    (state: RootState) => state.auth
  );

  // Initial state logic - check if we have essential chat data
  const hasEssentialChatData = roomId && currentSession;

  // Get the chat type from route params or default to SUPPORT
  const routeChatType = route.params?.type || "SUPPORT";
  const orderId = route.params?.orderId;
  const routeTitle = route.params?.title;
  
  // Get the order ID from the current session or route params
  const displayOrderId = currentSession?.orderId || orderId || "";

  // For CHATBOT, we don't need roomId to start chatting - we just need a valid session
  const hasChatbotSession = chatType === "CHATBOT" && currentSession?.supportSessionId;
  
  // Check if we have messages to display (prioritize server session messages)
  const hasMessages = messages && messages.length > 0;

  // Debug logging
  useEffect(() => {
    console.log("FChatScreen - Chat Type:", chatType);
    console.log("FChatScreen - Messages:", messages);
    console.log("FChatScreen - Current Session:", currentSession);
    console.log("FChatScreen - Room ID:", roomId);
    console.log("FChatScreen - Has Messages:", hasMessages);
    console.log("FChatScreen - Messages Length:", messages?.length || 0);
  }, [chatType, messages, currentSession, roomId, hasMessages]);

  // Cleanup on unmount to prevent conflicts
  useEffect(() => {
    return () => {
      // Reset the initiated chat flag when component unmounts
      setHasInitiatedChat(false);
    };
  }, []);

  // Start chat when component mounts (for existing chat flow) - ONLY ONCE
  useEffect(() => {
    if (hasInitiatedChat || !socket) return;
    
    if (route.params?.withUserId) {
      setHasInitiatedChat(true);
      startChat(
        route.params.withUserId,
        route.params.type || "SUPPORT",
        route.params.orderId
      );
    } else if (route.params?.type === "CHATBOT") {
      setHasInitiatedChat(true);
      startChatbotSession();
    }
  }, [socket, route.params?.withUserId, route.params?.type, route.params?.orderId, hasInitiatedChat, startChat, startChatbotSession]);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (scrollViewRef.current && hasMessages && messages.length > 0) {
      setTimeout(() => {
        if (scrollViewRef.current) {
          scrollViewRef.current.scrollToEnd({ animated: true });
        }
      }, 300);
    }
  }, [messages, hasMessages]);

  const handleSendMessage = () => {
    if (message.trim()) {
      sendMessage(message.trim());
      setMessage("");
    }
  };
  
  const handleOptionSelect = (value: string) => {
    console.log("Option selected:", value);
    selectOption(value);
  };
  
  const handleImagePick = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (!permissionResult.granted) {
        alert("You need to allow access to your photos to upload an image.");
        return;
      }
      
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });
      
      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        // Get file extension from URI
        const uriParts = asset.uri.split('.');
        const fileType = uriParts[uriParts.length - 1];
        
        setQueuedImage({
          uri: asset.uri,
          type: `image/${fileType}`,
          name: `photo.${fileType}`,
        });
        
        // Start upload immediately
        uploadImage(asset.uri);
      }
    } catch (error) {
      console.error("Error picking image:", error);
      alert("Failed to pick image. Please try again.");
    }
  };
  
  const uploadImage = async (imageUri: string) => {
    if (!imageUri) return;
    
    setIsUploadingImage(true);
    
    try {
      // Create form data for upload
      const formData = new FormData();
      
      // Get file extension from URI
      const uriParts = imageUri.split('.');
      const fileType = uriParts[uriParts.length - 1];
      
      // @ts-ignore
      formData.append('file', {
        uri: imageUri,
        type: `image/${fileType}`,
        name: `photo.${fileType}`,
      });
      
      // Upload to server
      const response = await axiosInstance.post('/upload/image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      console.log("response img upload", response.data);
      
      if (response.data.EC === 0 && response.data.data.url) {
        // Send the image URL in the chat
        sendMessage(response.data.data.url, "IMAGE");
        
        // Clear the queued image
        setQueuedImage(null);
      } else {
        throw new Error("Failed to get image URL from server");
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      alert("Failed to upload image. Please try again.");
    } finally {
      setIsUploadingImage(false);
    }
  };
  
  const removeQueuedImage = () => {
    setQueuedImage(null);
    setIsUploadingImage(false);
  };

  const formatTime = (timestamp: Date | string | number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Render customer care request UI if no essential chat data
  const renderCustomerCareRequest = () => {
    // Determine which type of chat to request based on route params
    const chatTypeToRequest = routeChatType || "SUPPORT";
    
    return (
      <View className="flex-1 justify-center items-center px-6 bg-gray-50">
        <View className="bg-white rounded-3xl p-8 shadow-lg w-full max-w-sm">
          {/* Icon */}
          <View className="items-center mb-6">
            <View className="bg-[#63c550] rounded-full p-4 mb-4">
              <Ionicons 
                name={chatTypeToRequest === "SUPPORT" ? "headset" : 
                      chatTypeToRequest === "CHATBOT" ? "chatbubbles-outline" : "chatbubbles"} 
                size={32} 
                color="white" 
              />
            </View>
            <Text className="text-2xl font-bold text-gray-800 text-center mb-2">
              {chatTypeToRequest === "SUPPORT" ? "Customer Support" : 
               chatTypeToRequest === "CHATBOT" ? "AI Assistant" :
               "Order Chat"}
            </Text>
            <Text className="text-gray-600 text-center leading-6">
              {chatTypeToRequest === "SUPPORT" 
                ? "Need help? Our customer care team is here to assist you with any questions or concerns."
                : chatTypeToRequest === "CHATBOT"
                ? "Get instant help from our AI assistant for common questions and issues."
                : `Connecting to chat for your order #${orderId || ""}`
              }
            </Text>
          </View>

          {/* Request Button */}
          {chatTypeToRequest === "SUPPORT" ? (
            <TouchableOpacity
              className={`bg-[#63c550] rounded-2xl py-4 px-6 items-center mb-4 ${
                isRequestingSupport ? "opacity-70" : ""
              }`}
              onPress={requestCustomerCare}
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
                  <Ionicons name="headset" size={20} color="white" />
                  <Text className="text-white font-semibold ml-2">
                    Request Customer Care Chat
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          ) : chatTypeToRequest === "CHATBOT" ? (
            <TouchableOpacity
              className={`bg-[#63c550] rounded-2xl py-4 px-6 items-center mb-4 ${
                isRequestingSupport ? "opacity-70" : ""
              }`}
              onPress={startChatbotSession}
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
                  <Ionicons name="chatbubbles-outline" size={20} color="white" />
                  <Text className="text-white font-semibold ml-2">
                    Chat with AI Assistant
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          ) : (
            <View className="flex-row items-center justify-center mb-4">
              <ActivityIndicator size="small" color="#63c550" style={{ marginRight: 8 }} />
              <Text className="text-gray-600">
                {isRequestingSupport ? "Connecting to chat..." : "Waiting for connection..."}
              </Text>
            </View>
          )}

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
  };

  // If no essential chat data and we have access token, show customer care request
  // Exception: CHATBOT type can work with just supportSessionId
  if (!hasEssentialChatData && !hasChatbotSession && accessToken) {
    return (
      <FFSafeAreaView>
        <FFScreenTopSection
          title={routeTitle || (
            chatType === "SUPPORT" ? "Support Chat" : 
            chatType === "CHATBOT" ? "AI Assistant" :
            `Order #${truncateString(orderId || "", 5)}`
          )}
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
          title={routeTitle || (
            chatType === "SUPPORT" ? "Support Chat" : 
            chatType === "CHATBOT" ? "AI Assistant" :
            `Order #${truncateString(displayOrderId, 5)}`
          )}
          titlePosition="left"
          navigation={navigation}
        />
        <View className="flex-row ml-auto gap-4 mt-2">
          {chatType === "SUPPORT" && (
            <>
              <TouchableOpacity>
                <Ionicons name="call" size={24} color="#63c550" />
              </TouchableOpacity>
              <TouchableOpacity>
                <Ionicons name="videocam" size={24} color="#63c550" />
              </TouchableOpacity>
            </>
          )}
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
          ref={scrollViewRef}
          className="flex-1 px-4"
          contentContainerStyle={{ paddingVertical: 20 }}
        >
          {!hasMessages ? (
            <View className="flex-1 items-center justify-center py-10">
              <Text className="text-gray-400">
                {chatType === "SUPPORT"
                  ? "Start a conversation with customer support"
                  : chatType === "CHATBOT"
                  ? "Ask our AI assistant a question"
                  : `Start a conversation about your order #${truncateString(displayOrderId, 5)}`}
              </Text>
            </View>
          ) : (
            filterDuplicateMessages(messages).map((msg) => (
              <View
                key={msg.messageId || `${msg.from}-${msg.timestamp}`}
                className={`flex-row ${
                  msg.from === id || msg.senderId === id ? "justify-end" : "justify-start"
                } mb-4`}
              >
                <View
                  className={`max-w-[80%] rounded-2xl p-3 ${
                    msg.from === id || msg.senderId === id
                      ? "bg-[#63c550] rounded-tr-none"
                      : "bg-gray-200 rounded-tl-none"
                  }`}
                >
                  <MessageContent 
                    message={msg} 
                    userId={id}
                    onOptionSelect={handleOptionSelect} 
                  />
                </View>
              </View>
            ))
          )}
        </ScrollView>
        
        {/* Queued Image Preview */}
        {queuedImage && (
          <View style={styles.queuedImageContainer}>
            <Image 
              source={{ uri: queuedImage.uri }} 
              style={styles.queuedImage} 
              resizeMode="cover"
            />
            {isUploadingImage ? (
              <View style={styles.uploadingOverlay}>
                <ActivityIndicator size="large" color="#ffffff" />
              </View>
            ) : (
              <TouchableOpacity 
                style={styles.removeImageButton}
                onPress={removeQueuedImage}
              >
                <Ionicons name="close-circle" size={24} color="#ff3b30" />
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Message Input */}
        <View className="p-4 border-t border-gray-200 bg-white flex-row items-center space-x-2">
          <TouchableOpacity onPress={handleImagePick}>
            <Ionicons name="image" size={24} color="gray" />
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

const styles = StyleSheet.create({
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  sentMessageText: {
    color: 'white',
  },
  receivedMessageText: {
    color: 'black',
  },
  messageImage: {
    width: 200,
    height: 150,
    borderRadius: 10,
  },
  imageFallback: {
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageFallbackText: {
    color: '#999',
    fontSize: 12,
    marginTop: 4,
  },
  optionsContainer: {
    marginTop: 8,
    gap: 8,
  },
  optionButton: {
    backgroundColor: '#f0f0f0',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  optionText: {
    color: '#333',
    fontWeight: '500',
  },
  quickRepliesContainer: {
    marginTop: 8,
  },
  quickReplyButton: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    marginRight: 8,
  },
  quickReplyText: {
    color: '#333',
  },
  queuedImageContainer: {
    position: 'relative',
    margin: 8,
    borderRadius: 8,
    overflow: 'hidden',
    height: 100,
  },
  queuedImage: {
    width: '100%',
    height: '100%',
  },
  uploadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeImageButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'white',
    borderRadius: 12,
  },
  // Form styles
  formContainer: {
    marginTop: 12,
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
    padding: 12,
  },
  followUpPrompt: {
    fontSize: 14,
    color: '#555',
    marginBottom: 12,
    fontStyle: 'italic',
  },
  formField: {
    marginBottom: 16,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 6,
    color: '#444',
  },
  requiredStar: {
    color: '#ff3b30',
  },
  formInput: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
  },
  selectOptionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  selectOption: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginRight: 8,
    marginBottom: 8,
  },
  selectedOption: {
    backgroundColor: '#63c550',
    borderColor: '#63c550',
  },
  selectOptionText: {
    color: '#333',
  },
  selectedOptionText: {
    color: 'white',
    fontWeight: '500',
  },
  formSubmitButton: {
    backgroundColor: '#63c550',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  formSubmitButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  // Order details styles
  orderDetailsCard: {
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
    padding: 12,
    marginTop: 4,
    borderLeftWidth: 4,
    borderLeftColor: '#63c550',
  },
  orderHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  orderIdContainer: {
    flexDirection: 'column',
  },
  orderIdLabel: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  orderId: {
    fontSize: 14,
    fontWeight: '600',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  inTransitBadge: {
    backgroundColor: '#ffb74d20',
    borderWidth: 1,
    borderColor: '#ffb74d',
  },
  deliveredBadge: {
    backgroundColor: '#4caf5020',
    borderWidth: 1,
    borderColor: '#4caf50',
  },
  preparingBadge: {
    backgroundColor: '#2196f320',
    borderWidth: 1,
    borderColor: '#2196f3',
  },
  defaultBadge: {
    backgroundColor: '#9e9e9e20',
    borderWidth: 1,
    borderColor: '#9e9e9e',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
  },
  orderDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  orderDetailLabel: {
    fontSize: 14,
    color: '#666',
    marginLeft: 6,
    marginRight: 4,
  },
  orderDetailValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  orderTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  orderTotalLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  orderTotalValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#63c550',
  },
});

export default FChatScreen;