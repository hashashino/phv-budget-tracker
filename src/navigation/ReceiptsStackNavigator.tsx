import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTheme } from 'react-native-paper';

import { ReceiptsStackParamList } from '@types/index';
import ReceiptsScreen from '@screens/receipts/ReceiptsScreen';
import ReceiptCaptureScreen from '@screens/receipts/ReceiptCaptureScreen';

const Stack = createNativeStackNavigator<ReceiptsStackParamList>();

const ReceiptsStackNavigator: React.FC = () => {
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
        name="ReceiptsList"
        component={ReceiptsScreen}
        options={{ 
          headerShown: false // The tab navigator handles the header
        }}
      />
      <Stack.Screen
        name="ReceiptCapture"
        component={ReceiptCaptureScreen}
        options={{
          title: 'Capture Receipt',
          headerBackTitleVisible: false,
        }}
      />
    </Stack.Navigator>
  );
};

export default ReceiptsStackNavigator;