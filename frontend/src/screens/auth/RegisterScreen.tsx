import React, { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { 
  Text, 
  TextInput, 
  Button, 
  Card, 
  useTheme,
  IconButton,
  Divider
} from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { useAppDispatch, useAppSelector } from '@store/store';
import { setUser, setToken } from '@store/slices/authSlice';

const RegisterScreen: React.FC = () => {
  const theme = useTheme();
  const navigation = useNavigation();
  const dispatch = useAppDispatch();
  const { isLoading, error } = useAppSelector(state => state.auth);
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    licenseNumber: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleRegister = async () => {
    if (!isFormValid()) return;
    
    // For demo purposes, create user directly
    const newUser = {
      id: 'demo-user-' + Date.now(),
      email: formData.email,
      firstName: formData.firstName,
      lastName: formData.lastName,
      name: `${formData.firstName} ${formData.lastName}`,
      phoneNumber: formData.phoneNumber,
      licenseNumber: formData.licenseNumber,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    dispatch(setUser(newUser));
    dispatch(setToken('demo-token'));
  };

  const handleBackToLogin = () => {
    navigation.goBack();
  };

  const isFormValid = () => {
    return (
      formData.firstName.trim() &&
      formData.lastName.trim() &&
      formData.email.trim() &&
      formData.phoneNumber.trim() &&
      formData.licenseNumber.trim() &&
      formData.password.trim() &&
      formData.password === formData.confirmPassword
    );
  };

  const updateFormData = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    scrollView: {
      flex: 1,
      paddingHorizontal: 24,
      paddingTop: 60,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 32,
    },
    backButton: {
      marginLeft: -8,
      marginRight: 8,
    },
    headerText: {
      flex: 1,
    },
    title: {
      fontSize: 28,
      fontWeight: 'bold',
      color: theme.colors.onBackground,
      marginBottom: 8,
    },
    subtitle: {
      fontSize: 16,
      color: theme.colors.onBackground,
      opacity: 0.7,
    },
    card: {
      padding: 24,
      marginBottom: 24,
    },
    inputRow: {
      flexDirection: 'row',
      gap: 12,
      marginBottom: 16,
    },
    inputHalf: {
      flex: 1,
      backgroundColor: theme.colors.surface,
    },
    input: {
      marginBottom: 16,
      backgroundColor: theme.colors.surface,
    },
    registerButton: {
      marginTop: 8,
      paddingVertical: 4,
    },
    divider: {
      marginVertical: 24,
    },
    loginContainer: {
      alignItems: 'center',
    },
    loginText: {
      fontSize: 14,
      color: theme.colors.onBackground,
      opacity: 0.7,
      marginBottom: 8,
    },
    loginButton: {
      marginTop: 4,
    },
    errorText: {
      color: theme.colors.error,
      fontSize: 12,
      marginTop: 4,
      textAlign: 'center',
    },
    demoNote: {
      backgroundColor: theme.colors.primaryContainer,
      padding: 16,
      borderRadius: 8,
      marginBottom: 16,
    },
    demoText: {
      fontSize: 12,
      color: theme.colors.onPrimaryContainer,
      textAlign: 'center',
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.onSurface,
      marginBottom: 12,
      marginTop: 8,
    },
  });

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <IconButton 
            icon="arrow-left" 
            onPress={handleBackToLogin}
            style={styles.backButton}
          />
          <View style={styles.headerText}>
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>
              Join PHV Budget Tracker today
            </Text>
          </View>
        </View>

        {/* Demo Notice */}
        <View style={styles.demoNote}>
          <Text style={styles.demoText}>
            Demo Mode: Fill in any details to create an account
          </Text>
        </View>

        {/* Registration Form */}
        <Card style={styles.card}>
          <Text style={styles.sectionTitle}>Personal Information</Text>
          
          <View style={styles.inputRow}>
            <TextInput
              label="First Name"
              value={formData.firstName}
              onChangeText={(value) => updateFormData('firstName', value)}
              mode="outlined"
              autoCapitalize="words"
              style={styles.inputHalf}
              left={<TextInput.Icon icon="account" />}
            />
            <TextInput
              label="Last Name"
              value={formData.lastName}
              onChangeText={(value) => updateFormData('lastName', value)}
              mode="outlined"
              autoCapitalize="words"
              style={styles.inputHalf}
            />
          </View>

          <TextInput
            label="Email"
            value={formData.email}
            onChangeText={(value) => updateFormData('email', value)}
            mode="outlined"
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            style={styles.input}
            left={<TextInput.Icon icon="email" />}
          />

          <TextInput
            label="Phone Number"
            value={formData.phoneNumber}
            onChangeText={(value) => updateFormData('phoneNumber', value)}
            mode="outlined"
            keyboardType="phone-pad"
            placeholder="+65 9123 4567"
            style={styles.input}
            left={<TextInput.Icon icon="phone" />}
          />

          <Text style={styles.sectionTitle}>Driver Information</Text>
          
          <TextInput
            label="License Number"
            value={formData.licenseNumber}
            onChangeText={(value) => updateFormData('licenseNumber', value)}
            mode="outlined"
            autoCapitalize="characters"
            placeholder="SH1234567A"
            style={styles.input}
            left={<TextInput.Icon icon="card-account-details" />}
          />

          <Text style={styles.sectionTitle}>Security</Text>
          
          <TextInput
            label="Password"
            value={formData.password}
            onChangeText={(value) => updateFormData('password', value)}
            mode="outlined"
            secureTextEntry={!showPassword}
            autoCapitalize="none"
            style={styles.input}
            left={<TextInput.Icon icon="lock" />}
            right={
              <TextInput.Icon 
                icon={showPassword ? "eye-off" : "eye"}
                onPress={() => setShowPassword(!showPassword)}
              />
            }
          />

          <TextInput
            label="Confirm Password"
            value={formData.confirmPassword}
            onChangeText={(value) => updateFormData('confirmPassword', value)}
            mode="outlined"
            secureTextEntry={!showConfirmPassword}
            autoCapitalize="none"
            style={styles.input}
            left={<TextInput.Icon icon="lock-check" />}
            right={
              <TextInput.Icon 
                icon={showConfirmPassword ? "eye-off" : "eye"}
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              />
            }
          />

          {error && <Text style={styles.errorText}>{error}</Text>}
          
          {formData.password !== formData.confirmPassword && formData.confirmPassword && (
            <Text style={styles.errorText}>Passwords do not match</Text>
          )}

          <Button
            mode="contained"
            onPress={handleRegister}
            loading={isLoading}
            disabled={!isFormValid() || isLoading}
            style={styles.registerButton}
          >
            Create Account
          </Button>
        </Card>

        {/* Divider */}
        <Divider style={styles.divider} />

        {/* Back to Login */}
        <View style={styles.loginContainer}>
          <Text style={styles.loginText}>
            Already have an account?
          </Text>
          <Button
            mode="outlined"
            onPress={handleBackToLogin}
            style={styles.loginButton}
          >
            Sign In
          </Button>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default RegisterScreen;