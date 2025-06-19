import React, { useState, useEffect } from "react";
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
import { borderRadius, colors, spacing } from "../theme";
import CoralTourCarousel from "../components/CoralTourCarousel";
import FFSkeleton from "@/src/components/FFSkeleton";
import { useSelector, useDispatch } from "../store/types";
import { RootState } from "../store/store";
import { loadTokenFromAsyncStorage } from "../store/authSlice";
import PromotionsSliderSection from "../components/screens/Home/PromotionsSliderSection";
import { IMAGE_LINKS } from "@/src/assets/imageLinks";

type HomeRestaurantSreenNavigationProp = StackNavigationProp<
  MainStackParamList,
  "BottomTabs"
>;

const HomeScreen = () => {
  const navigation = useNavigation<HomeRestaurantSreenNavigationProp>();
  const dispatch = useDispatch();
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
    filteredRestaurants && filteredRestaurants.length > 0 ? filteredRestaurants : listRestaurants;

  // Format promotions for PromotionsSliderSection
  const formattedPromotions = availablePromotionWithRestaurants?.map(promo => ({
    avatar: { 
      url: promo.restaurants?.[0]?.avatar?.url || IMAGE_LINKS?.DEFAULT_AVATAR_FOOD, 
      key: promo.id || '' 
    },
    id: promo.id,
    name: promo.name || '',
    desc: promo.description || ''
  }));

  return (
    <FFSafeAreaView>
      <ScrollView 
        style={{ 
          flex: 1,
          backgroundColor: colors.background
        }}
        contentContainerStyle={{ 
          paddingHorizontal: spacing.sm,
          paddingBottom: spacing.xxxl,
        }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ gap: spacing.md }}>
          <HeaderSection />

          <Pressable
            onPress={() => navigation.navigate("Search")}
            style={{
              backgroundColor: "#ffffff",
              borderRadius: borderRadius.input,
              paddingHorizontal: spacing.md,
              paddingVertical: spacing.md,
              marginVertical: spacing.sm,
              marginHorizontal: spacing.sm,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.05,
              shadowRadius: 8,
              elevation: 3,
              borderWidth: 1,
              borderColor: "#f0f2f5"
            }}
          >
            <FFText style={{ 
              fontSize: 16, 
              color: "#9ca3af",
              fontWeight: "400"
            }}>
              🔍 Search restaurants, food...
            </FFText>
          </Pressable>

          {/* Hot Deals Section */}
          <View style={{ width: "100%" }}>
            <View style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              paddingHorizontal: spacing.xs
            }}>
              <FFText style={{
                fontWeight: "700",
                color: "#1f2937"
              }}
              fontSize="lg"
              >
                🔥 Hot Deals
              </FFText>
            </View>
            
            <PromotionsSliderSection 
            onTap={(id) => {
              setSelectedPromotionId(id);
              const selectedPromotion = availablePromotionWithRestaurants?.find(
                (promo) => promo.id === id
              );
              if (selectedPromotion) {
                navigation.navigate("PromotionsWithRestaurant", {
                  promotionTitle: selectedPromotion.name,
                  restaurants: selectedPromotion.restaurants,
                });
              }
            }}
              promotionList={formattedPromotions}
              isLoading={loading.promotions}
            />
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
                  promotionTitle: selectedPromotion.name,
                  restaurants: selectedPromotion.restaurants,
                });
              }
            }}
            promotions={availablePromotionWithRestaurants ? availablePromotionWithRestaurants.filter(item => item?.restaurants?.length > 0) : null}
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
