import { useUserStore } from "@/store";
import { Image, StyleSheet, Text, View, TouchableOpacity } from "react-native";
import { Theme, useAppTheme } from "@/constants/Theme";
import { router } from "expo-router";

export default function UserDetailBar() {
  const salesmanType = useUserStore((state) => state.salesmanType);
  const salesmanName = useUserStore((state) => state.name);
  const avatar = useUserStore((state) => state.avatar);
  const { colors } = useAppTheme();

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
    <TouchableOpacity 
      style={styles.tabbarleft} 
      onPress={() => router.push('/screens/salesman/salesmen')}
      activeOpacity={0.7}
    >
      <Image 
        source={avatar ? { uri: avatar } : require("@/assets/images/react-logo.png")} 
        style={[styles.tabbarlogo, { borderColor: colors.surface }]} 
      />
      <View style={styles.tabbardetails}>
        <Text style={[styles.greetingText, { color: colors.text.secondary }]}>{getGreeting()},</Text>
        <Text style={[styles.nameText, { color: colors.text.primary }]}>{salesmanName?.split(" ")[0] || "User"}</Text>
        <Text style={[styles.roleText, { color: colors.text.muted }]}>{getCleanRole(salesmanType)}</Text>
      </View>
    </TouchableOpacity>
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
    ...Theme.shadows.sm,
  },
  tabbardetails: {
    justifyContent: "center",
  },
  greetingText: {
    fontFamily: Theme.typography.fontFamily.medium,
    fontSize: Theme.typography.sizes.caption,
  },
  nameText: {
    fontFamily: Theme.typography.fontFamily.bold,
    fontSize: Theme.typography.sizes.body,
    marginTop: -2,
  },
  roleText: {
    fontFamily: Theme.typography.fontFamily.medium,
    fontSize: 10,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginTop: 2,
  },
});