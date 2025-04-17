import React, { useEffect, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
  View,
} from "react-native";
import FFView from "../src/components/FFView";
import FFText from "../src/components/FFText";
import colors from "../src/theme/colors";
import FFScreenTopSection from "@/src/components/FFScreenTopSection";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { MainStackParamList } from "@/src/navigation/AppNavigator";
import axios from "axios";
import axiosInstance from "@/src/utils/axiosConfig";
import { useSelector } from "@/src/store/types";
import { RootState } from "@/src/store/store";
import FFSkeleton from "@/src/components/FFSkeleton";
import { spacing } from "@/src/theme";

interface NotificationAvatar {
  key: string;
  url: string;
}

interface NotificationCreatedBy {
  id: string;
  role: string;
  avatar: string | null;
  permissions: string[];
  last_active: string | null;
  created_at: string;
  updated_at: string;
  first_name: string | null;
  last_name: string | null;
  status: string;
}

interface NotificationItem {
  id: string;
  avatar: NotificationAvatar;
  title: string;
  desc: string;
  image: string | null;
  link: string | null;
  target_user: string[];
  created_by_id: string;
  is_read: boolean;
  target_user_id: string | null;
  created_at: string;
  updated_at: string | null;
  created_by: NotificationCreatedBy;
}

interface ApiResponse {
  EC: number;
  EM: string;
  data: NotificationItem[];
}

type NotificationScreenNavigationProp = StackNavigationProp<
  MainStackParamList,
  "Notifications"
>;

const NotificationScreen: React.FC = () => {
  const navigation = useNavigation<NotificationScreenNavigationProp>();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { id } = useSelector((state: RootState) => state.auth);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(
        `/customers/notifications/${id}`
      );

      if (response.data.EC === 0) {
        setNotifications(response.data.data);
        setError(null);
      } else {
        setError(response.data.EM);
      }
    } catch (err) {
      setError("Failed to fetch notifications");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  return (
    <FFView style={styles.container}>
      <FFScreenTopSection navigation={navigation} title="Notifications" />

      <ScrollView style={styles.notificationList}>
        {loading ? (
          <View>
            <FFSkeleton height={100} />
            <FFSkeleton height={100} />
            <FFSkeleton height={100} />
            <FFSkeleton height={100} />
          </View>
        ) : (
          notifications.map((notification) => (
            <TouchableOpacity
              key={notification.id}
              style={styles.notificationItem}
            >
              <FFView style={styles.notificationContent}>
                <Image
                  source={{ uri: notification.avatar.url }}
                  style={styles.notificationIcon}
                />
                <FFView style={styles.textContainer}>
                  <FFText style={styles.notificationTitle}>
                    {notification.title}
                  </FFText>
                  <FFText style={styles.notificationMessage}>
                    {notification.desc}
                    <FFText style={styles.viewMore}> View more...</FFText>
                  </FFText>
                </FFView>
              </FFView>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </FFView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  notificationList: {
    flex: 1,
  },
  notificationItem: {
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  notificationContent: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  notificationIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: spacing.md,
  },
  textContainer: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
    marginBottom: 4,
  },
  notificationMessage: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  viewMore: {
    color: colors.primary,
  },
});

export default NotificationScreen;
