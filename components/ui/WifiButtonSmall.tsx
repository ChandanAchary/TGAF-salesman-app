import { useIsOnline } from "@/hooks/useIsOnline";
import { WifiHigh } from "phosphor-react-native";
import { StyleSheet, View } from "react-native";
import { useAppTheme } from "@/constants/Theme";

export default function WifiButtonSmall() {
  const isOnline = useIsOnline();
  const { colors } = useAppTheme();

  return (
    <View style={[
      styles.tabbaricon, 
      { 
        backgroundColor: colors.background, 
        borderColor: colors.border,
      }
    ]}>
      <WifiHigh size={20} color={colors.primary} weight="bold" />
      {/* Dynamic connection status dot */}
      <View style={[
        styles.statusDot, 
        { backgroundColor: isOnline ? "#10B981" : "#EF4444" }
      ]} />
    </View>
  );
}

const styles = StyleSheet.create({
  tabbaricon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    position: 'relative',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    position: 'absolute',
    top: 2,
    right: 2,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  }
});