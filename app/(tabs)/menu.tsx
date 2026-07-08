import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Dimensions,
  TouchableOpacity,
  Alert,
} from "react-native";
import { Entypo, MaterialIcons, FontAwesome5, Feather } from "@expo/vector-icons";
import { Theme, useAppTheme } from "@/constants/Theme";
import { router } from "expo-router";
import { useUserStore } from "@/store";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import Avatar from "@/components/lazy/Avatar";
import { tokenManager } from "@/lib/axios/tokenManager";

const { width } = Dimensions.get("window");

export default function Menu() {
  const salesmanType = useUserStore((state) => state.salesmanType);
  const salesmanName = useUserStore((state) => state.name);
  const avatar = useUserStore((state) => state.avatar);
  const { colors, mode } = useAppTheme();
  const isDark = mode === 'dark';

  const handleLogout = async () => {
    // Clear storage and navigate to auth
    await tokenManager.clearToken();
    router.replace("/auth/login");
  };

  const coreActions: ActionTileProps[] = [
    {
      icon: <Entypo name="map" size={22} color={colors.primary} />,
      colors: ["#EFF6FF", "#DBEAFE"] as const,
      label: "Beat Plan",
      onPress: () => { router.push('/screens/route/myroute') },
    },
    {
      icon: <MaterialIcons name="event-available" size={24} color={colors.primary} />,
      colors: ["#EFF6FF", "#DBEAFE"] as const,
      label: "Attendance",
      onPress: () => { router.push("/screens/checkin?fromMenu=true") },
    },
    {
      icon: <MaterialIcons name="store" size={24} color={colors.primary} />,
      colors: ["#EFF6FF", "#DBEAFE"] as const,
      label: "Create Outlet",
      onPress: () => { router.replace("/(tabs)/store") },
    },
    {
      icon: <MaterialIcons name="notifications" size={24} color={colors.primary} />,
      colors: ["#EFF6FF", "#DBEAFE"] as const,
      label: "Notifications",
      onPress: () => { router.push('/screens/salesman/notification') },
    },
  ];

  const salesAndStockActions: ActionTileProps[] = [
    {
      icon: <FontAwesome5 name="award" size={20} color={colors.accent} />,
      colors: ["#EEF2FF", "#E0E7FF"] as const,
      label: "Incentive",
      onPress: () => { router.push('/screens/salesman/incentivePage') },
    },
    {
      icon: <MaterialIcons name="delivery-dining" size={24} color={colors.accent} />,
      colors: ["#EEF2FF", "#E0E7FF"] as const,
      label: "Pick Stock",
      onPress: () => { router.push('/screens/pickstock/pickStockDistributorList') },
    },
    {
      icon: <MaterialIcons name="transfer-within-a-station" size={24} color={colors.accent} />,
      colors: ["#EEF2FF", "#E0E7FF"] as const,
      label: "Reconciliation",
      onPress: () => { router.push('/screens/pickstock/reconciliationList') },
    },
    {
      icon: <MaterialIcons name="history" size={24} color={colors.accent} />,
      colors: ["#EEF2FF", "#E0E7FF"] as const,
      label: "Check-in History",
      onPress: () => { Alert.alert("Coming Soon", "Check-in History feature is coming soon!"); },
    },
    {
      icon: <MaterialIcons name="work" size={24} color={colors.accent} />,
      colors: ["#EEF2FF", "#E0E7FF"] as const,
      label: "Assets & Rentals",
      onPress: () => { Alert.alert("Coming Soon", "Assets & Rentals feature is coming soon!"); },
    },
  ];

  return (
    <SafeAreaView style={[styles.pageContainer, { backgroundColor: colors.background }]} edges={["top"]}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        
        {/* User Mini Profile Block */}
        <TouchableOpacity 
          style={styles.profileCard} 
          onPress={() => { router.push('/screens/salesman/salesmen') }}
          activeOpacity={0.9}
        >
          <LinearGradient
            colors={isDark ? ['#334155', '#1E293B'] : [Theme.colors.primaryDark, Theme.colors.primary]}
            style={styles.profileGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.profileRow}>
              <Avatar src={avatar} alt={salesmanName} size={60} />
              <View style={styles.profileInfo}>
                <Text style={styles.profileName}>{salesmanName || "Sales Executive"}</Text>
                <Text style={[styles.profileRole, { color: isDark ? colors.text.muted : "rgba(255,255,255,0.7)" }]}>{salesmanType?.replace(/_/g, " ")}</Text>
              </View>
            </View>
          </LinearGradient>
        </TouchableOpacity>

        <View style={styles.contentContainer}>
          {/* MANAGEMENT SECTION (IF PERMITTED) */}
          {(salesmanType === "CITYHEAD" || salesmanType === "TERRITORY_SALES_MANAGER" || salesmanType === "ASM" || salesmanType === "SUPERVISOR") && (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.text.secondary }]}>Management Actions</Text>
              <View style={styles.grid}>
                {(salesmanType === "CITYHEAD" || salesmanType === "TERRITORY_SALES_MANAGER" || salesmanType === "ASM") && (
                  <ActionTile
                    icon={<MaterialIcons name="shop-2" size={24} color={colors.warning} />}
                    colors={["#FFF7ED", "#FFEDD5"] as const}
                    label="Distributors"
                    onPress={() => { router.push("/screens/distributor/myDistibutors") }}
                    themeColors={{ surface: colors.surface, border: colors.border, text: colors.text.primary, isDark }}
                  />
                )}
                {(salesmanType === "CITYHEAD" || salesmanType === "TERRITORY_SALES_MANAGER" || salesmanType === "ASM") && (
                  <ActionTile
                    icon={<MaterialIcons name="payment" size={24} color={colors.warning} />}
                    colors={["#FFF7ED", "#FFEDD5"] as const}
                    label="Settlements"
                    onPress={() => { router.push('/screens/settelment/ListSettelment') }}
                    themeColors={{ surface: colors.surface, border: colors.border, text: colors.text.primary, isDark }}
                  />
                )}
                <ActionTile
                  icon={<MaterialIcons name="bar-chart" size={24} color={colors.warning} />}
                  colors={["#FFF7ED", "#FFEDD5"] as const}
                  label="My Salesmen"
                  onPress={() => { router.push('/screens/supervisor/MySalesman') }}
                  themeColors={{ surface: colors.surface, border: colors.border, text: colors.text.primary, isDark }}
                />
              </View>
            </View>
          )}

          {/* CORE OPERATIONS */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text.secondary }]}>Core Operations</Text>
            <View style={styles.grid}>
              {coreActions.map((action, idx) => (
                <ActionTile key={idx} {...action} themeColors={{ surface: colors.surface, border: colors.border, text: colors.text.primary, isDark }} />
              ))}
            </View>
          </View>

          {/* SALES & STOCK */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text.secondary }]}>Sales & Stock</Text>
            <View style={styles.grid}>
              {salesAndStockActions.map((action, idx) => (
                <ActionTile key={idx} {...action} themeColors={{ surface: colors.surface, border: colors.border, text: colors.text.primary, isDark }} />
              ))}
            </View>
          </View>

          {/* LOGOUT BUTTON */}
          <TouchableOpacity 
            style={[
              styles.logoutButton,
              { 
                backgroundColor: isDark ? "rgba(239, 68, 68, 0.15)" : Theme.colors.dangerLight,
                borderColor: isDark ? "rgba(239, 68, 68, 0.3)" : Theme.colors.danger + "20"
              }
            ]} 
            onPress={handleLogout}
            activeOpacity={0.8}
          >
            <Feather name="log-out" size={20} color={colors.danger} />
            <Text style={styles.logoutText}>Sign Out Account</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

