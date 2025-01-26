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
  const globalState = useSelector((state: RootState) => state.auth);
  useEffect(() => {
    const fetchAllFoodCategories = async () => {
      const response = await axiosInstance.get(`/food-categories`, {
        // This will ensure axios does NOT reject on non-2xx status codes
        validateStatus: () => true, // Always return true so axios doesn't throw on errors
      });

      // Now you can safely access the EC field
      const { EC, EM, data } = response.data; // Access EC, EM, and data

      if (EC === 0) {
        setListFoodCategories(data);
      }
    };
    fetchAllFoodCategories();
  }, [globalState]);
  useEffect(() => {
    const fetchAllRestaurants = async () => {
      const response = await axiosInstance.get(
        `/customers/restaurants/${globalState.user_id}`,
        {
          // This will ensure axios does NOT reject on non-2xx status codes
          validateStatus: () => true, // Always return true so axios doesn't throw on errors
        }
      );

      // Now you can safely access the EC field
      const { EC, EM, data } = response.data; // Access EC, EM, and data

      if (EC === 0) {
        setListRestaurants(data);
      }
    };
    fetchAllRestaurants();
  }, [globalState]);

  useEffect(() => {
    if (listRestaurants && selectedFoodCategories) {
      const filtered = listRestaurants.filter((restaurant) => {
        return restaurant.specialize_in?.some(
          (category) => selectedFoodCategories.includes(category._id) // Check if the category _id is in selectedFoodCategories
        );
      });
      setFilteredRestaurants(filtered);
    }
  }, [selectedFoodCategories, listRestaurants]);

  const renderedRestaurants = filteredRestaurants ?? listRestaurants ?? [];
  return (
    <>
      <FFSafeAreaView>
        <View className="p-4 gap-6">
          {/* top section */}
          <View className="flex-row justify-between items-center">
            <View className="flex-row items-center gap-2">
              <FFAvatar size={50} />
              <View className="">
                <FFText>Tommy Shelby</FFText>
                <FFText
                  style={{ fontWeight: 400, fontSize: 12, color: "#bbb" }}
                >
                  102 Phan Huy It, Q.12, SG, VN
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
              {listFoodCategories?.map((item) => {
                return (
                  <TouchableOpacity
                    key={item._id}
                    onPress={() => {
                      setSelectedFoodCategories((prev) => {
                        const currentSelected = prev ?? []; // If prev is null, use an empty array
                        // Check if the item is already selected
                        if (currentSelected.includes(item._id)) {
                          // If selected, remove it
                          return currentSelected.filter(
                            (id) => id !== item._id
                          );
                        } else {
                          // If not selected, add it
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
                );
              })}
            </ScrollView>
          </View>

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
              {(
                (selectedFoodCategories && selectedFoodCategories?.length > 0
                  ? renderedRestaurants
                  : listRestaurants) ?? []
              )?.length > 0 ? (
                (selectedFoodCategories && selectedFoodCategories.length > 0
                  ? renderedRestaurants
                  : listRestaurants
                )?.map((item) => (
                  <Pressable
                    key={item._id}
                    className="p-2 rounded-lg shadow-md bg-white w-36 h-48 mr-2"
                  >
                    <ImageBackground
                      source={{ uri: item.avatar.url }} // Using the correct image URL
                      style={{
                        flex: 1, // This will make the image take up all available space within the parent
                        borderRadius: 8,
                        backgroundColor: "gray", // Fallback color if image is not available
                      }}
                      imageStyle={{ borderRadius: 8 }} // Optional: To make the image corners rounded
                    >
                      {/* Rating Icon */}
                      <View
                        className="flex-row absolute items-center gap-1 top-1 left-1"
                        style={{
                          backgroundColor: "rgba(0, 0, 0, 0.3)", // Semi-transparent background
                          padding: 4,
                          borderRadius: 8,
                          shadowColor: "#000",
                          shadowOffset: { width: 0, height: 2 },
                          shadowOpacity: 0.8,
                          shadowRadius: 5,
                          elevation: 5,
                        }}
                      >
                        <IconAntDesign name="star" color="#7dbf72" />
                        <FFText
                          style={{
                            fontSize: 10,
                            fontWeight: "600",
                            color: "#eee",
                          }}
                        >
                          4.8
                        </FFText>
                      </View>

                      {/* Cart Icon */}
                      <View
                        className="flex-row absolute items-center gap-1 top-1 right-1"
                        style={{
                          backgroundColor: "rgba(0, 0, 0, 0.3)", // Semi-transparent background
                          padding: 4,
                          borderRadius: 8,
                          shadowColor: "#000",
                          shadowOffset: { width: 0, height: 2 },
                          shadowOpacity: 0.8,
                          shadowRadius: 5,
                          elevation: 5,
                        }}
                      >
                        <IconAntDesign
                          name="hearto"
                          size={16}
                          color="#7dbf72"
                        />
                      </View>
                    </ImageBackground>

                    <View className="h-1/3">
                      {/* Restaurant Name */}
                      <FFText
                        style={{
                          fontWeight: "600",
                          fontSize: 14,
                          marginTop: 4,
                        }}
                      >
                        {item.restaurant_name}
                      </FFText>

                      {/* Address Text */}
                      <FFText style={{ color: "#aaa", fontSize: 11 }}>
                        {item.address.title}
                      </FFText>
                    </View>
                  </Pressable>
                ))
              ) : (
                <FFText>No restaurant found</FFText>
              )}
            </ScrollView>
          </View>
        </View>
      </FFSafeAreaView>
    </>
  );
};

export default HomeScreen;
