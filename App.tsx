import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { LogBox } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider as PaperProvider } from 'react-native-paper';
import { Provider as ReduxProvider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import * as Notifications from 'expo-notifications';

import Navigation from '@navigation/Navigation';
import { store, persistor } from '@store/store';
import { theme } from '@constants/theme';
import LoadingScreen from '@components/common/LoadingScreen';

// Configure notifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

// Ignore specific warnings for React Native Paper and other libraries
LogBox.ignoreLogs([
  'VirtualizedLists should never be nested',
  'Setting a timer',
  'source.uri should not be an empty string',
]);

export default function App() {
  useEffect(() => {
    // Request notification permissions on app startup
    const requestPermissions = async () => {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') {
        console.warn('Notification permissions not granted');
      }
    };

    requestPermissions();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ReduxProvider store={store}>
          <PersistGate loading={<LoadingScreen />} persistor={persistor}>
            <PaperProvider theme={theme}>
              <Navigation />
              <StatusBar style="auto" />
            </PaperProvider>
          </PersistGate>
        </ReduxProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}