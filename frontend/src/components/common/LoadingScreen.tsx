import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ActivityIndicator, Text } from 'react-native-paper';
import { useTheme } from 'react-native-paper';

interface LoadingScreenProps {
  message?: string;
  size?: 'small' | 'large';
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ 
  message = 'Loading...', 
  size = 'large' 
}) => {
  const theme = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ActivityIndicator 
        size={size} 
        color={theme.colors.primary}
        style={styles.indicator}
      />
      <Text 
        variant="bodyLarge"
        style={[styles.message, { color: theme.colors.onBackground }]}
      >
        {message}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  indicator: {
    marginBottom: 16,
  },
  message: {
    textAlign: 'center',
    opacity: 0.7,
  },
});

export default LoadingScreen;