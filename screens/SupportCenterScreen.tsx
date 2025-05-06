import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  Linking,
} from "react-native";
import React, { useEffect, useState } from "react";
import FFSafeAreaView from "@/src/components/FFSafeAreaView";
import FFScreenTopSection from "@/src/components/FFScreenTopSection";
import { StackNavigationProp } from "@react-navigation/stack";
import { MainStackParamList } from "@/src/navigation/AppNavigator";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import FFText from "@/src/components/FFText";
import axiosInstance from "@/src/utils/axiosConfig";
import FFSkeleton from "@/src/components/FFSkeleton";
import { spacing } from "@/src/theme";
import FFView from "@/src/components/FFView";
import { useTheme } from "@/src/hooks/useTheme";
import { OrderTracking } from "@/src/types/screens/Order";
import { useSelector } from "@/src/store/types";
import { RootState } from "@/src/store/store";

type SupportCenterNavigationProp = StackNavigationProp<
  MainStackParamList,
  "BottomTabs"
>;

export enum FAQType {
  GENERAL = "GENERAL",
  ACCOUNT = "ACCOUNT",
  PAYMENT = "PAYMENT",
  SERVICE = "SERVICE",
}

type FAQContentBlock =
  | { type: "text"; value: string }
  | { type: "image"; value: { url: string; key: string } }
  | { type: "image_row"; value: { url: string; key: string }[] };

type FAQ = {
  id: string;
  question: string;
  answer: FAQContentBlock[];
  status: string;
  type: FAQType;
  created_at: string;
  updated_at: string | null;
};

