import {
  ImageBackground,
  Pressable,
  ScrollView,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import React, { useEffect, useState } from "react";
import FFSafeAreaView from "@/src/components/FFSafeAreaView";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import IconFeather from "react-native-vector-icons/Feather";
import IconAntDesign from "react-native-vector-icons/AntDesign";
import FFBadge from "@/src/components/FFBadge";
import axiosInstance from "@/src/utils/axiosConfig";
import {
  MenuItemProps,
  Props_MenuItem,
  Props_RestaurantDetails,
} from "@/src/types/screens/restaurantDetails";
import FFText from "@/src/components/FFText";
import { useDispatch, useSelector } from "@/src/store/types";
import { RootState } from "@/src/store/store";
import SlideUpModal from "@/src/components/FFSlideUpModal";
import FFButton from "@/src/components/FFButton";
import {
  addItemToCart,
  loadCartItemsFromAsyncStorage,
  saveCartItemsToAsyncStorage,
} from "@/src/store/userPreferenceSlice";
import { MainStackParamList } from "@/src/navigation/AppNavigator";
import { IMAGE_LINKS } from "@/src/assets/imageLinks";
import FFModal from "@/src/components/FFModal";
import Spinner from "@/src/components/FFSpinner";
import colors from "@/src/theme/colors";
import FFView from "@/src/components/FFView";
import { spacing } from "@/src/theme";
import { useTheme } from "@/src/hooks/useTheme";
import { loadTokenFromAsyncStorage } from "@/src/store/authSlice";
import { loadOrderTrackingFromAsyncStorage } from "@/src/store/orderTrackingRealtimeSlice";
import { useHomeScreen } from "@/src/hooks/useHomeScreen";

type RestaurantDetailRouteProp = RouteProp<
  MainStackParamList,
  "RestaurantDetail"
>;

const RestaurantDetail = () => {
  const navigation =
    useNavigation<
      StackNavigationProp<MainStackParamList, "RestaurantDetail">
    >();

  const { user_id, id } = useSelector((state: RootState) => state.auth);
  const [err, setErr] = useState<string>("");

  const route = useRoute<RestaurantDetailRouteProp>();
  const { restaurantId } = route.params;
  const [restaurantDetails, setRestaurantDetails] =
    useState<Props_RestaurantDetails>();
  const [restaurantMenuItem, setRestaurantMenuItem] =
    useState<Props_MenuItem[]>();
  const [isShowSlideUpModal, setIsShowSlideUpModal] = useState<boolean>(false);
  const [isShowStatusModal, setIsShowStatusModal] = useState<boolean>(false);
  const [selectedMenuItem, setSelectedMenuItem] = useState<string | null>(null);
  const [modalData, setModalData] = useState<MenuItemProps>();
  const [selectedVariant, setSelectedVariant] = useState<any>(null);
  const [totalPrice, setTotalPrice] = useState<number>(0);
  const [quantity, setQuantity] = useState<number>(1);
  const [itemPrice, setItemPrice] = useState<number | null>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    const fetchRestaurantDetails = async () => {
      const response = await axiosInstance.get(`/restaurants/${restaurantId}`);
      const { EC, EM, data } = response.data;
      if (EC === 0) {
        setRestaurantDetails(data);
      }
    };
    const fetchMenu = async () => {
      const response = await axiosInstance.get(
        `/restaurants/menu-items/${restaurantId}`
      );
      const { EC, EM, data } = response.data;
      if (EC === 0) {
        setRestaurantMenuItem(data);
      }
    };

    fetchRestaurantDetails();
    fetchMenu();
  }, [restaurantId]);

  useEffect(() => {
    if (modalData?.menuItem?.price) {
      setItemPrice(Number(modalData?.menuItem?.price));
    }
  }, [modalData]);

  // Update totalPrice when itemPrice, quantity, or selectedVariant changes
  useEffect(() => {
    const priceToUse =
      selectedVariant?.price_after_applied_promotion ??
      selectedVariant?.price ??
      itemPrice;
    if (quantity && priceToUse) {
      setTotalPrice(quantity * Number(priceToUse));
    }
  }, [
    quantity,
    itemPrice,
    selectedVariant?.price_after_applied_promotion,
    selectedVariant?.price,
  ]);

  const dispatch = useDispatch();
  const { theme } = useTheme();

  useEffect(() => {
    const fetchMenuItemDetails = async () => {
      if (selectedMenuItem) {
        const response = await axiosInstance.get(
          `/menu-items/${selectedMenuItem}`
        );
        const { EC, EM, data } = response.data;
        if (EC === 0) {
          setModalData(data);
        }
      }
    };
    if (isShowSlideUpModal) {
      fetchMenuItemDetails();
    }
  }, [isShowSlideUpModal, selectedMenuItem]);

  const listCartItem = useSelector(
    (state: RootState) => state.userPreference.cart_items
  );

  const handleAddToCart = async () => {
    if (!selectedVariant || !selectedMenuItem) {
      setErr("Please select a variant and menu item");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    try {
      const response = await Promise.race([
        axiosInstance.post(`/customers/cart-items/${id}`, {
          item_id: selectedMenuItem,
          customer_id: id,
          variants: [{ variant_id: selectedVariant.id, quantity }],
        }),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error("Request timeout")), 10000)
        ),
      ]);

      const { EC, EM, data } = (
        response as { data: { EC: number; EM: string; data: any } }
      ).data;
      console.log("Response from backend:", data, EM);

      if (EC === 0) {
        if (!restaurantDetails || !modalData?.menuItem) {
          throw new Error("Restaurant or menu item data is missing");
        }

        await dispatch(
          addItemToCart({
            id: data.id,
            customer_id: id,
            variants: [
              {
                variant_id: selectedVariant.id,
                variant_name: selectedVariant.variant,
                variant_price_at_time_of_addition:
                  selectedVariant.price_after_applied_promotion ||
                  selectedVariant.price,
                quantity,
              },
            ],
            item: {
              avatar: {
                url:
                  modalData?.menuItem?.avatar?.url ??
                  IMAGE_LINKS.DEFAULT_AVATAR_FOOD,
                key: modalData?.menuItem?.avatar?.key ?? "",
              },
              id: data.item_id,
              restaurant_id: data.restaurant_id,
              restaurantDetails: {
                id: restaurantId,
                restaurant_name: restaurantDetails?.restaurant_name ?? "",
                avatar: {
                  url:
                    restaurantDetails?.avatar?.url ??
                    IMAGE_LINKS.DEFAULT_AVATAR_FOOD,
                  key: restaurantDetails?.avatar?.key ?? "",
                },
                address_id: restaurantDetails?.address_id ?? "",
              },
              name: modalData?.menuItem.name ?? "",
              category: modalData?.menuItem.category || [],
              availability: true,
              suggest_notes: modalData?.menuItem.suggest_notes || [],
              purchase_count: 1,
            },
          })
        );
        setIsShowStatusModal(true);
        console.log("Cart item added:", data);
      } else {
        setErr(EM || "Failed to add item to cart");
        console.error("Backend error:", EM);
      }
    } catch (error) {
      const errorMessage =
        (error as Error).message || "An error occurred while adding to cart";
      setErr(errorMessage);
      console.error("Add to cart error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const { favoriteRestaurants } = useHomeScreen();

  useEffect(() => {
    const loadInitialData = async () => {
      await dispatch(loadTokenFromAsyncStorage());
      await dispatch(loadOrderTrackingFromAsyncStorage()); // Tải dữ liệu từ AsyncStorage
    };

    loadInitialData();
  }, [dispatch]);

  useEffect(() => {
    dispatch(loadCartItemsFromAsyncStorage());
  }, [dispatch]);

  useEffect(() => {
    dispatch(saveCartItemsToAsyncStorage(listCartItem));
  }, [listCartItem]);

  if (isLoading) {
    return <Spinner isVisible={isLoading} />;
  }

  console.log("cehck here", favoriteRestaurants?.[0]?.id);

  return (
    <FFSafeAreaView>
      <FFView style={{ flex: 1, position: "relative" }}>
        {/* Fixed Back Button */}
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={{
            position: "absolute",
            top: 20,
            left: 20,
            zIndex: 10,
            padding: 10,
            borderRadius: 30,
            backgroundColor: "#F5F5F5",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <IconFeather size={30} name="chevron-left" color={"#59bf47"} />
        </TouchableOpacity>

        {/* Scrollable Content */}
        <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
          <FFView
            style={{
              position: "relative",
              flex: 1,
            }}
          >
            {/* avatar / image gallery */}
            <View className="flex-col gap-4 h-72 relative">
              <ImageBackground
                source={{
                  uri:
                    restaurantDetails?.avatar?.url ??
                    IMAGE_LINKS.DEFAULT_AVATAR_FOOD,
                }}
                style={{
                  flex: 1,
                  backgroundColor: "gray",
                  position: "relative",
                }}
                imageStyle={{ borderRadius: 8 }}
              ></ImageBackground>
            </View>
            <FFView
              style={{
                borderTopLeftRadius: 12,
                borderTopRightRadius: 12,
                elevation: 5,
                marginTop: -spacing.md,
                height: "100%",
                paddingBottom: 100,
                padding: spacing.md,
              }}
            >
              {/* some badges */}
              <View className="flex-row justify-between items-center">
                <FFBadge
                  title="Popular"
                  textColor="#59bf47"
                  backgroundColor="#DBF2D8"
                />
                <View className="flex-row gap-2 items-center">
                  <FFBadge
                    onPress={() =>
                      navigation.navigate(
                        "RouteToRestaurant",
                        restaurantDetails?.address?.location as {
                          lng: number;
                          lat: number;
                        }
                      )
                    }
                    title="Popular"
                    textColor="#59bf47"
                    backgroundColor="#DBF2D8"
                  >
                    <IconFeather name="map-pin" size={20} color={"#59bf47"} />
                  </FFBadge>
                  <FFBadge
                    title="Popular"
                    textColor="#59bf47"
                    backgroundColor="#ddd"
                  >
                    <IconAntDesign
                      name={
                        favoriteRestaurants?.some((item) =>
                          item.id.includes(restaurantId)
                        )
                          ? "heart"
                          : "hearto"
                      }
                      size={20}
                      color={"#59bf47"}
                    />
                  </FFBadge>
                </View>
              </View>

              {/* Restaurant Info */}
              <FFText fontSize="lg">
                {restaurantDetails?.restaurant_name}
              </FFText>
              <View className="flex-row items-center gap-2">
                <IconAntDesign size={20} name="star" color={"#E9A000"} />
                <FFText fontWeight="400" colorLight="#777">
                  {restaurantDetails?.ratings?.average_rating ?? "5.0 rating"}
                </FFText>
                <IconFeather
                  className="ml-4"
                  size={20}
                  name="check-square"
                  color={"#59bf47"}
                />
                <FFText fontWeight="400">
                  {restaurantDetails && restaurantDetails?.total_orders > 99
                    ? "+99 orders"
                    : `${restaurantDetails?.total_orders ?? 0} orders`}
                </FFText>
              </View>

              {/* Description */}
              <FFText fontSize="sm" colorLight="#999">
                {restaurantDetails?.description}
              </FFText>

              {/* Menu items */}
              {restaurantMenuItem?.map((item) => (
                <FFView
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 12,
                    padding: 6,
                    borderRadius: 12,
                  }}
                  key={item.id}
                >
                  <View className="w-1/4">
                    <ImageBackground
                      source={{
                        uri: item?.avatar?.url,
                      }}
                      style={{
                        borderRadius: 10,
                        width: "100%",
                        height: undefined,
                        aspectRatio: 1,
                        backgroundColor: "gray",
                      }}
                      imageStyle={{ borderRadius: 8 }}
                    ></ImageBackground>
                  </View>
                  <View className="flex-1 relative">
                    <FFText>{item.name}</FFText>
                    <FFText fontSize="sm" colorLight="#bbb" fontWeight="400">
                      {item.purchased_count ?? "0"} sold
                    </FFText>
                    <View className="flex-row gap-2 items-center">
                      {item?.variants?.[0]?.price_after_applied_promotion ? (
                        <View
                          style={{
                            alignItems: "center",
                            flexDirection: "row",
                            gap: spacing.sm,
                          }}
                        >
                          <FFText
                            fontSize="sm"
                            colorLight="#aaa"
                            style={{
                              textDecorationLine: "line-through",
                            }}
                            fontWeight="600"
                          >
                            ${item?.variants?.[0]?.price}
                          </FFText>
                          <FFText
                            fontSize="lg"
                            colorLight="#59bf47"
                            colorDark={colors.primary_dark}
                            fontWeight="600"
                          >
                            $
                            {item?.variants?.[0]?.price_after_applied_promotion}
                          </FFText>
                        </View>
                      ) : (
                        <FFText
                          fontSize="lg"
                          fontWeight="600"
                          style={{ color: colors.primary }}
                        >
                          ${item?.variants?.[0]?.price}
                        </FFText>
                      )}
                    </View>
                    <Pressable
                      onPress={() => {
                        setIsShowSlideUpModal(true);
                        setSelectedMenuItem(item.id);
                        setSelectedVariant(null); // Reset selectedVariant when opening modal
                      }}
                      className="p-1 -bottom-2 right-0 absolute rounded-md bg-green-500 self-end items-center justify-center"
                    >
                      <IconFeather name="plus" color="#fff" size={20} />
                    </Pressable>
                  </View>
                </FFView>
              ))}
            </FFView>
          </FFView>
        </ScrollView>
        <FFModal
          visible={isShowStatusModal}
          onClose={() => setIsShowStatusModal(false)}
        >
          <FFText>Your order has been added to your cart🤑.</FFText>
        </FFModal>
      </FFView>

      {/* slide up modal */}
      <SlideUpModal
        isVisible={isShowSlideUpModal}
        onClose={() => {
          setErr("");
          setIsShowSlideUpModal(false);
          setSelectedVariant(null);
          setQuantity(1); // Reset quantity when closing modal
        }}
      >
        <FFText style={{ textAlign: "center" }} fontSize="lg">
          Add To cart
        </FFText>
        <View className="flex-row flex-1 items-center gap-2 rounded-lg">
          <View className="w-1/4">
            <ImageBackground
              source={{
                uri: modalData?.menuItem?.avatar?.url,
              }}
              style={{
                borderRadius: 10,
                width: "100%",
                height: undefined,
                aspectRatio: 1,
                backgroundColor: "gray",
              }}
              imageStyle={{ borderRadius: 8 }}
            ></ImageBackground>
          </View>

          <View className="flex-1 relative gap-4">
            <View>
              <FFText>{modalData?.menuItem?.name}</FFText>
              <FFText fontSize="sm" colorLight="#bbb" fontWeight="400">
                {modalData?.menuItem?.purchase_count} sold
              </FFText>
            </View>
            <View className="gap-1">
              <FFText
                fontSize="xl"
                colorLight="#59bf47"
                colorDark={colors.warning}
                fontWeight="600"
              >
                ${totalPrice.toFixed(2)}
              </FFText>
            </View>
            <View className="absolute right-2 bottom-0 flex-row">
              {/* Minus Button */}
              <Pressable
                onPress={() => {
                  if (quantity > 1) {
                    setQuantity((prev) => prev - 1);
                  }
                }}
                className="p-1 rounded-md border-green-500 border self-end items-center justify-center"
              >
                <IconFeather name="minus" color="#4d9c39" size={20} />
              </Pressable>
              <TextInput
                className="items-center top-2 mx-2 text-[#aaa] justify-center"
                value={`${quantity}`}
                onChangeText={() => {}}
              />

              {/* Plus Button */}
              <Pressable
                onPress={() => {
                  if (!selectedVariant) {
                    setErr("Please select a variant below");
                  } else {
                    setQuantity((prev) => prev + 1);
                  }
                }}
                className="p-1 rounded-md bg-green-500 self-end items-center justify-center"
              >
                <IconFeather name="plus" color="#fff" size={20} />
              </Pressable>
            </View>
          </View>
        </View>
        <FFText
          fontSize="sm"
          style={{ color: "red", textAlign: "center", marginTop: -spacing.sm }}
        >
          {err}
        </FFText>

        {modalData?.variants &&
          modalData?.variants.length > 0 &&
          modalData?.variants.map((item) => (
            <FFView
              onPress={() => {
                setErr("");
                setSelectedVariant(item);
                setItemPrice(
                  Number(
                    item?.price_after_applied_promotion ?? item?.price ?? 0
                  )
                );
              }}
              style={{
                gap: 12,
                padding: spacing.md,
                borderRadius: 12,
                marginVertical: 8,
                borderColor: colors.success,
                borderWidth: 1,
                ...(selectedVariant?.id === item.id
                  ? {
                      backgroundColor:
                        theme === "light" ? "#f0ffed" : "#53734d",
                    }
                  : {}),
              }}
              key={item.id}
            >
              <FFText style={{ textAlign: "left" }}>
                {item?.variant}{" "}
                {item?.price_after_applied_promotion ? (
                  <>
                    -{" "}
                    <FFText
                      fontWeight="400"
                      fontSize="sm"
                      style={{
                        textDecorationLine: "line-through",
                        color: colors.error,
                      }}
                    >
                      ${item?.price}
                    </FFText>{" "}
                    ${item?.price_after_applied_promotion}
                  </>
                ) : (
                  <>
                    {" "}
                    -{" "}
                    <FFText style={{ color: colors.primary }}>
                      ${item?.price ?? 0}
                    </FFText>
                  </>
                )}
              </FFText>
            </FFView>
          ))}
        <FFButton onPress={handleAddToCart} isLinear className="w-full mt-4">
          <FFText style={{ color: "#fff" }}>Add to Cart</FFText>
        </FFButton>
      </SlideUpModal>
    </FFSafeAreaView>
  );
};

export default RestaurantDetail;
