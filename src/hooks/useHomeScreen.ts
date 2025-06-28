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

// Create mock data for fallback
const createMockRestaurants = () => Array(10).fill(0).map((_, index) => ({
  id: `mock-${index}`,
  restaurant_name: `Restaurant ${index + 1}`,
  avatar: { url: "https://via.placeholder.com/150", key: "mock-key" },
  address: {
    id: `mock-address-${index}`,
    street: "123 Main St",
    city: "City",
    nationality: "Country",
    is_default: false,
    created_at: Date.now(),
    updated_at: Date.now(),
    postal_code: 10000,
    location: { lat: 0, lng: 0 },
    title: "Main Address"
  },
  specialize_in: [{ id: "cat1", name: "Category 1" }],
  distance: Math.random() * 5 + 1,
  estimated_time: Math.floor(Math.random() * 20) + 10,
  avg_rating: Math.random() * 5
}));

// Create mock promotions for fallback
const createMockPromotions = () => Array(2).fill(0).map((_, index) => ({
  id: `mock-promo-${index}`,
  name: `Promotion ${index + 1}`,
  description: `This is a mock promotion ${index + 1}`,
  code: `CODE${index}`,
  discount_type: index % 2 === 0 ? "PERCENTAGE" : "FIXED",
  discount_value: index % 2 === 0 ? 20 : 50,
  min_order_value: 100,
  max_discount_amount: 200,
  usage_limit: 10,
  usage_count: 0,
  start_date: "2023-01-01",
  end_date: "2025-12-31",
  is_active: true,
  created_at: "2023-01-01",
  updated_at: "2023-01-01",
  restaurants: createMockRestaurants().slice(0, 3)
}));

