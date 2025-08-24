import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTheme } from 'react-native-paper';

import { ExpensesStackParamList } from '@types/index';
import ExpensesScreen from '@screens/expenses/ExpensesScreen';
import ExpenseEntryScreen from '@screens/expenses/ExpenseEntryScreen';

const Stack = createNativeStackNavigator<ExpensesStackParamList>();

const ExpensesStackNavigator: React.FC = () => {
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
        name="ExpensesList"
        component={ExpensesScreen}
        options={{ 
          headerShown: false // The tab navigator handles the header
        }}
      />
      <Stack.Screen
        name="ExpenseEntry"
        component={ExpenseEntryScreen}
        options={{
          title: 'Add Expense',
          headerBackTitleVisible: false,
        }}
      />
    </Stack.Navigator>
  );
};

export default ExpensesStackNavigator;