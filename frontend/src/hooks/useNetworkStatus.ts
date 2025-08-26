import { useState, useEffect } from 'react';
import NetInfo from '@react-native-community/netinfo';

/**
 * Hook to monitor network connectivity
 */
export default function useNetworkStatus() {
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [connectionType, setConnectionType] = useState<string>('unknown');

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsConnected(state.isConnected);
      setConnectionType(state.type);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  return {
    isConnected,
    connectionType,
    isOnline: isConnected === true,
    isOffline: isConnected === false,
  };
}