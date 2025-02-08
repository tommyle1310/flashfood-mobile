import { View, Text, Pressable } from "react-native";
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
  setDefaultAddress,
  setDefaultAddressInStorage,
} from "@/src/store/authSlice";

type AddressListSreenNavigationProp = StackNavigationProp<
  MainStackParamList,
  "BottomTabs"
>;

const AddressListScreen = () => {
  const navigation = useNavigation<AddressListSreenNavigationProp>();
  const { address } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();
  const handleSelectAddress = (item: {
    location: {
      lon: number;
      lat: number;
    };
    _id: string;
    street: string;
    city: string;
    nationality: string;
    is_default: boolean;
    created_at: number;
    updated_at: number;
    postal_code: number;
    title: string;
    __v: number;
  }) => {
    console.log("check ", item);
    dispatch(setDefaultAddress(item));
    dispatch(setDefaultAddressInStorage(item));
  };
  console.log("cehck address", address);

  return (
    <FFSafeAreaView>
      <FFScreenTopSection navigation={navigation} title="Address List" />
      <View className="p-4">
        {address?.map((item) => (
          <Pressable
            onPress={() => handleSelectAddress(item)}
            key={item._id}
            className="rounded-lg border flex-row items-center p-2"
          >
            <View className="flex-1 ">
              <FFText>{item.title}</FFText>
              <FFText fontWeight="400" style={{ color: "#aaa" }}>
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
                <IconFeather name="edit" size={18} className="" />
                <IconMaterialIcons name="delete-outline" size={26} />
              </View>
            </View>
          </Pressable>
        ))}
      </View>
    </FFSafeAreaView>
  );
};

export default AddressListScreen;
