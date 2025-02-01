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
} from "@/src/store/userPreferenceSlice";
import { useNavigation } from "@react-navigation/native";
import { CompositeNavigationProp } from "@react-navigation/native";
import { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import { StackNavigationProp } from "@react-navigation/stack";
import {
  HomeTabsParamList,
  HomeStackParamList,
} from "@/src/navigation/AppNavigator";

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

  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(loadCartItemsFromAsyncStorage());
  }, [dispatch]);

  const cartList = useSelector(
    (state: RootState) => state.userPreference.cart_items
  );

  const handleNavigateToRestaurant = (restaurantId: string) => {
    navigation.navigate("HomeStack", {
      screen: "RestaurantDetail",
      params: { restaurantId },
    });
  };
  console.log("check", cartList);

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
  // console.log("check ", cartList);

  return (
    <FFSafeAreaView>
      <View className="flex-1 p-4 gap-4">
        <FlatList
          data={Object.keys(groupedCartList)}
          renderItem={({ item }) => {
            const restaurantItems = groupedCartList[item];
            const restaurant = restaurantItems[0].item.restaurantDetails;

            return (
              <View className="mb-5 p-4 border border-gray-300 rounded-xl bg-gray-50">
                <View className="flex-row items-center gap-2">
                  <Image
                    source={{ uri: restaurant.avatar.url }}
                    className="w-8 h-8 rounded-full mb-2"
                  />
                  <Text className="text-sm font-semibold mb-2">
                    {restaurant.restaurant_name}
                  </Text>
                </View>

                <FlatList
                  data={restaurantItems}
                  renderItem={({ item }) => {
                    console.log("check item", item.variants);

                    const cartItem = item;
                    return (
                      <View className="flex-row items-center mb-3 py-2 border-b border-gray-200">
                        <Image
                          source={{ uri: cartItem.item.avatar.url }}
                          className="w-12 h-12 rounded-full mr-4"
                        />
                        <View className="flex-1">
                          <Text className="font-semibold">
                            {cartItem.item.name}
                          </Text>

                          {/* Loop through variants to get price and quantity */}
                          {cartItem.variants.map((variant, index) => (
                            <View key={variant._id} className="mb-1">
                              <Text className="text-xs text-gray-600">
                                {variant.variant_name} - $
                                {variant.variant_price_at_time_of_addition.toFixed(
                                  2
                                )}
                              </Text>
                              <Text className="text-xs text-gray-500 mt-1">
                                Quantity: {variant.quantity}
                              </Text>
                            </View>
                          ))}
                        </View>
                      </View>
                    );
                  }}
                  keyExtractor={(item) => item._id}
                />
              </View>
            );
          }}
          keyExtractor={(item) => item}
        />
      </View>
    </FFSafeAreaView>
  );
};

const styles = StyleSheet.create({
  restaurantContainer: {
    padding: 10,
    flexDirection: "row",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    backgroundColor: "#f9f9f9",
  },
  restaurantAvatar: {
    width: 40,
    height: 40,
    borderRadius: 30,
    marginBottom: 10,
  },
  restaurantName: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  cartItemContainer: {
    flexDirection: "row",
    marginBottom: 10,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: "#ddd",
  },
  itemAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 10,
  },
  itemDetails: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: "600",
  },
  itemPrice: {
    fontSize: 14,
    color: "#888",
    marginVertical: 5,
  },
  itemQuantity: {
    fontSize: 12,
    color: "#555",
  },
});

export default CartScreen;
