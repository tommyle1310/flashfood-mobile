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
    <View style={{ marginTop: -spacing.md, marginBottom: spacing.xxxl }}>
      <ScrollView
        showsHorizontalScrollIndicator={false}
        className="mt-2 px-2 py-2  -ml-2"
      >
        {promotions?.map((promotion, i) => (
          <View key={promotion.id} style={{ marginBottom: spacing.md }}>
            <View className="flex-row items-center justify-between">
              <FFText
                style={{
                  fontWeight: "700",
                  fontSize: 18,
                  color: i % 2 === 0 ? colors.warning : colors.primary,
                }}
              >
                {promotion.restaurants.length === 0 ? null : promotion.name}
              </FFText>
              {promotion.restaurants.length === 0 || (
                <TouchableOpacity
                  onPress={() => onTap && onTap(promotion.id)}
                  style={{
                    paddingHorizontal: 12,
                    paddingVertical: 4,
                    borderRadius: 20,
                  }}
                >
                  <FFText
                    style={{
                      color: i % 2 === 0 ? colors.warning : colors.primary,
                      fontWeight: "500",
                      fontSize: 12,
                    }}
                  >
                    Show All
                  </FFText>
                </TouchableOpacity>
              )}
            </View>
            <ScrollView
              horizontal
              className="py-2 px-2 -ml-2"
              style={{ gap: spacing.md }}
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
                    elevation: 6,
                    borderRadius: 16,
                    height: 200,
                    width: 200,
                    marginRight: spacing.md,
                    overflow: "hidden",
                  }}
                >
                  <ImageBackground
                    source={{
                      uri: item?.avatar?.url ?? IMAGE_LINKS.DEFAULT_AVATAR_FOOD,
                    }}
                    style={{
                      height: 120,
                      backgroundColor: "gray",
                    }}
                  >
                    <View
                      style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        right: 0,
                        height: 120,
                        backgroundColor: "rgba(255, 107, 107, 0.1)",
                      }}
                    />
                    <View
                      style={{
                        position: "absolute",
                        top: 8,
                        left: 8,
                        backgroundColor:
                          i % 2 === 0 ? colors.warning : colors.primary,
                        paddingHorizontal: 8,
                        paddingVertical: 4,
                        borderRadius: 12,
                      }}
                    >
                      <FFText
                        style={{
                          color: "white",
                          fontWeight: "600",
                          fontSize: 12,
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
                        top: 8,
                        right: 8,
                        backgroundColor: "white",
                        padding: 6,
                        borderRadius: 20,
                      }}
                    >
                      <IconAntDesign
                        name={
                          favoriteRestaurants?.some((fav) => fav.id === item.id)
                            ? "heart"
                            : "hearto"
                        }
                        size={16}
                        color={i % 2 === 0 ? colors.warning : colors.primary}
                      />
                    </Pressable>
                  </ImageBackground>

                  <View style={{ padding: spacing.md }}>
                    <FFText
                      style={{
                        fontWeight: "700",
                        fontSize: 16,
                        marginBottom: spacing.sm,
                      }}
                    >
                      {item.restaurant_name}
                    </FFText>
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        marginTop: -spacing.sm,
                      }}
                    >
                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          marginRight: spacing.md,
                        }}
                      >
                        <IconAntDesign name="star" size={14} color="#FFB800" />
                        <FFText
                          style={{ marginLeft: 4, color: "#666", fontSize: 12 }}
                        >
                          4.8
                        </FFText>
                      </View>
                      <View
                        style={{ flexDirection: "row", alignItems: "center" }}
                      >
                        <IconAntDesign
                          name="clockcircle"
                          size={14}
                          color="#666"
                        />
                        <FFText
                          style={{ marginLeft: 4, color: "#666", fontSize: 12 }}
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
            {/* {isLoading && (
              <View style={{ width: "100%", gap: 12, flexDirection: "row" }}>
                <FFSkeleton width={100} height={30} />
                <FFSkeleton width={100} height={30} />
              </View>
            )} */}
          </View>
        ))}
      </ScrollView>
    </View>
  );
};
