import { View, Text } from "react-native";
import React from "react";
import FFSafeAreaView from "@/src/components/FFSafeAreaView";
import LocationPicker from "@/src/components/Maps/LocationPicker";

const AddressDetailsScreen = () => {
  return (
    <FFSafeAreaView>
      <LocationPicker />
    </FFSafeAreaView>
  );
};

export default AddressDetailsScreen;
