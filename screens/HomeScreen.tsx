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
import {
  HomeStackParamList,
  HomeTabsParamList,
  RootStackParamList,
} from "@/src/navigation/AppNavigator";

// Type Definitions
type FoodCategory = { _id: string; name: string; description: string };
type Promotion = {
  _id: string;
  name: string;
  start_date: number;
  end_date: number;
  status: string;
};
type Restaurant = {
  _id: string;
  restaurant_name: string;
  address: {
    _id: string;
    street: string;
    city: string;
    nationality: string;
    title: string;
  };
  specialize_in: FoodCategory[];
  avatar: { url: string; key: string; promotions: string[] };
  promotions: Promotion[];
};

type HomeRestaurantSreenNavigationProp = StackNavigationProp<
  HomeStackParamList,
  "Home"
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

  const [isLoading, setIsLoading] = useState(true);

  // Global State
  const listFavoriteRestaurants = useSelector(
    (state: RootState) => state.userPreference.favorite_restaurants
  );
  const globalState = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [foodCategoriesResponse, restaurantsResponse] = await Promise.all(
          [
            axiosInstance.get("/food-categories"),
            axiosInstance.get(`/customers/restaurants/${globalState.user_id}`),
          ]
        );

        if (foodCategoriesResponse.data.EC === 0) {
          setListFoodCategories(foodCategoriesResponse.data.data);
        }

        if (restaurantsResponse.data.EC === 0) {
          setListRestaurants(restaurantsResponse.data.data);
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

  // Filter restaurants when categories or restaurants change
  useEffect(() => {
    if (listRestaurants && selectedFoodCategories) {
      const filtered = listRestaurants.filter((restaurant) =>
        restaurant.specialize_in?.some((category) =>
          selectedFoodCategories.includes(category._id)
        )
      );
      setFilteredRestaurants(filtered);
    }
  }, [selectedFoodCategories, listRestaurants]);

  // Load favorite restaurants from AsyncStorage
  useEffect(() => {
    dispatch(loadFavoriteRestaurantsFromAsyncStorage());
  }, [dispatch]);

  // Toggle favorite restaurant and update AsyncStorage
  const handleToggleFavorite = async (restaurantId: string) => {
    try {
      const response = await axiosInstance.patch(
        `/customers/favorite-restaurant/${globalState.user_id}`,
        {
          favorite_restaurants: restaurantId,
        }
      );

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

  useEffect(() => {
    // Only dispatch the action to save favorite_restaurants if the list has changed
    if (listFavoriteRestaurants.length > 0) {
      // Dispatch the action to save the updated favorite restaurants to AsyncStorage
      dispatch(saveFavoriteRestaurantsToAsyncStorage(listFavoriteRestaurants));
    }
  }, [listFavoriteRestaurants, dispatch]); // This depends on listFavoriteRestaurants

  const renderedRestaurants =
    filteredRestaurants?.length > 0 ? filteredRestaurants : listRestaurants;

  if (isLoading) {
    return <FFText>Loading...</FFText>; // Or your custom loading spinner
  }

  return (
    <FFSafeAreaView>
      <View className="p-4 gap-6">
        {/* Top Section */}
        <View className="flex-row justify-between items-center">
          <View className="flex-row items-center gap-2">
            <FFAvatar avatar={globalState?.avatar?.url} size={50} />
            <View>
              <FFText>{globalState?.email}</FFText>
              <FFText
                style={{ fontWeight: "400", fontSize: 12, color: "#bbb" }}
              >
                {globalState?.address?.[0]?.title}
              </FFText>
            </View>
          </View>
          <View className="flex-row items-center gap-2">
            <IconAntDesign size={20} name="questioncircleo" />
            <IconFeather size={20} name="bell" />
          </View>
        </View>

        {/* Search */}
        <Pressable className="bg-gray-200 rounded-lg border border-gray-300 p-4">
          <FFText style={{ fontSize: 14, color: "#aaa" }}>
            Search anything...
          </FFText>
        </Pressable>

        {/* Hot Categories */}
        <View>
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
                key={item._id}
                onPress={() => {
                  setSelectedFoodCategories((prev) => {
                    const currentSelected = prev ?? [];
                    return currentSelected.includes(item._id)
                      ? currentSelected.filter((id) => id !== item._id)
                      : [...currentSelected, item._id];
                  });
                }}
                className={`px-2 py-1 mr-2 rounded-md ${
                  selectedFoodCategories?.includes(item._id)
                    ? "bg-[#59bf47]"
                    : "bg-white"
                }`}
              >
                <FFText
                  style={{
                    fontSize: 14,
                    fontWeight: "500",
                    color: selectedFoodCategories?.includes(item._id)
                      ? "#fff"
                      : "#111",
                  }}
                >
                  {item.name}
                </FFText>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Near You */}
        <View>
          <View className="flex-row items-center justify-between">
            <FFText>Near You</FFText>
            <TouchableOpacity>
              <FFText
                style={{ color: "#3FB854", fontWeight: "400", fontSize: 12 }}
              >
                Show All
              </FFText>
            </TouchableOpacity>
          </View>
          <ScrollView horizontal className="mt-2">
            {(renderedRestaurants ?? []).map((item) => (
              <Pressable
                onPress={() =>
                  navigation.navigate("RestaurantDetail", {
                    restaurantId: item._id,
                  })
                }
                key={item._id}
                className="p-2 rounded-lg shadow-md bg-white w-36 h-48 mr-2"
              >
                <ImageBackground
                  source={{ uri: item.avatar.url }}
                  style={{ flex: 1, borderRadius: 8, backgroundColor: "gray" }}
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
                    onPress={() => handleToggleFavorite(item._id)}
                    className="flex-row absolute items-center gap-1 top-1 right-1"
                    style={{
                      backgroundColor: "rgba(0, 0, 0, 0.3)",
                      padding: 4,
                      borderRadius: 8,
                    }}
                  >
                    <IconAntDesign
                      name={
                        listFavoriteRestaurants?.includes(item._id)
                          ? "heart"
                          : "hearto"
                      }
                      size={16}
                      color="#7dbf72"
                    />
                  </Pressable>
                </ImageBackground>

                <View className="h-1/3">
                  <FFText
                    style={{ fontWeight: "600", fontSize: 14, marginTop: 4 }}
                  >
                    {item.restaurant_name}
                  </FFText>
                  <FFText style={{ color: "#aaa", fontSize: 11 }}>
                    {item.address.title}
                  </FFText>
                </View>
              </Pressable>
            ))}
            {renderedRestaurants?.length === 0 && (
              <FFText>No restaurant found</FFText>
            )}
          </ScrollView>
        </View>
      </View>
    </FFSafeAreaView>
  );
};

export default HomeScreen;
