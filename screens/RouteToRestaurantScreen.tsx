import { MainStackParamList } from "@/src/navigation/AppNavigator";
import { RootState } from "@/src/store/store";
import { useSelector } from "@/src/store/types";
import { RouteProp, useRoute } from "@react-navigation/native";
import React, { useState, useEffect } from "react";
import { View, StyleSheet, Text, Image } from "react-native";
import MapView, { Marker, Polyline, Region } from "react-native-maps";

// Type for the route coordinate object
interface Coordinate {
  latitude: number;
  longitude: number;
}

type RouteToRestaurantRouteProp = RouteProp<
  MainStackParamList,
  "RouteToRestaurant"
>;

const RouteToRestaurantScreen: React.FC = () => {
  const route = useRoute<RouteToRestaurantRouteProp>();
  const { address } = useSelector((state: RootState) => state.auth);
  const location = route.params;
  const [routeCoordinates, setRouteCoordinates] = useState<Coordinate[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

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
        `https://api.tomtom.com/routing/1/calculateRoute/${origin}:${destination}/json?key=${apiKey}&routeType=fastest&travelMode=car`
      );
      const data = await response.json();

      if (data.routes && data.routes.length > 0) {
        const coordinates = data.routes[0].legs[0].points.map((point: any) => ({
          latitude: point.latitude,
          longitude: point.longitude,
        }));
        return coordinates;
      } else {
        console.error("Error fetching route:", data);
        setErrorMessage("No route found between these locations");
        return [];
      }
    } catch (error) {
      console.error("Failed to fetch route from TomTom:", error);
      setErrorMessage("Error fetching route");
      return [];
    }
  };

  console.log("check address", address?.[0]?.location);
  console.log("check route params", location);

  // Effect to fetch the route when component mounts
  useEffect(() => {
    if (!address || address.length === 0 || !location) {
      console.error("Missing start or end location");
      setErrorMessage("Missing start or end location");
      setIsLoading(false);
      return;
    }

    const start: Coordinate = {
      latitude: address[0].location.lat,
      longitude: address[0].location.lng,
    };
    // Đổi end thành tọa độ gần hơn để test (VD: cách TP.HCM khoảng 10km)
    const end: Coordinate = {
      latitude: location.lat, // 10.87624019982737 (gần Thủ Đức, TP.HCM)
      longitude: location.lng, // 106.68918364465237
    };

    getRouteFromTomTom(start, end).then((route) => {
      if (route.length > 0) {
        setRouteCoordinates(route);
        setErrorMessage(null);
      }
      setIsLoading(false);
    });
  }, [address, location]);

  // Calculate the region for the map view
  const calculateRegion = (): Region => {
    if (routeCoordinates.length === 0) {
      return {
        latitude: address?.[0]?.location?.lat || 10.781975,
        longitude: address?.[0]?.location?.lng || 106.664512,
        latitudeDelta: 0.5,
        longitudeDelta: 0.5,
      };
    }

    const start = routeCoordinates[0];
    const end = routeCoordinates[routeCoordinates.length - 1];
    const latitude = (start.latitude + end.latitude) / 2;
    const longitude = (start.longitude + end.longitude) / 2;
    const latitudeDelta = Math.abs(start.latitude - end.latitude) * 1.5;
    const longitudeDelta = Math.abs(start.longitude - end.longitude) * 1.5;

    return { latitude, longitude, latitudeDelta, longitudeDelta };
  };

  return (
    <View style={{ flex: 1 }}>
      {isLoading ? (
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <Text>Loading...</Text>
        </View>
      ) : routeCoordinates.length === 0 ? (
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <Text>{errorMessage || "Could not load route"}</Text>
        </View>
      ) : (
        <MapView style={styles.map} region={calculateRegion()}>
          {/* Start Marker */}
          <Marker coordinate={routeCoordinates[0]} title="My Location">
            <Image
              source={{
                uri: "https://res.cloudinary.com/dlavqnrlx/image/upload/v1738823283/ybntvkauzjijxexnsjh2.png",
              }}
              style={{ width: 40, height: 40 }}
            />
          </Marker>

          {/* End Marker */}
          <Marker
            coordinate={routeCoordinates[routeCoordinates.length - 1]}
            title="Restaurant"
          >
            <Image
              source={{
                uri: "https://res.cloudinary.com/dlavqnrlx/image/upload/v1738823719/y3enpxwt8ankdbourzse.png",
              }}
              style={{ width: 40, height: 40 }}
            />
          </Marker>

          {/* Polyline for the route */}
          <Polyline
            coordinates={routeCoordinates}
            strokeColor="#bf59fe"
            strokeWidth={4}
          />
        </MapView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  map: {
    flex: 1,
  },
});

export default RouteToRestaurantScreen;
