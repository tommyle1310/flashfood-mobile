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
import { Restaurant, FavoriteRestaurant } from "@/src/types/screens/Home";
import { spacing } from "@/src/theme";

type HomeRestaurantSreenNavigationProp = StackNavigationProp<
  MainStackParamList,
  "BottomTabs"
>;

interface NearYouSectionProps {
  restaurants: Restaurant[] | null;
  favoriteRestaurants: FavoriteRestaurant[];
  handleToggleFavorite: (restaurantId: string) => void;
  isLoading: boolean;
}

export const NearYouSection = ({
  restaurants,
  favoriteRestaurants,
  handleToggleFavorite,
  isLoading,
}: NearYouSectionProps) => {
  const navigation = useNavigation<HomeRestaurantSreenNavigationProp>();

  return (
    <View style={{ marginBottom: spacing.sm }}>
      <View style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: spacing.sm,
        paddingHorizontal: spacing.xs
      }}>
        <FFText style={{
          fontSize: 22,
          fontWeight: "700",
          color: "#1f2937"
        }}>
          📍 Near You
        </FFText>
        <TouchableOpacity
          onPress={() => navigation.navigate("NearYou", restaurants ?? [])}
          style={{
            backgroundColor: "#f0fdf4",
            paddingHorizontal: spacing.md,
            paddingVertical: spacing.sm,
            borderRadius: 20,
            borderWidth: 1,
            borderColor: "#bbf7d0"
          }}
        >
          <FFText style={{ 
            color: "#16a34a", 
            fontWeight: "600", 
            fontSize: 13
          }}>
            View All
          </FFText>
        </TouchableOpacity>
      </View>
      {isLoading ? (
        <View
          style={{
            flexDirection: "row",
            gap: spacing.lg,
            paddingVertical: spacing.sm,
            paddingHorizontal: spacing.sm
          }}
        >
          <FFSkeleton width={160} height={180} style={{ borderRadius: 20 }} />
          <FFSkeleton width={160} height={180} style={{ borderRadius: 20 }} />
          <FFSkeleton width={160} height={180} style={{ borderRadius: 20 }} />
        </View>
      ) : (
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: spacing.sm,
            paddingBottom: spacing.sm,
            gap: spacing.sm
          }}
        >
          {(restaurants ?? []).slice(0, 5).map((item) => (
            <FFView
              onPress={() =>
                navigation.navigate("RestaurantDetail", {
                  restaurantId: item.id,
                })
              }
              key={item.id}
              style={{
                backgroundColor: "#ffffff",
                borderRadius: 20,
                width: 160,
                height: 180,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.08,
                shadowRadius: 12,
                elevation: 8,
                overflow: "hidden"
              }}
            >
              <ImageBackground
                source={{
                  uri: item?.avatar?.url ?? IMAGE_LINKS.DEFAULT_AVATAR_FOOD,
                }}
                style={{
                  height: 100,
                  backgroundColor: "#f3f4f6",
                }}
                imageStyle={{ backgroundColor: "#f3f4f6" }}
              >
                <View
                  style={{
                    position: "absolute",
                    top: spacing.sm,
                    left: spacing.sm,
                    backgroundColor: "rgba(0, 0, 0, 0.7)",
                    paddingHorizontal: spacing.sm,
                    paddingVertical: spacing.xs,
                    borderRadius: 12,
                    flexDirection: "row",
                    alignItems: "center"
                  }}
                >
                  <IconAntDesign name="star" color="#fbbf24" size={14} />
                  <FFText
                    style={{
                      fontSize: 12,
                      fontWeight: "700",
                      color: "#ffffff",
                      marginLeft: spacing.xs,
                    }}
                  >
                    4.8
                  </FFText>
                </View>

                <Pressable
                  onPress={() => handleToggleFavorite(item.id)}
                  style={{
                    position: "absolute",
                    top: spacing.sm,
                    right: spacing.sm,
                    backgroundColor: "#ffffff",
                    padding: spacing.sm,
                    borderRadius: 16,
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.1,
                    shadowRadius: 4,
                    elevation: 3
                  }}
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
                        : "#9ca3af"
                    }
                  />
                </Pressable>
              </ImageBackground>

              <View style={{ 
                padding: spacing.sm,
                flex: 1,
                justifyContent: "space-between"
              }}>
                <FFText
                  style={{
                    fontWeight: "600",
                    fontSize: 15,
                    color: "#1f2937",
                    lineHeight: 18,
                    marginBottom: spacing.xs
                  }}
                >
                  {item.restaurant_name}
                </FFText>
             {item?.address?.street && 
                <FFText
                style={{ 
                  color: "#6b7280", 
                  fontSize: 12,
                  fontWeight: "400"
                }}
              >
                📍 {item?.address?.street}, {item?.address?.city}, {item?.address?.nationality}
              </FFText>
             }
              </View>
            </FFView>
          ))}
          {restaurants?.length === 0 && (
            <View style={{
              backgroundColor: "#ffffff",
              borderRadius: 16,
              padding: spacing.xl,
              alignItems: "center",
              justifyContent: "center",
              minWidth: 200
            }}>
              <FFText style={{
                color: "#9ca3af",
                fontSize: 16,
                fontWeight: "500"
              }}>
                🍽️ No restaurants found
              </FFText>
            </View>
          )}
        </ScrollView>
      )}
    </View>
  );
};
