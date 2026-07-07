import { Pressable } from "react-native";
import * as Haptics from 'expo-haptics';

export default function HapticPress({ loading, onPress, style, children }: { loading?: boolean, onPress?: () => void, style: any, children?: React.ReactNode }) {
  return (
    <Pressable
      android_disableSound
      delayLongPress={0}
      onPressIn={() => {
        Haptics.selectionAsync(); // tiny tactile feedback
      }}
      disabled={loading}
      onPress={onPress}
      style={({ pressed }) => [
        style,
        {
          opacity: pressed ? 0.85 : 1,
          transform: [{ scale: pressed ? 0.98 : 1 }],
        },
      ]}
    >
      {children}
    </Pressable>
  )
}