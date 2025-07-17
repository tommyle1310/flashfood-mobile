// components/FFAuthForm.tsx
import React, { useRef, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Pressable,
  StyleSheet,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import IconIonicons from "react-native-vector-icons/Ionicons";
import FFAvatar from "@/src/components/FFAvatar";
import FFInputControl from "@/src/components/FFInputControl"; // We will also update this component
import { colors, spacing } from "@/src/theme";
import FFView from "@/src/components/FFView";
import FFText from "@/src/components/FFText";
import { IMAGE_LINKS } from "@/src/assets/imageLinks";

type FFAuthFormProps = {
  isSignUp: boolean;
  onSubmit: (
    email: string,
    password: string,
    firstName: string,
    lastName: string
  ) => void;
  navigation?: any; // Optional navigation prop, used only in SignUp for navigation,
  // Change error prop to formErrors object
  formErrors?: {
    general?: string;
    email?: string;
    password?: string;
    firstName?: string;
    lastName?: string;
  };
};

const FFAuthForm = ({
  isSignUp,
  onSubmit,
  navigation,
  formErrors, // Destructure formErrors
}: FFAuthFormProps) => {
  const [email, setEmail] = useState("flashfood211@gmail.com");
  const [password, setPassword] = useState("000000");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const passwordInputRef = useRef<TextInput>(null);

  const togglePasswordVisibility = () => {
    setIsPasswordVisible((prevState) => !prevState);
  };

  const handleSubmit = () => {
    onSubmit(email, password, firstName, lastName);
  };

  const handleInputContainerPress = () => {
    if (passwordInputRef.current) {
      passwordInputRef.current.focus();
    }
  };

  return (
    <FFView style={styles.container}>
      <View
        style={{
          position: "absolute",
          right: 0,
          left: 0,
          top: -40,
          transform: [{ translateX: "40%" }],
        }}
      >
        <FFAvatar avatar={IMAGE_LINKS.APP_LOGO} />
      </View>
      <FFText style={styles.headerText}>
        {isSignUp ? "Sign Up" : "Login"}
      </FFText>
      <View style={styles.switchAuthContainer}>
        <FFText style={styles.switchAuthText}>
          {isSignUp ? "Already have an account?" : "Don't have an account?"}
        </FFText>
        <TouchableOpacity
          onPress={() => navigation?.navigate(isSignUp ? "Login" : "Signup")}
        >
          <Text style={styles.switchAuthLink}>
            {isSignUp ? "Log In" : "Sign Up"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Display general error message if it exists */}
      {formErrors?.general && (
        <View style={{width: '100%', justifyContent: 'center', paddingTop: spacing.sm,  borderRadius: spacing.sm, backgroundColor: colors.ligth_error, alignItems: 'center'}}>
        <FFText style={styles.generalErrorText}>{formErrors.general}</FFText>

        </View>
      )}

      <FFInputControl
        error={formErrors?.email} // Pass specific error for email
        label="Email"
        placeholder="teo@gmail.com"
        setValue={setEmail}
        value={email}
      />
      {isSignUp && (
        <>
          <FFInputControl
            error={formErrors?.firstName} // Pass specific error for first name
            label="First name"
            placeholder="Tom"
            setValue={setFirstName}
            value={firstName}
          />
          <FFInputControl
            error={formErrors?.lastName} // Pass specific error for last name
            label="Last name"
            placeholder="Morn"
            setValue={setLastName}
            value={lastName}
          />
        </>
      )}

      <FFInputControl
        error={formErrors?.password} // Pass specific error for password
        secureTextEntry
        label="Password"
        placeholder="******"
        setValue={setPassword}
        value={password}
        // You might want to remove the password visibility toggle from FFAuthForm if FFInputControl handles it
        // Or if FFInputControl *doesn't* handle it, you'd need to adapt FFInputControl to accept these props
        // For now, let's assume FFInputControl takes care of its own secureTextEntry icon or you move that logic there.
      />

      <Pressable onPress={handleSubmit}>
        <LinearGradient
          colors={["#63c550", "#a3d98f"]}
          start={[0, 0]}
          end={[1, 0]}
          style={styles.button}
        >
          <Text style={styles.buttonText}>
            {isSignUp ? "Sign Up" : "Log In"}
          </Text>
        </LinearGradient>
      </Pressable>
    </FFView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: spacing.md,
    borderRadius: 16,
    position: "relative",
    paddingTop: 40,
    width: "90%",
    shadowColor: "#b5b3a1",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
    gap: 16,
  },
  headerText: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
  },
  switchAuthContainer: {
    flexDirection: "row",
    gap: 4,
    alignItems: "center",
    marginTop: spacing.sm,
  },
  generalErrorText: {
    color: "red",
    textAlign: "center",
    marginBottom: spacing.sm,
    fontSize: 14,
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  switchAuthText: {
    fontSize: 14,
  },
  switchAuthLink: {
    color: "#63c550",
    fontWeight: "600",
  },
  inputContainer: {
    marginTop: spacing.sm,
  },
  inputLabel: {
    fontSize: 14,
    color: "#333",
  },
  inputField: {
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: spacing.lg,
    fontSize: 14,
    color: "#333",
    marginTop: -spacing.sm,
  },
  iconButton: {
    position: "absolute",
    right: 16,
    top: 16,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: spacing.xl,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 5,
    marginTop: spacing.md,
  },
  buttonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default FFAuthForm;