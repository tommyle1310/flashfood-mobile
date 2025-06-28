import { useEffect, useState, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { useSelector } from "@/src/store/types";
import { RootState } from "@/src/store/store";
import { BACKEND_URL } from "../utils/constants";

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

      // Only update if this is for the current driver we're tracking
      if (data.driverId === driverId) {
        setDriverLocation(data);
        setEta(data.eta);
        console.log(`⏰ ETA updated to: ${data.eta} minutes`);
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
    };
  }, [driverId, accessToken]);

  return {
    socket,
    driverLocation,
    eta,
    isConnected,
  };
}; 