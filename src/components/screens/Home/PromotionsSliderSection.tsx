import React from "react";
import { View, ScrollView, Image, Dimensions, Pressable } from "react-native";
import FFText from "@/src/components/FFText";
import { spacing, typography } from "@/src/theme";
import FFButton from "@/src/components/FFButton";
import { Avatar } from "@/src/types/common";
import { IMAGE_LINKS } from "@/src/assets/imageLinks";
import FFSkeleton from "@/src/components/FFSkeleton";

const { width } = Dimensions.get("window");

export const PromotionsSliderSection = ({
  promotionList,
  isLoading = false,
  onTap
}: {
  promotionList?: {
    avatar: Avatar;
    id: string;
    name: string;
    desc: string;
  }[];
  isLoading?: boolean;
  onTap?: (id: string) => void;

}) => {
  return (
    <View style={{ marginVertical: spacing.lg }}>
      {isLoading ? (
        <ScrollView
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: spacing.lg,
            gap: spacing.sm
          }}
        >
          {[1, 2].map((index) => (
            <FFSkeleton
              key={`slider-skeleton-${index}`}
              width={width - spacing.lg * 2}
              height={180}
              style={{
                borderRadius: 24,
                marginHorizontal: spacing.xs
              }}
            />
          ))}
        </ScrollView>
      ) : promotionList && promotionList.length > 0 ? (
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
          {promotionList.map((promo, index) => {
            return (
              <Pressable
              onPress={() => onTap && onTap(promo.id)}            
                key={promo.id || `promo-${index}`}
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
                    uri: promo?.avatar?.url || IMAGE_LINKS?.DEFAULT_AVATAR_FOOD,
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
                    height: 40,
                    backgroundColor: "rgba(0, 0, 0, 0.6)",
                    justifyContent: "flex-end",
                    paddingBottom: spacing.sm,
                    alignItems: 'center'
                  }}
                >
                  <FFText
                    style={{
                      color: "#ffffff",
                      fontSize: typography.fontSize.md,
                      fontWeight: "700",
                      textShadowColor: "rgba(0, 0, 0, 0.5)",
                      textShadowOffset: { width: 0, height: 1 },
                      textShadowRadius: 3
                    }}
                  >
                    {promo.name}
                  </FFText>
                  {/* {promo.desc && (
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
                  )} */}
                </View>
              </Pressable>
            )
          })}
        </ScrollView>
      ) : (
        <View style={{
          backgroundColor: "#ffffff",
          borderRadius: 24,
          padding: spacing.xl,
          alignItems: "center",
          justifyContent: "center",
          marginHorizontal: spacing.lg,
          height: 180
        }}>
          <FFText style={{
            color: "#9ca3af",
            fontSize: 16,
            fontWeight: "500"
          }}>
            No promotions available
          </FFText>
        </View>
      )}
    </View>
  );
};

export default PromotionsSliderSection;
