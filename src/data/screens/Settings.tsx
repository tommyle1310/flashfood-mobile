import FFToggle from "@/src/components/FFToggle";
import IconIonicons from "react-native-vector-icons/Ionicons";

export const Data_screen_Setting = {
  "Account Settings": [
    {
      title: "Edit Profile",
      rightIcon: <IconIonicons name="chevron-forward-outline" size={20} />,
      onPress: () => {},
    },
    {
      title: "Change Password",
      rightIcon: <IconIonicons name="chevron-forward-outline" size={20} />,
      onPress: () => {},
    },
    {
      title: "Add a Payment Method",
      rightIcon: <IconIonicons name="chevron-forward-outline" size={20} />,
      onPress: () => {},
    },
    {
      title: "Push Notifications",
      rightIcon: <FFToggle initialChecked />,
      onPress: () => {},
    },
    {
      title: "Dark Mode",
      rightIcon: <FFToggle initialChecked />,
      onPress: () => {},
    },
  ],
  More: [
    {
      title: "About Us",
      rightIcon: <IconIonicons name="chevron-forward-outline" size={20} />,
      onPress: () => {},
    },
    {
      title: "Privacy Policy",
      rightIcon: <IconIonicons name="chevron-forward-outline" size={20} />,
      onPress: () => {},
    },
  ],
};
