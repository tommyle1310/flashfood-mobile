import { View, Text, Pressable, TouchableOpacity } from "react-native";
import React from "react";
import FFSafeAreaView from "@/src/components/FFSafeAreaView";
import FFScreenTopSection from "@/src/components/FFScreenTopSection";
import { StackNavigationProp } from "@react-navigation/stack";
import { MainStackParamList } from "@/src/navigation/AppNavigator";
import { useNavigation } from "@react-navigation/native";
import FFText from "@/src/components/FFText";
import IconFeather from "react-native-vector-icons/Feather";
import IconMaterialIcons from "react-native-vector-icons/MaterialIcons";
import IconFontisto from "react-native-vector-icons/Fontisto";
import { useDispatch, useSelector } from "@/src/store/types";
import { RootState } from "@/src/store/store";
import { truncateString } from "@/src/utils/functions";
import {
  addAddressInAsyncStorage,
  setDefaultAddress,
  setDefaultAddressInStorage,
} from "@/src/store/authSlice";
import axiosInstance from "@/src/utils/axiosConfig";
import FFButton from "@/src/components/FFButton";

type AddressListSreenNavigationProp = StackNavigationProp<
  MainStackParamList,
  "BottomTabs"
>;

interface Props_Address {
  location: {
    lng: number;
    lat: number;
  };
  id: string;
  street: string;
  city: string;
  nationality: string;
  is_default: boolean;
  created_at: number;
  updated_at: number;
  postal_code: number;
  title: string;
}

const AddressListScreen = () => {
  const navigation = useNavigation<AddressListSreenNavigationProp>();
  const { address, id } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();
  const handleSelectAddress = async (item: Props_Address) => {
    const response = await axiosInstance.patch(
      `/customers/address/${id}/${item.id}`,
      {
        // This will ensure axios does NOT reject on non-2xx status codes
        validateStatus: () => true, // Always return true so axios doesn't throw on errors
      }
    );

    // Now you can safely access the EC field
    const { EC, EM, data } = response.data;
    console.log("check res", response.data);

    if (EC === 0) {
      dispatch(setDefaultAddress(item));
      dispatch(setDefaultAddressInStorage(item as any));
    } else {
      console.log("st h wrnt wrong");
    }
  };

  return (
    <FFSafeAreaView>
      <FFScreenTopSection navigation={navigation} title="Address List" />
      <View className="p-4 gap-2 mt-8">
        {address && address.length > 0 ? (
          address.map((item) => (
            <Pressable
              onPress={() => handleSelectAddress(item)}
              key={item.id}
              style={{
                borderColor: item.is_default ? "#63c550" : "#aaa",
                backgroundColor: item.is_default ? "#deefdc" : "#fff",
              }}
              className="rounded-lg border flex-row items-center p-2 "
            >
              <View className="flex-1 ">
                <FFText>{item.title}</FFText>
                <FFText
                  fontWeight="400"
                  style={{ color: item.is_default ? "#215a1d" : "#aaa" }}
                >
                  {truncateString(
                    `${item.street}, ${item.city}, ${item.nationality}`,
                    24
                  )}
                </FFText>
              </View>
              <View className="gap-2">
                <IconFontisto
                  name={
                    item.is_default ? "radio-btn-active" : "radio-btn-passive"
                  }
                  size={18}
                  color={item.is_default ? "#63c550" : "#222"}
                  className="self-end mr-1"
                />
                <View className="gap-2 flex-row items-center justify-center">
                  <TouchableOpacity
                    onPress={() =>
                      navigation.navigate("AddressDetails", {
                        addressDetail: item,
                      })
                    }
                  >
                    <IconFeather name="edit" size={18} className="" />
                  </TouchableOpacity>
                  <IconMaterialIcons name="delete-outline" size={26} />
                </View>
              </View>
            </Pressable>
          ))
        ) : (
          <View className="items-center justify-center gap-4">
            <FFText fontWeight="400" style={{ color: "#888" }}>
              You don't have any saved addresses yet
            </FFText>
            <FFButton
              onPress={() =>
                navigation.navigate("AddressDetails", { is_create_type: true })
              }
              className="w-full "
            >
              Add New Address
            </FFButton>
          </View>
        )}
      </View>
    </FFSafeAreaView>
  );
};

export default AddressListScreen;
