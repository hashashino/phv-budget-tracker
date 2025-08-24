import React, { useState, useEffect } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { 
  Text, 
  TextInput, 
  Button, 
  Card, 
  useTheme, 
  Divider,
  IconButton 
} from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { useAppDispatch, useAppSelector } from '@store/store';
import { loginUser, clearError, resetLoadingState } from '@store/slices/authSlice';

const LoginScreen: React.FC = () => {
  const theme = useTheme();
  const navigation = useNavigation();
  const dispatch = useAppDispatch();
  const { isLoading, error } = useAppSelector(state => state.auth);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Reset loading state when component mounts
  useEffect(() => {
    dispatch(resetLoadingState());
  }, [dispatch]);

  const handleLogin = async () => {
    if (email.trim() && password.trim()) {
      dispatch(clearError()); // Clear any previous errors
      dispatch(loginUser({ email, password }));
    }
  };

  const handleRegister = () => {
    navigation.navigate('Register' as never);
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
      alignItems: 'center',
      marginBottom: 40,
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
      textAlign: 'center',
    },
    card: {
      padding: 24,
      marginBottom: 24,
    },
    input: {
      marginBottom: 16,
      backgroundColor: theme.colors.surface,
    },
    loginButton: {
      marginTop: 8,
      paddingVertical: 4,
    },
    divider: {
      marginVertical: 24,
    },
    registerContainer: {
      alignItems: 'center',
    },
    registerText: {
      fontSize: 14,
      color: theme.colors.onBackground,
      opacity: 0.7,
      marginBottom: 8,
    },
    registerButton: {
      marginTop: 4,
    },
    errorText: {
      color: theme.colors.error,
      fontSize: 12,
      marginTop: 4,
      textAlign: 'center',
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
          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>
            Sign in to your PHV Budget Tracker account
          </Text>
        </View>

        {/* Login Form */}
        <Card style={styles.card}>
          <TextInput
            label="Email"
            value={email}
            onChangeText={setEmail}
            mode="outlined"
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            style={styles.input}
            left={<TextInput.Icon icon="email" />}
          />
          
          <TextInput
            label="Password"
            value={password}
            onChangeText={setPassword}
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

          {error && <Text style={styles.errorText}>{error}</Text>}

          <Button
            mode="contained"
            onPress={handleLogin}
            loading={isLoading}
            disabled={!email.trim() || !password.trim() || isLoading}
            style={styles.loginButton}
          >
            Sign In
          </Button>
        </Card>

        {/* Divider */}
        <Divider style={styles.divider} />

        {/* Register Section */}
        <View style={styles.registerContainer}>
          <Text style={styles.registerText}>
            New to PHV Budget Tracker?
          </Text>
          <Button
            mode="outlined"
            onPress={handleRegister}
            style={styles.registerButton}
          >
            Create Account
          </Button>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default LoginScreen;