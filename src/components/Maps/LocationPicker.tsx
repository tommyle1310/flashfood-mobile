import React, { useEffect, useState, useRef } from "react";
import {
  View,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import axios from "axios";
import * as Location from "expo-location";
import MapSearchResultSuggestions from "./MapSearchResultSuggestion";
import FFButton from "../FFButton";
import SlideUpModal from "../FFSlideUpModal";
import FFText from "../FFText";
import FFInputControl from "../FFInputControl";
import { CountryPicker } from "react-native-country-codes-picker";

const LocationPicker: React.FC = () => {
  const [selectedLocation, setSelectedLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestionsData, setSuggestionsData] = useState<any[]>([]);
  const [searchText, setSearchText] = useState("");
  const [debouncedSearchText, setDebouncedSearchText] = useState("");
  const [lastSearchText, setLastSearchText] = useState("");
  const [isShowSlideUpModal, setIsShowSlideUpModal] = useState(false);
  const [isShowCountryPicker, setIsShowCountryPicker] = useState(false);
  const [street, setStreet] = useState("");
  const [city, setCity] = useState("");
  const [nationality, setNationality] = useState("");
  const [addressTitle, setAddressTitle] = useState("");
  const [countryCode, setCountryCode] = useState("");
  const tomtomKey = "e73LfeJGmk0feDJtiyifoYWpPANPJLhT"; // Your TomTom API key
  const [isMapReady, setIsMapReady] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const mapViewRef = useRef<MapView | null>(null); // Ref to the MapView

  // Handle country selection
  const handleCountrySelect = (item: any) => {
    setCountryCode(item.dial_code);
    setNationality(item.name.en);
    setIsShowCountryPicker(false);
  };

  // Handle text change for search input
  const handleSearchTextChange = (changedSearchText: string) => {
    if (!changedSearchText || changedSearchText.length < 3) {
      setSuggestionsData([]);
      setShowSuggestions(false);
      return;
    }
    setSearchText(changedSearchText);
  };

  // Debounce search text for suggestions
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchText !== lastSearchText) {
        setDebouncedSearchText(searchText);
        setLastSearchText(searchText); // Update last search text
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchText]);

  // Fetch suggestions based on the debounced search text
  useEffect(() => {
    if (!debouncedSearchText || debouncedSearchText.length < 3) return;

    const baseUrl = `https://api.tomtom.com/search/2/search/${debouncedSearchText}.json?key=${tomtomKey}`;

    axios
      .get(baseUrl)
      .then((response) => {
        const addresses = response.data.results.map((v: any) => {
          let parts = v.address.freeformAddress.split(",");
          return {
            p1: parts[0],
            p2: parts[1],
            p3: parts[2],
            address: v.address.freeformAddress,
            lat: v.position.lat,
            lon: v.position.lon,
          };
        });
        setSuggestionsData(addresses);
        setShowSuggestions(true);
      })
      .catch((error) => {
        console.error("Error fetching location data", error);
      });
  }, [debouncedSearchText]);

  // Handle suggestion select and update the map center
  const handleSuggestionSelect = (item: any) => {
    setSelectedLocation({ lat: item.lat, lng: item.lon });
    setShowSuggestions(false);
  };

  // Handle map press to set a new location
  const handleMapPress = (e: any) => {
    const { coordinate } = e.nativeEvent;
    setSelectedLocation({
      lat: coordinate.latitude,
      lng: coordinate.longitude,
    });
  };

  // Fetch the current location of the user
  useEffect(() => {
    const getLocation = async () => {
      setIsLoading(true);
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === "granted") {
          const location = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.High,
          });
          const { latitude, longitude } = location.coords;
          setSelectedLocation({ lat: latitude, lng: longitude });
        }
      } catch (error) {
        console.error("Error getting location:", error);
      } finally {
        setIsLoading(false);
      }
    };
    getLocation();
  }, []);

  // When the selectedLocation changes, update the map region
  useEffect(() => {
    if (selectedLocation && mapViewRef.current) {
      mapViewRef.current.animateToRegion(
        {
          latitude: selectedLocation.lat,
          longitude: selectedLocation.lng,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        },
        1000 // Animation duration
      );
    }
  }, [selectedLocation]);

  if (isLoading) {
    return (
      <View style={[styles.map, styles.centerContent]}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, position: "relative" }}>
      <MapSearchResultSuggestions
        placeholder="Search location..."
        showList={showSuggestions}
        suggestionListData={suggestionsData}
        onPressItem={handleSuggestionSelect}
        handleSearchTextChange={handleSearchTextChange}
      />
      <MapView
        ref={mapViewRef}
        style={styles.map}
        region={{
          // Changed from initialRegion to region
          latitude: selectedLocation?.lat || 10.8291936,
          longitude: selectedLocation?.lng || 106.6203513,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
        onPress={handleMapPress}
        onMapReady={() => {
          setIsMapReady(true);
          // Force update of marker position when map is ready
          if (selectedLocation) {
            mapViewRef.current?.animateToRegion(
              {
                latitude: selectedLocation.lat,
                longitude: selectedLocation.lng,
                latitudeDelta: 0.05,
                longitudeDelta: 0.05,
              },
              1000
            );
          }
        }}
        showsUserLocation={true}
      >
        {selectedLocation && ( // Removed isMapReady check
          <Marker
            coordinate={{
              latitude: selectedLocation.lat,
              longitude: selectedLocation.lng,
            }}
            title="Selected Location"
            pinColor="blue"
          />
        )}
      </MapView>
      <FFButton
        onPress={() => setIsShowSlideUpModal(true)}
        style={{ position: "absolute", bottom: 30, right: 30 }}
      >
        Next
      </FFButton>

      <SlideUpModal
        isVisible={isShowSlideUpModal}
        onClose={() => {
          setIsShowSlideUpModal(false);
        }}
      >
        <View>
          <FFInputControl
            error={""}
            label="Street Name"
            placeholder="102 Phan Van Teo"
            setValue={setStreet}
            value={street}
          />
          <FFInputControl
            error={""}
            label="City"
            placeholder="Saigon"
            setValue={setCity}
            value={city}
          />
          <FFInputControl
            error={""}
            label="Address Title"
            placeholder="Home"
            setValue={setAddressTitle}
            value={addressTitle}
          />
          <View>
            <FFText style={{ color: "#333", fontSize: 14 }} fontWeight="400">
              Nationality
            </FFText>
            <TouchableOpacity
              onPress={() => setIsShowCountryPicker(true)}
              style={styles.textInputContainer}
            >
              <TextInput
                style={styles.textInput}
                editable={false}
                placeholder="Select Country"
                value={nationality}
              />
            </TouchableOpacity>
          </View>
        </View>

        <FFButton
          className="w-full"
          style={{ marginTop: 24 }}
          onPress={() => {}}
          isLinear
        >
          <FFText style={{ color: "#fff" }}>Save Changes</FFText>
        </FFButton>
        <CountryPicker
          show={isShowCountryPicker} // Trigger showing the country picker inside the modal
          pickerButtonOnPress={handleCountrySelect} // Handle country selection
          inputPlaceholder="Select Country"
          lang="en" // Language for country names
          enableModalAvoiding={true} // This will avoid keyboard overlapping
          androidWindowSoftInputMode="pan" // Optional: Manage keyboard interaction on Android
        />
      </SlideUpModal>
    </View>
  );
};

const styles = StyleSheet.create({
  map: {
    flex: 1,
  },
  centerContent: {
    justifyContent: "center",
    alignItems: "center",
  },
  textInput: {
    height: 40,
    fontSize: 16,
    color: "black",
    paddingLeft: 10,
  },
  textInputContainer: {
    marginBottom: 20,
    backgroundColor: "white",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ccc",
    paddingHorizontal: 10,
  },
});

export default LocationPicker;
