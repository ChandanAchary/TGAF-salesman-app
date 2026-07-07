import { Pressable } from "react-native";
import * as Haptics from 'expo-haptics';

export default function FastHapticPress({ loading, onPress, style, children }: { loading?: boolean, onPress?: () => void, style: any, children?: React.ReactNode }) {
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
      ]}
    >
      {children}
    </Pressable>
  )
}