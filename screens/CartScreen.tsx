import {
  ImageBackground,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";
import React, { useEffect, useState } from "react";
import FFSafeAreaView from "@/src/components/FFSafeAreaView";
import FFText from "@/src/components/FFText";
import IconFeather from "react-native-vector-icons/Feather";
import IconAntDesign from "react-native-vector-icons/AntDesign";
import { useDispatch, useSelector } from "@/src/store/types";
import { RootState } from "@/src/store/store";
import {
  CartItem,
  loadCartItemsFromAsyncStorage,
} from "@/src/store/userPreferenceSlice";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { HomeTabsParamList } from "@/src/navigation/AppNavigator";

const CartScreen = () => {
  const navigation = useNavigation<any>();
  const [listItem, setListItem] = useState<Record<string, CartItem[]>>({}); // State to hold the grouped cart items

  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(loadCartItemsFromAsyncStorage());
  }, [dispatch]);
  const cartList = useSelector(
    (state: RootState) => state.userPreference.cart_items
  ); // Get cart items from Redux

  useEffect(() => {
    // Group cart items by restaurant._id
    const groupedItems = cartList?.reduce((acc: any, item) => {
      const restaurantId = item?.restaurant?._id;

      if (restaurantId) {
        // If this restaurantId doesn't exist in the accumulator, initialize it with an empty array
        if (!acc[restaurantId]) {
          acc[restaurantId] = [];
        }

        // Push the entire item (with the restaurant object) into the array for this restaurantId
        acc[restaurantId].push(item);
      }

      return acc;
    }, {});

    // Set the grouped result into the state
    setListItem(groupedItems);

    // Log the grouped items
  }, [cartList]); // Re-run whenever cartList changes

  return (
    <FFSafeAreaView>
      <View className="flex gap-4 p-4 flex-1">
        {Object.entries(listItem).map(([restaurantId, items]) => (
          <View key={restaurantId}>
            <FFText>{items[0]?.restaurant?.restaurant_name} </FFText>
            {items.map((item: CartItem, index: number) => {
              return (
                <View className="my-2" key={item._id}>
                  <View className="flex-row items-center gap-2 rounded-lg">
                    <Pressable
                      onPress={() => navigation.navigate("Profile")}
                      className="w-1/4"
                    >
                      <ImageBackground
                        source={{
                          uri: item?.item?.avatar?.url,
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
                    </Pressable>
                    <View className="flex-1 relative ">
                      <FFText>{item?.item?.name}</FFText>
                      {item?.item?.variants.length > 0 && (
                        <FFText
                          fontSize="sm"
                          colorLight="#bbb"
                          fontWeight="400"
                        >
                          {item?.item?.variants[0]?.variant}
                        </FFText>
                      )}
                      <FFText
                        fontSize="lg"
                        colorLight="#59bf47"
                        fontWeight="600"
                      >
                        ${item?.price_at_time_of_addition}
                      </FFText>
                      <View className="absolute right-2 bottom-0 flex-row">
                        {/* Minus Button */}
                        <Pressable
                          onPress={() => {}}
                          className="p-1 rounded-md border-green-500 border self-end items-center justify-center"
                        >
                          <IconFeather name="minus" color="#4d9c39" size={20} />
                        </Pressable>
                        <TextInput
                          className="items-center top-2 mx-2 justify-center"
                          value={`${item?.quantity}`}
                          onChangeText={() => {}}
                        />

                        {/* Plus Button */}
                        <Pressable
                          onPress={() => {}}
                          className="p-1  rounded-md bg-green-500 self-end items-center justify-center"
                        >
                          <IconFeather name="plus" color="#fff" size={20} />
                        </Pressable>
                      </View>
                    </View>
                  </View>
                </View>
              );
            })}
          </View>
        ))}
      </View>
    </FFSafeAreaView>
  );
};

export default CartScreen;
