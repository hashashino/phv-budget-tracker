import React, { useEffect, useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import {
  Card,
  Title,
  Paragraph,
  useTheme,
  FAB,
  Chip,
  Portal,
  Modal,
  List,
  Text,
  Button,
} from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { MainTabParamList } from '@types/index';
import { LinearGradient } from 'expo-linear-gradient';

import { useAppSelector } from '@store/store';
import { APP_CONFIG } from '@constants/index';
import { useAnimation } from '@hooks/useAnimation';
import { useTailwind } from '@hooks/useTailwind';
import { useCurrency } from '@hooks/useCurrency';

type DashboardScreenNavigationProp = BottomTabNavigationProp<MainTabParamList, 'Dashboard'>;

const DashboardScreen: React.FC = () => {
  const theme = useTheme();
  const navigation = useNavigation<DashboardScreenNavigationProp>();
  const { user } = useAppSelector(state => state.auth);
  const tw = useTailwind();
  const { formatCurrency, formatEarnings, formatExpenses } = useCurrency();
  const { fadeInUp, scaleIn, slideInRight } = useAnimation();
  
  const [refreshing, setRefreshing] = React.useState(false);
  const [showQuickActions, setShowQuickActions] = useState(false);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    // TODO: Fetch latest data
    setTimeout(() => setRefreshing(false), 2000);
  }, []);

  // Mock data - replace with actual data from store
  const dashboardData = {
    todayEarnings: 180.50,
    todayExpenses: 45.30,
    weeklyEarnings: 1250.00,
    weeklyExpenses: 320.75,
    monthlyEarnings: 5200.00,
    monthlyExpenses: 1450.25,
    netIncome: 3749.75,
    totalTrips: 156,
    avgTripEarning: 33.33,
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <View className="flex-1">
      <LinearGradient
        colors={['#f0f9ff', '#e0f2fe', '#bae6fd']}
        className="flex-1"
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
      >
        <ScrollView
          className="flex-1 px-4 pt-12"
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 100 }}
        >
          {/* Premium Greeting Header */}
          <View className="mb-8" style={fadeInUp}>
            <Text className="text-2xl font-bold text-primary-900 mb-1">
              {getGreeting()}, {user?.name?.split(' ')[0] || 'Driver'}!
            </Text>
            <Text className="text-base text-primary-600">
              {new Date().toLocaleDateString('en-SG', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </Text>
          </View>

          {/* Today's Summary Cards */}
          <View className="flex-row gap-3 mb-6">
            <View 
              className="flex-1 bg-white/70 backdrop-blur-md rounded-2xl p-5 border border-white/50"
              style={scaleIn}
            >
              <View className="items-center">
                <View className="w-12 h-12 bg-success-500/20 rounded-full items-center justify-center mb-3">
                  <MaterialCommunityIcons
                    name="trending-up"
                    size={24}
                    color="#10b981"
                  />
                </View>
                <Text className="text-xs text-gray-600 mb-1 text-center">Today's Earnings</Text>
                <Text className="text-xl font-bold text-success-600 text-center">
                  {formatEarnings(dashboardData.todayEarnings)}
                </Text>
              </View>
            </View>
            
            <View 
              className="flex-1 bg-white/70 backdrop-blur-md rounded-2xl p-5 border border-white/50"
              style={scaleIn}
            >
              <View className="items-center">
                <View className="w-12 h-12 bg-danger-500/20 rounded-full items-center justify-center mb-3">
                  <MaterialCommunityIcons
                    name="trending-down"
                    size={24}
                    color="#ef4444"
                  />
                </View>
                <Text className="text-xs text-gray-600 mb-1 text-center">Today's Expenses</Text>
                <Text className="text-xl font-bold text-danger-600 text-center">
                  {formatExpenses(dashboardData.todayExpenses)}
                </Text>
              </View>
            </View>
          </View>

          {/* Premium Net Income Card */}
          <LinearGradient
            colors={['#1a365d', '#0369a1']}
            className="rounded-3xl p-6 mb-6"
            style={slideInRight}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-white/80 text-base">This Month's Net Income</Text>
              <View className="w-10 h-10 bg-white/20 rounded-full items-center justify-center">
                <MaterialCommunityIcons name="wallet" size={20} color="white" />
              </View>
            </View>
            <Text className="text-3xl font-bold text-white mb-2">
              {formatCurrency(dashboardData.netIncome)}
            </Text>
            <Text className="text-white/70 text-sm">
              {formatCurrency(dashboardData.monthlyEarnings)} earned • {formatCurrency(dashboardData.monthlyExpenses)} spent
            </Text>
            <View className="absolute -right-4 -top-4 w-20 h-20 bg-secondary-500/20 rounded-full" />
            <View className="absolute -left-2 -bottom-2 w-16 h-16 bg-accent-500/20 rounded-full" />
          </LinearGradient>

          {/* Weekly Statistics Glass Card */}
          <View 
            className="bg-white/80 backdrop-blur-md rounded-3xl p-6 border border-white/60"
            style={fadeInUp}
          >
            <View className="flex-row items-center justify-between mb-5">
              <Text className="text-xl font-bold text-primary-900">This Week</Text>
              <View className="flex-row gap-2">
                <View className="bg-success-500/20 px-3 py-1 rounded-full">
                  <Text className="text-xs font-medium text-success-700">+12%</Text>
                </View>
                <View className="bg-primary-500/20 px-3 py-1 rounded-full">
                  <Text className="text-xs font-medium text-primary-700">{dashboardData.totalTrips} trips</Text>
                </View>
              </View>
            </View>
            
            <View className="space-y-4">
              <View className="flex-row justify-between items-center">
                <View className="flex-row items-center">
                  <View className="w-2 h-2 bg-success-500 rounded-full mr-3" />
                  <Text className="text-gray-700 font-medium">Total Earnings</Text>
                </View>
                <Text className="text-lg font-bold text-success-600">
                  {formatEarnings(dashboardData.weeklyEarnings)}
                </Text>
              </View>
              
              <View className="flex-row justify-between items-center">
                <View className="flex-row items-center">
                  <View className="w-2 h-2 bg-danger-500 rounded-full mr-3" />
                  <Text className="text-gray-700 font-medium">Total Expenses</Text>
                </View>
                <Text className="text-lg font-bold text-danger-600">
                  {formatExpenses(dashboardData.weeklyExpenses)}
                </Text>
              </View>
              
              <View className="h-px bg-gray-200 my-2" />
              
              <View className="flex-row justify-between items-center">
                <Text className="text-gray-600">Average per Trip</Text>
                <Text className="text-base font-semibold text-primary-700">
                  {formatCurrency(dashboardData.avgTripEarning)}
                </Text>
              </View>
            </View>
          </View>
        </ScrollView>

        {/* Premium Floating Action Button */}
        <View className="absolute bottom-6 right-6">
          <LinearGradient
            colors={['#f97316', '#ea580c']}
            className="rounded-2xl"
            style={{
              shadowColor: '#f97316',
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.3,
              shadowRadius: 16,
              elevation: 12,
            }}
          >
            <Button
              mode="contained"
              icon="plus"
              onPress={() => setShowQuickActions(true)}
              className="px-6 py-2"
              buttonColor="transparent"
              textColor="#ffffff"
            >
              Add Entry
            </Button>
          </LinearGradient>
        </View>

        {/* Premium Quick Actions Modal */}
        <Portal>
          <Modal
            visible={showQuickActions}
            onDismiss={() => setShowQuickActions(false)}
            contentContainerStyle={{
              backgroundColor: 'rgba(255,255,255,0.95)',
              backdropFilter: 'blur(20px)',
              margin: 20,
              borderRadius: 24,
              borderWidth: 1,
              borderColor: 'rgba(255,255,255,0.2)',
            }}
          >
            <View className="p-6">
              <Text className="text-xl font-bold text-center mb-6 text-primary-900">
                Add New Entry
              </Text>
              
              <View className="space-y-4">
                <Button
                  mode="outlined"
                  icon="minus-circle"
                  onPress={() => {
                    setShowQuickActions(false);
                    navigation.navigate('ExpensesStack', {
                      screen: 'ExpenseEntry',
                      params: {},
                    } as never);
                  }}
                  className="py-2 border-2 border-danger-200"
                  textColor="#ef4444"
                  style={{ borderRadius: 16 }}
                >
                  <Text className="text-base font-medium">Add Expense</Text>
                </Button>
                
                <Button
                  mode="outlined"
                  icon="plus-circle"
                  onPress={() => {
                    setShowQuickActions(false);
                    navigation.navigate('EarningsStack', {
                      screen: 'EarningEntry',
                      params: {},
                    } as never);
                  }}
                  className="py-2 border-2 border-success-200"
                  textColor="#10b981"
                  style={{ borderRadius: 16 }}
                >
                  <Text className="text-base font-medium">Add Earning</Text>
                </Button>
                
                <Button
                  mode="outlined"
                  icon="camera"
                  onPress={() => {
                    setShowQuickActions(false);
                    navigation.navigate('ReceiptsStack', {
                      screen: 'ReceiptCapture',
                      params: {},
                    } as never);
                  }}
                  className="py-2 border-2 border-accent-200"
                  textColor="#14b8a6"
                  style={{ borderRadius: 16 }}
                >
                  <Text className="text-base font-medium">Capture Receipt</Text>
                </Button>
              </View>
              
              <Button
                mode="text"
                onPress={() => setShowQuickActions(false)}
                className="mt-4"
                textColor="#6b7280"
              >
                Cancel
              </Button>
            </View>
          </Modal>
        </Portal>
      </LinearGradient>
    </View>
  );
};

export default DashboardScreen;