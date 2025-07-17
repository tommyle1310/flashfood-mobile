import { useTheme } from "@/src/hooks/useTheme";
import { LinearGradient } from "expo-linear-gradient";
import React, { useState } from "react";
import { Pressable, Text, View, ViewStyle, TextStyle, StyleSheet } from "react-native";
import { spacing } from "../theme";

// ... (your existing types and darkenColor function) ...
// Define types for better readability and IntelliSense
type ButtonVariant = "primary" | "secondary" | "outline" | "danger" | "link";
type ThemeType = "light" | "dark";

// Define the structure for gradient colors
type GradientColors = [string, string];

// Define the structure for link text colors
type LinkTextColors = {
  normal: string;
  pressed: string;
  disabled: string;
};

// Define the structure for each button variant's color configuration
interface VariantColors {
  light: GradientColors;
  dark: GradientColors;
  disabled: GradientColors;
  [key: string]: GradientColors; // Add index signature for 'theme' (string)
}

interface LinkVariantColors {
  light: LinkTextColors;
  dark: LinkTextColors;
  disabled: LinkTextColors;
  [key: string]: LinkTextColors; // Add index signature for 'theme' (string)
}

// Define the overall ColorsMap with explicit types for each variant
interface ColorsMap {
  primary: VariantColors;
  secondary: VariantColors;
  outline: VariantColors;
  danger: VariantColors;
  link: LinkVariantColors;
}

// --- Helper function to darken a color ---
const darkenColor = (color: string, percentage: number) => {
  if (color === "transparent") return color;

  const hexToRgb = (hex: string) => {
    let r = 0, g = 0, b = 0;
    if (hex.length === 4) {
      r = parseInt(hex[1] + hex[1], 16);
      g = parseInt(hex[2] + hex[2], 16);
      b = parseInt(hex[3] + hex[3], 16);
    } else if (hex.length === 7) {
      r = parseInt(hex.substring(1, 3), 16);
      g = parseInt(hex.substring(3, 5), 16);
      b = parseInt(hex.substring(5, 7), 16);
    }
    return [r, g, b];
  };

  const rgbToHex = (r: number, g: number, b: number) => {
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
  };

  let [r, g, b] = hexToRgb(color);
  r = Math.max(0, Math.floor(r * (1 - percentage)));
  g = Math.max(0, Math.floor(g * (1 - percentage)));
  b = Math.max(0, Math.floor(b * (1 - percentage)));

  return rgbToHex(r, g, b);
};

