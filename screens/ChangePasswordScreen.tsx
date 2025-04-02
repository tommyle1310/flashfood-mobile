import React, { useState } from "react";
import { View, StyleSheet, Image } from "react-native";
import FFSafeAreaView from "@/src/components/FFSafeAreaView";
import FFText from "@/src/components/FFText";
import FFButton from "@/src/components/FFButton";
import FFInputControl from "@/src/components/FFInputControl";

const ChangePasswordScreen = () => {
  const [step, setStep] = useState<
    "enterEmail" | "checkEmail" | "createPassword"
  >("enterEmail");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSendInstructions = () => {
    // Simulate sending instructions
    setStep("checkEmail");
  };

  const handleOpenEmailApp = () => {
    // Simulate opening email app
    console.log("Opening email app...");
  };

  const handleResetPassword = () => {
    if (password === confirmPassword) {
      console.log("Password reset successfully!");
      // Handle password reset logic
    } else {
      console.log("Passwords do not match!");
    }
  };

  return (
    <FFSafeAreaView>
      {step === "enterEmail" && (
        <View style={styles.container}>
          <FFText fontSize="xl" fontWeight="700" style={styles.title}>
            Reset password
          </FFText>
          <FFText fontSize="sm" style={styles.description}>
            Enter the email associated with your account and we'll send an email
            with instructions to reset your password.
          </FFText>
          <View style={{ width: "100%", marginBottom: 20 }}>
            <FFInputControl
              placeholder="Email address"
              value={email}
              setValue={setEmail}
              label=""
              style={styles.input}
            />
          </View>
          <FFButton onPress={handleSendInstructions} style={styles.button}>
            Send Instructions
          </FFButton>
        </View>
      )}

      {step === "checkEmail" && (
        <View style={styles.container}>
          <Image
            source={{ uri: "https://via.placeholder.com/150" }} // Replace with your email icon
            style={styles.icon}
          />
          <FFText fontSize="xl" fontWeight="700" style={styles.title}>
            Check your mail
          </FFText>
          <FFText fontSize="md" style={styles.description}>
            We have sent a password recovery instruction to your email.
          </FFText>
          <FFButton onPress={handleOpenEmailApp} style={styles.button}>
            Open email app
          </FFButton>
          <FFButton onPress={() => setStep("createPassword")} variant="outline">
            Skip, I'll confirm later
          </FFButton>
        </View>
      )}

      {step === "createPassword" && (
        <View style={styles.container}>
          <FFText fontSize="xl" fontWeight="700" style={styles.title}>
            Create new password
          </FFText>
          <FFText fontSize="md" style={styles.description}>
            Your new password must be different from previously used passwords.
          </FFText>
          <View style={{ width: "100%", marginBottom: 20 }}>
            <FFInputControl
              placeholder="Password"
              secureTextEntry
              value={password}
              setValue={setPassword}
              style={styles.input}
            />
            <FFInputControl
              placeholder="Confirm Password"
              secureTextEntry
              value={confirmPassword}
              setValue={setConfirmPassword}
              style={styles.input}
            />
          </View>
          <FFButton onPress={handleResetPassword} style={styles.button}>
            Reset Password
          </FFButton>
        </View>
      )}
    </FFSafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    marginTop: -40,
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    marginBottom: 16,
    textAlign: "center",
  },
  description: {
    marginBottom: 24,
    textAlign: "center",
    color: "#888",
  },
  input: {
    width: 300,
    backgroundColor: "red",
    marginBottom: 16,
  },
  button: {
    width: "100%",
    marginBottom: 16,
  },
  skipButton: {
    backgroundColor: "transparent",
  },
  icon: {
    width: 100,
    height: 100,
    marginBottom: 24,
  },
});

export default ChangePasswordScreen;
