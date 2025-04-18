import React, { useState } from "react";
import { View, Text, Switch } from "react-native";
import FFText from "./FFText"; // Assuming you have a custom text component for styling
import { useTheme } from "@/src/hooks/useTheme"; // Import the custom useTheme hook

interface FFToggleProps {
  label?: string;
  initialChecked?: boolean;
  onChange?: (value: boolean) => void;
  isChangeTheme?: boolean;
}

const FFToggle: React.FC<FFToggleProps> = ({
  label,
  initialChecked = false,
  onChange,
  isChangeTheme = false,
}) => {
  const [isChecked, setIsChecked] = useState<boolean>(initialChecked);

  // Use the theme context to toggle the theme
  const { toggleTheme, theme } = useTheme();

  const handleToggleChange = (value: boolean) => {
    console.log("check change hteme", isChangeTheme);
    if (isChangeTheme) {
      toggleTheme();
      return;
    }
    setIsChecked(value);
    if (onChange) {
      onChange(value); // Call any external onChange prop
    }
  };

  return (
    <View className="flex-row items-center">
      <FFText className="text-gray-700">{label}</FFText>
      <Switch
        style={{
          paddingVertical: 0,
          marginVertical: 0,
          marginTop: -20,
          marginBottom: -20,
        }}
        value={isChangeTheme ? (theme === "light" ? false : true) : isChecked}
        onValueChange={handleToggleChange}
        trackColor={{ false: "gray", true: "#63c550" }}
        thumbColor={isChecked ? "#fff" : "#f4f3f4"}
      />
    </View>
  );
};

export default FFToggle;
