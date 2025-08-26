import { useColorScheme } from 'react-native';
import { useTheme as usePaperTheme } from 'react-native-paper';
import { useMemo } from 'react';

/**
 * Enhanced theme hook that combines React Native Paper theme with custom utilities
 */
export default function useTheme() {
  const colorScheme = useColorScheme();
  const paperTheme = usePaperTheme();

  const theme = useMemo(() => ({
    ...paperTheme,
    isDark: colorScheme === 'dark',
    isLight: colorScheme === 'light',
    // Tailwind-compatible color utilities
    tw: {
      primary: colorScheme === 'dark' ? '#0ea5e9' : '#1a365d',
      secondary: colorScheme === 'dark' ? '#fb923c' : '#f97316', 
      accent: colorScheme === 'dark' ? '#14b8a6' : '#0d9488',
      success: '#10b981',
      danger: '#ef4444',
      warning: '#f59e0b',
      earning: '#10b981',
      expense: '#ef4444',
      neutral: '#6b7280',
    },
    // Spacing utilities
    spacing: {
      xs: 4,
      sm: 8,
      md: 16,
      lg: 24,
      xl: 32,
      '2xl': 48,
    },
    // Border radius utilities  
    radius: {
      sm: 4,
      md: 8,
      lg: 12,
      xl: 16,
      '2xl': 24,
      full: 9999,
    },
    // Shadow utilities
    shadows: {
      soft: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
      },
      medium: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 8,
      },
      strong: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.2,
        shadowRadius: 16,
        elevation: 12,
      },
    },
  }), [colorScheme, paperTheme]);

  return theme;
}