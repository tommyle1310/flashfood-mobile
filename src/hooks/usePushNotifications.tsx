import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import Constants from "expo-constants";
import { Platform } from "react-native";
import { useEffect, useRef, useState } from "react";

// Set up notification handler for how notifications should be handled when app is in foreground
Notifications.setNotificationHandler({
  handleNotification: async () => {
    console.log("🔔 Notification handler called");
    return {
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
    };
  },
});

// Configure notification categories/channels for Android
if (Platform.OS === 'android') {
  Notifications.setNotificationChannelAsync('default', {
    name: 'default',
    importance: Notifications.AndroidImportance.MAX,
    vibrationPattern: [0, 250, 250, 250],
    lightColor: '#FF231F7C',
  });
}

export interface PushNotificationState {
  notifications?: Notifications.Notification;
  expoPushToken?: Notifications.ExpoPushToken;
}

export const usePushNotifications = (): PushNotificationState & { sendTestNotification: () => Promise<void> } => {
  const [expoPushToken, setExpoPushToken] = useState<
    Notifications.ExpoPushToken | undefined
  >(undefined);
  const [notifications, setNotifications] = useState<
    Notifications.Notification | undefined
  >(undefined);

  const notificationListener = useRef<Notifications.Subscription>();
  const responseListener = useRef<Notifications.Subscription>();

  async function registerForPushNotificationAsync() {
    try {
      if (!Device.isDevice) {
        console.warn("Push notifications require a physical device");
        return undefined;
      }

      const { status: existingStatus } =
        await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== "granted") {
        console.warn("Push notification permissions not granted");
        return undefined;
      }

      const token = await Notifications.getExpoPushTokenAsync({
        projectId: Constants.expoConfig?.extra?.eas?.projectId,
      });

      if (Platform.OS === "android") {
        await Notifications.setNotificationChannelAsync("default", {
          name: "default",
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: "#ff231f7c",
        });
      }

      console.log("Push token fetched:", token);
      return token;
    } catch (error) {
      console.error("Error fetching push token:", error);
      return undefined;
    }
  }

  useEffect(() => {
    registerForPushNotificationAsync().then((token) => {
      setExpoPushToken(token);
    });

    notificationListener.current =
      Notifications.addNotificationReceivedListener((notification) => {
        setNotifications(notification);
      });

    responseListener.current =
      Notifications.addNotificationResponseReceivedListener((response) => {
        console.log("Notification response received:", response);
      });

    return () => {
      if (notificationListener.current) {
        Notifications.removeNotificationSubscription(notificationListener.current);
      }
      if (responseListener.current) {
        Notifications.removeNotificationSubscription(responseListener.current);
      }
    };
  }, []);

  // Function to send a test notification - useful for debugging
  const sendTestNotification = async () => {
    try {
      console.log("📱 Sending test notification");
      await Notifications.presentNotificationAsync({
        title: "Test Notification",
        body: "This is a test notification from FF_Customer app",
        data: { test: true },
        sound: true,
        priority: Notifications.AndroidNotificationPriority.HIGH,
        vibrate: [0, 250, 250, 250],
      });
      console.log("✅ Test notification sent successfully");
    } catch (error) {
      console.error("❌ Failed to send test notification:", error);
    }
  };

  return { expoPushToken, notifications, sendTestNotification };
};