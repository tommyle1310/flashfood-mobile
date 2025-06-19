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
import FFText from "@/src/components/FFText";
import colors from "@/src/theme/colors";
import { spacing } from "@/src/theme";
import { truncateString } from "@/src/utils/functions";

// Định nghĩa type cho favorite_restaurants từ API
interface Address {
  id: string;
  street: string;
  nationality?: string;
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
  phone?: string;
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
  const userRedux = useSelector((state: RootState) => state.auth);
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
        console.log('check id' , id)
        const response = await axiosInstance.get(`/customers/${id}`);
        const { EC, EM, data } = response.data;
        console.log('check resposne here', response.data)
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
    console.log('check id', id)
    if (id) {
      fetchProfileData();
      fetchFavoriteRestaurantData();
    }
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
      setEmail(profileData?.user?.email);
      setPhone(profileData?.user?.phone ?? profileData?.phone);
      setFirstName(firstNameState);
      setLastName(lastNameState);
    }
  }, [profileData]);

  // Render item cho FlatList
  const renderRestaurantItem = ({ item }: { item: FavoriteRestaurant }) => {
    const address = !item?.address?.street ? "N/A" : `${item?.address?.street}, ${item?.address?.city}, ${item?.address?.nationality}`
    const truncatedAddress = truncateString(address, 30)
    const spcializeIn = !item?.specialize_in ? "N/A" : `${item?.specialize_in?.map((cat) => cat.name).join(", ")}`
    const truncatedSpcializeIn = truncateString(spcializeIn, 25)
    return     (
     <FFView
       style={{
         flexDirection: "row",
         gap: 12,
         borderRadius: 12,
         marginVertical: 8,
         marginHorizontal: spacing.sm,
         elevation: 3,
         padding: spacing.sm,
       }}
       onPress={() =>
         navigation.navigate("RestaurantDetail", { restaurantId: item.id })
       }
     >
       <FFAvatar rounded="sm" avatar={item?.avatar?.url} />
       <View>
         <FFText className="text-lg font-semibold">
           {item.restaurant_name}
         </FFText>
         <FFText
           fontSize="sm"
           style={{ color: colors.grey }}
         >{truncatedAddress}</FFText>
         <FFText fontSize="sm" style={{ color: colors.grey }}>
           Specialties:{" "}
           {truncatedSpcializeIn}
         </FFText>
       </View>
     </FFView>
   );

  }

  return (
    <FFSafeAreaView>
      <FFScreenTopSection title="My Profile" navigation={navigation} />
      <View className="p-4">
        {screenStatus === "READONLY" ? (
          <ReadonlyProfileComponents
            email={profileData.user?.email}
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
      {screenStatus === "READONLY" && (
        <View className="p-4 gap-4">
          <FFText className="text-xl font-bold mb-2">
            Favorite Restaurants
          </FFText>
          <FlatList
            data={favoriteRestaurants}
            renderItem={renderRestaurantItem}
            keyExtractor={(item) => item.id}
            ListEmptyComponent={
              isLoading ? (
                <View style={{ gap: 12 }}>
                  <FFSkeleton height={80} />
                  <FFSkeleton height={80} />
                  <FFSkeleton height={80} />
                </View>
              ) : (
                <FFText style={{ color: colors.grey }}>
                  No favorite restaurants
                </FFText>
              )
            }
          />
        </View>
      )}
    </FFSafeAreaView>
  );
};

export default ProfileScreen;