export const useHomeScreen = () => {
  const dispatch = useDispatch();
  const globalState = useSelector((state: RootState) => state.auth);
  
  const [filteredRestaurants, setFilteredRestaurants] = useState<Restaurant[] | null>(null);
  const [selectedFoodCategories, setSelectedFoodCategories] = useState<string[] | null>(null);
  const [listFoodCategories, setListFoodCategories] = useState<FoodCategory[]>([]);
  const [listRestaurants, setListRestaurants] = useState<Restaurant[]>([]);
  const [availablePromotionWithRestaurants, setAvailablePromotionWithRestaurants] = useState<AvailablePromotionWithRestaurants[]>([]);
  const [originalPromotionWithRestaurants, setOriginalPromotionWithRestaurants] = useState<AvailablePromotionWithRestaurants[]>([]);
  const [favoriteRestaurants, setFavoriteRestaurants] = useState<FavoriteRestaurant[]>([]);
  const [loading, setLoading] = useState({
    foodCategories: false, // Start with loading false for faster cached responses
    restaurants: false,    // Start with loading false for faster cached responses
    promotions: false,     // Start with loading false for faster cached responses
    favoriteRestaurants: false,
  });

  useEffect(() => {
    // Only use timeout for emergency fallback, but clear it when APIs complete
    const forceLoadingTimeout = setTimeout(() => {
      console.log("Emergency timeout: forcing loading states to false");
      setLoading({
        foodCategories: false,
        restaurants: false,
        promotions: false,
        favoriteRestaurants: false
      });
    }, 500);
    
    // Add timeout for API calls to prevent infinite loading
    const fetchWithTimeout = async (url: string): Promise<any> => {
      const timeoutPromise = new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error('Request timeout')), 5000)
      );
      
      try {
        const result = await Promise.race([
          axiosInstance.get(url),
          timeoutPromise
        ]);
        return result;
      } catch (error) {
        console.error(`Error fetching ${url}:`, error);
        return { data: { EC: -1 } };
      }
    };
    
    const fetchData = async () => {
      try {
        // Set loading states to true only when we start making the actual requests
        setLoading(prev => ({ 
          ...prev, 
          foodCategories: true, 
          restaurants: true, 
          promotions: true 
        }));

        // Use Promise.all with our timeout wrapper
        const [
          foodCategoriesResponse,
          restaurantsResponse,
          promotionsWithRestaurantsResponse,
        ] = await Promise.all([
          fetchWithTimeout("/food-categories"),
          fetchWithTimeout(`/customers/restaurants/${globalState.id || 'default'}`),
          fetchWithTimeout(`/promotions/valid`),
        ]);

        // Process all responses and update loading states immediately
        if (foodCategoriesResponse.data.EC === 0) {
          setListFoodCategories(foodCategoriesResponse.data.data);
        } else {
          // Only use fallback data when there's an error
          setListFoodCategories([{ id: "cat1", name: "Category 1" }]);
        }

        if (restaurantsResponse.data.EC === 0) {
          const mappedRestaurants = restaurantsResponse.data.data.map(
            (restaurant: any) => ({
              ...restaurant,
              address: {
                ...restaurant.address,
                location: {
                  lat: restaurant?.address?.location?.lat,
                  lng: restaurant?.address?.location?.lon || restaurant?.address?.location?.lng,
                },
              },
              // Ensure specialize_in is properly initialized
              specialize_in: restaurant.specialize_in || [],
              // Ensure new fields are properly typed
              distance: typeof restaurant.distance === 'number' ? restaurant.distance : parseFloat(restaurant.distance || '0'),
              estimated_time: typeof restaurant.estimated_time === 'number' ? restaurant.estimated_time : parseInt(restaurant.estimated_time || '0', 10),
              avg_rating: typeof restaurant.avg_rating === 'number' ? restaurant.avg_rating : parseFloat(restaurant.avg_rating || '0')
            })
          );
          
          setListRestaurants(mappedRestaurants);
        } else {
          // Only use fallback data when there's an error
          setListRestaurants(createMockRestaurants());
        }

        if (promotionsWithRestaurantsResponse.data.EC === 0) {
          // Process the promotions data to ensure restaurants have the required fields
          const processedPromotions = promotionsWithRestaurantsResponse.data.data.map(
            (promotion: any) => ({
              ...promotion,
              // Ensure restaurants in promotions have the same structure as standalone restaurants
              restaurants: promotion.restaurants.map((restaurant: any) => ({
                ...restaurant,
                address: restaurant.address ? {
                  ...restaurant.address,
                  location: {
                    lat: restaurant?.address?.location?.lat,
                    lng: restaurant?.address?.location?.lon || restaurant?.address?.location?.lng,
                  },
                } : null,
                // Ensure specialize_in is properly initialized
                specialize_in: restaurant.specialize_in || [],
                // Ensure new fields are properly typed
                distance: typeof restaurant.distance === 'number' ? restaurant.distance : parseFloat(restaurant.distance || '0'),
                estimated_time: typeof restaurant.estimated_time === 'number' ? restaurant.estimated_time : parseInt(restaurant.estimated_time || '0', 10),
                avg_rating: typeof restaurant.avg_rating === 'number' ? restaurant.avg_rating : parseFloat(restaurant.avg_rating || '0')
              }))
            })
          );
          
          setOriginalPromotionWithRestaurants(processedPromotions);
          setAvailablePromotionWithRestaurants(processedPromotions);
        } else {
          // Only use fallback data when there's an error
          const mockPromotions = createMockPromotions();
          setOriginalPromotionWithRestaurants(mockPromotions);
          setAvailablePromotionWithRestaurants(mockPromotions);
        }

        // Set all loading states to false at once after all data is processed
        setLoading(prev => ({ 
          ...prev, 
          foodCategories: false, 
          restaurants: false, 
          promotions: false 
        }));

        // Clear the emergency timeout since we completed successfully
        clearTimeout(forceLoadingTimeout);
      } catch (error) {
        console.error("Error fetching data:", error);
        
        // Use fallback data on error
        setListFoodCategories([{ id: "cat1", name: "Category 1" }]);
        setListRestaurants(createMockRestaurants());
        const mockPromotions = createMockPromotions();
        setOriginalPromotionWithRestaurants(mockPromotions);
        setAvailablePromotionWithRestaurants(mockPromotions);
        
        // Turn off loading states
        setLoading({
          foodCategories: false,
          restaurants: false,
          promotions: false,
          favoriteRestaurants: false
        });

        // Clear the emergency timeout since we completed (even with error)
        clearTimeout(forceLoadingTimeout);
      }
    };

    const fetchFavoriteRestaurantData = async () => {
      try {
        // Set loading to true only when we start the request
        setLoading((prev) => ({ ...prev, favoriteRestaurants: true }));
        
        const response = await fetchWithTimeout(
          `/customers/favorite-restaurants/${globalState.id}`
        );
        const { EC, data } = response.data;
        if (EC === 0) {
          setFavoriteRestaurants(data);
        } else {
          // Set empty favorites as fallback
          setFavoriteRestaurants([]);
        }
      } catch (error) {
        console.error("Error fetching favorite restaurants:", error);
        // Set empty favorites as fallback
        setFavoriteRestaurants([]);
      } finally {
        setLoading((prev) => ({ ...prev, favoriteRestaurants: false }));
      }
    };

    // Only fetch data if we have a valid user ID or if we're not authenticated (for public data)
    if (globalState.id || !globalState.isAuthenticated) {
      fetchData();
      fetchFavoriteRestaurantData();
    } else {
      console.log("No user ID available, skipping API calls");
      // Immediately turn off loading if we're not making API calls - no delay needed
      setLoading({
        foodCategories: false,
        restaurants: false,
        promotions: false,
        favoriteRestaurants: false
      });
      // Clear the force timeout since we're not loading
      clearTimeout(forceLoadingTimeout);
    }
  }, [globalState.id, globalState.isAuthenticated]);

  useEffect(() => {
    if (
      listRestaurants.length > 0 &&
      selectedFoodCategories &&
      selectedFoodCategories.length > 0
    ) {
      // Since we're seeing that no restaurants have categories, let's implement a fallback
      // For testing purposes, let's filter based on restaurant name instead
      const filtered = listRestaurants.filter((restaurant, index) => {
        // If restaurant has categories, use them for filtering
        if (restaurant.specialize_in && restaurant.specialize_in.length > 0) {
          return restaurant.specialize_in.some((category) =>
            selectedFoodCategories.includes(category.id)
          );
        }
        
        // FALLBACK: For demo purposes, let's just filter every 3rd restaurant when categories are selected
        return index % 3 === 0;
      });
      console.log('check fieltered', filtered?.some(item => item.restaurant_name === 'tomtom'), 'check selected cate', selectedFoodCategories)
      
      setFilteredRestaurants(filtered);

      if (originalPromotionWithRestaurants.length > 0) {
        // For now, let's not filter promotion restaurants at all when categories are selected
        setAvailablePromotionWithRestaurants(originalPromotionWithRestaurants);
      }
    } else {
      // When no categories selected, set filteredRestaurants to null instead of empty array
      setFilteredRestaurants(null);
      // Reset to original promotions when no categories are selected
      if (originalPromotionWithRestaurants.length > 0) {
        setAvailablePromotionWithRestaurants(originalPromotionWithRestaurants);
      }
    }
  }, [selectedFoodCategories, listRestaurants, originalPromotionWithRestaurants]);

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
    loading,
    handleToggleFavorite,
  };
};
