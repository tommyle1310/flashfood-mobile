import React, { useEffect, useState } from "react";
import {
  View,
  Pressable,
  TouchableOpacity,
  ScrollView,
  ImageBackground,
} from "react-native";
import FFSafeAreaView from "@/src/components/FFSafeAreaView";
import FFText from "@/src/components/FFText";
import { useDispatch, useSelector } from "@/src/store/types";
import { RootState } from "@/src/store/store";
import axiosInstance from "@/src/utils/axiosConfig";
import IconAntDesign from "react-native-vector-icons/AntDesign";
import IconFeather from "react-native-vector-icons/Feather";
import FFAvatar from "@/src/components/FFAvatar";
import {
  loadCartItemsFromAsyncStorage,
  loadFavoriteRestaurantsFromAsyncStorage,
  saveFavoriteRestaurantsToAsyncStorage,
  toggleFavoriteRestaurant,
} from "@/src/store/userPreferenceSlice";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { MainStackParamList } from "@/src/navigation/AppNavigator";
import FFView from "@/src/components/FFView";
import Spinner from "@/src/components/FFSpinner";
import { IMAGE_LINKS } from "@/src/assets/imageLinks";
import {
  AvailablePromotionWithRestaurants,
  FoodCategory,
  Restaurant,
} from "@/src/types/screens/Home";
import FFSkeleton from "@/src/components/FFSkeleton";
import colors from "@/src/theme/colors";

// Type Definitions

type HomeRestaurantSreenNavigationProp = StackNavigationProp<
  MainStackParamList,
  "BottomTabs"
>;

