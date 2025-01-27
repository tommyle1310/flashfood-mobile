import {
  View,
  Text,
  Pressable,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ImageBackground,
} from "react-native";
import React, { useEffect, useState } from "react";
import FFSafeAreaView from "@/src/components/FFSafeAreaView";
import FFText from "@/src/components/FFText";
import { useDispatch, useSelector } from "@/src/store/types";
import { RootState } from "@/src/store/store";
import axiosInstance from "@/src/utils/axiosConfig";
import IconAntDesign from "react-native-vector-icons/AntDesign";
import IconFeather from "react-native-vector-icons/Feather";
import FFAvatar from "@/src/components/FFAvatar";
import {
  loadTokenFromAsyncStorage,
  saveTokenToAsyncStorage,
} from "@/src/store/authSlice";
import {
  loadFavoriteRestaurantsFromAsyncStorage,
  saveFavoriteRestaurantsToAsyncStorage,
  toggleFavoriteRestaurant,
} from "@/src/store/userPreferenceSlice";

type FoodCategory = { _id: string; name: string; description: string };
type Promotion = {
  _id: string;
  name: string;
  description?: string;
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

const HomeScreen = () => {
  const dispatch = useDispatch();
  const [filteredRestaurants, setFilteredRestaurants] = useState<
    Restaurant[] | null
  >(null);
  const [selectedFoodCategories, setSelectedFoodCategories] = useState<
    string[] | null
  >(null);
  const [listFoodCategories, setListFoodCategories] = useState<
    FoodCategory[] | null
  >(null);
  const [listRestaurants, setListRestaurants] = useState<Restaurant[] | null>(
    null
  );

  // Use useSelector to get favorite restaurants from global state
  const listFavoriteRestaurants = useSelector(
    (state: RootState) => state.userPreference.favorite_restaurants
  );
  const globalState = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    const fetchAllFoodCategories = async () => {
      const response = await axiosInstance.get(`/food-categories`, {
        validateStatus: () => true,
      });
      const { EC, data } = response.data;
      if (EC === 0) {
        setListFoodCategories(data);
      }
    };
    fetchAllFoodCategories();
  }, []);

  useEffect(() => {
    const fetchAllRestaurants = async () => {
      const response = await axiosInstance.get(
        `/customers/restaurants/${globalState.user_id}`,
        {
          validateStatus: () => true,
        }
      );
      const { EC, data } = response.data;
      if (EC === 0) {
        setListRestaurants(data);
      }
    };
    fetchAllRestaurants();
  }, [globalState]);

  useEffect(() => {
    if (listRestaurants && selectedFoodCategories) {
      const filtered = listRestaurants.filter((restaurant) => {
        return restaurant.specialize_in?.some((category) =>
          selectedFoodCategories.includes(category._id)
        );
      });
      setFilteredRestaurants(filtered);
    }
  }, [selectedFoodCategories, listRestaurants]);

  useEffect(() => {
    dispatch(loadFavoriteRestaurantsFromAsyncStorage());
  }, [dispatch]);

  const handleToggleFavorite = async (restaurantId: string) => {
    const response = await axiosInstance.patch(
      `/customers/favorite-restaurant/${globalState?.user_id}`,
      { favorite_restaurants: restaurantId },
      {
        validateStatus: () => true,
      }
    );
    const { EC, data, EM } = response.data;

    if (EC === 0) {
      // Dispatch the toggle action to update the state
      dispatch(toggleFavoriteRestaurant(restaurantId));

      // Dispatch action to save to AsyncStorage
      await dispatch(
        saveFavoriteRestaurantsToAsyncStorage(globalState.favorite_restaurants)
      );
    }
  };

  // Render restaurants
  const renderedRestaurants = filteredRestaurants ?? listRestaurants ?? [];

  useEffect(() => {
    // console.log("check taok", listFavoriteRestaurants);
    dispatch(
      saveTokenToAsyncStorage({
        accessToken: globalState.accessToken || "", // Saving the actual access token
        app_preferences: globalState.app_preferences || {}, // Fallback to empty object if not present
        email: globalState.email || "", // Default to empty string if email is missing
        preferred_category: globalState.preferred_category || [], // Ensure this is an array
        favorite_restaurants: listFavoriteRestaurants || [], // Ensure this is an array
        favorite_items: globalState.favorite_items || [], // Ensure this is an array
        avatar: globalState.avatar || { url: "", key: "" }, // Use null if no avatar globalState is available
        support_tickets: globalState.support_tickets || [], // Ensure this is an array
        user_id: globalState.user_id || "", // Default to empty string if not present
        user_type: globalState.user_type || [], // Ensure this is an array
        address: globalState.address || [],
      })
    );
  }, [listFavoriteRestaurants]);

  return (
    <FFSafeAreaView>
      <View className="p-4 gap-6">
        {/* Top section */}
        <View className="flex-row justify-between items-center">
          <View className="flex-row items-center gap-2">
            <FFAvatar avatar={globalState?.avatar?.url} size={50} />
            <View>
              <FFText>{globalState?.email}</FFText>
              <FFText style={{ fontWeight: 400, fontSize: 12, color: "#bbb" }}>
                {globalState?.address?.[0]?.title}
              </FFText>
            </View>
          </View>
          <View className="flex-row items-center gap-2">
            <IconAntDesign size={20} name="questioncircleo" />
            <IconFeather size={20} name="bell" />
          </View>
        </View>

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
                style={{ color: "#3FB854", fontWeight: 400, fontSize: 12 }}
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
                    if (currentSelected.includes(item._id)) {
                      return currentSelected.filter((id) => id !== item._id);
                    } else {
                      return [...currentSelected, item._id];
                    }
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
                style={{ color: "#3FB854", fontWeight: 400, fontSize: 12 }}
              >
                Show All
              </FFText>
            </TouchableOpacity>
          </View>
          <ScrollView horizontal className="mt-2">
            {(renderedRestaurants ?? []).map((item) => (
              <Pressable
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
                      color={
                        listFavoriteRestaurants?.includes(item._id)
                          ? "#ff4d4d"
                          : "#7dbf72"
                      }
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
