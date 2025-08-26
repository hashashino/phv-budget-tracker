import { useColorScheme as useRNColorScheme } from 'react-native';
import { useState, useEffect } from 'react';

/**
 * Enhanced color scheme hook for NativeWind with manual toggle support
 */
export default function useColorScheme() {
  const systemColorScheme = useRNColorScheme();
  const [colorScheme, setColorScheme] = useState(systemColorScheme);
  const [isManualMode, setIsManualMode] = useState(false);

  useEffect(() => {
    if (!isManualMode) {
      setColorScheme(systemColorScheme);
    }
  }, [systemColorScheme, isManualMode]);

  const toggleColorScheme = () => {
    setIsManualMode(true);
    setColorScheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const setAutoMode = () => {
    setIsManualMode(false);
    setColorScheme(systemColorScheme);
  };

  const setLightMode = () => {
    setIsManualMode(true);
    setColorScheme('light');
  };

  const setDarkMode = () => {
    setIsManualMode(true);
    setColorScheme('dark');
  };

  return {
    colorScheme,
    isDark: colorScheme === 'dark',
    isLight: colorScheme === 'light',
    isSystemMode: !isManualMode,
    toggleColorScheme,
    setAutoMode,
    setLightMode,
    setDarkMode,
  };
}