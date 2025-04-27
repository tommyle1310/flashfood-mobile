import React from "react";
import { View, ScrollView, Image, Dimensions, Pressable } from "react-native";
import FFText from "@/src/components/FFText";
import { spacing } from "@/src/theme";
import FFButton from "@/src/components/FFButton";
import { Avatar } from "@/src/types/common";
import { IMAGE_LINKS } from "@/src/assets/imageLinks";

const { width } = Dimensions.get("window");

export const PromotionsSliderSection = ({
  promotionList,
}: {
  promotionList?: {
    avatar: Avatar;
    id: string;
    name: string;
    desc: string;
  }[];
}) => {
  return (
    <View style={{ marginVertical: spacing.sm }}>
      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        style={{ width }}
      >
        {promotionList?.map((promo) => (
          <View
            key={promo.name}
            style={{
              width: width - spacing.lg * 2,
              marginRight: spacing.lg,
              backgroundColor: "#fff",
              borderRadius: 20,
              overflow: "hidden",
              elevation: 4,
              padding: 0,
            }}
          >
            <Image
              source={{
                uri: promo?.avatar?.url ?? IMAGE_LINKS?.DEFAULT_AVATAR_FOOD,
              }}
              style={{
                width: "100%",
                height: 160,
                resizeMode: "cover",
              }}
            />
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

export default PromotionsSliderSection;
