import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
} from "react-native";
import FFSafeAreaView from "@/src/components/FFSafeAreaView";
import FFText from "@/src/components/FFText";
import FFInputControl from "@/src/components/FFInputControl";
import FFScreenTopSection from "@/src/components/FFScreenTopSection";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { MainStackParamList } from "@/src/navigation/AppNavigator";
import axiosInstance from "@/src/utils/axiosConfig";
import FFIconWithBg from "@/src/components/FFIconWithBg";
import { IMAGE_LINKS } from "@/src/assets/imageLinks";
import { spacing } from "@/src/theme";

type SearchSreenNavigationProp = StackNavigationProp<
  MainStackParamList,
  "Search"
>;

const SearchScreen = () => {
  const navigation = useNavigation<SearchSreenNavigationProp>();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const topSearches = [
    {
      title: "Coffee Shop",
      description: "A Cafe Called Rhonda: Coffee Shop in LA",
    },
    {
      title: "Vegan",
      description: "The Best Plant-Based Cafes in Sydney for 2024",
    },
    {
      title: "Japanese Dishes",
      description: "Japanese rice bowls, or donburi",
    },
  ];

  const exploreOptions = [
    { title: "News", icon: "newspaper-outline" },
    { title: "Guides", icon: "book-outline" },
    { title: "Events", icon: "calendar-outline" },
    { title: "Shops", icon: "cart-outline" },
  ];

  // Custom debounce function
  const debounce = (func: (...args: any[]) => void, delay: number) => {
    let timeout: NodeJS.Timeout;
    return (...args: any[]) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), delay);
    };
  };

  // Fetch search results
  const fetchSearchResults = async (query: string) => {
    if (!query) {
      setSearchResults([]);
      return;
    }

    setIsLoading(true);
    try {
      const response = await axiosInstance.get(
        `/customers/search-restaurants?keyword=${query}&page=1&limit=10`
      );
      const { EC, data } = response.data;
      if (EC === 0) {
        setSearchResults(data);
      }
    } catch (error) {
      console.error("Error fetching search results:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Debounced version of fetchSearchResults
  const debouncedFetchSearchResults = useCallback(
    debounce(fetchSearchResults, 500),
    []
  );

  // Effect to trigger the debounced search
  useEffect(() => {
    debouncedFetchSearchResults(searchQuery);
  }, [searchQuery, debouncedFetchSearchResults]);

  return (
    <FFSafeAreaView>
      <FFScreenTopSection title="" navigation={navigation} />
      {/* Search Input */}
      <FFInputControl
        placeholder="What are you looking for?"
        value={searchQuery}
        setValue={setSearchQuery}
        style={{ paddingHorizontal: 12, marginTop: -24 }}
      />

      {/* Search Results */}
      {searchQuery && searchResults.length > 0 && (
        <View style={styles.section}>
          <FFText fontSize="lg" fontWeight="600" style={styles.sectionTitle}>
            Search Results
          </FFText>
          <FlatList
            data={searchResults}
            keyExtractor={(item: any) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.resultItem}
                onPress={() =>
                  navigation.navigate("RestaurantDetail", {
                    restaurantId: item?.id,
                  })
                }
              >
                <Image
                  source={{
                    uri: item.avatar?.url || IMAGE_LINKS.DEFAULT_AVATAR_FOOD,
                  }}
                  style={styles.resultImage}
                />
                <View style={styles.resultDetails}>
                  <FFText fontSize="md" fontWeight="500">
                    {item.restaurant_name}
                  </FFText>
                  <FFText fontSize="sm" style={styles.resultDescription}>
                    {item.address?.street}, {item.address?.city}
                  </FFText>
                </View>
              </TouchableOpacity>
            )}
          />
        </View>
      )}

      {/* Top Searches */}
      {!searchQuery && (
        <View style={styles.section}>
          <FFText fontSize="lg" fontWeight="600" style={styles.sectionTitle}>
            Top searches
          </FFText>
          <FlatList
            data={topSearches}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity style={styles.listItem}>
                <FFText fontSize="md" fontWeight="500">
                  {item.title}
                </FFText>
                <FFText fontSize="sm" style={styles.listDescription}>
                  {item.description}
                </FFText>
              </TouchableOpacity>
            )}
          />
        </View>
      )}

      {/* Explore the City */}
      {/* <View style={styles.section}>
        <FFText fontSize="lg" fontWeight="600" style={styles.sectionTitle}>
          Explore the city
        </FFText>
        <View style={styles.exploreGrid}>
          {exploreOptions.map((option, index) => (
            <TouchableOpacity key={index} style={styles.exploreItem}>
              <FFIconWithBg
                iconName={option.icon}
                size={40}
                backgroundColor="#f5f5f5"
                iconColor="#4c9f3a"
              />
              <FFText fontSize="sm" fontWeight="500" style={styles.exploreText}>
                {option.title}
              </FFText>
            </TouchableOpacity>
          ))}
        </View>
      </View> */}
    </FFSafeAreaView>
  );
};

const styles = StyleSheet.create({
  section: {
    paddingHorizontal: spacing.lg,
    marginTop: spacing.md,
  },
  sectionTitle: {
    marginBottom: spacing.sm,
  },
  listItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  listDescription: {
    color: "#888",
    marginTop: spacing.sm,
  },
  exploreGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginTop: spacing.md,
  },
  exploreItem: {
    width: "48%",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  exploreText: {
    marginTop: spacing.sm,
    textAlign: "center",
  },
  resultItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  resultImage: {
    width: 50,
    height: 50,
    borderRadius: 8,
    marginRight: spacing.md,
  },
  resultDetails: {
    flex: 1,
    gap: spacing.sm,
  },
  resultDescription: {
    color: "#888",
    marginTop: -spacing.sm,
  },
});

export default SearchScreen;
