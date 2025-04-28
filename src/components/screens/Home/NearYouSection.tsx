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
    <View>
      <View className="flex-row items-center justify-between">
        <FFText>Near You</FFText>
        <TouchableOpacity
          onPress={() => navigation.navigate("NearYou", restaurants ?? [])}
        >
          <FFText style={{ color: "#3FB854", fontWeight: "400", fontSize: 12 }}>
            Show All
          </FFText>
        </TouchableOpacity>
      </View>
      {isLoading ? (
        <View
          style={{
            flexDirection: "row",
            gap: spacing.md,
            paddingVertical: spacing.sm,
          }}
        >
          <FFSkeleton width={140} height={140} />
          <FFSkeleton width={140} height={140} />
          <FFSkeleton width={140} height={140} />
        </View>
      ) : (
        <ScrollView horizontal className="py-2 px-2 -ml-2">
          {(restaurants ?? []).slice(0, 5).map((item) => (
            <FFView
              onPress={() =>
                navigation.navigate("RestaurantDetail", {
                  restaurantId: item.id,
                })
              }
              key={item.id}
              style={{
                elevation: 6,
                borderRadius: 12,
                paddingHorizontal: 8,
                width: 140,
                marginRight: spacing.sm,
                height: 140,
                paddingTop: 8,
              }}
            >
              <ImageBackground
                source={{
                  uri: item?.avatar?.url ?? IMAGE_LINKS.DEFAULT_AVATAR_FOOD,
                }}
                style={{
                  height: 80,
                  borderRadius: 8,
                  backgroundColor: "gray",
                }}
                imageStyle={{ borderRadius: 8 }}
              >
                <View
                  className="flex-row absolute items-center gap-1 top-1 left-1"
                  style={{
                    backgroundColor: "rgba(0, 0, 0, 0.3)",
                    padding: spacing.sm,
                    borderRadius: 8,
                  }}
                >
                  <IconAntDesign name="star" color="#7dbf72" />
                  <FFText
                    style={{
                      fontSize: 10,
                      fontWeight: "600",
                      color: "#eee",
                      marginLeft: spacing.xs,
                    }}
                  >
                    4.8
                  </FFText>
                </View>

                <Pressable
                  onPress={() => handleToggleFavorite(item.id)}
                  className="flex-row absolute items-center gap-1 top-1 right-1"
                  style={{
                    backgroundColor: "rgba(0, 0, 0, 0.3)",
                    padding: spacing.sm,
                    borderRadius: 8,
                  }}
                >
                  <IconAntDesign
                    name={
                      favoriteRestaurants?.some((fav) => fav.id === item.id)
                        ? "heart"
                        : "hearto"
                    }
                    size={16}
                    color="#7dbf72"
                  />
                </Pressable>
              </ImageBackground>

              <View style={{ paddingTop: 4, flex: 1 }}>
                <FFText
                  style={{
                    fontWeight: "600",
                    fontSize: 14,
                    marginTop: spacing.xs,
                    lineHeight: 14,
                  }}
                >
                  {item.restaurant_name}
                </FFText>
                <FFText
                  style={{ color: "#aaa", fontSize: 11, marginBottom: 4 }}
                >
                  {item?.address?.street}
                </FFText>
              </View>
            </FFView>
          ))}
          {restaurants?.length === 0 && <FFText>No restaurant found</FFText>}
        </ScrollView>
      )}
    </View>
  );
};
