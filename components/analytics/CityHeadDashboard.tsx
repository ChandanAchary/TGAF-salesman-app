import React, { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { DashboardData } from "../../lib/types/analytics";
import SummaryCard from "./SummaryCard";
import TrendChart from "./TrendChart";
import TargetAchievement from "./TargetAchievement";
import LeaderboardCard from "./LeaderboardCard";
import ProductList from "./ProductList";
import ActiveStaffModal from "./ActiveStaffModal";
import { useAppTheme, Theme } from "@/constants/Theme";
import { formatPrice } from "../../lib/formatters/formatter";

interface CityHeadDashboardProps {
  data: DashboardData;
  loading?: boolean;
}

export default function CityHeadDashboard({ data, loading = false }: CityHeadDashboardProps) {
  const { colors } = useAppTheme();
  const [activeStaffModalVisible, setActiveStaffModalVisible] = useState(false);

  // 1. Resolve values safely
  const salesVal = data?.summary?.sales?.value ?? 0;
  const targetAchievementMetric = data?.summary?.targetAchievement;
  const activeStaffMetric = data?.summary?.workingEmployees;

  // Format attendance count as string to prevent React Native rendering glitches
  const activeStaffValue = activeStaffMetric ? String(activeStaffMetric.value) : "0";

  // Calculate target percent for the progress ring
  const targetPercent = targetAchievementMetric 
    ? parseFloat(String(targetAchievementMetric.value)) 
    : 0;

  return (
    <View style={styles.container}>
      {/* SECTION 1: Regional Business Summary */}
      <View style={styles.sectionHeader}>
        <View style={[styles.sectionIndicator, { backgroundColor: colors.primary }]} />
        <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>
          Regional Business Summary
        </Text>
      </View>
      
      <View style={styles.row}>
        {/* Today's Sales (Live) */}
        <SummaryCard
          title="Today's Sales"
          metric={{
            value: typeof salesVal === "number" ? formatPrice(salesVal) : salesVal,
            growth: data?.summary?.sales?.growth ?? 0,
            trend: data?.summary?.sales?.trend ?? "flat"
          }}
          iconName="cart-outline"
          iconColor="#3B82F6"
          loading={loading}
        />

        {/* Today's Collections (API Pending) */}
        <SummaryCard
          title="Today's Collection"
          metric={data?.summary?.collection}
          iconName="cash-outline"
          iconColor="#10B981"
          loading={loading}
        />
      </View>
      
      <View style={styles.row}>
        {/* Credit Exposure (Outstanding) (API Pending) */}
        <SummaryCard
          title="Outstanding Credit"
          metric={data?.summary?.outstanding}
          iconName="alert-circle-outline"
          iconColor="#EF4444"
          loading={loading}
        />

        {/* Active Staff (Working Employees) (Live) */}
        <SummaryCard
          title="Active Staff"
          metric={{
            value: activeStaffValue,
            growth: activeStaffMetric?.growth ?? 0,
            trend: activeStaffMetric?.trend ?? "flat"
          }}
          iconName="people-outline"
          iconColor="#8B5CF6"
          loading={loading}
          onPress={() => setActiveStaffModalVisible(true)}
        />
      </View>

      {/* SECTION 2: Target Progress Progress Ring */}
      <View style={styles.sectionHeader}>
        <View style={[styles.sectionIndicator, { backgroundColor: "#FFB020" }]} />
        <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>
          Target Achievement
        </Text>
      </View>
      {!loading && targetAchievementMetric && (
        <TargetAchievement
          targetPercent={targetPercent}
          salesValue={typeof salesVal === "number" ? formatPrice(salesVal) : String(salesVal)}
        />
      )}

      {/* SECTION 3: Territory Sales Trend Curve */}
      <View style={styles.sectionHeader}>
        <View style={[styles.sectionIndicator, { backgroundColor: "#3B82F6" }]} />
        <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>
          Sales Velocity
        </Text>
      </View>
      {!loading && data?.charts?.salesTrend && (
        <TrendChart
          title="Monthly Sales Trend"
          data={data.charts.salesTrend}
          type="line"
          lineColor="#3B82F6"
          iconName="trending-up"
        />
      )}

      {/* SECTION 4: Top Teams & Supervisors Leaderboard */}
      <View style={styles.sectionHeader}>
        <View style={[styles.sectionIndicator, { backgroundColor: "#10B981" }]} />
        <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>
          Top Performers
        </Text>
      </View>
      {!loading && data?.team && (
        <LeaderboardCard team={data.team} />
      )}

      {/* SECTION 5: Slow-Moving & Top Product Quantities */}
      <View style={styles.sectionHeader}>
        <View style={[styles.sectionIndicator, { backgroundColor: "#8B5CF6" }]} />
        <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>
          Product Performance
        </Text>
      </View>
      {!loading && data?.products && (
        <ProductList products={data.products} />
      )}

      <ActiveStaffModal
        visible={activeStaffModalVisible}
        onClose={() => setActiveStaffModalVisible(false)}
        staffList={data?.team || []}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: 32,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 24,
    marginBottom: 12,
    paddingHorizontal: 4,
    gap: 8,
  },
  sectionIndicator: {
    width: 4,
    height: 16,
    borderRadius: 2,
  },
  sectionTitle: {
    fontFamily: Theme.typography.fontFamily.semiBold,
    fontSize: 14,
    letterSpacing: 0.15,
  },
  row: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 12,
  },
});
