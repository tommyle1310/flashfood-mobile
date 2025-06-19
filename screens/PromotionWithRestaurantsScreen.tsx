import {
  View,
  Image,
  FlatList,
  TouchableOpacity,
  Pressable,
  Text,
} from "react-native";
import React, { useState } from "react";
import FFSafeAreaView from "@/src/components/FFSafeAreaView";
import FFScreenTopSection from "@/src/components/FFScreenTopSection";
import FFText from "@/src/components/FFText";
import FFView from "@/src/components/FFView";
import IconAntDesign from "react-native-vector-icons/AntDesign";
import IconFeather from "react-native-vector-icons/Feather";
import { MainStackParamList } from "@/src/navigation/AppNavigator";
import { StackNavigationProp } from "@react-navigation/stack";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { IMAGE_LINKS } from "@/src/assets/imageLinks";
import { colors, spacing } from "@/src/theme";
import FFModal from "@/src/components/FFModal";

type PromotionWithRestaurantsSreenNavigationProp = StackNavigationProp<
  MainStackParamList,
  "PromotionsWithRestaurant"
>;

type RestaurantDetailRouteProp = RouteProp<
  MainStackParamList,
  "PromotionsWithRestaurant"
>;

// Helper function to get rating badge color
const getRatingBadgeColor = (rating: number | undefined) => {
  if (!rating) return "rgba(107, 114, 128, 0.7)"; // Gray for no rating
  if (rating >= 4.5) return "rgba(22, 163, 74, 0.7)"; // Green for excellent
  if (rating >= 4.0) return "rgba(234, 179, 8, 0.7)"; // Yellow for good
  if (rating >= 3.0) return "rgba(249, 115, 22, 0.7)"; // Orange for average
  return "rgba(220, 38, 38, 0.7)"; // Red for poor
};

// Helper function to get rating icon
const getRatingIcon = (rating: number | undefined) => {
  if (!rating) return "star";
  if (rating >= 4.5) return "star";
  if (rating >= 4.0) return "star";
  if (rating >= 3.0) return "star";
  return "frown";
};

// Helper function to format distance
const formatDistance = (distance: number | undefined) => {
  if (distance === undefined || distance === null) {
    return "Nearby";
  }
  return `${distance.toFixed(1)} km`;
};

// Helper function to format address
const formatAddress = (address: any) => {
  if (!address) return "Address not available";
  
  const parts = [];
  if (address.street) parts.push(address.street);
  if (address.city) parts.push(address.city);
  if (address.state) parts.push(address.state);
  if (address.nationality) parts.push(address.nationality);
  
  
  return parts.join(", ");
};

