import React, { useCallback } from "react";
import { View, TouchableOpacity, ScrollView, StyleSheet } from "react-native";
import FFText from "@/src/components/FFText";
import FFSkeleton from "@/src/components/FFSkeleton";
import FFAvatar from "@/src/components/FFAvatar";
import { FoodCategory } from "@/src/types/screens/Home";
import { colors, spacing } from "@/src/theme";
import IconFeather from "react-native-vector-icons/Feather";
import { IMAGE_LINKS } from "@/src/assets/imageLinks";

interface CategoriesSectionProps {
  listFoodCategories: FoodCategory[] | null;
  selectedFoodCategories: string[] | null;
  setSelectedFoodCategories: (categories: string[] | null) => void;
  isLoading: boolean;
}

export const CategoriesSection = ({
  listFoodCategories,
  selectedFoodCategories,
  setSelectedFoodCategories,
  isLoading,
}: CategoriesSectionProps) => {
  // Optimize with useCallback to prevent unnecessary re-renders
  const handleCategoryPress = useCallback((categoryId: string) => {
    const currentSelected = selectedFoodCategories ?? [];
    const newSelected = currentSelected.includes(categoryId)
      ? currentSelected.filter((id) => id !== categoryId)
      : [...currentSelected, categoryId];
    setSelectedFoodCategories(newSelected);
  }, [selectedFoodCategories, setSelectedFoodCategories]);

  // Split categories into two rows for a grid layout
  const getGridRows = () => {
    if (!listFoodCategories || listFoodCategories.length === 0) return [[], []];
    
    const midpoint = Math.ceil(listFoodCategories.length / 2);
    const firstRow = listFoodCategories.slice(0, midpoint);
    const secondRow = listFoodCategories.slice(midpoint);
    
    return [firstRow, secondRow];
  };

  const [firstRow, secondRow] = getGridRows();

  // Helper to safely get the category image URL
  const getCategoryImage = (category: FoodCategory): string | undefined => {
    // Try to access image URL from various possible properties
    if (typeof category === 'object' && category !== null) {
      // @ts-ignore - We're checking properties dynamically
      return category.image || 
             // @ts-ignore
             (category.avatar && category.avatar.url) || 
             // @ts-ignore
             category.imageUrl || 
             // @ts-ignore
             category.icon ||
             undefined;
    }
    return undefined;
  };

  // Render category item to optimize performance
  const renderCategoryItem = useCallback((item: FoodCategory, isSelected: boolean) => {
    return (
      <TouchableOpacity
        key={item.id}
        onPress={() => handleCategoryPress(item.id)}
        activeOpacity={0.7}
        hitSlop={{ top: 10, bottom: 10, left: 5, right: 5 }}
        style={
          isSelected
            ? {...styles.categoryItem, ...styles.categoryItemSelected}
            : styles.categoryItem
        }
      >
        <View style={
          isSelected
            ? {...styles.iconContainer, ...styles.iconContainerSelected}
            : styles.iconContainer
        }>
          <FFAvatar 
          onPress={() => handleCategoryPress(item.id)}
            size={48}
            avatar={getCategoryImage(item)}
            rounded="full"
          />
        </View>
        <FFText
          style={
            isSelected
              ? {...styles.categoryText, ...styles.categoryTextSelected}
              : styles.categoryText
          }
        >
          {item.name}
        </FFText>
      </TouchableOpacity>
    );
  }, [handleCategoryPress]);

  return (
    <View style={styles.container}>
      {/* Header Section */}
      <View style={styles.headerContainer}>
        <View style={styles.titleContainer}>
          <View style={styles.titleIconContainer}>
            <IconFeather name="grid" size={16} color="#ffffff" />
          </View>
          <FFText style={styles.title} fontSize="lg">
            Categories
          </FFText>
        </View>
        
        <TouchableOpacity 
          style={styles.viewAllButton}
          activeOpacity={0.7}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <FFText style={styles.viewAllText}>
            View All
          </FFText>
          <IconFeather name="chevron-right" size={14} color="#d97706" />
        </TouchableOpacity>
      </View>

      {/* Categories Grid */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <View style={styles.skeletonRow}>
            <FFSkeleton width={70} height={70} style={styles.skeleton} />
            <FFSkeleton width={70} height={70} style={styles.skeleton} />
            <FFSkeleton width={70} height={70} style={styles.skeleton} />
            <FFSkeleton width={70} height={70} style={styles.skeleton} />
          </View>
          <View style={styles.skeletonRow}>
            <FFSkeleton width={70} height={70} style={styles.skeleton} />
            <FFSkeleton width={70} height={70} style={styles.skeleton} />
            <FFSkeleton width={70} height={70} style={styles.skeleton} />
            <FFSkeleton width={70} height={70} style={styles.skeleton} />
          </View>
        </View>
      ) : (
        <View style={styles.gridContainer}>
          {/* First Row */}
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.rowContainer}
            scrollEventThrottle={16}
            keyboardShouldPersistTaps="handled"
            removeClippedSubviews={false}
          >
            {firstRow.map((item) => 
              renderCategoryItem(item, selectedFoodCategories?.includes(item.id) || false)
            )}
          </ScrollView>
          
          {/* Second Row */}
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.rowContainer}
            scrollEventThrottle={16}
            keyboardShouldPersistTaps="handled"
            removeClippedSubviews={false}
          >
            {secondRow.map((item) => 
              renderCategoryItem(item, selectedFoodCategories?.includes(item.id) || false)
            )}
          </ScrollView>
          
          {/* Empty State */}
          {listFoodCategories?.length === 0 && (
            <View style={styles.emptyContainer}>
              <IconFeather name="tag" size={24} color="#9ca3af" />
              <FFText style={styles.emptyText}>
                No categories found
              </FFText>
            </View>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
    paddingHorizontal: spacing.sm,
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.sm,
  },
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  titleIconContainer: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.sm,
  },
  title: {
    fontWeight: "700",
    color: "#1f2937",
  },
  viewAllButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fef3c7",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#fde68a",
  },
  viewAllText: {
    color: "#d97706",
    fontWeight: "600",
    fontSize: 13,
    marginRight: spacing.xs,
  },
  gridContainer: {
    gap: spacing.sm,
  },
  rowContainer: {
    paddingVertical: spacing.xs,
    paddingHorizontal: 2, // Add a bit of padding to improve touch area
  },
  categoryItem: {
    alignItems: "center",
    width: 80, // Increased width for better touch target
    height: 90, // Fixed height to ensure consistent touch area
    marginRight: spacing.sm,
    paddingHorizontal: 5,
    paddingVertical: 5,
    justifyContent: "center", // Center content vertically
    minWidth: 80, // Minimum width for touch target
    minHeight: 90, // Minimum height for touch target
  },
  categoryItemSelected: {
    // Removed transform scale which can cause performance issues
    // Instead use a more subtle visual indicator
    backgroundColor: 'rgba(0,0,0,0.03)',
    borderRadius: 10,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.xs,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    overflow: "hidden",
  },
  iconContainerSelected: {
    borderColor: colors.primary_dark,
    borderWidth: 2,
    shadowOpacity: 0.15,
    elevation: 4,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#374151",
    textAlign: "center",
    width: '100%',
  },
  categoryTextSelected: {
    color: colors.primary,
    fontWeight: "700",
  },
  loadingContainer: {
    gap: spacing.md,
  },
  skeletonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: spacing.xs,
  },
  skeleton: {
    borderRadius: 20,
    marginRight: spacing.md,
  },
  emptyContainer: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: spacing.xl,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#e5e7eb",
    borderStyle: "dashed",
    marginTop: spacing.sm,
  },
  emptyText: {
    color: "#9ca3af",
    fontSize: 16,
    fontWeight: "500",
    marginTop: spacing.sm,
  },
});
