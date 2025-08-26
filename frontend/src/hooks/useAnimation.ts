import { useSharedValue, useAnimatedStyle, withTiming, withSpring, withDelay } from 'react-native-reanimated';
import { useCallback, useEffect } from 'react';

/**
 * Custom hook for common animations in PHV Budget Tracker
 */
export function useAnimation() {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);
  const translateY = useSharedValue(0);
  const rotate = useSharedValue(0);

  // Fade in animation
  const fadeIn = useCallback((duration = 500, delay = 0) => {
    opacity.value = withDelay(delay, withTiming(1, { duration }));
  }, [opacity]);

  // Fade out animation  
  const fadeOut = useCallback((duration = 500, delay = 0) => {
    opacity.value = withDelay(delay, withTiming(0, { duration }));
  }, [opacity]);

  // Scale animation for buttons/cards
  const scaleIn = useCallback((toValue = 1, duration = 300) => {
    scale.value = withSpring(toValue, {
      damping: 15,
      stiffness: 150,
    });
  }, [scale]);

  // Slide up animation for modals/sheets
  const slideUp = useCallback((toValue = 0, duration = 300) => {
    translateY.value = withSpring(toValue, {
      damping: 20,
      stiffness: 200,
    });
  }, [translateY]);

  // Slide down to hide
  const slideDown = useCallback((toValue = 100, duration = 300) => {
    translateY.value = withSpring(toValue, {
      damping: 20,
      stiffness: 200,
    });
  }, [translateY]);

  // Rotation animation
  const rotateIcon = useCallback((degrees = 180, duration = 300) => {
    rotate.value = withTiming(degrees, { duration });
  }, [rotate]);

  // Press animation for buttons
  const onPressIn = useCallback(() => {
    scale.value = withSpring(0.95);
  }, [scale]);

  const onPressOut = useCallback(() => {
    scale.value = withSpring(1);
  }, [scale]);

  // Animated styles
  const fadeStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  const scaleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const slideStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const rotateStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotate.value}deg` }],
  }));

  const combinedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [
      { scale: scale.value },
      { translateY: translateY.value },
      { rotate: `${rotate.value}deg` },
    ],
  }));

  // Preset animation styles for common patterns
  const fadeInUp = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  const slideInRight = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateX: translateY.value }], // Reuse translateY for horizontal
  }));

  // Auto fade in on mount
  useEffect(() => {
    fadeIn();
  }, [fadeIn]);

  return {
    // Values
    scale,
    opacity,
    translateY, 
    rotate,
    // Animations
    fadeIn,
    fadeOut,
    scaleIn,
    slideUp,
    slideDown,
    rotateIcon,
    onPressIn,
    onPressOut,
    // Styles
    fadeStyle,
    scaleStyle,
    slideStyle,
    rotateStyle,
    combinedStyle,
    // Preset styles
    fadeInUp,
    slideInRight,
  };
}