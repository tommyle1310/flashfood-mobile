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
const CARD_WIDTH = width * 0.5;
const CARD_HEIGHT = 180;

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
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <FFSkeleton width={CARD_WIDTH} height={CARD_HEIGHT} style={styles.skeleton} />
          <FFSkeleton width={CARD_WIDTH * 0.9} height={CARD_HEIGHT * 0.9} style={[styles.skeleton, { marginTop: -40, marginLeft: 30 }]} />
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {promotions?.map((promotion, i) => {
            const colors = getPromotionColors(i);
            
            return (
              <View key={promotion.id} style={styles.promotionContainer}>
                {/* Modern Header with Animated Feel */}
                <View style={[
                  styles.headerContainer, 
                  {
                    backgroundColor: `${colors.primary}10`,
                    borderColor: `${colors.primary}30`,
                  }
                ]}>
                  <View style={styles.headerLeft}>
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
                      <FFText
                        style={{
                          ...styles.promotionName,
                          color: colors.text
                        }}
                      >
                        {promotion.restaurants.length === 0 ? null : promotion.name}
                      </FFText>
                      <FFText style={styles.promotionSubtitle}>
                        {promotion.discount_type === "PERCENTAGE"
                          ? `Save ${Number(promotion.discount_value).toFixed(0)}% on your order`
                          : `Save $${Number(promotion.discount_value)} on your order`}
                      </FFText>
                    </View>
                  </View>

                  {promotion.restaurants.length > 0 && (
                    <TouchableOpacity
                      onPress={() => onTap && onTap(promotion.id)}
                      style={[
                        styles.viewAllButton,
                        {backgroundColor: colors.primary}
                      ]}
                    >
                      <FFText style={styles.viewAllText}>
                        View All
                      </FFText>
                      <IconFeather name="chevron-right" size={14} color="#fff" />
                    </TouchableOpacity>
                  )}
                </View>

                {/* Staggered Restaurant Cards */}
                {promotion.restaurants.length > 0 ? (
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.cardsContainer}
                    decelerationRate="fast"
                    snapToInterval={CARD_WIDTH - 40}
                    snapToAlignment="start"
                  >
                    {promotion.restaurants.slice(0, 5).map((item, index) => (
                      <FFView
                        onPress={() =>
                          navigation.navigate("RestaurantDetail", {
                            restaurantId: item.id,
                          })
                        }
                        key={item.id}
                        style={{
                          ...styles.card,                          
                            marginLeft: index === 0 ? 0 : -20,
                            zIndex: 5 - index,
                            width: CARD_WIDTH - (index * 5),
                          }
                        }
                      >
                        {/* Glassmorphic Image Container */}
                        <View style={styles.imageContainer}>
                          <ImageBackground
                            source={{
                              uri: item?.avatar?.url ?? IMAGE_LINKS.DEFAULT_AVATAR_FOOD,
                            }}
                            style={styles.imageBackground}
                            imageStyle={styles.image}
                          >
                            {/* Gradient Overlay */}
                            <View style={[
                              styles.imageOverlay,
                              {backgroundColor: `${colors.primary}15`}
                            ]} />
                            
                            {/* Discount Badge */}
                            <View style={[
                              styles.discountBadge,
                              {backgroundColor: colors.primary}
                            ]}>
                              <Text style={styles.discountText}>
                                {promotion.discount_type === "PERCENTAGE"
                                  ? `${Number(promotion.discount_value).toFixed(0)}%`
                                  : `$${Number(promotion.discount_value)}`}
                              </Text>
                            </View>

                            {/* Favorite Button */}
                            <Pressable
                              onPress={() => handleToggleFavorite(item.id)}
                              style={styles.favoriteButton}
                            >
                              <IconAntDesign
                                name={
                                  favoriteRestaurants?.some((fav) => fav.id === item.id)
                                    ? "heart"
                                    : "hearto"
                                }
                                size={16}
                                color={
                                  favoriteRestaurants?.some((fav) => fav.id === item.id)
                                    ? "#ef4444"
                                    : "#ffffff"
                                }
                              />
                            </Pressable>
                          </ImageBackground>
                        </View>

                        {/* Content Section */}
                        <View style={styles.contentContainer}>
                          {/* Restaurant Name */}
                          <Text
                            style={styles.restaurantName}
                            numberOfLines={1}
                          >
                            {item.restaurant_name}
                          </Text>

                          {/* Location with truncation */}
                          <Text
                            style={styles.locationText}
                            numberOfLines={1}
                          >
                            {item?.address?.street
                              ? `${item?.address?.street}, ${item?.address?.city}`
                              : "Location not available"}
                          </Text>

                          {/* Stats Row */}
                          <View style={styles.statsContainer}>
                            {/* Rating */}
                            <View style={styles.statItem}>
                              <IconAntDesign name="star" size={12} color={colors.primary} />
                              <Text style={styles.statText}>4.8</Text>
                            </View>

                            {/* Delivery Time */}
                            <View style={styles.statItem}>
                              <IconFeather name="clock" size={12} color={colors.primary} />
                              <Text style={styles.statText}>20-30m</Text>
                            </View>

                            {/* Distance */}
                            <View style={styles.statItem}>
                              <IconFeather name="map-pin" size={12} color={colors.primary} />
                              <Text style={styles.statText}>1.2 km</Text>
                            </View>
                          </View>
                        </View>
                      </FFView>
                    ))}
                  </ScrollView>
                ) : (
                  <View style={styles.emptyContainer}>
                    <IconFeather name="coffee" size={24} color="#9ca3af" />
                    <FFText style={styles.emptyText}>
                      No restaurants available
                    </FFText>
                  </View>
                )}
              </View>
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
  loadingContainer: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.lg,
  },
  skeleton: {
    borderRadius: 24,
  },
  scrollContent: {
    paddingBottom: spacing.md,
  },
  promotionContainer: {
    marginBottom: spacing.lg
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginHorizontal: spacing.sm,
    borderRadius: spacing.md,
    borderWidth: 1,
    // ...Platform.select({
    //   ios: {
    //     shadowColor: "#000",
    //     shadowOffset: { width: 0, height: 2 },
    //     shadowOpacity: 0.1,
    //     shadowRadius: 4,
    //   },
    //   android: {
    //     elevation: 3,
    //   },
    // }),
  },
  headerLeft: {
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
    fontSize: spacing.md,
    fontWeight: "700",
  },
  promotionSubtitle: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 2,
  },
  viewAllButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 20,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  viewAllText: {
    color: "#ffffff",
    fontWeight: "600",
    fontSize: 12,
    marginRight: spacing.xs,
  },
  cardsContainer: {
    paddingLeft: spacing.sm,
    paddingRight: spacing.xl,
    paddingBottom: spacing.sm,
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: borderRadius.card,
    height: CARD_HEIGHT,
    overflow: "hidden",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.12,
        shadowRadius: spacing.md,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  imageContainer: {
    height: CARD_HEIGHT * 0.6,
    overflow: "hidden",
  },
  imageBackground: {
    height: "100%",
    backgroundColor: "#f3f4f6",
  },
  image: {
    backgroundColor: "#f3f4f6",
    borderTopLeftRadius: borderRadius.card,
    borderTopRightRadius: borderRadius.card,
  },
  imageOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  discountBadge: {
    position: "absolute",
    top: spacing.sm,
    left: spacing.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.badge,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  discountText: {
    color: "white",
    fontWeight: "700",
    fontSize: 14,
  },
  favoriteButton: {
    position: "absolute",
    top: spacing.sm,
    right: spacing.sm,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    padding: spacing.sm,
    borderRadius: spacing.md,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  contentContainer: {
    padding: spacing.sm,
    flex: 1,
    justifyContent: "space-between",
  },
  restaurantName: {
    fontWeight: "700",
    fontSize: spacing.md,
    color: "#1f2937",
    // marginBottom: spacing.xs,
  },
  locationText: {
    color: "#6b7280",
    fontSize: 12,
    // marginBottom: spacing.sm,
  },
  statsContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    gap: spacing.sm,
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  statText: {
    color: "#4b5563",
    fontSize: typography.fontSize.xs,
    fontWeight: "500",
  },
  emptyContainer: {
    backgroundColor: "#ffffff",
    borderRadius: spacing.md,
    padding: spacing.xl,
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: spacing.md,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  emptyText: {
    color: "#9ca3af",
    fontSize: 14,
    fontWeight: "500",
    marginTop: spacing.sm,
  },
});
