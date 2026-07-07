import { useUserStore } from "@/store";
import { Image, StyleSheet, Text, View } from "react-native";
import { Theme } from "@/constants/Theme";

export default function UserDetailBar() {
  const salesmanType = useUserStore((state) => state.salesmanType);
  const salesmanName = useUserStore((state) => state.name);
  const avatar = useUserStore((state) => state.avatar);

  // Dynamic greeting based on current hour
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  const getCleanRole = (role: string | undefined | null) => {
    if (!role) return "Sales Representative";
    return role.toLowerCase().replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());
  };

  return (
    <View style={styles.tabbarleft}>
      <Image 
        source={avatar ? { uri: avatar } : require("@/assets/images/react-logo.png")} 
        style={styles.tabbarlogo} 
      />
      <View style={styles.tabbardetails}>
        <Text style={styles.greetingText}>{getGreeting()},</Text>
        <Text style={styles.nameText}>{salesmanName?.split(" ")[0] || "User"}</Text>
        <Text style={styles.roleText}>{getCleanRole(salesmanType)}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  tabbarleft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  tabbarlogo: {
    aspectRatio: 1,
    width: 48,
    height: 48,
    borderRadius: Theme.radius.full,
    resizeMode: "cover",
    borderWidth: 2,
    borderColor: "#FFFFFF",
    ...Theme.shadows.sm,
  },
  tabbardetails: {
    justifyContent: "center",
  },
  greetingText: {
    fontFamily: Theme.typography.fontFamily.medium,
    fontSize: Theme.typography.sizes.caption,
    color: "rgba(255, 255, 255, 0.7)",
  },
  nameText: {
    fontFamily: Theme.typography.fontFamily.bold,
    fontSize: Theme.typography.sizes.body,
    color: "#FFFFFF",
    marginTop: -2,
  },
  roleText: {
    fontFamily: Theme.typography.fontFamily.medium,
    fontSize: 10,
    color: "rgba(255, 255, 255, 0.5)",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginTop: 2,
  },
});