import React, { useEffect, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
  View,
  RefreshControl,
} from "react-native";
import FFView from "../src/components/FFView";
import FFText from "../src/components/FFText";
import colors from "../src/theme/colors";
import FFScreenTopSection from "@/src/components/FFScreenTopSection";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { MainStackParamList } from "@/src/navigation/AppNavigator";
import axiosInstance from "@/src/utils/axiosConfig";
import { useSelector } from "@/src/store/types";
import { RootState } from "@/src/store/store";
import FFSkeleton from "@/src/components/FFSkeleton";
import { spacing } from "@/src/theme";
import { formatTimestampToDate2 } from "@/src/utils/dateConverter";
import IconFeather from "react-native-vector-icons/Feather";

interface NotificationAvatar {
  key: string;
  url: string;
}

interface NotificationCreatedBy {
  id: string;
  role?: string;
  avatar?: string | null;
  permissions?: string[];
  last_active?: string | null;
  created_at?: string;
  updated_at?: string;
  first_name: string | null;
  last_name: string | null;
  status?: string;
  email?: string;
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
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedNotifications, setExpandedNotifications] = useState<Set<string>>(new Set());
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
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchNotifications();
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const getNotificationIcon = (key: string) => {
    switch (key) {
      case 'delivery-success':
        return 'check-circle';
      default:
        return 'bell';
    }
  };

  const truncateText = (text: string, maxLength: number, isExpanded: boolean) => {
    if (isExpanded || text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  const toggleExpand = (notificationId: string) => {
    setExpandedNotifications(prevExpanded => {
      const newExpanded = new Set(prevExpanded);
      if (newExpanded.has(notificationId)) {
        newExpanded.delete(notificationId);
      } else {
        newExpanded.add(notificationId);
      }
      return newExpanded;
    });
  };

  const handleNotificationPress = (notification: NotificationItem) => {
    toggleExpand(notification.id);
    
    // Handle navigation based on notification link
    if (notification.link) {
      const path = notification.link.split('/');
      if (path.length >= 2 && path[1] === 'orders') {
        // Navigate to Orders tab (index 1)
        navigation.navigate('BottomTabs', { screenIndex: 1 });
      }
    }
  };

  const handleViewDetailsPress = (event: any, notification: NotificationItem) => {
    // Stop event propagation to prevent the parent TouchableOpacity from triggering
    event.stopPropagation();
    
    // Expand the notification
    toggleExpand(notification.id);
    
    // Handle navigation if needed
    // if (notification.link) {
    //   const path = notification.link.split('/');
    //   if (path.length >= 2 && path[1] === 'orders') {
    //     navigation.navigate('BottomTabs', { screenIndex: 1 });
    //   }
    // }
  };

  return (
    <FFView style={styles.container}>
      <FFScreenTopSection navigation={navigation} title="Notifications" />

      <ScrollView 
        style={styles.notificationList}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
          />
        }
      >
        {loading && !refreshing ? (
          <View style={styles.loadingContainer}>
            <FFSkeleton height={100} style={styles.skeleton} />
            <FFSkeleton height={100} style={styles.skeleton} />
            <FFSkeleton height={100} style={styles.skeleton} />
            <FFSkeleton height={100} style={styles.skeleton} />
          </View>
        ) : notifications.length === 0 ? (
          <View style={styles.emptyState}>
            <IconFeather name="bell-off" size={50} color={colors.textSecondary} />
            <FFText style={styles.emptyStateText}>No notifications yet</FFText>
          </View>
        ) : (
          notifications.map((notification) => {
            const isExpanded = expandedNotifications.has(notification.id);
            return (
              <TouchableOpacity
                key={notification.id}
                style={[
                  styles.notificationItem, 
                  notification.is_read ? styles.readNotification : styles.unreadNotification
                ]}
                onPress={() => handleNotificationPress(notification)}
              >
                <View style={styles.notificationIconContainer}>
                  <Image
                    source={{ uri: notification.avatar.url }}
                    style={styles.notificationIcon}
                  />
                  {/* {!notification.is_read && <View style={styles.unreadDot} />} */}
                </View>
                
                <View style={styles.textContainer}>
                  <FFText style={styles.notificationTitle}>
                    {notification.title}
                  </FFText>
                  <FFText style={styles.notificationMessage}>
                    {truncateText(notification.desc, 50, isExpanded)}
                  </FFText>
                  <View style={styles.footerRow}>
                    <FFText style={{color: colors.textSecondary, fontSize: 10}}>
                      {formatTimestampToDate2(parseInt(notification.created_at))}
                    </FFText>
                    {notification.link && (
                      <TouchableOpacity onPress={(e) => handleViewDetailsPress(e, notification)}>
                        <FFText style={styles.viewMore}>
                          {
                            isExpanded ? 'View less' : 'View more'
                          }
                        </FFText>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              </TouchableOpacity>
            );
          })
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
  loadingContainer: {
    padding: spacing.md,
  },
  skeleton: {
    marginBottom: spacing.md,
    borderRadius: 12,
  },
  notificationItem: {
    padding: spacing.md,
    marginHorizontal: spacing.md,
    marginVertical: spacing.sm / 2,
    borderRadius: 16,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  unreadNotification: {
    backgroundColor: '#f0f9ff',
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  readNotification: {
    backgroundColor: '#fff',
  },
  notificationIconContainer: {
    position: 'relative',
  },
  notificationIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: spacing.md,
  },
  unreadDot: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.primary,
  },
  textContainer: {
    flex: 1,
  },
  notificationTitle: {
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
    fontSize: 15
  },
  notificationMessage: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
    lineHeight: 20,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  viewMore: {
    color: colors.primary,
    fontWeight: '500',
    fontSize: 12,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyStateText: {
    marginTop: spacing.md,
    color: colors.textSecondary,
    fontSize: 16,
  },
});

export default NotificationScreen;
