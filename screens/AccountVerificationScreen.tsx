import React from 'react';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { View, StyleSheet } from 'react-native';
import { MainStackParamList } from '@/src/navigation/AppNavigator';
import { useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';

import FFSafeAreaView from '@/src/components/FFSafeAreaView';
import FFText from '@/src/components/FFText';
import FFButton from '@/src/components/FFButton';
import { RootState } from "@/src/store/store";
import { colors, spacing } from '@/src/theme';

type AccountVerificationScreenNavigationProp = StackNavigationProp<
  MainStackParamList,
  'AccountVerification'
>;

const AccountVerificationScreen = () => {
  const isVerified = useSelector((state: RootState) => state.auth.is_verified);
  const navigation = useNavigation<AccountVerificationScreenNavigationProp>();

  const handleVerifyAccount = () => {
    // For now, navigate to the Profile screen.
    // Later, this will trigger the verification flow.
    navigation.navigate('Profile');
  };

  return (
    <FFSafeAreaView>
      <View style={styles.container}>
        <Ionicons
          name={isVerified ? 'checkmark-circle-outline' : 'alert-circle-outline'}
          size={100}
          color={isVerified ? colors.success : colors.warning}
          style={styles.icon}
        />
        <FFText fontSize="xl" fontWeight="700" style={styles.title}>
          Account Verification
        </FFText>
        <FFText style={styles.statusText}>
          {isVerified
            ? 'Your account has been successfully verified.'
            : 'Your account is not verified. Please verify your account to access all features.'}
        </FFText>
        <FFButton
        // variant='disabled'
          onPress={handleVerifyAccount}
          disabled={isVerified}
          style={{ width: "100%" }}
        >
          {isVerified ? 'Account Verified' : 'Verify Account'}
        </FFButton>
      </View>
    </FFSafeAreaView>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  icon: {
    marginBottom: spacing.xl,
  },
  title: {
    marginBottom: spacing.md,
    color: colors.text,
  },
  statusText: {
    textAlign: 'center',
    marginBottom: spacing.xl,
    color: colors.textSecondary,
    lineHeight: 24,
  },
  button: {
    width: '100%',
  },
});

export default AccountVerificationScreen;
