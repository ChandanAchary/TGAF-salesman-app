import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Dimensions,
  TouchableOpacity,
} from "react-native";
import { Entypo, MaterialIcons, FontAwesome5, Feather } from "@expo/vector-icons";
import { Theme } from "@/constants/Theme";
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

  const handleLogout = async () => {
    // Clear storage and navigate to auth
    await tokenManager.clearToken();
    router.replace("/auth/login");
  };

  const coreActions: ActionTileProps[] = [
    {
      icon: <MaterialIcons name="person" size={24} color="#1E3A8A" />,
      colors: ["#DBEAFE", "#EFF6FF"],
      label: "User Profile",
      onPress: () => { router.push('/screens/salesman/salesmen') },
    },
    {
      icon: <FontAwesome5 name="award" size={20} color="#065F46" />,
      colors: ["#D1FAE5", "#ECFDF5"],
      label: "Incentive",
      onPress: () => { router.push('/screens/salesman/incentivePage') },
    },
    {
      icon: <MaterialIcons name="delivery-dining" size={24} color="#9A3412" />,
      colors: ["#FFEDD5", "#FFF7ED"],
      label: "Pick Stock",
      onPress: () => { router.push('/screens/pickstock/pickStockDistributorList') },
    },
    {
      icon: <MaterialIcons name="transfer-within-a-station" size={24} color="#9D174D" />,
      colors: ["#FCE7F3", "#FDF2F8"],
      label: "Reconciliation",
      onPress: () => { router.push('/screens/pickstock/reconciliationList') },
    },
    {
      icon: <MaterialIcons name="store" size={24} color="#5B21B6" />,
      colors: ["#EDE9FE", "#F5F3FF"],
      label: "Create Outlet",
      onPress: () => { router.replace("/(tabs)/store") },
    },
    {
      icon: <MaterialIcons name="event-available" size={24} color="#075985" />,
      colors: ["#E0F2FE", "#F0F9FF"],
      label: "Attendance",
      onPress: () => { router.replace("/screens/checkin") },
    },
    {
      icon: <MaterialIcons name="history" size={24} color="#6B21A8" />,
      colors: ["#F3E8FF", "#FAF5FF"],
      label: "Check-in History",
      onPress: () => { },
    },
    {
      icon: <MaterialIcons name="work" size={24} color="#374151" />,
      colors: ["#E5E7EB", "#F3F4F6"],
      label: "Assets & Rentals",
      onPress: () => { },
    },
    {
      icon: <MaterialIcons name="notifications" size={24} color="#991B1B" />,
      colors: ["#FEE2E2", "#FEF2F2"],
      label: "Notifications",
      onPress: () => { },
    },
    {
      icon: <Entypo name="map" size={24} color="#065F46" />,
      colors: ["#D1FAE5", "#ECFDF5"],
      label: "Beat Plan",
      onPress: () => { router.push('/screens/route/myroute') },
    },
  ];

  return (
    <SafeAreaView style={styles.pageContainer} edges={["top"]}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        
        {/* User Mini Profile Block */}
        <View style={styles.profileCard}>
          <LinearGradient
            colors={[Theme.colors.primaryDark, Theme.colors.primary]}
            style={styles.profileGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.profileRow}>
              <Avatar src={avatar} alt={salesmanName} size={60} />
              <View style={styles.profileInfo}>
                <Text style={styles.profileName}>{salesmanName || "Sales Executive"}</Text>
                <Text style={styles.profileRole}>{salesmanType?.replace(/_/g, " ")}</Text>
              </View>
            </View>
          </LinearGradient>
        </View>

        <View style={styles.contentContainer}>
          {/* MANAGEMENT SECTION (IF PERMITTED) */}
          {(salesmanType === "CITYHEAD" || salesmanType === "TERRITORY_SALES_MANAGER" || salesmanType === "ASM" || salesmanType === "SUPERVISOR") && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Management Actions</Text>
              <View style={styles.grid}>
                {(salesmanType === "CITYHEAD" || salesmanType === "TERRITORY_SALES_MANAGER" || salesmanType === "ASM") && (
                  <ActionTile
                    icon={<MaterialIcons name="shop-2" size={24} color="#C2410C" />}
                    colors={["#FFEDD5", "#FFF7ED"]}
                    label="Distributors"
                    onPress={() => { router.push("/screens/distributor/myDistibutors") }}
                  />
                )}
                {(salesmanType === "CITYHEAD" || salesmanType === "TERRITORY_SALES_MANAGER" || salesmanType === "ASM") && (
                  <ActionTile
                    icon={<MaterialIcons name="payment" size={24} color="#C2410C" />}
                    colors={["#FFEDD5", "#FFF7ED"]}
                    label="Settlements"
                    onPress={() => { router.push('/screens/settelment/ListSettelment') }}
                  />
                )}
                <ActionTile
                  icon={<MaterialIcons name="bar-chart" size={24} color="#0284C7" />}
                  colors={["#E0F2FE", "#F0F9FF"]}
                  label="My Salesmen"
                  onPress={() => { router.push('/screens/supervisor/MySalesman') }}
                />
              </View>
            </View>
          )}

          {/* MAIN UTILITIES SECTION */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Portal Utilities</Text>
            <View style={styles.grid}>
              {coreActions.map((action, idx) => (
                <ActionTile key={idx} {...action} />
              ))}
            </View>
          </View>

          {/* LOGOUT BUTTON */}
          <TouchableOpacity 
            style={styles.logoutButton} 
            onPress={handleLogout}
            activeOpacity={0.8}
          >
            <Feather name="log-out" size={20} color={Theme.colors.danger} />
            <Text style={styles.logoutText}>Sign Out Account</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

interface ActionTileProps {
  icon: React.ReactNode;
  colors: [string, string];
  label: string;
  onPress?: () => void;
}

function ActionTile({ icon, colors, label, onPress }: ActionTileProps) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <LinearGradient
        colors={colors}
        style={styles.iconContainer}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        {icon}
      </LinearGradient>
      <Text style={styles.cardTitle} numberOfLines={1}>{label}</Text>
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