interface ActionTileProps {
  icon: React.ReactNode;
  colors: readonly [string, string];
  label: string;
  onPress?: () => void;
  themeColors?: { surface: string; border: string; text: string; isDark: boolean };
}

function ActionTile({ icon, colors, label, onPress, themeColors }: ActionTileProps) {
  const finalSurface = themeColors?.isDark ? themeColors.surface : "#FFFFFF";
  const finalBorder = themeColors?.isDark ? themeColors.border : Theme.colors.border;
  const finalTextColor = themeColors?.isDark ? themeColors.text : Theme.colors.text.primary;
  const finalIconColors = themeColors?.isDark 
    ? ["#334155", "#1E293B"] as const 
    : colors;

  return (
    <TouchableOpacity 
      style={[styles.card, { backgroundColor: finalSurface, borderColor: finalBorder }]} 
      onPress={onPress} 
      activeOpacity={0.7}
    >
      <LinearGradient
        colors={finalIconColors}
        style={styles.iconContainer}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        {icon}
      </LinearGradient>
      <Text style={[styles.cardTitle, { color: finalTextColor }]} numberOfLines={1}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  pageContainer: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  container: {
    paddingBottom: 120, // Avoid overlap with bottom nav bar
  },
  profileCard: {
    paddingHorizontal: 20,
    marginTop: 10,
  },
  profileGradient: {
    borderRadius: Theme.radius.xl,
    padding: 20,
    ...Theme.shadows.md,
  },
  profileRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  profileInfo: {
    gap: 4,
  },
  profileName: {
    fontFamily: Theme.typography.fontFamily.bold,
    fontSize: Theme.typography.sizes.h2,
    color: "#FFFFFF",
  },
  profileRole: {
    fontFamily: Theme.typography.fontFamily.medium,
    fontSize: Theme.typography.sizes.caption,
    color: "rgba(255,255,255,0.7)",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  contentContainer: {
    paddingHorizontal: 20,
    marginTop: 24,
    gap: 24,
  },
  section: {
    gap: 12,
  },
  sectionTitle: {
    fontFamily: Theme.typography.fontFamily.bold,
    fontSize: Theme.typography.sizes.body,
    color: Theme.colors.text.secondary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  card: {
    backgroundColor: "#FFFFFF",
    width: (width - 52) / 2, // Perfect 2-column responsive layout
    height: 110,
    borderRadius: Theme.radius.lg,
    padding: 16,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: Theme.colors.border,
    ...Theme.shadows.sm,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: Theme.radius.md,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  cardTitle: {
    fontFamily: Theme.typography.fontFamily.semiBold,
    fontSize: Theme.typography.sizes.bodySm,
    textAlign: "center",
    color: Theme.colors.text.primary,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    backgroundColor: Theme.colors.dangerLight,
    borderWidth: 1,
    borderColor: Theme.colors.danger + "20",
    paddingVertical: 16,
    borderRadius: Theme.radius.lg,
    marginTop: 12,
  },
  logoutText: {
    fontFamily: Theme.typography.fontFamily.bold,
    fontSize: Theme.typography.sizes.body,
    color: Theme.colors.danger,
  },
});