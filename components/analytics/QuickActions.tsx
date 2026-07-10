import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useAppTheme, Theme } from "@/constants/Theme";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

interface ActionItem {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  route: string;
}

const ACTION_ITEMS: ActionItem[] = [
  {
    label: "Mark Attendance",
    icon: "calendar-outline",
    color: "#3B82F6",
    route: "/screens/checkin",
  },
  {
    label: "Create Order",
    icon: "cart-outline",
    color: "#10B981",
    route: "/screens/distributor/CreateOrder",
  },
  {
    label: "Collect Payment",
    icon: "cash-outline",
    color: "#F59E0B",
    route: "/screens/settelment/Settelment",
  },
  {
    label: "View Leaderboard",
    icon: "trophy-outline",
    color: "#8B5CF6",
    route: "/(tabs)/reports",
  },
  {
    label: "Visit Route",
    icon: "map-outline",
    color: "#EC4899",
    route: "/screens/route/myroute",
  },
  {
    label: "Add Customer",
    icon: "person-add-outline",
    color: "#06B6D4",
    route: "/(tabs)/store",
  },
];

export default function QuickActions() {
  const { colors, mode } = useAppTheme();
  const isDark = mode === "dark";

  return (
    <View style={styles.container}>
      <Text style={[styles.sectionTitle, { color: colors.text.secondary }]}>
        Quick Actions
      </Text>
      <View style={styles.grid}>
        {ACTION_ITEMS.map((item, idx) => (
          <TouchableOpacity
            key={idx}
            onPress={() => router.push(item.route as any)}
            style={[
              styles.tile,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
                borderWidth: isDark ? 1 : 0,
              },
            ]}
            activeOpacity={0.8}
          >
            <View style={[styles.iconWrapper, { backgroundColor: `${item.color}15` }]}>
              <Ionicons name={item.icon} size={20} color={item.color} />
            </View>
            <Text style={[styles.label, { color: colors.text.primary }]}>{item.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 12,
  },
  sectionTitle: {
    fontFamily: Theme.typography.fontFamily.semiBold,
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 10,
    paddingLeft: 8,
    borderLeftWidth: 3,
    borderLeftColor: Theme.colors.primary,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  tile: {
    width: "48%",
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 12,
    elevation: 2,
    shadowColor: "#aaa",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    gap: 10,
  },
  iconWrapper: {
    padding: 8,
    borderRadius: 8,
  },
  label: {
    fontFamily: Theme.typography.fontFamily.semiBold,
    fontSize: 11,
    flex: 1,
  },
});
