import React, { useState, useEffect } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, ImageBackground } from 'react-native';
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
import { LinearGradient } from 'expo-linear-gradient';
import { useAnimation } from '@hooks/useAnimation';
import { useTailwind } from '@hooks/useTailwind';

const LoginScreen: React.FC = () => {
  const theme = useTheme();
  const navigation = useNavigation();
  const dispatch = useAppDispatch();
  const { isLoading, error } = useAppSelector(state => state.auth);
  const tw = useTailwind();
  const { fadeInUp, scaleStyle } = useAnimation();
  
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

  return (
    <View className="flex-1 bg-slate-50">
      {/* Clean Background with Subtle Pattern */}
      <LinearGradient
        colors={['#f8fafc', '#f1f5f9', '#e2e8f0']}
        className="flex-1"
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <KeyboardAvoidingView 
          className="flex-1"
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <ScrollView 
            className="flex-1 px-8" 
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ 
              paddingTop: 80, 
              paddingBottom: 60,
              justifyContent: 'center',
              minHeight: '100%'
            }}
          >
            {/* Clean Modern Header */}
            <View className="items-center mb-12" style={fadeInUp}>
              {/* App Icon */}
              <View className="w-24 h-24 bg-primary-900 rounded-3xl items-center justify-center mb-8 shadow-xl">
                <Text className="text-4xl">💰</Text>
              </View>
              
              <Text className="text-3xl font-bold text-slate-800 mb-3 text-center">
                Welcome Back
              </Text>
              <Text className="text-lg text-slate-600 text-center max-w-sm leading-relaxed">
                Sign in to your PHV Budget Tracker account
              </Text>
            </View>

            {/* Clean White Card */}
            <View 
              className="bg-white rounded-3xl p-8 mb-8 shadow-2xl border border-slate-200/50"
              style={{
                ...scaleStyle,
                shadowColor: '#1e293b',
                shadowOffset: { width: 0, height: 20 },
                shadowOpacity: 0.1,
                shadowRadius: 25,
                elevation: 15,
              }}
            >
              {/* Email Field */}
              <View className="mb-6">
                <Text className="text-slate-700 text-base font-medium mb-3 ml-1">
                  Email Address
                </Text>
                <TextInput
                  value={email}
                  onChangeText={setEmail}
                  mode="outlined"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                  className="bg-slate-50"
                  outlineColor="#e2e8f0"
                  activeOutlineColor="#1a365d"
                  textColor="#1e293b"
                  style={{ 
                    fontSize: 16,
                    height: 56,
                    borderRadius: 16,
                  }}
                  contentStyle={{ paddingLeft: 16 }}
                  left={<TextInput.Icon icon="email" iconColor="#64748b" />}
                />
              </View>
              
              {/* Password Field */}
              <View className="mb-8">
                <Text className="text-slate-700 text-base font-medium mb-3 ml-1">
                  Password
                </Text>
                <TextInput
                  value={password}
                  onChangeText={setPassword}
                  mode="outlined"
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  className="bg-slate-50"
                  outlineColor="#e2e8f0"
                  activeOutlineColor="#1a365d"
                  textColor="#1e293b"
                  style={{ 
                    fontSize: 16,
                    height: 56,
                    borderRadius: 16,
                  }}
                  contentStyle={{ paddingLeft: 16 }}
                  left={<TextInput.Icon icon="lock" iconColor="#64748b" />}
                  right={
                    <TextInput.Icon 
                      icon={showPassword ? "eye-off" : "eye"}
                      iconColor="#64748b"
                      onPress={() => setShowPassword(!showPassword)}
                    />
                  }
                />
              </View>

              {/* Error Message */}
              {error && (
                <View className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-6">
                  <Text className="text-red-700 text-sm text-center font-medium">
                    {error}
                  </Text>
                </View>
              )}

              {/* Sign In Button */}
              <Button
                mode="contained"
                onPress={handleLogin}
                loading={isLoading}
                disabled={!email.trim() || !password.trim() || isLoading}
                buttonColor="#1a365d"
                textColor="#ffffff"
                className="h-14 justify-center mb-4"
                style={{
                  borderRadius: 16,
                  elevation: 8,
                  shadowColor: '#1a365d',
                  shadowOffset: { width: 0, height: 8 },
                  shadowOpacity: 0.2,
                  shadowRadius: 20,
                }}
                contentStyle={{ height: 56 }}
              >
                <Text className="text-base font-semibold">
                  {isLoading ? 'Signing In...' : 'Sign In'}
                </Text>
              </Button>
            </View>

            {/* Clean Divider */}
            <View className="flex-row items-center my-8">
              <View className="flex-1 h-px bg-slate-300" />
              <Text className="mx-6 text-slate-500 text-sm font-medium">or</Text>
              <View className="flex-1 h-px bg-slate-300" />
            </View>

            {/* Register Section */}
            <View className="items-center" style={fadeInUp}>
              <Text className="text-slate-600 text-base mb-6 text-center">
                New to PHV Budget Tracker?
              </Text>
              <Button
                mode="outlined"
                onPress={handleRegister}
                textColor="#1a365d"
                className="h-14 w-full justify-center border-2"
                style={{
                  borderRadius: 16,
                  borderColor: '#1a365d',
                }}
                contentStyle={{ height: 56 }}
              >
                <Text className="text-base font-semibold">Create Account</Text>
              </Button>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </LinearGradient>
    </View>
  );
};

export default LoginScreen;