import {
  ImageBackground,
  Pressable,
  ScrollView,
  TouchableOpacity,
  View,
} from "react-native";
import React, { useEffect, useState } from "react";
import FFSafeAreaView from "@/src/components/FFSafeAreaView";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { HomeStackParamList } from "@/src/navigation/AppNavigator";
import IconFeather from "react-native-vector-icons/Feather";
import IconAntDesign from "react-native-vector-icons/AntDesign";
import FFBadge from "@/src/components/FFBadge";
import axiosInstance from "@/src/utils/axiosConfig";
import {
  Props_MenuItem,
  Props_RestaurantDetails,
} from "@/src/types/screens/restaurantDetails";
import FFText from "@/src/components/FFText";
import { useSelector } from "@/src/store/types";
import { RootState } from "@/src/store/store";

// Correct the typing for useRoute
type RestaurantDetailRouteProp = RouteProp<
  HomeStackParamList,
  "RestaurantDetail"
>;

const RestaurantDetail = () => {
  const navigation =
    useNavigation<
      StackNavigationProp<HomeStackParamList, "RestaurantDetail">
    >();

  const listFavoriteRestaurants = useSelector(
    (state: RootState) => state.userPreference.favorite_restaurants
  );

  const route = useRoute<RestaurantDetailRouteProp>();
  const { restaurantId } = route.params;
  const [restaurantDetails, setRestaurantDetails] =
    useState<Props_RestaurantDetails>();
  const [restaurantMenuItem, setRestaurantMenuItem] =
    useState<Props_MenuItem[]>();

  useEffect(() => {
    const fetchRestaurantDetails = async () => {
      const response = await axiosInstance.get(`/restaurants/${restaurantId}`);
      const { EC, EM, data } = response.data;
      if (EC === 0) {
        setRestaurantDetails(data);
      }
    };
    const fetchMenu = async () => {
      const response = await axiosInstance.get(
        `/restaurants/menu-items/${restaurantId}`
      );
      const { EC, EM, data } = response.data;
      if (EC === 0) {
        setRestaurantMenuItem(data);
      }
    };

    fetchRestaurantDetails();
    fetchMenu();
  }, [restaurantId]);

  return (
    <FFSafeAreaView>
      <View style={{ flex: 1, position: "relative" }}>
        {/* Fixed Back Button */}
        <TouchableOpacity
          onPress={() => navigation.navigate("Home")}
          style={{
            position: "absolute",
            top: 20,
            left: 20,
            zIndex: 10, // Keeps the button on top
            padding: 10,
            borderRadius: 30,
            backgroundColor: "#F5F5F5",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <IconFeather size={30} name="chevron-left" color={"#59bf47"} />
        </TouchableOpacity>

        {/* Scrollable Content */}
        <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
          <View style={{ position: "relative", backgroundColor: "#F5F5F5" }}>
            {/* avatar / image gallery */}
            <View className="flex-col gap-4 h-72 relative">
              <ImageBackground
                source={{
                  uri: restaurantDetails?.avatar?.url,
                }}
                style={{
                  flex: 1,
                  backgroundColor: "gray",
                  position: "relative",
                }}
                imageStyle={{ borderRadius: 8 }}
              ></ImageBackground>
            </View>
            {/* some badges */}
            <View className="p-4 bg-gray-100 -mt-4 rounded-t-2xl flex-1 gap-4">
              <View className="flex-row justify-between items-center">
                <FFBadge
                  title="Popular"
                  textColor="#59bf47"
                  backgroundColor="#DBF2D8"
                />
                <View className="flex-row gap-2 items-center">
                  <FFBadge
                    title="Popular"
                    textColor="#59bf47"
                    backgroundColor="#DBF2D8"
                  >
                    <IconFeather name="map-pin" size={20} color={"#59bf47"} />
                  </FFBadge>
                  <FFBadge
                    title="Popular"
                    textColor="#59bf47"
                    backgroundColor="#ddd"
                  >
                    <IconAntDesign
                      name={
                        listFavoriteRestaurants?.includes(restaurantId)
                          ? "heart"
                          : "hearto"
                      }
                      size={20}
                      color={"#59bf47"}
                    />
                  </FFBadge>
                </View>
              </View>

              {/* Restaurant Info */}
              <FFText fontSize="lg">
                {restaurantDetails?.restaurant_name}
              </FFText>
              <View className="flex-row items-center gap-2">
                <IconAntDesign size={20} name="star" color={"#E9A000"} />
                <FFText fontWeight="400" colorLight="#777">
                  4.8 rating
                </FFText>
                <IconFeather
                  className="ml-4"
                  size={20}
                  name="check-square"
                  color={"#59bf47"}
                />
                <FFText fontWeight="400">2000+ orders</FFText>
              </View>

              {/* Description */}
              <FFText fontSize="sm" colorLight="#999">
                {restaurantDetails?.description}
              </FFText>

              {/* Menu items */}
              {restaurantMenuItem?.map((item) => (
                <Pressable
                  key={item._id}
                  className="flex-row items-center gap-2 p-2 rounded-lg bg-white"
                >
                  <View className="w-1/4">
                    <ImageBackground
                      source={{
                        uri: item?.avatar?.url,
                      }}
                      style={{
                        borderRadius: 10,
                        width: "100%", // Set width to 18% of the parent container
                        height: undefined, // Let the height be determined by aspectRatio
                        aspectRatio: 1, // Maintain a 1:1 ratio (square)
                        backgroundColor: "gray", // Set background color
                      }}
                      imageStyle={{ borderRadius: 8 }}
                    ></ImageBackground>
                  </View>
                  <View className="flex-1 relative">
                    <FFText>{item.name}</FFText>
                    <FFText fontSize="sm" colorLight="#bbb" fontWeight="400">
                      {item.purchased_count ?? "0"} sold
                    </FFText>
                    <FFText fontSize="lg" colorLight="#59bf47" fontWeight="600">
                      ${item.price}
                    </FFText>
                    <Pressable className="p-4 -bottom-2 right-0 absolute rounded-md bg-green-500 self-end items-center justify-center">
                      <IconFeather name="plus" color="#fff" />
                    </Pressable>
                  </View>
                </Pressable>
              ))}
            </View>
          </View>
        </ScrollView>
      </View>
    </FFSafeAreaView>
  );
};

export default RestaurantDetail;
