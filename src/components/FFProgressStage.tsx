import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useTheme } from "@/src/hooks/useTheme"; // Giả sử hook này đã được định nghĩa
import FFText from "./FFText";

interface FFProgressStageProps {
  stageText: string; // Văn bản hiển thị, ví dụ: "Arriving at 10:15"
  completedSegments: number; // Số đoạn đã hoàn thành (x)
  totalSegments: number; // Tổng số đoạn (y)
  style?: any; // Style tùy chỉnh (object CSS)
}

const FFProgressStage: React.FC<FFProgressStageProps> = ({
  stageText,
  completedSegments,
  totalSegments,
  style = {},
}) => {
  const { theme } = useTheme();

  // Xác định màu dựa trên theme, giống cách của FFView
  const backgroundColor = theme === "light" ? "#fff" : "#333";
  const segmentColor = theme === "light" ? "#10B981" : "#34D399"; // Màu xanh lá cho đoạn hoàn thành
  const inactiveColor = theme === "light" ? "#D1D5DB" : "#4B5563"; // Màu xám cho đoạn chưa hoàn thành

  // Đảm bảo completedSegments không vượt quá totalSegments
  const validCompletedSegments = Math.min(
    Math.max(completedSegments, 0),
    totalSegments
  );

  // Tạo mảng các đoạn
  const segments = Array.from({ length: totalSegments }, (_, index) => index);

  // Tính chiều rộng mỗi đoạn dựa trên tổng số đoạn (chia đều 100%)
  const segmentWidth = totalSegments > 0 ? 100 / totalSegments : 0;

  return (
    <View style={[styles.container, style]}>
      {/* Văn bản ở trên */}
      <FFText fontWeight="400">{stageText}</FFText>
      {/* Thanh tiến trình phân đoạn ở dưới */}
      <View style={styles.progressContainer}>
        {segments.map((_, index) => (
          <View
            key={index}
            style={[
              styles.segment,
              {
                width: `${segmentWidth}%`, // Chiều rộng mỗi đoạn chia đều
                backgroundColor:
                  index < validCompletedSegments ? segmentColor : inactiveColor,
              },
            ]}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "column", // Sắp xếp theo cột: text ở trên, progress ở dưới
    paddingVertical: 4,
    width: "100%",
    alignItems: "center",
  },
  progressContainer: {
    flexDirection: "row",
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 4, // Khoảng cách giữa text và thanh tiến trình
  },
  segment: {
    height: 6, // Độ cao mỗi đoạn
    marginHorizontal: 2, // Khoảng cách giữa các đoạn
    borderRadius: 2, // Bo góc nhẹ
  },
});

export default FFProgressStage;
