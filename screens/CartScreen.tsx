import React, { useEffect, useState } from "react";
import {
  FlatList,
  Image,
  ImageBackground,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import FFSafeAreaView from "@/src/components/FFSafeAreaView";
import FFText from "@/src/components/FFText";
import IconFeather from "react-native-vector-icons/Feather";
import { useDispatch, useSelector } from "@/src/store/types";
import { RootState } from "@/src/store/store";
import {
  CartItem,
  loadCartItemsFromAsyncStorage,
  Variant,
} from "@/src/store/userPreferenceSlice";
import { useNavigation } from "@react-navigation/native";
import { CompositeNavigationProp } from "@react-navigation/native";
import { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import { StackNavigationProp } from "@react-navigation/stack";
import {
  HomeTabsParamList,
  HomeStackParamList,
} from "@/src/navigation/AppNavigator";
import RestaurantDetail from "./RestaurantDetailScreen";
import FFModal from "@/src/components/FFModal";
import FFButton from "@/src/components/FFButton";

interface GroupedCartList {
  [restaurantId: string]: CartItem[];
}

type CartScreenNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<HomeTabsParamList, "Cart">,
  StackNavigationProp<HomeStackParamList>
>;

const CartScreen = () => {
  const navigation = useNavigation<CartScreenNavigationProp>();
  const [groupedCartList, setGroupedCartList] = useState<GroupedCartList>({});
  const [selectedVariants, setSelectedVariants] = useState<Variant[]>([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState<{
    _id: string;
    restaurant_name: string;
    avatar: {
      url: string;
      key: string;
    };
  }>({
    _id: "",
    restaurant_name: "",
    avatar: {
      url: "",
      key: "",
    },
  });
  const [isShowModal, setIsShowModal] = useState<boolean>(false);
  const [isShowSubmitBtn, setIsShowSubmitBtn] = useState<boolean>(false);
  const [expandedRestaurantId, setExpandedRestaurantId] = useState<
    string | null
  >(null);

  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(loadCartItemsFromAsyncStorage());
  }, [dispatch]);

  const cartList = useSelector(
    (state: RootState) => state.userPreference.cart_items
  );

  useEffect(() => {
    const groupByRestaurant = (cartList: CartItem[]): GroupedCartList => {
      return cartList.reduce((grouped, cartItem) => {
        const restaurantId = cartItem.item.restaurantDetails._id;
        // If the restaurant ID doesn't exist in the grouped object, create an array for it
        if (!grouped[restaurantId]) {
          grouped[restaurantId] = [];
        }
        // Push the current cart item into the respective restaurant's group
        grouped[restaurantId].push(cartItem);
        return grouped;
      }, {} as GroupedCartList); // Explicitly cast to GroupedCartList
    };

    // Group the cartList and update the state
    const grouped = groupByRestaurant(cartList);
    setGroupedCartList(grouped);
  }, [cartList]);

  const handleSelectVariants = (
    variant: Variant,
    restaurant: {
      _id: string;
      restaurant_name: string;
      avatar: {
        url: string;
        key: string;
      };
    }
  ) => {
    const newVariants = [...selectedVariants]; // Create a new array to avoid mutation

    // Check if the variant is already selected
    if (selectedVariants.some((item) => item._id === variant._id)) {
      // If it's selected, remove it (filter out the variant by _id)
      setSelectedVariants(
        newVariants.filter((item) => item._id !== variant._id)
      );
      setSelectedRestaurant({
        _id: "",
        restaurant_name: "",
        avatar: {
          url: "",
          key: "",
        },
      });
      return;
    }

    // If the variant is not selected, add it to the array
    newVariants.push(variant);
    setSelectedVariants(newVariants); // Update the state
    setSelectedRestaurant({
      _id: restaurant._id,
      avatar: { url: restaurant.avatar.url, key: restaurant.avatar.key },
      restaurant_name: restaurant.restaurant_name,
    });
  };

  const handleToggleAccordion = (restaurantId: string) => {
    setExpandedRestaurantId((prevId) =>
      prevId === restaurantId ? null : restaurantId
    );
  };

  useEffect(() => {
    if (selectedRestaurant._id || selectedVariants.length > 0) {
      setIsShowSubmitBtn(true);
    } else {
      setIsShowSubmitBtn(false);
    }
  }, [selectedRestaurant, selectedVariants]);

  const handleSubmitCheckout = () => {
    console.log("cehck", selectedRestaurant, selectedVariants);
  };

  return (
    <FFSafeAreaView>
      <View className="flex-1 p-4 gap-4">
        <FlatList
          keyExtractor={(item) => item} // This is fine if the keys of groupedCartList are unique
          data={Object.keys(groupedCartList)}
          renderItem={({ item }) => {
            const restaurantItems = groupedCartList[item];
            const restaurant = restaurantItems[0].item.restaurantDetails;

            return (
              <View
                className={`mb-5 p-4 border border-gray-300 rounded-xl ${
                  selectedRestaurant._id === "" ||
                  selectedRestaurant._id ===
                    restaurantItems[0].item.restaurantDetails._id
                    ? "bg-white"
                    : "bg-gray-300"
                }`}
              >
                <View className="flex-row items-center gap-2">
                  <Image
                    source={{ uri: restaurant.avatar.url }}
                    className="w-8 h-8 rounded-xl self-end mb-2"
                  />
                  <Text className="text-sm font-semibold mb-2">
                    {restaurant.restaurant_name}
                  </Text>
                </View>

                <FlatList
                  data={restaurantItems}
                  renderItem={({ item }) => {
                    const cartItem = item;
                    const restaurantDetails = cartItem?.item?.restaurantDetails;
                    const isExpanded =
                      expandedRestaurantId === restaurantDetails._id;
                    return (
                      <View className="mb-3 py-2 gap-4 border-b border-gray-200">
                        <Pressable
                          onPress={() =>
                            handleToggleAccordion(restaurantDetails._id)
                          }
                          className="flex-row items-center justify-between"
                        >
                          <View className="flex-row items-center gap-2">
                            <Image
                              source={{ uri: cartItem?.item?.avatar?.url }}
                              className="w-12 h-12 rounded-full mr-4 bg-gray-400"
                            />
                            <FFText>{cartItem.item.name}</FFText>
                          </View>
                          <IconFeather
                            size={20}
                            name={isExpanded ? "chevron-up" : "chevron-down"}
                          />
                        </Pressable>
                        {isExpanded && (
                          <View className="flex-1">
                            {cartItem.variants.map((variant, index) => {
                              return (
                                <Pressable
                                  onPress={() => {
                                    const { _id } = selectedRestaurant;

                                    // Check if selectedRestaurant._id is empty or matches the restaurant item ID
                                    if (
                                      _id === "" ||
                                      _id ===
                                        restaurantItems[0].item
                                          .restaurantDetails._id
                                    ) {
                                      handleSelectVariants(
                                        variant,
                                        restaurantItems[0].item
                                          .restaurantDetails
                                      );
                                    } else {
                                      setIsShowModal(true);
                                    }
                                  }}
                                  key={variant._id + index} // Use a combination of _id and index to ensure uniqueness
                                  className={`
                                            mb-1 p-2 rounded-lg
                                            ${
                                              selectedVariants.some(
                                                (item) =>
                                                  item.variant_id ===
                                                  variant.variant_id
                                              )
                                                ? "bg-green-50 border-green-400 border"
                                                : "border border-gray-200"
                                            }
                                          `}
                                >
                                  <FFText
                                    fontWeight="400"
                                    style={{ color: "#888" }}
                                  >
                                    {variant.variant_name}
                                  </FFText>
                                  <View className="flex-row items-center justify-between">
                                    <FFText
                                      style={{ color: "#4d9c39", marginTop: 1 }}
                                    >
                                      $
                                      {
                                        +(
                                          +variant?.variant_price_at_time_of_addition?.toFixed(
                                            2
                                          ) * +variant.quantity
                                        ).toFixed(2)
                                      }
                                    </FFText>
                                    <FFText
                                      fontWeight="400"
                                      style={{ color: "#4d9c39", marginTop: 1 }}
                                    >
                                      {variant.quantity}
                                    </FFText>
                                  </View>
                                </Pressable>
                              );
                            })}
                          </View>
                        )}
                      </View>
                    );
                  }}
                  keyExtractor={(item) => item._id} // Ensure unique key for each variant
                />
              </View>
            );
          }}
        />
        {isShowSubmitBtn && (
          <FFButton onPress={handleSubmitCheckout} className="w-full" isLinear>
            Check Out
          </FFButton>
        )}
      </View>
      <FFModal visible={isShowModal} onClose={() => setIsShowModal(false)}>
        <FFText fontSize="md" fontWeight="400" style={{ color: "#aaa" }}>
          Oops. Flashfood only allow selecting items of an restaurant at a
          time.😣
        </FFText>
      </FFModal>
    </FFSafeAreaView>
  );
};

export default CartScreen;
