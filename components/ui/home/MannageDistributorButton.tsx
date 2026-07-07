import { Text, TouchableOpacity, View } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { Href, useRouter } from "expo-router";
import HapticPress from "../layout/HapticPress";

export default function MannageDistributorButton({ route, name, icon }: { route?: Href, name?: string, icon?: "money" }) {

  const router = useRouter();

  return (
    <HapticPress
      style={{ width: "100%" }}
      onPress={() => { router.push(route || "/screens/distributor/myDistibutors") }}
    >
      <View style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        padding: 18,
        backgroundColor: "#f8f8f8",
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "#e0e0e0",
        marginHorizontal: 16,
        marginVertical: 8
      }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
          <MaterialIcons name={icon || "account-tree"} size={22} color="#444" />
          <Text style={{
            fontSize: 16,
            color: "#333",
            fontWeight: "500",
            letterSpacing: 0.2
          }}>
            {
              name || "Manage Distributors"
            }
          </Text>
        </View>
        <MaterialIcons
          name="keyboard-arrow-right"
          size={24}
          color="#666"
          style={{ marginLeft: 8 }}
        />
      </View>
    </HapticPress>
  )
}