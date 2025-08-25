import 'react-native-gesture-handler/jestSetup';

// Mock react-native-reanimated
jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock');
  Reanimated.default.call = () => {};
  return Reanimated;
});

// Mock expo modules
jest.mock('expo-camera', () => ({
  Camera: 'Camera',
  CameraType: {},
  FlashMode: {},
}));

jest.mock('expo-location', () => ({
  requestForegroundPermissionsAsync: jest.fn(),
  getCurrentPositionAsync: jest.fn(),
}));

jest.mock('expo-document-picker', () => ({
  getDocumentAsync: jest.fn(),
}));

jest.mock('expo-image-picker', () => ({
  launchImageLibraryAsync: jest.fn(),
  launchCameraAsync: jest.fn(),
  MediaTypeOptions: {},
}));

jest.mock('expo-secure-store', () => ({
  setItemAsync: jest.fn(),
  getItemAsync: jest.fn(),
  deleteItemAsync: jest.fn(),
}));

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

// Mock React Native Paper
jest.mock('react-native-paper', () => {
  const React = require('react');
  const RN = require('react-native');
  
  return {
    Provider: ({ children }) => children,
    useTheme: () => ({
      colors: {
        primary: '#2E7D32',
        background: '#FFFFFF',
        surface: '#FFFFFF',
        text: '#000000',
      },
    }),
    Button: RN.TouchableOpacity,
    Text: RN.Text,
    TextInput: RN.TextInput,
    Card: RN.View,
    Title: RN.Text,
    Paragraph: RN.Text,
    FAB: RN.TouchableOpacity,
    Chip: RN.View,
  };
});

// Silence the warning: Animated: `useNativeDriver` is not supported
jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper');