// screens/Signup.tsx
import React, { useState } from "react";
import FFSafeAreaView from "@/src/components/FFSafeAreaView";
import { useNavigation } from "@react-navigation/native";
import FFAuthForm from "./FFAuthForm";
import { StackNavigationProp } from "@react-navigation/stack";
import { LinearGradient } from "expo-linear-gradient";
import { RootStackParamList } from "@/src/navigation/AppNavigator";
import axiosInstance from "@/src/utils/axiosConfig";
import { useDispatch } from "@/src/store/types";
import { setAuthState } from "@/src/store/authSlice";
import FFModal from "@/src/components/FFModal";
import FFText from "@/src/components/FFText";
import { TextInput, TouchableOpacity, View, Text, StyleSheet } from "react-native"; // Added StyleSheet for modal error text
import IconIonicon from "react-native-vector-icons/Ionicons";

import FFButton from "@/src/components/FFButton";
import Spinner from "@/src/components/FFSpinner";
import { useTheme } from "@/src/hooks/useTheme";

type SignupScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  "Signup"
>;

const Signup = () => {
  const navigation = useNavigation<SignupScreenNavigationProp>();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState<boolean>(false);
  const [verificationCode, setVerificationCode] = useState("");
  // Change error state to an object to hold field-specific errors for the main form
  const [formErrors, setFormErrors] = useState<{
    general?: string;
    email?: string;
    password?: string;
    firstName?: string;
    lastName?: string;
  }>({});
  // Error state specifically for the verification modal
  const [verificationModalError, setVerificationModalError] = useState("");

  const [email, setEmail] = useState(""); // This state is used to pass email to the modal
  const [modalStatus, setModalStatus] = useState<
    "ENTER_CODE" | "VERIFIED_SUCCESS"
  >("ENTER_CODE");
  const [isOpenVerificationModal, setIsOpenVerificationModal] =
    useState<boolean>(false);
  const { theme } = useTheme();

  const handleSignupSubmit = async (
    email: string,
    password: string,
    firstName: string,
    lastName: string
  ) => {
    // Clear previous errors
    setFormErrors({});
    setEmail(email); // Keep email state updated for the modal

    // Client-side validation for missing fields
    const newErrors: typeof formErrors = {};
    if (!email) newErrors.email = "Email is required.";
    if (!password) newErrors.password = "Password is required.";
    if (!firstName) newErrors.firstName = "First name is required.";
    if (!lastName) newErrors.lastName = "Last name is required.";

    if (Object.keys(newErrors).length > 0) {
      setFormErrors(newErrors);
      return; // Stop submission if client-side validation fails
    }

    setLoading(true); // Set loading to true when starting the request

    const requestBody = {
      email: email,
      password: password,
      first_name: firstName,
      last_name: lastName,
    };

    try {
      const response = await axiosInstance.post(
        "/auth/register-customer",
        requestBody,
        {
          validateStatus: () => true, // Always return true so axios doesn't throw on errors
        }
      );

      setLoading(false); // Set loading to false once the response is received

      if (response.data) {
        const { EC, EM } = response.data;

        if (EC === 0) {
          setFormErrors({}); // Clear all form errors on success
          setIsOpenVerificationModal(true); // Open the verification modal
          setVerificationModalError(""); // Clear any previous modal errors
        } else if (EC === -3) {
          // Email already used
          setFormErrors({ email: 'This email is already registered. Please use a different email or log in' });
        } else if (EC === 1) {
          // Missing required fields (server-side validation)
          // Attempt to parse EM for specific field errors if possible, otherwise show general
          const missingFieldsErrors: typeof formErrors = {};
          if (EM && typeof EM === 'string') {
            if (EM.toLowerCase().includes("email")) missingFieldsErrors.email = "Email is missing or invalid.";
            if (EM.toLowerCase().includes("password")) missingFieldsErrors.password = "Password is missing or invalid.";
            if (EM.toLowerCase().includes("first_name")) missingFieldsErrors.firstName = "First name is missing.";
            if (EM.toLowerCase().includes("last_name")) missingFieldsErrors.lastName = "Last name is missing.";
          }
          if (Object.keys(missingFieldsErrors).length > 0) {
            setFormErrors(missingFieldsErrors);
          } else {
            setFormErrors({ general: EM || "Please fill in all required fields." });
          }
        } else {
          // Other errors
          setFormErrors({ general: EM || "An unexpected error occurred during signup. Please try again." });
        }
      } else {
        setFormErrors({ general: "Something went wrong. Please try again." });
      }
    } catch (error) {
      setLoading(false);
      setFormErrors({ general: "Network error. Please check your connection and try again." });
    }
  };

  const handleSubmitVerificationCode = async () => {
    setLoading(true);
    setVerificationModalError(""); // Clear previous modal errors

    if (!verificationCode) {
      setVerificationModalError("Please enter the verification code.");
      setLoading(false);
      return;
    }

    const requestBody = {
      email: email,
      code: verificationCode,
    };

    try {
      const response = await axiosInstance.post("/auth/verify-email", requestBody, {
        validateStatus: () => true,
      });

      setLoading(false);

      if (response.data) {
        const { EC, EM } = response.data;

        if (EC === 0) {
          setModalStatus("VERIFIED_SUCCESS");
          setVerificationModalError(""); // Clear error on success
        } else if (EC === 3) {
            // Invalid verification code
            setVerificationModalError(EM || "Invalid verification code. Please try again.");
        } else if (EC === 1) {
            // Missing code or email in verification (should be caught by client-side, but as fallback)
            setVerificationModalError(EM || "Verification code or email is missing.");
        }
        else {
          setVerificationModalError(EM || "Failed to verify email. Please try again.");
        }
      } else {
        setVerificationModalError("Something went wrong during verification. Please try again.");
      }
    } catch (error) {
      setLoading(false);
      setVerificationModalError("Network error during verification. Please try again later.");
    }
  };

  return (
    <FFSafeAreaView>
      <LinearGradient
        colors={
          theme === "light"
            ? ["#8fa3d9", "#b5b3a1", "#b5e1a1"]
            : ["#51d522", "#144a06", "#5c5d85"]
        }
        start={[1, 0]}
        end={[0, 1]}
        className="flex-1 items-center justify-center"
      >
        <Spinner
          isVisible={loading}
          isOverlay={true}
          overlayColor="rgba(0, 0, 0, 0.5)"
        />
        <FFAuthForm
          isSignUp={true}
          onSubmit={handleSignupSubmit}
          navigation={navigation}
          formErrors={formErrors} // Pass the formErrors object
        />
      </LinearGradient>

      <FFModal
        disabledClose
        visible={isOpenVerificationModal}
        onClose={() => setIsOpenVerificationModal(false)}
      >
        {modalStatus === "ENTER_CODE" ? (
          <View className="gap-4">
            <Text className="text-xl font-bold text-center">
              You're almost there!
            </Text>
            <View className="gap-2">
              <Text className="text-xs text-gray-400">
                One last step before starting your wonderful journey in
                Flashfood!
              </Text>
              <View className="items-center flex-row flex-wrap">
                <Text className="text-sm text-gray-500">
                  We have just sent you a verification code to{" "}
                </Text>
                <Text className="font-bold">{email}!</Text>
              </View>
            </View>
            <View className="gap-1">
              <Text>Enter your verification code:</Text>
              <TextInput
                className="border border-gray-300 px-3 py-2 rounded-md"
                keyboardType="number-pad"
                onChangeText={(text) =>
                  /^[0-9]*$/.test(text) && setVerificationCode(text)
                }
                value={verificationCode}
              />
              {/* Display verification modal specific error */}
              {verificationModalError && <Text style={modalStyles.errorText}>{verificationModalError}</Text>}
            </View>
            <FFButton
              onPress={handleSubmitVerificationCode}
              className="w-full mt-4"
              isLinear
            >
              Confirm
            </FFButton>
          </View>
        ) : (
          <View className="gap-4">
            <IconIonicon
              name="checkmark-circle"
              color={"#63c550"}
              size={30}
              className="text-center"
            />
            <View>
              <Text className="text-lg font-bold text-center">
                Your email is verified
              </Text>
              <Text className="text-sm text-gray-500">
                Thank you for joining us at Flashfood! We're excited to have you
                on board and hope you have a wonderful experience with us!
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => navigation.navigate("Login")}
              className="flex-row gap-1 items-center justify-center"
            >
              <Text className="text-[#a140e1] text-underline text-center font-semibold text-lg">
                Go to Login
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </FFModal>
    </FFSafeAreaView>
  );
};

// New StyleSheet for modal specific styles
const modalStyles = StyleSheet.create({
    errorText: {
        color: 'red',
        fontSize: 12,
        marginTop: 4,
    },
});

export default Signup;