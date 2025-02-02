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
import { HomeStackParamList } from "@/src/navigation/AppNavigator";
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

// Correct the typing for useRoute
type RestaurantDetailRouteProp = RouteProp<
  HomeStackParamList,
  "RestaurantDetail"
>;

const RestaurantDetail = () => {
  const navigation =
    useNavigation<
      StackNavigationProp<HomeStackParamList, "RestaurantDetail">
    >();

  const listFavoriteRestaurants = useSelector(
    (state: RootState) => state.userPreference.favorite_restaurants
  );
  const user_id = useSelector((state: RootState) => state.auth.user_id);

  const route = useRoute<RestaurantDetailRouteProp>();
  const { restaurantId } = route.params;
  const [restaurantDetails, setRestaurantDetails] =
    useState<Props_RestaurantDetails>();
  const [restaurantMenuItem, setRestaurantMenuItem] =
    useState<Props_MenuItem[]>();
  const [isShowSlideUpModal, setIsShowSlideUpModal] = useState<boolean>(false);
  const [selectedMenuItem, setSelectedMenuItem] = useState<string | null>(null);
  const [modalData, setModalData] = useState<MenuItemProps>();
  const [selectedVariant, setSeletedVariant] = useState<any>(null);
  const [totalPrice, setTotalPrice] = useState<number>(0);
  const [quantity, setQuantity] = useState<number>(1);
  const [itemPrice, setItemPrice] = useState<number | null>(0);
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
      setItemPrice(modalData?.menuItem?.price);
    }
  }, [modalData]);

  // Update totalPrice when itemPrice or quantity or selectedVariant changes
  useEffect(() => {
    // If there's a selected variant, use its price, else fallback to itemPrice
    const priceToUse = selectedVariant?.price ?? itemPrice;
    if (quantity && priceToUse) {
      setTotalPrice(quantity * priceToUse);
    }
  }, [quantity, itemPrice, selectedVariant?.price]);
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchMenuItemDetails = async () => {
      const response = await axiosInstance.get(
        `/menu-items/${selectedMenuItem}`
      );
      const { EC, EM, data } = response.data;
      if (EC === 0) {
        setModalData(data);
      }
    };
    if (isShowSlideUpModal) {
      fetchMenuItemDetails();
    }
  }, [isShowSlideUpModal]);
  const listCartItem = useSelector(
    (state: RootState) => state.userPreference.cart_items
  );

  const handleAddToCart = async () => {
    const response = await axiosInstance.post(
      `/customers/cart-items/${user_id}`,
      {
        item_id: selectedMenuItem,
        variants: [{ variant_id: selectedVariant?._id, quantity }],
      }
    );

    const { EC, EM, data } = response.data;

    if (EC === 0) {
      dispatch(
        addItemToCart({
          _id: data._id,
          customer_id: user_id,
          variants: [
            {
              variant_id: selectedVariant?._id,
              quantity,
              variant_name: data.variants[0].variant_name,
              variant_price_at_time_of_addition:
                data.variants[0].variant_price_at_time_of_addition,
            },
          ],
          item: {
            // avatar: { url: data.avatar.url, key: data.avatar.key },
            _id: data.item_id,
            restaurant_id: data.restaurant_id,
            restaurantDetails: {
              _id: restaurantId,
              restaurant_name: restaurantDetails?.restaurant_name,
              avatar: {
                url: restaurantDetails?.avatar.url,
                key: restaurantDetails?.avatar.key,
              },
            },
            name: modalData?.menuItem.name,
            description: "",
            category: modalData?.menuItem.category,
            availability: true,
            suggest_notes: modalData?.menuItem.suggest_notes,
            purchase_count: 1,
          },
        })
      );
    }
  };
  useEffect(() => {
    dispatch(loadCartItemsFromAsyncStorage());
  }, [dispatch]);

  useEffect(() => {
    dispatch(saveCartItemsToAsyncStorage(listCartItem));
  }, [listCartItem]);

  return (
    <FFSafeAreaView>
      <View style={{ flex: 1, position: "relative" }}>
        {/* Fixed Back Button */}
        <TouchableOpacity
          onPress={() => navigation.navigate("Home")}
          style={{
            position: "absolute",
            top: 20,
            left: 20,
            zIndex: 10, // Keeps the button on top
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
          <View style={{ position: "relative", backgroundColor: "#F5F5F5" }}>
            {/* avatar / image gallery */}
            <View className="flex-col gap-4 h-72 relative">
              <ImageBackground
                source={{
                  uri: restaurantDetails?.avatar?.url,
                }}
                style={{
                  flex: 1,
                  backgroundColor: "gray",
                  position: "relative",
                }}
                imageStyle={{ borderRadius: 8 }}
              ></ImageBackground>
            </View>
            <View className="p-4 bg-gray-100 -mt-4 rounded-t-2xl flex-1 gap-4">
              {/* some badges */}
              <View className="flex-row justify-between items-center">
                <FFBadge
                  title="Popular"
                  textColor="#59bf47"
                  backgroundColor="#DBF2D8"
                />
                <View className="flex-row gap-2 items-center">
                  <FFBadge
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
                        listFavoriteRestaurants?.includes(restaurantId)
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
                  4.8 rating
                </FFText>
                <IconFeather
                  className="ml-4"
                  size={20}
                  name="check-square"
                  color={"#59bf47"}
                />
                <FFText fontWeight="400">2000+ orders</FFText>
              </View>

              {/* Description */}
              <FFText fontSize="sm" colorLight="#999">
                {restaurantDetails?.description}
              </FFText>

              {/* Menu items */}
              {restaurantMenuItem?.map((item) => (
                <Pressable
                  key={item._id}
                  className="flex-row items-center gap-2 p-2 rounded-lg bg-white"
                >
                  <View className="w-1/4">
                    <ImageBackground
                      source={{
                        uri: item?.avatar?.url,
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
                  </View>
                  <View className="flex-1 relative">
                    <FFText>{item.name}</FFText>
                    <FFText fontSize="sm" colorLight="#bbb" fontWeight="400">
                      {item.purchased_count ?? "0"} sold
                    </FFText>
                    <FFText fontSize="lg" colorLight="#59bf47" fontWeight="600">
                      ${item?.variants?.[0]?.price}
                    </FFText>
                    <Pressable
                      onPress={() => {
                        setIsShowSlideUpModal(true);
                        setSelectedMenuItem(item._id);
                      }}
                      className="p-1 -bottom-2 right-0 absolute rounded-md bg-green-500 self-end items-center justify-center"
                    >
                      <IconFeather name="plus" color="#fff" size={20} />
                    </Pressable>
                  </View>
                </Pressable>
              ))}
            </View>
          </View>
        </ScrollView>
      </View>

      {/* slide up modal */}
      <SlideUpModal
        isVisible={isShowSlideUpModal}
        onClose={() => {
          setIsShowSlideUpModal(false);
          setSeletedVariant(null);
        }}
      >
        <FFText style={{ textAlign: "center" }} fontSize="lg">
          Add To cart{" "}
        </FFText>
        <View className="flex-row items-center gap-2 rounded-lg">
          <View className="w-1/4">
            <ImageBackground
              source={{
                uri: modalData?.menuItem?.avatar?.url,
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
          </View>
          <View className="flex-1 relative ">
            <FFText>{modalData?.menuItem?.name}</FFText>
            <FFText fontSize="sm" colorLight="#bbb" fontWeight="400">
              {modalData?.menuItem?.purchase_count} sold
            </FFText>
            <FFText fontSize="lg" colorLight="#59bf47" fontWeight="600">
              ${totalPrice}
            </FFText>
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
                className="items-center top-2 mx-2 justify-center"
                value={`${quantity}`}
                onChangeText={() => {}}
              />

              {/* Plus Button */}
              <Pressable
                onPress={() => {
                  setIsShowSlideUpModal(true);
                  setQuantity((prev) => prev + 1);
                }}
                className="p-1  rounded-md bg-green-500 self-end items-center justify-center"
              >
                <IconFeather name="plus" color="#fff" size={20} />
              </Pressable>
            </View>
          </View>
        </View>
        <View className="h-1/2 ">
          <ScrollView className="my-4 ">
            {modalData?.variants &&
              modalData?.variants.length > 0 &&
              modalData?.variants.map((item) => (
                <Pressable
                  onPress={() => {
                    setSeletedVariant(item);
                    setItemPrice(item?.price);
                  }}
                  className={`gap-4  p-4 ${
                    selectedVariant?._id === item._id
                      ? "bg-white border-green-600 border-2"
                      : "bg-gray-100"
                  } rounded-lg my-2`}
                  key={item._id}
                >
                  <FFText style={{ textAlign: "left" }}>
                    {item?.variant} - ${item?.price}
                  </FFText>
                </Pressable>
              ))}
          </ScrollView>
        </View>
        <FFButton onPress={handleAddToCart} isLinear className="w-full">
          <FFText style={{ color: "#fff" }}>Add to Cart</FFText>
        </FFButton>
      </SlideUpModal>
    </FFSafeAreaView>
  );
};

export default RestaurantDetail;
