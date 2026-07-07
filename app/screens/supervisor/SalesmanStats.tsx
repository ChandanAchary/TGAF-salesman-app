import TabBar from "@/components/ui/layout/TabBar";
import TargetStatsChart from "@/components/ui/supervisor/TargetStatsChart";
import Pfp from "@/components/lazy/Pfp";
import { API_ROUTES } from "@/constants/ApiRoutes";
import { primary, secondary } from "@/constants/Colors";
import { api } from "@/lib/axios/axios";
import { Response } from "@/lib/types/types";
import { salesmanType } from "@/shared/zod";
import { useQuery } from "@tanstack/react-query";
import { useLocalSearchParams } from "expo-router/build/hooks";
import { useMemo, useState } from "react";
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, Text, View, useWindowDimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { BarChart, LineChart, PieChart } from "react-native-gifted-charts";
import { Ionicons, MaterialIcons, FontAwesome5 } from "@expo/vector-icons";

interface Target {
  id: string;
  tenantId: string;
  salesmanId: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string | null;
  updatedBy: string | null;
  routeId: string;
  date: Date;
  target: number;
  actual: number;
  route: Route;
};

interface Route {
  id: string;
  tenantId: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string | null;
  updatedBy: string | null;
  name: string;
  hierarchyItemId: string;
  RouteCustomer: {
    id: string;
    tenantId: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    createdBy: string | null;
    updatedBy: string | null;
    routeId: string;
    customerId: string;
  }[];
};

interface Attendance {
  id: string;
  tenantId: string;
  salesmanId: string;
  checkInTime: Date;
  checkOutTime: Date | null;
  startPoint: string;
  selfieUrl: string;
  oddometerUrl: string | null;
  updatedBy: string | null;
}

interface Salesman {
  name: string;
  id: string;
  tenantId: string;
  phone: string;
  virified: boolean;
  password: string;
  bank: string;
  bvnNumber: string;
  address: string;
  addressProof: string;
  avatar: string | null;
  hierarchyItemId: string;
  salesmanType: salesmanType;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string | null;
  updatedBy: string | null;
}

interface SalesmanStatsResponse extends Response {
  data: {
    salesman: Salesman;
    stats: {
      target: Target;
      attendance: Attendance[];
    }
  }
}

