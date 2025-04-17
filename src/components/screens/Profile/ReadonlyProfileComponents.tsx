import { View, Text, TouchableOpacity } from "react-native";
import React from "react";
import FFAvatar from "../../FFAvatar";
import FFText from "../../FFText";
import IconFontAwesome5 from "react-native-vector-icons/FontAwesome5";
import { useSelector } from "@/src/store/types";
import { RootState } from "@/src/store/store";
import FFSkeleton from "../../FFSkeleton";
import FFView from "../../FFView";
import { spacing } from "@/src/theme";

const ReadonlyProfileComponents = ({
  firstName,
  lastName,
  email,
  phone,
  toggleStatus,
}: {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  toggleStatus: () => void;
}) => {
  const { user_id, avatar } = useSelector((state: RootState) => state.auth);

  return (
    <FFView
      style={{
        elevation: 10,
        // backgroundColor: "#fff",
        borderRadius: 12,
        padding: spacing.md,
        borderColor: "#eee",
        borderWidth: 1,
      }}
    >
      <View className="flex-row justify-between gap-4">
        <FFAvatar avatar={avatar?.url} />
        <View className="flex-1">
          {!firstName && !lastName ? (
            <>
              <FFSkeleton />
              <FFSkeleton width={100} style={{ marginTop: spacing.sm }} />
            </>
          ) : (
            <>
              <FFText fontSize="lg">
                {lastName} {firstName}
              </FFText>
              <FFText fontWeight="400" style={{ color: "#aaa" }}>
                {email}
              </FFText>
            </>
          )}
        </View>
        <TouchableOpacity
          onPress={toggleStatus}
          style={{
            backgroundColor: "#63c550",
            padding: spacing.sm, // You can adjust the padding as needed
            borderRadius: 50, // To make it round
            alignSelf: "flex-start", // Align to the start of the container
            flexShrink: 0, // Prevent it from shrinking
            justifyContent: "center", // Vertically center the content
            alignItems: "center", // Horizontally center the content
          }}
        >
          <IconFontAwesome5 name="user-edit" size={10} color="#eee" />
        </TouchableOpacity>
      </View>
      <View className="flex-row gap-2 items-center">
        <FFText style={{ color: "#aaa" }} fontWeight="400">
          Phone Number:
        </FFText>
        <FFText fontWeight="400">{phone}</FFText>
      </View>
      <View className="flex-row gap-2 items-center">
        <FFText style={{ color: "#aaa" }} fontWeight="400">
          Date Joined:
        </FFText>
        <FFText fontWeight="400">24/01/2025</FFText>
      </View>
    </FFView>
  );
};

export default ReadonlyProfileComponents;
