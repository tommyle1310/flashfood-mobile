import { View, Text, TouchableOpacity, Alert } from "react-native";
import React, { useState } from "react";
import * as ImagePicker from "expo-image-picker"; // Import ImagePicker
import FFAvatar from "../../FFAvatar";
import FFInputControl from "../../FFInputControl";
import axios from "axios"; // Import axios for API calls
import axiosInstance from "@/src/utils/axiosConfig";
import { useSelector } from "@/src/store/types";
import { RootState } from "@/src/store/store";
import * as FileSystem from "expo-file-system";

const EditProfileComponent = ({
  firstName,
  lastName,
  email,
  phone,
  setFirstName,
  setLastName,
  setEmail,
  setPhone,
}: {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  setFirstName: React.Dispatch<React.SetStateAction<string>>;
  setLastName: React.Dispatch<React.SetStateAction<string>>;
  setEmail: React.Dispatch<React.SetStateAction<string>>;
  setPhone: React.Dispatch<React.SetStateAction<string>>;
}) => {
  const [imageUri, setImageUri] = useState<string | null>(null); // Store image URI
  const { user_id } = useSelector((state: RootState) => state.auth);

  // Function to launch image picker
  const pickImage = async () => {
    // Ask for permissions if necessary
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permissionResult.granted === false) {
      Alert.alert("Permission to access media library is required!");
      return;
    }

    // Launch image picker
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1], // Optional: To crop the image into a square
      quality: 1, // Optional: Quality of the image
    });

    // Ensure the result has assets and uri
    if (result.assets && result.assets.length > 0) {
      const asset = result.assets[0]; // Access the first asset (image/video)
      const uri = asset.uri;
      setImageUri(uri); // Set the image URI to state
      // Call the upload function to send the image to the server
      uploadAvatar(asset);
    }
  };

  // Function to handle the file upload to the server
  const uploadAvatar = async (asset: any) => {
    const formData = new FormData();

    // Fetch the image as a blob
    const response = await fetch(asset.uri);
    const blob = await response.blob(); // Convert to blob

    // Prepare the formatted file object (using Blob)
    const file = {
      fieldname: "file",
      originalname: asset.fileName || "image.jpg", // Use the file name if available
      encoding: "7bit", // Default encoding
      mimetype: asset.type || "image/jpeg", // Get the mime type of the asset
      buffer: blob, // Directly use the blob as buffer
      size: blob.size, // File size
    };

    // Append to FormData
    formData.append("file", file.buffer, file.originalname); // Append the blob with a filename
    formData.append("userType", "CUSTOMER"); // Add the userType field with a default value if undefined
    formData.append("entityId", user_id || ""); // Add the entityId field with a default value if undefined

    console.log("Form Data: ", formData);

    // Make the API call to upload the avatar
    const responseFromAPI = await axiosInstance.post(
      "upload/avatar", // Replace with your actual API URL
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        validateStatus: () => true, // Always return true so axios doesn't throw on non-2xx status codes
      }
    );

    // Destructure the responseFromAPI data
    const { EC, EM, data } = responseFromAPI.data;

    if (EC === 0) {
      // Success handling
      console.log("Avatar uploaded successfully", data);
    } else {
      // Error handling
      console.error("Error uploading avatar:", EM);
    }
    console.log("check", responseFromAPI.data);
  };

  return (
    <View className="bg-white rounded-xl border gap-4 border-gray-200 p-4">
      <View className="items-center">
        <TouchableOpacity onPress={pickImage}>
          {imageUri ? (
            <FFAvatar onPress={pickImage} size={80} avatar={imageUri} />
          ) : (
            <FFAvatar onPress={pickImage} size={80} />
          )}
        </TouchableOpacity>
      </View>
      {/* Other form fields */}
      <FFInputControl
        value={firstName}
        setValue={setFirstName}
        label="First Name"
        placeholder="Tommy"
        error={""}
      />
      <FFInputControl
        value={lastName}
        setValue={setLastName}
        label="Last Name"
        placeholder="Teo"
        error={""}
      />
      <FFInputControl
        value={email}
        setValue={setEmail}
        label="Email"
        disabled
        placeholder="teo@gmail.com"
        error={""}
      />
      <FFInputControl
        value={phone}
        setValue={setPhone}
        label="Phone Number"
        placeholder="(+84) 707171164"
        error={""}
      />
    </View>
  );
};

export default EditProfileComponent;
