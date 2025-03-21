import { View, Text, Pressable } from "react-native";
import React from "react";

type FFBadgeProps = {
  title?: string; // Make title optional
  backgroundColor?: string;
  rounded?: "sm" | "md" | "lg" | "full";
  textColor?: string;
  children?: React.ReactNode; // Add children prop
  onPress?: () => void; // Optional onPress prop
};

const FFBadge: React.FC<FFBadgeProps> = ({
  title,
  backgroundColor = "blue",
  rounded = "full",
  textColor = "blue",
  children,
  onPress,
}) => {
  // Map rounded value to proper radius values
  const roundedMap = {
    sm: 4,
    md: 8,
    lg: 12,
    full: 9999, // To create fully rounded badge
  };

  const BadgeContent = (
    <View
      style={{
        backgroundColor,
        borderRadius: roundedMap[rounded],
        paddingHorizontal: 6,
        paddingVertical: 4,
      }}
      className="px-2 py-1 self-start"
    >
      {/* Render children if provided, otherwise render title */}
      {children ? (
        children
      ) : (
        <Text style={{ color: textColor }} className="font-bold">
          {title}
        </Text>
      )}
    </View>
  );

  // If onPress is provided, wrap the badge in a Pressable
  return onPress ? (
    <Pressable onPress={onPress}>{BadgeContent}</Pressable>
  ) : (
    BadgeContent
  );
};

export default FFBadge;
