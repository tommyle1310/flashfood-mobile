import React, { useEffect } from "react";
import { View, TouchableOpacity, StyleSheet, Animated } from "react-native";
import FFText from "./FFText";
import IconFontiso from "react-native-vector-icons/Fontisto";
import IconIonicons from "react-native-vector-icons/Ionicons";
import IconEntypo from "react-native-vector-icons/Entypo";
import { useTheme } from "@/src/hooks/useTheme";
import { useDispatch, useSelector } from "../store/types";
import { RootState } from "../store/store";
import { loadCartItemsFromAsyncStorage } from "../store/userPreferenceSlice";
import { useNavigation } from "@react-navigation/native";
import { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import { BottomTabParamList } from "../navigation/AppNavigator";

type FFBottomTabProps = {
  currentScreen: number;
  setCurrentScreen: (screenIndex: number) => void;
};

const TAB_ITEMS = [
  { icon: <IconFontiso name="home" size={22} />, label: "Home" },
  { icon: <IconIonicons name="receipt-outline" size={22} />, label: "Orders" },
  { icon: <IconEntypo name="shopping-cart" size={22} />, label: "Cart" },
  { icon: <IconFontiso name="user-secret" size={22} />, label: "Settings" },
];

const FFBottomTab: React.FC<FFBottomTabProps> = ({
  currentScreen,
  setCurrentScreen,
}) => {
  const navigation =
    useNavigation<BottomTabNavigationProp<BottomTabParamList>>();
  const { theme } = useTheme();
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(loadCartItemsFromAsyncStorage());
  }, [dispatch]);

  const listCartItem = useSelector(
    (state: RootState) => state.userPreference.cart_items
  );

  const getButtonStyle = (isSelected: boolean) => ({
    flex: isSelected ? 2.2 : 1,
    backgroundColor: isSelected
      ? "#63c550"
      : theme === "dark"
      ? "rgba(40, 40, 40, 1)"
      : "rgba(255, 255, 255, 1)",
    transform: [{ scale: isSelected ? 1.05 : 1 }],
  });

  const getIconStyle = (isSelected: boolean) => ({
    color: isSelected
      ? "white"
      : theme === "dark"
      ? "rgba(255, 255, 255, 0.9)"
      : "rgba(40, 40, 40, 0.9)",
  });

  const renderTabButton = (
    index: number,
    { icon, label }: (typeof TAB_ITEMS)[0]
  ) => {
    const isSelected = currentScreen === index;
    const paramLabel = label as "Home" | "Orders" | "Cart" | "Settings";
    const handlePress = () => {
      setCurrentScreen(index);
    };

    return (
      <TouchableOpacity
        key={index}
        style={[styles.button, getButtonStyle(isSelected)]}
        onPress={handlePress}
        activeOpacity={0.7}
      >
        {index === 2 && listCartItem.length > 0 && (
          <View
            style={{
              position: "absolute",
              paddingHorizontal: 6,
              paddingVertical: 2,
              borderRadius: 12,
              backgroundColor: "#E9A000",
              top: -6,
              right: 0,
              minWidth: 22,
              alignItems: "center",
            }}
          >
            <FFText
              colorLight="#fff"
              fontSize="sm"
              colorDark="#fff"
              style={styles.badgeText}
            >
              {listCartItem.length}
            </FFText>
          </View>
        )}
        {React.cloneElement(icon, { style: getIconStyle(isSelected) })}
        {isSelected && (
          <FFText
            style={{
              ...styles.text,
              color: "white",
              fontWeight: "600",
            }}
          >
            {label}
          </FFText>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor:
            theme === "light"
              ? "rgba(255, 255, 255, 1)"
              : "rgba(20, 20, 20, 1)",
          shadowColor: theme === "light" ? "#000" : "rgba(255, 255, 255, 0.3)",
        },
      ]}
    >
      {TAB_ITEMS.map((item, index) => renderTabButton(index, item))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 15,
    marginHorizontal: "4%",
    width: "92%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderRadius: 30,
    paddingVertical: 12,
    paddingHorizontal: 8,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  button: {
    borderRadius: 25,
    paddingVertical: 10,
    paddingHorizontal: 14,
    position: "relative",
    flexDirection: "row",
    gap: 6,
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 4,
    // transition: "all 0.3s ease",
  },
  text: {
    fontSize: 13,
    letterSpacing: 0.3,
  },
  badgeText: {
    fontWeight: "600",
  },
});

export default FFBottomTab;
