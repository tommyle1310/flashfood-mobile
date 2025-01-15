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
    ? ["#63c550", "#a3d98f"] // Light theme gradient with a softer lighter green
    : ["#63c550", "#4a9e3e"]; // Dark theme gradient

// Darker color versions for the pressed effect (optional)
const darkenedGradientColors: readonly [string, string] =
  theme === "light"
    ? ["#4d9c39", "#7dbf72"] // Darkened light theme gradient (slightly more muted)
    : ["#4c9f3a", "#3e7c2a"]; // Darkened dark theme gradient (deeper green for contrast)


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
