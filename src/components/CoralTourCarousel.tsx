import React, { useState, useRef, useEffect } from "react";
import {
  View,
  StyleSheet,
  Dimensions,
  Animated,
  Image,
  FlatList,
  TouchableOpacity,
  ViewStyle,
  ImageStyle,
  TextStyle,
} from "react-native";
import IconFeather from "react-native-vector-icons/Feather";
import FFText from "./FFText";
import { useTheme } from "../hooks/useTheme";
import { spacing } from "../theme";
import { IMAGE_LINKS } from "../assets/imageLinks";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const CARD_WIDTH = SCREEN_WIDTH * 0.8;
const CARD_HEIGHT = 160;
const SPACING = 10;

// Định nghĩa cấu trúc theme thủ công
const themes = {
  light: {
    background: "#ffffff",
    text: "#000000",
    cardBackground: "#f0f0f0",
  },
  dark: {
    background: "#1a1a1a",
    text: "#ffffff",
    cardBackground: "#2c2c2c",
  },
};

interface CoralTourCarouselProps {
  imageUrls?: string[];
  onTap?: (id: string) => void;
  itemIds?: string[];
}

const CoralTourCarousel: React.FC<CoralTourCarouselProps> = ({
  imageUrls,
  onTap,
  itemIds = [],
}) => {
  const { theme } = useTheme();
  const scrollX = useRef(new Animated.Value(0)).current;
  const flatListRef = useRef<FlatList>(null);
  const scrollXValue = useRef(0);

  const currentTheme = themes[theme as keyof typeof themes];
  const data = imageUrls?.map((url, index) => ({
    id: itemIds[index] || index.toString(),
    url,
  }));

  useEffect(() => {
    const listenerId = scrollX.addListener(({ value }) => {
      scrollXValue.current = value;
    });

    return () => scrollX.removeListener(listenerId);
  }, [scrollX]);

  const renderItem = ({
    item,
    index,
  }: {
    item: { id: string; url: string };
    index: number;
  }) => {
    const inputRange = [
      (index - 1) * (CARD_WIDTH + SPACING),
      index * (CARD_WIDTH + SPACING),
      (index + 1) * (CARD_WIDTH + SPACING),
    ];

    const scale = scrollX.interpolate({
      inputRange,
      outputRange: [0.9, 1.1, 0.9],
      extrapolate: "clamp",
    });

    const opacity = scrollX.interpolate({
      inputRange,
      outputRange: [0.5, 1, 0.5],
      extrapolate: "clamp",
    });

    return (
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => onTap && onTap(item.id)}
        style={{ width: CARD_WIDTH + SPACING }}
      >
        <Animated.View
          style={[
            styles.card,
            {
              transform: [{ scale }],
              opacity,
              backgroundColor: currentTheme.cardBackground,
            },
          ]}
        >
          <Image
            source={{ uri: item.url ?? IMAGE_LINKS.DEFAULT_AVATAR_FOOD }}
            style={styles.image}
            resizeMode="cover"
            onError={(e) =>
              console.log("Image load error:", item.url, e.nativeEvent.error)
            }
          />
        </Animated.View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <Animated.FlatList
        ref={flatListRef}
        data={data}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={CARD_WIDTH + SPACING}
        decelerationRate="fast"
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: true }
        )}
        contentContainerStyle={{
          paddingHorizontal: (SCREEN_WIDTH - CARD_WIDTH) / 2,
          minHeight: CARD_HEIGHT,
        }}
        style={{ flexGrow: 0, paddingVertical: spacing.md }}
      />
    </View>
  );
};

// Tách style thành các kiểu cụ thể để tránh lỗi TypeScript
const styles = StyleSheet.create({
  container: {
    flex: 0,
    justifyContent: "center",
    alignItems: "center",
    // backgroundColor: "red",
    width: SCREEN_WIDTH,
    marginLeft: -spacing.md,
  } as ViewStyle,
  card: {
    width: CARD_WIDTH,
    marginRight: spacing.sm,
    height: CARD_HEIGHT,
    borderRadius: 10,
    overflow: "hidden",
    position: "relative",
  } as ViewStyle,
  image: {
    width: "100%", // Sửa lỗi "100" thành "100%"
    height: "100%",
  } as ImageStyle,
  heartIcon: {
    position: "absolute",
    top: 10,
    right: 10,
  } as ViewStyle,
  title: {
    position: "absolute",
    bottom: 10,
    left: 0,
    right: 0,
    textAlign: "center",
    fontSize: 16,
    fontWeight: "bold",
    color: "white", // Thêm màu mặc định, sẽ được override bởi currentTheme.text nếu cần
  } as TextStyle,
});

export default CoralTourCarousel;
