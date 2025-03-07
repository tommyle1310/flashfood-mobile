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
import FFInputControl from "@/src/components/FFInputControl";

type FFAuthFormProps = {
  isSignUp: boolean;
  onSubmit: (email: string, password: string) => void;
  navigation?: any; // Optional navigation prop, used only in SignUp for navigation,
  error?: string;
};

const FFAuthForm = ({
  isSignUp,
  onSubmit,
  navigation,
  error,
}: FFAuthFormProps) => {
  const [email, setEmail] = useState("customer@gmail.com");
  const [password, setPassword] = useState("000000");
  const [isPasswordVisible, setIsPasswordVisible] = useState(false); // State to toggle password visibility
  const passwordInputRef = useRef<TextInput>(null);

  const togglePasswordVisibility = () => {
    setIsPasswordVisible((prevState) => !prevState);
  };

  const handleSubmit = () => {
    onSubmit(email, password);
  };

  const handleInputContainerPress = () => {
    if (passwordInputRef.current) {
      passwordInputRef.current.focus();
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.headerText}>{isSignUp ? "Sign Up" : "Login"}</Text>
      <FFAvatar avatar="https://res.cloudinary.com/dpubnzap3/image/upload/v1738820317/g2nvwg7zrqkevpdarn3r.png" />
      <View style={styles.switchAuthContainer}>
        <Text style={styles.switchAuthText}>
          {isSignUp ? "Already have an account?" : "Don't have an account?"}
        </Text>
        <TouchableOpacity
          onPress={() => navigation?.navigate(isSignUp ? "Login" : "Signup")}
        >
          <Text style={styles.switchAuthLink}>
            {isSignUp ? "Log In" : "Sign Up"}
          </Text>
        </TouchableOpacity>
      </View>

      <FFInputControl
        error={error}
        label="Email"
        placeholder="teo@gmail.com"
        setValue={setEmail}
        value={email}
      />

      <FFInputControl
        error={error}
        secureTextEntry
        label="Password"
        placeholder="******"
        setValue={setPassword}
        value={password}
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 16,
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
    marginTop: 8,
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
    marginTop: 8,
  },
  inputLabel: {
    fontSize: 14,
    color: "#333",
  },
  inputField: {
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    fontSize: 14,
    color: "#333",
    marginTop: 4,
  },
  iconButton: {
    position: "absolute",
    right: 16,
    top: 16,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 5,
    marginTop: 16,
  },
  buttonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default FFAuthForm;
