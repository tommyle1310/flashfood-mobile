import {
  View,
  Image,
  FlatList,
  TouchableOpacity,
  Pressable,
} from "react-native";
import React from "react";
import FFSafeAreaView from "@/src/components/FFSafeAreaView";
import FFScreenTopSection from "@/src/components/FFScreenTopSection";
import FFText from "@/src/components/FFText";
import FFView from "@/src/components/FFView";
import IconAntDesign from "react-native-vector-icons/AntDesign";
import { MainStackParamList } from "@/src/navigation/AppNavigator";
import { StackNavigationProp } from "@react-navigation/stack";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { IMAGE_LINKS } from "@/src/assets/imageLinks";
import { spacing } from "@/src/theme";

type NearYouSreenNavigationProp = StackNavigationProp<
  MainStackParamList,
  "NearYou"
>;

type RestaurantDetailRouteProp = RouteProp<MainStackParamList, "NearYou">;

const NearYouScreen = () => {
  const navigation = useNavigation<NearYouSreenNavigationProp>();
  const route = useRoute<RestaurantDetailRouteProp>();
  const restaurantList = route.params;
  console.log("chec k res list", restaurantList);

  const renderRestaurantItem = ({
    item,
  }: {
    item: (typeof restaurantList)[0];
  }) => (
    <Pressable
      onPress={() =>
        navigation.navigate("RestaurantDetail", { restaurantId: item.id })
      }
      style={{
        // flexDirection: "row",
        alignItems: "center",
        marginBottom: spacing.md,
        backgroundColor: "#fff",
        borderRadius: 12,
        padding: spacing.md,
        gap: 12,
        elevation: 4,
      }}
    >
      {/* Restaurant Image */}
      <Image
        source={{ uri: item?.avatar?.url ?? IMAGE_LINKS.DEFAULT_AVATAR_FOOD }}
        style={{
          width: "100%",
          height: 120,
          borderRadius: 8,
        }}
        resizeMode="cover" // Change to "contain" if you want the full image without cropping
      />

      {/* Restaurant Details */}
      <View
        style={{
          flex: 1,
          flexDirection: "row",
          justifyContent: "space-between",
          width: "100%",
        }}
      >
        <View>
          <FFText style={{ fontWeight: "600", fontSize: 16 }}>
            {item?.restaurant_name}
          </FFText>
          <FFText style={{ color: "#aaa", fontSize: 12 }}>
            {item?.specialize_in?.[0]?.name}
            {item?.address?.street}
          </FFText>
        </View>
        <TouchableOpacity>
          <IconAntDesign name="hearto" size={20} color="#3FB854" />
        </TouchableOpacity>
      </View>

      {/* Favorite Icon */}
    </Pressable>
  );

  return (
    <FFSafeAreaView>
      <FFScreenTopSection navigation={navigation} title="Popular Near You" />
      <FlatList
        data={restaurantList}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderRestaurantItem}
        contentContainerStyle={{ padding: spacing.md }}
        showsVerticalScrollIndicator={false}
      />
    </FFSafeAreaView>
  );
};

export default NearYouScreen;
