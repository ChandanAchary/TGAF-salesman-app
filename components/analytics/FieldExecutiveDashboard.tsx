import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { DashboardData } from "../../lib/types/analytics";
import SummaryCard from "./SummaryCard";
import TrendChart from "./TrendChart";
import TeamPerformanceList from "./TeamPerformanceList";
import LeaderboardCard from "./LeaderboardCard";
import AlertsPanel from "./AlertsPanel";
import QuickActions from "./QuickActions";
import TargetAchievement from "./TargetAchievement";
import { useAppTheme, Theme } from "@/constants/Theme";

interface FieldExecutiveDashboardProps {
  data: DashboardData;
  loading?: boolean;
}

export default function FieldExecutiveDashboard({
  data,
  loading = false,
}: FieldExecutiveDashboardProps) {
  const { colors } = useAppTheme();

  return (
    <View style={styles.container}>
      {/* 1. Alerts Section */}
      {!loading && data?.alerts && <AlertsPanel alerts={data.alerts} />}

      {/* 2. Team Summary Grid */}
      <Text style={[styles.sectionTitle, { color: colors.text.secondary }]}>
        Team Performance Summary
      </Text>
      <View style={styles.row}>
        <SummaryCard
          title="Team Sales"
          metric={data?.summary?.sales}
          iconName="cart-outline"
          iconColor="#3B82F6"
          loading={loading}
        />
        <SummaryCard
          title="Team Collections"
          metric={data?.summary?.collection}
          iconName="cash-outline"
          iconColor="#10B981"
          loading={loading}
        />
      </View>
      
      <View style={styles.row}>
        <SummaryCard
          title="Visits Completed"
          metric={data?.summary?.retailersVisited}
          iconName="walk-outline"
          iconColor="#F59E0B"
          loading={loading}
        />
        <SummaryCard
          title="Target Achieved"
          metric={data?.summary?.targetAchievement}
          iconName="ribbon-outline"
          iconColor="#8B5CF6"
          loading={loading}
        />
      </View>

      {/* 3. Target Achievement Progress ring */}
      {!loading && data?.summary?.targetAchievement && (
        <TargetAchievement
          targetPercent={parseFloat(String(data.summary.targetAchievement.value))}
          salesValue={String(data.summary.sales.value)}
        />
      )}

      {/* 4. Team Sales curves */}
      {!loading && data?.charts && (
        <TrendChart
          title="Daily Sales Volume"
          data={data.charts.salesTrend}
          type="line"
          lineColor="#3B82F6"
          iconName="trending-up"
        />
      )}

      {/* 5. Salesman Performance List */}
      {!loading && data?.team && <TeamPerformanceList team={data.team} />}

      {/* 6. Team Leaderboard */}
      {!loading && data?.team && <LeaderboardCard team={data.team} />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: 24,
  },
  sectionTitle: {
    fontFamily: Theme.typography.fontFamily.semiBold,
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginTop: 18,
    marginBottom: 10,
    paddingLeft: 8,
    borderLeftWidth: 3,
    borderLeftColor: Theme.colors.primary,
  },
  row: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 12,
  },
});
