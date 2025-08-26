import { useState, useCallback } from 'react';
import { Platform, Alert } from 'react-native';

/**
 * Hook for biometric authentication (placeholder for future implementation)
 */
export default function useBiometrics() {
  const [isSupported, setIsSupported] = useState(false);
  const [isEnabled, setIsEnabled] = useState(false);

  const checkSupport = useCallback(async () => {
    // Placeholder - would integrate with @react-native-biometrics or similar
    if (Platform.OS === 'ios' || Platform.OS === 'android') {
      setIsSupported(true);
    }
  }, []);

  const authenticate = useCallback(async () => {
    return new Promise<boolean>((resolve) => {
      Alert.alert(
        'Biometric Authentication',
        'This feature will be available in a future update.',
        [{ text: 'OK', onPress: () => resolve(false) }]
      );
    });
  }, []);

  const enable = useCallback(async () => {
    const success = await authenticate();
    if (success) {
      setIsEnabled(true);
    }
    return success;
  }, [authenticate]);

  const disable = useCallback(() => {
    setIsEnabled(false);
  }, []);

  return {
    isSupported,
    isEnabled,
    checkSupport,
    authenticate,
    enable,
    disable,
  };
}