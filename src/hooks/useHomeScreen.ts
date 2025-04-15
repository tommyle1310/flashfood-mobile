import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "@/src/store/types";
import { RootState } from "@/src/store/store";
import axiosInstance from "@/src/utils/axiosConfig";
import {
  Restaurant,
  FoodCategory,
  AvailablePromotionWithRestaurants,
  FavoriteRestaurant,
} from "@/src/types/screens/Home";

export const useHomeScreen = () => {
  const dispatch = useDispatch();
  const globalState = useSelector((state: RootState) => state.auth);

  const [filteredRestaurants, setFilteredRestaurants] = useState<Restaurant[]>(
    []
  );
  const [selectedFoodCategories, setSelectedFoodCategories] = useState<
    string[] | null
  >(null);
  const [listFoodCategories, setListFoodCategories] = useState<
    FoodCategory[] | null
  >(null);
  const [listRestaurants, setListRestaurants] = useState<Restaurant[] | null>(
    null
  );
  const [
    availablePromotionWithRestaurants,
    setAvailablePromotionWithRestaurants,
  ] = useState<AvailablePromotionWithRestaurants[] | null>(null);
  const [favoriteRestaurants, setFavoriteRestaurants] = useState<
    FavoriteRestaurant[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [
          foodCategoriesResponse,
          restaurantsResponse,
          promotionsWithRestaurantsResponse,
        ] = await Promise.all([
          axiosInstance.get("/food-categories"),
          axiosInstance.get(`/customers/restaurants/${globalState.id}`),
          axiosInstance.get(`/promotions/valid`),
        ]);

        if (foodCategoriesResponse.data.EC === 0) {
          setListFoodCategories(foodCategoriesResponse.data.data);
        }

        if (restaurantsResponse.data.EC === 0) {
          const mappedRestaurants = restaurantsResponse.data.data.map(
            (restaurant: any) => ({
              ...restaurant,
              address: {
                ...restaurant.address,
                location: {
                  lat: restaurant.address.location.lat,
                  lng: restaurant.address.location.lon,
                },
              },
            })
          );
          setListRestaurants(mappedRestaurants);
        }

        if (promotionsWithRestaurantsResponse.data.EC === 0) {
          setAvailablePromotionWithRestaurants(
            promotionsWithRestaurantsResponse.data.data
          );
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    const fetchFavoriteRestaurantData = async () => {
      try {
        const response = await axiosInstance.get(
          `/customers/favorite-restaurants/${globalState.id}`
        );
        const { EC, data } = response.data;
        if (EC === 0) {
          setFavoriteRestaurants(data);
        }
      } catch (error) {
        console.error("Error fetching favorite restaurants:", error);
      }
    };

    if (globalState.user_id && isLoading) {
      fetchData();
      fetchFavoriteRestaurantData();
      setIsLoading(false);
    }
  }, [globalState.user_id, isLoading]);

  useEffect(() => {
    if (
      listRestaurants &&
      selectedFoodCategories &&
      selectedFoodCategories.length > 0
    ) {
      const filtered = listRestaurants?.filter((restaurant) =>
        restaurant.specialize_in?.some((category) =>
          selectedFoodCategories.includes(category.id)
        )
      );
      setFilteredRestaurants(filtered);

      if (availablePromotionWithRestaurants) {
        const filteredPromotions = availablePromotionWithRestaurants.map(
          (promotion) => {
            const restaurantsWithDetails = promotion.restaurants.filter(
              (promoRest) =>
                listRestaurants?.some(
                  (fullRest) =>
                    fullRest.id === promoRest.id &&
                    fullRest.specialize_in?.some((category) =>
                      selectedFoodCategories.includes(category.id)
                    )
                )
            );

            return {
              ...promotion,
              restaurants: restaurantsWithDetails,
            };
          }
        );
        setAvailablePromotionWithRestaurants(filteredPromotions);
      }
    } else {
      setFilteredRestaurants([]);
      const fetchPromotions = async () => {
        try {
          const response = await axiosInstance.get(`/promotions/valid`);
          if (response.data.EC === 0) {
            setAvailablePromotionWithRestaurants(response.data.data);
          }
        } catch (error) {
          console.error("Error fetching promotions:", error);
        }
      };
      fetchPromotions();
    }
  }, [selectedFoodCategories, listRestaurants]);

  const handleToggleFavorite = async (restaurantId: string) => {
    try {
      const response = await axiosInstance.patch(
        `/customers/favorite-restaurant/${globalState.id}`,
        {
          favorite_restaurant: restaurantId,
        }
      );

      if (response.data.EC === 0) {
        const fetchResponse = await axiosInstance.get(
          `/customers/favorite-restaurants/${globalState.id}`
        );
        if (fetchResponse.data.EC === 0) {
          setFavoriteRestaurants(fetchResponse.data.data);
        }
      }
    } catch (error) {
      console.error("Error toggling favorite:", error);
    }
  };

  return {
    filteredRestaurants,
    selectedFoodCategories,
    setSelectedFoodCategories,
    listFoodCategories,
    listRestaurants,
    availablePromotionWithRestaurants,
    favoriteRestaurants,
    isLoading,
    handleToggleFavorite,
  };
};
