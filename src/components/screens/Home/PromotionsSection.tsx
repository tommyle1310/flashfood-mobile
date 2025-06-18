import React from "react";
import {
  View,
  TouchableOpacity,
  ScrollView,
  ImageBackground,
  Pressable,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { MainStackParamList } from "@/src/navigation/AppNavigator";
import IconAntDesign from "react-native-vector-icons/AntDesign";
import FFText from "@/src/components/FFText";
import FFView from "@/src/components/FFView";
import FFSkeleton from "@/src/components/FFSkeleton";
import { IMAGE_LINKS } from "@/src/assets/imageLinks";
import colors from "@/src/theme/colors";
import {
  AvailablePromotionWithRestaurants,
  FavoriteRestaurant,
} from "@/src/types/screens/Home";
import { spacing } from "@/src/theme";

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

  return (
    <View style={{  }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: spacing.xl,
        }}
      >
        {promotions?.map((promotion, i) => (
          <View key={promotion.id} style={{ marginBottom: spacing.xl }}>
            <View style={{
              flexDirection: "row",
              alignItems: "center",

              justifyContent: "space-between",
              marginBottom: spacing.sm,
              paddingHorizontal: spacing.xs
            }}>
              <FFText
                style={{
                  fontWeight: "700",
                  fontSize: 22,
                  color: i % 2 === 0 ? "#f59e0b" : "#3b82f6",
                }}
              >
                {promotion.restaurants.length === 0 ? null : `🎯 ${promotion.name}`}
              </FFText>
              {promotion.restaurants.length === 0 || (
                <TouchableOpacity
                  onPress={() => onTap && onTap(promotion.id)}
                  style={{
                    backgroundColor: i % 2 === 0 ? "#fef3c7" : "#dbeafe",
                    paddingHorizontal: spacing.md,
                    paddingVertical: spacing.sm,
                    borderRadius: 20,
                    borderWidth: 1,
                    borderColor: i % 2 === 0 ? "#fde68a" : "#bfdbfe"
                  }}
                >
                  <FFText
                    style={{
                      color: i % 2 === 0 ? "#d97706" : "#2563eb",
                      fontWeight: "600",
                      fontSize: 13,
                    }}
                  >
                    View All
                  </FFText>
                </TouchableOpacity>
              )}
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{
                paddingHorizontal: spacing.sm,
                paddingBottom: spacing.sm,
                gap: spacing.sm
              }}
            >
              {promotion.restaurants.slice(0, 5).map((item) => (
                <FFView
                  onPress={() =>
                    navigation.navigate("RestaurantDetail", {
                      restaurantId: item.id,
                    })
                  }
                  key={item.id}
                  style={{
                    backgroundColor: "#ffffff",
                    borderRadius: 24,
                    height: 240,
                    width: 220,
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 8 },
                    shadowOpacity: 0.12,
                    shadowRadius: 16,
                    elevation: 12,
                    overflow: "hidden",
                  }}
                >
                  <ImageBackground
                    source={{
                      uri: item?.avatar?.url ?? IMAGE_LINKS.DEFAULT_AVATAR_FOOD,
                    }}
                    style={{
                      height: 140,
                      backgroundColor: "#f3f4f6",
                    }}
                    imageStyle={{ backgroundColor: "#f3f4f6" }}
                  >
                    <View
                      style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        right: 0,
                        height: 140,
                        backgroundColor: i % 2 === 0 
                          ? "rgba(245, 158, 11, 0.08)" 
                          : "rgba(59, 130, 246, 0.08)",
                      }}
                    />
                    <View
                      style={{
                        position: "absolute",
                        top: spacing.md,
                        left: spacing.md,
                        backgroundColor: i % 2 === 0 ? "#f59e0b" : "#3b82f6",
                        paddingHorizontal: spacing.md,
                        paddingVertical: spacing.sm,
                        borderRadius: 16,
                        shadowColor: "#000",
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.2,
                        shadowRadius: 4,
                        elevation: 4
                      }}
                    >
                      <FFText
                        style={{
                          color: "white",
                          fontWeight: "700",
                          fontSize: 13,
                        }}
                      >
                        {promotion.discount_type === "PERCENTAGE"
                          ? `${Number(promotion.discount_value).toFixed(
                              0
                            )}% OFF`
                          : `-$${Number(promotion.discount_value)}`}
                      </FFText>
                    </View>
                    <Pressable
                      onPress={() => handleToggleFavorite(item.id)}
                      style={{
                        position: "absolute",
                        top: spacing.md,
                        right: spacing.md,
                        backgroundColor: "#ffffff",
                        padding: spacing.sm,
                        borderRadius: 20,
                        shadowColor: "#000",
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.15,
                        shadowRadius: 6,
                        elevation: 4
                      }}
                    >
                      <IconAntDesign
                        name={
                          favoriteRestaurants?.some((fav) => fav.id === item.id)
                            ? "heart"
                            : "hearto"
                        }
                        size={18}
                        color={
                          favoriteRestaurants?.some((fav) => fav.id === item.id)
                            ? "#ef4444"
                            : "#9ca3af"
                        }
                      />
                    </Pressable>
                  </ImageBackground>

                  <View style={{ 
                    padding: spacing.lg,
                    flex: 1,
                    justifyContent: "space-between"
                  }}>
                    <FFText
                      style={{
                        fontWeight: "700",
                        fontSize: 17,
                        color: "#1f2937",
                        marginBottom: spacing.sm,
                        lineHeight: 20
                      }}
                    >
                      {item.restaurant_name}
                    </FFText>
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          backgroundColor: "#fff7ed",
                          paddingHorizontal: spacing.sm,
                          paddingVertical: spacing.xs,
                          borderRadius: 12,
                          borderWidth: 1,
                          borderColor: "#fed7aa"
                        }}
                      >
                        <IconAntDesign name="star" size={14} color="#f59e0b" />
                        <FFText
                          style={{ 
                            marginLeft: spacing.xs, 
                            color: "#ea580c", 
                            fontSize: 13,
                            fontWeight: "600"
                          }}
                        >
                          4.8
                        </FFText>
                      </View>
                      <View
                        style={{ 
                          flexDirection: "row", 
                          alignItems: "center",
                          backgroundColor: "#f0f9ff",
                          paddingHorizontal: spacing.sm,
                          paddingVertical: spacing.xs,
                          borderRadius: 12,
                          borderWidth: 1,
                          borderColor: "#bae6fd"
                        }}
                      >
                        <IconAntDesign
                          name="clockcircle"
                          size={14}
                          color="#0284c7"
                        />
                        <FFText
                          style={{ 
                            marginLeft: spacing.xs, 
                            color: "#0284c7", 
                            fontSize: 13,
                            fontWeight: "600"
                          }}
                        >
                          20-30 min
                        </FFText>
                      </View>
                    </View>
                  </View>
                </FFView>
              ))}
              {promotion.restaurants.length === 0 && null}
            </ScrollView>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};
