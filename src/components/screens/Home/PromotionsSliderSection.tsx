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
    <View style={{ marginVertical: spacing.lg }}>
      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: spacing.lg,
          gap: spacing.sm
        }}
        decelerationRate="fast"
        snapToInterval={width - spacing.lg}
      >
        {promotionList?.map((promo) => (
          <Pressable
            key={promo.name}
            style={{
              width: width - spacing.lg * 2,
              backgroundColor: "#ffffff",
              borderRadius: 24,
              overflow: "hidden",
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.15,
              shadowRadius: 20,
              elevation: 12,
              marginHorizontal: spacing.xs
            }}
          >
            <Image
              source={{
                uri: promo?.avatar?.url ?? IMAGE_LINKS?.DEFAULT_AVATAR_FOOD,
              }}
              style={{
                width: "100%",
                height: 180,
                backgroundColor: "#f3f4f6"
              }}
            />
            <View
              style={{
                position: "absolute",
                bottom: 0,
                left: 0,
                right: 0,
                height: 80,
                backgroundColor: "rgba(0, 0, 0, 0.6)",
                justifyContent: "flex-end",
                padding: spacing.lg
              }}
            >
              <FFText
                style={{
                  color: "#ffffff",
                  fontSize: 18,
                  fontWeight: "700",
                  textShadowColor: "rgba(0, 0, 0, 0.5)",
                  textShadowOffset: { width: 0, height: 1 },
                  textShadowRadius: 3
                }}
              >
                {promo.name}
              </FFText>
              {promo.desc && (
                <FFText
                  style={{
                    color: "#e5e7eb",
                    fontSize: 14,
                    fontWeight: "400",
                    marginTop: spacing.xs,
                    textShadowColor: "rgba(0, 0, 0, 0.5)",
                    textShadowOffset: { width: 0, height: 1 },
                    textShadowRadius: 2
                  }}
                >
                  {promo.desc}
                </FFText>
              )}
            </View>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
};

export default PromotionsSliderSection;
