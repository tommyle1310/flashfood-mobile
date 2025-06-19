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
import IconMaterialIcons from "react-native-vector-icons/MaterialIcons";
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
import FFAvatar from "@/src/components/FFAvatar";

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
  const { orders } = useSelector(
    (state: RootState) => state.orderTrackingRealtime
  );
  const [err, setErr] = useState<string>("");

  const route = useRoute<RestaurantDetailRouteProp>();
  const { restaurantId } = route.params;
  const [restaurantDetails, setRestaurantDetails] =
    useState<Props_RestaurantDetails>();
  const [restaurantMenuItem, setRestaurantMenuItem] =
    useState<Props_MenuItem[]>();
  const [isShowSlideUpModal, setIsShowSlideUpModal] = useState<boolean>(false);
  const [modalDetails, setModalDetails] = useState<{
    status: "SUCCESS" | "ERROR" | "HIDDEN" | "INFO" | "YESNO";
    title: string;
    desc: string;
  }>({ status: "HIDDEN", title: "", desc: "" });
  const [selectedMenuItem, setSelectedMenuItem] = useState<string | null>(null);
  const [modalData, setModalData] = useState<MenuItemProps>();
  const [selectedVariant, setSelectedVariant] = useState<any>(null);
  const [totalPrice, setTotalPrice] = useState<number>(0);
  const [quantity, setQuantity] = useState<number>(1);
  const [itemPrice, setItemPrice] = useState<number | null>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  useEffect(() => {
    const fetchRestaurantDetails = async () => {
      try {
        setIsLoading(true);
        const response = await axiosInstance.get(`/restaurants/${restaurantId}`);
        const { EC, EM, data } = response.data;
        if (EC === 0) {
          setRestaurantDetails(data);
        }
      } catch (error) {
        console.error("Error fetching restaurant details:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    const fetchMenu = async () => {
      try {
        const response = await axiosInstance.get(
          `/restaurants/menu-items/${restaurantId}`
        );
        const { EC, EM, data } = response.data;
        if (EC === 0) {
          setRestaurantMenuItem(data);
        }
      } catch (error) {
        console.error("Error fetching menu items:", error);
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

  const WEEK_DAYS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'] as const;
  type WeekDay = typeof WEEK_DAYS[number];

  // Get current day for opening hours
  const getCurrentDayOpeningHours = () => {
    const today = WEEK_DAYS[new Date().getDay()];
    
    if (restaurantDetails?.opening_hours && restaurantDetails.opening_hours[today]) {
      const hours = restaurantDetails.opening_hours[today];
      return `${formatTime(hours.from)} - ${formatTime(hours.to)}`;
    }
    return "Not available";
  };

  const handleAddToCart = async () => {
    if (orders.length > 0) {
      setModalDetails({
        title: "Cannot do this action",
        desc: "You are currently have 1 active order, please try again when that order is completed!",
        status: "ERROR",
      });
      return;
    }
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
        setModalDetails({
          status: "ERROR",
          desc: "Your order has been added to your cart 👌",
          title: "Success",
        });
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

  // Format opening hours to readable time
  const formatTime = (time: number) => {
    const hours = Math.floor(time / 100);
    const minutes = time % 100;
    return `${hours}:${minutes === 0 ? '00' : minutes}`;
  };

  if (isLoading && !restaurantDetails) {
    return <Spinner isVisible={true} />;
  }

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
              >
                {restaurantDetails?.status?.is_open && (
                  <View style={{ 
                    position: 'absolute', 
                    top: 20, 
                    right: 20, 
                    backgroundColor: '#59bf47', 
                    paddingHorizontal: 10,
                    paddingVertical: 5,
                    borderRadius: 20
                  }}>
                    <FFText style={{ color: '#fff', fontWeight: '600' }}>Open Now</FFText>
                  </View>
                )}
              </ImageBackground>
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
              {/* Badges section */}
              <View className="flex-row justify-between items-center">
                {restaurantDetails?.specialize_in && restaurantDetails.specialize_in.length > 0 && (
                  <FFBadge
                    title={restaurantDetails.specialize_in[0].name}
                    textColor="#59bf47"
                    backgroundColor="#DBF2D8"
                  />
                )}
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
                    title="Directions"
                    textColor="#59bf47"
                    backgroundColor="#DBF2D8"
                  >
                    <IconFeather name="map-pin" size={20} color={"#59bf47"} />
                  </FFBadge>
                  <FFBadge
                    title="Favorite"
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
              <FFText fontSize="lg" style={{ fontWeight: '700', marginTop: spacing.sm }}>
                {restaurantDetails?.restaurant_name}
              </FFText>
              
              {/* Ratings */}
              <View className="flex-row items-center gap-2 mt-1">
                <IconAntDesign size={20} name="star" color={"#E9A000"} />
                <FFText fontWeight="400" colorLight="#777">
                  {restaurantDetails?.rating_stats?.avg_rating?.toFixed(1) ?? "New"}
                </FFText>
                <IconFeather
                  className="ml-4"
                  size={20}
                  name="check-square"
                  color={"#59bf47"}
                />
                <FFText fontWeight="400">
                  {restaurantDetails?.total_orders ?? 0} orders
                </FFText>
              </View>

              {/* Opening Hours */}
              <View className="flex-row items-center gap-2 mt-1">
                <IconMaterialIcons size={20} name="access-time" color={"#777"} />
                <FFText fontWeight="400" colorLight="#777">
                  Today: {getCurrentDayOpeningHours()}
                </FFText>
              </View>
              
              {/* Specialties */}
              {restaurantDetails?.specialize_in && restaurantDetails.specialize_in.length > 0 && (
                <View className="flex-row flex-wrap gap-2 mt-2">
                  {restaurantDetails.specialize_in.map((specialty) => (
                    <FFBadge
                      key={specialty.id}
                      title={specialty.name}
                      textColor="#777"
                      backgroundColor="#f0f0f0"
                    />
                  ))}
                </View>
              )}

              {/* Description */}
              <FFText fontSize="sm" colorLight="#777" style={{ marginTop: spacing.sm, marginBottom: spacing.md }}>
                {restaurantDetails?.description || "No description available"}
              </FFText>
              
              {/* Promotions */}
              {restaurantDetails?.promotions && restaurantDetails.promotions.length > 0 && (
                <View style={{ marginBottom: spacing.md }}>
                  <FFText fontWeight="600" style={{ marginBottom: spacing.xs }}>Active Promotions</FFText>
                  <View className="flex-row flex-wrap gap-2">
                    {restaurantDetails.promotions.map((promo) => (
                      <FFBadge
                        key={promo.id}
                        title={`${promo.name}: ${promo.discount_value}% off`}
                        textColor="#fff"
                        backgroundColor="#E9A000"
                      />
                    ))}
                  </View>
                </View>
              )}
              
              {/* Section divider */}
              <View style={{ 
                height: 1, 
                backgroundColor: '#eee', 
                marginVertical: spacing.md 
              }} />
              
              {/* Menu items header */}
              <FFText fontWeight="600" fontSize="md" style={{ marginBottom: spacing.sm }}>
                Menu Items
              </FFText>

              {/* Menu items */}
              {restaurantMenuItem?.map((item) => (
                <FFView
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 12,
                    padding: 12,
                    borderRadius: 12,
                    marginBottom: spacing.sm,
                    backgroundColor: theme === "light" ? "#f9f9f9" : "#2a2a2a",
                  }}
                  key={item.id}
                >
                  <View className="w-1/4">
                    <FFAvatar
                      avatar={item?.avatar?.url ?? IMAGE_LINKS.DEFAULT_AVATAR_FOOD}
                      style={{
                        borderRadius: 10,
                        width: "100%",
                        height: undefined,
                        aspectRatio: 1,
                        backgroundColor: '#cedbc8',
                      }}
                      // imageStyle={{ borderRadius: 8 }}
                    ></FFAvatar>
                  </View>
                  <View className="flex-1 relative">
                    <FFText fontWeight="500">{item.name}</FFText>
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
              
              {/* Reviews section */}
              {restaurantDetails?.rating_stats?.reviews && restaurantDetails.rating_stats.reviews.length > 0 && (
                <View style={{ marginTop: spacing.lg }}>
                  <FFText fontWeight="600" fontSize="md" style={{ marginBottom: spacing.sm }}>
                    Customer Reviews ({restaurantDetails.rating_stats.total_reviews})
                  </FFText>
                  
                  {/* Review stats */}
                  <View className="flex-row justify-between mb-4 bg-gray-50 p-3 rounded-lg">
                    <View className="items-center">
                      <FFText fontWeight="700" fontSize="lg" colorLight="#59bf47">
                        {restaurantDetails.rating_stats.avg_rating.toFixed(1)}
                      </FFText>
                      <FFText fontSize="sm" colorLight="#777">Overall</FFText>
                    </View>
                    <View className="items-center">
                      <FFText fontWeight="700" fontSize="lg" colorLight="#59bf47">
                        {restaurantDetails.rating_stats.avg_food_rating.toFixed(1)}
                      </FFText>
                      <FFText fontSize="sm" colorLight="#777">Food</FFText>
                    </View>
                    <View className="items-center">
                      <FFText fontWeight="700" fontSize="lg" colorLight="#59bf47">
                        {restaurantDetails.rating_stats.avg_delivery_rating.toFixed(1)}
                      </FFText>
                      <FFText fontSize="sm" colorLight="#777">Delivery</FFText>
                    </View>
                  </View>
                  
                  {/* Reviews list - showing first 3 */}
                  {restaurantDetails?.rating_stats?.reviews?.map((review) => (
                    <View 
                      key={review.id} 
                      style={{
                        padding: spacing.sm,
                        borderBottomWidth: 1,
                        borderBottomColor: '#eee',
                        marginBottom: spacing.sm
                      }}
                    >
                      <View className="flex-row justify-between">
                        <FFText fontWeight="500">
                          {review.reviewer.name}
                        </FFText>
                        <View className="flex-row items-center">
                          <IconAntDesign size={16} name="star" color={"#E9A000"} />
                          <FFText fontSize="sm" style={{ marginLeft: 4 }}>
                            {review.food_rating}
                          </FFText>
                        </View>
                      </View>
                      <FFText fontSize="sm" colorLight="#777" style={{ marginTop: 4 }}>
                        {review.food_review}
                      </FFText>
                    </View>
                  ))}
                </View>
              )}
            </FFView>
          </FFView>
        </ScrollView>
        <FFModal
          visible={modalDetails.status !== "HIDDEN"}
          onClose={() =>
            setModalDetails({ status: "HIDDEN", desc: "", title: "" })
          }
        >
          <FFText style={{ textAlign: "center" }}>{modalDetails.title}</FFText>
          <FFText fontSize="sm" style={{ color: "#aaa", textAlign: "center" }}>
            {modalDetails.desc}
          </FFText>
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
