import React from "react";
import { View, TouchableOpacity, ScrollView } from "react-native";
import FFText from "@/src/components/FFText";
import FFSkeleton from "@/src/components/FFSkeleton";
import { FoodCategory } from "@/src/types/screens/Home";
import { colors, spacing } from "@/src/theme";

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
  const handleCategoryPress = (categoryId: string) => {
    const currentSelected = selectedFoodCategories ?? [];
    const newSelected = currentSelected.includes(categoryId)
      ? currentSelected.filter((id) => id !== categoryId)
      : [...currentSelected, categoryId];
    setSelectedFoodCategories(newSelected);
  };

  return (
    <View style={{ marginBottom: spacing.sm }}>
      <View style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        // marginBottom: spacing.sm,
        paddingHorizontal: spacing.xs
      }}>
        <FFText style={{
          fontSize: 22,
          fontWeight: "700",
          color: "#1f2937"
        }}>
          🍕 Categories
        </FFText>
        <TouchableOpacity
          style={{
            backgroundColor: "#fef3c7",
            paddingHorizontal: spacing.md,
            paddingVertical: spacing.sm,
            borderRadius: 20,
            borderWidth: 1,
            borderColor: "#fde68a"
          }}
        >
          <FFText style={{ 
            color: "#d97706", 
            fontWeight: "600", 
            fontSize: 13
          }}>
            View All
          </FFText>
        </TouchableOpacity>
      </View>
      {isLoading ? (
        <View
          style={{
            flexDirection: "row",
            gap: spacing.md,
            paddingVertical: spacing.sm,
            paddingHorizontal: spacing.sm
          }}
        >
          <FFSkeleton width={100} height={40} style={{ borderRadius: 20 }} />
          <FFSkeleton width={120} height={40} style={{ borderRadius: 20 }} />
          <FFSkeleton width={90} height={40} style={{ borderRadius: 20 }} />
        </View>
      ) : (
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: spacing.sm,
            paddingVertical: spacing.sm,
            gap: spacing.sm
          }}
        >
          {listFoodCategories?.map((item) => (
            <TouchableOpacity
              key={item.id}
              onPress={() => handleCategoryPress(item.id)}
              style={{
                paddingHorizontal: spacing.sm,
                paddingVertical: spacing.sm,
                borderRadius: 25,
                backgroundColor: selectedFoodCategories?.includes(item.id)
                  ? colors.primary
                  : "#ffffff",
                borderWidth: 2,
                borderColor: selectedFoodCategories?.includes(item.id)
                  ? colors.primary_dark
                  : "#e5e7eb",
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: selectedFoodCategories?.includes(item.id) ? 0.15 : 0.05,
                shadowRadius: 8,
                elevation: selectedFoodCategories?.includes(item.id) ? 4 : 2,
                minWidth: 80,
                alignItems: "center",
                justifyContent: "center"
              }}
            >
              <FFText
                style={{
                  fontSize: 15,
                  fontWeight: "600",
                  color: selectedFoodCategories?.includes(item.id)
                    ? "#ffffff"
                    : "#374151",
                  textAlign: "center"
                }}
              >
                {item.name}
              </FFText>
            </TouchableOpacity>
          ))}
          {listFoodCategories?.length === 0 && (
            <View style={{
              backgroundColor: "#ffffff",
              borderRadius: 16,
              padding: spacing.xl,
              alignItems: "center",
              justifyContent: "center",
              minWidth: 200,
              borderWidth: 2,
              borderColor: "#e5e7eb",
              borderStyle: "dashed"
            }}>
              <FFText style={{
                color: "#9ca3af",
                fontSize: 16,
                fontWeight: "500"
              }}>
                🏷️ No categories found
              </FFText>
            </View>
          )}
        </ScrollView>
      )}
    </View>
  );
};
