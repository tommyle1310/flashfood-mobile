import React from "react";
import {
  View,
  TouchableOpacity,
  ScrollView,
  ImageBackground,
  Pressable,
  Text,
  StyleSheet,
  Dimensions,
  Platform,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { MainStackParamList } from "@/src/navigation/AppNavigator";
import IconAntDesign from "react-native-vector-icons/AntDesign";
import IconFeather from "react-native-vector-icons/Feather";
import FFText from "@/src/components/FFText";
import FFView from "@/src/components/FFView";
import FFSkeleton from "@/src/components/FFSkeleton";
import { IMAGE_LINKS } from "@/src/assets/imageLinks";
import colors from "@/src/theme/colors";
import {
  AvailablePromotionWithRestaurants,
  FavoriteRestaurant,
} from "@/src/types/screens/Home";
import { borderRadius, spacing, typography } from "@/src/theme";

const { width } = Dimensions.get("window");
const CARD_WIDTH = width * 0.8;

type HomeRestaurantSreenNavigationProp = StackNavigationProp<
  MainStackParamList,
  "BottomTabs"
>;

interface PromotionsSectionProps {
  promotions: AvailablePromotionWithRestaurants[] | null;
  favoriteRestaurants: FavoriteRestaurant[];
  handleToggleFavorite: (restaurantId: string) => void;
  isLoading: boolean;
  onTap?: (id: string) => void;
}

// Helper function to get rating badge color
const getRatingBadgeColor = (rating: number | undefined) => {
  if (!rating) return "rgba(107, 114, 128, 0.6)"; // Gray for no rating
  if (rating >= 4.5) return "rgba(22, 163, 74, 0.6)"; // Green for excellent
  if (rating >= 4.0) return "rgba(234, 179, 8, 0.6)"; // Yellow for good
  if (rating >= 3.0) return "rgba(249, 115, 22, 0.6)"; // Orange for average
  return "rgba(220, 38, 38, 0.6)"; // Red for poor
};

// Helper function to format distance
const formatDistance = (distance: number | undefined) => {
  if (distance === undefined || distance === null) {
    return "Nearby";
  }
  return `${distance.toFixed(1)} km`;
};

export const PromotionsSection = ({
  promotions,
  onTap,
  favoriteRestaurants,
  handleToggleFavorite,
  isLoading,
}: PromotionsSectionProps) => {
  const navigation = useNavigation<HomeRestaurantSreenNavigationProp>();

  // Generate dynamic gradient colors for each promotion
  const getPromotionColors = (index: number) => {
    const colorPairs = [
      { primary: "#FF5F6D", secondary: "#FFC371", text: "#7F1D1D" },
      { primary: "#4158D0", secondary: "#C850C0", text: "#1E3A8A" },
      { primary: "#0BAB64", secondary: "#3BB78F", text: "#064E3B" },
      { primary: "#6441A5", secondary: "#2A0845", text: "#F5F3FF" },
      { primary: "#F43B47", secondary: "#453A94", text: "#FEF2F2" },
    ];
    return colorPairs[index % colorPairs.length];
  };

  return (
    <View style={styles.container}>
      {/* Section Header */}
      <View style={styles.sectionHeader}>
        <FFText style={styles.sectionTitle} fontSize="lg">
          🔥 Hot Promotions
        </FFText>
        <TouchableOpacity
          style={styles.viewAllHeaderButton}
        >
          <FFText style={styles.viewAllHeaderText}>View All</FFText>
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <FFSkeleton width={CARD_WIDTH} height={180} style={styles.skeleton} />
        </View>
      ) : (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          decelerationRate="fast"
          snapToInterval={CARD_WIDTH + spacing.md}
          snapToAlignment="center"
        >
          {promotions?.map((promotion, i) => {
            const colors = getPromotionColors(i);
            
            return (
              <TouchableOpacity 
                key={promotion.id} 
                style={styles.promotionCard}
                onPress={() => onTap && onTap(promotion.id)}
              >
                {/* Promotion Banner */}
                <View style={[
                  styles.promotionBanner,
                  {backgroundColor: `${colors.primary}15`}
                ]}>
                  <View style={styles.promotionInfo}>
                    <View style={[
                      styles.iconBadge,
                      {backgroundColor: colors.primary}
                    ]}>
                      {i % 5 === 0 && <IconFeather name="zap" size={16} color="#fff" />}
                      {i % 5 === 1 && <IconFeather name="tag" size={16} color="#fff" />}
                      {i % 5 === 2 && <IconFeather name="gift" size={16} color="#fff" />}
                      {i % 5 === 3 && <IconFeather name="star" size={16} color="#fff" />}
                      {i % 5 === 4 && <IconFeather name="award" size={16} color="#fff" />}
                    </View>
                    <View>
                      <FFText style={styles.promotionName}>
                        {promotion.title}
                      </FFText>
                      <View style={styles.discountContainer}>
                        <FFText 
                          style={{
                            ...styles.discountText,
                            color: colors.primary
                          }}
                        >
                          {promotion.discount_type === "PERCENTAGE"
                            ? `${Number(promotion.discount_value).toFixed(0)}% OFF`
                            : `$${Number(promotion.discount_value)} OFF`}
                        </FFText>
                      </View>
                    </View>
                  </View>
                </View>

                {/* Restaurant Cards */}
                {promotion.restaurants.length > 0 ? (
                  <View style={styles.restaurantsContainer}>
                    {promotion.restaurants.slice(0, Math.min(3, promotion.restaurants.length)).map((item, index) => (
                      <FFView
                        key={item.id}
                        style={{
                          ...styles.restaurantItem,
                          ...(index === promotion.restaurants.length - 1 ? { borderBottomWidth: 0 } : {})
                        }}
                        onPress={() =>
                          navigation.navigate("RestaurantDetail", {
                            restaurantId: item.id,
                          })
                        }
                      >
                        {/* Restaurant Image */}
                        <View style={styles.restaurantImageContainer}>
                          <ImageBackground
                            source={{
                              uri: item?.avatar?.url ?? IMAGE_LINKS.DEFAULT_AVATAR_FOOD,
                            }}
                            style={styles.restaurantImage}
                            imageStyle={styles.restaurantImageStyle}
                          />
                          <View style={[
                            styles.ratingBadge,
                            {backgroundColor: getRatingBadgeColor(item.avg_rating)}
                          ]}>
                            <IconAntDesign 
                              name={item.avg_rating && item.avg_rating >= 3 ? "star" : "frown"} 
                              size={10} 
                              color={item.avg_rating && item.avg_rating >= 3 ? "#fbbf24" : "#ffffff"} 
                            />
                            <Text style={styles.ratingText}>
                              {item.avg_rating ? item.avg_rating.toFixed(1) : "New"}
                            </Text>
                          </View>
                        </View>

                        {/* Restaurant Info */}
                        <View style={styles.restaurantInfo}>
                          <Text style={styles.restaurantName} numberOfLines={1}>
                            {item.restaurant_name}
                          </Text>
                          
                          <View style={styles.restaurantMeta}>
                            <View style={styles.metaItem}>
                              <IconFeather name="map-pin" size={10} color="#9ca3af" />
                              <Text style={styles.metaText} numberOfLines={1}>
                                {item?.address?.street || "Location not available"}
                              </Text>
                            </View>
                            
                            <View style={styles.deliveryInfo}>
                              <Text style={styles.deliveryText}>
                                {formatDistance(item.distance)}
                              </Text>
                              <View style={styles.dot} />
                              <Text style={styles.deliveryText}>
                                {item.estimated_time ? `${item.estimated_time} min` : "20-30 min"}
                              </Text>
                            </View>
                          </View>
                        </View>

                        {/* Discount Badge */}
                        <View style={[
                          styles.restaurantDiscountBadge,
                          {backgroundColor: colors.primary}
                        ]}>
                          <Text style={styles.restaurantDiscountText}>
                            {promotion.discount_type === "PERCENTAGE"
                              ? `${Number(promotion.discount_value).toFixed(0)}%`
                              : `$${Number(promotion.discount_value)}`}
                          </Text>
                        </View>
                      </FFView>
                    ))}
                    
                    {/* View More Button */}
                    {promotion.restaurants.length > 3 && (
                      <TouchableOpacity 
                        style={styles.viewMoreButton}
                        onPress={() => onTap && onTap(promotion.id)}
                      >
                        <FFText style={styles.viewMoreText}>
                          View {promotion.restaurants.length - 3} more restaurants
                        </FFText>
                        <IconFeather name="chevron-right" size={16} color={colors.primary} />
                      </TouchableOpacity>
                    )}
                  </View>
                ) : (
                  <View style={styles.emptyContainer}>
                    <IconFeather name="coffee" size={24} color="#9ca3af" />
                    <FFText style={styles.emptyText}>
                      No restaurants available
                    </FFText>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.lg,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontWeight: "700",
    color: "#1f2937",
  },
  viewAllHeaderButton: {
    backgroundColor: "#f0fdf4",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#bbf7d0",
  },
  viewAllHeaderText: {
    color: "#16a34a",
    fontWeight: "600",
    fontSize: 13,
  },
  loadingContainer: {
    paddingHorizontal: spacing.md,
    alignItems: "center",
  },
  skeleton: {
    borderRadius: 16,
    marginBottom: spacing.md,
  },
  scrollContent: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
    gap: spacing.md,
  },
  promotionCard: {
    width: CARD_WIDTH,
    backgroundColor: "#ffffff",
    borderRadius: 16,
    overflow: "hidden",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  promotionBanner: {
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  promotionInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconBadge: {
    width: 32,
    height: 32,
    borderRadius: spacing.md,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.sm,
  },
  promotionName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1f2937",
    marginBottom: 2,
  },
  discountContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  discountText: {
    fontSize: 14,
    fontWeight: "700",
  },
  restaurantsContainer: {
    backgroundColor: "#ffffff",
  },
  restaurantItem: {
    flexDirection: "row",
    padding: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
    position: "relative",
  },
  restaurantImageContainer: {
    width: 60,
    height: 60,
    borderRadius: 12,
    overflow: "hidden",
    marginRight: spacing.sm,
    position: "relative",
  },
  restaurantImage: {
    width: "100%",
    height: "100%",
  },
  restaurantImageStyle: {
    borderRadius: 12,
  },
  ratingBadge: {
    position: "absolute",
    bottom: 4,
    left: 4,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
  },
  ratingText: {
    color: "#ffffff",
    fontSize: 10,
    fontWeight: "700",
    marginLeft: 2,
  },
  restaurantInfo: {
    flex: 1,
    justifyContent: "center",
  },
  restaurantName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 4,
  },
  restaurantMeta: {
    gap: 4,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    color: "#6b7280",
    flex: 1,
  },
  deliveryInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  deliveryText: {
    fontSize: 12,
    color: "#6b7280",
  },
  dot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: "#d1d5db",
    marginHorizontal: 4,
  },
  restaurantDiscountBadge: {
    position: "absolute",
    top: spacing.sm,
    right: spacing.sm,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  restaurantDiscountText: {
    color: "#ffffff",
    fontSize: 10,
    fontWeight: "700",
  },
  viewMoreButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: "#f3f4f6",
  },
  viewMoreText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#4b5563",
    marginRight: spacing.xs,
  },
  emptyContainer: {
    padding: spacing.xl,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: {
    color: "#9ca3af",
    fontSize: 14,
    fontWeight: "500",
    marginTop: spacing.sm,
  },
});
