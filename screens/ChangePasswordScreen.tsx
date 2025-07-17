import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  Linking,
  TouchableOpacity,
  StyleProp,
  ViewStyle,
} from "react-native";
import FFSafeAreaView from "@/src/components/FFSafeAreaView";
import FFText from "@/src/components/FFText";
import FFButton from "@/src/components/FFButton";
import FFInputControl from "@/src/components/FFInputControl";
import Spinner from "@/src/components/FFSpinner";
import axiosInstance from "@/src/utils/axiosConfig";
import { spacing, colors } from "@/src/theme";
import { Ionicons } from "@expo/vector-icons";
import { useSelector } from "@/src/store/types";
import { RootState } from "@/src/store/store";
import FFScreenTopSection from "@/src/components/FFScreenTopSection";
import { useNavigation } from "@react-navigation/native";

type Step = "enterEmail" | "checkEmail" | "createPassword";

const Header = ({ onBack, title }: { onBack?: () => void; title: string }) => (
  <View style={styles.headerContainer}>
    {onBack && (
      <TouchableOpacity onPress={onBack} style={styles.backButton}>
        <Ionicons name="arrow-back" size={24} color={colors.text} />
      </TouchableOpacity>
    )}
    <FFText fontSize="xl" fontWeight="700" style={styles.headerTitle}>
      {title}
    </FFText>
  </View>
);

const EnterEmailStep = ({
  email,
  setEmail,
  onSend,
}: {
  email: string;
  setEmail: React.Dispatch<React.SetStateAction<string>>;
  onSend: () => void;
}) => (
  <View style={styles.stepContainer}>
    <FFText style={styles.description}>
      Enter the email associated with your account and we'll send an email with
      instructions to reset your password.
    </FFText>
    <FFInputControl
      placeholder="Enter your email"
      value={email}
      setValue={setEmail}
      keyboardType="email-address"
      autoCapitalize="none"
    />
    <FFButton onPress={onSend} style={styles.button}>
      Send Instructions
    </FFButton>
  </View>
);

const CheckEmailStep = ({
  onBack,
  onOpenEmail,
  onSkip,
}: {
  onBack: () => void;
  onOpenEmail: () => void;
  onSkip: () => void;
}) => (
  <View style={styles.stepContainer}>
    <View style={styles.iconContainer}>
      <Ionicons name="mail-outline" size={80} color={colors.primary} />
    </View>
    <FFText style={styles.description}>
      We have sent a password recovery instruction to your email.
    </FFText>
    <FFButton onPress={onOpenEmail} style={styles.button}>
      Open Email App
    </FFButton>
  </View>
);

const CreatePasswordStep = ({
  password,
  setPassword,
  confirmPassword,
  setConfirmPassword,
  onReset,
  onBack,
}: {
  password: string;
  setPassword: React.Dispatch<React.SetStateAction<string>>;
  confirmPassword: string;
  setConfirmPassword: React.Dispatch<React.SetStateAction<string>>;
  onReset: () => void;
  onBack: () => void;
}) => (
  <View style={styles.stepContainer}>
    <Header title="Create New Password" onBack={onBack} />
    <FFText style={styles.description}>
      Your new password must be different from previously used passwords.
    </FFText>
    <FFInputControl
      placeholder="Enter new password"
      secureTextEntry
      value={password}
      setValue={setPassword}
    />
    <FFInputControl
      placeholder="Confirm new password"
      secureTextEntry
      value={confirmPassword}
      setValue={setConfirmPassword}
      containerStyle={{ marginTop: spacing.md }}
    />
    <FFButton onPress={onReset} style={styles.button}>
      Reset Password
    </FFButton>
  </View>
);

const ChangePasswordScreen = () => {
  const [step, setStep] = useState<Step>("enterEmail");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const {email: emailRedux} = useSelector((state: RootState) => state.auth);

  const handleSendInstructions = async () => {
    setIsLoading(true);
    try {
      await axiosInstance.post(`/auth/request-reset-password`, { email });
      setStep("checkEmail");
    } catch (error) {
      console.log("Error sending instructions:", error);
      // You might want to show a modal or a toast here
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenEmailApp = async () => {
    const supported = await Linking.canOpenURL("mailto:");
    if (supported) {
      await Linking.openURL("mailto:");
    } else {
      console.log("No email app is available on this device.");
      // You might want to show a modal or a toast here
    }
  };

  const handleResetPassword = () => {
    if (password !== confirmPassword) {
      console.log("Passwords do not match!");
      // You might want to show a modal or a toast here
      return;
    }
    console.log("Password reset successfully!");
    // Handle password reset logic here
  };

  const handleGoBack = () => {
    if (step === "checkEmail") {
      setStep("enterEmail");
    } else if (step === "createPassword") {
      setStep("checkEmail");
    }
  };

  const renderStep = () => {
    switch (step) {
      case "enterEmail":
        return (
          <EnterEmailStep
            email={email}
            setEmail={setEmail}
            onSend={handleSendInstructions}
          />
        );
      case "checkEmail":
        return (
          <CheckEmailStep
            onBack={handleGoBack}
            onOpenEmail={handleOpenEmailApp}
            onSkip={() => setStep("createPassword")}
          />
        );
      case "createPassword":
        return (
          <CreatePasswordStep
            password={password}
            setPassword={setPassword}
            confirmPassword={confirmPassword}
            setConfirmPassword={setConfirmPassword}
            onReset={handleResetPassword}
            onBack={handleGoBack}
          />
        );
      default:
        return null;
    }
  };

  useEffect(() => {
    if (emailRedux) {
      console.log('cehck emeial redux', emailRedux)
      setEmail(emailRedux)
    }
  }, [emailRedux])
  const navigation = useNavigation()
  return (
    <FFSafeAreaView>
      <Spinner isVisible={isLoading} isOverlay />
      <FFScreenTopSection navigation={navigation} title={step === 'enterEmail' ? 'Enter Email' : step === 'checkEmail' ? 'Check Email' : 'Create Password'}/>
      <View style={styles.container}>{renderStep()}</View>
    </FFSafeAreaView>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.white,
  },
  container: {
    flex: 1,
    padding: spacing.lg,
    justifyContent: "center",
  },
  stepContainer: {
    flex: 1,
    justifyContent: "center",
    marginTop: -spacing.xl
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.lg,
    position: "relative", // For absolute positioning of back button
    justifyContent: "center",
  },
  backButton: {
    position: "absolute",
    left: 0,
    padding: spacing.sm,
  },
  headerTitle: {
    textAlign: "center",
    color: colors.text,
  },
  description: {
    marginBottom: spacing.xl,
    textAlign: "center",
    color: colors.textSecondary,
    fontSize: 16,
    lineHeight: 24,
  },
  button: {
    marginTop: spacing.lg,
  },
  iconContainer: {
    alignItems: "center",
    marginBottom: spacing.xl,
  },
});

export default ChangePasswordScreen;