function SalesmanProfileCard({ salesman }: { salesman: Salesman }) {
  return (
    <View style={styles.card}>
      <View style={styles.profileHeader}>
        <Pfp src={salesman.avatar} alt={salesman.name} size={72} />
        <View style={styles.profileInfo}>
          <Text style={styles.profileName} numberOfLines={1}>{salesman.name}</Text>
          <Text style={styles.profileType}>{salesman.salesmanType}</Text>
          <View style={styles.statusRow}>
            <View style={[styles.statusBadge, { backgroundColor: salesman.isActive ? '#D1FAE5' : '#FEE2E2' }]}>
              <View style={[styles.statusDot, { backgroundColor: salesman.isActive ? '#10B981' : '#EF4444' }]} />
              <Text style={[styles.statusText, { color: salesman.isActive ? '#047857' : '#B91C1C' }]}>
                {salesman.isActive ? 'Active' : 'Inactive'}
              </Text>
            </View>
            {salesman.virified && (
              <View style={styles.verifiedBadge}>
                <MaterialIcons name="verified" size={14} color="#3B82F6" />
                <Text style={styles.verifiedText}>Verified</Text>
              </View>
            )}
          </View>
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.detailGrid}>
        <View style={styles.detailItem}>
          <View style={[styles.iconContainer, { backgroundColor: '#EFF6FF' }]}>
            <Ionicons name="call" size={16} color="#3B82F6" />
          </View>
          <View style={styles.detailText}>
            <Text style={styles.detailLabel}>Phone</Text>
            <Text style={styles.detailValue} numberOfLines={1}>{salesman.phone || 'N/A'}</Text>
          </View>
        </View>

        <View style={styles.detailItem}>
          <View style={[styles.iconContainer, { backgroundColor: '#F0FDF4' }]}>
            <Ionicons name="location" size={16} color="#10B981" />
          </View>
          <View style={styles.detailText}>
            <Text style={styles.detailLabel}>Address</Text>
            <Text style={styles.detailValue} numberOfLines={1}>{salesman.address || 'N/A'}</Text>
          </View>
        </View>

        <View style={styles.detailItem}>
          <View style={[styles.iconContainer, { backgroundColor: '#FFFBEB' }]}>
            <FontAwesome5 name="university" size={14} color="#F59E0B" />
          </View>
          <View style={styles.detailText}>
            <Text style={styles.detailLabel}>Bank</Text>
            <Text style={styles.detailValue} numberOfLines={1}>{salesman.bank || 'N/A'}</Text>
          </View>
        </View>

        <View style={styles.detailItem}>
          <View style={[styles.iconContainer, { backgroundColor: '#F5F3FF' }]}>
            <Ionicons name="card" size={16} color="#8B5CF6" />
          </View>
          <View style={styles.detailText}>
            <Text style={styles.detailLabel}>BVN</Text>
            <Text style={styles.detailValue} numberOfLines={1}>{salesman.bvnNumber || 'N/A'}</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

function TargetComparisonChart({ target, actual }: { target: number; actual: number }) {
  const data = [
    { value: target, label: 'Target', frontColor: '#3B82F6' },
    { value: actual, label: 'Actual', frontColor: actual >= target ? '#10B981' : '#F59E0B' },
  ];

  const maxValue = Math.max(target, actual, 1);

  return (
    <View style={styles.card}>
      <View style={styles.chartCardHeader}>
        <View style={[styles.iconContainer, { backgroundColor: '#EFF6FF' }]}>
          <Ionicons name="stats-chart" size={18} color="#3B82F6" />
        </View>
        <Text style={styles.chartCardTitle}>Target vs Actual</Text>
      </View>
      <View style={styles.barChartContainer}>
        <BarChart
          data={data}
          width={220}
          height={140}
          maxValue={maxValue}
          barWidth={36}
          spacing={32}
          barBorderRadius={8}
          hideRules
          yAxisThickness={0}
          xAxisThickness={1}
          xAxisColor="#E2E8F0"
          yAxisTextStyle={{ color: '#64748B', fontSize: 10 }}
          xAxisLabelTextStyle={{ color: '#475569', fontSize: 12, fontWeight: '600' }}
          noOfSections={4}
          isAnimated
          showFractionalValues={false}
        />
      </View>
      <View style={styles.targetSummaryRow}>
        <View style={styles.targetSummaryItem}>
          <Text style={styles.targetSummaryValue}>{target}</Text>
          <Text style={styles.targetSummaryLabel}>Target</Text>
        </View>
        <View style={styles.targetSummaryDivider} />
        <View style={styles.targetSummaryItem}>
          <Text style={[styles.targetSummaryValue, { color: actual >= target ? '#10B981' : '#F59E0B' }]}>{actual}</Text>
          <Text style={styles.targetSummaryLabel}>Actual</Text>
        </View>
        <View style={styles.targetSummaryDivider} />
        <View style={styles.targetSummaryItem}>
          <Text style={[styles.targetSummaryValue, { color: target > 0 && (actual / target) >= 1 ? '#10B981' : '#3B82F6' }]}>
            {target > 0 ? Math.round((actual / target) * 100) : 0}%
          </Text>
          <Text style={styles.targetSummaryLabel}>Achieved</Text>
        </View>
      </View>
    </View>
  );
}

function AttendanceInsights({ attendance }: { attendance: Attendance[] }) {
  const { width: screenWidth } = useWindowDimensions();
  const chartWidth = screenWidth - 72;
  const { totalCheckIns, activeSessions, lastSevenDaysData, avgHours } = useMemo(() => {
    const total = attendance.length;
    const active = attendance.filter(a => !a.checkOutTime).length;

    const hoursList = attendance
      .filter(a => a.checkOutTime)
      .map(a => {
        const checkIn = new Date(a.checkInTime).getTime();
        const checkOut = new Date(a.checkOutTime!).getTime();
        return (checkOut - checkIn) / (1000 * 60 * 60);
      });
    const avg = hoursList.length > 0
      ? Math.round(hoursList.reduce((a, b) => a + b, 0) / hoursList.length)
      : 0;

    const today = new Date();
    const lastSeven = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(today);
      d.setDate(d.getDate() - (6 - i));
      return d.toISOString().split('T')[0];
    });

    const countsByDate = attendance.reduce<Record<string, number>>((acc, curr) => {
      const date = new Date(curr.checkInTime).toISOString().split('T')[0];
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {});

    const chartData = lastSeven.map(date => ({
      value: countsByDate[date] || 0,
      label: date.slice(5),
    }));

    return { totalCheckIns: total, activeSessions: active, lastSevenDaysData: chartData, avgHours: avg };
  }, [attendance]);

  const pieData = [
    { value: activeSessions, color: '#10B981' },
    { value: Math.max(0, totalCheckIns - activeSessions), color: '#CBD5E1' },
  ];

  return (
    <View style={styles.card}>
      <View style={styles.chartCardHeader}>
        <View style={[styles.iconContainer, { backgroundColor: '#F0FDF4' }]}>
          <Ionicons name="time" size={18} color="#10B981" />
        </View>
        <Text style={styles.chartCardTitle}>Attendance Insights</Text>
      </View>

      <View style={styles.attendanceStatsRow}>
        <View style={styles.attendanceStatBox}>
          <Text style={styles.attendanceStatValue}>{totalCheckIns}</Text>
          <Text style={styles.attendanceStatLabel}>Total Check-ins</Text>
        </View>
        <View style={styles.attendanceStatBox}>
          <Text style={[styles.attendanceStatValue, { color: '#10B981' }]}>{activeSessions}</Text>
          <Text style={styles.attendanceStatLabel}>Active Now</Text>
        </View>
        <View style={styles.attendanceStatBox}>
          <Text style={styles.attendanceStatValue}>{avgHours}h</Text>
          <Text style={styles.attendanceStatLabel}>Avg Duration</Text>
        </View>
      </View>

      <View style={styles.lineChartWrapper}>
        <Text style={styles.miniChartTitle}>Last 7 Days</Text>
        <LineChart
          data={lastSevenDaysData}
          width={chartWidth - 24}
          height={100}
          spacing={28}
          initialSpacing={8}
          endSpacing={8}
          color="#3B82F6"
          thickness={3}
          hideDataPoints={false}
          dataPointsColor="#3B82F6"
          dataPointsRadius={4}
          hideRules
          yAxisThickness={0}
          xAxisThickness={1}
          xAxisColor="#E2E8F0"
          yAxisTextStyle={{ color: '#64748B', fontSize: 9 }}
          xAxisLabelTextStyle={{ color: '#64748B', fontSize: 8 }}
          noOfSections={3}
          maxValue={Math.max(...lastSevenDaysData.map(d => d.value), 5)}
        />
      </View>

      <View style={styles.pieChartWrapper}>
        <Text style={styles.miniChartTitle}>Active vs Completed</Text>
        <View style={{ alignItems: 'center', marginTop: 8 }}>
          <PieChart
            donut
            innerRadius={28}
            radius={40}
            data={pieData}
            centerLabelComponent={() => (
              <Text style={styles.pieCenterText}>{activeSessions}</Text>
            )}
          />
        </View>
        <View style={styles.pieLegend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#10B981' }]} />
            <Text style={styles.legendText}>Active</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#CBD5E1' }]} />
            <Text style={styles.legendText}>Completed</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

export default function SalesmanStats() {

  const { salesmanId } = useLocalSearchParams();
  const [refreshing, setRefreshing] = useState(false);

  const SalesmanStastsQuery = useQuery({
    queryKey: ["salesmanStats", salesmanId],
    queryFn: async () => {
      const res = await api.get<SalesmanStatsResponse>(API_ROUTES.SUPERVISOR.GET_SALESMAN_STATS(salesmanId as string));
      return res.data;
    }
  })

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await SalesmanStastsQuery.refetch();
    } finally {
      setRefreshing(false);
    }
  };

  if (!salesmanId) {
    return (
      <view>
        Salesman ID is missing. Please provide a valid salesman ID in the query parameters.
      </view>
    )
  }

  const salesman = SalesmanStastsQuery.data?.data.salesman;
  const target = SalesmanStastsQuery.data?.data.stats.target;
  const attendance = SalesmanStastsQuery.data?.data.stats.attendance;

  return (
    <SafeAreaView style={styles.container}>
      <TabBar title="Salesman Stats" />

      {/* Content */}
      {SalesmanStastsQuery.isFetching && !refreshing ? (
        <View style={styles.loader}>
          <ActivityIndicator size="large" color={primary} />
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={primary}
            />
          }
        >
          {SalesmanStastsQuery.data ? (
            <View style={{ gap: 20 }}>
              {salesman && <SalesmanProfileCard salesman={salesman} />}

              {target && (
                <>
                  <TargetStatsChart target={target} />
                  <TargetComparisonChart target={target.target} actual={target.actual} />
                </>
              )}

              {attendance && <AttendanceInsights attendance={attendance} />}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No stats available for this salesman.</Text>
            </View>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: secondary,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContainer: {
    padding: 16,
    paddingBottom: 24,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#9CA3AF',
    marginTop: 16,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 24,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.05,
    shadowRadius: 20,
    elevation: 5,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.5)',
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileInfo: {
    flex: 1,
    marginLeft: 16,
  },
  profileName: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1E293B',
  },
  profileType: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '600',
    textTransform: 'capitalize',
    marginTop: 2,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    gap: 10,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  verifiedText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#3B82F6',
    marginLeft: 4,
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 18,
  },
  detailGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '47%',
  },
  iconContainer: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailText: {
    marginLeft: 10,
    flex: 1,
  },
  detailLabel: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 13,
    color: '#1E293B',
    fontWeight: '700',
    marginTop: 1,
  },
  chartCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  chartCardTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#1E293B',
    marginLeft: 12,
  },
  barChartContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  targetSummaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    paddingVertical: 14,
  },
  targetSummaryItem: {
    alignItems: 'center',
  },
  targetSummaryValue: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1E293B',
  },
  targetSummaryLabel: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
    marginTop: 2,
  },
  targetSummaryDivider: {
    width: 1,
    height: 30,
    backgroundColor: '#E2E8F0',
  },
  attendanceStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 18,
  },
  attendanceStatBox: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    paddingVertical: 14,
    marginHorizontal: 4,
  },
  attendanceStatValue: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1E293B',
  },
  attendanceStatLabel: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
    marginTop: 4,
  },
  lineChartWrapper: {
    backgroundColor: '#FAFAFA',
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
    overflow: 'hidden',
  },
  pieChartWrapper: {
    backgroundColor: '#FAFAFA',
    borderRadius: 16,
    padding: 12,
    alignItems: 'center',
    overflow: 'hidden',
  },
  miniChartTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
    marginBottom: 4,
  },
  pieCenterText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1E293B',
  },
  pieLegend: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 10,
    gap: 10,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 4,
  },
  legendText: {
    fontSize: 10,
    color: '#64748B',
    fontWeight: '500',
  },
});
