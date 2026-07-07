import { useIsOnline } from "@/hooks/useIsOnline";
import { WifiHigh } from "phosphor-react-native";
import { StyleSheet, View } from "react-native";

export default function WifiButton() {

  const isOnline = useIsOnline();

  return (
    <View style={{ ...styles.tabbaricon, backgroundColor: isOnline ? "#D8F9EA" : "#F8D8D8" }}>
      <WifiHigh size={32} color={isOnline ? "#00C86B" : "red"} />
    </View>
  )
}

const styles = StyleSheet.create({
  tabbaricon: {
    aspectRatio: 1 / 1,
    width: 50,
    height: 50,
    borderRadius: 999,
    justifyContent: "center",
    alignItems: "center",
  }
});