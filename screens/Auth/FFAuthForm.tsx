// components/FFAuthForm.tsx
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Pressable,
  StyleSheet,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import FFButton from "@/components/FFButton"; // If you use a custom button component

type FFAuthFormProps = {
  isSignUp: boolean;
  onSubmit: (email: string, password: string) => void;
  navigation?: any; // Optional navigation prop, used only in SignUp for navigation
};

const FFAuthForm = ({ isSignUp, onSubmit, navigation }: FFAuthFormProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = () => {
    onSubmit(email, password);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.headerText}>
        {isSignUp ? "Sign Up" : "Login"}
      </Text>

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

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Email</Text>
        <TextInput
          placeholder="teole1310@gmail.com"
          value={email}
          onChangeText={setEmail}
          style={styles.inputField}
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Password</Text>
        <TextInput
          placeholder="*******"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          style={styles.inputField}
        />
      </View>

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
    backgroundColor: "white",
    padding: 16,
    borderRadius: 8,
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
    borderColor: "#d1d1d1",
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    fontSize: 14,
    color: "#333",
    marginTop: 4,
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
