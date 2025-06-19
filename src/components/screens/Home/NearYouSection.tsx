import React from "react";
import {
  View,
  TouchableOpacity,
  ScrollView,
  ImageBackground,
  Pressable,
  Text,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { MainStackParamList } from "@/src/navigation/AppNavigator";
import IconAntDesign from "react-native-vector-icons/AntDesign";
import IconMaterialIcon from "react-native-vector-icons/MaterialIcons";
import IconFeather from "react-native-vector-icons/Feather";
import FFText from "@/src/components/FFText";
import FFView from "@/src/components/FFView";
import FFSkeleton from "@/src/components/FFSkeleton";
import { IMAGE_LINKS } from "@/src/assets/imageLinks";
import { Restaurant, FavoriteRestaurant } from "@/src/types/screens/Home";
import { colors, spacing } from "@/src/theme";

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

// Helper function to get rating badge color
const getRatingBadgeColor = (rating: number | undefined) => {
  if (!rating) return colors.primary_dark; // Gray for no rating
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

export const NearYouSection = ({
  restaurants,
  favoriteRestaurants,
  handleToggleFavorite,
  isLoading,
}: NearYouSectionProps) => {
  const navigation = useNavigation<HomeRestaurantSreenNavigationProp>();
  
  // Debug info

  return (
    <View style={{ marginBottom: spacing.md }}>
      <View style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: spacing.sm,
        paddingHorizontal: spacing.md,
      }}>
        <FFText style={{
          fontWeight: "700",
          color: "#1f2937"
        }}
        fontSize="lg"
        >
          📍 Near You
        </FFText>
        <TouchableOpacity
          onPress={() => navigation.navigate("NearYou", restaurants ?? [])}
          style={{
            backgroundColor: "#f0fdf4",
            paddingHorizontal: spacing.md,
            paddingVertical: spacing.xs,
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
            gap: spacing.md,
            paddingHorizontal: spacing.md,
            paddingVertical: spacing.sm
          }}
        >
          <FFSkeleton width={140} height={220} style={{ borderRadius: 16 }} />
          <FFSkeleton width={140} height={220} style={{ borderRadius: 16 }} />
          <FFSkeleton width={140} height={220} style={{ borderRadius: 16 }} />
        </View>
      ) : (
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: spacing.md,
            paddingBottom: spacing.sm,
            gap: spacing.md
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
                borderRadius: 16,
                width: 140,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.08,
                shadowRadius: 8,
                elevation: 4,
                overflow: "hidden"
              }}
            >
              <ImageBackground
                source={{
                  uri: item?.avatar?.url ?? IMAGE_LINKS.DEFAULT_AVATAR_FOOD,
                }}
                style={{
                  height: 120,
                  backgroundColor: "#f3f4f6",
                }}
                imageStyle={{ backgroundColor: "#f3f4f6" }}
              >
                <View
                  style={{
                    position: "absolute",
                    bottom: spacing.sm,
                    left: spacing.sm,
                    backgroundColor: getRatingBadgeColor(item.avg_rating),
                    paddingHorizontal: spacing.sm,
                    paddingVertical: 2,
                    borderRadius: 12,
                    flexDirection: "row",
                    alignItems: "center"
                  }}
                >
                   {item.avg_rating ?          
          <IconAntDesign 
          name={getRatingIcon(item.avg_rating)} 
          color={item.avg_rating && item.avg_rating >= 3 ? "#fbbf24" : "#ffffff"} 
          size={14} 
          /> : 
          <IconMaterialIcon
          name='fiber-new'
          color={colors.white} 
          size={14} 
          />
        }
                  <FFText
                    style={{
                      fontSize: 12,
                      fontWeight: "700",
                      color: "#ffffff",
                      marginLeft: 2,
                    }}
                  >
                    {item.avg_rating ? item.avg_rating.toFixed(1) : "New"}
                  </FFText>
                </View>

                <Pressable
                  onPress={() => handleToggleFavorite(item.id)}
                  style={{
                    position: "absolute",
                    top: spacing.sm,
                    right: spacing.sm,
                    backgroundColor: "#ffffff",
                    padding: 6,
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
                      favoriteRestaurants?.some((fav) => fav.restaurant_id === item.id)
                        ? "heart"
                        : "hearto"
                    }
                    size={16}
                    color={
                      favoriteRestaurants?.some((fav) => fav.restaurant_id === item.id)
                        ? "#ef4444"
                        : "#9ca3af"
                    }
                  />
                </Pressable>
              </ImageBackground>

              <View style={{ 
                padding: spacing.sm,
              }}>
                <Text
                  style={{
                    fontWeight: "600",
                    fontSize: 14,
                    color: "#1f2937",
                    marginBottom: 4,
                  }}
                  numberOfLines={1}
                >
                  {item.restaurant_name}
                </Text>
                
                <View style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginBottom: 4,
                }}>
                  <IconFeather name="map-pin" size={12} color="#9ca3af" style={{ marginRight: 2 }} />
                  <Text
                    style={{ 
                      color: "#6b7280", 
                      fontSize: 12,
                      flex: 1,
                    }}
                    numberOfLines={1}
                  >
                    {item?.address?.street || "Location not available"}
                  </Text>
                </View>
                
                <View style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginBottom: 4,
                }}>
                  <IconFeather name="clock" size={12} color="#9ca3af" style={{ marginRight: 2 }} />
                  <Text
                    style={{ 
                      color: "#6b7280", 
                      fontSize: 12,
                    }}
                  >
                    {item.estimated_time ? `${item.estimated_time} min` : "20-30 min"}
                  </Text>
                </View>
                
                <View style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginTop: 4,
                }}>
                  {/* <View style={{
                    backgroundColor: "#fee2e2",
                    paddingHorizontal: 8,
                    paddingVertical: 2,
                    borderRadius: 12,
                  }}>
                    <Text style={{
                      color: "#ef4444",
                      fontSize: 10,
                      fontWeight: "600",
                    }}>
                      Giảm 20K
                    </Text>
                  </View> */}
                  <Text style={{
                    color: "#9ca3af",
                    fontSize: 12,
                  }}>
                    {formatDistance(item.distance)}
                  </Text>
                </View>
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
