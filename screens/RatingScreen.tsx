import React, { useEffect, useState } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
} from "react-native";
import FFSafeAreaView from "@/src/components/FFSafeAreaView";
import FFText from "@/src/components/FFText";
import FFButton from "@/src/components/FFButton";
import IconAntDesign from "react-native-vector-icons/AntDesign";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { MainStackParamList } from "@/src/navigation/AppNavigator";
import { useSelector } from "@/src/store/types";
import { RootState } from "@/src/store/store";
import axiosInstance from "@/src/utils/axiosConfig";
import { StackNavigationProp } from "@react-navigation/stack";
import FFAvatar from "@/src/components/FFAvatar";
import Spinner from "@/src/components/FFSpinner";

type RatingScreenRouteProp = RouteProp<MainStackParamList, "Rating">;

type RatingScreenNavigationProp = StackNavigationProp<
  MainStackParamList,
  "Rating"
>;

const RatingScreen = () => {
  const navigation = useNavigation<RatingScreenNavigationProp>();
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState("");
  const route = useRoute<RatingScreenRouteProp>();
  const { driver, restaurant, orderId } = route.params;
  const [typeRating, setTypeRating] = useState<"DRIVER" | "RESTAURANT">(
    "DRIVER"
  );
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const handleRatingPress = (index: number) => {
    setRating(index);
  };
  const { id: customerId } = useSelector((state: RootState) => state.auth);

  // useEffect(() => {
  //   console.log("cehck enti", driver, restaurant);
  // }, [driver, restaurant]);

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      const requestData = {
        rr_reviewer_customer_id:
          customerId ?? "FF_CUS_3db15de0-56e9-429a-9e51-21e5bd75b112",
        reviewer_type: "customer",
        rr_recipient_driver_id:
          typeRating === "DRIVER"
            ? driver.id ?? "FF_DRI_b64aa8b7-3964-46a4-abf4-924c5515f57a"
            : undefined,
        rr_recipient_restaurant_id:
          typeRating === "DRIVER"
            ? undefined
            : restaurant.id ?? "FF_RES_3b6fdece-9449-4192-a5d6-28a24720e927",
        recipient_type: typeRating === "DRIVER" ? "driver" : "restaurant",
        order_id: orderId ?? "FF_ORDER_d0dfb222-d95d-4df1-9d78-c125187216e3",
        food_rating: rating,
        delivery_rating: rating,
        delivery_review: typeRating === "DRIVER" ? review : undefined,
        food_review: typeRating === "DRIVER" ? undefined : review,
      };
      console.log("Rating submitted", requestData);

      const response = await axiosInstance.post(
        "/ratings-reviews",
        requestData,
        {
          // This will ensure axios does NOT reject on non-2xx status codes
          validateStatus: () => true, // Always return true so axios doesn't throw on errors
        }
      );
      console.log("cehc k res data", response.data);

      const { EC, EM, data } = response.data;
      if (EC === 0) {
        setIsLoading(false);
        if (typeRating === "DRIVER") {
          setRating(0);
          setReview("");
          setTypeRating("RESTAURANT");
          return;
        }
        navigation.navigate("BottomTabs", { screenIndex: 0 });
      }
    } catch (error) {
      console.error("Error submitting rating", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <Spinner isVisible isOverlay />;
  }

  return (
    <FFSafeAreaView>
      <View style={styles.container}>
        {/* Title */}
        <FFText fontSize="lg" fontWeight="600" style={styles.title}>
          Rate your {typeRating === "DRIVER" ? "driver" : "restaurant"}
        </FFText>

        {/* Diamond Image */}
        <FFAvatar
          avatar={
            (typeRating === "DRIVER"
              ? driver?.avatar?.url
              : restaurant?.avatar?.url) ?? undefined
          }
        />

        {/* Star Rating */}
        <View style={styles.starContainer}>
          {[1, 2, 3, 4, 5].map((index) => (
            <TouchableOpacity
              key={index}
              onPress={() => handleRatingPress(index)}
            >
              <IconAntDesign
                name="star"
                size={32}
                color={index <= rating ? "#FFC107" : "#E0E0E0"}
              />
            </TouchableOpacity>
          ))}
        </View>

        {/* Review Input */}
        <TextInput
          style={styles.textInput}
          placeholder="Type your review ..."
          placeholderTextColor="#aaa"
          value={review}
          onChangeText={setReview}
          multiline
        />

        {/* Buttons */}
        <View style={styles.buttonContainer}>
          <FFButton
            variant="link"
            onPress={() =>
              navigation.navigate("BottomTabs", { screenIndex: 0 })
            }
            style={styles.skipButton}
          >
            Skip
          </FFButton>
          <FFButton onPress={handleSubmit} style={styles.submitButton}>
            Submit
          </FFButton>
        </View>
      </View>
    </FFSafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 64,
    gap: 12,
    backgroundColor: "#fff",
  },
  title: {
    marginBottom: 16,
    textAlign: "center",
  },
  image: {
    width: 100,
    height: 100,
    marginBottom: 24,
  },
  starContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 64,
  },
  textInput: {
    width: "100%",
    height: 100,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    textAlignVertical: "top",
    marginBottom: 24,
    fontSize: 16,
    color: "#333",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  skipButton: {
    flex: 1,
    marginRight: 8,
    backgroundColor: "transparent",
  },
  submitButton: {
    flex: 1,
    width: "100%",
    marginLeft: 8,
    // backgroundColor: "#FF6F61",
  },
});

export default RatingScreen;
