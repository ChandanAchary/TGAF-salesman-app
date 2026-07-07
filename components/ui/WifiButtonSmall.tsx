import { useIsOnline } from "@/hooks/useIsOnline";
import { WifiHigh } from "phosphor-react-native";
import { StyleSheet, View } from "react-native";

export default function WifiButtonSmall() {

  const isOnline = useIsOnline();

  return (
    <View style={{ ...styles.tabbaricon, backgroundColor: isOnline ? "#D8F9EA" : "#F8D8D8" }}>
      <WifiHigh size={22} color={isOnline ? "#00C86B" : "red"} />
    </View>
  )
}

const styles = StyleSheet.create({
  tabbaricon: {
    aspectRatio: 1 / 1,
    width: 40,
    height: 40,
    borderRadius: 999,
    justifyContent: "center",
    alignItems: "center",
  }
});