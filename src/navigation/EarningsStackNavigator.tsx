import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTheme } from 'react-native-paper';

import { EarningsStackParamList } from '@types/index';
import EarningsScreen from '@screens/earnings/EarningsScreen';
import EarningEntryScreen from '@screens/earnings/EarningEntryScreen';

const Stack = createNativeStackNavigator<EarningsStackParamList>();

const EarningsStackNavigator: React.FC = () => {
  const theme = useTheme();

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.colors.surface,
        },
        headerTitleStyle: {
          color: theme.colors.onSurface,
          fontSize: 18,
          fontWeight: '600',
        },
        headerTintColor: theme.colors.onSurface,
      }}
    >
      <Stack.Screen
        name="EarningsList"
        component={EarningsScreen}
        options={{ 
          headerShown: false // The tab navigator handles the header
        }}
      />
      <Stack.Screen
        name="EarningEntry"
        component={EarningEntryScreen}
        options={{
          title: 'Add Earning',
          headerBackTitleVisible: false,
        }}
      />
    </Stack.Navigator>
  );
};

export default EarningsStackNavigator;