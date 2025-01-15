import { useTheme } from "@/hooks/useTheme";
import { LinearGradient } from "expo-linear-gradient";
import { useState } from "react";
import { Pressable, Text, View } from "react-native";

const FFButton: React.FC<{
  children: React.ReactNode;
  className?: string;
  isLinear?: boolean;
  textClassName?: string;
  onPress?: () => void
}> = ({ children, className, isLinear = false, textClassName, onPress= () => {} }) => {
  const { theme } = useTheme();

  // State to handle the press effect
  const [pressed, setPressed] = useState(false);

  // Define gradient colors for the light and dark theme
  const gradientColors: readonly [string, string] =
    theme === "light"
      ? ["#ff7e5f", "#feb47b"] // Light theme gradient
      : ["#6a11cb", "#2575fc"]; // Dark theme gradient

  // Darker color versions for the pressed effect (optional)
  const darkenedGradientColors: readonly [string, string] =
    theme === "light"
      ? ["#e56c4a", "#d68f56"] // Darkened light theme gradient
      : ["#4c0f91", "#1e59a3"]; // Darkened dark theme gradient

  return (
    <Pressable
      onPressIn={() => setPressed(true)} // When press starts
      onPressOut={() => {setPressed(false); onPress()}} // When press ends
      style={{
        transform: [{ scale: pressed ? 0.95 : 1 }], // Apply scaling when pressed
        justifyContent: "center",
        alignItems: "center",
      }}
      // className={className}
    >
      {isLinear ? (
        <LinearGradient
          colors={pressed ? darkenedGradientColors : gradientColors} // Switch colors when pressed
          start={[0, 0]}
          end={[1, 0]}
          style={{
            paddingVertical: 12,
            paddingHorizontal: 24,
            borderRadius: 8,
            justifyContent: "center",
            alignItems: "center",
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 3,
            elevation: 5,
          }}
          className={className}
        >
          <Text style={{ color: "white", fontSize: 16, fontWeight: "600" }}>
            {children}
          </Text>
        </LinearGradient>
      ) : (
        <View
          style={{
            paddingVertical: 12,
            paddingHorizontal: 24,
            borderRadius: 8,
            justifyContent: "center",
            alignItems: "center",
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 3,
            elevation: 5,
          }}
          className={className}
        >
          <Text
            className={textClassName}

            style={textClassName ? null :{ color: "white", fontSize: 16, fontWeight: "600" }}
          >
            {children}
          </Text>
        </View>
      )}
    </Pressable>
  );
};

export default FFButton;