const FFButton: React.FC<{
  children: React.ReactNode;
  className?: string;
  isLinear?: boolean;
  textClassName?: string;
  onPress?: () => void;
  variant?: ButtonVariant;
  style?: ViewStyle;
  disabled?: boolean;
}> = ({
  children,
  className,
  isLinear = true,
  textClassName,
  onPress = () => {},
  variant = "primary",
  style,
  disabled = false,
}) => {
  const { theme } = useTheme();
  const [pressed, setPressed] = useState(false);

  // --- Color Definitions ---
  const colors: ColorsMap = {
    primary: {
      light: ["#5CB85C", "#4CAF50"],
      dark: ["#4CAF50", "#449D44"],
      disabled: ["#CCCCCC", "#BBBBBB"],
    },
    secondary: {
      light: ["#64B5F6", "#42A5F5"],
      dark: ["#2196F3", "#1976D2"],
      disabled: ["#CCCCCC", "#BBBBBB"],
    },
    outline: {
      light: ["#E0E0E0", "#F5F5F5"],
      dark: ["#424242", "#616161"],
      disabled: ["#E0E0E0", "#E0E0E0"],
    },
    danger: {
      light: ["#EF5350", "#E53935"],
      dark: ["#D32F2F", "#C62828"],
      disabled: ["#CCCCCC", "#BBBBBB"],
    },
    link: {
      light: { normal: "#424242", pressed: "#212121", disabled: "#BDBDBD" },
      dark: { normal: "#BBDEFB", pressed: "#90CAF9", disabled: "#616161" },
      disabled: { normal: "#BDBDBD", pressed: "#BDBDBD", disabled: "#BDBDBD" },
    },
  };

  // --- Determine current colors based on variant, theme, and state ---
  const getGradientColors = (currentVariant: ButtonVariant, isPressed: boolean, isDisabled: boolean): GradientColors => {
    if (currentVariant === "link") {
      return ["transparent", "transparent"];
    }

    const variantColors = colors[currentVariant];
    if (isDisabled) {
      return variantColors.disabled;
    }

    const themeColors = variantColors[theme];
    if (isPressed) {
      return themeColors.map(color => darkenColor(color, 0.1)) as GradientColors;
    }

    return themeColors;
  };

  const getTextColor = (currentVariant: ButtonVariant, isPressed: boolean, isDisabled: boolean): string => {
    if (currentVariant === "link") {
      const linkColors = colors.link[theme];
      if (isDisabled) return colors.link.disabled.disabled;
      return isPressed ? linkColors.pressed : linkColors.normal;
    }

    if (currentVariant === 'outline') {
      return theme === 'light' ? '#333' : '#F5F5F5';
    }
    
    return isDisabled ? '#888888' : 'white';
  };

  const [currentGradientStart, currentGradientEnd] = getGradientColors(variant, pressed, disabled);
  const currentTextColor = getTextColor(variant, pressed, disabled);

  // --- Render Children (Text or other ReactNode) ---
  const renderChildren = () => {
    if (typeof children === "string" || typeof children === "number") {
      return (
        <Text
          style={[
            styles.buttonText,
            { color: currentTextColor },
            variant === "link" ? styles.linkText : null,
          ].filter(Boolean)}
        >
          {children}
        </Text>
      );
    }
    return children;
  };

  // --- Link Button Render ---
  if (variant === "link") {
    return (
      <Pressable
        onPressIn={() => setPressed(true)}
        onPressOut={() => {
          setPressed(false);
          if (onPress && !disabled) onPress();
        }}
        disabled={disabled}
        className={className}
        style={[
          styles.baseButton,
          styles.linkButton,
          { opacity: disabled ? 0.5 : 1 },
          style,
        ]}
      >
        {renderChildren()}
      </Pressable>
    );
  }

  // --- Regular Button Render (with or without LinearGradient) ---
  const buttonContent = isLinear ? (
    <LinearGradient
      colors={[currentGradientStart, currentGradientEnd]}
      start={[0, 0]}
      end={[1, 0]}
      style={styles.gradientBackground}
    >
      {renderChildren()}
    </LinearGradient>
  ) : (
    <View
      style={[
        styles.solidBackground,
        { backgroundColor: currentGradientStart },
      ]}
    >
      {renderChildren()}
    </View>
  );

  return (
    <Pressable
      disabled={disabled}
      onPressIn={() => setPressed(true)}
      onPressOut={() => {
        setPressed(false);
        if (onPress && !disabled) onPress();
      }}
      className={className}
      style={[
        styles.pressableContainer,
        style,
      ]}
    >
      {buttonContent}
    </Pressable>
  );
};

// --- StyleSheet for consistent styling ---
const styles = StyleSheet.create({
  baseButton: {
    justifyContent: "center",
    alignItems: "center",
  },
  pressableContainer: {
    justifyContent: "center",
    alignItems: "center",
    transform: [{ scale: 1 }],
  },
  gradientBackground: {
    paddingVertical: 12,
    paddingHorizontal: spacing.xl,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 8,
    minWidth: 120,
    width: '100%',
  },
  solidBackground: {
    paddingVertical: 12,
    paddingHorizontal: spacing.xl,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    minWidth: 120,
    width: '100%',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  linkButton: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
  },
  linkText: {
    textDecorationLine: "underline",
    textDecorationColor: "currentColor",
    fontWeight: "normal",
  }
});

export default FFButton;