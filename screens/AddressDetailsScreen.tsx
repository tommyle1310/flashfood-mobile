import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import React, { useEffect, useState } from "react";
import FFSafeAreaView from "@/src/components/FFSafeAreaView";
import LocationPicker from "@/src/components/Maps/LocationPicker";
import SlideUpModal from "@/src/components/FFSlideUpModal";
import FFInputControl from "@/src/components/FFInputControl";
import FFText from "@/src/components/FFText";
import FFButton from "@/src/components/FFButton";
import { CountryPicker } from "react-native-country-codes-picker";
import { RouteProp, useRoute } from "@react-navigation/native";
import { MainStackParamList } from "@/src/navigation/AppNavigator";
import { Type_Address } from "@/src/types/Address";
import axiosInstance from "@/src/utils/axiosConfig";
import FFModal from "@/src/components/FFModal";
import { updateSingleAddress } from "@/src/store/authSlice";
import { useDispatch, useSelector } from "@/src/store/types";
import { RootState } from "@/src/store/store";

type AddressDetailRouteProp = RouteProp<MainStackParamList, "AddressDetails">;

const AddressDetailsScreen = () => {
  const dispatch = useDispatch();
  const [isShowSlideUpModal, setIsShowSlideUpModal] = useState(false);
  const [isShowModalSuccess, setIsShowModalSuccess] = useState(false);
  const [isShowCountryPicker, setIsShowCountryPicker] = useState(false);
  const [street, setStreet] = useState("");
  const [city, setCity] = useState("");
  const [nationality, setNationality] = useState("");
  const [addressTitle, setAddressTitle] = useState("");
  const [countryCode, setCountryCode] = useState("");
  const [selectedLocation, setSelectedLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const { address } = useSelector((state: RootState) => state.auth);

  const route = useRoute<AddressDetailRouteProp>();

  const addressDetail = route.params?.addressDetail;

  useEffect(() => {
    if (addressDetail) {
      const { _id, city, is_default, location, nationality, street, title } =
        addressDetail;
      setAddressTitle(title);
      setCity(city);
      setNationality(nationality);
      setStreet(street);
      setSelectedLocation(location);
    }
  }, [addressDetail]);

  const handleCountrySelect = (item: any) => {
    setCountryCode(item.dial_code);
    setNationality(item.name.en);
    setIsShowCountryPicker(false);
  };

  const handleSubmit = async () => {
    let requestBody = {
      city,
      street,
      nationality,
      title: addressTitle,
      location: selectedLocation,
    } as Type_Address;
    let response: { data: { EC: number; EM: string; data: any } };
    if (addressDetail) {
      response = await axiosInstance.patch(
        `/address_books/${addressDetail._id}`,
        requestBody,
        {
          // This will ensure axios does NOT reject on non-2xx status codes
          validateStatus: () => true, // Always return true so axios doesn't throw on errors
        }
      );
    } else {
      response = await axiosInstance.post(`/address_books`, requestBody, {
        // This will ensure axios does NOT reject on non-2xx status codes
        validateStatus: () => true, // Always return true so axios doesn't throw on errors
      });
    }

    const { EC, EM, data } = response.data; // Access EC, EM, and data
    if (EC === 0) {
      console.log("cehck hrere", data);

      setIsShowSlideUpModal(false);
      setIsShowModalSuccess(true);
      dispatch(updateSingleAddress(data));
    } else {
      console.log("cehck err", response.data);
    }
  };

  console.log("check addres1", address?.[0]);

  return (
    <FFSafeAreaView>
      <LocationPicker
        propsLocation={addressDetail?.location}
        setPropsLocation={setSelectedLocation}
      />
      <FFButton
        onPress={() => setIsShowSlideUpModal(true)}
        style={{ position: "absolute", bottom: 30, right: 30 }}
      >
        Next
      </FFButton>
      <FFModal
        onClose={() => setIsShowModalSuccess(false)}
        visible={isShowModalSuccess}
      >
        <FFText>
          {addressDetail
            ? "Successfully updated address"
            : "Add new successfully"}
        </FFText>
      </FFModal>
      <SlideUpModal
        isVisible={isShowSlideUpModal}
        onClose={() => {
          setIsShowSlideUpModal(false);
        }}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={0}
          style={{ flex: 1 }}
        >
          <ScrollView
            contentContainerStyle={{ flexGrow: 1 }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
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
                <FFText
                  style={{ color: "#333", fontSize: 14 }}
                  fontWeight="400"
                >
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
              onPress={handleSubmit}
              isLinear
            >
              Save Changes
            </FFButton>
          </ScrollView>
        </KeyboardAvoidingView>
        <CountryPicker
          show={isShowCountryPicker}
          pickerButtonOnPress={handleCountrySelect}
          inputPlaceholder="Select Country"
          lang="en"
          enableModalAvoiding={false} // Changed to false
          androidWindowSoftInputMode="adjustPan"
        />
      </SlideUpModal>
    </FFSafeAreaView>
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

export default AddressDetailsScreen;
