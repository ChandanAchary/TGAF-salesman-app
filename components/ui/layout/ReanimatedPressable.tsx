// components/ReanimatedPressable.tsx
import React from 'react';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { Pressable } from 'react-native';

const FAST_DURATION = 0; // 0.1s

export default function ReanimatedPressable({ children, onPress, style }: any) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Pressable
      onPressIn={() => {
        scale.value = withTiming(0.95, { duration: FAST_DURATION });
      }}
      onPressOut={() => {
        scale.value = withTiming(1, { duration: FAST_DURATION });
      }}
      onPress={onPress}
    >
      <Animated.View style={[animatedStyle, style]}>
        {children}
      </Animated.View>
    </Pressable>
  );
}
