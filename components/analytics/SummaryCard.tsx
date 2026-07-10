import React from "react";
import { StyleSheet, Text, View, ActivityIndicator, TouchableOpacity } from "react-native";
import { SummaryMetric } from "../../lib/types/analytics";
import { useAppTheme, Theme } from "@/constants/Theme";
import { Ionicons } from "@expo/vector-icons";

interface SummaryCardProps {
  title: string;
  metric?: SummaryMetric;
  iconName: keyof typeof Ionicons.glyphMap;
  iconColor?: string;
  loading?: boolean;
  onPress?: () => void;
}

export default function SummaryCard({
  title,
  metric,
  iconName,
  iconColor,
  loading = false,
  onPress,
}: SummaryCardProps) {
  const { colors, mode } = useAppTheme();
  const isDark = mode === "dark";

  if (loading) {
    return (
      <View
        style={[
          styles.card,
          {
            backgroundColor: colors.surface,
            borderColor: colors.border,
            borderWidth: isDark ? 1 : 0,
          },
        ]}
      >
        <View style={styles.headerRow}>
          <View style={[styles.skeletonText, { backgroundColor: isDark ? "#334155" : "#E2E8F0", width: 80 }]} />
          <ActivityIndicator size="small" color={colors.primary} />
        </View>
        <View style={[styles.skeletonText, { backgroundColor: isDark ? "#334155" : "#E2E8F0", width: 100, height: 24, marginTop: 8 }]} />
      </View>
    );
  }

  if (!metric) {
    return (
      <View
        style={[
          styles.card,
          {
            backgroundColor: colors.surface,
            borderColor: colors.border,
            borderWidth: isDark ? 1 : 0,
          },
        ]}
      >
        <Text style={[styles.title, { color: colors.text.secondary }]}>{title}</Text>
        <Text style={[styles.emptyValue, { color: colors.text.muted }]}>--</Text>
      </View>
    );
  }

  const isUp = metric.trend === "up";
  const isDown = metric.trend === "down";
  const growthColor = isUp ? "#10B981" : isDown ? "#EF4444" : colors.text.secondary;
  const growthBg = isUp ? (isDark ? "rgba(16, 185, 129, 0.15)" : "#E6FBF3") : isDown ? (isDark ? "rgba(239, 68, 68, 0.15)" : "#FDF2F2") : (isDark ? "#334155" : "#F1F5F9");

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={!onPress || loading}
      activeOpacity={0.8}
      style={[
        styles.card,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
          borderWidth: isDark ? 1 : 0,
        },
      ]}
    >
      <View style={styles.headerRow}>
        <Text style={[styles.title, { color: colors.text.secondary }]} numberOfLines={1}>
          {title}
        </Text>
        <View
          style={[
            styles.iconWrapper,
            { backgroundColor: iconColor ? `${iconColor}15` : `${colors.primary}15` },
          ]}
        >
          <Ionicons name={iconName} size={18} color={iconColor || colors.primary} />
        </View>
      </View>

      <Text style={[styles.value, { color: colors.text.primary }]} numberOfLines={1}>
        {metric.value}
      </Text>

      {metric.growth !== 0 && (
        <View style={[styles.trendRow, { backgroundColor: growthBg }]}>
          <Ionicons
            name={isUp ? "trending-up" : isDown ? "trending-down" : "remove"}
            size={12}
            color={growthColor}
          />
          <Text style={[styles.growthText, { color: growthColor }]}>
            {Math.abs(metric.growth)}%
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minWidth: "46%",
    padding: 14,
    borderRadius: 12,
    elevation: 2,
    shadowColor: "#aaa",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    justifyContent: "space-between",
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
    gap: 4,
  },
  title: {
    fontFamily: Theme.typography.fontFamily.semiBold,
    fontSize: 12,
    flex: 1,
  },
  iconWrapper: {
    padding: 6,
    borderRadius: 8,
  },
  value: {
    fontFamily: Theme.typography.fontFamily.bold,
    fontSize: 18,
    marginBottom: 6,
  },
  emptyValue: {
    fontSize: 18,
    fontWeight: "700",
  },
  trendRow: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    gap: 2,
  },
  growthText: {
    fontFamily: Theme.typography.fontFamily.bold,
    fontSize: 10,
  },
  skeletonText: {
    height: 12,
    borderRadius: 4,
  },
});
