import { useEffect, useState, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { useSelector } from "@/src/store/types";
import { RootState } from "@/src/store/store";
import { BACKEND_URL } from "../utils/constants";
import * as Notifications from "expo-notifications";

interface DriverLocationData {
  driverId: string;
  lat: number;
  lng: number;
  eta: number; // ETA in minutes
}

export const useDriverLocationSocket = (driverId: string | null) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [driverLocation, setDriverLocation] = useState<DriverLocationData | null>(null);
  const [eta, setEta] = useState<number | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const { accessToken } = useSelector((state: RootState) => state.auth);
  const currentDriverIdRef = useRef<string | null>(null);
  
  // Refs to track notification state
  const hasNotifiedRef = useRef<boolean>(false);
  const lastActivityRef = useRef<number>(Date.now());
  const inactivityTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Only connect if we have a valid driver ID and access token
    if (!driverId || !accessToken) {
      // Clean up existing connection if driver ID becomes null
      if (socket) {
        console.log("🔴 Disconnecting from driver location socket - no driver ID");
        socket.disconnect();
        setSocket(null);
        setDriverLocation(null);
        setEta(null);
        setIsConnected(false);
      }
      return;
    }

    // If driver ID changed, disconnect existing socket first
    if (currentDriverIdRef.current && currentDriverIdRef.current !== driverId && socket) {
      console.log("🔄 Driver ID changed, disconnecting existing socket");
      socket.disconnect();
      setSocket(null);
      setDriverLocation(null);
      setEta(null);
      setIsConnected(false);
    }

    currentDriverIdRef.current = driverId;

    console.log(`🟡 Connecting to driver location socket for driver: ${driverId}`);

    const socketInstance = io(`${BACKEND_URL}/location`, {
      transports: ["websocket"],
      extraHeaders: {
        auth: `Bearer ${accessToken}`,
      },
    });

    socketInstance.on("connect", () => {
      console.log("🟢 Connected to driver location server");
      setSocket(socketInstance);
      setIsConnected(true);

      // Subscribe to driver location updates
      console.log(`📡 Subscribing to driver location for: ${driverId}`);
      socketInstance.emit("subscribeToDriverLocation", {
        driverId: driverId,
      });
    });

    socketInstance.on("disconnect", (reason) => {
      console.log("🔴 Disconnected from driver location server:", reason);
      setSocket(null);
      setIsConnected(false);
      setDriverLocation(null);
      setEta(null);
      
      // Reset notification flag on disconnect
      hasNotifiedRef.current = false;
      
      // Clear any existing inactivity timer
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current);
        inactivityTimerRef.current = null;
      }
    });

    socketInstance.on("connect_error", (error) => {
      console.error("❌ Driver location connection error:", error.name, error.cause);
      setSocket(null);
      setIsConnected(false);
    });

    // Listen for driver current location updates
    socketInstance.on("driverCurrentLocation", (data: DriverLocationData) => {
      console.log("📍 Driver location update received:", {
        driverId: data.driverId,
        lat: data.lat,
        lng: data.lng,
        eta: data.eta,
      });

      // Update last activity timestamp
      lastActivityRef.current = Date.now();
      
      // Reset inactivity timer
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current);
      }
      
      // Set new inactivity timer (2 minutes = 120000ms)
      inactivityTimerRef.current = setTimeout(() => {
        console.log("⏱️ Inactivity detected for 2 minutes, resetting notification flag");
        hasNotifiedRef.current = false;
      }, 120000);

      // Only update if this is for the current driver we're tracking
      if (data.driverId === driverId) {
        setDriverLocation(data);
        setEta(data.eta);
        console.log(`⏰ ETA updated to: ${data.eta} minutes`);
        
        // Check if ETA is under 5 minutes and we haven't notified yet
        if (data.eta < 5 && !hasNotifiedRef.current) {
          sendArrivalNotification(data.eta);
          hasNotifiedRef.current = true;
          console.log("🔔 Sent arrival notification for ETA under 5 minutes");
        }
      } else {
        console.log(`⚠️ Received location for different driver: ${data.driverId}, expected: ${driverId}`);
      }
    });

    setSocket(socketInstance);

    return () => {
      console.log(`🔴 Cleaning up driver location socket for: ${driverId}`);
      if (socketInstance) {
        socketInstance.disconnect();
      }
      currentDriverIdRef.current = null;
      
      // Clear any existing inactivity timer on cleanup
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current);
        inactivityTimerRef.current = null;
      }
      
      // Reset notification flag on cleanup
      hasNotifiedRef.current = false;
    };
  }, [driverId, accessToken]);

  // Function to send arrival notification
  const sendArrivalNotification = async (etaMinutes: number) => {
    try {
      // For debugging - log that we're attempting to send a notification
      console.log("🔔🔔 ATTEMPTING to send arrival notification for ETA:", etaMinutes);
      
      // Use presentNotificationAsync for immediate foreground notifications in Expo Go
      await Notifications.presentNotificationAsync({
        title: "Driver Arriving Soon",
        body: `Your driver will arrive in 5 minutes`,
        data: { driverId },
        sound: true,
        priority: Notifications.AndroidNotificationPriority.HIGH,
        vibrate: [0, 250, 250, 250],
      });
      
      console.log("✅ Notification presented successfully");
    } catch (error) {
      console.error("❌ Failed to send arrival notification:", error);
    }
  };

  return {
    socket,
    driverLocation,
    eta,
    isConnected,
  };
};