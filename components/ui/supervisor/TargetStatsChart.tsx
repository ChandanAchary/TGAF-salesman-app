import React from "react";
import { StyleSheet, Text, View, TouchableOpacity, Image } from "react-native";
import { Entypo, MaterialIcons, Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import * as Haptics from 'expo-haptics';
import { PieChart } from "react-native-gifted-charts";

interface RouteCustomer {
  id: string;
  tenantId: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string | null;
  updatedBy: string | null;
  routeId: string;
  customerId: string;
}

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
  RouteCustomer: RouteCustomer[];
}

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
}

interface TargetProps {
  target: Target | null;
}

export default function TargetStatsChart({ target }: TargetProps) {
  const router = useRouter();

  if (!target) {
    return (
      <View style={styles.emptyContainer}>
        <View style={styles.emptyContent}>
          <MaterialIcons name="error-outline" size={32} color="#64748B" />
          <Text style={styles.emptyTitle}>No Target Data</Text>
          <Text style={styles.emptySubtitle}>No target information available for this period</Text>
          <TouchableOpacity
            style={styles.exploreButton}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              router.push(`/screens/route/myoutlet`);
            }}
          >
            <Ionicons name="location" size={18} color="white" />
            <Text style={styles.exploreButtonText}>Explore Outlets</Text>
            <Entypo name="chevron-right" size={18} color="white" />
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const progress = target.target > 0
    ? Math.min(100, Math.round((target.actual / target.target) * 100))
    : 0;

  const progressColor = progress >= 75 ? "#10B981" : progress >= 50 ? "#F59E0B" : "#EF4444";
  const customersCount = target.route?.RouteCustomer?.length || 0;

  const pieData = [
    { value: progress, color: progressColor },
    { value: 100 - progress, color: 'rgba(0,0,0,0.05)' }
  ];

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={styles.chartSection}>
          <PieChart
            donut
            innerRadius={40}
            radius={60}
            data={pieData}
            centerLabelComponent={() => (
              <View style={styles.centerLabel}>
                <Text style={styles.progressText}>{progress}%</Text>
                <Text style={styles.progressLabelText}>Achieved</Text>
              </View>
            )}
          />
          <View style={styles.targetBadge}>
            <Text style={styles.targetBadgeText}>
              {target.actual} / {target.target}
            </Text>
          </View>
        </View>

        <View style={styles.detailsSection}>
          <View style={styles.routeInfo}>
            <View style={styles.iconContainer}>
              <Ionicons name="location" size={16} color="#3B82F6" />
            </View>
            <Text style={styles.routeName} numberOfLines={1}>
              {target.route.name}
            </Text>
          </View>

          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{customersCount}</Text>
              <Text style={styles.statLabel}>Total Outlets</Text>
            </View>
            <View style={styles.imageContainer}>
              <Image
                source={require("@/assets/images/shop-icon.png")}
                style={{ width: 32, height: 32 }}
              />
            </View>
          </View>

          {/* <TouchableOpacity
            style={styles.detailsButton}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              router.push(`/screens/route/myroute?id=${target.route?.id || ''}`);
            }}
          >
            <Text style={styles.detailsButtonText}>View Beat</Text>
            <ArrowCircleRight size={20} weight="fill" color={primary} />
          </TouchableOpacity> */}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    // padding: 16, // Removed padding to fit better in the grid
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 24,
    flexDirection: 'row',
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.05,
    shadowRadius: 20,
    elevation: 5,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.5)',
  },
  chartSection: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingRight: 20,
    borderRightWidth: 1,
    borderRightColor: 'rgba(0,0,0,0.05)',
  },
  centerLabel: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressText: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1E293B',
  },
  progressLabelText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  targetBadge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginTop: 12,
  },
  targetBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
  },
  detailsSection: {
    flex: 1,
    paddingLeft: 20,
    justifyContent: 'space-between',
  },
  routeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconContainer: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  routeName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
    marginLeft: 10,
    flex: 1,
  },
  statsRow: {
    flexDirection: 'row',
    marginBottom: 16,
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 12,
  },
  statBox: {
    flex: 1,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '500',
  },
  imageContainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  detailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F0F9FF',
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  detailsButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0284C7',
  },
  emptyContainer: {
    // padding: 16,
  },
  emptyContent: {
    backgroundColor: 'white',
    borderRadius: 24,
    padding: 30,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.05,
    shadowRadius: 20,
    elevation: 5,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.5)',
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 6,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  exploreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3B82F6',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 24,
    width: '100%',
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  exploreButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    marginHorizontal: 8,
  },
});