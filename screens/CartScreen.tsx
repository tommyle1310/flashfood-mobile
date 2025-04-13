import React, { useEffect, useState } from "react";
import { FlatList, Image, Pressable, View } from "react-native";
import FFSafeAreaView from "@/src/components/FFSafeAreaView";
import FFText from "@/src/components/FFText";
import IconFeather from "react-native-vector-icons/Feather";
import { useDispatch, useSelector } from "@/src/store/types";
import { RootState } from "@/src/store/store";
import {
  CartItem,
  loadCartItemsFromAsyncStorage,
  Variant,
  updateItemQuantity,
  removeItemFromCart,
} from "@/src/store/userPreferenceSlice";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import FFModal from "@/src/components/FFModal";
import FFButton from "@/src/components/FFButton";
import {
  Enum_PaymentMethod,
  Enum_PaymentStatus,
  Enum_OrderTrackingInfo,
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
  avatar: { url: string; key: string };
  address_id: string;
};
const defaultSelectedRestaurant = {
  id: "",
  restaurant_name: "",
  avatar: { url: "", key: "" },
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

  useEffect(() => {
    const groupByRestaurant = (cartList: CartItem[]): GroupedCartList => {
      return cartList.reduce((grouped, cartItem) => {
        const restaurantId = cartItem.item.restaurantDetails?.id;
        if (!restaurantId) return grouped; // Skip if restaurantId is undefined
        if (!grouped[restaurantId]) {
          grouped[restaurantId] = [];
        }
        grouped[restaurantId].push(cartItem);
        return grouped;
      }, {} as GroupedCartList);
    };
    const grouped = groupByRestaurant(cartList);
    setGroupedCartList(grouped);
  }, [cartList]);

  useEffect(() => {
    if (selectedRestaurant?.id || selectedVariants.length > 0) {
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
      avatar: { url: string; key: string };
    },
    menuItem: CartItem
  ) => {
    // Check if trying to select from a different restaurant
    if (selectedRestaurant.id && selectedRestaurant.id !== restaurant.id) {
      setIsShowModal(true);
      return;
    }

    const newVariants = [...selectedVariants];
    const currentVariant = menuItem.variants.find(
      (v) => v.variant_id === variant.variant_id
    );
    if (!currentVariant) return;

    const variantWithItemId = {
      ...currentVariant,
      item: menuItem.item,
      id: menuItem.id,
    };

    const isVariantSelected = selectedVariants.some((item) => item.id === menuItem.id);
    
    if (isVariantSelected) {
      const filteredVariants = newVariants.filter((item) => item.id !== menuItem.id);
      setSelectedVariants(filteredVariants);
      // If removing the last item, reset the selected restaurant
      if (filteredVariants.length === 0) {
        setSelectedRestaurant(defaultSelectedRestaurant);
      }
    } else {
      newVariants.push(variantWithItemId);
      setSelectedVariants(newVariants);
      // Set the selected restaurant if none is selected
      if (!selectedRestaurant.id) {
        setSelectedRestaurant({
          id: restaurant.id,
          avatar: restaurant.avatar,
          restaurant_name: restaurant.restaurant_name,
          address_id: restaurant.address_id,
        });
      }
    }
  };

  const handleSubmitCheckout = () => {
    const updatedSelectedVariants = selectedVariants.map((selectedVariant) => {
      const cartItem = cartList.find((item) => item.id === selectedVariant.id);
      if (!cartItem) return selectedVariant;

      const currentVariant = cartItem.variants.find(
        (v) => v.variant_id === selectedVariant.variant_id
      );
      if (!currentVariant) return selectedVariant;

      return {
        ...selectedVariant,
        quantity: currentVariant.quantity,
      };
    });

    const totalAmount = updatedSelectedVariants.reduce((total, item) => {
      const itemTotal = item.variant_price_at_time_of_addition * item.quantity;
      return total + itemTotal;
    }, 0);

    const orderData: Order = {
      customer_id: id,
      restaurant_id: selectedRestaurant.id,
      customer_location: address?.[0]?.id,
      restaurant_location: selectedRestaurant.address_id,
      status: Enum_PaymentStatus.PENDING,
      payment_method: Enum_PaymentMethod.FWallet,
      total_amount: totalAmount,
      order_items: updatedSelectedVariants.map((item) => ({
        item: item.item,
        item_id: item.id,
        menu_item: item.item,
        name: item?.item?.name,
        quantity: item.quantity,
        price_at_time_of_order: item.variant_price_at_time_of_addition,
        variant_id: item.variant_id,
        variant_name: item.variant_name,
      })),
      tracking_info: Enum_OrderTrackingInfo.ORDER_PLACED,
      customer_note: "",
      restaurant_note: "",
      order_time: new Date().getTime(),
    };
    navigation.navigate("Checkout", { orderItem: orderData });
  };

  const handleAddQuantity = (cartItem: CartItem, variant: Variant) => {
    dispatch(
      updateItemQuantity({
        itemId: cartItem?.id,
        variantId: variant.variant_id,
        quantity: variant.quantity + 1,
      })
    );
  };

  const handleSubtractQuantity = (cartItem: CartItem, variant: Variant) => {
    if (variant.quantity <= 1) {
      dispatch(removeItemFromCart(cartItem?.id));
    } else {
      dispatch(
        updateItemQuantity({
          itemId: cartItem?.id,
          variantId: variant.variant_id,
          quantity: variant.quantity - 1,
        })
      );
    }
  };

  const renderCartItem = ({ item }: { item: CartItem }) => {
    const variant = item.variants[0]; // Assuming one variant per cart item for simplicity
    const restaurant = item.item.restaurantDetails;
    const isSelected = selectedVariants.some((v) => v.id === item.id);
    const isDisabled = selectedRestaurant.id !== "" && selectedRestaurant.id !== restaurant?.id;

    return (
      <Pressable
        onPress={() => {
          if (!isDisabled) {
            handleSelectVariants(variant, restaurant, item);
          }
        }}
        style={{
          flexDirection: "row",
          padding: 16,
          borderBottomWidth: 1,
          borderBottomColor: "#E5E5E5",
          opacity: isDisabled ? 0.5 : 1,
          backgroundColor: isSelected ? "#e8f5e9" : "transparent",
        }}
      >
      <FFAvatar 
      rounded="md"
      avatar={item.item.avatar.url}
      size={40}
      />
        <View style={{ flex: 1, marginLeft: 12 }}>
          <FFText fontSize="md" fontWeight="bold">
            {item.item?.name}
          </FFText>
          <FFText fontSize="sm" style={{ color: "gray" }}>
            {variant.variant_name}
          </FFText>
          <View
            style={{ flexDirection: "row", alignItems: "center",  }}
          >
            <FFText fontSize="md" fontWeight="bold">
              ${(variant.variant_price_at_time_of_addition * variant.quantity).toFixed(2)}
            </FFText>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginLeft: "auto",
                borderWidth: 1,
                borderColor: "#E5E5E5",
                borderRadius: 8,
                padding: 4,
              }}
            >
              <Pressable
                onPress={(e) => {
                  e.stopPropagation(); // Prevent parent Pressable from triggering
                  handleSubtractQuantity(item, variant);
                }}
                style={{
                  padding: 8,
                  backgroundColor: "#F5F5F5",
                  borderRadius: 4,
                }}
              >
                <IconFeather name="minus" size={16} color="#333" />
              </Pressable>
              <FFText fontSize="md" style={{ marginHorizontal: 16 }}>
                {variant.quantity}
              </FFText>
              <Pressable
                onPress={(e) => {
                  e.stopPropagation(); // Prevent parent Pressable from triggering
                  handleAddQuantity(item, variant);
                }}
                style={{
                  padding: 8,
                  backgroundColor: "#F5F5F5",
                  borderRadius: 4,
                }}
              >
                <IconFeather name="plus" size={16} color="#333" />
              </Pressable>
            </View>
          </View>
        </View>
      </Pressable>
    );
  };

  return (
    <FFSafeAreaView>
      <View className="flex-1 gap-4 pb-24">
        {cartList.length === 0 ? (
          <View className="w-full justify-center flex-1 pb-12 p-4">
            <Image
              source={{ uri: IMAGE_LINKS.EMPTY_CART }}
              style={{ width: "100%", aspectRatio: 1, borderRadius: 12 }}
            />
            <FFText
              fontWeight="400"
              style={{ textAlign: "center", marginVertical: 12, color: "#aaa" }}
            >
              Your cart is empty
            </FFText>
            <FFButton
              variant="link"
              onPress={() => {
                navigation.navigate("BottomTabs", { screenIndex: 0 });
              }}
            >
              Browse some food
            </FFButton>
          </View>
        ) : (
          <>
            <View className="flex-1">
              <FlatList
                data={Object.keys(groupedCartList)}
                renderItem={({ item }) => {
                  const restaurantItems = groupedCartList[item];
                  const restaurant = restaurantItems[0].item.restaurantDetails;
                  console.log('check rs name', restaurantItems?.[0]?.item?.restaurantDetails?.restaurant_name)
                  return (
                    <FFView
                      colorDark="#333"
                      colorLight="#fff"
                      style={{
                        padding: 8,
                        margin: 12,
                        borderRadius: 10,
                        elevation: 4,
                      }}
                    >
                      <View className="flex-row items-center gap-2 px-4 mb-2">
                        <FFAvatar
                          avatar={
                            restaurantItems?.[0]?.item?.restaurantDetails?.avatar?.url ??
                            IMAGE_LINKS.DEFAULT_AVATAR_FOOD
                          }
                          size={32}
                          onPress={() =>
                            navigation.navigate("RestaurantDetail", {
                              restaurantId: restaurant?.id,
                            })
                          }
                          rounded="sm"
                        />
                        <FFText colorDark="#aaa" fontWeight="500">
                          {restaurantItems?.[0]?.item?.restaurantDetails?.restaurant_name}
                        </FFText>
                      </View>
                      <FlatList
                        data={restaurantItems}
                        renderItem={renderCartItem}
                        keyExtractor={(item, index) =>
                          item?.id ? item?.id : `${index}`
                        }
                      />
                    </FFView>
                  );
                }}
                keyExtractor={(item) => item}
              />
            </View>
            {isShowSubmitBtn && (
             <View className="p-4">
               <FFButton
                onPress={handleSubmitCheckout}
              >
                Proceed to Checkout
              </FFButton>
             </View>
            )}
          </>
        )}
      </View>

      <FFModal visible={isShowModal} onClose={() => setIsShowModal(false)}>
        <FFText fontSize="md" fontWeight="400" style={{ color: "#aaa" }}>
          Oops. Flashfood only allow selecting items of an restaurant at a
          time.😣
        </FFText>
        <FFButton
          onPress={() => {
            setSelectedRestaurant(defaultSelectedRestaurant);
            setSelectedVariants([]);
            setIsShowModal(false);
          }}
          style={{
            backgroundColor: "#4caf50",
            paddingVertical: 12,
            borderRadius: 8,
          }}
        >
          Clear Selection
        </FFButton>
      </FFModal>
    </FFSafeAreaView>
  );
};

export default CartScreen;