const PromotionWithRestaurantsScreen = () => {
  const navigation =
    useNavigation<PromotionWithRestaurantsSreenNavigationProp>();
  const route = useRoute<RestaurantDetailRouteProp>();
  const { restaurants: restaurantList, promotionTitle } = route.params;
  const [selectedAddress, setSelectedAddress] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const renderRestaurantItem = ({
    item,
  }: {
    item: (typeof restaurantList)[0];
  }) => (
    <FFView
      onPress={() =>
        navigation.navigate("RestaurantDetail", { restaurantId: item.id })
      }
      colorDark={"#444"}
      style={{
        marginBottom: spacing.md,
        borderRadius: 12,
        padding: spacing.md,
        gap: 12,
        elevation: 4,
      }}
    >
      {/* Restaurant Image and Rating */}
      <View style={{ position: 'relative' }}>
        <Image
          source={{ uri: item?.avatar?.url ?? IMAGE_LINKS.DEFAULT_AVATAR_FOOD }}
          style={{
            width: "100%",
            height: 160,
            borderRadius: 8,
          }}
          resizeMode="cover"
        />
        
        {/* Rating Badge */}
        <View
          style={{
            position: "absolute",
            bottom: spacing.sm,
            left: spacing.sm,
            backgroundColor: getRatingBadgeColor(item.avg_rating),
            paddingHorizontal: spacing.sm,
            paddingVertical: 4,
            borderRadius: 12,
            flexDirection: "row",
            alignItems: "center"
          }}
        >
          <IconAntDesign 
            name={getRatingIcon(item.avg_rating)} 
            color={item.avg_rating && item.avg_rating >= 3 ? "#fbbf24" : "#ffffff"} 
            size={14} 
          />
          <FFText
            style={{
              fontSize: 14,
              fontWeight: "700",
              color: "#ffffff",
              marginLeft: 4,
            }}
          >
            {item.avg_rating ? item.avg_rating.toFixed(1) : "New"}
          </FFText>
        </View>
      </View>

      {/* Restaurant Details */}
      <View style={{ width: "100%" }}>
        <View style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: spacing.xs,
        }}>
          <FFText style={{ fontWeight: "600", fontSize: 18 }}>
            {item?.restaurant_name}
          </FFText>
          <TouchableOpacity>
            <IconAntDesign name="hearto" size={20} color="#3FB854" />
          </TouchableOpacity>
        </View>
        
        <View style={{ marginBottom: spacing.xs }}>
          <FFText colorDark="#888" colorLight="#aaa" style={{ fontSize: 14 }}>
            {item?.specialize_in?.map(cat => cat.name).join(", ") || "Various Cuisines"}
          </FFText>
        </View>
        
        {/* Additional Info Row */}
        <View style={{ 
          flexDirection: "row", 
          alignItems: "center",
          marginTop: spacing.xs,
          gap: spacing.md
        }}>
          {/* Distance */}
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <IconFeather name="map-pin" size={14} color="#9ca3af" style={{ marginRight: 4 }} />
            <FFText style={{ fontSize: 14, color: "#6b7280" }}>
              {formatDistance(item.distance)}
            </FFText>
          </View>
          
          {/* Estimated Time */}
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <IconFeather name="clock" size={14} color="#9ca3af" style={{ marginRight: 4 }} />
            <FFText style={{ fontSize: 14, color: "#6b7280" }}>
              {item.estimated_time ? `${item.estimated_time} min` : "20-30 min"}
            </FFText>
          </View>
          
          {/* Address Info Button */}
          <TouchableOpacity 
            style={{ 
              marginLeft: "auto",
              flexDirection: "row", 
              alignItems: "center", 
              backgroundColor: "#f3f4f6",
              paddingHorizontal: 8,
              paddingVertical: 4,
              borderRadius: 12
            }}
            onPress={() => {
              setSelectedAddress(formatAddress(item?.address));
              setModalVisible(true);
            }}
          >
            <IconFeather name="info" size={14} color="#4b5563" style={{ marginRight: 4 }} />
            <FFText style={{ fontSize: 14, color: "#4b5563" }}>
              Address
            </FFText>
          </TouchableOpacity>
        </View>
      </View>
    </FFView>
  );

  return (
    <FFSafeAreaView>
      <FFScreenTopSection
        navigation={navigation}
        title={promotionTitle ?? ""}
      />
      <FlatList
        data={restaurantList}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderRestaurantItem}
        contentContainerStyle={{ padding: spacing.md }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={{
            padding: spacing.xl,
            alignItems: "center",
            justifyContent: "center"
          }}>
            <IconFeather name="coffee" size={50} color="#9ca3af" />
            <FFText style={{ 
              color: "#9ca3af", 
              fontWeight: "500", 
              fontSize: 16,
              marginTop: spacing.md 
            }}>
              This promotion has not been applied to any restaurant
            </FFText>
          </View>
        }
      />
      
      {/* Address Modal */}
      <FFModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
      >
        <View style={{ padding: spacing.md }}>
          <FFText style={{ fontSize: 18, fontWeight: "600", marginBottom: spacing.md }}>
            Restaurant Address
          </FFText>
          <FFText style={{ fontSize: 16, lineHeight: 24 }}>
            {selectedAddress}
          </FFText>
        </View>
      </FFModal>
    </FFSafeAreaView>
  );
};

export default PromotionWithRestaurantsScreen;
