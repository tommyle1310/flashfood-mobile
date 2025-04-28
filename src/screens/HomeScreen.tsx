import React, { useState } from "react";
import { View, Pressable, ScrollView } from "react-native";
import FFSafeAreaView from "@/src/components/FFSafeAreaView";
import FFText from "@/src/components/FFText";
import { useHomeScreen } from "@/src/hooks/useHomeScreen";
import { HeaderSection } from "@/src/components/screens/Home/HeaderSection";
import { CategoriesSection } from "@/src/components/screens/Home/CategoriesSection";
import { NearYouSection } from "@/src/components/screens/Home/NearYouSection";
import { PromotionsSection } from "@/src/components/screens/Home/PromotionsSection";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { MainStackParamList } from "@/src/navigation/AppNavigator";
import { spacing } from "../theme";
import CoralTourCarousel from "../components/CoralTourCarousel";
import FFSkeleton from "@/src/components/FFSkeleton";

type HomeRestaurantSreenNavigationProp = StackNavigationProp<
  MainStackParamList,
  "BottomTabs"
>;

const HomeScreen = () => {
  const navigation = useNavigation<HomeRestaurantSreenNavigationProp>();
  const [selectedPromotionId, setSelectedPromotionId] = useState<string | null>(
    null
  );
  const {
    filteredRestaurants,
    selectedFoodCategories,
    handleToggleFavorite,
    setSelectedFoodCategories,
    listFoodCategories,
    listRestaurants,
    availablePromotionWithRestaurants,
    favoriteRestaurants,
    loading,
  } = useHomeScreen();

  const renderedRestaurants =
    filteredRestaurants?.length > 0 ? filteredRestaurants : listRestaurants;

  return (
    <FFSafeAreaView>
      <ScrollView className="p-4 gap-6" style={{ gap: spacing.md }}>
        <View style={{ gap: spacing.md }}>
          <HeaderSection />

          <Pressable
            onPress={() => navigation.navigate("Search")}
            className="bg-gray-200 rounded-lg border border-gray-300 p-4 my-4"
          >
            <FFText style={{ fontSize: 14, color: "#aaa" }}>
              Search anything...
            </FFText>
          </Pressable>

          <View
            style={{
              width: "100%",
              paddingRight: spacing.lg,
            }}
          >
            <FFText>Hot Deals</FFText>
            {loading.promotions ? (
              <View style={{ flexDirection: "row", gap: spacing.md }}>
                <FFSkeleton width={200} height={100} />
                <FFSkeleton width={200} height={100} />
              </View>
            ) : (
              <CoralTourCarousel
                onTap={(id) => {
                  setSelectedPromotionId(id);
                  const selectedPromotion =
                    availablePromotionWithRestaurants?.find(
                      (promo) => promo.id === id
                    );
                  if (selectedPromotion) {
                    navigation.navigate("PromotionsWithRestaurant", {
                      promotionTitle: availablePromotionWithRestaurants?.find(
                        (promo) => promo.id === id
                      )?.name,
                      restaurants: selectedPromotion.restaurants,
                    });
                  }
                }}
                imageUrls={availablePromotionWithRestaurants?.map(
                  (item) => item.avatar.url
                )}
                itemIds={availablePromotionWithRestaurants?.map(
                  (item) => item.id
                )}
              />
            )}
          </View>

          <CategoriesSection
            listFoodCategories={listFoodCategories}
            selectedFoodCategories={selectedFoodCategories}
            setSelectedFoodCategories={setSelectedFoodCategories}
            isLoading={loading.foodCategories}
          />

          <NearYouSection
            restaurants={renderedRestaurants}
            favoriteRestaurants={favoriteRestaurants}
            handleToggleFavorite={handleToggleFavorite}
            isLoading={loading.restaurants}
          />

          <PromotionsSection
            onTap={(id) => {
              setSelectedPromotionId(id);
              const selectedPromotion = availablePromotionWithRestaurants?.find(
                (promo) => promo.id === id
              );
              if (selectedPromotion) {
                navigation.navigate("PromotionsWithRestaurant", {
                  promotionTitle: availablePromotionWithRestaurants?.find(
                    (promo) => promo.id === id
                  )?.name,
                  restaurants: selectedPromotion.restaurants,
                });
              }
            }}
            promotions={availablePromotionWithRestaurants}
            favoriteRestaurants={favoriteRestaurants}
            handleToggleFavorite={handleToggleFavorite}
            isLoading={loading.promotions}
          />
        </View>
      </ScrollView>
    </FFSafeAreaView>
  );
};

export default HomeScreen;
