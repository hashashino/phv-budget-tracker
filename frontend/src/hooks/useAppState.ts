import { useEffect, useState } from 'react';
import { AppState, AppStateStatus } from 'react-native';

/**
 * Hook to track app state changes (active, background, inactive)
 */
export default function useAppState() {
  const [appState, setAppState] = useState<AppStateStatus>(AppState.currentState);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextAppState => {
      setAppState(nextAppState);
    });

    return () => {
      subscription?.remove();
    };
  }, []);

  return {
    appState,
    isActive: appState === 'active',
    isBackground: appState === 'background',
    isInactive: appState === 'inactive',
  };
}