const HomeScreen = () => {
  const navigation = useNavigation<HomeRestaurantSreenNavigationProp>();
  const dispatch = useDispatch();
  const [filteredRestaurants, setFilteredRestaurants] = useState<Restaurant[]>(
    []
  );
  const [selectedFoodCategories, setSelectedFoodCategories] = useState<
    string[] | null
  >(null);
  const [listFoodCategories, setListFoodCategories] = useState<
    FoodCategory[] | null
  >(null);
  const [listRestaurants, setListRestaurants] = useState<Restaurant[] | null>(
    null
  );
  const [
    availablePromotionWithRestaurants,
    setAvailablePromotionWithRestaurants,
  ] = useState<AvailablePromotionWithRestaurants[] | null>(null);

  const [isLoading, setIsLoading] = useState(true);

  // Global State
  const listFavoriteRestaurants = useSelector(
    (state: RootState) => state.userPreference.favorite_restaurants
  );

  const globalState = useSelector((state: RootState) => state.auth);
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [
          foodCategoriesResponse,
          restaurantsResponse,
          promotionsWithRestaurantsResponse,
        ] = await Promise.all([
          axiosInstance.get("/food-categories"),
          axiosInstance.get(`/customers/restaurants/${globalState.id}`),
          axiosInstance.get(`/promotions/valid`),
        ]);
        if (foodCategoriesResponse.data.EC === 0) {
          setListFoodCategories(foodCategoriesResponse.data.data);
        }

        if (restaurantsResponse.data.EC === 0) {
          const mappedRestaurants = restaurantsResponse.data.data.map(
            (restaurant: any) => ({
              ...restaurant,
              address: {
                ...restaurant.address,
                location: {
                  lat: restaurant.address.location.lat,
                  lng: restaurant.address.location.lon, // Đổi lon thành lng
                },
              },
            })
          );
          setListRestaurants(mappedRestaurants);
        }

        if (promotionsWithRestaurantsResponse.data.EC === 0) {
          setAvailablePromotionWithRestaurants(
            promotionsWithRestaurantsResponse.data.data
          );
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false); // Stop loading when fetching completes
      }
    };

    // Only fetch data if globalState.user_id is available and not already loading
    if (globalState.user_id && isLoading) {
      fetchData();
    }
  }, [globalState.user_id]);

  // Filter restaurants and promotions when categories change
  useEffect(() => {
    if (listRestaurants && selectedFoodCategories && selectedFoodCategories.length > 0) {
      // Filter restaurants
      const filtered = listRestaurants?.filter((restaurant) =>
        restaurant.specialize_in?.some((category) =>
          selectedFoodCategories.includes(category.id)
        )
      );
      setFilteredRestaurants(filtered);

      // Filter promotions
      if (availablePromotionWithRestaurants) {
        const filteredPromotions = availablePromotionWithRestaurants.map(promotion => {
          // Find full restaurant details for each promotion restaurant
          const restaurantsWithDetails = promotion.restaurants.filter(promoRest => 
            listRestaurants?.some(fullRest => 
              fullRest.id === promoRest.id && 
              fullRest.specialize_in?.some(category => 
                selectedFoodCategories.includes(category.id)
              )
            )
          );
          
          return {
            ...promotion,
            restaurants: restaurantsWithDetails
          };
        });
        setAvailablePromotionWithRestaurants(filteredPromotions);
      }
    } else {
      // Reset filters when no categories are selected
      setFilteredRestaurants([]);
      const fetchPromotions = async () => {
        try {
          const response = await axiosInstance.get(`/promotions/valid`);
          if (response.data.EC === 0) {
            setAvailablePromotionWithRestaurants(response.data.data);
          }
        } catch (error) {
          console.error("Error fetching promotions:", error);
        }
      };
      fetchPromotions();
    }
  }, [selectedFoodCategories, listRestaurants]);

  // Load favorite restaurants from AsyncStorage
  useEffect(() => {
    dispatch(loadFavoriteRestaurantsFromAsyncStorage());
  }, [dispatch]);

  // Toggle favorite restaurant and update AsyncStorage
  const handleToggleFavorite = async (restaurantId: string) => {
    try {
      console.log("globalState.id", globalState.id, restaurantId);
      const response = await axiosInstance.post(
        `/customers/favorite-restaurant/${globalState.id}`,
        {
          favorite_restaurant: restaurantId,
        }
      );
      console.log("response", response.data);

      if (response.data.EC === 0) {
        dispatch(toggleFavoriteRestaurant(restaurantId));
        await dispatch(
          saveFavoriteRestaurantsToAsyncStorage(listFavoriteRestaurants)
        );
      }
    } catch (error) {
      console.error("Error toggling favorite:", error);
    }
  };
  console.log('cehck ', listFavoriteRestaurants)
  useEffect(() => {
    // Only dispatch the action to save favorite_restaurants if the list has changed
    if (listFavoriteRestaurants.length > 0) {
      // Dispatch the action to save the updated favorite restaurants to AsyncStorage
      dispatch(saveFavoriteRestaurantsToAsyncStorage(listFavoriteRestaurants));
    }
  }, [listFavoriteRestaurants, dispatch]); // This depends on listFavoriteRestaurants

  const renderedRestaurants =
    filteredRestaurants?.length > 0 ? filteredRestaurants : listRestaurants;

  return (
    <FFSafeAreaView>
      <ScrollView className="p-4 gap-6">
        {/* Top Section */}
        <View className="flex-row justify-between items-center">
          <View className="flex-row items-center gap-2">
            <FFAvatar
              onPress={() => navigation.navigate("Profile")}
              avatar={globalState?.avatar?.url ?? ""}
              size={50}
            />
            <View>
              <FFText>{globalState?.email}</FFText>
              <FFText
                style={{ fontWeight: "400", fontSize: 12, color: "#bbb" }}
              >
                {globalState?.address?.find((item) => item.is_default)?.title}
              </FFText>
            </View>
          </View>
          <View className="flex-row items-center gap-2">
            <TouchableOpacity
              onPress={() => navigation.navigate("SupportCenter")}
            >
              <IconAntDesign size={20} name="questioncircleo" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => navigation.navigate("Notifications")}
            >
              <IconFeather size={20} name="bell" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Search */}
        <Pressable
          onPress={() => navigation.navigate("Search")}
          className="bg-gray-200 rounded-lg border border-gray-300 p-4 my-4"
        >
          <FFText style={{ fontSize: 14, color: "#aaa" }}>
            Search anything...
          </FFText>
        </Pressable>

        {/* Hot Categories */}
        <View className="my-4">
          <View className="flex-row items-center justify-between">
            <FFText>Hot Categories</FFText>
            <TouchableOpacity>
              <FFText
                style={{ color: "#3FB854", fontWeight: "400", fontSize: 12 }}
              >
                Show All
              </FFText>
            </TouchableOpacity>
          </View>
          <ScrollView horizontal className="mt-2">
            {listFoodCategories?.map((item) => (
              <TouchableOpacity
                key={item.id}
                onPress={() => {
                  setSelectedFoodCategories((prev) => {
                    const currentSelected = prev ?? [];
                    return currentSelected.includes(item.id)
                      ? currentSelected?.filter((id) => id !== item.id)
                      : [...currentSelected, item.id];
                  });
                }}
                className={`px-2 py-1 mr-2 rounded-md ${
                  selectedFoodCategories?.includes(item.id)
                    ? "bg-[#59bf47]"
                    : "bg-white"
                }`}
              >
                <FFText
                  style={{
                    fontSize: 14,
                    fontWeight: "500",
                    color: selectedFoodCategories?.includes(item.id)
                      ? "#fff"
                      : "#111",
                  }}
                >
                  {item.name}
                </FFText>
              </TouchableOpacity>
            ))}
          </ScrollView>
          {isLoading && (
            <View style={{ width: "100%", gap: 12, flexDirection: "row" }}>
              <FFSkeleton width={100} height={30} />
              <FFSkeleton width={100} height={30} />
            </View>
          )}
        </View>

        {/* Near You */}
        <View>
          <View className="flex-row items-center justify-between">
            <FFText>Near You</FFText>
            <TouchableOpacity
              onPress={() =>
                navigation.navigate("NearYou", renderedRestaurants ?? [])
              }
            >
              <FFText
                style={{ color: "#3FB854", fontWeight: "400", fontSize: 12 }}
              >
                Show All
              </FFText>
            </TouchableOpacity>
          </View>
          <ScrollView horizontal className=" py-2 px-2 -ml-2">
            {(renderedRestaurants ?? []).slice(0, 5).map((item) => (
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
                  marginRight: 8,
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
                  {/* Rating and Favorite Icon */}
                  <View
                    className="flex-row absolute items-center gap-1 top-1 left-1"
                    style={{
                      backgroundColor: "rgba(0, 0, 0, 0.3)",
                      padding: 4,
                      borderRadius: 8,
                    }}
                  >
                    <IconAntDesign name="star" color="#7dbf72" />
                    <FFText
                      style={{ fontSize: 10, fontWeight: "600", color: "#eee" }}
                    >
                      4.8
                    </FFText>
                  </View>

                  <Pressable
                    onPress={() => handleToggleFavorite(item.id)}
                    className="flex-row absolute items-center gap-1 top-1 right-1"
                    style={{
                      backgroundColor: "rgba(0, 0, 0, 0.3)",
                      padding: 4,
                      borderRadius: 8,
                    }}
                  >
                    <IconAntDesign
                      name={
                        listFavoriteRestaurants?.includes(item.id) ? "heart" : "hearto"
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
                      marginTop: 4,
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
            {renderedRestaurants?.length === 0 && (
              <FFText>No restaurant found</FFText>
            )}
          </ScrollView>
          {isLoading && (
            <View style={{ width: "100%", gap: 12, flexDirection: "row" }}>
              <FFSkeleton width={140} height={140} />
              <FFSkeleton width={140} height={140} />
            </View>
          )}
        </View>

        <View style={{ paddingBottom: 100 }}>
          <ScrollView className="mt-2 px-2 py-2 -ml-2">
            {availablePromotionWithRestaurants?.map((promotion, i) => (
              <View key={promotion.id} className="mb-6">
                <View className="flex-row items-center justify-between mb-3">
                  <FFText style={{ fontWeight: "700", fontSize: 18, color: i % 2 === 0 ? colors.warning : colors.primary }}>
                    {promotion.restaurants.length === 0 ? null : promotion.name}
                  </FFText>
                  {promotion.restaurants.length === 0 || (
                    <TouchableOpacity
                      style={{
                        paddingHorizontal: 12,
                        paddingVertical: 4,
                        borderRadius: 20,
                      }}
                    >
                      <FFText style={{ color: i % 2 === 0 ? colors.warning : colors.primary, fontWeight: "500", fontSize: 12 }}>
                        Show All
                      </FFText>
                    </TouchableOpacity>
                  )}
                </View>
                <ScrollView horizontal className="py-2 px-2 -ml-2">
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
                        marginRight: 12,
                        backgroundColor: '#fff',
                        overflow: 'hidden'
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
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            height: 120,
                            backgroundColor: 'rgba(255, 107, 107, 0.1)',
                          }}
                        />
                        {/* Discount Badge */}
                        <View
                          style={{
                            position: 'absolute',
                            top: 8,
                            left: 8,
                            backgroundColor: i % 2 === 0 ? colors.warning : colors.primary,
                            paddingHorizontal: 8,
                            paddingVertical: 4,
                            borderRadius: 12,
                          }}
                        >
                          <FFText style={{ color: 'white', fontWeight: '600', fontSize: 12 }}>
                            {promotion.discount_type === 'PERCENTAGE' 
                              ? `${(Number(promotion.discount_value)).toFixed(0.2)}% OFF`
                              : `-$${(Number(promotion.discount_value))}`
                            }
                          </FFText>
                        </View>
                        {/* Favorite Icon */}
                        <Pressable
                          onPress={() => handleToggleFavorite(item.id)}
                          style={{
                            position: 'absolute',
                            top: 8,
                            right: 8,
                            backgroundColor: 'white',
                            padding: 6,
                            borderRadius: 20,
                          }}
                        >
                          <IconAntDesign
                            name={listFavoriteRestaurants?.includes(item.id) ? "heart" : "hearto"}
                            size={16}
                            color={i % 2 === 0 ? colors.warning : colors.primary}
                          />
                        </Pressable>
                      </ImageBackground>

                      <View style={{ padding: 12 }}>
                        <FFText
                          style={{
                            fontWeight: "700",
                            fontSize: 16,
                            marginBottom: 4,
                          }}
                        >
                          {item.restaurant_name}
                        </FFText>
                        {/* Rating and Time */}
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                          <View style={{ flexDirection: 'row', alignItems: 'center', marginRight: 12 }}>
                            <IconAntDesign name="star" size={14} color="#FFB800" />
                            <FFText style={{ marginLeft: 4, color: '#666', fontSize: 12 }}>4.8</FFText>
                          </View>
                          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <IconAntDesign name="clockcircle" size={14} color="#666" />
                            <FFText style={{ marginLeft: 4, color: '#666', fontSize: 12 }}>20-30 min</FFText>
                          </View>
                        </View>
                      </View>
                    </FFView>
                  ))}
                  {promotion.restaurants.length === 0 && null}
                </ScrollView>
                {isLoading && (
                  <View style={{ width: "100%", gap: 12, flexDirection: "row" }}>
                    <FFSkeleton width={100} height={30} />
                    <FFSkeleton width={100} height={30} />
                  </View>
                )}
              </View>
            ))}
          </ScrollView>
        </View>
      </ScrollView>
    </FFSafeAreaView>
  );
};

export default HomeScreen;
