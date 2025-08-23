import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from 'react-native-paper';

import { MainTabParamList } from '@types/index';
import DashboardScreen from '@screens/dashboard/DashboardScreen';
import ExpensesScreen from '@screens/expenses/ExpensesScreen';
import EarningsScreen from '@screens/earnings/EarningsScreen';
import ReceiptsScreen from '@screens/receipts/ReceiptsScreen';
import ReportsScreen from '@screens/reports/ReportsScreen';
import SettingsScreen from '@screens/settings/SettingsScreen';

const Tab = createBottomTabNavigator<MainTabParamList>();

const MainNavigator: React.FC = () => {
  const theme = useTheme();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof MaterialCommunityIcons.glyphMap;

          switch (route.name) {
            case 'Dashboard':
              iconName = focused ? 'view-dashboard' : 'view-dashboard-outline';
              break;
            case 'Expenses':
              iconName = focused ? 'cash-minus' : 'cash-minus';
              break;
            case 'Earnings':
              iconName = focused ? 'cash-plus' : 'cash-plus';
              break;
            case 'Receipts':
              iconName = focused ? 'receipt' : 'receipt-outline';
              break;
            case 'Reports':
              iconName = focused ? 'chart-line' : 'chart-line-variant';
              break;
            case 'Settings':
              iconName = focused ? 'cog' : 'cog-outline';
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
        name="Expenses"
        component={ExpensesScreen}
        options={{ title: 'Expenses' }}
      />
      <Tab.Screen
        name="Earnings"
        component={EarningsScreen}
        options={{ title: 'Earnings' }}
      />
      <Tab.Screen
        name="Receipts"
        component={ReceiptsScreen}
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
    </Tab.Navigator>
  );
};

export default MainNavigator;