import React, { useEffect, useState } from "react";
import {
  ImageBackground,
  Pressable,
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

type CartScreenNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<HomeTabsParamList, "Cart">,
  StackNavigationProp<HomeStackParamList>
>;

const CartScreen = () => {
  const navigation = useNavigation<CartScreenNavigationProp>();

  const [listItem, setListItem] = useState<Record<string, CartItem[]>>({});

  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(loadCartItemsFromAsyncStorage());
  }, [dispatch]);

  const cartList = useSelector(
    (state: RootState) => state.userPreference.cart_items
  );

  // useEffect(() => {
  //   const groupedItems = cartList.reduce((acc: any, item) => {
  //     const restaurantId = item.restaurant._id;
  //     if (restaurantId) {
  //       if (!acc[restaurantId]) {
  //         acc[restaurantId] = [];
  //       }
  //       acc[restaurantId].push(item);
  //     }
  //     return acc;
  //   }, {});

  //   setListItem(groupedItems);
  // }, [cartList]);

  const handleNavigateToRestaurant = (restaurantId: string) => {
    navigation.navigate("HomeStack", {
      screen: "RestaurantDetail",
      params: { restaurantId },
    });
  };
  console.log("check", cartList);

  return (
    <FFSafeAreaView>
      <View className="flex gap-4 p-4 flex-1">
        {Object.entries(listItem).map(([restaurantId, items]) => (
          <View key={restaurantId}>
            <FFText>{items[0]?.restaurant?.restaurant_name}</FFText>
            {/* {items.map((item: CartItem) => (
              <View className="my-2" key={item._id}>
                {item.item.variants && item.item.variants.length > 0 ? (
                  <View className="bg-gray-200 p-3 rounded-lg">
                    {item.item.variants.map((variant, index) => (
                      <View
                        className="flex-row items-center gap-2 rounded-lg my-1"
                        key={index}
                      >
                        <Pressable
                          className="w-1/4"
                          onPress={() =>
                            handleNavigateToRestaurant(item.restaurant._id)
                          }
                        >
                          <ImageBackground
                            source={{
                              uri: item.item.avatar.url,
                            }}
                            style={{
                              borderRadius: 10,
                              width: "100%",
                              height: undefined,
                              aspectRatio: 1,
                              backgroundColor: "gray",
                            }}
                            imageStyle={{ borderRadius: 8 }}
                          />
                        </Pressable>
                        <View className="flex-1 relative">
                          <FFText>{item.item.name}</FFText>
                          <FFText
                            fontSize="sm"
                            colorLight="red"
                            fontWeight="400"
                          >
                            {variant.variant}
                          </FFText>
                          <FFText
                            fontSize="lg"
                            colorLight="#59bf47"
                            fontWeight="600"
                          >
                            ${item.price_at_time_of_addition}
                          </FFText>
                          <View className="absolute right-2 bottom-0 flex-row">
                            <Pressable
                              onPress={() => {}}
                              className="p-1 rounded-md border-green-500 border self-end items-center justify-center"
                            >
                              <IconFeather
                                name="minus"
                                color="#4d9c39"
                                size={20}
                              />
                            </Pressable>
                            <TextInput
                              className="items-center top-2 mx-2 justify-center"
                              value={`${item.quantity}`}
                              onChangeText={() => {}}
                            />
                            <Pressable
                              onPress={() => {}}
                              className="p-1 rounded-md bg-green-500 self-end items-center justify-center"
                            >
                              <IconFeather name="plus" color="#fff" size={20} />
                            </Pressable>
                          </View>
                        </View>
                      </View>
                    ))}
                  </View>
                ) : (
                  <View className="flex-row items-center gap-2 rounded-lg">
                    <Pressable
                      className="w-1/4"
                      onPress={() =>
                        handleNavigateToRestaurant(item.restaurant._id)
                      }
                    >
                      <ImageBackground
                        source={{
                          uri: item.item.avatar.url,
                        }}
                        style={{
                          borderRadius: 10,
                          width: "100%",
                          height: undefined,
                          aspectRatio: 1,
                          backgroundColor: "gray",
                        }}
                        imageStyle={{ borderRadius: 8 }}
                      />
                    </Pressable>
                    <View className="flex-1 relative">
                      <FFText>{item.item.name}</FFText>
                      <FFText
                        fontSize="lg"
                        colorLight="#59bf47"
                        fontWeight="600"
                      >
                        ${item.price_at_time_of_addition}
                      </FFText>
                      <View className="absolute right-2 bottom-0 flex-row">
                        <Pressable
                          onPress={() => {}}
                          className="p-1 rounded-md border-green-500 border self-end items-center justify-center"
                        >
                          <IconFeather name="minus" color="#4d9c39" size={20} />
                        </Pressable>
                        <TextInput
                          className="items-center top-2 mx-2 justify-center"
                          value={`${item.quantity}`}
                          onChangeText={() => {}}
                        />
                        <Pressable
                          onPress={() => {}}
                          className="p-1 rounded-md bg-green-500 self-end items-center justify-center"
                        >
                          <IconFeather name="plus" color="#fff" size={20} />
                        </Pressable>
                      </View>
                    </View>
                  </View>
                )}
              </View>
            ))} */}
          </View>
        ))}
      </View>
    </FFSafeAreaView>
  );
};

export default CartScreen;
