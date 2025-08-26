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
  const { fadeInUp, scaleIn } = useAnimation();
  
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
    <View className="flex-1">
      <LinearGradient
        colors={['#1a365d', '#0369a1', '#0ea5e9']}
        className="flex-1"
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <KeyboardAvoidingView 
          className="flex-1"
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <ScrollView 
            className="flex-1 px-6 pt-16" 
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 40 }}
          >
            {/* Premium Header */}
            <View className="items-center mb-12" style={fadeInUp}>
              <View className="mb-6">
                <View className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-md items-center justify-center mb-4">
                  <Text className="text-3xl">💰</Text>
                </View>
              </View>
              <Text className="text-3xl font-bold text-white mb-2 text-center">
                Welcome Back
              </Text>
              <Text className="text-lg text-white/80 text-center max-w-sm">
                Sign in to your PHV Budget Tracker account
              </Text>
            </View>

            {/* Premium Glass Card */}
            <View 
              className="bg-white/10 backdrop-blur-md rounded-3xl p-6 mb-8 border border-white/20"
              style={scaleIn}
            >
              <View className="mb-4">
                <Text className="text-white/70 text-sm mb-2 ml-1">Email</Text>
                <TextInput
                  value={email}
                  onChangeText={setEmail}
                  mode="outlined"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                  className="mb-4 bg-white/90"
                  outlineColor="transparent"
                  activeOutlineColor="#f97316"
                  textColor="#1a365d"
                  left={<TextInput.Icon icon="email" iconColor="#0ea5e9" />}
                />
              </View>
              
              <View className="mb-6">
                <Text className="text-white/70 text-sm mb-2 ml-1">Password</Text>
                <TextInput
                  value={password}
                  onChangeText={setPassword}
                  mode="outlined"
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  className="bg-white/90"
                  outlineColor="transparent"
                  activeOutlineColor="#f97316"
                  textColor="#1a365d"
                  left={<TextInput.Icon icon="lock" iconColor="#0ea5e9" />}
                  right={
                    <TextInput.Icon 
                      icon={showPassword ? "eye-off" : "eye"}
                      iconColor="#0ea5e9"
                      onPress={() => setShowPassword(!showPassword)}
                    />
                  }
                />
              </View>

              {error && (
                <Text className="text-red-300 text-sm text-center mb-4 bg-red-500/20 py-2 px-3 rounded-lg">
                  {error}
                </Text>
              )}

              <Button
                mode="contained"
                onPress={handleLogin}
                loading={isLoading}
                disabled={!email.trim() || !password.trim() || isLoading}
                className="py-2 mb-2"
                buttonColor="#f97316"
                textColor="#ffffff"
                style={{
                  borderRadius: 16,
                  elevation: 8,
                  shadowColor: '#f97316',
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.3,
                  shadowRadius: 12,
                }}
              >
                <Text className="text-lg font-semibold">Sign In</Text>
              </Button>
            </View>

            {/* Premium Divider */}
            <View className="flex-row items-center my-8">
              <View className="flex-1 h-px bg-white/20" />
              <Text className="mx-4 text-white/60 text-sm">or</Text>
              <View className="flex-1 h-px bg-white/20" />
            </View>

            {/* Register Section */}
            <View className="items-center" style={fadeInUp}>
              <Text className="text-white/70 text-base mb-4 text-center">
                New to PHV Budget Tracker?
              </Text>
              <Button
                mode="outlined"
                onPress={handleRegister}
                textColor="#ffffff"
                className="border-2 border-white/30"
                style={{
                  borderRadius: 16,
                  borderColor: 'rgba(255,255,255,0.3)',
                }}
              >
                <Text className="text-base font-medium">Create Account</Text>
              </Button>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </LinearGradient>
    </View>
  );
};

export default LoginScreen;