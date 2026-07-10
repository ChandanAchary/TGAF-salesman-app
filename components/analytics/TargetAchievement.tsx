import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { SummaryMetric } from "../../lib/types/analytics";
import { useAppTheme, Theme } from "@/constants/Theme";
import { PieChart } from "react-native-gifted-charts";
import { Ionicons } from "@expo/vector-icons";

interface TargetAchievementProps {
  targetPercent: number; // e.g. 78
  salesValue: string; // e.g. "₦4,850,000"
}

export default function TargetAchievement({
  targetPercent,
  salesValue,
}: TargetAchievementProps) {
  const { colors, mode } = useAppTheme();
  const isDark = mode === "dark";

  // Sanitize percentage to prevent chart library crashes (e.g. negative numbers or NaN)
  const sanitizedPercent = isNaN(targetPercent) 
    ? 0 
    : Math.max(0, Math.min(100, targetPercent));

  const chartData = [
    { value: sanitizedPercent, color: colors.primary },
    { value: Math.max(100 - sanitizedPercent, 0), color: isDark ? "#334155" : "#E2E8F0" },
  ];

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
      <View style={styles.header}>
        <View style={[styles.iconWrapper, { backgroundColor: `${colors.primary}15` }]}>
          <Ionicons name="ribbon-outline" size={16} color={colors.primary} />
        </View>
        <Text style={[styles.title, { color: colors.text.primary }]}>Target Achievement</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.chartWrapper}>
          <PieChart
            data={chartData}
            donut
            radius={55}
            innerRadius={43}
            centerLabelComponent={() => (
              <View style={styles.centerLabel}>
                <Text style={[styles.centerText, { color: colors.text.primary }]}>
                  {targetPercent}%
                </Text>
                <Text style={styles.centerSubtext}>Achieved</Text>
              </View>
            )}
          />
        </View>

        <View style={styles.details}>
          <View style={styles.row}>
            <View style={[styles.dot, { backgroundColor: colors.primary }]} />
            <View>
              <Text style={[styles.label, { color: colors.text.secondary }]}>Current Achieved</Text>
              <Text style={[styles.value, { color: colors.text.primary }]}>{salesValue}</Text>
            </View>
          </View>
          <View style={styles.row}>
            <View style={[styles.dot, { backgroundColor: isDark ? "#334155" : "#E2E8F0" }]} />
            <View>
              <Text style={[styles.label, { color: colors.text.secondary }]}>Target Completion</Text>
              <Text style={[styles.value, { color: colors.text.primary }]}>₦6,000,000</Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: "#aaa",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    marginBottom: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
  },
  iconWrapper: {
    padding: 6,
    borderRadius: 8,
  },
  title: {
    fontFamily: Theme.typography.fontFamily.semiBold,
    fontSize: 12,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    gap: 24,
  },
  chartWrapper: {
    position: "relative",
    width: 110,
    height: 110,
    alignItems: "center",
    justifyContent: "center",
  },
  centerLabel: {
    justifyContent: "center",
    alignItems: "center",
  },
  centerText: {
    fontSize: 15,
    fontFamily: Theme.typography.fontFamily.bold,
  },
  centerSubtext: {
    fontSize: 8,
    color: "#64748B",
    marginTop: -2,
  },
  details: {
    flex: 1,
    gap: 12,
  },
  row: {
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  label: {
    fontSize: 9,
  },
  value: {
    fontFamily: Theme.typography.fontFamily.bold,
    fontSize: 12,
    marginTop: 1,
  },
});
