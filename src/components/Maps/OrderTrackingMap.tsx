import React, { useState, useEffect } from "react";
import { View, StyleSheet, Text, Image, Dimensions } from "react-native";
import MapView, { Marker, Polyline, Region } from "react-native-maps";

interface Coordinate {
  latitude: number;
  longitude: number;
}

interface OrderTrackingMapProps {
  restaurantLocation: { lat: number; lon: number } | null;
  customerLocation: { lat: number; lon: number } | null;
  driverLocation: { lat: number; lng: number } | null;
  style?: any;
}

const OrderTrackingMap: React.FC<OrderTrackingMapProps> = ({
  restaurantLocation,
  customerLocation,
  driverLocation,
  style,
}) => {
  const [routeCoordinates, setRouteCoordinates] = useState<Coordinate[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Convert locations to coordinate format
  const restaurantCoord: Coordinate | null = restaurantLocation
    ? {
        latitude: restaurantLocation.lat,
        longitude: restaurantLocation.lon,
      }
    : null;

  const customerCoord: Coordinate | null = customerLocation
    ? {
        latitude: customerLocation.lat,
        longitude: customerLocation.lon,
      }
    : null;

  const driverCoord: Coordinate | null = driverLocation
    ? {
        latitude: driverLocation.lat,
        longitude: driverLocation.lng,
      }
    : null;

  // Function to get route from TomTom API
  const getRouteFromTomTom = async (
    start: Coordinate,
    end: Coordinate
  ): Promise<Coordinate[]> => {
    const origin = `${start.latitude},${start.longitude}`;
    const destination = `${end.latitude},${end.longitude}`;
    const apiKey = "7zmNwV5XQGs5II7Z7KxIp9K551ZlFAwV";

    try {
      const response = await fetch(
        `https://api.tomtom.com/routing/1/calculateRoute/${origin}:${destination}/json?key=${apiKey}`
      );
      const data = await response.json();

      if (data.routes && data.routes.length > 0) {
        const coordinates = data.routes[0].legs[0].points;
        return coordinates;
      } else {
        console.error("Error fetching route:", data);
        return [];
      }
    } catch (error) {
      console.error("Failed to fetch route from TomTom:", error);
      return [];
    }
  };

  // Effect to fetch the route when locations are available
  useEffect(() => {
    if (restaurantCoord && customerCoord) {
      setIsLoading(true);
      getRouteFromTomTom(restaurantCoord, customerCoord).then((route) => {
        if (route.length > 0) {
          setRouteCoordinates(route);
        }
        setIsLoading(false);
      });
    } else {
      setIsLoading(false);
    }
  }, [restaurantLocation, customerLocation]);

  // Calculate the region for the map view
  const calculateRegion = (): Region => {
    const coordinates = [restaurantCoord, customerCoord, driverCoord].filter(
      Boolean
    ) as Coordinate[];

    if (coordinates.length === 0) {
      // Default region if no coordinates
      return {
        latitude: 10.762622,
        longitude: 106.660172,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      };
    }

    const lats = coordinates.map((coord) => coord.latitude);
    const lngs = coordinates.map((coord) => coord.longitude);

    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLng = Math.min(...lngs);
    const maxLng = Math.max(...lngs);

    const latitude = (minLat + maxLat) / 2;
    const longitude = (minLng + maxLng) / 2;
    const latitudeDelta = Math.max((maxLat - minLat) * 1.5, 0.01);
    const longitudeDelta = Math.max((maxLng - minLng) * 1.5, 0.01);

    return {
      latitude,
      longitude,
      latitudeDelta,
      longitudeDelta,
    };
  };

  // If no locations available, show placeholder
  if (!restaurantCoord || !customerCoord) {
    return (
      <View style={[styles.container, style]}>
        <View style={styles.placeholder}>
          <Text style={styles.placeholderText}>
            Waiting for location data...
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, style]}>
      <MapView style={styles.map} region={calculateRegion()}>
        {/* Restaurant Marker */}
        <Marker coordinate={restaurantCoord} title="Restaurant">
          <Image
            source={{
              uri: "https://res.cloudinary.com/dlavqnrlx/image/upload/v1738823719/y3enpxwt8ankdbourzse.png",
            }}
            style={styles.restaurantMarker}
          />
        </Marker>

        {/* Customer Marker */}
        <Marker coordinate={customerCoord} title="Delivery Location">
          <Image
            source={{
              uri: "https://res.cloudinary.com/dlavqnrlx/image/upload/v1738823283/ybntvkauzjijxexnsjh2.png",
            }}
            style={styles.customerMarker}
          />
        </Marker>

        {/* Driver Marker - only show if driver location is available */}
        {driverCoord && (
          <Marker coordinate={driverCoord} title="Driver Location">
            <Image
              source={{
                uri: "https://res.cloudinary.com/dlavqnrlx/image/upload/v1738822195/p4l4v3g3fouypc7ycrqf.png",
              }}
              style={styles.driverMarker}
            />
          </Marker>
        )}

        {/* Route Polyline */}
        {routeCoordinates.length > 0 && (
          <Polyline
            coordinates={routeCoordinates}
            strokeColor="#4CAF50"
            strokeWidth={3}
            lineDashPattern={[1]}
          />
        )}
      </MapView>

      {/* Loading overlay */}
      {isLoading && (
        <View style={styles.loadingOverlay}>
          <Text style={styles.loadingText}>Loading route...</Text>
        </View>
      )}
    </View>
  );
};

const { width } = Dimensions.get("window");

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#f5f5f5",
  },
  map: {
    width: "100%",
    height: 200,
  },
  placeholder: {
    height: 200,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
  },
  placeholderText: {
    color: "#666",
    fontSize: 14,
  },
  restaurantMarker: {
    width: 35,
    height: 35,
  },
  customerMarker: {
    width: 35,
    height: 35,
  },
  driverMarker: {
    width: 30,
    height: 30,
  },
  loadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(255,255,255,0.8)",
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    color: "#666",
    fontSize: 14,
  },
});

export default OrderTrackingMap; 