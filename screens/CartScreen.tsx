import React, { useEffect, useState, useMemo } from "react";
import { FlatList, Image, Pressable, View } from "react-native";
import FFSafeAreaView from "@/src/components/FFSafeAreaView";
import FFText from "@/src/components/FFText";
import IconFeather from "react-native-vector-icons/Feather";
import { useDispatch, useSelector } from "@/src/store/types";
import { RootState } from "@/src/store/store";
import {
  CartItem,
  loadCartItemsFromAsyncStorage,
  removeItemFromCart,
  Variant,
  updateItemQuantity,
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
import colors from "@/src/theme/colors";
import { spacing } from "@/src/theme";
import axiosInstance from "@/src/utils/axiosConfig";
import FFSpinner from "@/src/components/FFSpinner";

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
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const navigation = useNavigation<CartScreenNavigationProp>();
  const [groupedCartList, setGroupedCartList] = useState<GroupedCartList>({});
  const [selectedVariants, setSelectedVariants] = useState<Variant[]>([]);
  const [selectedRestaurant, setSelectedRestaurant] =
    useState<Type_SelectedRestaurant>(defaultSelectedRestaurant);
  const [isShowModal, setIsShowModal] = useState<boolean>(false);
  const [isShowSubmitBtn, setIsShowSubmitBtn] = useState<boolean>(false);
  const [isDeleteModalVisible, setIsDeleteModalVisible] =
    useState<boolean>(false);
  const [itemToDelete, setItemToDelete] = useState<{
    cartItem: CartItem;
    variant: Variant;
  } | null>(null);
  const [modalDetails, setModalDetails] = useState<{
    status: "SUCCESS" | "ERROR" | "HIDDEN";
    title: string;
    desc: string;
  }>({ status: "HIDDEN", title: "", desc: "" });

  const { user_id, address, id } = useSelector(
    (state: RootState) => state.auth
  );
  const dispatch = useDispatch();

  const cartList = useSelector(
    (state: RootState) => state.userPreference.cart_items
  );
  console.log('check cart list', cartList?.[0]);
  
  // Normalize cart data to handle different structures from LoginScreen vs RestaurantDetailScreen
  const normalizedCartList = useMemo(() => {
    const normalizeCartData = (cartItems: any[]): CartItem[] => {
      return cartItems.map(item => {
        // Handle different structures
        const normalizedItem = {
          ...item,
          // Ensure proper restaurantDetails structure
          item: {
            ...item.item,
            restaurantDetails: item.item?.restaurantDetails || item.restaurant || item.restaurantDetails || {
              id: item.restaurant_id || item.item?.restaurant_id,
              restaurant_name: item.restaurant?.restaurant_name || item.item?.restaurant?.restaurant_name || "Unknown Restaurant",
              avatar: item.restaurant?.avatar || item.item?.restaurant?.avatar || { url: "", key: "" },
              address_id: item.restaurant?.address_id || item.item?.restaurant?.address_id || ""
            }
          },
          // Normalize variants structure
          variants: item.variants?.map((variant: any) => ({
            variant_id: variant.variant_id,
            variant_name: variant.variant_name || variant.variant || "Unknown",
            quantity: variant.quantity || 1,
            variant_price_at_time_of_addition: variant.variant_price_at_time_of_addition || 
              variant.price_after_applied_promotion || 
              variant.price || 
              parseFloat(item.item?.price) || 0
          })) || []
        };
        
        return normalizedItem;
      });
    };
    
    return normalizeCartData(cartList);
  }, [cartList]);
  
  useEffect(() => {
    dispatch(loadCartItemsFromAsyncStorage());
  }, [dispatch]);

  useEffect(() => {
    const groupByRestaurant = (cartList: CartItem[]): GroupedCartList => {
      return cartList.reduce((grouped, cartItem) => {
        const restaurantId = cartItem.item.restaurantDetails?.id;
        if (!restaurantId) return grouped;
        if (!grouped[restaurantId]) {
          grouped[restaurantId] = [];
        }
        grouped[restaurantId].push(cartItem);
        return grouped;
      }, {} as GroupedCartList);
    };
    const grouped = groupByRestaurant(normalizedCartList);
    setGroupedCartList(grouped);
  }, [normalizedCartList]);

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
    console.log(
      "Selecting variant:",
      variant.variant_id,
      "for item:",
      menuItem.id
    );
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

    const isVariantSelected = selectedVariants.some(
      (item) =>
        item.id === menuItem.id && item.variant_id === variant.variant_id
    );

    if (isVariantSelected) {
      const filteredVariants = newVariants.filter(
        (item) =>
          !(item.id === menuItem.id && item.variant_id === variant.variant_id)
      );
      setSelectedVariants(filteredVariants);
      console.log(
        "Unselected variant:",
        variant.variant_id,
        "New selectedVariants:",
        filteredVariants
      );
      if (filteredVariants.length === 0) {
        setSelectedRestaurant(defaultSelectedRestaurant);
        console.log("Reset selectedRestaurant as no variants selected");
      }
    } else {
      newVariants.push(variantWithItemId);
      setSelectedVariants(newVariants);
      console.log(
        "Selected variant:",
        variant.variant_id,
        "New selectedVariants:",
        newVariants
      );
      if (!selectedRestaurant.id) {
        console.log("cehck res", restaurant);
        setSelectedRestaurant({
          id: restaurant.id,
          avatar: restaurant.avatar,
          restaurant_name: restaurant.restaurant_name,
          address_id: restaurant.address_id,
        });
        console.log("Set selectedRestaurant:", restaurant.id);
      }
    }
  };

  const handleSubmitCheckout = () => {
    const updatedSelectedVariants = selectedVariants.map((selectedVariant) => {
      const cartItem = normalizedCartList.find((item) => item.id === selectedVariant.id);
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
    const newQuantity = variant.quantity - 1;
    if (newQuantity > 0) {
      dispatch(
        updateItemQuantity({
          itemId: cartItem?.id,
          variantId: variant.variant_id,
          quantity: newQuantity,
        })
      );
    } else {
      setItemToDelete({ cartItem, variant });
      setIsDeleteModalVisible(true);
    }
  };

  const handleConfirmDeleteItem = async () => {
    if (!itemToDelete) {
      return;
    }

    const { cartItem, variant } = itemToDelete;
    const isLastVariant = cartItem.variants.length === 1;
    setIsLoading(true);
    try {
      if (isLastVariant) {
        const response = await axiosInstance.delete(
          `/customers/cart-items/${cartItem.id}`
        );
        const { EC, EM } = response.data;

        if (EC === 0) {
          dispatch(removeItemFromCart(cartItem.id));
          const restaurantId = cartItem.item.restaurantDetails?.id;
          const itemsFromSameRestaurant = normalizedCartList.filter(
            (item) => item.item.restaurantDetails?.id === restaurantId
          );

          if (itemsFromSameRestaurant.length === 1) {
            setSelectedRestaurant(defaultSelectedRestaurant);
            setSelectedVariants([]);
          }
          setModalDetails({
            status: "SUCCESS",
            title: "Success!",
            desc: "Item removed from your cart.",
          });
        } else {
          setModalDetails({
            status: "ERROR",
            title: "Error",
            desc: EM || "Failed to remove item.",
          });
        }
      } else {
        dispatch(
          updateItemQuantity({
            itemId: cartItem.id,
            variantId: variant.variant_id,
            quantity: 0,
          })
        );
        setModalDetails({
          status: "SUCCESS",
          title: "Success!",
          desc: "Item updated in your cart.",
        });
      }
    } catch (error) {
      console.error("Failed to delete item from cart:", error);
      setModalDetails({
        status: "ERROR",
        title: "Error",
        desc: "An unexpected error occurred while updating your cart.",
      });
    } finally {
      setIsDeleteModalVisible(false);
      setItemToDelete(null);
      setIsLoading(false);
    }
  };

  const renderCartItem = ({ item }: { item: CartItem }) => {
    const restaurant = item.item.restaurantDetails;
    console.log("Rendering item:", item.id, "Variants:", item.variants);
    return (
      <View>
        {item.variants.map((variant) => {
          const isSelected = selectedVariants.some(
            (v) => v.id === item.id && v.variant_id === variant.variant_id
          );
          const isDisabled =
            selectedRestaurant.id !== "" &&
            selectedRestaurant.id !== restaurant?.id;

          return (
            <FFView
              key={variant.variant_id}
              onPress={() => {
                if (!isDisabled) {
                  handleSelectVariants(variant, restaurant, item);
                }
              }}
              colorDark={isSelected ? "#105201" : ""}
              colorLight={isSelected ? "#d3e6cf" : "#fff"}
              style={{
                flexDirection: "row",
                padding: spacing.sm,
                opacity: isDisabled ? 0.5 : 1,
                borderWidth: 1,
                borderRadius: 12,
                borderColor: isSelected ? colors.primary : "transparent",
                marginBottom: spacing.xs,
              }}
            >
              <FFAvatar rounded="md" avatar={item.item.avatar.url} size={40} />
              <View style={{ flex: 1, marginLeft: 12 }}>
                <FFText fontSize="md" fontWeight="bold">
                  {item.item?.name}
                </FFText>
                <FFText fontSize="sm" style={{ color: "gray" }}>
                  {variant.variant_name}
                </FFText>
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <FFText fontSize="md" fontWeight="bold">
                    $
                    {(
                      variant.variant_price_at_time_of_addition *
                      variant.quantity
                    ).toFixed(2)}
                  </FFText>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      marginLeft: "auto",
                      borderWidth: 1,
                      borderColor: "#E5E5E5",
                      borderRadius: 8,
                      padding: spacing.sm,
                    }}
                  >
                    <Pressable
                      onPress={(e) => {
                        e.stopPropagation();
                        handleSubtractQuantity(item, variant);
                      }}
                      style={{
                        padding: spacing.sm,
                        backgroundColor: "#F5F5F5",
                        borderRadius: 4,
                      }}
                    >
                      <IconFeather name="minus" size={16} color="#333" />
                    </Pressable>
                    <FFText
                      fontSize="md"
                      style={{ marginHorizontal: spacing.md }}
                    >
                      {variant.quantity}
                    </FFText>
                    <Pressable
                      onPress={(e) => {
                        e.stopPropagation();
                        handleAddQuantity(item, variant);
                      }}
                      style={{
                        padding: spacing.sm,
                        backgroundColor: "#F5F5F5",
                        borderRadius: 4,
                      }}
                    >
                      <IconFeather name="plus" size={16} color="#333" />
                    </Pressable>
                  </View>
                </View>
              </View>
            </FFView>
          );
        })}
      </View>
    );
  };

  return (
    <FFSafeAreaView>
      <View className="flex-1 gap-4 pb-24">
        {normalizedCartList.length === 0 ? (
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
                  console.log(
                    "check rs address here",
                    restaurantItems?.[0]?.item?.restaurantDetails
                  );
                  return (
                    <FFView
                      colorDark="#333"
                      colorLight="#fff"
                      style={{
                        padding: spacing.sm,
                        margin: 12,
                        borderRadius: 10,
                        elevation: 4,
                      }}
                    >
                      <View className="flex-row items-center gap-2 px-4 mb-2">
                        <FFAvatar
                          avatar={
                            restaurantItems?.[0]?.item?.restaurantDetails
                              ?.avatar?.url ?? IMAGE_LINKS.DEFAULT_AVATAR_FOOD
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
                          {
                            restaurantItems?.[0]?.item?.restaurantDetails
                              ?.restaurant_name
                          }
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
                <FFButton onPress={handleSubmitCheckout}>
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
      <FFModal
        visible={isDeleteModalVisible}
        onClose={() => {
          setIsDeleteModalVisible(false);
          setItemToDelete(null);
        }}
      >
        <FFText fontSize="lg" fontWeight="bold" style={{ marginBottom: 16 }}>
          Remove Item
        </FFText>
        <FFText fontSize="md" fontWeight="400" style={{ marginBottom: 24, color: "#aaa" }}>
          Are you sure you want to remove this item from your cart?
        </FFText>
        <View style={{ flexDirection: "row", justifyContent: "flex-end" }}>
          <FFButton
            onPress={() => {
              setIsDeleteModalVisible(false);
              setItemToDelete(null);
            }}
            variant="outline"
            style={{ marginRight: 8 }}
          >
            Cancel
          </FFButton>
          <FFButton
            onPress={handleConfirmDeleteItem}
            variant="danger"
          >
            Remove
          </FFButton>
        </View>
      </FFModal>
      <FFModal
        visible={modalDetails.status !== "HIDDEN"}
        onClose={() => setModalDetails({ status: "HIDDEN", title: "", desc: "" })}
      >
        <FFText
          fontSize="lg"
          fontWeight="bold"
          style={{ textAlign: "center", marginBottom: 8 }}
        >
          {modalDetails.title}
        </FFText>
        <FFText fontSize="sm" style={{ textAlign: "center", color: "#666" }}>
          {modalDetails.desc}
        </FFText>
      </FFModal>
      <FFSpinner isVisible={isLoading} />
    </FFSafeAreaView>
  );
};

export default CartScreen;
