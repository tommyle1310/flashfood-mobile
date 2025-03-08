import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useTheme } from "@/src/hooks/useTheme"; // Giả sử hook này đã được định nghĩa

interface FFTabProps {
  tabTitles: string[]; // Mảng các tiêu đề tab (ví dụ: ["Tab Active", "Tab Rest"])
  tabContent: React.ReactNode[]; // Mảng các component tương ứng với mỗi tab
  activeTabIndex?: number; // Index của tab đang active (tùy chọn, mặc định 0)
  onTabChange?: (index: number) => void; // Callback khi tab thay đổi (tùy chọn)
  style?: any; // Style tùy chỉnh cho container (tùy chọn)
}

const FFTab: React.FC<FFTabProps> = ({
  tabTitles,
  tabContent,
  activeTabIndex = 0,
  onTabChange,
  style,
}) => {
  const { theme } = useTheme();
  const [activeIndex, setActiveIndex] = useState(activeTabIndex);

  // Xử lý khi nhấn vào tab
  const handleTabPress = (index: number) => {
    setActiveIndex(index);
    if (onTabChange) {
      onTabChange(index);
    }
  };

  // Màu sắc dựa trên theme
  const backgroundColor = theme === "light" ? "transparent" : "#000000"; // Nền trong suốt khi light, đen khi dark
  const textColorActive = "#4d9c39"; // Màu active #4d9c39
  const textColorRest = theme === "light" ? "#A0AEC0" : "#A0AEC0"; // Chữ xám khi rest
  const lineColorActive = "#4d9c39"; // Đường gạch active #4d9c39
  const lineColorRest = theme === "light" ? "#A0AEC0" : "#A0AEC0"; // Đường gạch xám khi rest

  return (
    <View style={[styles.container, { backgroundColor }, style]}>
      {/* Tab Headers */}
      <View style={styles.tabHeader}>
        {tabTitles.map((title, index) => (
          <TouchableOpacity
            key={index}
            style={styles.tabItem} // Loại bỏ marginRight, dùng flex: 1 để chia đều
            onPress={() => handleTabPress(index)}
          >
            <Text
              style={[
                styles.tabText,
                {
                  color:
                    index === activeIndex ? textColorActive : textColorRest,
                },
              ]}
            >
              {title}
            </Text>
            <View
              style={{
                height: 2,
                width: "100%", // Đường gạch chiếm toàn bộ chiều rộng của tab
                backgroundColor:
                  index === activeIndex ? lineColorActive : lineColorRest,
                marginTop: 4, // Khoảng cách giữa chữ và đường gạch
              }}
            />
          </TouchableOpacity>
        ))}
      </View>

      {/* Tab Content */}
      <View style={styles.tabContent}>{tabContent[activeIndex]}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tabHeader: {
    flexDirection: "row",
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 16, // Thêm padding ngang để giống hình mẫu
  },
  tabItem: {
    flex: 1, // Mỗi tab item chiếm đều không gian
    alignItems: "center",
  },
  tabText: {
    fontSize: 16,
    fontWeight: "500",
    textAlign: "center",
  },
  tabContent: {
    flex: 1,
    // padding: 16,
  },
});

export default FFTab;
