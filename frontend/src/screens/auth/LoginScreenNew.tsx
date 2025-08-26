import React, { useState, useEffect } from 'react';
import { View, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { 
  Text, 
  TextInput, 
  Button, 
  Card, 
  IconButton,
  useTheme
} from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { useAppDispatch, useAppSelector } from '@store/store';
import { loginUser, clearError, resetLoadingState } from '@store/slices/authSlice';
import Animated from 'react-native-reanimated';
import { useAnimation, useTheme as useCustomTheme, useTailwind } from '@hooks';

/**
 * Modern Login Screen with NativeWind styling and premium animations
 */
const LoginScreen: React.FC = () => {
  const theme = useTheme();
  const customTheme = useCustomTheme();
  const { tw, cn } = useTailwind();
  const navigation = useNavigation();
  const dispatch = useAppDispatch();
  const { isLoading, error } = useAppSelector(state => state.auth);
  const { fadeStyle, scaleStyle, onPressIn, onPressOut } = useAnimation();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Reset loading state when component mounts
  useEffect(() => {
    dispatch(resetLoadingState());
  }, [dispatch]);

  const handleLogin = async () => {
    if (email.trim() && password.trim()) {
      dispatch(clearError());
      dispatch(loginUser({ email, password }));
    }
  };

  const handleRegister = () => {
    navigation.navigate('Register' as never);
  };

  return (
    <KeyboardAvoidingView 
      className="flex-1 bg-slate-50 dark:bg-slate-900"
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView 
        className="flex-1 px-6 pt-16" 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 32 }}
      >
        {/* Animated Header */}
        <Animated.View style={fadeStyle} className="items-center mb-12">
          {/* App Logo/Icon */}
          <View className="w-20 h-20 bg-gradient-to-br from-primary-600 to-primary-800 rounded-3xl items-center justify-center mb-6 shadow-colored">
            <IconButton 
              icon="car" 
              size={32} 
              iconColor="white" 
            />
          </View>
          
          <Text className="text-3xl font-bold text-slate-800 dark:text-white mb-2">
            Welcome Back
          </Text>
          <Text className="text-base text-slate-600 dark:text-slate-300 text-center leading-relaxed">
            Sign in to your PHV Budget Tracker account{'\n'}
            and take control of your finances
          </Text>
        </Animated.View>

        {/* Login Form */}
        <Animated.View style={[scaleStyle]} className="mb-8">
          <Card 
            className="p-6 bg-white dark:bg-slate-800 rounded-2xl shadow-soft"
            style={{ backgroundColor: theme.colors.surface }}
          >
            {/* Email Input */}
            <View className="mb-4">
              <Text className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Email Address
              </Text>
              <TextInput
                value={email}
                onChangeText={setEmail}
                mode="outlined"
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                placeholder="your@email.com"
                className="bg-slate-50 dark:bg-slate-700"
                outlineStyle={{
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: customTheme.tw.primary,
                }}
                left={<TextInput.Icon icon="email-outline" />}
              />
            </View>

            {/* Password Input */}
            <View className="mb-6">
              <Text className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Password
              </Text>
              <TextInput
                value={password}
                onChangeText={setPassword}
                mode="outlined"
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                placeholder="Enter your password"
                className="bg-slate-50 dark:bg-slate-700"
                outlineStyle={{
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: customTheme.tw.primary,
                }}
                left={<TextInput.Icon icon="lock-outline" />}
                right={
                  <TextInput.Icon 
                    icon={showPassword ? "eye-off" : "eye"}
                    onPress={() => setShowPassword(!showPassword)}
                  />
                }
              />
            </View>

            {/* Error Message */}
            {error && (
              <Animated.View style={fadeStyle} className="mb-4">
                <View className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-3">
                  <Text className="text-red-600 dark:text-red-400 text-sm font-medium text-center">
                    {error}
                  </Text>
                </View>
              </Animated.View>
            )}

            {/* Login Button */}
            <Animated.View style={scaleStyle}>
              <Button
                mode="contained"
                onPress={handleLogin}
                loading={isLoading}
                disabled={!email.trim() || !password.trim() || isLoading}
                onPressIn={onPressIn}
                onPressOut={onPressOut}
                className="py-2 rounded-xl"
                buttonColor={customTheme.tw.primary}
                style={{
                  borderRadius: 12,
                  ...customTheme.shadows.medium,
                }}
              >
                <Text className="text-base font-semibold text-white">
                  {isLoading ? 'Signing In...' : 'Sign In'}
                </Text>
              </Button>
            </Animated.View>

            {/* Forgot Password Link */}
            <View className="mt-4 items-center">
              <Button
                mode="text"
                onPress={() => {}}
                className="rounded-lg"
                textColor={customTheme.tw.accent}
              >
                <Text className="text-sm font-medium">
                  Forgot your password?
                </Text>
              </Button>
            </View>
          </Card>
        </Animated.View>

        {/* Divider */}
        <View className="flex-row items-center mb-8">
          <View className="flex-1 h-px bg-slate-200 dark:bg-slate-600" />
          <Text className="mx-4 text-sm text-slate-500 dark:text-slate-400 font-medium">
            New to PHV Budget Tracker?
          </Text>
          <View className="flex-1 h-px bg-slate-200 dark:bg-slate-600" />
        </View>

        {/* Register Section */}
        <Animated.View style={fadeStyle} className="items-center">
          <Card 
            className="p-6 bg-white dark:bg-slate-800 rounded-2xl shadow-soft w-full"
            style={{ backgroundColor: theme.colors.surface }}
          >
            <View className="items-center">
              <Text className="text-base text-slate-600 dark:text-slate-300 mb-4 text-center">
                Join thousands of PHV drivers managing their finances smarter
              </Text>
              
              <Button
                mode="outlined"
                onPress={handleRegister}
                className="py-2 rounded-xl border-2"
                buttonColor="transparent"
                textColor={customTheme.tw.primary}
                style={{
                  borderRadius: 12,
                  borderColor: customTheme.tw.primary,
                  borderWidth: 2,
                }}
              >
                <Text className="text-base font-semibold">
                  Create Free Account
                </Text>
              </Button>
            </View>
          </Card>
        </Animated.View>

        {/* Demo Hint */}
        <View className="mt-8 items-center">
          <Card className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
            <Text className="text-sm text-blue-700 dark:text-blue-300 text-center font-medium">
              💡 Try demo account
            </Text>
            <Text className="text-xs text-blue-600 dark:text-blue-400 text-center mt-1">
              demo@phvbudget.com / password123
            </Text>
          </Card>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default LoginScreen;