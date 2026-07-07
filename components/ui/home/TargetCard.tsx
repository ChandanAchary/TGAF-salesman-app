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

interface TargetProps {
  target: Target | null;
}

import { StyleSheet, Text, View, TouchableOpacity } from "react-native";
import { Entypo, MaterialIcons, FontAwesome, Ionicons } from "@expo/vector-icons";
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from "expo-router";
import * as Haptics from 'expo-haptics';
import { primary } from "@/constants/Colors";

export default function TargetCard(props: TargetProps) {
  const router = useRouter();
  const { target } = props;

  if (!target) {
    return (
      <LinearGradient
        colors={['#F3F4F6', '#E5E7EB']}
        style={[styles.card, styles.noDataCard]}
      >
        <View style={styles.noDataContent}>
          <MaterialIcons name="error-outline" size={28} color="#4B5563" />
          <Text style={styles.noDataText}>No target data available</Text>
          <Text style={styles.noDataSubtext}>Check back later for updates</Text>
          <TouchableOpacity
            style={[styles.routeContainer, { marginTop: 20, backgroundColor: "rgba(0,0,0,0.2)" }]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              router.push(`/screens/route/myoutlet`);
            }}
          >
            <View style={[styles.routeInfo]}>
              <Ionicons name="location" size={18} color="white" />
              <Text style={styles.routeName} numberOfLines={1}>
                Expolre
              </Text>
            </View>
            <View style={styles.routeButton}>
              <Text style={styles.routeButtonText}>Outlets</Text>
              <Entypo name="chevron-right" size={18} color="white" />
            </View>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    );
  }

  const progress = target.target > 0
    ? Math.min(100, (target.actual / target.target) * 100)
    : 0;

  const progressColor = progress >= 75 ? "#10B981" : progress >= 50 ? "#F59E0B" : "#EF4444";
  const gradientColors: string[] = progress >= 75 ? ['#10B981', '#34D399'] :
    progress >= 50 ? ['#F59E0B', '#FBBF24'] :
      ['#EF4444', '#F87171'];

  const customersCount = target.route?.RouteCustomer?.length || 0;
  const formattedDate = target.date ? new Date(target.date).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  }) : "No date";

  return (
    <LinearGradient
      colors={[primary, '#2563EB']}
      style={styles.card}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      {/* Header Section */}
      <View style={styles.header}>
        <View style={styles.headerTextContainer}>
          <Text style={styles.cardSubtitle}>TODAY'S TARGET</Text>
          <Text style={styles.cardTitle}>{formattedDate}</Text>
        </View>
        <View style={[styles.progressIndicator, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
          <MaterialIcons
            name={progress >= 100 ? "celebration" : "show-chart"}
            size={24}
            color="white"
          />
        </View>
      </View>

      {/* Progress Section */}
      <View style={styles.progressContainer}>
        <Text style={styles.progressLabel}>Your progress</Text>
        <View style={styles.progressBarBackground}>
          <LinearGradient
            colors={[gradientColors[0], gradientColors[1]]}
            style={[styles.progressBarFill, { width: `${progress}%` }]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          />
        </View>
        <View style={styles.progressTextContainer}>
          <Text style={styles.progressText}>
            {progress.toFixed(0)}% Completed
          </Text>
          <Text style={styles.progressRatio}>
            {target.actual} / {target.target}
          </Text>
        </View>
      </View>

      {/* Stats Section */}
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <View style={[styles.statIcon, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
            <FontAwesome name="bullseye" size={16} color="white" />
          </View>
          <Text style={styles.statLabel}>Target</Text>
          <Text style={styles.statValue}>{target.target}</Text>
        </View>

        <View style={styles.statItem}>
          <View style={[styles.statIcon, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
            <FontAwesome name="check-circle" size={16} color="white" />
          </View>
          <Text style={styles.statLabel}>Achieved</Text>
          <Text style={styles.statValue}>{target.actual}</Text>
        </View>

        <View style={styles.statItem}>
          <View style={[styles.statIcon, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
            <Ionicons name="people" size={16} color="white" />
          </View>
          <Text style={styles.statLabel}>Customers</Text>
          <Text style={styles.statValue}>{customersCount}</Text>
        </View>
      </View>

      {/* Route Section with Action Button */}
      <TouchableOpacity
        style={styles.routeContainer}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          router.push(`/screens/route/myroute?id=${target.route?.id || ''}`);
        }}
      >
        <View style={styles.routeInfo}>
          <Ionicons name="location" size={18} color="white" />
          <Text style={styles.routeName} numberOfLines={1}>
            {target.route?.name || "All Routes"}
          </Text>
        </View>
        <View style={styles.routeButton}>
          <Text style={styles.routeButtonText}>View Route</Text>
          <Entypo name="chevron-right" size={18} color="white" />
        </View>
      </TouchableOpacity>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 24,
    padding: 24,
    minHeight: 300,
    justifyContent: "space-between",
    overflow: 'hidden',
  },
  noDataCard: {
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 24,
  },
  noDataContent: {
    alignItems: "center",
    padding: 16,
  },
  noDataText: {
    marginTop: 12,
    color: "#1F2937",
    fontSize: 16,
    fontWeight: '600',
  },
  noDataSubtext: {
    color: "#6B7280",
    fontSize: 14,
    marginTop: 4,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  headerTextContainer: {
    flex: 1,
  },
  cardSubtitle: {
    fontWeight: "600",
    fontSize: 14,
    color: "rgba(255,255,255,0.8)",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 4,
  },
  cardTitle: {
    fontWeight: "700",
    fontSize: 22,
    color: "white",
  },
  progressIndicator: {
    borderRadius: 12,
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressContainer: {
    marginBottom: 24,
  },
  progressLabel: {
    fontSize: 14,
    color: "rgba(255,255,255,0.8)",
    marginBottom: 8,
    fontWeight: '500',
  },
  progressBarBackground: {
    height: 10,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 8,
    overflow: "hidden",
    marginBottom: 12,
  },
  progressBarFill: {
    height: "100%",
    borderRadius: 8,
  },
  progressTextContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  progressText: {
    fontSize: 16,
    color: "white",
    fontWeight: "600",
  },
  progressRatio: {
    fontSize: 16,
    color: "white",
    fontWeight: "700",
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 16,
    padding: 16,
  },
  statItem: {
    alignItems: "center",
    flex: 1,
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  statLabel: {
    fontSize: 12,
    color: "rgba(255,255,255,0.8)",
    marginBottom: 6,
    fontWeight: '500',
  },
  statValue: {
    fontSize: 18,
    fontWeight: "700",
    color: "white",
  },
  routeContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  routeInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: 12,
  },
  routeName: {
    fontSize: 16,
    color: "white",
    marginLeft: 10,
    flexShrink: 1,
    fontWeight: '600',
  },
  routeButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
    paddingLeft: 14,
    paddingRight: 6,
  },
  routeButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: "white",
    marginRight: 6,
  },
});