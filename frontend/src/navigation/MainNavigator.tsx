import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from 'react-native-paper';
import { useSelector } from 'react-redux';

import { MainTabParamList } from '@types/index';
import { RootState } from '@store/store';
import DashboardScreen from '@screens/dashboard/DashboardScreen';
import ExpensesStackNavigator from '@navigation/ExpensesStackNavigator';
import EarningsStackNavigator from '@navigation/EarningsStackNavigator';
import ReceiptsStackNavigator from '@navigation/ReceiptsStackNavigator';
import ReportsScreen from '@screens/reports/ReportsScreen';
import SettingsScreen from '@screens/settings/SettingsScreen';
import AdminScreen from '@screens/admin/AdminScreen';

const Tab = createBottomTabNavigator<MainTabParamList>();

const MainNavigator: React.FC = () => {
  const theme = useTheme();
  const user = useSelector((state: RootState) => state.auth.user);

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof MaterialCommunityIcons.glyphMap;

          switch (route.name) {
            case 'Dashboard':
              iconName = focused ? 'view-dashboard' : 'view-dashboard-outline';
              break;
            case 'ExpensesStack':
              iconName = focused ? 'cash-minus' : 'cash-minus';
              break;
            case 'EarningsStack':
              iconName = focused ? 'cash-plus' : 'cash-plus';
              break;
            case 'ReceiptsStack':
              iconName = focused ? 'receipt' : 'receipt-outline';
              break;
            case 'Reports':
              iconName = focused ? 'chart-line' : 'chart-line-variant';
              break;
            case 'Settings':
              iconName = focused ? 'cog' : 'cog-outline';
              break;
            case 'Admin':
              iconName = focused ? 'shield-account' : 'shield-account-outline';
              break;
            default:
              iconName = 'help-circle-outline';
          }

          return (
            <MaterialCommunityIcons
              name={iconName}
              size={size}
              color={color}
            />
          );
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.outline,
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.outline,
          paddingTop: 5,
          paddingBottom: 5,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
        headerStyle: {
          backgroundColor: theme.colors.surface,
          elevation: 0,
          shadowOpacity: 0,
        },
        headerTitleStyle: {
          color: theme.colors.onSurface,
          fontSize: 18,
          fontWeight: '600',
        },
      })}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{ title: 'Dashboard' }}
      />
      <Tab.Screen
        name="ExpensesStack"
        component={ExpensesStackNavigator}
        options={{ title: 'Expenses' }}
      />
      <Tab.Screen
        name="EarningsStack"
        component={EarningsStackNavigator}
        options={{ title: 'Earnings' }}
      />
      <Tab.Screen
        name="ReceiptsStack"
        component={ReceiptsStackNavigator}
        options={{ title: 'Receipts' }}
      />
      <Tab.Screen
        name="Reports"
        component={ReportsScreen}
        options={{ title: 'Reports' }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{ title: 'Settings' }}
      />
      {user?.role === 'SUPER_ADMIN' && (
        <Tab.Screen
          name="Admin"
          component={AdminScreen}
          options={{ title: 'Admin' }}
        />
      )}
    </Tab.Navigator>
  );
};

export default MainNavigator;