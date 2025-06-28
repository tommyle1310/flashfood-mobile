import React, { useState, useEffect } from "react";
import { View, StyleSheet, Text, Image } from "react-native";
import MapView, { Marker, Polyline, Region } from "react-native-maps";

// Type for the route coordinate object
interface Coordinate {
  latitude: number;
  longitude: number;
}

const App: React.FC = () => {
  const [driverLocation, setDriverLocation] = useState<{
    lat: number;
    lon: number;
  } | null>(null);
  const [routeCoordinates, setRouteCoordinates] = useState<Coordinate[]>([]);
  const [driverProgress, setDriverProgress] = useState<number>(0);
  const [currentWaypointIndex, setCurrentWaypointIndex] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true); // Loading state for the route data

  // Function to get route from TomTom API
  const getRouteFromTomTom = async (
    start: Coordinate,
    end: Coordinate
  ): Promise<Coordinate[]> => {
    const origin = `${start.latitude},${start.longitude}`;
    const destination = `${end.latitude},${end.longitude}`;
    const apiKey = "7zmNwV5XQGs5II7Z7KxIp9K551ZlFAwV"; // Replace with your actual TomTom API key

    try {
      const response = await fetch(
        `https://api.tomtom.com/routing/1/calculateRoute/${origin}:${destination}/json?key=${apiKey}`
      );
      const data = await response.json();

      if (data.routes && data.routes.length > 0) {
        // Get the route's coordinates directly from the response
        const coordinates = data.routes[0].legs[0].points;
        return coordinates; // Return the decoded coordinates
      } else {
        console.error("Error fetching route:", data);
        return [];
      }
    } catch (error) {
      console.error("Failed to fetch route from TomTom:", error);
      return [];
    }
  };

  // Effect to fetch the route when component mounts
  useEffect(() => {
    const start: Coordinate = { latitude: 10.781975, longitude: 106.664512 }; // Example start location
    const end: Coordinate = {
      latitude: 12.253479988884011,
      longitude: 109.19216280504887,
    }; // Example end location

    getRouteFromTomTom(start, end).then((route) => {
      if (route.length > 0) {
        setRouteCoordinates(route);
        setIsLoading(false); // Stop loading when the route is fetched
      }
    });
  }, []);

  // Calculate the region for the map view
  const calculateRegion = (): Region => {
    const start = routeCoordinates[0];
    const end = routeCoordinates[routeCoordinates.length - 1];
    const latitude = (start.latitude + end.latitude) / 2;
    const longitude = (start.longitude + end.longitude) / 2;
    const latitudeDelta = Math.abs(start.latitude - end.latitude) * 1.5;
    const longitudeDelta = Math.abs(start.longitude - end.longitude) * 1.5;

    return {
      latitude,
      longitude,
      latitudeDelta,
      longitudeDelta,
    };
  };

  // Effect to update the driver's location
  useEffect(() => {
    if (routeCoordinates.length === 0) return; // Guard clause to prevent error when route is empty

    const driverMovementInterval = setInterval(() => {
      if (currentWaypointIndex < routeCoordinates.length - 1) {
        const startPoint = routeCoordinates[currentWaypointIndex];
        const endPoint = routeCoordinates[currentWaypointIndex + 1];
        const progress = driverProgress + 0.01;

        const currentLatitude = lerp(
          startPoint.latitude,
          endPoint.latitude,
          progress
        );
        const currentLongitude = lerp(
          startPoint.longitude,
          endPoint.longitude,
          progress
        );

        setDriverLocation({ lat: currentLatitude, lon: currentLongitude });

        if (progress >= 1) {
          setDriverProgress(0);
          setCurrentWaypointIndex(currentWaypointIndex + 1);
        } else {
          setDriverProgress(progress);
        }
      }
    }, 100);

    return () => {
      clearInterval(driverMovementInterval);
    };
  }, [driverProgress, currentWaypointIndex, routeCoordinates]);

  // Linear interpolation function for smooth movement
  const lerp = (start: number, end: number, progress: number): number => {
    return start + (end - start) * progress;
  };

  // Unconditionally render the hooks by always showing the MapView component,
  // but we control rendering different content inside it with the loading state.
  return (
    <View style={{ flex: 1 }}>
      {isLoading ? (
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <Text>Loading...</Text>
        </View>
      ) : (
        <MapView style={styles.map} region={calculateRegion()}>
          {/* Start Marker */}
          <Marker coordinate={routeCoordinates[0]} title="Start">
            <Image
              source={{
                uri: "https://res.cloudinary.com/dlavqnrlx/image/upload/v1738823719/y3enpxwt8ankdbourzse.png",
              }}
              style={{ width: 40, height: 40 }} // Resize the image
            />
          </Marker>

          {/* End Marker */}
          <Marker
            coordinate={routeCoordinates[routeCoordinates.length - 1]}
            title="End"
          >
            <Image
              source={{
                uri: "https://res.cloudinary.com/dlavqnrlx/image/upload/v1738823283/ybntvkauzjijxexnsjh2.png",
              }}
              style={{ width: 40, height: 40 }} // Resize the image
            />
          </Marker>

          {/* Driver's location Marker */}
          {driverLocation && (
            <Marker
              coordinate={{
                latitude: driverLocation.lat,
                longitude: driverLocation.lon,
              }}
              title="Driver's Location"
            >
              <Image
                source={{
                  uri: "https://res.cloudinary.com/dlavqnrlx/image/upload/v1738822195/p4l4v3g3fouypc7ycrqf.png",
                }}
                style={{ width: 30, height: 30 }} // Resize the image
              />
            </Marker>
          )}

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

export default App;
