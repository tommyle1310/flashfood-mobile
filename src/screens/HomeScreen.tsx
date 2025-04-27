import React from "react";
import { View, Pressable, ScrollView } from "react-native";
import FFSafeAreaView from "@/src/components/FFSafeAreaView";
import FFText from "@/src/components/FFText";
import { useHomeScreen } from "@/src/hooks/useHomeScreen";
import { HeaderSection } from "@/src/components/screens/Home/HeaderSection";
import { CategoriesSection } from "@/src/components/screens/Home/CategoriesSection";
import { NearYouSection } from "@/src/components/screens/Home/NearYouSection";
import { PromotionsSection } from "@/src/components/screens/Home/PromotionsSection";
import { PromotionsSliderSection } from "@/src/components/screens/Home/PromotionsSliderSection";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { MainStackParamList } from "@/src/navigation/AppNavigator";
import { spacing } from "../theme";
import CoralTourCarousel from "../components/CoralTourCarousel";

type HomeRestaurantSreenNavigationProp = StackNavigationProp<
  MainStackParamList,
  "BottomTabs"
>;

const HomeScreen = () => {
  const navigation = useNavigation<HomeRestaurantSreenNavigationProp>();
  const {
    filteredRestaurants,
    selectedFoodCategories,
    setSelectedFoodCategories,
    listFoodCategories,
    listRestaurants,
    availablePromotionWithRestaurants,
    favoriteRestaurants,
    isLoading,
    handleToggleFavorite,
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
            <CoralTourCarousel
              imageUrls={availablePromotionWithRestaurants?.map(
                (item) => item.avatar.url
              )}
            />
          </View>

          <CategoriesSection
            listFoodCategories={listFoodCategories}
            selectedFoodCategories={selectedFoodCategories}
            setSelectedFoodCategories={setSelectedFoodCategories}
            isLoading={isLoading}
          />

          <NearYouSection
            restaurants={renderedRestaurants}
            favoriteRestaurants={favoriteRestaurants}
            handleToggleFavorite={handleToggleFavorite}
            isLoading={isLoading}
          />

          <PromotionsSection
            promotions={availablePromotionWithRestaurants}
            favoriteRestaurants={favoriteRestaurants}
            handleToggleFavorite={handleToggleFavorite}
            isLoading={isLoading}
          />
        </View>
      </ScrollView>
    </FFSafeAreaView>
  );
};

export default HomeScreen;
