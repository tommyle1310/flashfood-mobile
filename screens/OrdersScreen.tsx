import { View, Image, ScrollView, TouchableOpacity, Text } from "react-native";
import React, { useEffect, useState } from "react";
import FFSafeAreaView from "@/src/components/FFSafeAreaView";
import FFText from "@/src/components/FFText";
import { RootState } from "@/src/store/store";
import { useSelector } from "@/src/store/types";
import axiosInstance from "@/src/utils/axiosConfig";
import { OrderTracking } from "@/src/types/screens/Order";
import FFProgressStage from "@/src/components/FFProgressStage";
import FFView from "@/src/components/FFView";
import FFInputControl from "@/src/components/FFInputControl";
import FFAvatar from "@/src/components/FFAvatar";
import IconFeather from "react-native-vector-icons/Feather";
import FFBadge from "@/src/components/FFBadge";
import FFSeperator from "@/src/components/FFSeperator";

const OrdersScreen = () => {
  const [isExpandedOrderItem, setIsExpandedOrderItem] = useState(false);
  const { id } = useSelector((state: RootState) => state.auth);
  const [orders, setOrders] = useState<OrderTracking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const res = await axiosInstance.get(`/customers/orders/${id}`);
        setOrders(res.data.data);
      } catch (error) {
        console.error("Error fetching orders:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [id]);

  console.log(
    "check orders finished",
    orders.filter((order) => order.status === "DELIVERED")
  );
  console.log(
    "check orders in progress",
    orders.filter(
      (order) => order.status !== "DELIVERED" && order.status !== "CANCELLED"
    )
  );

  // Ví dụ: Hiển thị ảnh dưới thanh tiến trình
  return (
    <FFSafeAreaView>
      <ScrollView>
        <View
          style={{ marginBottom: 200 }}
          className="flex flex-col gap-4 p-4 flex-1 w-full items-center"
        >
          <View className="w-full p-4">
            <FFProgressStage
              stageText="Arriving at 10:15"
              completedSegments={3}
              totalSegments={5}
            />
          </View>
          <Image
            source={{
              uri: "https://res.cloudinary.com/dlavqnrlx/image/upload/v1741408785/pui7asaniy2uw4htsymp.png",
            }}
            style={{
              width: "100%",
              height: 200,
              borderRadius: 12,
              resizeMode: "cover",
            }}
          />

          <FFView
            style={{
              width: "100%",
              padding: 12,
              borderRadius: 12,
              gap: 20,
              elevation: 3,
            }}
          >
            <View className="flex flex-row gap-2 items-center">
              <View className="relative">
                <FFAvatar size={50} />
                <View className="absolute -bottom-2 left-3 p-1 rounded-lg bg-[#56a943]">
                  <FFText
                    fontSize="sm"
                    fontWeight="400"
                    style={{ color: "#fff" }}
                  >
                    4.8
                  </FFText>
                </View>
              </View>
              <View>
                <View className="flex-row items-center gap-2">
                  <FFText style={{ color: "#4c9f3a" }}>Tommanal</FFText>
                  <FFText fontSize="sm" style={{ marginTop: 2 }}>
                    59D2 - 99421
                  </FFText>
                </View>
                <FFText fontWeight="400" fontSize="sm">
                  White Winner X
                </FFText>
              </View>
            </View>
            <View className="flex flex-row gap-2 items-center">
              <TouchableOpacity
                style={{
                  width: 50,
                  height: 50,
                  backgroundColor: "#ddd",
                  borderRadius: 9999,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <IconFeather name="phone" size={20} color="#222" />
              </TouchableOpacity>
              <TouchableOpacity className="flex flex-row bg-gray-200 p-4 rounded-full flex-1">
                <Text>Send a Message</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={{
                  paddingHorizontal: 12,
                  height: 50,
                  backgroundColor: "#ddd",
                  borderRadius: 24,
                  alignItems: "center",
                  justifyContent: "center",
                  flexDirection: "row",
                  gap: 4,
                }}
              >
                <IconFeather name="plus" size={20} color="#222" />
                <Text>Tips</Text>
              </TouchableOpacity>
            </View>
          </FFView>
          <FFView
            style={{
              width: "100%",
              padding: 12,
              borderRadius: 12,
              gap: 4,
              elevation: 3,
            }}
          >
            <FFText fontSize="lg">Delivery details</FFText>
            <FFInputControl label="My address" value={"102 PVH"} readonly />
            <FFInputControl label="Total distance" value={"10km"} readonly />
            <FFInputControl
              label="Order time"
              value={"10:15 08/03/2025"}
              readonly
            />
            <FFSeperator />
            <FFInputControl
              label="My Note"
              value={"Give me lots of pig fat"}
              readonly
            />
          </FFView>
          <FFView
            style={{
              width: "100%",
              padding: 12,
              borderRadius: 12,
              gap: 4,
              elevation: 3,
            }}
          >
            <View className="flex flex-row justify-between items-center">
              <FFText fontSize="lg">Order summary</FFText>
              <TouchableOpacity onPress={() => {}}>
                <FFText style={{ color: "#7dbf72" }} fontSize="sm">
                  View Receipt
                </FFText>
              </TouchableOpacity>
            </View>
            <FFText fontWeight="400" style={{ color: "#aaa" }}>
              Tommyummy, 102 PVH...
            </FFText>
            <View className="flex-row gap-2 my-4">
              <FFAvatar rounded="sm" size={40} />
              <View className="flex-1">
                <FFText style={{ color: "#aaa" }}>Crispy dog</FFText>
                <FFText
                  fontWeight="400"
                  fontSize="sm"
                  style={{ color: "#aaa" }}
                >
                  x3
                </FFText>
              </View>
              <TouchableOpacity
                onPress={() => {}}
                className="flex-row items-center justify-between"
              >
                <FFText fontWeight="400" fontSize="sm">
                  Show More
                </FFText>
                <IconFeather
                  size={20}
                  name={isExpandedOrderItem ? "chevron-up" : "chevron-down"}
                />
              </TouchableOpacity>
            </View>
            <FFSeperator />
            <View className="flex flex-row justify-between items-center">
              <FFText fontWeight="400" style={{ color: "#aaa" }}>
                Total
              </FFText>
              <FFText style={{ color: "#4c9f3a" }}>$100</FFText>
            </View>
          </FFView>
        </View>
      </ScrollView>
    </FFSafeAreaView>
  );
};

export default OrdersScreen;
