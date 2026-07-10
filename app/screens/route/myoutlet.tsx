import TabBar from "@/components/ui/layout/TabBar";
import { API_ROUTES } from "@/constants/ApiRoutes";
import { Theme, useAppTheme } from "@/constants/Theme";
import { api } from "@/lib/axios/axios";
import { errorHandler } from "@/lib/axios/errorHandler";
import { getDistanceFast, getLocation } from "@/lib/location/location";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Easing,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  RefreshControl,
  TextInput,
  ImageBackground,
  Dimensions,
  Platform,
} from "react-native";
import { Feather, MaterialIcons, Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { Response } from "@/lib/types/types";
import { User } from "@/lib/user/util";
import { LinearGradient } from "expo-linear-gradient";
import MapView, { Marker, Callout } from "react-native-maps";

interface PossibleCustomer {
  tenantId: string;
  name: string;
  hierarchyItemId: string;
  id: string;
  phone: string;
  bvnNumber: string | null;
  address: string;
  marketName: string;
  latitude: number;
  longitude: number;
  customerTypeId: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string | null;
}

interface RouteResponse {
  success: boolean;
  message: string;
  data: PossibleCustomer[];
}

interface VisitedCustomersResponse extends Response {
  data: {
    tenantId: string;
    salesmanId: string;
    customerId: string;
    id: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    createdBy: string | null;
    updatedBy: string | null;
    UserLatitude: number;
    UserLongitude: number;
    scanDistance: number;
  }[];
}

interface OrderedCustomersResponse extends Response {
  data: {
    salesmanId: string;
    customerId: string;
    id: string;
    approved: boolean;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    createdBy: string | null;
    updatedBy: string | null;
    totalPrice: number;
  }[];
}

export default function MyOutletScreen() {
  const [userLocation, setUserLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [optimizingRoute, setOptimizingRoute] = useState(false);
  const [locationTracking, setLocationTracking] = useState(false);
  const [customerFilter, setCustomerFilter] = useState<"all" | "visited" | "ordered" | "notvisited">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showAll, setShowAll] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [viewMode, setViewMode] = useState<"list" | "map">("list");
  const [selectedMapCustomer, setSelectedMapCustomer] = useState<PossibleCustomer | null>(null);
  const router = useRouter();
  const spinValue = new Animated.Value(0);

  // Animation for optimizing route
  useEffect(() => {
    if (optimizingRoute) {
      Animated.loop(
        Animated.timing(spinValue, {
          toValue: 1,
          duration: 1000,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      ).start();
    } else {
      spinValue.setValue(0);
    }
  }, [optimizingRoute]);

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  // Get user location only if tracking is enabled
  useEffect(() => {
    if (!locationTracking) {
      setUserLocation(null);
      setOptimizingRoute(false);
      return;
    }
    (async () => {
      setOptimizingRoute(true);
      try {
        const loc = await getLocation();
        if (loc) setUserLocation(loc);
      } catch (error) {
        console.error("Failed to get location:", error);
      }
    })();
  }, [locationTracking]);

  // Fetch Route data
  const routeQuery = useQuery({
    queryKey: ["route-outlets"],
    queryFn: async () => {
      const user = await User.getUserDetails();
      const res = await api.get<RouteResponse>(API_ROUTES.ROUTE.GET_POSSIBLE_OUTLETS(user?.id || ""));
      return res.data;
    },
  });

  // Fetch visited customers
  const visitedCustomerQuery = useQuery({
    queryKey: ["visitedCustomers"],
    queryFn: async () => {
      const res = await api.get<VisitedCustomersResponse>(
        API_ROUTES.CUSTOMER.GET_VISITED_CUSTOMERS
      );
      return res.data;
    },
  });

  // Fetch ordered customers
  const orderedCustomerQuery = useQuery({
    queryKey: ["orderedCustomers"],
    queryFn: async () => {
      const res = await api.get<OrderedCustomersResponse>(
        API_ROUTES.CUSTOMER.GET_ORDERED_CUSTOMERS
      );
      return res.data;
    },
  });

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        routeQuery.refetch(),
        visitedCustomerQuery.refetch(),
        orderedCustomerQuery.refetch(),
      ]);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (routeQuery.isError) errorHandler(routeQuery.error);
  }, [routeQuery.isError, routeQuery.error]);

  useEffect(() => {
    if (visitedCustomerQuery.isError) errorHandler(visitedCustomerQuery.error);
  }, [visitedCustomerQuery.isError, visitedCustomerQuery.error]);

  useEffect(() => {
    if (orderedCustomerQuery.isError) errorHandler(orderedCustomerQuery.error);
  }, [orderedCustomerQuery.isError, orderedCustomerQuery.error]);

  const customersWithDistance = useMemo(() => {
    if (!routeQuery.data) return [];
    if (!locationTracking || !userLocation) {
      setOptimizingRoute(false);
      return routeQuery.data.data.map((customer) => ({
        ...customer,
        distance: null as number | null,
      }));
    }
    const optimizedCustomers = routeQuery.data.data
      .map((customer) => ({
        ...customer,
        distance: getDistanceFast(
          userLocation.latitude,
          userLocation.longitude,
          customer.latitude,
          customer.longitude
        ) as number | null,
      }))
      .sort((a, b) => (a.distance || 0) - (b.distance || 0));
    setOptimizingRoute(false);
    return optimizedCustomers;
  }, [routeQuery.data, userLocation, locationTracking]);

  const visitedCustomerIds = useMemo(() => {
    if (!visitedCustomerQuery.data) return new Set();
    return new Set(visitedCustomerQuery.data.data.map((v) => v.customerId));
  }, [visitedCustomerQuery.data]);

  const orderedCustomerIds = useMemo(() => {
    if (!orderedCustomerQuery.data) return new Set();
    return new Set(orderedCustomerQuery.data.data.map((o) => o.customerId));
  }, [orderedCustomerQuery.data]);

  const filteredCustomers = useMemo(() => {
    let filtered = customersWithDistance;

    // 1. Search Filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (c) =>
          c.name.toLowerCase().includes(query) ||
          c.marketName.toLowerCase().includes(query)
      );
    }

    // 2. Status Filter
    if (customerFilter === "all") return filtered;
    if (customerFilter === "visited")
      return filtered.filter((c) => visitedCustomerIds.has(c.id));
    if (customerFilter === "ordered")
      return filtered.filter((c) => orderedCustomerIds.has(c.id));
    if (customerFilter === "notvisited")
      return filtered.filter((c) => !visitedCustomerIds.has(c.id));

    return filtered;
  }, [customerFilter, customersWithDistance, visitedCustomerIds, orderedCustomerIds, searchQuery]);

  // Loading state
  if (routeQuery.isLoading) {
    return (
      <View style={styles.container}>
        <TabBar title="Outlets" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Theme.colors.primary} />
          <Text style={styles.loadingText}>Loading outlets plan...</Text>
        </View>
      </View>
    );
  }

  // Error state
  if (routeQuery.isError) {
    return (
      <View style={styles.container}>
        <TabBar title="Outlets" />
        <View style={styles.errorContainer}>
          <MaterialIcons name="error-outline" size={48} color={Theme.colors.danger} />
          <Text style={styles.errorText}>Failed to load outlets data</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => routeQuery.refetch()}
            activeOpacity={0.8}
          >
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TabBar title="OUTLETS" />

      {/* Dashboard Summary Card */}
      <View style={styles.dashboardCard}>
        <ImageBackground
          source={require("@/assets/images/home_bg.png")}
          style={styles.dashboardBackground}
          imageStyle={{ borderRadius: 16 }}
        >
          <View style={styles.statsGrid}>
            <View style={styles.statBox}>
              <Text style={styles.statValueLight}>{customersWithDistance.length}</Text>
              <Text style={styles.statLabelLight}>Total</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statBox}>
              <Text style={styles.statValueLight}>{visitedCustomerIds.size}</Text>
              <Text style={styles.statLabelLight}>Visited</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statBox}>
              <Text style={styles.statValueLight}>{orderedCustomerIds.size}</Text>
              <Text style={styles.statLabelLight}>Orders</Text>
            </View>
          </View>
        </ImageBackground>
      </View>

      {/* Search & Filter Section */}
      <View style={styles.controlsSection}>
        <View style={styles.searchRow}>
          <View style={styles.searchBar}>
            <Feather name="search" size={16} color={Theme.colors.text.muted} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search outlets..."
              placeholderTextColor={Theme.colors.text.muted}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery("")}>
                <Feather name="x-circle" size={16} color={Theme.colors.text.muted} />
              </TouchableOpacity>
            )}
          </View>

          {/* GPS Location Optimization */}
          <TouchableOpacity
            onPress={() => setLocationTracking((v) => !v)}
            style={[
              styles.gpsButton,
              locationTracking && styles.gpsButtonActive
            ]}
            activeOpacity={0.8}
          >
            <Ionicons
              name={locationTracking ? "navigate" : "navigate-outline"}
              size={18}
              color={locationTracking ? "#fff" : Theme.colors.text.secondary}
            />
          </TouchableOpacity>

          {/* List/Map Toggle Switcher */}
          <TouchableOpacity
            onPress={() => {
              setViewMode(v => v === "list" ? "map" : "list");
              setSelectedMapCustomer(null);
            }}
            style={[
              styles.gpsButton,
              viewMode === "map" && styles.gpsButtonActive
            ]}
            activeOpacity={0.8}
          >
            <Ionicons
              name={viewMode === "map" ? "list-outline" : "map-outline"}
              size={18}
              color={viewMode === "map" ? "#fff" : Theme.colors.text.secondary}
            />
          </TouchableOpacity>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterTabs}
        >
          {[
            { id: 'all', label: 'All Outlets' },
            { id: 'notvisited', label: 'Pending' },
            { id: 'visited', label: 'Visited' },
            { id: 'ordered', label: 'Ordered' },
          ].map((filter) => (
            <TouchableOpacity
              key={filter.id}
              style={[
                styles.filterTab,
                customerFilter === filter.id && styles.filterTabActive
              ]}
              onPress={() => setCustomerFilter(filter.id as any)}
              activeOpacity={0.8}
            >
              <Text style={[
                styles.filterTabText,
                customerFilter === filter.id && styles.filterTabTextActive
              ]}>
                {filter.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Optimizing Route Indicator */}
      {optimizingRoute && locationTracking && (
        <View style={styles.optimizingContainer}>
          <Animated.View style={{ transform: [{ rotate: spin }] }}>
            <Feather name="loader" size={16} color={Theme.colors.primary} />
          </Animated.View>
          <Text style={styles.optimizingText}>Recalculating proximity path...</Text>
        </View>
      )}

      {/* View Mode Split */}
      {viewMode === "map" ? (
        <View style={styles.mapContainer}>
          <MapView
            style={styles.map}
            initialRegion={{
              latitude: userLocation?.latitude ?? filteredCustomers[0]?.latitude ?? 6.5244,
              longitude: userLocation?.longitude ?? filteredCustomers[0]?.longitude ?? 3.3792,
              latitudeDelta: 0.04,
              longitudeDelta: 0.04,
            }}
            showsUserLocation={true}
          >
            {filteredCustomers.map((customer) => {
              const isVisited = visitedCustomerIds.has(customer.id);
              const isOrdered = orderedCustomerIds.has(customer.id);
              
              const pinColor = isOrdered 
                ? "#F59E0B" 
                : isVisited 
                  ? "#10B981" 
                  : "#EF4444";

              return (
                <Marker
                  key={customer.id}
                  coordinate={{
                    latitude: customer.latitude,
                    longitude: customer.longitude,
                  }}
                  pinColor={pinColor}
                  onPress={() => setSelectedMapCustomer(customer)}
                >
                  <Callout tooltip>
                    <View style={styles.calloutContainer}>
                      <Text style={styles.calloutTitle}>{customer.name}</Text>
                      <Text style={styles.calloutSub}>{customer.marketName}</Text>
                      <Text style={styles.calloutAction}>Tap info sheet to visit</Text>
                    </View>
                  </Callout>
                </Marker>
              );
            })}
          </MapView>

          {/* Floating Selected Card Overlay */}
          {selectedMapCustomer && (
            <View style={styles.mapCardOverlay}>
              <View style={styles.mapCardHeader}>
                <View style={styles.mapCardText}>
                  <Text style={styles.mapCardTitle}>{selectedMapCustomer.name}</Text>
                  <Text style={styles.mapCardSub} numberOfLines={1}>
                    <Feather name="map-pin" size={12} color={Theme.colors.text.secondary} /> {selectedMapCustomer.marketName}
                  </Text>
                  <Text style={styles.mapCardAddress} numberOfLines={1}>{selectedMapCustomer.address}</Text>
                </View>
                <TouchableOpacity 
                  onPress={() => setSelectedMapCustomer(null)}
                  style={styles.mapCardClose}
                >
                  <Feather name="x" size={18} color={Theme.colors.text.secondary} />
                </TouchableOpacity>
              </View>
              
              <View style={styles.mapCardFooter}>
                <View style={styles.mapCardBadges}>
                  {orderedCustomerIds.has(selectedMapCustomer.id) && (
                    <View style={[styles.badgeCompact, styles.badgeGold]}>
                      <Text style={styles.badgeTextGold}>Ordered</Text>
                    </View>
                  )}
                  {visitedCustomerIds.has(selectedMapCustomer.id) && !orderedCustomerIds.has(selectedMapCustomer.id) && (
                    <View style={[styles.badgeCompact, styles.badgeGreen]}>
                      <Text style={styles.badgeTextGreen}>Visited</Text>
                    </View>
                  )}
                  {!visitedCustomerIds.has(selectedMapCustomer.id) && (
                    <View style={[styles.badgeCompact, styles.badgeGray]}>
                      <Text style={styles.badgeTextGray}>Pending</Text>
                    </View>
                  )}
                </View>

                <TouchableOpacity
                  style={styles.mapCardButton}
                  onPress={() => router.push(`/screens/route/visitCustomer?id=${encodeURIComponent(selectedMapCustomer.id)}`)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.mapCardButtonText}>Visit Store</Text>
                  <Feather name="arrow-right" size={14} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      ) : (
        <ScrollView
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={Theme.colors.primary}
            />
          }
          contentContainerStyle={styles.scrollContent}
          style={{ flex: 1 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Outlet cards list */}
          <View style={styles.listContainer}>
            {filteredCustomers.length === 0 ? (
              <View style={styles.emptyState}>
                <View style={styles.emptyIconBg}>
                  <Feather name="info" size={24} color={Theme.colors.text.muted} />
                </View>
                <Text style={styles.emptyStateTitle}>No Outlets Found</Text>
                <Text style={styles.emptyStateText}>
                  Try adjusting your search criteria or status filter
                </Text>
              </View>
            ) : (
              <>
                {(showAll ? filteredCustomers : filteredCustomers.slice(0, 10)).map((customer, index) => (
                  <CustomerCard
                    key={customer.id}
                    customer={customer}
                    visited={visitedCustomerIds.has(customer.id)}
                    ordered={orderedCustomerIds.has(customer.id)}
                    distance={customer.distance}
                    index={index}
                    onPress={() => router.push(`/screens/route/visitCustomer?id=${encodeURIComponent(customer.id)}`)}
                  />
                ))}

                {filteredCustomers.length > 10 && (
                  <TouchableOpacity
                    style={styles.loadMoreButton}
                    onPress={() => setShowAll(!showAll)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.loadMoreText}>
                      {showAll ? 'Show Less' : `Show All (${filteredCustomers.length})`}
                    </Text>
                    <Feather
                      name={showAll ? 'chevron-up' : 'chevron-down'}
                      size={18}
                      color={Theme.colors.primary}
                    />
                  </TouchableOpacity>
                )}
              </>
            )}
          </View>
        </ScrollView>
      )}
    </View>
  );
}

const CustomerCard = ({
  customer,
  visited,
  ordered,
  distance,
  index,
  onPress,
}: {
  customer: PossibleCustomer;
  visited: boolean;
  ordered: boolean;
  distance: number | null;
  index: number;
  onPress: () => void;
}) => {
  const isCompleted = visited || ordered;
  const { colors, mode } = useAppTheme();
  const isDark = mode === 'dark';

  return (
    <TouchableOpacity
      style={[
        styles.outletCard,
        { 
          backgroundColor: isCompleted 
            ? (isDark ? colors.background : '#F8FAFC') 
            : colors.surface,
          borderColor: colors.border
        }
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {/* Visual status side border indicator */}
      <View style={[
        styles.statusStrip, 
        {
          backgroundColor: ordered 
            ? colors.warning 
            : visited 
              ? colors.success 
              : (isDark ? '#475569' : '#CBD5E1')
        }
      ]} />

      <View style={styles.outletCardContent}>
        <View style={styles.outletHeader}>
          <View style={styles.outletInfo}>
            <Text style={[
              styles.outletTitle,
              { color: isCompleted ? colors.text.secondary : colors.text.primary }
            ]} numberOfLines={1}>{customer.name}</Text>
            
            <View style={styles.outletMeta}>
              <Feather name="map-pin" size={11} color={colors.text.muted} />
              <Text style={[styles.outletMetaText, { color: colors.text.secondary }]} numberOfLines={1}>{customer.marketName}</Text>
            </View>
          </View>

          <View style={styles.outletRight}>
            {distance !== null && (
              <Text style={[
                styles.distanceTextCompact, 
                { 
                  color: colors.primary, 
                  backgroundColor: isDark ? 'rgba(37, 99, 235, 0.2)' : 'rgba(37, 99, 235, 0.1)' 
                }
              ]}>{distance.toFixed(1)} km</Text>
            )}
            <Feather name="chevron-right" size={16} color={colors.text.muted} />
          </View>
        </View>

        <View style={styles.outletFooter}>
          <View style={styles.outletBadges}>
            {ordered && (
              <View style={[styles.badgeCompact, styles.badgeGold]}>
                <Text style={styles.badgeTextGold}>Ordered</Text>
              </View>
            )}
            {visited && !ordered && (
              <View style={[styles.badgeCompact, styles.badgeGreen]}>
                <Text style={styles.badgeTextGreen}>Visited</Text>
              </View>
            )}
            {!visited && (
              <View style={[
                styles.badgeCompact, 
                styles.badgeGray, 
                { 
                  backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : colors.surfaceAlt, 
                  borderColor: colors.border 
                }
              ]}>
                <Text style={[styles.badgeTextGray, { color: colors.text.secondary }]}>Pending</Text>
              </View>
            )}
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollContent: {
    paddingBottom: 110, // Margin to keep clear of floating bottom tabs
  },
  dashboardCard: {
    margin: 16,
    borderRadius: Theme.radius.xl,
    overflow: 'hidden',
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: Theme.colors.border,
    ...Theme.shadows.md,
  },
  dashboardBackground: {
    padding: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255,255,255,0.6)',
    borderRadius: Theme.radius.md,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.8)',
  },
  statBox: {
    alignItems: 'center',
    flex: 1,
  },
  statDivider: {
    width: 1,
    height: 24,
    backgroundColor: 'rgba(15, 23, 42, 0.08)',
  },
  statValueLight: {
    color: Theme.colors.text.primary,
    fontFamily: Theme.typography.fontFamily.bold,
    fontSize: Theme.typography.sizes.h3,
  },
  statLabelLight: {
    color: Theme.colors.text.secondary,
    fontFamily: Theme.typography.fontFamily.medium,
    fontSize: Theme.typography.sizes.caption,
    marginTop: 2,
  },
  controlsSection: {
    paddingHorizontal: 16,
    marginBottom: 12,
    gap: 12,
  },
  searchRow: {
    flexDirection: 'row',
    gap: 10,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: Theme.radius.md,
    paddingHorizontal: 12,
    height: 48,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    ...Theme.shadows.sm,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontFamily: Theme.typography.fontFamily.regular,
    fontSize: Theme.typography.sizes.bodySm,
    color: Theme.colors.text.primary,
    height: '100%',
  },
  gpsButton: {
    width: 48,
    height: 48,
    borderRadius: Theme.radius.md,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Theme.colors.border,
    ...Theme.shadows.sm,
  },
  gpsButtonActive: {
    backgroundColor: Theme.colors.primary,
    borderColor: Theme.colors.primary,
    ...Theme.shadows.md,
  },
  filterTabs: {
    gap: 8,
    paddingBottom: 4,
  },
  filterTab: {
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: Theme.radius.full,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    ...Theme.shadows.sm,
  },
  filterTabActive: {
    backgroundColor: Theme.colors.text.primary,
    borderColor: Theme.colors.text.primary,
  },
  filterTabText: {
    fontSize: Theme.typography.sizes.bodySm,
    fontFamily: Theme.typography.fontFamily.medium,
    color: Theme.colors.text.secondary,
  },
  filterTabTextActive: {
    color: 'white',
    fontFamily: Theme.typography.fontFamily.semiBold,
  },
  optimizingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    backgroundColor: Theme.colors.primaryLight,
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: Theme.radius.md,
    gap: 8,
  },
  optimizingText: {
    color: Theme.colors.primary,
    fontFamily: Theme.typography.fontFamily.semiBold,
    fontSize: Theme.typography.sizes.bodySm,
  },
  listContainer: {
    paddingHorizontal: 16,
    gap: 8,
  },
  outletCard: {
    backgroundColor: 'white',
    borderRadius: Theme.radius.md,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    overflow: 'hidden',
    flexDirection: 'row',
    ...Theme.shadows.sm,
  },
  outletCardCompleted: {
    backgroundColor: '#F8FAFC',
  },
  statusStrip: {
    width: 5,
    height: '100%',
  },
  statusStripGold: { backgroundColor: Theme.colors.warning },
  statusStripGreen: { backgroundColor: Theme.colors.success },
  statusStripPending: { backgroundColor: Theme.colors.text.muted },
  outletCardContent: {
    flex: 1,
    padding: 14,
    gap: 8,
  },
  outletHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  outletInfo: {
    flex: 1,
    marginRight: 12,
    gap: 2,
  },
  outletTitle: {
    fontFamily: Theme.typography.fontFamily.bold,
    fontSize: Theme.typography.sizes.body,
    color: Theme.colors.text.primary,
  },
  outletTitleCompleted: {
    color: Theme.colors.text.secondary,
  },
  outletMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  outletMetaText: {
    fontFamily: Theme.typography.fontFamily.regular,
    fontSize: Theme.typography.sizes.bodySm,
    color: Theme.colors.text.secondary,
    flex: 1,
  },
  outletRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  distanceTextCompact: {
    fontFamily: Theme.typography.fontFamily.bold,
    fontSize: Theme.typography.sizes.caption,
    color: Theme.colors.primary,
    backgroundColor: Theme.colors.primaryLight,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: Theme.radius.xs,
  },
  outletFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  outletBadges: {
    flexDirection: 'row',
    gap: 6,
  },
  badgeCompact: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: Theme.radius.xs,
    borderWidth: 1,
  },
  badgeGold: {
    backgroundColor: Theme.colors.warningLight,
    borderColor: '#FDE047',
  },
  badgeGreen: {
    backgroundColor: Theme.colors.successLight,
    borderColor: '#86EFAC',
  },
  badgeGray: {
    backgroundColor: Theme.colors.surfaceAlt,
    borderColor: Theme.colors.border,
  },
  badgeTextGold: {
    fontFamily: Theme.typography.fontFamily.semiBold,
    fontSize: 10,
    color: '#854D0E',
  },
  badgeTextGreen: {
    fontFamily: Theme.typography.fontFamily.semiBold,
    fontSize: 10,
    color: '#166534',
  },
  badgeTextGray: {
    fontFamily: Theme.typography.fontFamily.semiBold,
    fontSize: 10,
    color: Theme.colors.text.secondary,
  },
  mapContainer: {
    flex: 1,
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  map: {
    width: '100%',
    height: '100%',
  },
  calloutContainer: {
    backgroundColor: 'white',
    borderRadius: Theme.radius.md,
    padding: 12,
    width: 180,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    ...Theme.shadows.md,
  },
  calloutTitle: {
    fontFamily: Theme.typography.fontFamily.bold,
    fontSize: Theme.typography.sizes.bodySm,
    color: Theme.colors.text.primary,
    marginBottom: 4,
  },
  calloutSub: {
    fontFamily: Theme.typography.fontFamily.regular,
    fontSize: Theme.typography.sizes.caption,
    color: Theme.colors.text.secondary,
    marginBottom: 6,
  },
  calloutAction: {
    fontFamily: Theme.typography.fontFamily.semiBold,
    fontSize: 10,
    color: Theme.colors.primary,
  },
  mapCardOverlay: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 120 : 100, // Safe padding above floating tabs
    left: 16,
    right: 16,
    backgroundColor: 'white',
    borderRadius: Theme.radius.xl,
    padding: 16,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    ...Theme.shadows.lg,
    gap: 12,
  },
  mapCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  mapCardText: {
    flex: 1,
    gap: 2,
  },
  mapCardTitle: {
    fontFamily: Theme.typography.fontFamily.bold,
    fontSize: Theme.typography.sizes.h3,
    color: Theme.colors.text.primary,
  },
  mapCardSub: {
    fontFamily: Theme.typography.fontFamily.medium,
    fontSize: Theme.typography.sizes.bodySm,
    color: Theme.colors.text.secondary,
  },
  mapCardAddress: {
    fontFamily: Theme.typography.fontFamily.regular,
    fontSize: Theme.typography.sizes.caption,
    color: Theme.colors.text.muted,
  },
  mapCardClose: {
    padding: 4,
    borderRadius: Theme.radius.full,
    backgroundColor: Theme.colors.surfaceAlt,
  },
  mapCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: Theme.colors.border,
    paddingTop: 12,
  },
  mapCardBadges: {
    flexDirection: 'row',
  },
  mapCardButton: {
    backgroundColor: Theme.colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: Theme.radius.md,
    ...Theme.shadows.sm,
  },
  mapCardButtonText: {
    fontFamily: Theme.typography.fontFamily.bold,
    fontSize: Theme.typography.sizes.bodySm,
    color: 'white',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: Theme.typography.sizes.body,
    color: Theme.colors.text.secondary,
    fontFamily: Theme.typography.fontFamily.medium,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    padding: 20,
  },
  errorText: {
    fontSize: Theme.typography.sizes.body,
    color: Theme.colors.text.primary,
    textAlign: 'center',
    fontFamily: Theme.typography.fontFamily.medium,
  },
  retryButton: {
    marginTop: 10,
    backgroundColor: Theme.colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: Theme.radius.md,
    ...Theme.shadows.sm,
  },
  retryButtonText: {
    color: 'white',
    fontFamily: Theme.typography.fontFamily.semiBold,
    fontSize: Theme.typography.sizes.bodySm,
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
    gap: 8,
  },
  emptyIconBg: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Theme.colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyStateTitle: {
    fontSize: Theme.typography.sizes.body,
    fontFamily: Theme.typography.fontFamily.semiBold,
    color: Theme.colors.text.primary,
  },
  emptyStateText: {
    fontSize: Theme.typography.sizes.bodySm,
    color: Theme.colors.text.secondary,
    textAlign: 'center',
  },
  loadMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    gap: 8,
  },
  loadMoreText: {
    color: Theme.colors.primary,
    fontFamily: Theme.typography.fontFamily.semiBold,
    fontSize: Theme.typography.sizes.bodySm,
  },
});