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
import FFModal from "@/src/components/FFModal";
import FFButton from "@/src/components/FFButton";
import {
  Enum_PaymentMethod,
  Enum_PaymentStatus,
  Enum_TrackingInfo,
  Order,
} from "@/src/types/Orders";
import { MainStackParamList } from "@/src/navigation/AppNavigator";
import FFAvatar from "@/src/components/FFAvatar";
import FFView from "@/src/components/FFView";
import { IMAGE_LINKS } from "@/src/assets/imageLinks";

interface GroupedCartList {
  [restaurantId: string]: CartItem[];
}

type CartScreenNavigationProp = StackNavigationProp<
  MainStackParamList,
  "BottomTabs"
>;

type Type_SelectedRestaurant = {
  id: string;
  restaurant_name: string;
  avatar: {
    url: string;
    key: string;
  };
  address_id: string;
};
const defaultSelectedRestaurant = {
  id: "",
  restaurant_name: "",
  avatar: {
    url: "",
    key: "",
  },
  address_id: "",
};

const CartScreen = () => {
  const navigation = useNavigation<CartScreenNavigationProp>();
  const [groupedCartList, setGroupedCartList] = useState<GroupedCartList>({});
  const [selectedVariants, setSelectedVariants] = useState<Variant[]>([]);
  const [selectedRestaurant, setSelectedRestaurant] =
    useState<Type_SelectedRestaurant>(defaultSelectedRestaurant);
  const [isShowModal, setIsShowModal] = useState<boolean>(false);
  const [isShowSubmitBtn, setIsShowSubmitBtn] = useState<boolean>(false);
  const [expandedRestaurantId, setExpandedRestaurantId] = useState<
    string | null
  >(null);
  const { user_id, address, id } = useSelector(
    (state: RootState) => state.auth
  );
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(loadCartItemsFromAsyncStorage());
  }, [dispatch]);

  const cartList = useSelector(
    (state: RootState) => state.userPreference.cart_items
  );
  console.log("check cart list", cartList[0]?.item?.restaurantDetails);
  useEffect(() => {
    const groupByRestaurant = (cartList: CartItem[]): GroupedCartList => {
      return cartList.reduce((grouped, cartItem) => {
        const restaurantId = cartItem.item.restaurantDetails.id;
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

  useEffect(() => {
    if (selectedRestaurant.id || selectedVariants.length > 0) {
      setIsShowSubmitBtn(true);
    } else {
      setIsShowSubmitBtn(false);
    }
  }, [selectedRestaurant, selectedVariants]);

  const handleSelectVariants = (
    variant: Variant,
    restaurant: {
      id: string;
      restaurant_name: string;
      address_id: string;
      avatar: {
        url: string;
        key: string;
      };
    },
    menuItem: CartItem
  ) => {
    const newVariants = [...selectedVariants]; // Create a new array to avoid mutation

    const variantWithItemId = { ...variant, item: menuItem.item };

    // Check if the variant (with item_id) is already selected
    if (
      selectedVariants.some((item) => item.item.id === variantWithItemId.id)
    ) {
      // If it's selected, remove it (filter out the variant byid)
      setSelectedVariants(
        newVariants.filter((item) => item.item.id !== variantWithItemId.id)
      );
      // Reset selectedRestaurant to empty object when removing a variant (if needed)
      if (newVariants.length === 0) {
        setSelectedRestaurant({
          id: "",
          restaurant_name: "",
          avatar: { url: "", key: "" },
          address_id: "",
        });
      }
    } else {
      // If the variant is not selected, add it to the array
      newVariants.push(variantWithItemId);
      setSelectedVariants(newVariants); // Update the selectedVariants state

      // Update the selectedRestaurant state only if the first variant of a restaurant is selected
      console.log("check dog", restaurant);
      if (!selectedRestaurant.id || selectedRestaurant.id === restaurant.id) {
        setSelectedRestaurant({
          id: restaurant.id,
          avatar: { url: restaurant.avatar.url, key: restaurant.avatar.key },
          restaurant_name: restaurant.restaurant_name,
          address_id: restaurant.address_id,
        });
      }
    }
  };

  const handleToggleAccordion = (restaurantId: string) => {
    setExpandedRestaurantId((prevId) =>
      prevId === restaurantId ? null : restaurantId
    );
  };

  const handleSubmitCheckout = () => {
    const totalAmount = selectedVariants.reduce((total, item) => {
      const itemTotal = item.variant_price_at_time_of_addition * item.quantity;
      return total + itemTotal;
    }, 0);
    console.log("chek address res", selectedRestaurant);
    const orderData: Order = {
      customer_id: id,
      restaurant_id: selectedRestaurant.id,
      customer_location: address?.[0]?.id,
      restaurant_location: selectedRestaurant.address_id,
      status: Enum_PaymentStatus.PENDING,
      payment_method: Enum_PaymentMethod.FWallet,
      total_amount: totalAmount,
      order_items: selectedVariants.map((item) => ({
        item: item.item,
        item_id: item.id, /// fiix this shit
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

    navigation.navigate("Checkout", { orderItem: orderData });
  };
  return (
    <FFSafeAreaView>
      <View className="flex-1 gap-4 pb-24">
        <FlatList
          style={{ padding: 12 }}
          keyExtractor={(item) => item} // This is fine if the keys of groupedCartList are unique
          data={Object.keys(groupedCartList)}
          renderItem={({ item }) => {
            const restaurantItems = groupedCartList[item];
            const restaurant = restaurantItems[0].item.restaurantDetails;

            return (
              <FFView
                colorDark="#333"
                colorLight="#fff"
                style={{
                  padding: 8,
                  borderRadius: 10,
                  elevation: 4,
                  backgroundColor: !restaurantItems[0].item.restaurantDetails.id
                    ? "#ddd"
                    : undefined,
                }}
              >
                <View className="flex-row items-center gap-2">
                  <FFAvatar
                    avatar={
                      restaurant?.avatar?.url ?? IMAGE_LINKS.DEFAULT_AVATAR_FOOD
                    }
                    size={32}
                    onPress={() =>
                      navigation.navigate("RestaurantDetail", {
                        restaurantId: restaurant.id,
                      })
                    }
                    rounded="sm"
                  />
                  <FFText colorDark="#aaa" fontWeight="500">
                    {restaurant.restaurant_name}
                  </FFText>
                </View>

                <FlatList
                  data={restaurantItems}
                  renderItem={({ item, index }) => {
                    const cartItem = item;
                    const restaurantDetails = cartItem?.item?.restaurantDetails;
                    const isExpanded =
                      expandedRestaurantId === restaurantDetails.id;
                    console.log("check cart item", cartItem.variants[0]);

                    return (
                      <View
                        style={{
                          borderWidth: index === restaurantItems.length ? 1 : 0,
                        }}
                        className="mb-3 py-2 gap-4 border-gray-200"
                      >
                        <Pressable
                          onPress={() =>
                            handleToggleAccordion(restaurantDetails.id)
                          }
                          className="flex-row items-center justify-between"
                        >
                          <View className="flex-row items-center">
                            <Image
                              source={{
                                uri:
                                  cartItem?.item?.avatar?.url ??
                                  IMAGE_LINKS.DEFAULT_AVATAR_FOOD,
                              }}
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
                                <FFView
                                  key={
                                    variant.id || `${cartItem.item.id}-${index}`
                                  }
                                  onPress={() => {
                                    const { id } = selectedRestaurant;

                                    // Check if selectedRestaurant.id is empty or matches the restaurant item ID
                                    if (
                                      id === "" ||
                                      id ===
                                        restaurantItems[0].item
                                          .restaurantDetails.id
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
                                  colorDark="#000"
                                  style={{
                                    marginBottom: 8,
                                    padding: 8,
                                    borderRadius: 10,
                                    borderWidth: selectedVariants.some(
                                      (item) =>
                                        item.variant_id === variant.variant_id
                                    )
                                      ? 1
                                      : 0.5,
                                    borderColor: selectedVariants.some(
                                      (item) =>
                                        item.variant_id === variant.variant_id
                                    )
                                      ? "#4caf50" // green-400
                                      : "#e0e0e0", // gray-200
                                    backgroundColor: selectedVariants.some(
                                      (item) =>
                                        item.variant_id === variant.variant_id
                                    )
                                      ? "#e8f5e9" // green-50
                                      : undefined,
                                  }}
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
                                      {variant?.variant_price_at_time_of_addition
                                        ? (
                                            variant.variant_price_at_time_of_addition *
                                            variant.quantity
                                          ).toFixed(2)
                                        : "0.00"}
                                    </FFText>
                                    <FFText
                                      fontWeight="400"
                                      style={{ color: "#4d9c39", marginTop: 1 }}
                                    >
                                      {variant.quantity}
                                    </FFText>
                                  </View>
                                </FFView>
                              );
                            })}
                          </View>
                        )}
                      </View>
                    );
                  }}
                  keyExtractor={(item, index) =>
                    item.id ? item.id : `${index}`
                  }
                />
              </FFView>
            );
          }}
        />
        {isShowSubmitBtn && cartList.length > 0 && (
          <View className="mx-4">
            <FFButton
              onPress={handleSubmitCheckout}
              className="w-full"
              isLinear
            >
              Check Out
            </FFButton>
          </View>
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
