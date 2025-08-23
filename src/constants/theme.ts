import { MD3LightTheme, MD3DarkTheme } from 'react-native-paper';

// Light Theme Colors
const lightColors = {
  primary: '#2E7D32', // Green primary for money/finance
  primaryContainer: '#A5D6A7',
  secondary: '#1976D2', // Blue secondary
  secondaryContainer: '#BBDEFB',
  tertiary: '#F57C00', // Orange tertiary
  tertiaryContainer: '#FFE0B2',
  surface: '#FFFFFF',
  surfaceVariant: '#F5F5F5',
  background: '#FAFAFA',
  error: '#D32F2F',
  errorContainer: '#FFCDD2',
  onPrimary: '#FFFFFF',
  onPrimaryContainer: '#1B5E20',
  onSecondary: '#FFFFFF',
  onSecondaryContainer: '#0D47A1',
  onTertiary: '#FFFFFF',
  onTertiaryContainer: '#E65100',
  onSurface: '#212121',
  onSurfaceVariant: '#424242',
  onBackground: '#212121',
  onError: '#FFFFFF',
  onErrorContainer: '#B71C1C',
  outline: '#BDBDBD',
  outlineVariant: '#E0E0E0',
  shadow: '#000000',
  scrim: '#000000',
  inverseSurface: '#303030',
  inverseOnSurface: '#F5F5F5',
  inversePrimary: '#81C784',
  
  // Custom colors for PHV app
  success: '#388E3C',
  warning: '#F57C00',
  info: '#1976D2',
  earning: '#2E7D32',
  expense: '#D32F2F',
  neutral: '#616161',
};

// Dark Theme Colors
const darkColors = {
  primary: '#81C784', // Lighter green for dark mode
  primaryContainer: '#2E7D32',
  secondary: '#64B5F6', // Lighter blue for dark mode
  secondaryContainer: '#1976D2',
  tertiary: '#FFB74D', // Lighter orange for dark mode
  tertiaryContainer: '#F57C00',
  surface: '#121212',
  surfaceVariant: '#1E1E1E',
  background: '#0A0A0A',
  error: '#F44336',
  errorContainer: '#B71C1C',
  onPrimary: '#1B5E20',
  onPrimaryContainer: '#C8E6C9',
  onSecondary: '#0D47A1',
  onSecondaryContainer: '#E3F2FD',
  onTertiary: '#E65100',
  onTertiaryContainer: '#FFF3E0',
  onSurface: '#E0E0E0',
  onSurfaceVariant: '#BDBDBD',
  onBackground: '#E0E0E0',
  onError: '#FFFFFF',
  onErrorContainer: '#FFCDD2',
  outline: '#424242',
  outlineVariant: '#303030',
  shadow: '#000000',
  scrim: '#000000',
  inverseSurface: '#F5F5F5',
  inverseOnSurface: '#303030',
  inversePrimary: '#2E7D32',
  
  // Custom colors for PHV app
  success: '#66BB6A',
  warning: '#FFB74D',
  info: '#64B5F6',
  earning: '#81C784',
  expense: '#F44336',
  neutral: '#9E9E9E',
};

// Light Theme
export const lightTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    ...lightColors,
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  borderRadius: {
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    xxl: 24,
  },
  typography: {
    displayLarge: {
      fontSize: 57,
      lineHeight: 64,
      fontWeight: '400' as const,
    },
    displayMedium: {
      fontSize: 45,
      lineHeight: 52,
      fontWeight: '400' as const,
    },
    displaySmall: {
      fontSize: 36,
      lineHeight: 44,
      fontWeight: '400' as const,
    },
    headlineLarge: {
      fontSize: 32,
      lineHeight: 40,
      fontWeight: '400' as const,
    },
    headlineMedium: {
      fontSize: 28,
      lineHeight: 36,
      fontWeight: '400' as const,
    },
    headlineSmall: {
      fontSize: 24,
      lineHeight: 32,
      fontWeight: '400' as const,
    },
    titleLarge: {
      fontSize: 22,
      lineHeight: 28,
      fontWeight: '500' as const,
    },
    titleMedium: {
      fontSize: 16,
      lineHeight: 24,
      fontWeight: '500' as const,
    },
    titleSmall: {
      fontSize: 14,
      lineHeight: 20,
      fontWeight: '500' as const,
    },
    bodyLarge: {
      fontSize: 16,
      lineHeight: 24,
      fontWeight: '400' as const,
    },
    bodyMedium: {
      fontSize: 14,
      lineHeight: 20,
      fontWeight: '400' as const,
    },
    bodySmall: {
      fontSize: 12,
      lineHeight: 16,
      fontWeight: '400' as const,
    },
    labelLarge: {
      fontSize: 14,
      lineHeight: 20,
      fontWeight: '500' as const,
    },
    labelMedium: {
      fontSize: 12,
      lineHeight: 16,
      fontWeight: '500' as const,
    },
    labelSmall: {
      fontSize: 11,
      lineHeight: 16,
      fontWeight: '500' as const,
    },
  },
  elevation: {
    level0: 0,
    level1: 1,
    level2: 3,
    level3: 6,
    level4: 8,
    level5: 12,
  },
};

// Dark Theme
export const darkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    ...darkColors,
  },
  spacing: lightTheme.spacing,
  borderRadius: lightTheme.borderRadius,
  typography: lightTheme.typography,
  elevation: lightTheme.elevation,
};

// Default theme (light)
export const theme = lightTheme;

// Theme type
export type Theme = typeof lightTheme;