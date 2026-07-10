import { StyleSheet, Text, View, Image } from "react-native";
import { PieChart } from "react-native-gifted-charts";
import { ShoppingCartSimple, TrendUp, Target } from "phosphor-react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/axios/axios";
import { API_ROUTES } from "@/constants/ApiRoutes";
import { Response } from "@/lib/types/types";
import { useAppTheme } from "@/constants/Theme";

interface OutletStatsResponse extends Response {
  data: {
    effectiveCalls: number;
    totalOutletsAssigned: number;
    totalOutletsVisited: number;
    totalCollectionDone: number;
  }
}

export default function OutletChart() {
  const { colors, mode } = useAppTheme();
  const isDark = mode === 'dark';

  const outletStats = useQuery({
    queryKey: ["outletstats"],
    queryFn: async () => {
      const res = await api.get<OutletStatsResponse>(API_ROUTES.ROUTE.GET_ALL_OUTLET_STATS);
      return res.data;
    }
  });

  // Loading state
  if (outletStats.isLoading) {
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={isDark ? [colors.surface, colors.surface] : ['#ffffff', '#f8fafc']}
          style={[styles.card, { height: 140, justifyContent: 'center', alignItems: 'center', borderColor: colors.border }]}
        >
          <Text style={[styles.loadingText, { color: colors.text.secondary }]}>Loading Stats...</Text>
        </LinearGradient>
      </View>
    );
  }

  // Error state
  if (outletStats.isError || !outletStats.data) {
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={isDark ? [colors.surface, colors.surface] : ['#FFF1F2', '#FFE4E6']}
          style={[styles.card, { height: 140, justifyContent: 'center', alignItems: 'center', borderColor: colors.border }]}
        >
          <Text style={styles.errorText}>Unable to load stats</Text>
        </LinearGradient>
      </View>
    );
  }

  const stats = outletStats.data?.data || {};

  // Defensive fallback for all stats
  const effectiveCalls = stats && typeof stats.effectiveCalls === "number" ? stats.effectiveCalls : 0;
  const totalOutletsAssigned = stats && typeof stats.totalOutletsAssigned === "number" ? stats.totalOutletsAssigned : 0;
  const totalOutletsVisited = stats && typeof stats.totalOutletsVisited === "number" ? stats.totalOutletsVisited : 0;
  const totalCollectionDone = stats && typeof stats.totalCollectionDone === "number" ? stats.totalCollectionDone : 0;

  // Calculate progress (visited/assigned)
  const progress = totalOutletsAssigned > 0
    ? Math.round((totalOutletsVisited / totalOutletsAssigned) * 100)
    : 0;

  // Dynamic colors based on progress
  const progressColor = progress >= 75 ? "#10B981" : progress >= 50 ? "#F59E0B" : "#EF4444";
  const progressGradient = progress >= 75
    ? ['#34D399', '#059669']
    : progress >= 50
      ? ['#FBBF24', '#D97706']
      : ['#F87171', '#DC2626'];

  const pieData = [
    { value: totalOutletsVisited, color: progressColor, gradientCenterColor: progressGradient[1] },
    { value: Math.max(0, totalOutletsAssigned - totalOutletsVisited), color: isDark ? '#334155' : '#E2E8F0' },
  ];

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={isDark ? [colors.surface, colors.surface] : ['#FFFFFF', '#F8FAFC']}
        style={[styles.card, { borderColor: colors.border }]}
      >
        {/* Left Section: Stats */}
        <View style={styles.statsSection}>

          {/* Header */}
          <View style={styles.headerRow}>
            <View style={[styles.iconBadge, { backgroundColor: isDark ? 'rgba(99, 102, 241, 0.15)' : '#EEF2FF' }]}>
              <Target size={16} color="#6366F1" weight="fill" />
            </View>
            <Text style={[styles.cardTitle, { color: colors.text.primary }]}>Outlet Performance</Text>
          </View>

          {/* Stats Grid */}
          <View style={styles.statsGrid}>

            {/* Effective Calls Pill */}
            <LinearGradient
              colors={isDark ? ['#1e293b', '#0f172a'] : ['#EFF6FF', '#DBEAFE']}
              style={[styles.statPill, { borderColor: isDark ? colors.border : 'rgba(255,255,255,0.6)' }]}
            >
              <View style={[styles.pillIcon, { backgroundColor: isDark ? '#334155' : '#BFDBFE' }]}>
                <ShoppingCartSimple size={14} color={isDark ? colors.primary : '#2563EB'} weight="fill" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.pillValue, { color: colors.text.primary }]}>{effectiveCalls}</Text>
                <Text style={[styles.pillLabel, { color: colors.text.secondary }]}>Effective</Text>
              </View>
            </LinearGradient>

            {/* Total Value Pill */}
            <LinearGradient
              colors={isDark ? ['#14532d', '#052e16'] : ['#ECFDF5', '#D1FAE5']}
              style={[styles.statPill, { borderColor: isDark ? colors.border : 'rgba(255,255,255,0.6)' }]}
            >
              <View style={[styles.pillIcon, { backgroundColor: isDark ? '#15803d' : '#A7F3D0' }]}>
                <TrendUp size={14} color={isDark ? '#4ade80' : '#059669'} weight="bold" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.pillValue, { color: isDark ? '#4ade80' : '#059669' }]}>
                  {totalCollectionDone >= 1000
                    ? `${(totalCollectionDone / 1000).toFixed(1)}k`
                    : totalCollectionDone}
                </Text>
                <Text style={[styles.pillLabel, { color: isDark ? '#4ade80' : '#047857' }]}>Collected</Text>
              </View>
            </LinearGradient>

          </View>
        </View>

        {/* Right Section: Chart */}
        <View style={[styles.chartSection, { borderLeftColor: colors.border }]}>
          <View style={styles.chartWrapper}>
            <PieChart
              donut
              innerRadius={32}
              radius={42}
              data={pieData}
              centerLabelComponent={() => (
                <View style={styles.centerLabel}>
                  <Text style={[styles.progressText, { color: progressColor }]}>{progress}%</Text>
                </View>
              )}
            />
          </View>
          <View style={[styles.targetBadge, { backgroundColor: isDark ? '#1e293b' : '#F8FAFC', borderColor: colors.border }]}>
            <Text style={[styles.targetBadgeText, { color: colors.text.secondary }]}>
              {totalOutletsVisited} / {totalOutletsAssigned}
            </Text>
          </View>
        </View>

      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    flexDirection: 'row',
    padding: 16,
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.5)',
    alignItems: 'center',
  },
  statsSection: {
    flex: 1,
    paddingRight: 16,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  iconBadge: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#334155',
    letterSpacing: -0.3,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 8,
  },
  statPill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 12,
    gap: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.6)',
  },
  pillIcon: {
    width: 24,
    height: 24,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pillValue: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1E40AF',
    lineHeight: 18,
  },
  pillLabel: {
    fontSize: 8,
    fontWeight: '700',
    color: '#60A5FA',
    textTransform: 'uppercase',
    letterSpacing: 0.2,
  },
  chartSection: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingLeft: 16,
    borderLeftWidth: 1,
    borderLeftColor: '#F1F5F9',
  },
  chartWrapper: {
    position: 'relative',
  },
  centerLabel: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressText: {
    fontSize: 14,
    fontWeight: '900',
  },
  targetBadge: {
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  targetBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
  },
  loadingText: {
    color: '#94A3B8',
    fontSize: 14,
    fontWeight: '500',
  },
  errorText: {
    color: '#F43F5E',
    fontSize: 14,
    fontWeight: '500',
  }
});