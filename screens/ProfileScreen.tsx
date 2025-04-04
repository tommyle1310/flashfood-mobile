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
import FFAvatar from "@/src/components/FFAvatar";
import FFSkeleton from "@/src/components/FFSkeleton";

// Định nghĩa type cho favorite_restaurants từ API
interface Address {
  id: string;
  street: string;
  city: string;
  postal_code: number;
  location: {
    lat: number;
    lng: number;
  };
}

interface FoodCategory {
  id: string;
  name: string;
  // Thêm các field khác nếu cần
}

interface FavoriteRestaurant {
  id: string;
  restaurant_name: string;
  avatar: { url: string; key: string } | null;
  address: Address;
  specialize_in: FoodCategory[];
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
  // Thêm state cho favoriteRestaurants
  const [favoriteRestaurants, setFavoriteRestaurants] = useState<
    FavoriteRestaurant[]
  >([]);

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

    const fetchFavoriteRestaurantData = async () => {
      setIsLoading(true);
      try {
        console.log("check id", id);
        const response = await axiosInstance.get(
          `/customers/favorite-restaurants/${id}`
        );
        console.log("check res", response.data);
        const { EC, EM, data } = response.data;
        if (EC === 0) {
          console.log("check data", data);
          setFavoriteRestaurants(data); // Set state với dữ liệu từ API
        }
      } catch (error) {
        setModalDetails({
          status: "ERROR",
          desc: "Something went wrong!",
          title: "Error while retrieving favorite restaurants.",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfileData();
    fetchFavoriteRestaurantData();
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
    <FFView
      style={{
        flexDirection: "row",
        gap: 12,
        borderRadius: 12,
        marginVertical: 8,
        marginHorizontal: 8,
        elevation: 3,
        padding: 12,
      }}
    >
      <FFAvatar rounded="sm" avatar={item?.avatar?.url} />
      <View>
        <Text className="text-lg font-semibold">{item.restaurant_name}</Text>
        <Text>{`${item.address.street}, ${item.address.city}`}</Text>
        <Text>
          Specialties:{" "}
          {item.specialize_in.map((cat) => cat.name).join(", ") || "N/A"}
        </Text>
      </View>
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
          data={favoriteRestaurants}
          renderItem={renderRestaurantItem}
          keyExtractor={(item) => item.id}
          ListEmptyComponent={<FFSkeleton height={80} />}
        />
      </View>
    </FFSafeAreaView>
  );
};

export default ProfileScreen;
