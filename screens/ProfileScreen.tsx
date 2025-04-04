import { TouchableOpacity, View, FlatList, Text } from "react-native";
import React, { useEffect, useState } from "react";
import FFSafeAreaView from "@/src/components/FFSafeAreaView";
import FFScreenTopSection from "@/src/components/FFScreenTopSection";
import { StackNavigationProp } from "@react-navigation/stack";
import { MainStackParamList } from "@/src/navigation/AppNavigator";
import { useNavigation } from "@react-navigation/native";
import ReadonlyProfileComponents from "@/src/components/screens/Profile/ReadonlyProfileComponents";
import { useSelector } from "@/src/store/types";
import { RootState } from "@/src/store/store";
import axiosInstance from "@/src/utils/axiosConfig";
import EditProfileComponent from "@/src/components/screens/Profile/EditProfileComponent";
import FFView from "@/src/components/FFView";

// Định nghĩa type cho favorite_restaurants
interface OpeningHours {
  [day: string]: {
    from: number;
    to: number;
  };
}

interface RestaurantStatus {
  is_accepted_orders: boolean;
  is_active: boolean;
  is_open: boolean;
}

interface FavoriteRestaurant {
  address_id: string;
  avatar: { url: string; key: string } | null;
  contact_email: any[];
  contact_phone: any[];
  created_at: number;
  description: string | null;
  id: string;
  images_gallery: string[] | null;
  opening_hours: OpeningHours;
  owner_id: string;
  owner_name: string;
  ratings: any | null;
  restaurant_name: string;
  status: RestaurantStatus;
  total_orders: number;
  updated_at: number;
}

type ProfileSreenNavigationProp = StackNavigationProp<
  MainStackParamList,
  "BottomTabs"
>;

interface Props_ProfileData {
  id: string;
  user_Id: string;
  avatar: { url: string; key: string };
  address: string[];
  first_name: string;
  last_name: string;
  user: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    is_verified: boolean;
  };
}

const ProfileScreen = () => {
  const navigation = useNavigation<ProfileSreenNavigationProp>();
  const [screenStatus, setScreenStatus] = useState<"READONLY" | "EDIT_PROFILE">(
    "READONLY"
  );
  const [isLoading, setIsLoading] = useState(false);
  const [firstName, setFirstName] = useState<string>("");
  const [lastName, setLastName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  const [modalDetails, setModalDetails] = useState<{
    status: "SUCCESS" | "ERROR" | "HIDDEN" | "INFO" | "YESNO";
    title: string;
    desc: string;
  }>({ status: "HIDDEN", title: "", desc: "" });
  const { id } = useSelector((state: RootState) => state.auth);
  const { favorite_restaurants } = useSelector(
    (state: RootState) => state.userPreference
  );
  const [profileData, setProfileData] = useState<Props_ProfileData>({
    id: "",
    user_Id: "",
    avatar: { url: "", key: "" },
    address: [""],
    first_name: "",
    last_name: "",
    user: {
      id: "",
      first_name: "",
      last_name: "",
      email: "",
      phone: "",
      is_verified: false,
    },
  });

  useEffect(() => {
    const fetchProfileData = async () => {
      setIsLoading(true);
      try {
        const response = await axiosInstance.get(`/customers/${id}`);
        const { EC, EM, data } = response.data;
        if (EC === 0) {
          setProfileData(data);
        }
      } catch (error) {
        setModalDetails({
          status: "ERROR",
          desc: "Something went wrong!",
          title: "Error while retrieving your profile data.",
        });
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfileData();
  }, [id]);

  useEffect(() => {
    const { id, address, avatar, first_name, last_name, user, user_Id } =
      profileData;
    let firstNameState;
    let lastNameState;
    if (first_name) {
      firstNameState = first_name;
    } else {
      firstNameState = user.first_name ? user.first_name : "";
    }
    if (last_name) {
      lastNameState = last_name;
    } else {
      lastNameState = user.last_name ? user.last_name : "";
    }
    if (profileData) {
      setEmail(profileData.user.email);
      setPhone(profileData.user.phone);
      setFirstName(firstNameState);
      setLastName(lastNameState);
    }
  }, [profileData]);

  // Render item cho FlatList
  const renderRestaurantItem = ({ item }: { item: FavoriteRestaurant }) => (
    <FFView style={{ elevation: 3, padding: 12, borderRadius: 12 }}>
      <Text className="text-lg font-semibold">{item.restaurant_name}</Text>
      <Text>{item.owner_name}</Text>
      <Text>Status: {item?.status?.is_open ? "Open" : "Closed"}</Text>
    </FFView>
  );

  return (
    <FFSafeAreaView>
      <FFScreenTopSection title="My Profile" navigation={navigation} />
      <View className="p-4">
        {screenStatus === "READONLY" ? (
          <ReadonlyProfileComponents
            email={profileData.user.email}
            firstName={profileData.first_name}
            lastName={profileData.last_name}
            phone={phone}
            toggleStatus={() => setScreenStatus("EDIT_PROFILE")}
          />
        ) : (
          <EditProfileComponent
            email={email}
            firstName={firstName}
            lastName={lastName}
            phone={phone}
            setEmail={setEmail}
            setFirstName={setFirstName}
            setLastName={setLastName}
            setPhone={setPhone}
          />
        )}
      </View>
      {/* Thêm FlatList để render favorite_restaurants */}
      <View className="p-4">
        <Text className="text-xl font-bold mb-2">Favorite Restaurants</Text>
        <FlatList
          data={favorite_restaurants as unknown as FavoriteRestaurant[]}
          renderItem={renderRestaurantItem}
          keyExtractor={(item) => item.id}
          ListEmptyComponent={<Text>No favorite restaurants found.</Text>}
        />
      </View>
    </FFSafeAreaView>
  );
};

export default ProfileScreen;