const SupportCenterScreen = () => {
  const navigation = useNavigation<SupportCenterNavigationProp>();
  const [activeTab, setActiveTab] = useState<"FAQ" | "Contact Us">("FAQ");
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [isLoadingFAQ, setIsLoadingFAQ] = useState(false);
  const { theme } = useTheme();
  const [orders, setOrders] = useState<OrderTracking[]>([]);
  const [loading, setLoading] = useState(true);
  const { id } = useSelector((state: RootState) => state.auth);

  const fetchFAQs = async () => {
    setIsLoadingFAQ(true);
    try {
      const response = await axiosInstance.get("/faqs");
      const { EC, EM, data } = response.data;
      if (EC === 0) {
        setFaqs(data);
        console.log("FAQs fetched:", data);
      } else {
        console.log("Error fetching FAQs:", EM);
      }
    } catch (error) {
      console.log("Fetch FAQs error:", error);
    } finally {
      setIsLoadingFAQ(false);
    }
  };

  const handleFilterFAQ = async (type: FAQType) => {
    setIsLoadingFAQ(true);
    try {
      const response = await axiosInstance.get(`/faqs/type/${type}`);
      const { EC, EM, data } = response.data;
      if (EC === 0) {
        setFaqs(data);
        console.log(`FAQs of type ${type} fetched:`, data);
      } else {
        console.log("Error fetching FAQs:", EM);
      }
    } catch (error) {
      console.log(`Fetch FAQs of type ${type} error:`, error);
    } finally {
      setIsLoadingFAQ(false);
    }
  };

  useEffect(() => {
    fetchFAQs();
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [id]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get(`/customers/orders/${id}`);
      const allOrders = res.data.data;
      const lastThreeOrders = allOrders.slice(-Math.max(3, allOrders.length));
      setOrders(lastThreeOrders);
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };
  console.log("check orders", orders[0]?.order_items?.[0]?.menu_item?.avatar);

  const contactOptions = [
    {
      title: "Chat with customer care representative",
      icon: "headset",
      onPress: () => navigation.navigate("FChat", { type: "SUPPORT" }),
    },
    {
      title: "Submit a Request",
      icon: "document-text-outline",
      onPress: () => navigation.navigate("CreateInquiry"),
    },
    { title: "WhatsApp", icon: "logo-whatsapp" },
    { title: "Website", icon: "globe" },
    { title: "Facebook", icon: "logo-facebook" },
    { title: "Twitter", icon: "logo-twitter" },
    { title: "Instagram", icon: "logo-instagram" },
  ];

  const FAQSection = () => (
    <ScrollView className="px-4">
      {faqs.map((item, index) => (
        <TouchableOpacity key={index} className="border-b py-4">
          <View className="flex-row justify-between items-center">
            <FFText className="text-base font-medium flex-1">
              {item.question}
            </FFText>
            <Ionicons name="chevron-down" size={20} color="black" />
          </View>
          {item.answer[0] &&
            (isLoadingFAQ ? (
              <View style={{ gap: 12 }}>
                <FFSkeleton height={80} />
                <FFSkeleton height={80} />
                <FFSkeleton height={80} />
              </View>
            ) : (
              <>
                {item.answer[0].type === "text" && (
                  <FFText
                    colorLight="#aaa"
                    colorDark="#ddd"
                    fontSize="sm"
                    style={{ marginTop: spacing.sm }}
                  >
                    {item.answer[0].value.replace(/\[(.*?)\]\((.*?)\)/g, "$1")}
                    {item.answer[0].value.includes("http") && (
                      <Text
                        className="text-blue-500 underline"
                        onPress={() => {
                          const url =
                            item.answer[0].value.match(/\((.*?)\)/)?.[1];
                          if (url) Linking.openURL(url);
                        }}
                      >
                        {" (View more)"}
                      </Text>
                    )}
                  </FFText>
                )}
              </>
            ))}
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  const ContactSection = () => (
    <ScrollView className="px-4">
      {contactOptions.map((option, index) => (
        <TouchableOpacity
          key={index}
          onPress={option.onPress}
          className="flex-row items-center py-4 border-b border-gray-200"
        >
          <Ionicons
            name={option.icon as any}
            size={24}
            color="black"
            style={{ color: theme === "light" ? "#222" : "#ddd" }}
          />
          <FFText fontSize="sm" style={{ marginLeft: spacing.sm }}>
            {option.title}
          </FFText>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  return (
    <FFSafeAreaView className="">
      <FFScreenTopSection title="Support Center" navigation={navigation} />

      <View className="flex-1">
        {/* Tab Buttons */}
        <View className="flex-row border-b border-gray-200">
          <TouchableOpacity
            className={`flex-1 py-3 ${
              activeTab === "FAQ" ? "border-b-2 border-black" : ""
            }`}
            onPress={() => setActiveTab("FAQ")}
          >
            <FFText style={{ textAlign: "center" }}>FAQ</FFText>
          </TouchableOpacity>
          <TouchableOpacity
            className={`flex-1 py-3 ${
              activeTab === "Contact Us" ? "border-b-2 border-black" : ""
            }`}
            onPress={() => setActiveTab("Contact Us")}
          >
            <FFText style={{ textAlign: "center" }}>Contact Us</FFText>
          </TouchableOpacity>
        </View>

        <View className="flex-[1]">
          {/* Category Pills */}
          {activeTab === "FAQ" && (
            <View
              // horizontal
              // showsHorizontalScrollIndicator={false}
              className="py-3"
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                padding: spacing.md,
              }}
            >
              {[
                { value: FAQType.GENERAL, label: "General" },
                { value: FAQType.ACCOUNT, label: "Account" },
                { value: FAQType.PAYMENT, label: "Payment" },
                { value: FAQType.SERVICE, label: "Service" },
              ].map((category, index) => (
                <FFView
                  onPress={() => handleFilterFAQ(category.value)}
                  key={index}
                  style={{
                    elevation: 3,
                    paddingHorizontal: spacing.md,
                    paddingVertical: spacing.sm,
                    // margin: spacing.sm,
                    alignItems: "center",
                    justifyContent: "center",
                    // width: '100%',
                    height: spacing.xl,
                    borderRadius: 9999,
                  }}
                  // className="px-4 py-1 mx-2  items-center justify-center rounded-full"
                >
                  <FFText fontSize="sm">{category.label}</FFText>
                </FFView>
              ))}
            </View>
          )}

          {/* Content Section */}
          <View className="">
            {activeTab === "FAQ" ? <FAQSection /> : <ContactSection />}
          </View>
        </View>
      </View>
    </FFSafeAreaView>
  );
};

export default SupportCenterScreen;
