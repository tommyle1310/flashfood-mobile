import React from "react";
import { View, TouchableOpacity, ScrollView } from "react-native";
import FFText from "@/src/components/FFText";
import FFSkeleton from "@/src/components/FFSkeleton";
import { FoodCategory } from "@/src/types/screens/Home";

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
    <View className="my-4">
      <View className="flex-row items-center justify-between">
        <FFText>Hot Categories</FFText>
        <TouchableOpacity>
          <FFText style={{ color: "#3FB854", fontWeight: "400", fontSize: 12 }}>
            Show All
          </FFText>
        </TouchableOpacity>
      </View>
      <ScrollView horizontal className="mt-2">
        {listFoodCategories?.map((item) => (
          <TouchableOpacity
            key={item.id}
            onPress={() => handleCategoryPress(item.id)}
            className={`px-2 py-1 mr-2 rounded-md ${
              selectedFoodCategories?.includes(item.id)
                ? "bg-[#59bf47]"
                : "bg-white"
            }`}
          >
            <FFText
              style={{
                fontSize: 14,
                fontWeight: "500",
                color: selectedFoodCategories?.includes(item.id)
                  ? "#fff"
                  : "#111",
              }}
            >
              {item.name}
            </FFText>
          </TouchableOpacity>
        ))}
      </ScrollView>
      {isLoading && (
        <View style={{ width: "100%", gap: 12, flexDirection: "row" }}>
          <FFSkeleton width={100} height={30} />
          <FFSkeleton width={100} height={30} />
        </View>
      )}
    </View>
  );
};
