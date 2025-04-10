import React, { useState } from 'react';
import { Pressable } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';  // Changed to Ionicons for the icons we need

interface FFIconWithBgProps {
  name: string; // Changed from iconName to name to match usage
  size?: number;
  color?: string; // Changed from iconColor to color to match usage
  style?: any; // Added style prop
  backgroundColor?: string;
  className?: string;
}

const FFIconWithBg: React.FC<FFIconWithBgProps> = ({
  name,
  size = 32,
  color = '#FFFFFF',
  style,
  backgroundColor = '#63c550',
  className,
}) => {
  const [pressed, setPressed] = useState(false);

  return (
    <Pressable
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
      style={[{
        transform: [{ scale: pressed ? 0.95 : 1 }],
        justifyContent: "center",
        alignItems: "center",
        width: size,
        height: size,
        borderRadius: 8,
        padding: 2,
        backgroundColor
      }, style]}
      className={className}
    >
      <Icon name={name} size={size / 1.8} color={color} />
    </Pressable>
  );
};

export default FFIconWithBg;
