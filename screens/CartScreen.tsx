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
import { StackNavigationProp } from "@react-navigation/stack";
import { HomeTabsParamList } from "@/src/navigation/AppNavigator";
import FFModal from "@/src/components/FFModal";
import FFButton from "@/src/components/FFButton";
import {
  Enum_PaymentMethod,
  Enum_PaymentStatus,
  Enum_TrackingInfo,
  Order,
} from "@/src/types/Orders";

interface GroupedCartList {
  [restaurantId: string]: CartItem[];
}

type CartScreenNavigationProp = StackNavigationProp<HomeTabsParamList, "Cart">;

const CartScreen = () => {
  const navigation = useNavigation<CartScreenNavigationProp>();
  const handleSubmitCheckout = () => {
    const totalAmount = selectedVariants.reduce((total, item) => {
      const itemTotal = item.variant_price_at_time_of_addition * item.quantity;
      return total + itemTotal;
    }, 0);

    const orderData: Order = {
      customer_id: user_id,
      restaurant_id: selectedRestaurant._id,
      customer_location: address?.[0]?._id,
      restaurant_location: selectedRestaurant.address,
      status: Enum_PaymentStatus.PENDING,
      payment_method: Enum_PaymentMethod.FWallet,
      total_amount: totalAmount,
      order_items: selectedVariants.map((item) => ({
        item: item.item,
        item_id: item._id, /// fiix this shit
        name: item.variant_name,
        quantity: item.quantity,
        price_at_time_of_order: item.variant_price_at_time_of_addition,
        variant_id: item.variant_id,
      })),
      tracking_info: Enum_TrackingInfo.ORDER_PLACED,
      customer_note: "SOS customer",
      restaurant_note: "SOS restaurant",
      order_time: new Date().getTime(),
    };
    console.log("cehck menu item", orderData?.order_items?.[0]?.quantity);

    navigation.navigate("HomeStack", {
      screen: "Checkout",
      params: { orderItem: orderData },
    });
  };

  const [groupedCartList, setGroupedCartList] = useState<GroupedCartList>({});
  const [selectedVariants, setSelectedVariants] = useState<Variant[]>([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState<{
    _id: string;
    restaurant_name: string;
    avatar: {
      url: string;
      key: string;
    };
    address: string;
  }>({
    _id: "",
    restaurant_name: "",
    avatar: {
      url: "",
      key: "",
    },
    address: "",
  });
  const [isShowModal, setIsShowModal] = useState<boolean>(false);
  const [isShowSubmitBtn, setIsShowSubmitBtn] = useState<boolean>(false);
  const [expandedRestaurantId, setExpandedRestaurantId] = useState<
    string | null
  >(null);
  const { user_id, address } = useSelector((state: RootState) => state.auth);

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
      address: string;
      avatar: {
        url: string;
        key: string;
      };
    },
    menuItem: CartItem
  ) => {
    const newVariants = [...selectedVariants]; // Create a new array to avoid mutation

    // Add the item_id to the variant
    const variantWithItemId = { ...variant, item: menuItem.item };
    // console.log("cehck vasr", menuItem.item.item_id);

    // Check if the variant (with item_id) is already selected
    if (selectedVariants.some((item) => item._id === variantWithItemId._id)) {
      // If it's selected, remove it (filter out the variant by _id)
      setSelectedVariants(
        newVariants.filter((item) => item._id !== variantWithItemId._id)
      );
      setSelectedRestaurant({
        _id: "",
        restaurant_name: "",
        avatar: {
          url: "",
          key: "",
        },
        address: "",
      });
      return;
    }

    // If the variant is not selected, add it to the array
    newVariants.push(variantWithItemId);
    setSelectedVariants(newVariants); // Update the selectedVariants state

    // Update the restaurant selection
    setSelectedRestaurant({
      _id: restaurant._id,
      avatar: { url: restaurant.avatar.url, key: restaurant.avatar.key },
      restaurant_name: restaurant.restaurant_name,
      address: restaurant.address,
    });
  };
  // console.log("checsaasdsafask", selectedVariants[0]);

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
                                          .restaurantDetails,
                                        cartItem
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
